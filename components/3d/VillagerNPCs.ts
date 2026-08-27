import * as THREE from 'three';
import { NPCS } from '@/data/villageData';
import { VillagerNPC } from '@/types/game';
import { CollisionObstacle } from './Controls';

export class VillagerNPCsManager {
  public scene: THREE.Scene;
  public npcGroups: Map<string, THREE.Group> = new Map();
  public obstacles: CollisionObstacle[] = [];
  private animatedNPCs: {
    group: THREE.Group;
    data: VillagerNPC;
    leftArm: THREE.Object3D;
    rightArm: THREE.Object3D;
    head: THREE.Object3D;
    badge: THREE.Sprite;
  }[] = [];

  constructor(scene: THREE.Scene) {
    this.scene = scene;
    this.spawnNPCs();
  }

  private createBadgeTexture(name: string, role: string, isDiscovered: boolean = false): THREE.CanvasTexture {
    const canvas = document.createElement('canvas');
    canvas.width = 256;
    canvas.height = 128;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.fillStyle = isDiscovered ? 'rgba(30, 58, 138, 0.92)' : 'rgba(234, 88, 12, 0.95)';
      ctx.beginPath();
      ctx.roundRect(10, 16, 236, 96, 24);
      ctx.fill();

      ctx.lineWidth = 4;
      ctx.strokeStyle = '#ffffff';
      ctx.stroke();

      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 24px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(name, 128, 56);

      ctx.fillStyle = '#fef08a';
      ctx.font = '18px sans-serif';
      ctx.fillText(`💬 [E] Talk • ${role}`, 128, 86);
    }
    const texture = new THREE.CanvasTexture(canvas);
    return texture;
  }

  private spawnNPCs() {
    NPCS.forEach((npc) => {
      const npcGroup = new THREE.Group();
      npcGroup.position.set(...npc.position);
      npcGroup.name = `npc_${npc.id}`;

      const skinMat = new THREE.MeshStandardMaterial({ color: npc.appearance.skinColor, roughness: 0.8 });
      const clothMat = new THREE.MeshStandardMaterial({ color: npc.appearance.shirtColor, roughness: 0.7 });
      const pantsMat = new THREE.MeshStandardMaterial({ color: npc.appearance.pantsColor, roughness: 0.8 });

      // Torso / Kurta / Blouse
      const torsoGeo = new THREE.BoxGeometry(0.7, 0.92, 0.46);
      const torso = new THREE.Mesh(torsoGeo, clothMat);
      torso.position.y = 1.15;
      torso.castShadow = true;
      torso.receiveShadow = true;
      npcGroup.add(torso);

      // Head
      const headGroup = new THREE.Group();
      headGroup.position.set(0, 1.85, 0);

      const headGeo = new THREE.SphereGeometry(0.3, 16, 14);
      const head = new THREE.Mesh(headGeo, skinMat);
      head.castShadow = true;
      headGroup.add(head);

      // Headwear / Turban
      if (npc.appearance.turbanColor) {
        const turbanGeo = new THREE.TorusGeometry(0.32, 0.14, 10, 20);
        const turbanMat = new THREE.MeshStandardMaterial({ color: npc.appearance.turbanColor, roughness: 0.6 });
        const turban = new THREE.Mesh(turbanGeo, turbanMat);
        turban.rotation.x = Math.PI / 2;
        turban.position.y = 0.12;
        turban.castShadow = true;
        headGroup.add(turban);
      } else {
        const hairGeo = new THREE.SphereGeometry(0.32, 12, 10, 0, Math.PI * 2, 0, Math.PI / 2);
        const hairMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.9 });
        const hair = new THREE.Mesh(hairGeo, hairMat);
        hair.position.y = 0.05;
        headGroup.add(hair);
      }
      npcGroup.add(headGroup);

      // Arms
      const armGeo = new THREE.BoxGeometry(0.18, 0.65, 0.2);
      const leftArm = new THREE.Mesh(armGeo, clothMat);
      leftArm.position.set(-0.48, 1.15, 0);
      leftArm.castShadow = true;
      npcGroup.add(leftArm);

      const rightArm = new THREE.Mesh(armGeo, clothMat);
      rightArm.position.set(0.48, 1.15, 0);
      rightArm.castShadow = true;
      npcGroup.add(rightArm);

      // Legs / Sari
      if (npc.appearance.gender === 'female' && npc.appearance.sariColor) {
        const sariGeo = new THREE.CylinderGeometry(0.38, 0.5, 0.92, 16);
        const sariMat = new THREE.MeshStandardMaterial({ color: npc.appearance.sariColor, roughness: 0.7 });
        const sari = new THREE.Mesh(sariGeo, sariMat);
        sari.position.y = 0.46;
        sari.castShadow = true;
        npcGroup.add(sari);
      } else {
        for (let lx of [-0.18, 0.18]) {
          const legGeo = new THREE.BoxGeometry(0.24, 0.85, 0.24);
          const leg = new THREE.Mesh(legGeo, pantsMat);
          leg.position.set(lx, 0.42, 0);
          leg.castShadow = true;
          npcGroup.add(leg);
        }
      }

      // Overhead Floating Interactive Badge Sprite
      const badgeTexture = this.createBadgeTexture(npc.name, npc.role, false);
      const spriteMat = new THREE.SpriteMaterial({ map: badgeTexture, depthTest: false, transparent: true });
      const badge = new THREE.Sprite(spriteMat);
      badge.position.set(0, 2.7, 0);
      badge.scale.set(3.2, 1.6, 1);
      npcGroup.add(badge);

      this.npcGroups.set(npc.id, npcGroup);
      this.scene.add(npcGroup);

      // Solid Collision Obstacle around NPC
      this.obstacles.push({
        type: 'cylinder',
        centerX: npc.position[0],
        centerZ: npc.position[2],
        radius: 0.9,
      });

      this.animatedNPCs.push({
        group: npcGroup,
        data: npc,
        leftArm,
        rightArm,
        head: headGroup,
        badge,
      });
    });
  }

  public updateBadgeState(npcId: string, isDiscovered: boolean) {
    const item = this.animatedNPCs.find((n) => n.data.id === npcId);
    if (item) {
      const newTex = this.createBadgeTexture(item.data.name, item.data.role, isDiscovered);
      item.badge.material.map = newTex;
      item.badge.material.needsUpdate = true;
    }
  }

  public update(time: number, isProjectCompleted: boolean = false) {
    this.animatedNPCs.forEach((npc, idx) => {
      const offset = idx * 1.3;
      npc.head.position.y = 1.85 + Math.sin(time * 2 + offset) * 0.03;
      npc.badge.position.y = 2.7 + Math.sin(time * 2.5 + offset) * 0.08;

      if (isProjectCompleted) {
        npc.group.position.y = Math.abs(Math.sin(time * 4 + offset)) * 0.35;
        npc.rightArm.rotation.z = Math.PI * 0.8 + Math.sin(time * 6 + offset) * 0.3;
        npc.leftArm.rotation.z = -Math.PI * 0.8 - Math.sin(time * 6 + offset) * 0.3;
      } else {
        npc.group.position.y = 0;
        npc.rightArm.rotation.x = Math.sin(time * 1.5 + offset) * 0.12;
        npc.leftArm.rotation.x = -Math.sin(time * 1.5 + offset) * 0.12;
      }
    });
  }
}
