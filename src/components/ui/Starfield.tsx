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
  length: number; // trail length in px (80–200)
  speed: number; // px per frame (0.8–2.0 = SLOW)
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
 * Cinematic starfield canvas (V36).
 *  - Cross-shaped rays on mid and near-layer stars, with opacity fading outward.
 *  - Per-star independent glow phase: radius and alpha breathe between 70-130% and 50-100%.
 *  - When meteors are active, a global pale-blue overlay brightens to 0.25 and fades back to 0.
 *  - Three distinct parallax layers: far (tiny, dim, slow), mid (moderate, weak rays), near (bright, strong rays, halo).
 */
export default function Starfield({
  className = '',
  starCount = 520,
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

    // Layer definitions — tuned for clear depth and visual rhythm.
    const layerAlpha = [0.18, 0.45, 0.85];
    const layerRadius = [0.55, 1.25, 2.4];
    const layerDrift = [0.02, 0.08, 0.2];
    const layerTw = [0.6, 1.0, 1.6];
    const layerPulseAmp = [0.0, 0.2, 0.35]; // radius pulse amplitude
    const layerAlphaPulseAmp = [0.0, 0.25, 0.4]; // alpha pulse amplitude
    const layerRayLen = [0, 3.5, 6]; // ray length = baseR * multiplier
    const layerRayAlpha = [0, 0.22, 0.32];
    const layerGlowSpeed = [0.003, 0.01, 0.018];

    const stars: Star[] = [];
    const count = Math.max(
      60,
      Math.min(starCount, Math.floor((width * height) / 1400)),
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

    // Cached nebula gradient (recomputed on resize).
    let nebula: CanvasGradient | null = null;
    function buildNebula() {
      if (!ctx) return;
      const g = ctx.createRadialGradient(
        width * 0.5,
        height * 0.55,
        0,
        width * 0.5,
        height * 0.55,
        Math.max(width, height) * 0.9,
      );
      g.addColorStop(0, 'rgba(99, 102, 241, 0)');
      g.addColorStop(0.55, 'rgba(99, 102, 241, 0.015)');
      g.addColorStop(1, 'rgba(99, 102, 241, 0.04)');
      nebula = g;
    }

    // Faint diagonal Milky-Way band.
    function drawMilkyWay() {
      if (!ctx) return;
      ctx.save();
      ctx.translate(width / 2, height / 2);
      ctx.rotate(-Math.PI / 6);
      const bandW = Math.max(width, height) * 0.6;
      const g = ctx.createLinearGradient(-bandW / 2, 0, bandW / 2, 0);
      g.addColorStop(0, 'rgba(255, 255, 255, 0)');
      g.addColorStop(0.5, 'rgba(180, 200, 255, 0.06)');
      g.addColorStop(1, 'rgba(255, 255, 255, 0)');
      ctx.fillStyle = g;
      ctx.fillRect(-bandW / 2, -height * 0.18, bandW, height * 0.36);
      ctx.restore();
    }

    // ---- Meteor shower system -------------------------------------------
    const METEOR_COLORS = [
      'rgba(56,189,248,', // cyan
      'rgba(250,204,21,', // gold
      'rgba(244,114,182,', // pink
      'rgba(255,255,255,', // white
    ];
    const meteors: Meteor[] = [];
    let nextSpawn = 120 + Math.random() * 180; // first spawn 120–300 frames
    function spawnMeteor() {
      const activeCount = meteors.reduce((n, m) => n + (m.active ? 1 : 0), 0);
      if (activeCount >= 3) return; // keep <= 3 on screen at once
      const maxLife = 180 + Math.random() * 220; // 180–400 frames (~6–13s)
      meteors.push({
        x: 0.7 + Math.random() * 0.6, // 0.7–1.3 (right side, sometimes off-screen)
        y: Math.random() * 0.3, // 0–0.3 (upper sky)
        length: 80 + Math.random() * 120, // 80–200 px trail
        speed: 0.8 + Math.random() * 1.2, // 0.8–2.0 px/frame (SLOW)
        angle: 2.0 + Math.random() * 0.8, // 2.0–2.8 rad (fall L→R, downward)
        color: METEOR_COLORS[Math.floor(Math.random() * METEOR_COLORS.length)],
        alpha: 0.4 + Math.random() * 0.3, // 0.4–0.7
        life: maxLife,
        maxLife,
        active: true,
      });
    }

    function drawMeteors() {
      if (!ctx) return;
      for (const m of meteors) {
        if (!m.active) continue;
        const px = m.x * width;
        const py = m.y * height;
        const tailX = px - Math.cos(m.angle) * m.length;
        const tailY = py - Math.sin(m.angle) * m.length;
        // Fade in over the first 36 frames and out over the last 36 frames.
        const fadeOut = Math.min(1, m.life / 36);
        const fadeIn = Math.min(1, (m.maxLife - m.life) / 36);
        const vis = m.alpha * Math.min(fadeIn, fadeOut);

        const grad = ctx.createLinearGradient(px, py, tailX, tailY);
        grad.addColorStop(0, `${m.color}${vis})`);
        grad.addColorStop(0.18, `${m.color}${vis * 0.55})`);
        grad.addColorStop(1, `${m.color}0)`);
        ctx.strokeStyle = grad;
        ctx.lineWidth = 2;
        ctx.lineCap = 'round';
        ctx.beginPath();
        ctx.moveTo(px, py);
        ctx.lineTo(tailX, tailY);
        ctx.stroke();

        // Bright head dot.
        ctx.beginPath();
        ctx.arc(px, py, 2.2, 0, Math.PI * 2);
        ctx.fillStyle = `${m.color}${Math.min(1, vis + 0.25)})`;
        ctx.fill();

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

    // Global meteor brightness overlay.
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

      ctx.lineWidth = Math.max(0.5, radius * 0.4);
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
      ctx.clearRect(0, 0, width, height);

      // Very faint nebula backdrop.
      if (nebula) {
        ctx.fillStyle = nebula;
        ctx.fillRect(0, 0, width, height);
      }
      // Faint Milky-Way band.
      drawMilkyWay();

      frame += 1;

      // Schedule meteor spawns (only when not reduced).
      if (!isReduced) {
        if (frame >= nextSpawn) {
          spawnMeteor();
          nextSpawn = frame + 120 + Math.random() * 180; // 120–300 frames
        }
      }

      // Schedule an occasional star flare.
      if (!isReduced && frame >= nextFlare && flareIndex === -1 && nearIndices.length) {
        flareIndex = nearIndices[Math.floor(Math.random() * nearIndices.length)];
        flareTimer = 40 + Math.random() * 40; // 40–80 frames
        nextFlare = frame + 200 + Math.random() * 300; // 200–500 frames
      }

      // Update meteor brightness based on any active meteor.
      if (!isReduced) {
        const anyMeteorActive = meteors.some((m) => m.active);
        if (anyMeteorActive) {
          meteorBrightness = Math.min(0.25, meteorBrightness + 0.25 / 60);
        } else {
          meteorBrightness = Math.max(0, meteorBrightness - meteorBrightness / 90);
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

        let alpha = Math.max(0, Math.min(1, s.baseAlpha * tw * pulseAlpha));
        let radius = Math.max(0.2, s.baseR * pulseRadius);

        // Flare override for the chosen near-layer star.
        if (i === flareIndex && flareTimer > 0) {
          const f = flareTimer / 80; // 1 → 0
          radius = s.baseR * (1 + 2 * f); // up to 3× size
          alpha = Math.min(1, alpha + (1 - alpha) * f); // up to full brightness
          flareTimer -= 1;
          if (flareTimer <= 0) flareIndex = -1;
        }

        // Cross-shaped rays on mid and near stars (skip reduced motion).
        if (!isReduced && s.layer > 0) {
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

      // Global brightness overlay when meteors are active.
      if (meteorBrightness > 0.001) {
        ctx.fillStyle = `rgba(180, 220, 255, ${meteorBrightness})`;
        ctx.fillRect(0, 0, width, height);
      }
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
    </div>
  );
}
