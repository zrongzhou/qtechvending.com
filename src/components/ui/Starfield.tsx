'use client';

import { useEffect, useRef } from 'react';

export interface StarfieldProps {
  /** Extra classes for the wrapping container. */
  className?: string;
  /** Target star count (density-aware: reduced on small/low-DPR screens). */
  starCount?: number;
  /** Twinkle / drift speed multiplier. */
  speed?: number;
  /** Enable 3-layer parallax depth (far/mid/near). */
  depth?: boolean;
  /** Enable sine twinkle on star opacity. */
  twinkle?: boolean;
  /** External reduced-motion override; when omitted, read from matchMedia. */
  reduced?: boolean;
}

interface Star {
  x: number; // 0..1
  y: number; // 0..1
  baseR: number; // base radius
  layer: number; // 0 far, 1 mid, 2 near
  baseAlpha: number;
  phase: number; // drift/twinkle phase
  glowPhase: number; // independent pulsing phase
  drift: number; // drift amplitude
  twSpeed: number; // twinkle cadence
  color: string; // white / faint warm-white
  rayLen: number; // cross-ray length multiplier
  rayAlpha: number; // cross-ray opacity
}

interface Meteor {
  x: number; // start X (0..1, beyond right edge)
  y: number; // start Y (0..0.4, upper sky only)
  length: number; // trail length in px (120–300)
  speed: number; // px per frame (2.5–6.5)
  angle: number; // radians (2.0–2.8 = falling left-to-right, downward)
  color: string; // stroke colour prefix e.g. 'rgba(56,189,248,'
  alpha: number; // trail opacity (0.4–0.7)
  life: number; // remaining life in frames
  maxLife: number; // total lifespan (180–400 frames)
  active: boolean;
}

function prefersReducedMotion(): boolean {
  if (typeof window === 'undefined') return false;
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

/**
 * Cinematic starfield canvas (V40).
 *  - Deep-space black base (#0a0e1a) with a subtle indigo → violet nebula and a
 *    faint cyan depth-glow so the sky has real cosmic depth instead of a flat
 *    blue-grey wash.
 *  - Cross-shaped rays on mid and near-layer stars, thickened (2–3px) and
 *    elongated with a soft glow bloom so bright stars read as dramatic flares.
 *  - Three parallax layers (far tiny/dim/slow → near bright/strong rays/halo)
 *    for clear spatial hierarchy.
 *  - Meteors are "dramatic streaks": a glowing head halo, burning trail
 *    particles, a thickened cross-ray burst on the brightest ones, and a
 *    low-amplitude global brightening when they fly (V40: pulse dialed down).
 *  - Star density reduced ~40% vs V39 for a calmer, less cluttered sky that
 *    still preserves the near-small/far-large parallax feel.
 */
export default function Starfield({
  className = '',
  starCount = 320,
  speed = 0.3,
  depth = true,
  twinkle = true,
  reduced,
}: StarfieldProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const wrapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const wrap = wrapRef.current;
    if (!canvas || !wrap) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Brand ambient animations must always run (user explicitly wants animation).
    // Only respect reduced-motion when the caller passes an EXPLICIT true prop.
    const isReduced = reduced === true;

    let width = wrap.clientWidth;
    let height = wrap.clientHeight;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);

    // Layer definitions (V40) — exaggerated depth for clear spatial hierarchy.
    const layerAlpha = [0.12, 0.45, 0.95];
    const layerRadius = [0.4, 1.25, 3.0];
    const layerDrift = [0.012, 0.08, 0.28];
    const layerTw = [0.6, 1.0, 1.6];
    const layerPulseAmp = [0.0, 0.2, 0.4]; // radius pulse amplitude
    const layerAlphaPulseAmp = [0.0, 0.25, 0.45]; // alpha pulse amplitude
    // V41: thinner, shorter, dimmer cross rays — only the brightest near-layer
    // stars read as delicate flares; the rest stay as quiet pinpoint dots.
    const layerRayLen = [0, 5, 10]; // ray length = baseR * multiplier
    const layerRayAlpha = [0, 0.25, 0.35]; // cross-ray opacity (calmed down)
    const layerGlowSpeed = [0.003, 0.01, 0.018];

    const stars: Star[] = [];
    // V41: raise the area-density divisor (2200 → 3500) so large screens get
    // ~37% fewer stars for a calmer "quiet night sky" read, then the caller's
    // starCount further caps the total (Hero passes ~30% fewer than V40).
    const count = Math.max(
      50,
      Math.min(starCount, Math.floor((width * height) / 3500)),
    );

    // Allocate counts per layer: far 40%, mid 35%, near 25%.
    const farCount = Math.floor(count * 0.4);
    const midCount = Math.floor(count * 0.35);
    const nearCount = Math.max(0, count - farCount - midCount);

    function createStar(layer: number): Star {
      const baseR = layerRadius[layer] * (0.8 + Math.random() * 0.4);
      return {
        x: Math.random(),
        y: Math.random(),
        baseR,
        layer,
        baseAlpha: layerAlpha[layer] * (0.85 + Math.random() * 0.3),
        phase: Math.random() * Math.PI * 2,
        glowPhase: Math.random() * Math.PI * 2,
        drift: (Math.random() - 0.5) * layerDrift[layer],
        twSpeed: layerTw[layer] * (0.8 + Math.random() * 0.4),
        color: Math.random() > 0.85 ? '210, 230, 255' : '255, 255, 255', // occasional faint blue-white
        rayLen: layerRayLen[layer],
        rayAlpha: layerRayAlpha[layer] * (0.7 + Math.random() * 0.6),
      };
    }

    for (let i = 0; i < farCount; i += 1) stars.push(createStar(0));
    for (let i = 0; i < midCount; i += 1) stars.push(createStar(1));
    for (let i = 0; i < nearCount; i += 1) stars.push(createStar(2));

    // Pre-computed indices of near-layer stars (for flare events).
    const nearIndices = stars.map((s, i) => (s.layer === 2 ? i : -1)).filter((i) => i !== -1);

    // Cached nebula gradients (recomputed on resize) — deep-space atmosphere:
    // a deep-violet core (top-right) for colour + a faint cyan depth-glow
    // (bottom-left) so the sky reads as real cosmic volume, not flat black.
    let nebulaCore: CanvasGradient | null = null;
    let nebulaDepth: CanvasGradient | null = null;
    function buildNebula() {
      if (!ctx) return;
      // Violet/indigo core offset to the top-right — subtle, atmospheric.
      const cx = width * 0.82;
      const cy = height * 0.18;
      const g = ctx.createRadialGradient(cx, cy, 0, cx, cy, Math.max(width, height) * 1.05);
      g.addColorStop(0, 'rgba(124, 58, 237, 0.10)'); // deep violet core
      g.addColorStop(0.4, 'rgba(67, 56, 202, 0.06)'); // indigo mid
      g.addColorStop(1, 'rgba(67, 56, 202, 0)');
      nebulaCore = g;

      // Cyan depth-glow bottom-left — faint, gives the void a sense of depth.
      const dx = width * 0.18;
      const dy = height * 0.86;
      const g2 = ctx.createRadialGradient(dx, dy, 0, dx, dy, Math.max(width, height) * 0.9);
      g2.addColorStop(0, 'rgba(34, 211, 238, 0.05)'); // cyan depth
      g2.addColorStop(1, 'rgba(34, 211, 238, 0)');
      nebulaDepth = g2;
    }

    // Faint diagonal Milky-Way band — kept very subtle for depth.
    function drawMilkyWay() {
      if (!ctx) return;
      ctx.save();
      ctx.translate(width / 2, height / 2);
      ctx.rotate(-Math.PI / 6);
      const bandW = Math.max(width, height) * 0.6;
      const g = ctx.createLinearGradient(-bandW / 2, 0, bandW / 2, 0);
      g.addColorStop(0, 'rgba(255, 255, 255, 0)');
      g.addColorStop(0.5, 'rgba(180, 200, 255, 0.04)');
      g.addColorStop(1, 'rgba(255, 255, 255, 0)');
      ctx.fillStyle = g;
      ctx.fillRect(-bandW / 2, -height * 0.18, bandW, height * 0.36);
      ctx.restore();
    }

    // ---- Meteor shower system (V40 enhanced) ---------------------------------
    const METEOR_COLORS = [
      'rgba(56,189,248,', // cyan
      'rgba(250,204,21,', // gold
      'rgba(251,146,60,', // warm orange
      'rgba(244,114,182,', // pink
      'rgba(255,255,255,', // white
    ];
    const meteors: Meteor[] = [];
    // V47: dramatically cut the first-appearance delay so the very first meteor
    // streaks across within ~0.2–0.8s (≈ 1s at 30fps) instead of 1–3s.
    let nextSpawn = 6 + Math.random() * 18; // first spawn 6–24 frames
    let nextBurst = 300 + Math.random() * 180; // 300–480 frames
    let burstRemaining = 0;
    let burstX = 0;
    let burstY = 0;

    function spawnMeteor(cx?: number, cy?: number) {
      const activeCount = meteors.reduce((n, m) => n + (m.active ? 1 : 0), 0);
      // V40: keep at most 5 meteors on screen at once (calmer shower).
      if (activeCount >= 5) return;
      // V47: shorter lifespan + much faster streak so meteors "enter" crisply
      // and zip across the sky instead of crawling. maxLife 70–120 frames,
      // speed 5.0–10.5 px/frame.
      const maxLife = 70 + Math.random() * 50; // 70–120 frames (~2.3–4s)
      const x = cx !== undefined ? cx + (Math.random() - 0.5) * 0.15 : 0.7 + Math.random() * 0.6;
      const y = cy !== undefined ? cy + (Math.random() - 0.5) * 0.1 : Math.random() * 0.3;
      meteors.push({
        x,
        y,
        length: 120 + Math.random() * 180, // 120–300 px trail
        speed: 5.0 + Math.random() * 5.5, // 5.0–10.5 px/frame (snappy streak)
        angle: 2.0 + Math.random() * 0.8, // 2.0–2.8 rad (fall L→R, downward)
        color: METEOR_COLORS[Math.floor(Math.random() * METEOR_COLORS.length)],
        alpha: 0.4 + Math.random() * 0.3, // 0.4–0.7
        life: maxLife,
        maxLife,
        active: true,
      });
    }

    /**
     * Thickened cross-shaped "star burst" drawn at a meteor's head — only on
     * the brightest meteors so it reads as a dramatic flare rather than noise.
     */
    function drawMeteorCrossRay(px: number, py: number, color: string, vis: number) {
      if (!ctx) return;
      const len = 8; // 8 px half-length (V41: shorter, more refined)
      const alpha = Math.min(0.55, vis * (0.35 + Math.random() * 0.2));
      // Soft glow bloom behind the rays (V41: weaker).
      const bloomR = len * 0.9;
      const bg = ctx.createRadialGradient(px, py, 0, px, py, bloomR);
      bg.addColorStop(0, `${color}${alpha * 0.22})`);
      bg.addColorStop(1, `${color}0)`);
      ctx.fillStyle = bg;
      ctx.beginPath();
      ctx.arc(px, py, bloomR, 0, Math.PI * 2);
      ctx.fill();
      // Delicate cross rays (V41: 1.2px instead of 2.5px).
      ctx.save();
      ctx.lineWidth = 1.2;
      ctx.lineCap = 'round';
      ctx.strokeStyle = `${color}${alpha})`;
      ctx.beginPath();
      ctx.moveTo(px - len, py);
      ctx.lineTo(px + len, py);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(px, py - len);
      ctx.lineTo(px, py + len);
      ctx.stroke();
      ctx.restore();
    }

    function drawMeteors() {
      if (!ctx) return;
      for (const m of meteors) {
        if (!m.active) continue;
        const px = m.x * width;
        const py = m.y * height;
        const tailX = px - Math.cos(m.angle) * m.length;
        const tailY = py - Math.sin(m.angle) * m.length;
        // Fade in over the first 9 frames and out over the last 9 frames
        // (V47: crisper entrance so meteors appear and leave promptly).
        const fadeOut = Math.min(1, m.life / 9);
        const fadeIn = Math.min(1, (m.maxLife - m.life) / 9);
        const vis = m.alpha * Math.min(fadeIn, fadeOut);

        // 1) Main trail gradient line.
        const grad = ctx.createLinearGradient(px, py, tailX, tailY);
        grad.addColorStop(0, `${m.color}${vis})`);
        grad.addColorStop(0.18, `${m.color}${vis * 0.55})`);
        grad.addColorStop(1, `${m.color}0)`);
        ctx.strokeStyle = grad;
        ctx.lineWidth = 2.5;
        ctx.lineCap = 'round';
        ctx.beginPath();
        ctx.moveTo(px, py);
        ctx.lineTo(tailX, tailY);
        ctx.stroke();

        // 2) Head glow — radial gradient halo around the meteor head (V40: larger).
        const glowR = 14; // 12–16px
        const hg = ctx.createRadialGradient(px, py, 0, px, py, glowR);
        hg.addColorStop(0, `${m.color}${Math.min(0.2, vis * 0.45)})`);
        hg.addColorStop(1, `${m.color}0)`);
        ctx.fillStyle = hg;
        ctx.beginPath();
        ctx.arc(px, py, glowR, 0, Math.PI * 2);
        ctx.fill();

        // 3) Trail particles — small burning fragments along the streak, fading
        //    from head (bright) to tail (faint), adding a "shattering" feel.
        const pCount = 4; // 3–5 dots
        for (let p = 1; p <= pCount; p += 1) {
          const f = p / (pCount + 1);
          const dx = px - (px - tailX) * f;
          const dy = py - (py - tailY) * f;
          const pr = 0.5 + Math.random() * 1.0; // 0.5–1.5px
          const pa = vis * (1 - f) * 0.8;
          ctx.beginPath();
          ctx.arc(dx, dy, pr, 0, Math.PI * 2);
          ctx.fillStyle = `${m.color}${pa})`;
          ctx.fill();
        }

        // 4) Bright head dot.
        ctx.beginPath();
        ctx.arc(px, py, 3.0, 0, Math.PI * 2);
        ctx.fillStyle = `${m.color}${Math.min(1, vis + 0.25)})`;
        ctx.fill();

        // 5) Cross-ray flare on the brightest meteors only.
        if (vis > 0.5) {
          drawMeteorCrossRay(px, py, m.color, vis);
        }

        // Advance position (normalized).
        m.x += (m.speed * Math.cos(m.angle)) / width;
        m.y += (m.speed * Math.sin(m.angle)) / height;
        m.life -= 1;
        if (m.life <= 0) m.active = false;
      }
    }

    // ---- Star flare events ----------------------------------------------
    let flareIndex = -1;
    let flareTimer = 0;
    let nextFlare = 200 + Math.random() * 300;

    // Global meteor brightness overlay — DISABLED (V48.7): user reported this
    // creates an unwanted "white screen flash" whenever meteors fly. The
    // full-canvas rgba(255,245,220) overlay was too visible on dark bg.
    let meteorBrightness = 0;

    function resize() {
      if (!wrap || !canvas || !ctx) return;
      width = wrap.clientWidth;
      height = wrap.clientHeight;
      canvas.width = Math.max(1, Math.floor(width * dpr));
      canvas.height = Math.max(1, Math.floor(height * dpr));
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      buildNebula();
    }

    function drawCrossRays(
      px: number,
      py: number,
      radius: number,
      rayLen: number,
      alpha: number,
      rayAlpha: number,
      color: string,
    ) {
      if (!ctx || rayLen <= 0 || rayAlpha <= 0) return;
      const len = radius * rayLen;
      // Soft glow bloom behind the rays so bright stars halo.
      const glowR = len * 0.9;
      const gGrad = ctx.createRadialGradient(px, py, 0, px, py, glowR);
      gGrad.addColorStop(0, `rgba(${color}, ${alpha * rayAlpha * 0.25})`);
      gGrad.addColorStop(1, `rgba(${color}, 0)`);
      ctx.fillStyle = gGrad;
      ctx.beginPath();
      ctx.arc(px, py, glowR, 0, Math.PI * 2);
      ctx.fill();

      // Horizontal ray gradient.
      const hGrad = ctx.createLinearGradient(px - len, py, px + len, py);
      hGrad.addColorStop(0, `rgba(${color}, 0)`);
      hGrad.addColorStop(0.5, `rgba(${color}, ${alpha * rayAlpha})`);
      hGrad.addColorStop(1, `rgba(${color}, 0)`);
      // Vertical ray gradient.
      const vGrad = ctx.createLinearGradient(px, py - len, px, py + len);
      vGrad.addColorStop(0, `rgba(${color}, 0)`);
      vGrad.addColorStop(0.5, `rgba(${color}, ${alpha * rayAlpha})`);
      vGrad.addColorStop(1, `rgba(${color}, 0)`);

      // V41: finer lines (≈0.5–0.8px scale) for a delicate, refined star-flare.
      ctx.lineWidth = Math.max(0.8, radius * 0.5);
      ctx.lineCap = 'round';

      ctx.strokeStyle = hGrad;
      ctx.beginPath();
      ctx.moveTo(px - len, py);
      ctx.lineTo(px + len, py);
      ctx.stroke();

      ctx.strokeStyle = vGrad;
      ctx.beginPath();
      ctx.moveTo(px, py - len);
      ctx.lineTo(px, py + len);
      ctx.stroke();
    }

    let frame = 0;
    function draw(t: number) {
      if (!ctx) return;
      // V40: paint a deep-space base (#0a0e1a) instead of clearing to
      // transparent — the night sky is now genuinely profound black.
      ctx.clearRect(0, 0, width, height);
      ctx.fillStyle = '#0a0e1a';
      ctx.fillRect(0, 0, width, height);

      // Deep-space nebula fog (colour + atmosphere).
      if (nebulaCore) {
        ctx.fillStyle = nebulaCore;
        ctx.fillRect(0, 0, width, height);
      }
      if (nebulaDepth) {
        ctx.fillStyle = nebulaDepth;
        ctx.fillRect(0, 0, width, height);
      }
      // Faint Milky-Way band.
      drawMilkyWay();

      frame += 1;

      // Schedule meteor spawns and occasional mini-bursts (only when not reduced).
      if (!isReduced) {
        if (burstRemaining > 0) {
          if (frame >= nextSpawn) {
            spawnMeteor(burstX, burstY);
            burstRemaining -= 1;
            nextSpawn = frame + 5 + Math.floor(Math.random() * 8); // 5–12 frames apart
          }
        } else {
          if (frame >= nextSpawn) {
            spawnMeteor();
            nextSpawn = frame + 40 + Math.random() * 80; // 40–120 frames (~1.3–4s, V47: crisper)
          }
          if (frame >= nextBurst) {
            burstRemaining = 2 + Math.floor(Math.random() * 2); // 2–3 meteors
            burstX = 0.7 + Math.random() * 0.5;
            burstY = 0.05 + Math.random() * 0.2;
            nextBurst = frame + 400 + Math.random() * 200; // 400–600 frames
          }
        }
      }

      // Schedule an occasional star flare.
      if (!isReduced && frame >= nextFlare && flareIndex === -1 && nearIndices.length) {
        flareIndex = nearIndices[Math.floor(Math.random() * nearIndices.length)];
        flareTimer = 40 + Math.random() * 40; // 40–80 frames
        nextFlare = frame + 200 + Math.random() * 300; // 200–500 frames
      }

      // Meteor brightness overlay DISABLED (V48.7) — user reported "white screen flash".
      if (false && !isReduced) {
        const anyMeteorActive = meteors.some((m) => m.active);
        if (anyMeteorActive) {
          meteorBrightness = Math.min(0.06, meteorBrightness + 0.03);
        } else {
          meteorBrightness = Math.max(0, meteorBrightness - meteorBrightness * 0.012);
        }
      }

      for (let i = 0; i < stars.length; i += 1) {
        const s = stars[i];
        const driftX = isReduced ? 0 : s.drift * Math.sin(t * 0.0002 + s.phase) * 0.5;
        const px = (s.x + driftX) * width;
        const py = s.y * height;

        // Base twinkle from global time.
        const tw = twinkle && !isReduced
          ? 0.5 + 0.5 * Math.sin(t * 0.0018 * speed * s.twSpeed + s.phase)
          : 1;

        // Independent per-star pulsing glow.
        if (!isReduced) {
          s.glowPhase += layerGlowSpeed[s.layer] * s.twSpeed;
        }
        const glow = isReduced ? 1 : 0.5 + 0.5 * Math.sin(s.glowPhase);
        const pulseRadius = 1 - layerPulseAmp[s.layer] + layerPulseAmp[s.layer] * 2 * glow;
        const pulseAlpha = 1 - layerAlphaPulseAmp[s.layer] + layerAlphaPulseAmp[s.layer] * 2 * glow;

        // Stars also participate in the meteor-triggered global brightening.
        let alpha = Math.max(0, Math.min(1, s.baseAlpha * tw * pulseAlpha * (1 + meteorBrightness * 0.3)));
        let radius = Math.max(0.2, s.baseR * pulseRadius);

        // Flare override for the chosen near-layer star.
        if (i === flareIndex && flareTimer > 0) {
          const f = flareTimer / 80; // 1 → 0
          radius = s.baseR * (1 + 2 * f); // up to 3× size
          alpha = Math.min(1, alpha + (1 - alpha) * f); // up to full brightness
          flareTimer -= 1;
          if (flareTimer <= 0) flareIndex = -1;
        }

        // Cross-shaped rays ONLY on the brightest near-layer stars (baseR > 2.0);
        // the many dim/far stars stay as quiet pinpoint dots ("less but refined").
        if (!isReduced && s.baseR > 2.0) {
          drawCrossRays(px, py, radius, s.rayLen, alpha, s.rayAlpha, s.color);
        }

        // Halo / glow layers.
        if (s.layer === 1) {
          ctx.beginPath();
          ctx.arc(px, py, radius * 2.2, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(200, 220, 255, ${alpha * 0.08})`;
          ctx.fill();
        } else if (s.layer === 2) {
          // Outer soft halo.
          ctx.beginPath();
          ctx.arc(px, py, radius * 4.5, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(190, 210, 255, ${alpha * 0.07})`;
          ctx.fill();
          // Inner brighter halo.
          ctx.beginPath();
          ctx.arc(px, py, radius * 2.8, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(190, 210, 255, ${alpha * 0.16})`;
          ctx.fill();
          // Occasional large glimmer ring.
          if (Math.sin(s.glowPhase * 0.7) > 0.85) {
            ctx.beginPath();
            ctx.arc(px, py, radius * 3.2, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(255, 255, 255, ${alpha * 0.06})`;
            ctx.fill();
          }
          // Warm-white core.
          ctx.beginPath();
          ctx.arc(px, py, radius * 0.55, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(255, 248, 235, ${Math.min(1, alpha * 0.95)})`;
          ctx.fill();
        }

        // Star body.
        ctx.beginPath();
        ctx.arc(px, py, radius, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${s.color}, ${alpha})`;
        ctx.fill();
      }

      // Meteors render on top of the star field.
      if (!isReduced) drawMeteors();

    }

    resize();
    let raf = 0;
    let last = 0;
    const FRAME = 1000 / 30; // 30fps cap
    function loop(tt: number) {
      if (tt - last >= FRAME) {
        last = tt;
        draw(tt);
      }
      raf = requestAnimationFrame(loop);
    }

    if (isReduced) {
      draw(0); // single static frame (no meteors / flares / pulse)
    } else {
      raf = requestAnimationFrame(loop);
    }

    window.addEventListener('resize', resize);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('resize', resize);
    };
  }, [starCount, speed, depth, twinkle, reduced]);

  return (
    <div ref={wrapRef} className={`starfield ${className}`} aria-hidden="true">
      <canvas ref={canvasRef} />
      {/* V48.8: Short, gentle bottom fade — was h-80 (320px) causing "white curtain".
          Reduced to h-24 with minimal opacity so starfield dissolves softly. */}
      <div
        className="pointer-events-none absolute inset-x-0 bottom-0 z-[2] h-24 bg-gradient-to-b from-transparent via-white/8 to-white/15"
        aria-hidden="true"
      />
    </div>
  );
}
