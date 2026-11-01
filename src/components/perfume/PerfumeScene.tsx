import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { ContactShadows, Environment, Lightformer, MeshReflectorMaterial } from "@react-three/drei";
import { Suspense, useEffect, useMemo, useRef, type MutableRefObject } from "react";
import * as THREE from "three";
import { PerfumeBottleModel } from "@/components/perfume/PerfumeBottleModel";
import { PerfumeExplodedParts } from "@/components/perfume/PerfumeExplodedParts";
import { partsConfig, perfumePalette, type QualityProfile } from "@/config/perfumeModelConfig";
import { explosionFactor, sampleCamera, subProgress } from "@/utils/perfumeTransforms";
import type { ScrollState } from "@/hooks/usePerfumeScrollAnimation";

/** Drives the camera from scroll progress, mirroring X framing in RTL so bottle never overlaps Arabic copy. */
function CameraRig({
  stateRef,
  quality,
  rtl,
}: {
  stateRef: React.RefObject<ScrollState>;
  quality: QualityProfile;
  rtl: boolean;
}) {
  const { camera, size } = useThree();
  const target = useMemo(() => new THREE.Vector3(), []);
  const desiredPos = useMemo(() => new THREE.Vector3(), []);
  const desiredTarget = useMemo(() => new THREE.Vector3(), []);
  const pointer = useRef({ x: 0, y: 0 });
  const initialized = useRef(false);

  useFrame((state, delta) => {
    const progress = stateRef.current?.progress ?? 0;
    const key = sampleCamera(progress);
    const damping = Math.min(1, delta * 6.5);

    const aspect = size.width / Math.max(size.height, 1);
    const fit =
      aspect < 0.58 ? 1.58 : aspect < 0.8 ? 1.44 : aspect < 1.05 ? 1.34 : aspect < 1.5 ? 1.14 : 1;

    pointer.current.x += (state.pointer.x - pointer.current.x) * Math.min(1, delta * 3);
    pointer.current.y += (state.pointer.y - pointer.current.y) * Math.min(1, delta * 3);
    const parallax = quality.transmission ? 0.16 : 0.08;

    const isDesktop = size.width >= 1024;
    const dirSign = rtl ? -1 : 1;
    const sideShift = isDesktop ? dirSign : 0;

    desiredPos.set(
      key.position[0] * fit * (isDesktop ? dirSign : 0.45) + pointer.current.x * parallax,
      key.position[1] * fit + pointer.current.y * parallax * 0.6,
      key.position[2] * fit
    );
    desiredTarget.set(key.target[0] * sideShift, key.target[1], key.target[2]);

    if (!initialized.current) {
      initialized.current = true;
      camera.position.copy(desiredPos);
      target.copy(desiredTarget);
    } else {
      camera.position.lerp(desiredPos, damping);
      target.lerp(desiredTarget, damping);
    }

    camera.lookAt(target);

    const perspective = camera as THREE.PerspectiveCamera;
    const fov = key.fov * (aspect < 0.6 ? 1.1 : aspect < 0.8 ? 1.05 : 1);
    if (Math.abs(perspective.fov - fov) > 0.01) {
      perspective.fov += (fov - perspective.fov) * damping;
      perspective.updateProjectionMatrix();
    }
  });

  return null;
}

/** Subtle golden-lilac scent motes orbiting the flacon as it opens. */
function ScentMistHalo({ stateRef }: { stateRef: React.RefObject<ScrollState> }) {
  const matRef = useRef<THREE.PointsMaterial>(null);

  const { geometry, seeds } = useMemo(() => {
    const count = 46;
    const positions = new Float32Array(count * 3);
    const seedArr = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      const angle = (i / count) * Math.PI * 2 + (i % 5) * 0.41;
      const radius = 0.44 + ((i * 17) % 100) / 145;
      const y = -0.62 + ((i * 29) % 100) / 48;
      positions[i * 3] = Math.cos(angle) * radius;
      positions[i * 3 + 1] = y;
      positions[i * 3 + 2] = Math.sin(angle) * radius * 0.78;
      seedArr[i * 3] = angle;
      seedArr[i * 3 + 1] = radius;
      seedArr[i * 3 + 2] = y;
    }
    const geo = new THREE.BufferGeometry();
    geo.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    return { geometry: geo, seeds: seedArr };
  }, []);

  useEffect(() => () => geometry.dispose(), [geometry]);

  useFrame(({ clock }) => {
    const mat = matRef.current;
    if (!mat) return;
    const progress = stateRef.current?.progress ?? 0;
    const rig = explosionFactor(progress);
    mat.opacity = 0.12 + rig * 0.48;

    const t = clock.elapsedTime;
    const spread = 1 + rig * 0.42;
    const attr = geometry.getAttribute("position") as THREE.BufferAttribute;
    for (let i = 0; i < attr.count; i++) {
      const a = seeds[i * 3] + t * (0.1 + (i % 3) * 0.025);
      const r = seeds[i * 3 + 1] * spread;
      const y = seeds[i * 3 + 2] * (1 + rig * 0.3) + Math.sin(t * 0.8 + i) * 0.03;
      attr.setXYZ(i, Math.cos(a) * r, y, Math.sin(a) * r * 0.78);
    }
    attr.needsUpdate = true;
  });

  return (
    <points geometry={geometry} position={[0, 0.05, 0]}>
      <pointsMaterial
        ref={matRef}
        color="#dfcaa4"
        size={0.024}
        sizeAttenuation
        transparent
        opacity={0.18}
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </points>
  );
}

/** Stage 5 highlight: a specular sweep travelling across the glass. */
function HighlightSweep({ stateRef }: { stateRef: React.RefObject<ScrollState> }) {
  const lightRef = useRef<THREE.PointLight>(null);

  useFrame(({ clock }) => {
    const light = lightRef.current;
    if (!light) return;
    const progress = stateRef.current?.progress ?? 0;
    const sweep = subProgress(progress, 0.86, 1);
    const travel = Math.sin(sweep * Math.PI);

    light.position.set(-2.6 + sweep * 5.2, 0.9 + Math.sin(clock.elapsedTime * 0.4) * 0.1, 2.3);
    light.intensity = travel * 26;
  });

  return <pointLight ref={lightRef} color="#fff6e2" intensity={0} distance={9} decay={2} />;
}

/** Lighting whose balance shifts subtly between narrative stages. */
function LightingRig({
  stateRef,
  quality,
}: {
  stateRef: React.RefObject<ScrollState>;
  quality: QualityProfile;
}) {
  const keyRef = useRef<THREE.DirectionalLight>(null);
  const rimRef = useRef<THREE.SpotLight>(null);
  const fillRef = useRef<THREE.PointLight>(null);

  useFrame(() => {
    const progress = stateRef.current?.progress ?? 0;
    const rig = explosionFactor(progress);
    if (keyRef.current) keyRef.current.intensity = 3.2 + rig * 1.2;
    if (rimRef.current) rimRef.current.intensity = 14 - rig * 4.5;
    if (fillRef.current) fillRef.current.intensity = 7.5 + rig * 5.5;
  });

  return (
    <>
      <ambientLight intensity={0.8} />
      <directionalLight
        ref={keyRef}
        position={[3.4, 5.2, 3.6]}
        intensity={3.2}
        color="#fff4e4"
        castShadow={quality.contactShadows && quality.shadowFrames === 0}
        shadow-mapSize={[1024, 1024]}
        shadow-bias={-0.0005}
      />
      <spotLight
        ref={rimRef}
        position={[-4.2, 2.4, -3.4]}
        angle={0.7}
        penumbra={1}
        intensity={14}
        color={perfumePalette.lilac}
        distance={16}
      />
      <pointLight
        ref={fillRef}
        position={[0, -1.8, 3.2]}
        intensity={7}
        color="#ffd9a8"
        distance={10}
        decay={2}
      />
      <pointLight position={[0, 0.2, -2.6]} intensity={5.5} color="#f5bd6e" distance={7} decay={2} />
      <HighlightSweep stateRef={stateRef} />
    </>
  );
}

/** Self-contained studio environment built from lightformers — zero external HDR download. */
function StudioEnvironment({ quality }: { quality: QualityProfile }) {
  return (
    <Environment resolution={quality.transmission ? 512 : 256} frames={1} background={false}>
      <Lightformer
        form="rect"
        intensity={4.6}
        color="#fffaf2"
        position={[0, 4.2, 2.2]}
        rotation={[-Math.PI / 2.6, 0, 0]}
        scale={[10, 5, 1]}
      />
      <Lightformer
        form="rect"
        intensity={3.8}
        color="#ffffff"
        position={[2.4, 0.6, 2.4]}
        rotation={[0, -Math.PI / 3.4, 0]}
        scale={[0.45, 7, 1]}
      />
      <Lightformer
        form="rect"
        intensity={3.2}
        color="#ffffff"
        position={[-2.5, 0.6, 2.2]}
        rotation={[0, Math.PI / 3.2, 0]}
        scale={[0.38, 7, 1]}
      />
      <Lightformer
        form="rect"
        intensity={2.2}
        color="#ffeedd"
        position={[0.9, 1.1, 3.6]}
        rotation={[0, -0.25, 0]}
        scale={[0.3, 5, 1]}
      />
      <Lightformer
        form="rect"
        intensity={1.8}
        color="#cbb6f8"
        position={[-3.6, 1.6, -2.6]}
        rotation={[0, Math.PI / 2.4, 0]}
        scale={[3, 6, 1]}
      />
      <Lightformer
        form="rect"
        intensity={1.25}
        color="#e8f2a8"
        position={[3.7, 0.4, -2.2]}
        rotation={[0, -Math.PI / 2.6, 0]}
        scale={[2.6, 5, 1]}
      />
      <Lightformer
        form="rect"
        intensity={1.6}
        color="#fff4e0"
        position={[0, -2.4, 1.4]}
        rotation={[Math.PI / 2, 0, 0]}
        scale={[7, 4, 1]}
      />
    </Environment>
  );
}

interface SceneProps {
  stateRef: React.RefObject<ScrollState>;
  quality: QualityProfile;
  active: boolean;
  rtl: boolean;
  userYawRef: MutableRefObject<{ target: number; current: number }>;
  onReady?: () => void;
}

export function PerfumeScene({
  stateRef,
  quality,
  active,
  rtl,
  userYawRef,
  onReady,
}: SceneProps) {
  const anchorsRef = useRef<Record<string, THREE.Vector3>>(
    Object.fromEntries(partsConfig.map((part) => [part.id, new THREE.Vector3()]))
  );

  return (
    <Canvas
      className="perfume-canvas"
      dpr={quality.dpr}
      frameloop={active ? "always" : "never"}
      shadows={quality.contactShadows && quality.shadowFrames === 0}
      resize={{ scroll: false, debounce: { scroll: 50, resize: 200 } }}
      gl={{
        antialias: true,
        alpha: true,
        powerPreference: "high-performance",
        preserveDrawingBuffer: false,
      }}
      camera={{ position: [0, 0.3, 4.95], fov: 32, near: 0.1, far: 50 }}
      onCreated={({ gl }) => {
        gl.setClearColor(0x000000, 0);
        gl.toneMapping = THREE.ACESFilmicToneMapping;
        gl.toneMappingExposure = 1.12;
        requestAnimationFrame(() => requestAnimationFrame(() => onReady?.()));
      }}
    >
      <fog attach="fog" args={[perfumePalette.background, 11, 20]} />

      <Suspense fallback={null}>
        <CameraRig stateRef={stateRef} quality={quality} rtl={rtl} />
        <LightingRig stateRef={stateRef} quality={quality} />
        <StudioEnvironment quality={quality} />

        <group position={[0, -0.24, 0]} scale={0.93}>
          <PerfumeBottleModel
            stateRef={stateRef}
            quality={quality}
            anchorsRef={anchorsRef}
            userYawRef={userYawRef}
          />
          <ScentMistHalo stateRef={stateRef} />
        </group>

        {/* Rendered at scene root so world-space `anchorsRef` coordinates align 1:1 */}
        <PerfumeExplodedParts stateRef={stateRef} quality={quality} anchorsRef={anchorsRef} />

        {quality.reflectiveFloor && (
          <mesh position={[0, -1.19, 0]} rotation={[-Math.PI / 2, 0, 0]}>
            <planeGeometry args={[26, 26]} />
            <MeshReflectorMaterial
              resolution={512}
              mixBlur={1.1}
              mixStrength={11}
              blur={[420, 140]}
              depthScale={1.1}
              minDepthThreshold={0.4}
              maxDepthThreshold={1.3}
              mirror={0.36}
              color="#120e18"
              metalness={0.65}
              roughness={0.92}
            />
          </mesh>
        )}

        {quality.contactShadows && (
          <ContactShadows
            frames={quality.shadowFrames}
            position={[0, -1.18, 0]}
            opacity={0.54}
            scale={5.5}
            blur={2.4}
            far={3.2}
            resolution={quality.reflectiveFloor ? 512 : 256}
            color="#07050a"
          />
        )}
      </Suspense>
    </Canvas>
  );
}
