'use client';

import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { VillageWorld } from './VillageWorld';
import { VillagerNPCsManager } from './VillagerNPCs';
import { PlayerController, InteractionTarget } from './Controls';
import { LANDMARKS, NPCS } from '@/data/villageData';
import { CameraMode, ProjectOption } from '@/types/game';
import { soundEngine } from '@/components/ui/AudioController';
import {
  Compass,
  Eye,
  MapPin,
  MessageSquare,
  ZoomIn,
  ZoomOut,
  Camera,
  RotateCcw,
  Layers,
  Video,
} from 'lucide-react';

interface VillageCanvasProps {
  cameraMode: CameraMode;
  onChangeCameraMode: (mode: CameraMode) => void;
  onSelectNPC: (npcId: string) => void;
  onSelectLandmark: (landmarkId: string) => void;
  selectedProject: ProjectOption | null;
  isProjectCompleted: boolean;
  discoveredNeeds: string[];
  teleportTarget: [number, number] | null;
  onClearTeleport: () => void;
}

export const VillageCanvas: React.FC<VillageCanvasProps> = ({
  cameraMode,
  onChangeCameraMode,
  onSelectNPC,
  onSelectLandmark,
  selectedProject,
  isProjectCompleted,
  discoveredNeeds,
  teleportTarget,
  onClearTeleport,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [activeTarget, setActiveTarget] = useState<InteractionTarget | null>(null);

  const worldRef = useRef<VillageWorld | null>(null);
  const npcManagerRef = useRef<VillagerNPCsManager | null>(null);
  const controllerRef = useRef<PlayerController | null>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    // Setup Scene
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0xcfe6fa);
    scene.fog = new THREE.FogExp2(0xcfe6fa, 0.012);

    // Camera
    const camera = new THREE.PerspectiveCamera(
      45,
      containerRef.current.clientWidth / containerRef.current.clientHeight,
      0.1,
      300
    );
    camera.position.set(0, 8, 18);

    // Renderer
    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      powerPreference: 'high-performance',
      alpha: false,
    });
    renderer.setSize(containerRef.current.clientWidth, containerRef.current.clientHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.15;

    containerRef.current.appendChild(renderer.domElement);

    // Enhanced Realistic Sun & Atmospheric Lighting
    const ambientLight = new THREE.AmbientLight(0xfff7ed, 0.85);
    scene.add(ambientLight);

    const hemiLight = new THREE.HemisphereLight(0xe0f2fe, 0x86efac, 0.65);
    scene.add(hemiLight);

    const sunLight = new THREE.DirectionalLight(0xfef08a, 1.6);
    sunLight.position.set(35, 55, 25);
    sunLight.castShadow = true;
    sunLight.shadow.mapSize.width = 2048;
    sunLight.shadow.mapSize.height = 2048;
    sunLight.shadow.camera.near = 10;
    sunLight.shadow.camera.far = 130;
    sunLight.shadow.camera.left = -55;
    sunLight.shadow.camera.right = 55;
    sunLight.shadow.camera.top = 55;
    sunLight.shadow.camera.bottom = -55;
    sunLight.shadow.bias = -0.0005;
    scene.add(sunLight);

    const fillLight = new THREE.DirectionalLight(0xbae6fd, 0.45);
    fillLight.position.set(-30, 25, -30);
    scene.add(fillLight);

    // Floating Atmospheric Dust Motes
    const particleCount = 120;
    const particleGeo = new THREE.BufferGeometry();
    const particlePositions = new Float32Array(particleCount * 3);

    for (let p = 0; p < particleCount * 3; p += 3) {
      particlePositions[p] = (Math.random() - 0.5) * 80;
      particlePositions[p + 1] = Math.random() * 12 + 0.5;
      particlePositions[p + 2] = (Math.random() - 0.5) * 80;
    }

    particleGeo.setAttribute('position', new THREE.BufferAttribute(particlePositions, 3));
    const particleMat = new THREE.PointsMaterial({
      color: 0xfef08a,
      size: 0.25,
      transparent: true,
      opacity: 0.6,
    });
    const particles = new THREE.Points(particleGeo, particleMat);
    scene.add(particles);

    // Initialize World, NPCs, Controller
    const world = new VillageWorld(scene);
    const npcs = new VillagerNPCsManager(scene);
    const controller = new PlayerController(camera, scene);

    const allObstacles = [...world.obstacles, ...npcs.obstacles];
    controller.setObstacles(allObstacles);

    worldRef.current = world;
    npcManagerRef.current = npcs;
    controllerRef.current = controller;

    if (isProjectCompleted && selectedProject) {
      world.applyProjectUpgrade(selectedProject);
    }

    const npcPoints = NPCS.map((n) => ({
      id: n.id,
      name: n.name,
      position: new THREE.Vector3(...n.position),
    }));

    const landmarkPoints = LANDMARKS.map((l) => ({
      id: l.id,
      name: l.name,
      position: new THREE.Vector3(...l.position),
    }));

    // Animation Loop
    let clock = new THREE.Clock();
    let animId: number;

    const animate = () => {
      animId = requestAnimationFrame(animate);
      const delta = clock.getDelta();
      const time = clock.getElapsedTime();

      world.update(time);
      npcs.update(time, isProjectCompleted);

      const positions = particleGeo.attributes.position.array as Float32Array;
      for (let i = 1; i < positions.length; i += 3) {
        positions[i] += Math.sin(time + i) * 0.005;
      }
      particleGeo.attributes.position.needsUpdate = true;

      const target = controller.update(delta, npcPoints, landmarkPoints);
      setActiveTarget(target);

      renderer.render(scene, camera);
    };

    animate();

    const handleResize = () => {
      if (!containerRef.current) return;
      const width = containerRef.current.clientWidth;
      const height = containerRef.current.clientHeight;
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      renderer.setSize(width, height);
    };

    window.addEventListener('resize', handleResize);

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', handleResize);
      renderer.dispose();
      if (containerRef.current && renderer.domElement) {
        containerRef.current.removeChild(renderer.domElement);
      }
    };
  }, []);

  useEffect(() => {
    if (controllerRef.current) {
      controllerRef.current.setCameraMode(cameraMode);
    }
  }, [cameraMode]);

  useEffect(() => {
    if (isProjectCompleted && selectedProject && worldRef.current) {
      worldRef.current.applyProjectUpgrade(selectedProject);
    }
  }, [isProjectCompleted, selectedProject]);

  useEffect(() => {
    if (teleportTarget && controllerRef.current) {
      controllerRef.current.teleportTo(teleportTarget[0], teleportTarget[1]);
      onClearTeleport();
    }
  }, [teleportTarget, onClearTeleport]);

  const handleInteract = () => {
    if (!activeTarget) return;
    soundEngine.playClick();
    if (activeTarget.type === 'npc') {
      onSelectNPC(activeTarget.id);
    } else {
      onSelectLandmark(activeTarget.id);
    }
  };

  const handleZoomIn = () => {
    soundEngine.playClick();
    if (controllerRef.current) controllerRef.current.zoomIn(3.0);
  };

  const handleZoomOut = () => {
    soundEngine.playClick();
    if (controllerRef.current) controllerRef.current.zoomOut(3.0);
  };

  const handleResetCamera = () => {
    soundEngine.playClick();
    if (controllerRef.current) {
      controllerRef.current.cameraYaw = 0;
      controllerRef.current.cameraPitch = 0.28;
      controllerRef.current.cameraDistance = 9.5;
    }
  };

  return (
    <div className="relative w-full h-full overflow-hidden select-none bg-slate-900">
      <div ref={containerRef} className="w-full h-full cursor-grab active:cursor-grabbing" />

      {/* Camera Angles & Zoom Control Floating Widget */}
      <div className="absolute top-20 right-4 z-30 flex flex-col items-end gap-2">
        {/* Preset Angle Buttons */}
        <div className="flex flex-wrap items-center justify-end gap-1.5 p-1.5 bg-slate-900/85 backdrop-blur-md rounded-2xl border border-slate-700/80 shadow-2xl">
          <CameraPresetBtn
            label="3rd Person"
            icon={<Camera className="w-3.5 h-3.5" />}
            active={cameraMode === 'walk'}
            onClick={() => {
              soundEngine.playClick();
              onChangeCameraMode('walk');
            }}
          />
          <CameraPresetBtn
            label="1st Person"
            icon={<Eye className="w-3.5 h-3.5" />}
            active={cameraMode === 'first_person'}
            onClick={() => {
              soundEngine.playClick();
              onChangeCameraMode('first_person');
            }}
          />
          <CameraPresetBtn
            label="Isometric"
            icon={<Layers className="w-3.5 h-3.5" />}
            active={cameraMode === 'isometric'}
            onClick={() => {
              soundEngine.playClick();
              onChangeCameraMode('isometric');
            }}
          />
          <CameraPresetBtn
            label="Top-Down"
            icon={<Compass className="w-3.5 h-3.5" />}
            active={cameraMode === 'top_down'}
            onClick={() => {
              soundEngine.playClick();
              onChangeCameraMode('top_down');
            }}
          />
          <CameraPresetBtn
            label="Cinematic"
            icon={<Video className="w-3.5 h-3.5" />}
            active={cameraMode === 'cinematic'}
            onClick={() => {
              soundEngine.playClick();
              onChangeCameraMode('cinematic');
            }}
          />
        </div>

        {/* Zoom In, Zoom Out & Reset Floating Buttons */}
        <div className="flex items-center gap-1.5 p-1.5 bg-slate-900/85 backdrop-blur-md rounded-2xl border border-slate-700/80 shadow-2xl">
          <button
            onClick={handleZoomIn}
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-750 text-slate-200 hover:text-amber-400 border border-slate-700 text-xs font-bold transition-all flex items-center gap-1"
            title="Zoom In (or scroll wheel up)"
          >
            <ZoomIn className="w-4 h-4" />
            <span className="hidden sm:inline text-[11px]">Zoom In</span>
          </button>

          <button
            onClick={handleZoomOut}
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-750 text-slate-200 hover:text-amber-400 border border-slate-700 text-xs font-bold transition-all flex items-center gap-1"
            title="Zoom Out (or scroll wheel down)"
          >
            <ZoomOut className="w-4 h-4" />
            <span className="hidden sm:inline text-[11px]">Zoom Out</span>
          </button>

          <button
            onClick={handleResetCamera}
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-750 text-slate-400 hover:text-white border border-slate-700 transition-all"
            title="Reset Camera Angle & Distance"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Floating Interaction Prompt */}
      {activeTarget && (
        <div className="absolute bottom-28 left-1/2 -translate-x-1/2 z-30 animate-bounce">
          <button
            onClick={handleInteract}
            className="flex items-center gap-3 px-6 py-3 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-lg rounded-full shadow-glow border-2 border-white transition-all transform hover:scale-105 active:scale-95"
          >
            {activeTarget.type === 'npc' ? (
              <MessageSquare className="w-6 h-6 animate-pulse" />
            ) : (
              <MapPin className="w-6 h-6 text-slate-950" />
            )}
            <span>
              Press <kbd className="px-2 py-0.5 bg-slate-900 text-white rounded text-sm mx-1">E</kbd> or Click to{' '}
              {activeTarget.type === 'npc' ? `Talk to ${activeTarget.name}` : `Inspect ${activeTarget.name}`}
            </span>
          </button>
        </div>
      )}

      {/* Control overlay hint */}
      <div className="absolute bottom-4 left-4 z-20 hidden md:flex items-center gap-2 bg-slate-900/80 backdrop-blur-md px-3.5 py-2 rounded-xl border border-white/20 text-xs text-slate-200">
        <Compass className="w-4 h-4 text-sky-400" />
        <span>
          <strong className="text-amber-400">WASD</strong> Move •{' '}
          <strong className="text-sky-400">Mouse Drag</strong> Rotate/Tilt •{' '}
          <strong className="text-purple-400">Scroll Wheel / Buttons</strong> Zoom In/Out •{' '}
          <strong className="text-emerald-400">E</strong> Interact
        </span>
      </div>
    </div>
  );
};

const CameraPresetBtn: React.FC<{
  label: string;
  icon: React.ReactNode;
  active: boolean;
  onClick: () => void;
}> = ({ label, icon, active, onClick }) => {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs font-semibold border transition-all ${
        active
          ? 'bg-amber-500 text-slate-950 border-amber-400 font-bold shadow-glow'
          : 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-750 hover:text-white'
      }`}
    >
      {icon}
      <span className="hidden md:inline text-[11px]">{label}</span>
    </button>
  );
};
