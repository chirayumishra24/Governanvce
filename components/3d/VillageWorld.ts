import * as THREE from 'three';
import { LANDMARKS } from '@/data/villageData';
import { ProjectOption } from '@/types/game';
import { CollisionObstacle } from './Controls';

export class VillageWorld {
  public scene: THREE.Scene;
  public landmarkMeshes: Map<string, THREE.Group> = new Map();
  public upgradeMeshes: Map<string, THREE.Group> = new Map();
  public obstacles: CollisionObstacle[] = [];
  public streetLights: THREE.PointLight[] = [];
  public streetLampBulbs: THREE.Mesh[] = [];
  public cropsMeshes: THREE.Mesh[] = [];
  public rainParticles: THREE.Points | null = null;
  private rainPositions: Float32Array | null = null;
  private isRaining: boolean = false;
  private animatedElements: { mesh: THREE.Object3D; update: (t: number) => void }[] = [];

  constructor(scene: THREE.Scene) {
    this.scene = scene;
    this.buildTerrain();
    this.buildRoadsAndPaths();
    this.buildGramSabhaHall();
    this.buildWaterTank();
    this.buildSchool();
    this.buildHealthCentre();
    this.buildMarket();
    this.buildResidentialQuarter();
    this.buildFarms();
    this.buildSanitationYard();
    this.buildVegetationAndProps();
    this.setupRainSystem();
  }

  // Procedural Textures Generator for High Visual Realism
  private createTileTexture(): THREE.CanvasTexture {
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 512;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.fillStyle = '#b4431e';
      ctx.fillRect(0, 0, 512, 512);

      // Tile Rows
      for (let y = 0; y < 512; y += 32) {
        ctx.fillStyle = '#943212';
        ctx.fillRect(0, y, 512, 4);

        for (let x = (y % 64 === 0 ? 0 : 32); x < 512; x += 64) {
          ctx.fillStyle = '#d95a2b';
          ctx.fillRect(x + 2, y + 4, 60, 26);
          ctx.fillStyle = '#83280c';
          ctx.fillRect(x, y + 4, 3, 28);
        }
      }
    }
    const tex = new THREE.CanvasTexture(canvas);
    tex.wrapS = THREE.RepeatWrapping;
    tex.wrapT = THREE.RepeatWrapping;
    tex.repeat.set(4, 4);
    return tex;
  }

  private createCobbleTexture(): THREE.CanvasTexture {
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 512;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.fillStyle = '#c49a6c';
      ctx.fillRect(0, 0, 512, 512);

      ctx.fillStyle = '#8b6f4e';
      for (let y = 0; y < 512; y += 24) {
        ctx.fillRect(0, y, 512, 3);
        for (let x = (y % 48 === 0 ? 0 : 20); x < 512; x += 40) {
          ctx.fillRect(x, y, 3, 24);
          ctx.fillStyle = 'rgba(230, 200, 160, 0.4)';
          ctx.fillRect(x + 3, y + 3, 34, 18);
          ctx.fillStyle = '#8b6f4e';
        }
      }
    }
    const tex = new THREE.CanvasTexture(canvas);
    tex.wrapS = THREE.RepeatWrapping;
    tex.wrapT = THREE.RepeatWrapping;
    tex.repeat.set(4, 12);
    return tex;
  }

  private createSolarTexture(): THREE.CanvasTexture {
    const canvas = document.createElement('canvas');
    canvas.width = 256;
    canvas.height = 256;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.fillStyle = '#1e3a8a';
      ctx.fillRect(0, 0, 256, 256);
      ctx.strokeStyle = '#60a5fa';
      ctx.lineWidth = 3;
      for (let i = 0; i < 256; i += 32) {
        ctx.beginPath();
        ctx.moveTo(i, 0);
        ctx.lineTo(i, 256);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(0, i);
        ctx.lineTo(256, i);
        ctx.stroke();
      }
    }
    const tex = new THREE.CanvasTexture(canvas);
    return tex;
  }

  private buildTerrain() {
    // High Quality Ground with subtle variation
    const groundGeo = new THREE.PlaneGeometry(120, 120, 48, 48);
    const groundMat = new THREE.MeshStandardMaterial({
      color: 0x86efac,
      roughness: 0.85,
      metalness: 0.05,
    });
    const ground = new THREE.Mesh(groundGeo, groundMat);
    ground.rotation.x = -Math.PI / 2;
    ground.receiveShadow = true;
    this.scene.add(ground);

    // Warm Sandy Earth patches
    const earthGeo = new THREE.CircleGeometry(48, 32);
    const earthMat = new THREE.MeshStandardMaterial({
      color: 0x93c5fd,
      roughness: 0.9,
      transparent: true,
      opacity: 0.1,
    });
    const earth = new THREE.Mesh(earthGeo, earthMat);
    earth.rotation.x = -Math.PI / 2;
    earth.position.y = 0.01;
    earth.receiveShadow = true;
    this.scene.add(earth);

    // Surrounding Forest / Mountain Backdrop
    for (let i = 0; i < 28; i++) {
      const angle = (i / 28) * Math.PI * 2;
      const radius = 58 + Math.sin(i * 2.3) * 5;
      const hillHeight = 14 + Math.sin(i * 3.1) * 6;
      const hillGeo = new THREE.ConeGeometry(9 + Math.random() * 5, hillHeight, 8);
      const hillMat = new THREE.MeshStandardMaterial({
        color: i % 2 === 0 ? 0x15803d : 0x166534,
        roughness: 0.9,
        flatShading: true,
      });
      const hill = new THREE.Mesh(hillGeo, hillMat);
      hill.position.set(Math.cos(angle) * radius, hillHeight / 2 - 1, Math.sin(angle) * radius);
      hill.castShadow = true;
      this.scene.add(hill);

      this.obstacles.push({
        type: 'cylinder',
        centerX: hill.position.x,
        centerZ: hill.position.z,
        radius: 6,
      });
    }
  }

  private buildRoadsAndPaths() {
    const roadGroup = new THREE.Group();
    roadGroup.name = 'roads_network';

    const cobbleTex = this.createCobbleTexture();
    const dirtRoadMat = new THREE.MeshStandardMaterial({
      color: 0xd4a373,
      map: cobbleTex,
      roughness: 0.8,
      metalness: 0.1,
    });

    // Main Central North-South Road
    const centralRoadGeo = new THREE.PlaneGeometry(6.2, 74);
    const centralRoad = new THREE.Mesh(centralRoadGeo, dirtRoadMat);
    centralRoad.rotation.x = -Math.PI / 2;
    centralRoad.position.set(0, 0.02, 0);
    centralRoad.receiveShadow = true;
    roadGroup.add(centralRoad);

    // Side Curbs on Main Road
    for (let side of [-3.15, 3.15]) {
      const curbGeo = new THREE.BoxGeometry(0.3, 0.12, 74);
      const curbMat = new THREE.MeshStandardMaterial({ color: 0xa8a29e, roughness: 0.9 });
      const curb = new THREE.Mesh(curbGeo, curbMat);
      curb.position.set(side, 0.06, 0);
      curb.receiveShadow = true;
      roadGroup.add(curb);
    }

    // East-West Cross Road
    const crossRoadGeo = new THREE.PlaneGeometry(62, 5.0);
    const crossRoad = new THREE.Mesh(crossRoadGeo, dirtRoadMat);
    crossRoad.rotation.x = -Math.PI / 2;
    crossRoad.position.set(0, 0.022, 0);
    crossRoad.receiveShadow = true;
    roadGroup.add(crossRoad);

    // Branch to School
    const schoolPathGeo = new THREE.PlaneGeometry(16, 4.0);
    const schoolPath = new THREE.Mesh(schoolPathGeo, dirtRoadMat);
    schoolPath.rotation.x = -Math.PI / 2;
    schoolPath.position.set(-8, 0.024, -10);
    schoolPath.receiveShadow = true;
    roadGroup.add(schoolPath);

    // Branch to Sanitation Yard
    const sanitationPathGeo = new THREE.PlaneGeometry(16, 4.0);
    const sanitationPath = new THREE.Mesh(sanitationPathGeo, dirtRoadMat);
    sanitationPath.rotation.x = -Math.PI / 2;
    sanitationPath.position.set(-8, 0.024, 18);
    sanitationPath.receiveShadow = true;
    roadGroup.add(sanitationPath);

    this.scene.add(roadGroup);
  }

  private buildGramSabhaHall() {
    const hallGroup = new THREE.Group();
    hallGroup.position.set(0, 0, 16);

    const tileTex = this.createTileTexture();

    // Plinth Stone Foundation
    const baseGeo = new THREE.BoxGeometry(15, 0.9, 13);
    const stoneMat = new THREE.MeshStandardMaterial({ color: 0xf1f5f9, roughness: 0.7 });
    const base = new THREE.Mesh(baseGeo, stoneMat);
    base.position.y = 0.45;
    base.castShadow = true;
    base.receiveShadow = true;
    hallGroup.add(base);

    // Main Hall Walls
    const wallGeo = new THREE.BoxGeometry(13, 3.8, 10);
    const wallMat = new THREE.MeshStandardMaterial({ color: 0xede9fe, roughness: 0.65 });
    const walls = new THREE.Mesh(wallGeo, wallMat);
    walls.position.set(0, 2.8, -0.5);
    walls.castShadow = true;
    walls.receiveShadow = true;
    hallGroup.add(walls);

    // Carved Wooden Entrance Double Door
    const doorGeo = new THREE.BoxGeometry(2.4, 2.8, 0.2);
    const woodMat = new THREE.MeshStandardMaterial({ color: 0x5c2c16, roughness: 0.6 });
    const door = new THREE.Mesh(doorGeo, woodMat);
    door.position.set(0, 1.8, 4.6);
    hallGroup.add(door);

    // Brass Plaque "GRAM SABHA PANCHAYAT BHAWAN"
    const plaqueGeo = new THREE.BoxGeometry(3.6, 0.6, 0.1);
    const brassMat = new THREE.MeshStandardMaterial({ color: 0xf59e0b, metalness: 0.6, roughness: 0.3 });
    const plaque = new THREE.Mesh(plaqueGeo, brassMat);
    plaque.position.set(0, 3.6, 4.6);
    hallGroup.add(plaque);

    // Veranda Pillars
    const colMat = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.5 });
    for (let i = -5.5; i <= 5.5; i += 2.75) {
      const colGeo = new THREE.CylinderGeometry(0.28, 0.32, 3.8, 16);
      const col = new THREE.Mesh(colGeo, colMat);
      col.position.set(i, 2.8, 5.2);
      col.castShadow = true;
      hallGroup.add(col);
    }

    // Tiled Pitched Roof
    const roofGeo = new THREE.ConeGeometry(11, 3.0, 4);
    const roofMat = new THREE.MeshStandardMaterial({
      color: 0xc2410c,
      map: tileTex,
      roughness: 0.65,
    });
    const roof = new THREE.Mesh(roofGeo, roofMat);
    roof.rotation.y = Math.PI / 4;
    roof.position.set(0, 5.8, 0);
    roof.scale.set(1.15, 1, 0.95);
    roof.castShadow = true;
    hallGroup.add(roof);

    // Flagpole with fluttering flag
    const poleGeo = new THREE.CylinderGeometry(0.08, 0.09, 7.5, 8);
    const poleMat = new THREE.MeshStandardMaterial({ color: 0xd1d5db, metalness: 0.8, roughness: 0.2 });
    const pole = new THREE.Mesh(poleGeo, poleMat);
    pole.position.set(6.5, 4.2, 5.5);
    pole.castShadow = true;
    hallGroup.add(pole);

    const flagGeo = new THREE.PlaneGeometry(1.6, 0.9, 8, 4);
    const flagMat = new THREE.MeshStandardMaterial({ color: 0xf97316, side: THREE.DoubleSide, roughness: 0.6 });
    const flag = new THREE.Mesh(flagGeo, flagMat);
    flag.position.set(7.3, 7.2, 5.5);
    hallGroup.add(flag);

    this.animatedElements.push({
      mesh: flag,
      update: (t) => {
        const pos = flag.geometry.attributes.position;
        for (let i = 0; i < pos.count; i++) {
          const u = pos.getX(i);
          pos.setZ(i, Math.sin(t * 5 + u * 3) * 0.15);
        }
        pos.needsUpdate = true;
      },
    });

    // Banyan Tree Choupal Seating & Tree
    const choupalPlatGeo = new THREE.CylinderGeometry(4.0, 4.3, 0.7, 24);
    const choupalMat = new THREE.MeshStandardMaterial({ color: 0xd97706, roughness: 0.7 });
    const choupal = new THREE.Mesh(choupalPlatGeo, choupalMat);
    choupal.position.set(-10, 0.35, 2);
    choupal.castShadow = true;
    choupal.receiveShadow = true;
    hallGroup.add(choupal);

    const treeTrunkGeo = new THREE.CylinderGeometry(1.1, 1.6, 5.5, 12);
    const trunkMat = new THREE.MeshStandardMaterial({ color: 0x5c3d2e, roughness: 0.9 });
    const treeTrunk = new THREE.Mesh(treeTrunkGeo, trunkMat);
    treeTrunk.position.set(-10, 3.0, 2);
    treeTrunk.castShadow = true;
    hallGroup.add(treeTrunk);

    const canopyGeo = new THREE.DodecahedronGeometry(5.0, 2);
    const canopyMat = new THREE.MeshStandardMaterial({ color: 0x15803d, roughness: 0.8 });
    const canopy = new THREE.Mesh(canopyGeo, canopyMat);
    canopy.position.set(-10, 7.5, 2);
    canopy.castShadow = true;
    hallGroup.add(canopy);

    this.landmarkMeshes.set('gram_sabha_hall', hallGroup);
    this.scene.add(hallGroup);

    // Collision Obstacles for Hall & Choupal
    this.obstacles.push({
      type: 'box',
      minX: -8.0,
      maxX: 8.0,
      minZ: 10.0,
      maxZ: 22.0,
    });
    this.obstacles.push({
      type: 'cylinder',
      centerX: -10,
      centerZ: 18,
      radius: 4.4,
    });
  }

  private buildWaterTank() {
    const tankGroup = new THREE.Group();
    tankGroup.position.set(0, 0, -22);

    const solarTex = this.createSolarTexture();

    // Staging Base
    const baseGeo = new THREE.BoxGeometry(8, 0.7, 8);
    const baseMat = new THREE.MeshStandardMaterial({ color: 0x475569, roughness: 0.8 });
    const base = new THREE.Mesh(baseGeo, baseMat);
    base.position.y = 0.35;
    base.castShadow = true;
    base.receiveShadow = true;
    tankGroup.add(base);

    // Galvanized Steel Legs with Cross Bracing
    const legMat = new THREE.MeshStandardMaterial({ color: 0x334155, metalness: 0.6, roughness: 0.3 });
    for (let x of [-2.6, 2.6]) {
      for (let z of [-2.6, 2.6]) {
        const legGeo = new THREE.CylinderGeometry(0.32, 0.38, 8.5, 12);
        const leg = new THREE.Mesh(legGeo, legMat);
        leg.position.set(x, 4.6, z);
        leg.castShadow = true;
        tankGroup.add(leg);
      }
    }

    // Elevated Reservoir
    const tankCylinderGeo = new THREE.CylinderGeometry(4.0, 4.0, 4.6, 24);
    const tankMat = new THREE.MeshStandardMaterial({ color: 0x0284c7, metalness: 0.3, roughness: 0.4 });
    const tankCylinder = new THREE.Mesh(tankCylinderGeo, tankMat);
    tankCylinder.position.y = 10.5;
    tankCylinder.castShadow = true;
    tankGroup.add(tankCylinder);

    // Dome Cap
    const domeGeo = new THREE.SphereGeometry(4.0, 24, 14, 0, Math.PI * 2, 0, Math.PI / 2);
    const domeMat = new THREE.MeshStandardMaterial({ color: 0x0369a1, metalness: 0.3, roughness: 0.3 });
    const dome = new THREE.Mesh(domeGeo, domeMat);
    dome.position.y = 12.8;
    tankGroup.add(dome);

    // Water Pump Shed
    const pumpShedGeo = new THREE.BoxGeometry(3.6, 2.4, 3.2);
    const pumpShedMat = new THREE.MeshStandardMaterial({ color: 0x94a3b8, roughness: 0.7 });
    const pumpShed = new THREE.Mesh(pumpShedGeo, pumpShedMat);
    pumpShed.position.set(6.2, 1.2, 0);
    pumpShed.castShadow = true;
    tankGroup.add(pumpShed);

    // Solar Panel Array with photovoltaic grid
    const solarGeo = new THREE.BoxGeometry(3.2, 0.12, 2.4);
    const solarMat = new THREE.MeshStandardMaterial({ map: solarTex, metalness: 0.7, roughness: 0.2 });
    const solar = new THREE.Mesh(solarGeo, solarMat);
    solar.rotation.x = -Math.PI / 6;
    solar.position.set(6.2, 2.8, 0);
    solar.castShadow = true;
    tankGroup.add(solar);

    this.landmarkMeshes.set('water_tank', tankGroup);
    this.scene.add(tankGroup);

    // Water Tank Collision Obstacle
    this.obstacles.push({
      type: 'box',
      minX: -4.5,
      maxX: 8.5,
      minZ: -26.5,
      maxZ: -17.5,
    });
  }

  private buildSchool() {
    const schoolGroup = new THREE.Group();
    schoolGroup.position.set(-16, 0, -10);

    const tileTex = this.createTileTexture();

    // Base Plinth
    const baseGeo = new THREE.BoxGeometry(14, 0.6, 9.5);
    const baseMat = new THREE.MeshStandardMaterial({ color: 0xe2e8f0, roughness: 0.8 });
    const base = new THREE.Mesh(baseGeo, baseMat);
    base.position.y = 0.3;
    base.castShadow = true;
    schoolGroup.add(base);

    // Classroom Walls
    const wallGeo = new THREE.BoxGeometry(13, 3.6, 8.5);
    const wallMat = new THREE.MeshStandardMaterial({ color: 0xfef08a, roughness: 0.6 });
    const walls = new THREE.Mesh(wallGeo, wallMat);
    walls.position.set(0, 2.1, 0);
    walls.castShadow = true;
    schoolGroup.add(walls);

    // Roof
    const roofGeo = new THREE.ConeGeometry(10.5, 2.6, 4);
    const roofMat = new THREE.MeshStandardMaterial({ color: 0xb91c1c, map: tileTex, roughness: 0.6 });
    const roof = new THREE.Mesh(roofGeo, roofMat);
    roof.rotation.y = Math.PI / 4;
    roof.scale.set(1.25, 1, 0.9);
    roof.position.set(0, 4.8, 0);
    roof.castShadow = true;
    schoolGroup.add(roof);

    // School Sign Board
    const signGeo = new THREE.BoxGeometry(5.0, 1.3, 0.15);
    const signMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.5 });
    const sign = new THREE.Mesh(signGeo, signMat);
    sign.position.set(0, 2.8, 4.35);
    schoolGroup.add(sign);

    // Student Playground Swings with animation
    const swingFrameGeo = new THREE.TorusGeometry(2.0, 0.12, 12, 24, Math.PI);
    const swingMat = new THREE.MeshStandardMaterial({ color: 0x3b82f6, roughness: 0.5 });
    const swing = new THREE.Mesh(swingFrameGeo, swingMat);
    swing.position.set(9.5, 2.0, 1.5);
    swing.castShadow = true;
    schoolGroup.add(swing);

    this.animatedElements.push({
      mesh: swing,
      update: (t) => {
        swing.rotation.z = Math.sin(t * 2) * 0.08;
      },
    });

    this.landmarkMeshes.set('school', schoolGroup);
    this.scene.add(schoolGroup);

    this.obstacles.push({
      type: 'box',
      minX: -24.0,
      maxX: -8.0,
      minZ: -15.5,
      maxZ: -4.5,
    });
  }

  private buildHealthCentre() {
    const healthGroup = new THREE.Group();
    healthGroup.position.set(18, 0, -2);

    // Main Clinic
    const clinicGeo = new THREE.BoxGeometry(11, 4.0, 9);
    const clinicMat = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.5 });
    const clinic = new THREE.Mesh(clinicGeo, clinicMat);
    clinic.position.y = 2.0;
    clinic.castShadow = true;
    healthGroup.add(clinic);

    // Red Cross Emblem
    const crossBar1Geo = new THREE.BoxGeometry(1.8, 0.5, 0.15);
    const crossBar2Geo = new THREE.BoxGeometry(0.5, 1.8, 0.15);
    const redCrossMat = new THREE.MeshStandardMaterial({ color: 0xdc2626, roughness: 0.3 });
    const cross1 = new THREE.Mesh(crossBar1Geo, redCrossMat);
    const cross2 = new THREE.Mesh(crossBar2Geo, redCrossMat);
    cross1.position.set(0, 2.8, 4.58);
    cross2.position.set(0, 2.8, 4.58);
    healthGroup.add(cross1);
    healthGroup.add(cross2);

    // Parked Ambulance Van
    const vanBodyGeo = new THREE.BoxGeometry(2.6, 2.0, 4.6);
    const vanMat = new THREE.MeshStandardMaterial({ color: 0xf8fafc, metalness: 0.4, roughness: 0.3 });
    const van = new THREE.Mesh(vanBodyGeo, vanMat);
    van.position.set(-7.5, 1.1, 1.5);
    van.castShadow = true;
    healthGroup.add(van);

    const sirenGeo = new THREE.CylinderGeometry(0.22, 0.22, 0.35, 12);
    const sirenMat = new THREE.MeshBasicMaterial({ color: 0xef4444 });
    const siren = new THREE.Mesh(sirenGeo, sirenMat);
    siren.position.set(-7.5, 2.25, 1.5);
    healthGroup.add(siren);

    this.landmarkMeshes.set('health_centre', healthGroup);
    this.scene.add(healthGroup);

    this.obstacles.push({
      type: 'box',
      minX: 11.5,
      maxX: 24.5,
      minZ: -7.5,
      maxZ: 4.5,
    });
  }

  private buildMarket() {
    const marketGroup = new THREE.Group();
    marketGroup.position.set(0, 0, 2);

    const stallColors = [0xef4444, 0xf59e0b, 0x10b981, 0x3b82f6];

    for (let i = 0; i < 4; i++) {
      const x = (i % 2 === 0 ? -1 : 1) * 4.2;
      const z = (i < 2 ? -1 : 1) * 3.2;

      const stall = new THREE.Group();
      stall.position.set(x, 0, z);

      const counterGeo = new THREE.BoxGeometry(2.4, 0.95, 1.5);
      const woodMat = new THREE.MeshStandardMaterial({ color: 0x78350f, roughness: 0.8 });
      const counter = new THREE.Mesh(counterGeo, woodMat);
      counter.position.y = 0.48;
      counter.castShadow = true;
      stall.add(counter);

      // Awning
      const canopyGeo = new THREE.ConeGeometry(2.0, 0.9, 4);
      const canopyMat = new THREE.MeshStandardMaterial({ color: stallColors[i], roughness: 0.6 });
      const canopy = new THREE.Mesh(canopyGeo, canopyMat);
      canopy.rotation.y = Math.PI / 4;
      canopy.position.y = 2.25;
      stall.add(canopy);

      marketGroup.add(stall);

      this.obstacles.push({
        type: 'box',
        minX: x - 1.5,
        maxX: x + 1.5,
        minZ: z + 2 - 1.2,
        maxZ: z + 2 + 1.2,
      });
    }

    this.landmarkMeshes.set('market_road', marketGroup);
    this.scene.add(marketGroup);
  }

  private buildResidentialQuarter() {
    const resGroup = new THREE.Group();
    resGroup.position.set(-18, 0, 4);

    const tileTex = this.createTileTexture();
    const houseColors = [0xfef3c7, 0xfde047, 0xfbd5db, 0xe2e8f0, 0xdcfce7];

    for (let i = 0; i < 5; i++) {
      const hx = (i % 2 === 0 ? -4.5 : 4.5);
      const hz = (i - 2) * 4.8;

      const house = new THREE.Group();
      house.position.set(hx, 0, hz);

      const wallGeo = new THREE.BoxGeometry(4.0, 2.6, 3.4);
      const wallMat = new THREE.MeshStandardMaterial({ color: houseColors[i], roughness: 0.75 });
      const walls = new THREE.Mesh(wallGeo, wallMat);
      walls.position.y = 1.3;
      walls.castShadow = true;
      house.add(walls);

      const roofGeo = new THREE.ConeGeometry(3.5, 1.6, 4);
      const roofMat = new THREE.MeshStandardMaterial({ color: 0x9a3412, map: tileTex, roughness: 0.6 });
      const roof = new THREE.Mesh(roofGeo, roofMat);
      roof.rotation.y = Math.PI / 4;
      roof.position.y = 3.2;
      roof.castShadow = true;
      house.add(roof);

      resGroup.add(house);

      this.obstacles.push({
        type: 'box',
        minX: -18 + hx - 2.2,
        maxX: -18 + hx + 2.2,
        minZ: 4 + hz - 2.0,
        maxZ: 4 + hz + 2.0,
      });
    }

    this.landmarkMeshes.set('residential_homes', resGroup);
    this.scene.add(resGroup);
  }

  private buildFarms() {
    const farmGroup = new THREE.Group();
    farmGroup.position.set(18, 0, -20);

    for (let r = 0; r < 4; r++) {
      const plotGeo = new THREE.PlaneGeometry(16, 3.0);
      const plotColor = r % 2 === 0 ? 0xeab308 : 0x65a30d;
      const plotMat = new THREE.MeshStandardMaterial({ color: plotColor, roughness: 0.9 });
      const plot = new THREE.Mesh(plotGeo, plotMat);
      plot.rotation.x = -Math.PI / 2;
      plot.position.set(0, 0.03, (r - 1.5) * 3.8);
      plot.receiveShadow = true;
      farmGroup.add(plot);
    }

    this.landmarkMeshes.set('crop_fields', farmGroup);
    this.scene.add(farmGroup);
  }

  private buildSanitationYard() {
    const sanGroup = new THREE.Group();
    sanGroup.position.set(-16, 0, 18);

    const drainTroughGeo = new THREE.BoxGeometry(11, 0.45, 1.6);
    const drainMat = new THREE.MeshStandardMaterial({ color: 0x475569, roughness: 0.8 });
    const drainTrough = new THREE.Mesh(drainTroughGeo, drainMat);
    drainTrough.position.set(0, 0.12, 0);
    sanGroup.add(drainTrough);

    this.landmarkMeshes.set('sanitation_zone', sanGroup);
    this.scene.add(sanGroup);

    this.obstacles.push({
      type: 'box',
      minX: -22.0,
      maxX: -10.0,
      minZ: 16.5,
      maxZ: 20.0,
    });
  }

  private buildVegetationAndProps() {
    const treePositions: [number, number, number][] = [
      [-6, 0, -5],
      [8, 0, -12],
      [-22, 0, -18],
      [12, 0, 10],
      [-10, 0, 8],
      [24, 0, 8],
      [-4, 0, 24],
      [6, 0, 22],
      [14, 0, -14],
      [-24, 0, 12],
    ];

    const trunkMat = new THREE.MeshStandardMaterial({ color: 0x78350f, roughness: 0.9 });
    const foliageColors = [0x15803d, 0x16a34a, 0x22c55e, 0x4ade80];

    treePositions.forEach((pos, idx) => {
      const tree = new THREE.Group();
      tree.position.set(...pos);

      const height = 4.0 + Math.random() * 1.5;
      const trunkGeo = new THREE.CylinderGeometry(0.24, 0.42, height, 10);
      const trunk = new THREE.Mesh(trunkGeo, trunkMat);
      trunk.position.y = height / 2;
      trunk.castShadow = true;
      tree.add(trunk);

      const canopyGeo = new THREE.DodecahedronGeometry(2.5 + Math.random() * 0.8, 1);
      const canopyMat = new THREE.MeshStandardMaterial({ color: foliageColors[idx % foliageColors.length], roughness: 0.8 });
      const canopy = new THREE.Mesh(canopyGeo, canopyMat);
      canopy.position.y = height + 1.4;
      canopy.castShadow = true;
      tree.add(canopy);

      this.scene.add(tree);

      this.obstacles.push({
        type: 'cylinder',
        centerX: pos[0],
        centerZ: pos[2],
        radius: 1.2,
      });
    });

    // Street Lamps with warm glowing point lights
    const lampMat = new THREE.MeshStandardMaterial({ color: 0x334155, metalness: 0.7, roughness: 0.3 });
    const lightMat = new THREE.MeshBasicMaterial({ color: 0xfef08a });

    for (let z of [-18, -6, 6, 18]) {
      const lamp = new THREE.Group();
      lamp.position.set(3.6, 0, z);

      const postGeo = new THREE.CylinderGeometry(0.09, 0.12, 4.4, 8);
      const post = new THREE.Mesh(postGeo, lampMat);
      post.position.y = 2.2;
      lamp.add(post);

      const bulbGeo = new THREE.SphereGeometry(0.32, 12, 12);
      const bulb = new THREE.Mesh(bulbGeo, lightMat.clone());
      bulb.position.set(0, 4.5, 0);
      lamp.add(bulb);
      this.streetLampBulbs.push(bulb);

      const pointLight = new THREE.PointLight(0xfef08a, 0.6, 14);
      pointLight.position.set(0, 4.5, 0);
      lamp.add(pointLight);
      this.streetLights.push(pointLight);

      this.scene.add(lamp);

      this.obstacles.push({
        type: 'cylinder',
        centerX: 3.6,
        centerZ: z,
        radius: 0.6,
      });
    }
  }

  private setupRainSystem() {
    const rainCount = 1200;
    const rainGeo = new THREE.BufferGeometry();
    const positions = new Float32Array(rainCount * 3);

    for (let i = 0; i < rainCount * 3; i += 3) {
      positions[i] = (Math.random() - 0.5) * 90;
      positions[i + 1] = Math.random() * 35;
      positions[i + 2] = (Math.random() - 0.5) * 90;
    }

    rainGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    this.rainPositions = positions;

    const rainMat = new THREE.PointsMaterial({
      color: 0x93c5fd,
      size: 0.22,
      transparent: true,
      opacity: 0.75,
    });

    this.rainParticles = new THREE.Points(rainGeo, rainMat);
    this.rainParticles.visible = false;
    this.scene.add(this.rainParticles);
  }

  public setRain(enabled: boolean) {
    this.isRaining = enabled;
    if (this.rainParticles) {
      this.rainParticles.visible = enabled;
    }
  }

  public setTimeOfDay(
    time: 'day' | 'sunset' | 'night',
    scene: THREE.Scene,
    sunLight: THREE.DirectionalLight,
    ambientLight: THREE.AmbientLight,
    hemiLight: THREE.HemisphereLight
  ) {
    if (time === 'day') {
      scene.background = new THREE.Color(0xcfe6fa);
      if (scene.fog && scene.fog instanceof THREE.FogExp2) {
        scene.fog.color.setHex(0xcfe6fa);
        scene.fog.density = 0.012;
      }
      sunLight.color.setHex(0xfef08a);
      sunLight.intensity = 1.6;
      sunLight.position.set(35, 55, 25);
      ambientLight.color.setHex(0xfff7ed);
      ambientLight.intensity = 0.85;
      hemiLight.color.setHex(0xe0f2fe);
      hemiLight.groundColor.setHex(0x86efac);
      hemiLight.intensity = 0.65;

      this.streetLights.forEach((light) => {
        light.intensity = 0.2;
      });
      this.streetLampBulbs.forEach((bulb) => {
        (bulb.material as THREE.MeshBasicMaterial).color.setHex(0xd1d5db);
      });
    } else if (time === 'sunset') {
      scene.background = new THREE.Color(0xfb923c);
      if (scene.fog && scene.fog instanceof THREE.FogExp2) {
        scene.fog.color.setHex(0xfb923c);
        scene.fog.density = 0.015;
      }
      sunLight.color.setHex(0xf97316);
      sunLight.intensity = 1.3;
      sunLight.position.set(50, 20, 20);
      ambientLight.color.setHex(0xfde68a);
      ambientLight.intensity = 0.6;
      hemiLight.color.setHex(0xfdba74);
      hemiLight.groundColor.setHex(0x78350f);
      hemiLight.intensity = 0.5;

      this.streetLights.forEach((light) => {
        light.intensity = 1.2;
      });
      this.streetLampBulbs.forEach((bulb) => {
        (bulb.material as THREE.MeshBasicMaterial).color.setHex(0xfef08a);
      });
    } else if (time === 'night') {
      scene.background = new THREE.Color(0x030712);
      if (scene.fog && scene.fog instanceof THREE.FogExp2) {
        scene.fog.color.setHex(0x030712);
        scene.fog.density = 0.018;
      }
      sunLight.color.setHex(0x38bdf8);
      sunLight.intensity = 0.25;
      sunLight.position.set(-20, 45, -20);
      ambientLight.color.setHex(0x1e293b);
      ambientLight.intensity = 0.35;
      hemiLight.color.setHex(0x38bdf8);
      hemiLight.groundColor.setHex(0x020617);
      hemiLight.intensity = 0.25;

      this.streetLights.forEach((light) => {
        light.intensity = 2.4;
      });
      this.streetLampBulbs.forEach((bulb) => {
        (bulb.material as THREE.MeshBasicMaterial).color.setHex(0xfef08a);
      });
    }
  }

  public applyProjectUpgrade(project: ProjectOption) {
    if (project.sector === 'water') {
      const tankGroup = this.landmarkMeshes.get('water_tank');
      if (tankGroup) {
        const fountainGeo = new THREE.CylinderGeometry(1.8, 2.2, 0.9, 20);
        const fountainMat = new THREE.MeshStandardMaterial({ color: 0x38bdf8, metalness: 0.2, roughness: 0.3 });
        const fountain = new THREE.Mesh(fountainGeo, fountainMat);
        fountain.position.set(0, 0.45, 4.2);
        fountain.castShadow = true;
        tankGroup.add(fountain);

        const waterSpurtGeo = new THREE.ConeGeometry(0.6, 2.8, 12);
        const waterSpurtMat = new THREE.MeshStandardMaterial({ color: 0xbae6fd, transparent: true, opacity: 0.85 });
        const spurt = new THREE.Mesh(waterSpurtGeo, waterSpurtMat);
        spurt.position.set(0, 2.0, 4.2);
        tankGroup.add(spurt);
      }
    } else if (project.sector === 'education') {
      const schoolGroup = this.landmarkMeshes.get('primary_school');
      if (schoolGroup) {
        const solarGeo = new THREE.BoxGeometry(4.2, 0.15, 6.2);
        const solarMat = new THREE.MeshStandardMaterial({ color: 0x1e3a8a, metalness: 0.8, roughness: 0.2 });
        const solar = new THREE.Mesh(solarGeo, solarMat);
        solar.position.set(4.5, 3.75, 0);
        solar.rotation.z = -0.15;
        schoolGroup.add(solar);
      }
    } else if (project.sector === 'roads') {
      const roadGroup = this.landmarkMeshes.get('panchayat_bhavan');
      if (roadGroup) {
        const asphaltGeo = new THREE.PlaneGeometry(6.6, 74);
        const asphaltMat = new THREE.MeshStandardMaterial({ color: 0x334155, roughness: 0.7 });
        const asphalt = new THREE.Mesh(asphaltGeo, asphaltMat);
        asphalt.rotation.x = -Math.PI / 2;
        asphalt.position.set(0, 0.05, 0);
        roadGroup.add(asphalt);

        for (let s = -32; s <= 32; s += 6) {
          const stripeGeo = new THREE.PlaneGeometry(0.35, 3.2);
          const stripeMat = new THREE.MeshBasicMaterial({ color: 0xffffff });
          const stripe = new THREE.Mesh(stripeGeo, stripeMat);
          stripe.rotation.x = -Math.PI / 2;
          stripe.position.set(0, 0.06, s);
          roadGroup.add(stripe);
        }
      }
    } else if (project.sector === 'sanitation') {
      const sanGroup = this.landmarkMeshes.get('sanitation_zone');
      if (sanGroup) {
        const slabGeo = new THREE.BoxGeometry(11.2, 0.35, 2.0);
        const slabMat = new THREE.MeshStandardMaterial({ color: 0x94a3b8, roughness: 0.6 });
        const slab = new THREE.Mesh(slabGeo, slabMat);
        slab.position.set(0, 0.35, 0);
        sanGroup.add(slab);

        const binColors = [0x16a34a, 0x2563eb, 0xd97706];
        binColors.forEach((col, i) => {
          const binGeo = new THREE.CylinderGeometry(0.38, 0.32, 1.0, 16);
          const binMat = new THREE.MeshStandardMaterial({ color: col, roughness: 0.4 });
          const bin = new THREE.Mesh(binGeo, binMat);
          bin.position.set((i - 1) * 1.3, 0.5, 2.4);
          sanGroup.add(bin);
        });
      }
    } else if (project.sector === 'health') {
      const healthGroup = this.landmarkMeshes.get('health_centre');
      if (healthGroup) {
        const canopyGeo = new THREE.BoxGeometry(6.5, 0.25, 4.5);
        const canopyMat = new THREE.MeshStandardMaterial({ color: 0x38bdf8, roughness: 0.5 });
        const canopy = new THREE.Mesh(canopyGeo, canopyMat);
        canopy.position.set(0, 3.0, 5.8);
        healthGroup.add(canopy);
      }
    }
  }

  public update(time: number) {
    this.animatedElements.forEach((el) => el.update(time));

    // Update Rain Particles
    if (this.isRaining && this.rainParticles && this.rainPositions) {
      const positions = this.rainParticles.geometry.attributes.position.array as Float32Array;
      for (let i = 1; i < positions.length; i += 3) {
        positions[i] -= 0.65;
        if (positions[i] < 0) {
          positions[i] = 35;
        }
      }
      this.rainParticles.geometry.attributes.position.needsUpdate = true;
    }
  }
}
