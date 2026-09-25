import * as THREE from 'three';

// Reusable materials: every mesh shares these instead of creating its own.
const std = (color: string, extra: Partial<THREE.MeshStandardMaterialParameters> = {}) =>
  new THREE.MeshStandardMaterial({ color, roughness: 0.85, metalness: 0.02, ...extra });

export const MAT = {
  stone: std('#F1ECE4'),
  stoneDark: std('#DDD5C8'),
  plinth: std('#E7E1D8'),
  sandstone: std('#EAD7BA'),
  sandstoneDark: std('#D9BE97'),
  marble: std('#F7F3EC', { roughness: 0.6 }),
  terracotta: std('#D98E62'),
  roofRed: std('#B9583E'),
  grass: std('#A9CF7E'),
  grassDark: std('#8DBB63'),
  plaza: std('#EDE6DA'),
  road: std('#6B7280', { roughness: 0.95 }),
  roadLine: std('#F8FAFC'),
  trunk: std('#8A5A3B'),
  leaf: std('#5FA052'),
  leafLight: std('#78B862'),
  water: std('#6EC1E4', { roughness: 0.2, metalness: 0.1 }),
  metal: std('#94A3B8', { roughness: 0.4, metalness: 0.5 }),
  darkMetal: std('#475569', { roughness: 0.5, metalness: 0.4 }),
  white: std('#FFFFFF'),
  glass: std('#BFDBFE', { roughness: 0.15, metalness: 0.2, transparent: true, opacity: 0.55 }),
  floor: std('#E4EAF2', { roughness: 0.9 }),
  wall: std('#DCE5F0', { roughness: 0.9, side: THREE.BackSide }),
  desk: std('#F8FAFC', { roughness: 0.5 }),
  saffron: std('#FF9933'),
  green: std('#138808'),
  navy: std('#1E3A8A'),
  hospital: std('#F9FAFB'),
  schoolYellow: std('#F4C95D'),
  blueRoof: std('#3B82F6'),
};

export const GEO = {
  box: new THREE.BoxGeometry(1, 1, 1),
  cyl: new THREE.CylinderGeometry(1, 1, 1, 20),
  cylLow: new THREE.CylinderGeometry(1, 1, 1, 8),
  cone4: new THREE.ConeGeometry(0.75, 1, 4),
  sphere: new THREE.SphereGeometry(1, 20, 14),
  hemi: new THREE.SphereGeometry(1, 24, 12, 0, Math.PI * 2, 0, Math.PI / 2),
  canopy: new THREE.IcosahedronGeometry(1, 0),
};
