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
  r: number;
  layer: number; // 0 far, 1 mid, 2 near
  baseAlpha: number;
  phase: number;
  drift: number;
  twSpeed: number;
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
 * Night-sky starfield rendered on a <canvas>.
 *
 * V34 — a *cinematic* sky:
 *  - Every star now TWINKLES with a full 0→baseAlpha opacity swing so the sky
 *    visibly shimmers (V33's 0.09–0.27 far-layer alpha was essentially
 *    invisible).
 *  - Mid + near layer stars carry soft glow halos; near-layer halos are large
 *    and bright for a real "star light" feel.
 *  - A METEOR SHOWER system: slow, colorful (cyan / gold / pink / white)
 *    meteors randomly streak down the upper sky and cross the screen over
 *    2.5–6 seconds.
 *  - Stronger parallax: the far layer barely moves while the near layer drifts
 *    noticeably, giving clear far/near depth.
 *  - Occasional "star flare" events: a random near star flares to 3× size /
 *    full brightness for a beat, then smoothly fades back — catching the eye.
 * Capped at ~30fps; under reduced-motion a single static frame is drawn (no
 * meteors / flares).
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

    const isReduced = reduced ?? prefersReducedMotion();

    let width = wrap.clientWidth;
    let height = wrap.clientHeight;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);

    // V34: brighter base alphas so ALL layers are clearly visible.
    const layerAlpha = [0.4, 0.7, 1.0];
    // Tiny pin-points (far/mid) with a brighter near layer.
    const layerRadius = [0.6, 1.4, 3];
    // V34: stronger parallax separation — far barely moves, near shifts a lot.
    const layerDrift = [0.05, 0.2, 0.5];
    // Per-layer twinkle cadence so the sky shimmers unevenly.
    const layerTw = [0.7, 1.0, 1.5];

    // Pre-computed indices of near-layer stars (for flare events).
    const nearIndices: number[] = [];

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
        Math.max(width, height) * 0.85,
      );
      g.addColorStop(0, 'rgba(99, 102, 241, 0)');
      g.addColorStop(0.6, 'rgba(99, 102, 241, 0.012)');
      g.addColorStop(1, 'rgba(99, 102, 241, 0.03)');
      nebula = g;
    }

    // Faint diagonal Milky-Way band.
    function drawMilkyWay() {
      if (!ctx) return;
      ctx.save();
      ctx.translate(width / 2, height / 2);
      ctx.rotate(-Math.PI / 6);
      const bandW = Math.max(width, height) * 0.55;
      const g = ctx.createLinearGradient(-bandW / 2, 0, bandW / 2, 0);
      g.addColorStop(0, 'rgba(255, 255, 255, 0)');
      g.addColorStop(0.5, 'rgba(180, 200, 255, 0.05)');
      g.addColorStop(1, 'rgba(255, 255, 255, 0)');
      ctx.fillStyle = g;
      ctx.fillRect(-bandW / 2, -height * 0.17, bandW, height * 0.34);
      ctx.restore();
    }

    const stars: Star[] = [];
    const count = Math.max(
      40,
      Math.min(starCount, Math.floor((width * height) / 1800)),
    );
    for (let i = 0; i < count; i += 1) {
      const rnd = Math.random();
      const layer = depth ? (rnd < 0.8 ? 0 : rnd < 0.95 ? 1 : 2) : 1;
      stars.push({
        x: Math.random(),
        y: Math.random(),
        r: layerRadius[layer] * (0.7 + Math.random() * 0.5),
        layer,
        baseAlpha: layerAlpha[layer],
        phase: Math.random() * Math.PI * 2,
        drift: (Math.random() - 0.5) * layerDrift[layer],
        twSpeed: layerTw[layer],
      });
      if (layer === 2) nearIndices.push(i);
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
        // Fade in over the first 36 frames and out over the last 36 frames so
        // meteors don't pop in/out abruptly.
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

      for (let i = 0; i < stars.length; i += 1) {
        const s = stars[i];
        const driftX = isReduced ? 0 : s.drift * Math.sin(t * 0.0002 + s.phase) * 0.5;
        const px = (s.x + driftX) * width;
        const py = s.y * height;
        // V34: full 0→baseAlpha twinkle swing — clearly visible on every layer.
        const tw =
          twinkle && !isReduced
            ? 0.5 + 0.5 * Math.sin(t * 0.0018 * speed * s.twSpeed + s.phase)
            : 1;
        let alpha = Math.max(0, Math.min(1, s.baseAlpha * tw));
        let radius = s.r;

        // Flare override for the chosen near-layer star.
        if (i === flareIndex && flareTimer > 0) {
          const f = flareTimer / 80; // 1 → 0
          radius = s.r * (1 + 2 * f); // up to 3× size
          alpha = Math.min(1, alpha + (1 - alpha) * f); // up to full brightness
          flareTimer -= 1;
          if (flareTimer <= 0) flareIndex = -1;
        }

        // Mid-layer stars: a small soft glow halo.
        if (s.layer === 1) {
          ctx.beginPath();
          ctx.arc(px, py, s.r * 1.6, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(200, 220, 255, ${alpha * 0.08})`;
          ctx.fill();
        }

        // Stars are white / faint warm-white — never cyan.
        ctx.beginPath();
        ctx.arc(px, py, radius, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255, 255, 255, ${alpha})`;
        ctx.fill();

        // Near-layer stars: bright warm-white core + a LARGE, bright halo.
        if (s.layer === 2) {
          // Outer soft halo.
          ctx.beginPath();
          ctx.arc(px, py, radius * 4, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(190, 210, 255, ${alpha * 0.06})`;
          ctx.fill();
          // Inner brighter halo.
          ctx.beginPath();
          ctx.arc(px, py, radius * 2.5, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(190, 210, 255, ${alpha * 0.15})`;
          ctx.fill();
          // Warm-white core.
          ctx.beginPath();
          ctx.arc(px, py, radius * 0.55, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(255, 248, 235, ${Math.min(1, alpha * 0.9)})`;
          ctx.fill();
        }
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
      draw(0); // single static frame (no meteors / flares)
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
