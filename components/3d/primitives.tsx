'use client';

import * as THREE from 'three';
import { useMemo, type ReactNode } from 'react';
import { Instance, Instances } from '@react-three/drei';
import { GEO, MAT } from './materials';

type V3 = [number, number, number];

export function Box({
  p,
  s,
  m,
  r,
  shadow = true,
}: {
  p: V3;
  s: V3;
  m: THREE.Material;
  r?: V3;
  shadow?: boolean;
}) {
  return (
    <mesh geometry={GEO.box} material={m} position={p} scale={s} rotation={r} castShadow={shadow} receiveShadow />
  );
}

export function Cyl({
  p,
  radius,
  h,
  m,
  low,
  shadow = true,
}: {
  p: V3;
  radius: number;
  h: number;
  m: THREE.Material;
  low?: boolean;
  shadow?: boolean;
}) {
  return (
    <mesh
      geometry={low ? GEO.cylLow : GEO.cyl}
      material={m}
      position={p}
      scale={[radius, h, radius]}
      castShadow={shadow}
      receiveShadow
    />
  );
}

export function Dome({ p, radius, m }: { p: V3; radius: number; m: THREE.Material }) {
  return <mesh geometry={GEO.hemi} material={m} position={p} scale={radius} castShadow />;
}

/** Polar placement helper: angle 0 faces the camera (+z). */
export function polar(radius: number, deg: number, y = 0): V3 {
  const a = THREE.MathUtils.degToRad(deg);
  return [Math.sin(a) * radius, y, Math.cos(a) * radius];
}

/** Places children on a ring, rotated so their front faces outward. */
export function Placed({ radius, deg, y, children }: { radius: number; deg: number; y: number; children: ReactNode }) {
  return (
    <group position={polar(radius, deg, y)} rotation={[0, THREE.MathUtils.degToRad(deg), 0]}>
      {children}
    </group>
  );
}

/** Instanced low-poly trees: one draw call for trunks, one for canopies. */
export function Trees({ items }: { items: { p: V3; s?: number }[] }) {
  return (
    <group>
      <Instances geometry={GEO.cylLow} material={MAT.trunk} limit={items.length}>
        {items.map((t, i) => {
          const s = t.s ?? 1;
          return <Instance key={i} position={[t.p[0], t.p[1] + 0.12 * s, t.p[2]]} scale={[0.035 * s, 0.24 * s, 0.035 * s]} />;
        })}
      </Instances>
      <Instances geometry={GEO.canopy} material={MAT.leaf} limit={items.length} castShadow>
        {items.map((t, i) => {
          const s = t.s ?? 1;
          return (
            <Instance
              key={i}
              position={[t.p[0], t.p[1] + 0.36 * s, t.p[2]]}
              scale={0.2 * s}
              rotation={[0, i * 1.3, 0]}
              color={i % 3 === 0 ? '#78B862' : i % 3 === 1 ? '#5FA052' : '#6BAA58'}
            />
          );
        })}
      </Instances>
    </group>
  );
}

/**
 * Procedural window-band textures for tier facades. Returns a colour map and a matching emissive map
 * (only the windows are white) so windows can "light up" when a level is activated.
 */
export function useWindowTextures(opts: { cols: number; rows: number; wall: string; window: string; repeat: number }) {
  return useMemo(() => {
    const w = 512;
    const h = 128;
    const make = (bg: string, fg: string) => {
      const c = document.createElement('canvas');
      c.width = w;
      c.height = h;
      const g = c.getContext('2d')!;
      g.fillStyle = bg;
      g.fillRect(0, 0, w, h);
      const cw = w / opts.cols;
      const rh = h / opts.rows;
      g.fillStyle = fg;
      for (let r = 0; r < opts.rows; r++) {
        for (let col = 0; col < opts.cols; col++) {
          const x = col * cw + cw * 0.18;
          const y = r * rh + rh * 0.22;
          const ww = cw * 0.64;
          const hh = rh * 0.56;
          g.beginPath();
          g.roundRect(x, y, ww, hh, [ww * 0.5, ww * 0.5, 3, 3]);
          g.fill();
        }
      }
      const tex = new THREE.CanvasTexture(c);
      tex.wrapS = THREE.RepeatWrapping;
      tex.repeat.set(opts.repeat, 1);
      tex.colorSpace = THREE.SRGBColorSpace;
      tex.anisotropy = 4;
      return tex;
    };
    return { map: make(opts.wall, opts.window), emissive: make('#000000', '#ffffff') };
  }, [opts.cols, opts.rows, opts.wall, opts.window, opts.repeat]);
}
