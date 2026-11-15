'use client';

import React, { Suspense, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  Box,
  Camera,
  Cpu,
  Download,
  Eye,
  Flame,
  Layers,
  Maximize2,
  Play,
  RefreshCw,
  RotateCcw,
  Sliders,
  Sparkles,
  Sun,
  Upload,
} from 'lucide-react';

export const CHARACTER_ROSTER = [
  {
    id: 'char-kaelen',
    name: 'Kaelen // Cyber-Ronin',
    role: 'Vanguard Striker · Episode 1 Lead',
    polyCount: '28.4K Tris (Draco)',
    textureFormat: 'KTX2 UASTC · 2048px',
    primaryColor: '#E50914',
    secondaryColor: '#38bdf8',
    visorColor: '#f59e0b',
    defaultMorphs: { visorGlow: 0.85, auraIntensity: 0.65, bladeCharge: 0.9, headPitch: 0.0 },
    glbUrl: '/models/kaelen.opt.glb',
  },
  {
    id: 'char-nyx',
    name: 'Nyx // Void Valkyrie',
    role: 'Chrono Assassin · Webtoon Arc II',
    polyCount: '24.1K Tris (Draco)',
    textureFormat: 'WebP + Meshopt · 2048px',
    primaryColor: '#a855f7',
    secondaryColor: '#ec4899',
    visorColor: '#22d3ee',
    defaultMorphs: { visorGlow: 0.95, auraIntensity: 0.8, bladeCharge: 0.75, headPitch: 0.05 },
    glbUrl: '/models/nyx.opt.glb',
  },
  {
    id: 'char-vex',
    name: 'Vex // Mecha Titan',
    role: 'Heavy Enforcer · AMG VIP Exclusive',
    polyCount: '34.8K Tris (Draco)',
    textureFormat: 'KTX2 ETC1S · 2048px',
    primaryColor: '#f59e0b',
    secondaryColor: '#10b981',
    visorColor: '#ef4444',
    defaultMorphs: { visorGlow: 0.75, auraIntensity: 0.9, bladeCharge: 0.6, headPitch: -0.05 },
    glbUrl: '/models/vex.opt.glb',
  },
];

const ANIMATION_STATES = [
  { id: 'idle', label: 'Idle Breathe', speed: 1.0 },
  { id: 'combat', label: 'Combat Stance', speed: 1.8 },
  { id: 'victory', label: 'Heroic Pose', speed: 0.6 },
  { id: 'overload', label: 'Cyber Burst', speed: 2.6 },
];

const LIGHTING_PRESETS = [
  {
    id: 'studio',
    label: '3-Point Studio',
    keyColor: '#fff7ed',
    fillColor: '#38bdf8',
    rimColor: '#E50914',
    ambient: 0.45,
  },
  {
    id: 'neon',
    label: 'Cyberpunk Neon',
    keyColor: '#f43f5e',
    fillColor: '#22d3ee',
    rimColor: '#a855f7',
    ambient: 0.35,
  },
  {
    id: 'moonlight',
    label: 'Noir Rim',
    keyColor: '#93c5fd',
    fillColor: '#1e293b',
    rimColor: '#f59e0b',
    ambient: 0.25,
  },
];

// Clamp helper for polar angle and zoom limits
const clamp = (val, min, max) => Math.max(min, Math.min(max, val));

export default function CharacterStage() {
  const canvasRef = useRef(null);
  const rafRef = useRef(null);
  const dragRef = useRef({ active: false, lastX: 0, lastY: 0 });
  const orbitRef = useRef({
    azimuth: 0.35,
    polar: 1.15, // Clamped between [0.55, 1.52] radians (OrbitControls polar limits)
    distance: 4.2,
    targetAzimuth: 0.35,
    targetPolar: 1.15,
    targetDistance: 4.2,
  });

  const [selectedChar, setSelectedChar] = useState(CHARACTER_ROSTER[0]);
  const [animState, setAnimState] = useState('idle');
  const [lightPreset, setLightPreset] = useState(LIGHTING_PRESETS[0]);
  const [morphs, setMorphs] = useState(CHARACTER_ROSTER[0].defaultMorphs);
  const [autoRotate, setAutoRotate] = useState(true);
  const [wireframe, setWireframe] = useState(false);
  const [customGlbInfo, setCustomGlbInfo] = useState(null);
  const [fps, setFps] = useState(60);

  const selectCharacter = useCallback((char) => {
    setSelectedChar(char);
    setMorphs(char.defaultMorphs);
    setCustomGlbInfo(null);
  }, []);

  const resetCamera = useCallback(() => {
    orbitRef.current.targetAzimuth = 0.35;
    orbitRef.current.targetPolar = 1.15;
    orbitRef.current.targetDistance = 4.2;
  }, []);

  // Inspect uploaded .glb binary header (magic 'glTF', version, byte length, JSON chunk)
  const handleGlbUpload = useCallback((e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      try {
        const buf = ev.target.result;
        const view = new DataView(buf);
        const magic = view.getUint32(0, true);
        const version = view.getUint32(4, true);
        const totalBytes = view.getUint32(8, true);
        const isGlb = magic === 0x46546c67; // 'glTF'
        let jsonSummary = { meshes: 0, animations: 0, materials: 0, extensions: [] };
        if (isGlb && buf.byteLength > 20) {
          const chunkLen = view.getUint32(12, true);
          const chunkType = view.getUint32(16, true);
          if (chunkType === 0x4e4f534a) {
            const jsonBytes = new Uint8Array(buf, 20, Math.min(chunkLen, buf.byteLength - 20));
            const jsonText = new TextDecoder().decode(jsonBytes);
            const parsed = JSON.parse(jsonText);
            jsonSummary = {
              meshes: (parsed.meshes || []).length,
              animations: (parsed.animations || []).length,
              materials: (parsed.materials || []).length,
              extensions: parsed.extensionsUsed || [],
            };
          }
        }
        setCustomGlbInfo({
          name: file.name,
          sizeMB: (file.size / (1024 * 1024)).toFixed(2),
          validGlb: isGlb,
          version,
          totalBytes,
          ...jsonSummary,
        });
      } catch {
        setCustomGlbInfo({ name: file.name, sizeMB: (file.size / (1024 * 1024)).toFixed(2), validGlb: false });
      }
    };
    reader.readAsArrayBuffer(file.slice(0, 256 * 1024));
  }, []);

  // Main 60fps 3D Character Stage Render Loop with DPR=[1, 1.5] cap & full unmount disposal
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return undefined;
    const ctx = canvas.getContext('2d', { alpha: false });
    if (!ctx) return undefined;

    let frameCount = 0;
    let lastFpsTs = performance.now();
    let startTs = performance.now();

    const resize = () => {
      // Cap DPR strictly to [1, 1.5] for mobile GPU/battery savings
      const dpr = clamp(window.devicePixelRatio || 1, 1, 1.5);
      const rect = canvas.getBoundingClientRect();
      canvas.width = Math.max(320, Math.floor(rect.width * dpr));
      canvas.height = Math.max(240, Math.floor(rect.height * dpr));
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();
    window.addEventListener('resize', resize);

    const animObj = ANIMATION_STATES.find((a) => a.id === animState) || ANIMATION_STATES[0];

    const render = (now) => {
      frameCount += 1;
      if (now - lastFpsTs >= 1000) {
        setFps(Math.min(60, Math.round((frameCount * 1000) / (now - lastFpsTs))));
        frameCount = 0;
        lastFpsTs = now;
      }

      const t = ((now - startTs) / 1000) * animObj.speed;
      const orb = orbitRef.current;
      if (autoRotate && !dragRef.current.active) {
        orb.targetAzimuth += 0.0045;
      }
      // Smooth damping
      orb.azimuth += (orb.targetAzimuth - orb.azimuth) * 0.12;
      orb.polar += (orb.targetPolar - orb.polar) * 0.12;
      orb.distance += (orb.targetDistance - orb.distance) * 0.12;

      const w = canvas.clientWidth || 640;
      const h = canvas.clientHeight || 420;
      const cx = w / 2;
      const cy = h * 0.54;
      const scale = (Math.min(w, h) * 0.92) / orb.distance;

      // 1. Studio #090A0F Base Background & Three-Point Light Atmosphere
      ctx.fillStyle = '#090a0f';
      ctx.fillRect(0, 0, w, h);

      const envGrad = ctx.createRadialGradient(cx, cy - 30, 10, cx, cy, Math.max(w, h) * 0.65);
      envGrad.addColorStop(0, `${selectedChar.primaryColor}22`);
      envGrad.addColorStop(0.45, `${lightPreset.fillColor}12`);
      envGrad.addColorStop(1, '#090a0f');
      ctx.fillStyle = envGrad;
      ctx.fillRect(0, 0, w, h);

      // 3D Projection helper with azimuth & polar camera transform
      const cosA = Math.cos(orb.azimuth);
      const sinA = Math.sin(orb.azimuth);
      const cosP = Math.cos(orb.polar - Math.PI / 2);
      const sinP = Math.sin(orb.polar - Math.PI / 2);

      const project = (x, y, z) => {
        const rx = x * cosA - z * sinA;
        const rz = x * sinA + z * cosA;
        const ry = y * cosP - rz * sinP;
        const depth = y * sinP + rz * cosP + 4.5;
        const perspective = 3.6 / Math.max(1.2, depth);
        return {
          x: cx + rx * scale * perspective,
          y: cy - ry * scale * perspective,
          z: depth,
          s: scale * perspective,
        };
      };

      // 2. Contact Shadow & Studio Turntable Grid
      const floorP = project(0, -1.35, 0);
      const shadowGrad = ctx.createRadialGradient(
        floorP.x,
        floorP.y,
        4,
        floorP.x,
        floorP.y,
        floorP.s * 1.45,
      );
      shadowGrad.addColorStop(0, 'rgba(0,0,0,0.88)');
      shadowGrad.addColorStop(0.6, `${selectedChar.primaryColor}28`);
      shadowGrad.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.fillStyle = shadowGrad;
      ctx.beginPath();
      ctx.ellipse(floorP.x, floorP.y, floorP.s * 1.4, floorP.s * 0.42, 0, 0, Math.PI * 2);
      ctx.fill();

      // Turntable rings
      [1.25, 0.92, 0.55].forEach((radius, idx) => {
        ctx.strokeStyle = idx === 0 ? `${selectedChar.primaryColor}66` : 'rgba(255,255,255,0.12)';
        ctx.lineWidth = idx === 0 ? 1.6 : 1;
        ctx.beginPath();
        for (let i = 0; i <= 48; i += 1) {
          const ang = (i / 48) * Math.PI * 2 + t * (idx === 0 ? 0.25 : -0.15);
          const p = project(Math.cos(ang) * radius, -1.35, Math.sin(ang) * radius);
          if (i === 0) ctx.moveTo(p.x, p.y);
          else ctx.lineTo(p.x, p.y);
        }
        ctx.stroke();
      });

      // 3. Hierarchical Articulated 3D Character Rig (with Animation Mixer & Morphs)
      const breathe = Math.sin(t * 2.2) * 0.05;
      const combatBob = animState === 'combat' ? Math.abs(Math.sin(t * 3.2)) * 0.08 : 0;
      const burstPulse = animState === 'overload' ? Math.sin(t * 6.0) * 0.06 : 0;
      const rootY = breathe - combatBob + burstPulse;

      // Energy Aura Morph Target
      if (morphs.auraIntensity > 0.05) {
        const coreP = project(0, 0.1 + rootY, 0);
        const auraR = coreP.s * (0.95 + morphs.auraIntensity * 0.55 + Math.sin(t * 4) * 0.06);
        const auraGrad = ctx.createRadialGradient(coreP.x, coreP.y, 8, coreP.x, coreP.y, auraR);
        auraGrad.addColorStop(0, `${selectedChar.primaryColor}55`);
        auraGrad.addColorStop(0.5, `${selectedChar.secondaryColor}25`);
        auraGrad.addColorStop(1, 'rgba(0,0,0,0)');
        ctx.fillStyle = auraGrad;
        ctx.beginPath();
        ctx.arc(coreP.x, coreP.y, auraR, 0, Math.PI * 2);
        ctx.fill();
      }

      // Helper to draw shaded 3D armor prism segment between two 3D joints
      const drawLimb = (j1, j2, r1, r2, colorHex, rimHex) => {
        const p1 = project(j1[0], j1[1], j1[2]);
        const p2 = project(j2[0], j2[1], j2[2]);
        const dx = p2.x - p1.x;
        const dy = p2.y - p1.y;
        const len = Math.hypot(dx, dy) || 1;
        const nx = -dy / len;
        const ny = dx / len;
        const w1 = r1 * p1.s;
        const w2 = r2 * p2.s;

        ctx.beginPath();
        ctx.moveTo(p1.x + nx * w1, p1.y + ny * w1);
        ctx.lineTo(p2.x + nx * w2, p2.y + ny * w2);
        ctx.lineTo(p2.x - nx * w2, p2.y - ny * w2);
        ctx.lineTo(p1.x - nx * w1, p1.y - ny * w1);
        ctx.closePath();

        if (wireframe) {
          ctx.strokeStyle = selectedChar.secondaryColor;
          ctx.lineWidth = 1.2;
          ctx.stroke();
        } else {
          const grad = ctx.createLinearGradient(
            p1.x + nx * w1,
            p1.y + ny * w1,
            p1.x - nx * w1,
            p1.y - ny * w1,
          );
          grad.addColorStop(0, lightPreset.keyColor);
          grad.addColorStop(0.28, colorHex);
          grad.addColorStop(0.82, '#12131a');
          grad.addColorStop(1, rimHex || lightPreset.rimColor);
          ctx.fillStyle = grad;
          ctx.fill();
          ctx.strokeStyle = 'rgba(255,255,255,0.18)';
          ctx.lineWidth = 0.9;
          ctx.stroke();
        }
      };

      // Joint coordinates in 3D space
      const armSwing = animState === 'combat' ? 0.45 : Math.sin(t * 1.8) * 0.14;
      const victoryRaise = animState === 'victory' ? 0.85 : 0;

      const pelvis = [0, -0.25 + rootY, 0];
      const chest = [0, 0.42 + rootY, 0];
      const head = [0, 0.86 + rootY + morphs.headPitch * 0.25, 0.04];

      // Legs
      drawLimb([-0.22, -0.28 + rootY, 0], [-0.26, -0.82 + rootY * 0.4, 0.08], 0.15, 0.12, '#1f2430', selectedChar.primaryColor);
      drawLimb([-0.26, -0.82 + rootY * 0.4, 0.08], [-0.28, -1.32, 0.02], 0.12, 0.09, selectedChar.primaryColor, selectedChar.secondaryColor);
      drawLimb([0.22, -0.28 + rootY, 0], [0.26, -0.82 + rootY * 0.4, -0.06], 0.15, 0.12, '#1f2430', selectedChar.primaryColor);
      drawLimb([0.26, -0.82 + rootY * 0.4, -0.06], [0.28, -1.32, -0.04], 0.12, 0.09, selectedChar.primaryColor, selectedChar.secondaryColor);

      // Torso & Cybernetic Core
      drawLimb(pelvis, chest, 0.26, 0.34, '#1e2029', selectedChar.primaryColor);

      // Glowing Reactor Core on Chest
      const chestP = project(0, 0.22 + rootY, 0.22);
      ctx.fillStyle = selectedChar.secondaryColor;
      ctx.beginPath();
      ctx.arc(chestP.x, chestP.y, chestP.s * (0.09 + morphs.auraIntensity * 0.04), 0, Math.PI * 2);
      ctx.fill();

      // Left & Right Arms
      const rShoulder = [0.38, 0.38 + rootY, 0];
      const rElbow = [0.56, 0.05 + rootY + victoryRaise * 0.45, 0.18 + armSwing * 0.3];
      const rHand = [0.64, -0.22 + rootY + victoryRaise * 0.9, 0.38 + armSwing * 0.4];
      drawLimb(rShoulder, rElbow, 0.13, 0.1, selectedChar.primaryColor, lightPreset.rimColor);
      drawLimb(rElbow, rHand, 0.1, 0.08, '#272a36', selectedChar.secondaryColor);

      const lShoulder = [-0.38, 0.38 + rootY, 0];
      const lElbow = [-0.54, 0.04 + rootY, -0.12 - armSwing * 0.25];
      const lHand = [-0.6, -0.26 + rootY, 0.15 - armSwing * 0.3];
      drawLimb(lShoulder, lElbow, 0.13, 0.1, selectedChar.primaryColor, lightPreset.rimColor);
      drawLimb(lElbow, lHand, 0.1, 0.08, '#272a36', selectedChar.secondaryColor);

      // Cyber Katana / Energy Blade attached to Right Hand
      if (morphs.bladeCharge > 0.1) {
        const bladeTip = [
          rHand[0] + 0.55,
          rHand[1] + 0.95 + victoryRaise * 0.3,
          rHand[2] + 0.35,
        ];
        drawLimb(
          rHand,
          bladeTip,
          0.045,
          0.015,
          selectedChar.visorColor,
          selectedChar.secondaryColor,
        );
      }

      // Helmet / Head & Morph-Controlled Cyber Visor
      const headP = project(head[0], head[1], head[2]);
      ctx.beginPath();
      ctx.arc(headP.x, headP.y, headP.s * 0.22, 0, Math.PI * 2);
      if (wireframe) {
        ctx.strokeStyle = selectedChar.primaryColor;
        ctx.stroke();
      } else {
        ctx.fillStyle = '#181a22';
        ctx.fill();
        ctx.strokeStyle = selectedChar.primaryColor;
        ctx.lineWidth = 1.5;
        ctx.stroke();
      }

      // Visor Morph Target Glow
      const visorP = project(head[0], head[1] + 0.02, head[2] + 0.18);
      ctx.fillStyle = selectedChar.visorColor;
      ctx.shadowColor = selectedChar.visorColor;
      ctx.shadowBlur = 18 * morphs.visorGlow;
      ctx.beginPath();
      ctx.roundRect(
        visorP.x - headP.s * 0.15,
        visorP.y - headP.s * 0.045,
        headP.s * 0.3,
        headP.s * 0.085,
        4,
      );
      ctx.fill();
      ctx.shadowBlur = 0;

      rafRef.current = requestAnimationFrame(render);
    };

    rafRef.current = requestAnimationFrame(render);

    // Explicit unmount cleanup & disposal
    return () => {
      window.removeEventListener('resize', resize);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [selectedChar, animState, lightPreset, morphs, autoRotate, wireframe]);

  // Pointer OrbitControls with polar angle limits
  const onPointerDown = (e) => {
    dragRef.current = { active: true, lastX: e.clientX, lastY: e.clientY };
  };
  const onPointerMove = (e) => {
    if (!dragRef.current.active) return;
    const dx = e.clientX - dragRef.current.lastX;
    const dy = e.clientY - dragRef.current.lastY;
    dragRef.current.lastX = e.clientX;
    dragRef.current.lastY = e.clientY;
    orbitRef.current.targetAzimuth -= dx * 0.01;
    // Polar angle limits [0.55, 1.52] prevent flipping under the floor or over the zenith
    orbitRef.current.targetPolar = clamp(orbitRef.current.targetPolar + dy * 0.008, 0.55, 1.52);
  };
  const onPointerUp = () => {
    dragRef.current.active = false;
  };
  const onWheel = (e) => {
    orbitRef.current.targetDistance = clamp(orbitRef.current.targetDistance + e.deltaY * 0.0025, 2.5, 6.8);
  };

  const gltfTransformCmd = useMemo(
    () =>
      `npx @gltf-transform/cli optimize ${customGlbInfo?.name || 'character.glb'} ${
        (customGlbInfo?.name || 'character').replace(/\.glb$/i, '')
      }.opt.glb --compress draco --texture-compress ktx2 --texture-size 2048`,
    [customGlbInfo],
  );

  return (
    <Suspense
      fallback={
        <div className="w-full h-[540px] rounded-2xl bg-[#090A0F] border border-white/10 animate-pulse flex items-center justify-center text-xs text-gray-400">
          Loading 3D Character Stage (Draco / KTX2 Pipeline)…
        </div>
      }
    >
      <section className="px-4 sm:px-8 pt-4 space-y-6">
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-5">
          {/* ===== Left / Center: Interactive 3D Character Stage Canvas ===== */}
          <div className="xl:col-span-8 relative rounded-2xl bg-[#090A0F] border border-white/15 overflow-hidden shadow-2xl">
            {/* Top HUD */}
            <div className="absolute top-3 left-3 right-3 z-20 flex flex-wrap items-center justify-between gap-2 pointer-events-none">
              <div className="pointer-events-auto flex items-center gap-2 bg-black/80 backdrop-blur-md px-3 py-1.5 rounded-lg border border-white/10">
                <Box className="w-4 h-4 text-[#E50914]" />
                <div>
                  <p className="text-xs font-black text-white tracking-wide">{selectedChar.name}</p>
                  <p className="text-[10px] text-gray-400">
                    {selectedChar.polyCount} · {selectedChar.textureFormat}
                  </p>
                </div>
              </div>

              <div className="pointer-events-auto flex items-center gap-1.5">
                <span className="px-2.5 py-1 rounded-md bg-emerald-950/90 border border-emerald-500/40 text-[11px] font-mono font-bold text-emerald-300">
                  {fps} FPS · DPR [1, 1.5]
                </span>
                <button
                  onClick={() => setWireframe((w) => !w)}
                  className={`min-h-[44px] px-3 py-1.5 rounded-lg text-xs font-bold border transition ${
                    wireframe ? 'bg-sky-500 text-black border-sky-400' : 'bg-black/80 border-white/15 text-gray-200'
                  }`}
                >
                  Mesh Wire
                </button>
                <button
                  onClick={() => setAutoRotate((r) => !r)}
                  className={`min-h-[44px] px-3 py-1.5 rounded-lg text-xs font-bold border transition ${
                    autoRotate ? 'bg-[#E50914] text-white border-[#E50914]' : 'bg-black/80 border-white/15 text-gray-200'
                  }`}
                >
                  Turntable
                </button>
                <button
                  onClick={resetCamera}
                  aria-label="Reset camera orbit"
                  className="min-h-[44px] px-3 py-1.5 rounded-lg bg-black/80 hover:bg-white/15 border border-white/15 text-xs font-bold text-white flex items-center gap-1"
                >
                  <RotateCcw className="w-3.5 h-3.5" /> Reset
                </button>
              </div>
            </div>

            {/* Interactive 3D Viewport */}
            <canvas
              ref={canvasRef}
              onPointerDown={onPointerDown}
              onPointerMove={onPointerMove}
              onPointerUp={onPointerUp}
              onPointerLeave={onPointerUp}
              onWheel={onWheel}
              className="w-full h-[440px] sm:h-[520px] block cursor-grab active:cursor-grabbing touch-none"
            />

            {/* Bottom Animation State Switcher Bar (44px min mobile tap targets) */}
            <div className="p-3 bg-[#0e1017] border-t border-white/10 flex flex-wrap items-center justify-between gap-2">
              <div className="flex flex-wrap items-center gap-1.5">
                {ANIMATION_STATES.map((st) => (
                  <button
                    key={st.id}
                    onClick={() => setAnimState(st.id)}
                    className={`min-h-[44px] px-3.5 py-2 rounded-lg text-xs font-extrabold transition ${
                      animState === st.id
                        ? 'bg-[#E50914] text-white shadow-lg shadow-[#E50914]/30'
                        : 'bg-white/5 hover:bg-white/15 text-gray-300 border border-white/10'
                    }`}
                  >
                    {st.label}
                  </button>
                ))}
              </div>

              <div className="flex items-center gap-1.5">
                {LIGHTING_PRESETS.map((lp) => (
                  <button
                    key={lp.id}
                    onClick={() => setLightPreset(lp)}
                    className={`min-h-[44px] px-3 py-2 rounded-lg text-xs font-bold border transition ${
                      lightPreset.id === lp.id
                        ? 'bg-amber-400 text-black border-amber-300'
                        : 'bg-white/5 border-white/10 text-gray-300 hover:text-white'
                    }`}
                  >
                    <Sun className="w-3.5 h-3.5 inline mr-1" />
                    {lp.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* ===== Right Column: Character Roster, Morph Targets & Draco/KTX2 Asset Pipeline ===== */}
          <div className="xl:col-span-4 space-y-4">
            {/* Character Switcher */}
            <div className="rounded-2xl bg-[#0e1017] border border-white/10 p-4 space-y-3">
              <h3 className="text-sm font-black uppercase tracking-wider text-white flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-[#E50914]" /> Studio Character Roster
              </h3>
              <div className="space-y-2">
                {CHARACTER_ROSTER.map((c) => {
                  const active = selectedChar.id === c.id;
                  return (
                    <button
                      key={c.id}
                      onClick={() => selectCharacter(c)}
                      className={`w-full min-h-[52px] p-3 rounded-xl border text-left flex items-center justify-between transition ${
                        active
                          ? 'bg-[#E50914]/15 border-[#E50914] text-white'
                          : 'bg-black/40 border-white/10 text-gray-300 hover:border-white/30'
                      }`}
                    >
                      <div>
                        <p className="text-xs font-black text-white">{c.name}</p>
                        <p className="text-[11px] text-gray-400">{c.role}</p>
                      </div>
                      <span
                        className="w-3.5 h-3.5 rounded-full shrink-0"
                        style={{ backgroundColor: c.primaryColor }}
                      />
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Facial & Armor Morph Target Sliders */}
            <div className="rounded-2xl bg-[#0e1017] border border-white/10 p-4 space-y-3">
              <h3 className="text-sm font-black uppercase tracking-wider text-white flex items-center gap-2">
                <Sliders className="w-4 h-4 text-amber-400" /> Morph Targets & Rig Controls
              </h3>
              {[
                { key: 'visorGlow', label: 'Visor Emission Morph', min: 0, max: 1, step: 0.05 },
                { key: 'auraIntensity', label: 'Bio-Electric Aura', min: 0, max: 1, step: 0.05 },
                { key: 'bladeCharge', label: 'Katana Plasma Charge', min: 0, max: 1, step: 0.05 },
                { key: 'headPitch', label: 'Head Pitch Target', min: -0.5, max: 0.5, step: 0.05 },
              ].map((ctrl) => (
                <label key={ctrl.key} className="block space-y-1">
                  <div className="flex justify-between text-xs font-semibold text-gray-300">
                    <span>{ctrl.label}</span>
                    <span className="font-mono text-amber-300">{Number(morphs[ctrl.key]).toFixed(2)}</span>
                  </div>
                  <input
                    type="range"
                    min={ctrl.min}
                    max={ctrl.max}
                    step={ctrl.step}
                    value={morphs[ctrl.key]}
                    onChange={(e) => setMorphs((prev) => ({ ...prev, [ctrl.key]: parseFloat(e.target.value) }))}
                    className="w-full accent-[#E50914] h-2 rounded-lg cursor-pointer"
                  />
                </label>
              ))}
            </div>

            {/* .glb / .gltf Draco & KTX2 Inspector + Dropzone */}
            <div className="rounded-2xl bg-[#0e1017] border border-white/10 p-4 space-y-3">
              <h3 className="text-sm font-black uppercase tracking-wider text-white flex items-center gap-2">
                <Cpu className="w-4 h-4 text-emerald-400" /> glTF / GLB Asset Pipeline
              </h3>
              <label className="min-h-[48px] w-full px-4 py-3 rounded-xl border border-dashed border-white/25 hover:border-[#E50914] bg-black/40 flex items-center justify-center gap-2 text-xs font-bold text-gray-200 cursor-pointer transition">
                <Upload className="w-4 h-4 text-[#E50914]" />
                <span>Inspect Local .GLB / .GLTF Character</span>
                <input type="file" accept=".glb,.gltf" onChange={handleGlbUpload} className="hidden" />
              </label>

              {customGlbInfo && (
                <div className="rounded-lg bg-black/60 border border-emerald-500/30 p-3 text-xs space-y-1">
                  <p className="font-bold text-emerald-300">
                    {customGlbInfo.name} ({customGlbInfo.sizeMB} MB) · {customGlbInfo.validGlb ? 'Valid Binary glTF 2.0' : 'Custom Asset'}
                  </p>
                  <p className="text-gray-300">
                    Meshes: <b>{customGlbInfo.meshes ?? 0}</b> · Animations: <b>{customGlbInfo.animations ?? 0}</b> · Materials: <b>{customGlbInfo.materials ?? 0}</b>
                  </p>
                  {customGlbInfo.extensions?.length > 0 && (
                    <p className="text-[11px] text-amber-300 truncate">
                      Extensions: {customGlbInfo.extensions.join(', ')}
                    </p>
                  )}
                </div>
              )}

              <div className="space-y-1">
                <p className="text-[11px] font-semibold text-gray-400">Draco + KTX2 Compression CLI Command:</p>
                <pre className="p-2.5 rounded-lg bg-black border border-white/10 text-[11px] text-emerald-300 font-mono overflow-x-auto">
                  {gltfTransformCmd}
                </pre>
              </div>
            </div>
          </div>
        </div>
      </section>
    </Suspense>
  );
}
