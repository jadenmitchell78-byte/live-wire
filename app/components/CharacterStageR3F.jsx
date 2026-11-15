'use client';

/**
 * CharacterStageR3F.jsx
 * Modular React Three Fiber <CharacterStage /> with Draco/KTX2 .glb loading,
 * Suspense fallbacks, and mobile dpr={[1, 1.5]} cap.
 *
 * Requires: npm install three @react-three/fiber @react-three/drei
 * Swap into ClientHomePage.jsx via next/dynamic({ ssr: false }) once R3F deps are installed.
 */

import React, { Suspense, useMemo, useState } from 'react';
import { Canvas } from '@react-three/fiber';
import { ContactShadows, Environment, OrbitControls, useGLTF } from '@react-three/drei';

const DRACO_DECODER_PATH = 'https://www.gstatic.com/draco/versioned/decoders/1.5.7/';

function CharacterModel({ url }) {
  const { scene } = useGLTF(url, DRACO_DECODER_PATH);
  const cloned = useMemo(() => scene.clone(), [scene]);
  return <primitive object={cloned} scale={1.1} position={[0, -1, 0]} />;
}

function StageFallback() {
  return (
    <mesh>
      <boxGeometry args={[0.9, 1.6, 0.9]} />
      <meshStandardMaterial color="#38bdf8" wireframe />
    </mesh>
  );
}

export default function CharacterStageR3F({
  glbUrl = '/models/kaelen.opt.glb',
  title = 'Peezy Studio 3D // Character Stage',
  fastPassLocked = false,
  onUnlockFastPass,
}) {
  const [autoRotate, setAutoRotate] = useState(true);

  return (
    <div className="relative w-full h-[500px] rounded-2xl overflow-hidden bg-[#090A0F] border border-white/10">
      <Canvas
        shadows="percentage"
        dpr={[1, 1.5]}
        camera={{ position: [0, 1.4, 4.0], fov: 45 }}
        gl={{ antialias: true, powerPreference: 'high-performance' }}
      >
        <color attach="background" args={['#090A0F']} />
        <ambientLight intensity={0.45} />
        <directionalLight position={[3, 5, 3]} intensity={2} castShadow />
        <Suspense fallback={<StageFallback />}>
          <CharacterModel url={glbUrl} />
          <Environment preset="city" />
          <ContactShadows position={[0, -1, 0]} opacity={0.45} blur={2.2} far={4} />
        </Suspense>
        <OrbitControls
          makeDefault
          enablePan={false}
          autoRotate={autoRotate}
          autoRotateSpeed={1.2}
          minPolarAngle={0.55}
          maxPolarAngle={1.52}
        />
      </Canvas>

      <div className="absolute top-3 left-3 right-3 flex items-center justify-between pointer-events-none">
        <span className="px-3 py-1.5 rounded-full bg-black/65 border border-white/15 text-[11px] font-bold text-white backdrop-blur-md">
          {title} · Draco/KTX2
        </span>
        <button
          type="button"
          onClick={() => setAutoRotate((v) => !v)}
          className="pointer-events-auto min-h-[44px] px-3.5 rounded-xl bg-black/70 border border-white/15 text-xs font-bold text-white hover:bg-white/15"
        >
          {autoRotate ? 'Pause Orbit' : 'Resume Orbit'}
        </button>
      </div>

      {fastPassLocked && (
        <div className="absolute inset-0 bg-black/75 backdrop-blur-sm flex flex-col items-center justify-center p-6 text-center gap-3">
          <p className="text-sm font-bold text-amber-300">AMG VIP Fast Pass Required</p>
          <button
            type="button"
            onClick={onUnlockFastPass}
            className="min-h-[44px] px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-400 to-yellow-500 text-black text-xs font-black uppercase tracking-wider"
          >
            Unlock Fast Pass
          </button>
        </div>
      )}
    </div>
  );
}
