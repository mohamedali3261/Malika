import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { ContactShadows, Environment, Lightformer, MeshReflectorMaterial } from "@react-three/drei";
import { Suspense, useMemo, useRef } from "react";
import * as THREE from "three";
import { PerfumeBottleModel } from "@/components/perfume/PerfumeBottleModel";
import { PerfumeExplodedParts } from "@/components/perfume/PerfumeExplodedParts";
import { partsConfig, perfumePalette, type QualityProfile } from "@/config/perfumeModelConfig";
import { explosionFactor, sampleCamera, subProgress } from "@/utils/perfumeTransforms";
import type { ScrollState } from "@/hooks/usePerfumeScrollAnimation";

/** Drives the camera from scroll progress, with a restrained pointer parallax. */
function CameraRig({ stateRef, quality }: { stateRef: React.RefObject<ScrollState>; quality: QualityProfile }) {
  const { camera, size } = useThree();
  const target = useMemo(() => new THREE.Vector3(), []);
  const desired = useMemo(() => new THREE.Vector3(), []);
  const pointer = useRef({ x: 0, y: 0 });

  useFrame((state, delta) => {
    const progress = stateRef.current?.progress ?? 0;
    const key = sampleCamera(progress);
    const damping = Math.min(1, delta * 6);

    // Pull the camera back as the viewport narrows so the exploded rig always
    // stays inside frame — phone portrait needs almost double the distance.
    const aspect = size.width / Math.max(size.height, 1);
    const fit =
      aspect < 0.58 ? 1.64 : aspect < 0.8 ? 1.5 : aspect < 1.05 ? 1.4 : aspect < 1.5 ? 1.16 : 1;

    pointer.current.x += (state.pointer.x - pointer.current.x) * Math.min(1, delta * 3);
    pointer.current.y += (state.pointer.y - pointer.current.y) * Math.min(1, delta * 3);
    const parallax = quality.transmission ? 0.16 : 0.08;

    desired.set(
      key.position[0] * fit + pointer.current.x * parallax,
      key.position[1] * fit + pointer.current.y * parallax * 0.6,
      key.position[2] * fit
    );
    camera.position.lerp(desired, damping);

    // Offset the subject only when the copy actually sits beside it. Below
    // 1024px the text stacks above/below, so the bottle must stay centred.
    const sideShift = size.width >= 1024 ? 1 : 0;
    target.set(key.target[0] * sideShift, key.target[1], key.target[2]);
    camera.lookAt(target);

    const perspective = camera as THREE.PerspectiveCamera;
    const fov = key.fov * (aspect < 0.6 ? 1.12 : aspect < 0.8 ? 1.06 : 1);
    if (Math.abs(perspective.fov - fov) > 0.01) {
      perspective.fov += (fov - perspective.fov) * damping;
      perspective.updateProjectionMatrix();
    }
  });

  return null;
}

/**
 * Stage 5 highlight: a specular sweep travelling across the glass.
 * A moving light is used rather than a screen-space bloom pass, which keeps
 * the highlight physically anchored to the bottle's curvature.
 */
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
function LightingRig({ stateRef, quality }: { stateRef: React.RefObject<ScrollState>; quality: QualityProfile }) {
  const keyRef = useRef<THREE.DirectionalLight>(null);
  const rimRef = useRef<THREE.SpotLight>(null);
  const fillRef = useRef<THREE.PointLight>(null);

  useFrame(() => {
    const progress = stateRef.current?.progress ?? 0;
    const rig = explosionFactor(progress);
    // Technical clarity while exploded, drama when assembled.
    if (keyRef.current) keyRef.current.intensity = 3.1 + rig * 1.2;
    if (rimRef.current) rimRef.current.intensity = 14 - rig * 5;
    if (fillRef.current) fillRef.current.intensity = 7 + rig * 6;
  });

  return (
    <>
      <ambientLight intensity={0.75} />
      <directionalLight
        ref={keyRef}
        position={[3.4, 5.2, 3.6]}
        intensity={3.1}
        color="#fff4e4"
        castShadow={quality.contactShadows}
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
      <pointLight ref={fillRef} position={[0, -1.8, 3.2]} intensity={6} color="#ffd9a8" distance={10} decay={2} />
      <HighlightSweep stateRef={stateRef} />
    </>
  );
}

/**
 * Self-contained studio environment built from lightformers.
 * No external HDRI is fetched, so the experience works offline and adds
 * nothing to network cost.
 */
function StudioEnvironment({ quality }: { quality: QualityProfile }) {
  return (
    <Environment resolution={quality.transmission ? 512 : 128} frames={1} background={false}>
      {/* Overhead key softbox. */}
      <Lightformer form="rect" intensity={4.5} color="#fffaf2" position={[0, 4.2, 2.2]} rotation={[-Math.PI / 2.6, 0, 0]} scale={[10, 5, 1]} />

      {/* Tall vertical strips. Their long reflections down the shoulders are
          the signature of a real product-photography light tent. */}
      <Lightformer form="rect" intensity={3.6} color="#ffffff" position={[2.4, 0.6, 2.4]} rotation={[0, -Math.PI / 3.4, 0]} scale={[0.45, 7, 1]} />
      <Lightformer form="rect" intensity={3} color="#ffffff" position={[-2.5, 0.6, 2.2]} rotation={[0, Math.PI / 3.2, 0]} scale={[0.38, 7, 1]} />
      <Lightformer form="rect" intensity={2} color="#ffeedd" position={[0.9, 1.1, 3.6]} rotation={[0, -0.25, 0]} scale={[0.3, 5, 1]} />

      {/* Rim tints — brand colour kept to the edges only. */}
      <Lightformer form="rect" intensity={1.6} color="#cbb6f8" position={[-3.6, 1.6, -2.6]} rotation={[0, Math.PI / 2.4, 0]} scale={[3, 6, 1]} />
      <Lightformer form="rect" intensity={1.1} color="#e8f2a8" position={[3.7, 0.4, -2.2]} rotation={[0, -Math.PI / 2.6, 0]} scale={[2.6, 5, 1]} />

      {/* Bounce card below lifts the base out of shadow. */}
      <Lightformer form="rect" intensity={1.4} color="#ffffff" position={[0, -2.4, 1.4]} rotation={[Math.PI / 2, 0, 0]} scale={[7, 4, 1]} />
    </Environment>
  );
}

interface SceneProps {
  stateRef: React.RefObject<ScrollState>;
  quality: QualityProfile;
  active: boolean;
  onReady?: () => void;
}

export function PerfumeScene({ stateRef, quality, active, onReady }: SceneProps) {
  // Shared world-space anchors, written by the model and read by the labels.
  const anchorsRef = useRef<Record<string, THREE.Vector3>>(
    Object.fromEntries(partsConfig.map((part) => [part.id, new THREE.Vector3()]))
  );

  return (
    <Canvas
      className="perfume-canvas"
      dpr={quality.dpr}
      // Pausing the loop off-screen keeps the rest of the page perfectly smooth.
      frameloop={active ? "always" : "never"}
      shadows={quality.contactShadows}
      // react-use-measure re-reads layout on EVERY scroll event by default,
      // which forces a reflow per scroll tick on a page this tall.
      resize={{ scroll: false, debounce: { scroll: 50, resize: 200 } }}
      gl={{
        antialias: true,
        alpha: true,
        powerPreference: "high-performance",
        preserveDrawingBuffer: false,
      }}
      camera={{ position: [0, 0.35, 4.75], fov: 34, near: 0.1, far: 50 }}
      onCreated={({ gl }) => {
        gl.setClearColor(0x000000, 0);
        gl.toneMapping = THREE.ACESFilmicToneMapping;
        gl.toneMappingExposure = 1.1;
        // Wait for a painted frame so the loader never lifts on an empty canvas.
        requestAnimationFrame(() => requestAnimationFrame(() => onReady?.()));
      }}
    >
      <fog attach="fog" args={[perfumePalette.background, 11, 20]} />

      <Suspense fallback={null}>
        <CameraRig stateRef={stateRef} quality={quality} />
        <LightingRig stateRef={stateRef} quality={quality} />
        <StudioEnvironment quality={quality} />

        <group position={[0, -0.26, 0]} scale={0.92}>
          <PerfumeBottleModel stateRef={stateRef} quality={quality} anchorsRef={anchorsRef} />
          <PerfumeExplodedParts stateRef={stateRef} quality={quality} anchorsRef={anchorsRef} />
        </group>

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
            position={[0, -1.18, 0]}
            opacity={0.52}
            scale={7}
            blur={2.6}
            far={3.2}
            resolution={quality.glassSamples > 3 ? 512 : 256}
            color="#000000"
            frames={Infinity}
          />
        )}
      </Suspense>
    </Canvas>
  );
}
