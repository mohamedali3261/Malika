import { useFrame } from "@react-three/fiber";
import { MeshTransmissionMaterial, useGLTF } from "@react-three/drei";
import { useEffect, useMemo, useRef, type ReactNode } from "react";
import * as THREE from "three";
import {
  partsConfig,
  perfumeAsset,
  perfumePalette,
  stages,
  type MaterialKind,
  type PartConfig,
  type PartId,
  type QualityProfile,
} from "@/config/perfumeModelConfig";
import { explosionFactor, partFactor, stageProgress, subProgress } from "@/utils/perfumeTransforms";
import type { ScrollState } from "@/hooks/usePerfumeScrollAnimation";

/* ------------------------------------------------------------------ *
 * Geometry — a real nine-part flacon. Every part is its own mesh, so
 * the exploded view is genuine geometry separation, not a 2D trick.
 * ------------------------------------------------------------------ */

function buildLathe(points: [number, number][], segments: number) {
  return new THREE.LatheGeometry(
    points.map(([x, y]) => new THREE.Vector2(x, y)),
    segments
  );
}

function createLabelTexture(): THREE.CanvasTexture {
  const size = 512;
  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext("2d");

  if (ctx) {
    ctx.fillStyle = "#15111b";
    ctx.fillRect(0, 0, size, size);

    ctx.strokeStyle = "rgba(216, 201, 168, 0.55)";
    ctx.lineWidth = 3;
    ctx.strokeRect(30, 30, size - 60, size - 60);

    ctx.textAlign = "center";
    ctx.fillStyle = "#d8c9a8";

    ctx.font = "600 40px 'Manrope', system-ui, sans-serif";
    ctx.letterSpacing = "16px";
    ctx.fillText("MALIKA", size / 2 + 8, 200);

    ctx.font = "italic 88px 'Instrument Serif', Georgia, serif";
    ctx.letterSpacing = "0px";
    ctx.fillText("Noir", size / 2, 306);

    ctx.fillStyle = "rgba(216, 201, 168, 0.6)";
    ctx.font = "500 26px 'Manrope', system-ui, sans-serif";
    ctx.letterSpacing = "7px";
    ctx.fillText("EXTRAIT 30%  ·  50 ML", size / 2 + 4, 372);
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.anisotropy = 4;
  return texture;
}

type GeometryKey = PartId | "BottleCavity";

interface GeometrySet {
  geometries: Partial<Record<GeometryKey, THREE.BufferGeometry>>;
  labelTexture: THREE.CanvasTexture;
}

function useProceduralGeometry(quality: QualityProfile): GeometrySet {
  const set = useMemo<GeometrySet>(() => {
    const radial = quality.segments;

    // Shouldered flacon profile. Extra points around every edge create real
    // chamfers — the narrow bevels are what catch studio highlights and make
    // glass read as thick rather than as a thin shell.
    const bodyProfile: [number, number][] = [
      [0.001, -0.6],
      [0.3, -0.6],
      [0.372, -0.598],
      [0.404, -0.578],
      [0.417, -0.548],
      [0.42, -0.5],
      [0.42, 0.236],
      [0.417, 0.3],
      [0.405, 0.372],
      [0.378, 0.436],
      [0.33, 0.49],
      [0.262, 0.536],
      [0.2, 0.566],
      [0.166, 0.586],
      [0.152, 0.6],
      [0.148, 0.606],
    ];

    // Inner wall, offset ~22 mm — gives the transmission shader a real
    // thickness to refract through instead of a single surface.
    const cavityProfile: [number, number][] = [
      [0.001, -0.52],
      [0.3, -0.52],
      [0.355, -0.515],
      [0.382, -0.495],
      [0.39, -0.46],
      [0.39, 0.23],
      [0.384, 0.3],
      [0.36, 0.38],
      [0.312, 0.448],
      [0.24, 0.5],
      [0.166, 0.54],
      [0.13, 0.56],
      [0.126, 0.6],
    ];

    const liquidProfile: [number, number][] = [
      [0.001, -0.505],
      [0.3, -0.505],
      [0.356, -0.5],
      [0.383, -0.48],
      [0.388, -0.45],
      [0.388, -0.02],
      [0.386, 0.03],
      [0.384, 0.055],
      [0.001, 0.06],
    ];

    const basePofile: [number, number][] = [
      [0.001, -0.1],
      [0.36, -0.1],
      [0.406, -0.092],
      [0.428, -0.068],
      [0.433, -0.03],
      [0.433, 0.04],
      [0.424, 0.072],
      [0.4, 0.09],
      [0.001, 0.09],
    ];

    const capProfile: [number, number][] = [
      [0.001, -0.205],
      [0.19, -0.205],
      [0.222, -0.198],
      [0.236, -0.178],
      [0.239, -0.15],
      [0.239, 0.118],
      [0.234, 0.162],
      [0.219, 0.198],
      [0.188, 0.224],
      [0.13, 0.238],
      [0.001, 0.24],
    ];

    const geometries: Partial<Record<GeometryKey, THREE.BufferGeometry>> = {
      BottleGlass: buildLathe(bodyProfile, radial),
      // Rendered as a back-face shell inside the body (see renderPart).
      BottleCavity: buildLathe(cavityProfile, radial),
      PerfumeLiquid: buildLathe(liquidProfile, Math.max(16, radial - 12)),
      BottleBase: buildLathe(basePofile, radial),
      BottleCap: buildLathe(capProfile, radial),
      BottleNeck: new THREE.CylinderGeometry(0.142, 0.152, 0.2, Math.max(16, radial / 2), 1),
      Collar: new THREE.CylinderGeometry(0.172, 0.172, 0.078, Math.max(20, radial / 2), 1),
      SprayPump: new THREE.CylinderGeometry(0.112, 0.126, 0.135, Math.max(16, radial / 2), 1),
      AtomizerNozzle: new THREE.CylinderGeometry(0.082, 0.098, 0.1, Math.max(14, radial / 3), 1),
      DipTube: new THREE.CylinderGeometry(0.013, 0.013, 1.08, 8, 1, true),
      BottleLabel: new THREE.PlaneGeometry(0.235, 0.3),
    };

    return { geometries, labelTexture: createLabelTexture() };
  }, [quality.segments]);

  // Manual disposal: these are created outside the R3F declarative tree.
  useEffect(() => {
    const current = set;
    return () => {
      Object.values(current.geometries).forEach((geometry) => geometry?.dispose());
      current.labelTexture.dispose();
    };
  }, [set]);

  return set;
}

/* ------------------------------------------------------------------ *
 * Materials
 * ------------------------------------------------------------------ */

function PartMaterial({
  kind,
  quality,
  labelTexture,
}: {
  kind: MaterialKind;
  quality: QualityProfile;
  labelTexture: THREE.CanvasTexture;
}) {
  const useTransmission = quality.transmission;

  switch (kind) {
    case "glass":
      return useTransmission ? (
        /* Real-time refraction with chromatic aberration — the single biggest
           realism win over meshPhysicalMaterial for thick studio glass. */
        <MeshTransmissionMaterial
          samples={quality.glassSamples}
          resolution={quality.glassResolution}
          transmission={1}
          thickness={0.45}
          roughness={0.03}
          ior={1.52}
          chromaticAberration={0.03}
          anisotropicBlur={0.08}
          distortion={0.04}
          distortionScale={0.12}
          temporalDistortion={0}
          clearcoat={1}
          clearcoatRoughness={0.03}
          attenuationColor="#d8e6e2"
          attenuationDistance={3.4}
          color="#ffffff"
          background={new THREE.Color("#171221")}
        />
      ) : (
        <meshPhysicalMaterial
          color="#cfe0db"
          roughness={0.05}
          metalness={0}
          clearcoat={1}
          clearcoatRoughness={0.04}
          ior={1.5}
          reflectivity={0.6}
          transparent
          opacity={0.3}
          envMapIntensity={2.1}
          depthWrite={false}
        />
      );

    case "thinGlass":
      return (
        <meshPhysicalMaterial
          color="#e4ece8"
          transmission={useTransmission ? 0.94 : 0}
          thickness={0.2}
          roughness={0.06}
          ior={1.5}
          metalness={0}
          clearcoat={1}
          clearcoatRoughness={0.04}
          envMapIntensity={1.6}
          transparent
          opacity={useTransmission ? 1 : 0.55}
          depthWrite={false}
        />
      );

    case "liquid":
      return useTransmission ? (
        <meshPhysicalMaterial
          color="#a8631b"
          transmission={0.55}
          thickness={1.1}
          roughness={0.14}
          ior={1.38}
          metalness={0}
          attenuationColor="#8a4a0d"
          attenuationDistance={1.6}
          emissive={perfumePalette.liquidEmissive}
          emissiveIntensity={0.22}
          envMapIntensity={1.1}
          transparent
        />
      ) : (
        <meshPhysicalMaterial
          color="#c07b23"
          roughness={0.16}
          metalness={0.05}
          clearcoat={0.8}
          clearcoatRoughness={0.2}
          emissive={perfumePalette.liquidEmissive}
          emissiveIntensity={0.3}
          envMapIntensity={1.4}
        />
      );

    case "metal":
      return (
        <meshStandardMaterial
          color={perfumePalette.metal}
          metalness={1}
          roughness={0.19}
          envMapIntensity={1.6}
        />
      );

    case "darkMetal":
      return (
        <meshStandardMaterial
          color={perfumePalette.darkMetal}
          metalness={0.95}
          roughness={0.34}
          envMapIntensity={1.2}
        />
      );

    case "cap":
      return (
        <meshPhysicalMaterial
          color={perfumePalette.cap}
          metalness={0.55}
          roughness={0.22}
          clearcoat={1}
          clearcoatRoughness={0.12}
          envMapIntensity={1.35}
        />
      );

    case "tube":
      return (
        <meshStandardMaterial
          color="#6b6560"
          metalness={0.2}
          roughness={0.55}
          transparent
          opacity={0.32}
          side={THREE.DoubleSide}
        />
      );

    case "label":
    default:
      return (
        <meshStandardMaterial
          map={labelTexture}
          roughness={0.55}
          metalness={0.12}
          side={THREE.FrontSide}
          toneMapped
        />
      );
  }
}

/* ------------------------------------------------------------------ *
 * Optional GLB branch
 * ------------------------------------------------------------------ */

function GlbParts({ children }: { children: (nodes: Record<string, THREE.Object3D>) => ReactNode }) {
  const gltf = useGLTF(perfumeAsset.glbPath);
  const nodes = useMemo(() => {
    const map: Record<string, THREE.Object3D> = {};
    gltf.scene.traverse((child) => {
      map[child.name] = child;
    });
    return map;
  }, [gltf]);
  return <>{children(nodes)}</>;
}

/* ------------------------------------------------------------------ *
 * The rig
 * ------------------------------------------------------------------ */

interface ModelProps {
  stateRef: React.RefObject<ScrollState>;
  quality: QualityProfile;
  /** Published per-part world positions, consumed by labels/connectors. */
  anchorsRef: React.RefObject<Record<string, THREE.Vector3>>;
}

export function PerfumeBottleModel({ stateRef, quality, anchorsRef }: ModelProps) {
  const groupRef = useRef<THREE.Group>(null);
  const partRefs = useRef<Partial<Record<PartId, THREE.Group>>>({});
  const { geometries, labelTexture } = useProceduralGeometry(quality);

  // Pre-allocated scratch values — nothing is created inside the frame loop.
  const scratch = useMemo(
    () => ({
      position: [0, 0, 0] as [number, number, number],
      world: new THREE.Vector3(),
    }),
    []
  );

  useFrame((frameState, delta) => {
    const progress = stateRef.current?.progress ?? 0;
    const group = groupRef.current;
    if (!group) return;

    const time = frameState.clock.elapsedTime;
    const rig = explosionFactor(progress);
    const hero = stageProgress(progress, "heroReveal");
    const settle = subProgress(progress, stages.reassembly[1], 1);

    // Idle presentation motion: a slow turn plus a gentle float. It eases out
    // while exploded so the technical read stays stable and legible.
    const calm = 1 - rig;
    group.rotation.y = Math.sin(time * 0.18) * 0.16 * calm + rig * 0.35 + progress * 0.4;
    group.position.y = Math.sin(time * 0.52) * 0.035 * calm;
    group.rotation.z = Math.sin(time * 0.32) * 0.012 * calm;

    const scale = 1 + hero * 0.02 + settle * 0.03;
    group.scale.setScalar(scale);

    for (const part of partsConfig) {
      const node = partRefs.current[part.id];
      if (!node) continue;

      const amount = partFactor(part, rig);
      const { assembled, exploded } = part;

      scratch.position[0] = assembled.position[0] + exploded.position[0] * amount;
      scratch.position[1] = assembled.position[1] + exploded.position[1] * amount;
      scratch.position[2] = assembled.position[2] + exploded.position[2] * amount;

      // Parts drift very slightly while suspended — never enough to break
      // the exploded alignment, just enough to feel alive.
      if (amount > 0.01) {
        const phase = part.stagger.start * 10;
        scratch.position[1] += Math.sin(time * 0.6 + phase) * 0.012 * amount;
        scratch.position[0] += Math.cos(time * 0.45 + phase) * 0.008 * amount;
      }

      node.position.set(scratch.position[0], scratch.position[1], scratch.position[2]);
      node.rotation.set(
        assembled.rotation[0] + exploded.rotation[0] * amount,
        assembled.rotation[1] + exploded.rotation[1] * amount,
        assembled.rotation[2] + exploded.rotation[2] * amount
      );

      if (anchorsRef.current) {
        const anchor = anchorsRef.current[part.id];
        if (anchor) {
          node.getWorldPosition(scratch.world);
          anchor.lerp(scratch.world, Math.min(1, delta * 14));
        }
      }
    }
  });

  const renderPart = (part: PartConfig) => {
    const geometry = geometries[part.id];
    if (!geometry) return null;

    // The oval cross-section of the flacon: body, liquid and base share it.
    const ovalise = part.id === "BottleGlass" || part.id === "PerfumeLiquid" || part.id === "BottleBase";
    const isLabel = part.id === "BottleLabel";

    return (
      <group
        key={part.id}
        name={part.id}
        ref={(node) => {
          if (node) partRefs.current[part.id] = node;
        }}
        position={part.assembled.position as unknown as [number, number, number]}
      >
        <mesh
          geometry={geometry}
          scale={ovalise ? [1, 1, 0.66] : isLabel ? [1, 1, 1] : [1, 1, 0.78]}
          castShadow={part.material !== "glass" && part.material !== "liquid"}
          receiveShadow={false}
          renderOrder={part.material === "glass" ? 2 : part.material === "liquid" ? 1 : 0}
        >
          <PartMaterial kind={part.material} quality={quality} labelTexture={labelTexture} />
        </mesh>

        {/* A machined knurl ring on the collar reads as real hardware. */}
        {part.id === "Collar" && (
          <mesh position={[0, 0.045, 0]} rotation={[Math.PI / 2, 0, 0]} scale={[1, 0.78, 1]}>
            <torusGeometry args={[0.158, 0.009, 8, Math.max(24, quality.segments / 2)]} />
            <meshStandardMaterial color={perfumePalette.metal} metalness={1} roughness={0.3} />
          </mesh>
        )}
        {part.id === "AtomizerNozzle" && (
          <mesh position={[0, 0.052, 0.06]} rotation={[Math.PI / 2, 0, 0]}>
            <cylinderGeometry args={[0.016, 0.016, 0.03, 10]} />
            <meshStandardMaterial color="#0d0a12" metalness={0.8} roughness={0.5} />
          </mesh>
        )}
        {part.id === "BottleCap" && (
          <>
            <mesh position={[0, -0.192, 0]} rotation={[Math.PI / 2, 0, 0]} scale={[1, 0.78, 1]}>
              <torusGeometry args={[0.231, 0.011, 10, Math.max(28, quality.segments / 2)]} />
              <meshStandardMaterial color={perfumePalette.metal} metalness={1} roughness={0.18} />
            </mesh>
            {/* Brushed inlay disc on the crown. */}
            <mesh position={[0, 0.241, 0]} rotation={[-Math.PI / 2, 0, 0]} scale={[1, 0.78, 1]}>
              <circleGeometry args={[0.125, Math.max(24, quality.segments / 2)]} />
              <meshStandardMaterial color={perfumePalette.metal} metalness={1} roughness={0.32} />
            </mesh>
          </>
        )}
        {part.id === "SprayPump" && (
          <mesh position={[0, 0.072, 0]} rotation={[Math.PI / 2, 0, 0]} scale={[1, 0.78, 1]}>
            <torusGeometry args={[0.104, 0.008, 8, Math.max(20, quality.segments / 3)]} />
            <meshStandardMaterial color={perfumePalette.metal} metalness={1} roughness={0.26} />
          </mesh>
        )}
      </group>
    );
  };

  return (
    <group ref={groupRef} name="PerfumeRig" dispose={null}>
      {perfumeAsset.useGlb ? (
        <GlbParts>
          {(nodes) => (
            <>
              {partsConfig.map((part) => {
                const node = nodes[part.nodeName];
                if (!node) return renderPart(part);
                return (
                  <group
                    key={part.id}
                    name={part.id}
                    ref={(group) => {
                      if (group) partRefs.current[part.id] = group;
                    }}
                    position={part.assembled.position as unknown as [number, number, number]}
                    scale={perfumeAsset.glbScale}
                  >
                    <primitive object={node.clone()} />
                  </group>
                );
              })}
            </>
          )}
        </GlbParts>
      ) : (
        partsConfig.map(renderPart)
      )}
    </group>
  );
}

if (perfumeAsset.useGlb) {
  useGLTF.preload(perfumeAsset.glbPath);
}
