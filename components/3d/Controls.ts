import * as THREE from 'three';
import { CameraMode } from '@/types/game';

export interface InteractionTarget {
  type: 'npc' | 'landmark';
  id: string;
  name: string;
  distance: number;
}

export interface CollisionObstacle {
  type: 'box' | 'cylinder';
  minX?: number;
  maxX?: number;
  minZ?: number;
  maxZ?: number;
  centerX?: number;
  centerZ?: number;
  radius?: number;
}

export class PlayerController {
  public playerMesh: THREE.Group;
  public camera: THREE.PerspectiveCamera;
  public cameraMode: CameraMode = 'walk';
  public position: THREE.Vector3 = new THREE.Vector3(0, 0, 8);
  public rotationY: number = 0;

  // Zoom & Camera Angle Controls
  public cameraDistance: number = 9.5;
  public minDistance: number = 3.5;
  public maxDistance: number = 45.0;

  private leftLeg!: THREE.Mesh;
  private rightLeg!: THREE.Mesh;
  private leftArm!: THREE.Mesh;
  private rightArm!: THREE.Mesh;
  private walkCycle: number = 0;
  public isMoving: boolean = false;

  private obstacles: CollisionObstacle[] = [];

  private keys = {
    forward: false,
    backward: false,
    left: false,
    right: false,
    run: false,
  };

  private touchInput = {
    x: 0,
    y: 0,
  };

  private isPointerDown: boolean = false;
  private prevMouseX: number = 0;
  private prevMouseY: number = 0;
  public cameraPitch: number = 0.28;
  public cameraYaw: number = 0;
  private touchPinchDist: number = 0;

  public onInteractCallback?: (target: InteractionTarget) => void;

  constructor(camera: THREE.PerspectiveCamera, scene: THREE.Scene) {
    this.camera = camera;
    this.playerMesh = this.createPlayerMesh();
    this.playerMesh.position.copy(this.position);
    scene.add(this.playerMesh);

    this.bindEvents();
  }

  public setObstacles(obs: CollisionObstacle[]) {
    this.obstacles = obs;
  }

  public zoomIn(delta = 2.0) {
    this.cameraDistance = Math.max(this.minDistance, this.cameraDistance - delta);
  }

  public zoomOut(delta = 2.0) {
    this.cameraDistance = Math.min(this.maxDistance, this.cameraDistance + delta);
  }

  public setZoom(distance: number) {
    this.cameraDistance = Math.max(this.minDistance, Math.min(this.maxDistance, distance));
  }

  public setCameraMode(mode: CameraMode) {
    this.cameraMode = mode;
    if (mode === 'first_person') {
      this.playerMesh.visible = false;
      this.cameraPitch = 0.05;
    } else if (mode === 'top_down') {
      this.playerMesh.visible = true;
      this.cameraDistance = 32.0;
    } else if (mode === 'isometric') {
      this.playerMesh.visible = true;
      this.cameraDistance = 22.0;
    } else {
      this.playerMesh.visible = true;
      this.cameraDistance = 9.5;
    }
  }

  private createPlayerMesh(): THREE.Group {
    const group = new THREE.Group();
    group.name = 'player_avatar';

    const torsoGeo = new THREE.BoxGeometry(0.68, 0.9, 0.44);
    const clothMat = new THREE.MeshStandardMaterial({
      color: 0x1e3a8a,
      roughness: 0.65,
      metalness: 0.15,
    });
    const torso = new THREE.Mesh(torsoGeo, clothMat);
    torso.position.y = 1.15;
    torso.castShadow = true;
    torso.receiveShadow = true;
    group.add(torso);

    const collarGeo = new THREE.BoxGeometry(0.72, 0.12, 0.46);
    const collarMat = new THREE.MeshStandardMaterial({ color: 0xd97706, roughness: 0.6 });
    const collar = new THREE.Mesh(collarGeo, collarMat);
    collar.position.y = 1.55;
    group.add(collar);

    const headGeo = new THREE.SphereGeometry(0.3, 16, 14);
    const skinMat = new THREE.MeshStandardMaterial({ color: 0xb47b4a, roughness: 0.8 });
    const head = new THREE.Mesh(headGeo, skinMat);
    head.position.y = 1.85;
    head.castShadow = true;
    group.add(head);

    const hairGeo = new THREE.SphereGeometry(0.32, 12, 10, 0, Math.PI * 2, 0, Math.PI / 2);
    const hairMat = new THREE.MeshStandardMaterial({ color: 0x0f172a, roughness: 0.9 });
    const hair = new THREE.Mesh(hairGeo, hairMat);
    hair.position.y = 1.9;
    group.add(hair);

    const armGeo = new THREE.BoxGeometry(0.18, 0.65, 0.2);
    this.leftArm = new THREE.Mesh(armGeo, clothMat);
    this.leftArm.position.set(-0.46, 1.15, 0);
    this.leftArm.castShadow = true;
    group.add(this.leftArm);

    this.rightArm = new THREE.Mesh(armGeo, clothMat);
    this.rightArm.position.set(0.46, 1.15, 0);
    this.rightArm.castShadow = true;
    group.add(this.rightArm);

    const pantsMat = new THREE.MeshStandardMaterial({ color: 0xf8fafc, roughness: 0.85 });
    const legGeo = new THREE.BoxGeometry(0.22, 0.82, 0.22);

    this.leftLeg = new THREE.Mesh(legGeo, pantsMat);
    this.leftLeg.position.set(-0.16, 0.41, 0);
    this.leftLeg.castShadow = true;
    group.add(this.leftLeg);

    this.rightLeg = new THREE.Mesh(legGeo, pantsMat);
    this.rightLeg.position.set(0.16, 0.41, 0);
    this.rightLeg.castShadow = true;
    group.add(this.rightLeg);

    const ringGeo = new THREE.RingGeometry(0.45, 0.6, 24);
    const ringMat = new THREE.MeshBasicMaterial({ color: 0x38bdf8, side: THREE.DoubleSide, transparent: true, opacity: 0.7 });
    const ring = new THREE.Mesh(ringGeo, ringMat);
    ring.rotation.x = -Math.PI / 2;
    ring.position.y = 0.05;
    group.add(ring);

    return group;
  }

  private bindEvents() {
    if (typeof window === 'undefined') return;

    window.addEventListener('keydown', (e) => {
      const k = e.key.toLowerCase();
      if (k === 'w' || k === 'arrowup') this.keys.forward = true;
      if (k === 's' || k === 'arrowdown') this.keys.backward = true;
      if (k === 'a' || k === 'arrowleft') this.keys.left = true;
      if (k === 'd' || k === 'arrowright') this.keys.right = true;
      if (e.shiftKey) this.keys.run = true;
    });

    window.addEventListener('keyup', (e) => {
      const k = e.key.toLowerCase();
      if (k === 'w' || k === 'arrowup') this.keys.forward = false;
      if (k === 's' || k === 'arrowdown') this.keys.backward = false;
      if (k === 'a' || k === 'arrowleft') this.keys.left = false;
      if (k === 'd' || k === 'arrowright') this.keys.right = false;
      if (!e.shiftKey) this.keys.run = false;
    });

    // Mouse Wheel Zoom In / Out
    window.addEventListener(
      'wheel',
      (e) => {
        if (this.cameraMode === 'first_person') return;
        if (e.deltaY > 0) {
          this.zoomOut(1.8);
        } else {
          this.zoomIn(1.8);
        }
      },
      { passive: true }
    );

    const onPointerDown = (e: MouseEvent | TouchEvent) => {
      this.isPointerDown = true;
      if ('touches' in e) {
        if (e.touches.length === 1) {
          this.prevMouseX = e.touches[0].clientX;
          this.prevMouseY = e.touches[0].clientY;
        } else if (e.touches.length === 2) {
          // Touch pinch start
          const dx = e.touches[0].clientX - e.touches[1].clientX;
          const dy = e.touches[0].clientY - e.touches[1].clientY;
          this.touchPinchDist = Math.hypot(dx, dy);
        }
      } else {
        this.prevMouseX = e.clientX;
        this.prevMouseY = e.clientY;
      }
    };

    const onPointerMove = (e: MouseEvent | TouchEvent) => {
      if (!this.isPointerDown) return;
      if ('touches' in e) {
        if (e.touches.length === 1) {
          const clientX = e.touches[0].clientX;
          const clientY = e.touches[0].clientY;
          const deltaX = clientX - this.prevMouseX;
          const deltaY = clientY - this.prevMouseY;
          this.prevMouseX = clientX;
          this.prevMouseY = clientY;

          this.cameraYaw -= deltaX * 0.005;
          this.cameraPitch = Math.max(0.02, Math.min(1.2, this.cameraPitch + deltaY * 0.003));
        } else if (e.touches.length === 2) {
          // Touch pinch zoom
          const dx = e.touches[0].clientX - e.touches[1].clientX;
          const dy = e.touches[0].clientY - e.touches[1].clientY;
          const dist = Math.hypot(dx, dy);
          const diff = dist - this.touchPinchDist;
          this.touchPinchDist = dist;
          if (diff > 0) this.zoomIn(0.5);
          else this.zoomOut(0.5);
        }
      } else {
        const deltaX = e.clientX - this.prevMouseX;
        const deltaY = e.clientY - this.prevMouseY;
        this.prevMouseX = e.clientX;
        this.prevMouseY = e.clientY;

        this.cameraYaw -= deltaX * 0.005;
        this.cameraPitch = Math.max(0.02, Math.min(1.2, this.cameraPitch + deltaY * 0.003));
      }
    };

    const onPointerUp = () => {
      this.isPointerDown = false;
    };

    window.addEventListener('mousedown', onPointerDown);
    window.addEventListener('mousemove', onPointerMove);
    window.addEventListener('mouseup', onPointerUp);
    window.addEventListener('touchstart', onPointerDown, { passive: true });
    window.addEventListener('touchmove', onPointerMove, { passive: true });
    window.addEventListener('touchend', onPointerUp);
  }

  public setTouchJoystick(x: number, y: number) {
    this.touchInput.x = x;
    this.touchInput.y = y;
  }

  public teleportTo(x: number, z: number) {
    this.position.set(x, 0, z);
    this.playerMesh.position.copy(this.position);
  }

  private checkCollision(newX: number, newZ: number, playerRadius = 0.55): boolean {
    for (const obs of this.obstacles) {
      if (obs.type === 'box') {
        if (
          newX + playerRadius > (obs.minX ?? -Infinity) &&
          newX - playerRadius < (obs.maxX ?? Infinity) &&
          newZ + playerRadius > (obs.minZ ?? -Infinity) &&
          newZ - playerRadius < (obs.maxZ ?? Infinity)
        ) {
          return true;
        }
      } else if (obs.type === 'cylinder') {
        const dx = newX - (obs.centerX ?? 0);
        const dz = newZ - (obs.centerZ ?? 0);
        const distSq = dx * dx + dz * dz;
        const combinedR = (obs.radius ?? 1) + playerRadius;
        if (distSq < combinedR * combinedR) {
          return true;
        }
      }
    }
    return false;
  }

  public update(
    delta: number,
    npcTargets: { id: string; name: string; position: THREE.Vector3 }[],
    landmarkTargets: { id: string; name: string; position: THREE.Vector3 }[]
  ): InteractionTarget | null {
    const moveSpeed = (this.keys.run ? 13 : 7.5) * delta;
    const moveVector = new THREE.Vector3();

    if (this.keys.forward) moveVector.z -= 1;
    if (this.keys.backward) moveVector.z += 1;
    if (this.keys.left) moveVector.x -= 1;
    if (this.keys.right) moveVector.x += 1;

    if (Math.abs(this.touchInput.x) > 0.1 || Math.abs(this.touchInput.y) > 0.1) {
      moveVector.x += this.touchInput.x;
      moveVector.z += this.touchInput.y;
    }

    this.isMoving = moveVector.lengthSq() > 0;

    if (this.isMoving) {
      moveVector.normalize();
      moveVector.applyAxisAngle(new THREE.Vector3(0, 1, 0), this.cameraYaw);

      const nextX = Math.max(-42, Math.min(42, this.position.x + moveVector.x * moveSpeed));
      if (!this.checkCollision(nextX, this.position.z)) {
        this.position.x = nextX;
      }

      const nextZ = Math.max(-42, Math.min(42, this.position.z + moveVector.z * moveSpeed));
      if (!this.checkCollision(this.position.x, nextZ)) {
        this.position.z = nextZ;
      }

      this.rotationY = Math.atan2(moveVector.x, moveVector.z);
      this.playerMesh.rotation.y = this.rotationY;

      this.walkCycle += delta * (this.keys.run ? 14 : 9);
      const legAngle = Math.sin(this.walkCycle) * 0.6;
      this.leftLeg.rotation.x = legAngle;
      this.rightLeg.rotation.x = -legAngle;
      this.leftArm.rotation.x = -legAngle * 0.7;
      this.rightArm.rotation.x = legAngle * 0.7;
    } else {
      this.leftLeg.rotation.x *= 0.8;
      this.rightLeg.rotation.x *= 0.8;
      this.leftArm.rotation.x *= 0.8;
      this.rightArm.rotation.x *= 0.8;
    }

    this.playerMesh.position.copy(this.position);

    // Dynamic Camera Modes
    if (this.cameraMode === 'first_person') {
      // Eye-level First Person
      const eyeX = this.position.x;
      const eyeY = this.position.y + 1.8;
      const eyeZ = this.position.z;
      this.camera.position.set(eyeX, eyeY, eyeZ);

      const lookTarget = new THREE.Vector3(
        eyeX - Math.sin(this.cameraYaw) * Math.cos(this.cameraPitch),
        eyeY - Math.sin(this.cameraPitch),
        eyeZ - Math.cos(this.cameraYaw) * Math.cos(this.cameraPitch)
      );
      this.camera.lookAt(lookTarget);
    } else if (this.cameraMode === 'top_down') {
      // 90-degree Aerial Top-Down
      const topPos = new THREE.Vector3(this.position.x, this.cameraDistance + 10, this.position.z + 0.1);
      this.camera.position.lerp(topPos, 0.1);
      this.camera.lookAt(this.position.x, 0, this.position.z);
    } else if (this.cameraMode === 'isometric') {
      // 45-degree High Isometric
      const targetPos = new THREE.Vector3(
        this.position.x + this.cameraDistance * 0.7,
        this.cameraDistance * 0.85,
        this.position.z + this.cameraDistance * 0.7
      );
      this.camera.position.lerp(targetPos, 0.08);
      this.camera.lookAt(this.position.x, 1.2, this.position.z);
    } else if (this.cameraMode === 'cinematic') {
      // Auto Orbit Cinematic
      this.cameraYaw += delta * 0.2;
      const camX = this.position.x + Math.sin(this.cameraYaw) * this.cameraDistance;
      const camZ = this.position.z + Math.cos(this.cameraYaw) * this.cameraDistance;
      const camY = this.position.y + this.cameraDistance * 0.45;
      this.camera.position.lerp(new THREE.Vector3(camX, camY, camZ), 0.08);
      this.camera.lookAt(this.position.x, this.position.y + 1.5, this.position.z);
    } else {
      // Standard 3rd Person Follow with Zoom & Pitch Tilt
      const dist = this.cameraDistance;
      const camHeight = dist * Math.sin(this.cameraPitch) + 1.8;
      const horizontalDist = dist * Math.cos(this.cameraPitch);

      const camX = this.position.x + Math.sin(this.cameraYaw) * horizontalDist;
      const camZ = this.position.z + Math.cos(this.cameraYaw) * horizontalDist;
      const camY = this.position.y + camHeight;

      this.camera.position.lerp(new THREE.Vector3(camX, camY, camZ), 0.12);
      this.camera.lookAt(this.position.x, this.position.y + 1.6, this.position.z);
    }

    // Detect Nearest Interactive Target
    let closestTarget: InteractionTarget | null = null;
    let minDistance = Infinity;

    for (const npc of npcTargets) {
      const dist = this.position.distanceTo(npc.position);
      if (dist <= 3.8 && dist < minDistance) {
        minDistance = dist;
        closestTarget = { type: 'npc', id: npc.id, name: npc.name, distance: dist };
      }
    }

    if (!closestTarget) {
      for (const lm of landmarkTargets) {
        const dist = this.position.distanceTo(lm.position);
        if (dist <= 5.5 && dist < minDistance) {
          minDistance = dist;
          closestTarget = { type: 'landmark', id: lm.id, name: lm.name, distance: dist };
        }
      }
    }

    return closestTarget;
  }
}
