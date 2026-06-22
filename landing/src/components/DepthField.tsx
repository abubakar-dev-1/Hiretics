"use client";

import { useEffect, useRef } from "react";

/**
 * Premium 3D molecule field: complex atom/bond structures rotate and drift
 * through depth at a natural pace. Interactivity is LOCAL to the cursor —
 * atoms within reach of the pointer light up and link to it, so you "touch"
 * the structures rather than parallax-shifting the whole background.
 */

type Atom = { x: number; y: number; z: number; core: boolean };
type Molecule = {
  cx: number;
  cy: number;
  cz: number;
  atoms: Atom[];
  bonds: [number, number][];
  ay: number;
  ax: number;
  vay: number;
  vax: number;
};

export function DepthField({ className }: { className?: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const mouse = useRef({ x: -9999, y: -9999, active: false });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    let w = 0;
    let h = 0;
    let raf = 0;

    const reduced =
      window.matchMedia?.("(prefers-reduced-motion: reduce)").matches ?? false;

    const COUNT = 18;
    const FOV = 280;
    const NEAR = 130;
    const FAR = 1300;
    const SPEED = reduced ? 0.15 : 0.55; // natural drift
    const BOND = 76;
    const REACH = 160; // cursor interaction radius (px)

    const rand = (a: number, b: number) => a + Math.random() * (b - a);
    const pick = <T,>(arr: T[]) => arr[Math.floor(Math.random() * arr.length)];

    const buildAtoms = () => {
      const n = Math.floor(rand(5, 8));
      const atoms: Atom[] = [{ x: 0, y: 0, z: 0, core: true }];
      const bonds: [number, number][] = [];
      for (let i = 1; i < n; i++) {
        const parent = Math.floor(rand(0, atoms.length));
        const p = atoms[parent];
        const theta = rand(0, Math.PI * 2);
        const phi = rand(0, Math.PI);
        atoms.push({
          x: p.x + BOND * Math.sin(phi) * Math.cos(theta),
          y: p.y + BOND * Math.sin(phi) * Math.sin(theta),
          z: p.z + BOND * Math.cos(phi),
          core: false,
        });
        bonds.push([parent, i]);
      }
      // close one or two rings for complexity
      const rings = atoms.length > 4 ? Math.floor(rand(1, 3)) : 0;
      for (let k = 0; k < rings; k++) {
        const a = pick(atoms.map((_, i) => i));
        const b = pick(atoms.map((_, i) => i));
        if (a !== b && !bonds.some(([x, y]) => (x === a && y === b) || (x === b && y === a))) {
          bonds.push([a, b]);
        }
      }
      return { atoms, bonds };
    };

    const respawn = (m: Molecule, far = false) => {
      m.cx = rand(-1, 1) * 950;
      m.cy = rand(-1, 1) * 950;
      m.cz = far ? rand(FAR * 0.8, FAR) : rand(NEAR, FAR);
      m.ay = rand(0, Math.PI * 2);
      m.ax = rand(0, Math.PI * 2);
    };

    const molecules: Molecule[] = Array.from({ length: COUNT }, () => {
      const { atoms, bonds } = buildAtoms();
      const m: Molecule = {
        cx: 0,
        cy: 0,
        cz: 0,
        atoms,
        bonds,
        ay: 0,
        ax: 0,
        vay: rand(-0.005, 0.005) || 0.003,
        vax: rand(-0.0035, 0.0035),
      };
      respawn(m);
      return m;
    });

    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      w = rect.width;
      h = rect.height;
      canvas.width = Math.max(1, Math.floor(w * dpr));
      canvas.height = Math.max(1, Math.floor(h * dpr));
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(canvas);

    const G = "22,163,74"; // brand green
    const GB = "34,197,94"; // brighter green for interaction
    const speedScale = reduced ? 0.3 : 1;

    const draw = () => {
      ctx.clearRect(0, 0, w, h);
      const camX = w / 2;
      const camY = h * 0.42;
      const mx = mouse.current.x;
      const my = mouse.current.y;
      const interactive = mouse.current.active;

      // collect projected atoms across all molecules for the interaction pass
      const allAtoms: { sx: number; sy: number; s: number }[] = [];

      for (const m of molecules) {
        m.cz -= SPEED;
        m.ay += m.vay * speedScale;
        m.ax += m.vax * speedScale;
        if (m.cz < NEAR) {
          respawn(m, true);
          continue;
        }

        const cosY = Math.cos(m.ay);
        const sinY = Math.sin(m.ay);
        const cosX = Math.cos(m.ax);
        const sinX = Math.sin(m.ax);

        const proj: { sx: number; sy: number; s: number; core: boolean }[] = [];
        for (const a of m.atoms) {
          const x1 = a.x * cosY + a.z * sinY;
          const z1 = -a.x * sinY + a.z * cosY;
          const y1 = a.y;
          const y2 = y1 * cosX - z1 * sinX;
          const z2 = y1 * sinX + z1 * cosX;
          const wz = m.cz + z2;
          if (wz < 20) {
            proj.push({ sx: 0, sy: 0, s: 0, core: a.core });
            continue;
          }
          const s = FOV / wz;
          const sx = camX + (m.cx + x1) * s;
          const sy = camY + (m.cy + y2) * s;
          proj.push({ sx, sy, s, core: a.core });
        }

        const fade =
          Math.max(0, Math.min(1, (FAR - m.cz) / FAR)) * 0.45 +
          Math.min(1, (FOV / m.cz) * 1.3) * 0.55;

        // bonds
        for (const [i, j] of m.bonds) {
          const a = proj[i];
          const b = proj[j];
          if (a.s <= 0 || b.s <= 0) continue;
          const alpha = Math.min(0.5, ((a.s + b.s) / 2) * 1.2) * fade;
          if (alpha <= 0.01) continue;
          ctx.strokeStyle = `rgba(${G},${alpha})`;
          ctx.lineWidth = Math.min(1.5, ((a.s + b.s) / 2) * 1.3);
          ctx.beginPath();
          ctx.moveTo(a.sx, a.sy);
          ctx.lineTo(b.sx, b.sy);
          ctx.stroke();
        }

        // atoms
        for (const o of proj) {
          if (o.s <= 0) continue;
          const r = Math.min(o.core ? 5 : 3.4, Math.max(0.5, o.s * (o.core ? 2.3 : 1.6)));
          const a = Math.min(1, o.s * 1.15) * fade;
          if (a <= 0.01) continue;
          ctx.beginPath();
          ctx.fillStyle = `rgba(${G},${a})`;
          ctx.arc(o.sx, o.sy, r, 0, Math.PI * 2);
          ctx.fill();
          if (o.s > 0.8) {
            ctx.beginPath();
            ctx.fillStyle = `rgba(${G},${a * 0.13})`;
            ctx.arc(o.sx, o.sy, r * 3, 0, Math.PI * 2);
            ctx.fill();
          }
          if (interactive) allAtoms.push({ sx: o.sx, sy: o.sy, s: o.s });
        }
      }

      // ── local cursor interaction: light up + link atoms near the pointer ──
      if (interactive) {
        let linked = 0;
        for (const o of allAtoms) {
          const d = Math.hypot(o.sx - mx, o.sy - my);
          if (d > REACH) continue;
          const f = 1 - d / REACH;
          // link line to cursor
          ctx.strokeStyle = `rgba(${GB},${f * 0.55})`;
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.moveTo(mx, my);
          ctx.lineTo(o.sx, o.sy);
          ctx.stroke();
          // brighten the atom
          ctx.beginPath();
          ctx.fillStyle = `rgba(${GB},${0.5 + f * 0.5})`;
          ctx.arc(o.sx, o.sy, 1.6 + f * 3.2, 0, Math.PI * 2);
          ctx.fill();
          linked++;
        }
        // cursor node + halo (only show when it's actually near structures)
        if (linked > 0) {
          ctx.beginPath();
          ctx.fillStyle = `rgba(${GB},0.16)`;
          ctx.arc(mx, my, 26, 0, Math.PI * 2);
          ctx.fill();
          ctx.beginPath();
          ctx.fillStyle = `rgba(${GB},0.9)`;
          ctx.arc(mx, my, 3, 0, Math.PI * 2);
          ctx.fill();
        }
      }

      raf = requestAnimationFrame(draw);
    };
    raf = requestAnimationFrame(draw);

    const onMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      mouse.current = {
        x,
        y,
        active: x >= 0 && x <= rect.width && y >= 0 && y <= rect.height,
      };
    };
    window.addEventListener("mousemove", onMove);

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      window.removeEventListener("mousemove", onMove);
    };
  }, []);

  return <canvas ref={canvasRef} className={className} aria-hidden />;
}
