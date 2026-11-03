import { useFrame } from "@react-three/fiber";
import { MeshTransmissionMaterial, useGLTF } from "@react-three/drei";
import { useEffect, useMemo, useRef, type MutableRefObject, type ReactNode } from "react";
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
 * Geometry — precision ten-part flacon with inner crystal cavity,
 * curved oval hot-foil crest, liquid meniscus, and curved capillary.
 * ------------------------------------------------------------------ */

function buildLathe(points: [number, number][], segments: number) {
  const geo = new THREE.LatheGeometry(
    points.map(([x, y]) => new THREE.Vector2(Math.max(0.0001, x), y)),
    segments
  );
  geo.computeVertexNormals();
  return geo;
}

/**
 * Curved oval plaque that hugs the exact `[1, 1, 0.66]` cross-section of
 * `BottleGlass` so the label never pokes flat edges out into empty air.
 */
function buildCurvedOvalPatch(
  rx: number,
  rz: number,
  arcHalfAngle: number,
  height: number,
  segX = 28,
  segY = 8
) {
  const geo = new THREE.PlaneGeometry(1, height, segX, segY);
  const pos = geo.attributes.position;
  for (let i = 0; i < pos.count; i++) {
    const u = pos.getX(i); // -0.5 .. +0.5
    const y = pos.getY(i);
    const theta = u * 2 * arcHalfAngle;
    pos.setXYZ(i, rx * Math.sin(theta), y, rz * Math.cos(theta));
  }
  pos.needsUpdate = true;
  geo.computeVertexNormals();
  return geo;
}

function createLabelTexture(): THREE.CanvasTexture {
  const width = 512;
  const height = 640;
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");

  if (ctx) {
    // Rich obsidian cotton paper ground with subtle vignette
    const bg = ctx.createLinearGradient(0, 0, 0, height);
    bg.addColorStop(0, "#1a1423");
    bg.addColorStop(0.5, "#130f1a");
    bg.addColorStop(1, "#0d0a12");
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, width, height);

    // Double hot-foil champagne gold frame
    ctx.strokeStyle = "#dfcaa4";
    ctx.lineWidth = 4.5;
    ctx.strokeRect(22, 22, width - 44, height - 44);

    ctx.strokeStyle = "rgba(216, 201, 168, 0.42)";
    ctx.lineWidth = 1.5;
    ctx.strokeRect(36, 36, width - 72, height - 72);

    // Diamond emblem at top
    ctx.save();
    ctx.translate(width / 2, 108);
    ctx.rotate(Math.PI / 4);
    ctx.strokeStyle = "#dfcaa4";
    ctx.lineWidth = 2.2;
    ctx.strokeRect(-13, -13, 26, 26);
    ctx.fillStyle = "#ddf25c";
    ctx.fillRect(-4, -4, 8, 8);
    ctx.restore();

    ctx.textAlign = "center";

    ctx.fillStyle = "rgba(223, 202, 164, 0.68)";
    ctx.font = "600 17px 'Manrope', system-ui, sans-serif";
    ctx.fillText("MAISON DE PARFUM · CAIRO", width / 2, 174);

    ctx.fillStyle = "#f3efe7";
    ctx.font = "600 48px 'Manrope', system-ui, sans-serif";
    ctx.letterSpacing = "16px";
    ctx.fillText("VLOR", width / 2 + 8, 258);

    // Thin gold rule
    ctx.strokeStyle = "rgba(223, 202, 164, 0.55)";
    ctx.lineWidth = 1.8;
    ctx.beginPath();
    ctx.moveTo(156, 294);
    ctx.lineTo(width - 156, 294);
    ctx.stroke();

    ctx.fillStyle = "#dfcaa4";
    ctx.font = "italic 92px 'Instrument Serif', Georgia, serif";
    ctx.letterSpacing = "0px";
    ctx.fillText("Noir", width / 2, 392);

    ctx.fillStyle = "rgba(243, 239, 231, 0.72)";
    ctx.font = "600 22px 'Manrope', system-ui, sans-serif";
    ctx.letterSpacing = "6px";
    ctx.fillText("EXTRAIT DE PARFUM", width / 2 + 3, 474);

    ctx.fillStyle = "rgba(223, 202, 164, 0.65)";
    ctx.font = "500 20px 'Manrope', system-ui, sans-serif";
    ctx.letterSpacing = "5px";
    ctx.fillText("30% OIL  ·  50 ML", width / 2 + 2, 522);

    ctx.fillStyle = "rgba(221, 242, 92, 0.75)";
    ctx.font = "600 16px ui-monospace, monospace";
    ctx.letterSpacing = "3px";
    ctx.fillText("BATCH N° 014 / 250", width / 2 + 1, 574);
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.anisotropy = 8;
  texture.needsUpdate = true;
  return texture;
}

type ExtraGeometryKey = "BottleCavity" | "LiquidMeniscus" | "LabelGoldRim";
type GeometryKey = PartId | ExtraGeometryKey;

interface GeometrySet {
  geometries: Partial<Record<GeometryKey, THREE.BufferGeometry>>;
  labelTexture: THREE.CanvasTexture;
}

function useProceduralGeometry(quality: QualityProfile): GeometrySet {
  const set = useMemo<GeometrySet>(() => {
    const radial = quality.segments;

    // Shouldered flacon profile with crisp light-catching chamfers.
    const bodyProfile: [number, number][] = [
      [0.001, -0.6],
      [0.31, -0.6],
      [0.376, -0.596],
      [0.408, -0.576],
      [0.419, -0.544],
      [0.422, -0.49],
      [0.422, 0.25],
      [0.418, 0.315],
      [0.405, 0.385],
      [0.376, 0.448],
      [0.326, 0.5],
      [0.258, 0.544],
      [0.196, 0.572],
      [0.164, 0.59],
      [0.151, 0.602],
      [0.148, 0.608],
    ];

    // Inner crystal cavity — leaves heavy optical punt at bottom and thick walls.
    const cavityProfile: [number, number][] = [
      [0.001, -0.495],
      [0.295, -0.495],
      [0.352, -0.488],
      [0.376, -0.466],
      [0.384, -0.43],
      [0.384, 0.24],
      [0.378, 0.31],
      [0.352, 0.388],
      [0.304, 0.452],
      [0.232, 0.502],
      [0.158, 0.542],
      [0.128, 0.57],
      [0.001, 0.575],
    ];

    // Rich amber extrait filling ~72% of the inner chamber.
    const liquidProfile: [number, number][] = [
      [0.001, -0.482],
      [0.292, -0.482],
      [0.348, -0.474],
      [0.372, -0.452],
      [0.378, -0.415],
      [0.378, 0.14],
      [0.375, 0.172],
      [0.369, 0.186],
      [0.001, 0.188],
    ];

    // Weighted optical plinth cradling the bottom of the crystal body.
    const baseProfile: [number, number][] = [
      [0.001, -0.095],
      [0.362, -0.095],
      [0.408, -0.086],
      [0.428, -0.062],
      [0.432, -0.02],
      [0.43, 0.042],
      [0.418, 0.068],
      [0.388, 0.078],
      [0.001, 0.062],
    ];

    // Weighted obsidian lacquer cap — seats flush onto `Collar` when assembled.
    const capProfile: [number, number][] = [
      [0.188, -0.205],
      [0.222, -0.2],
      [0.236, -0.18],
      [0.24, -0.15],
      [0.24, 0.122],
      [0.235, 0.166],
      [0.22, 0.202],
      [0.188, 0.226],
      [0.132, 0.239],
      [0.001, 0.242],
    ];

    // Subtly curved capillary tube reaching into the bottom corner of the flacon.
    const dipCurve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(0, 0.58, 0),
      new THREE.Vector3(0.012, 0.18, 0.008),
      new THREE.Vector3(0.045, -0.2, 0.02),
      new THREE.Vector3(0.11, -0.54, 0.042),
    ]);

    const geometries: Partial<Record<GeometryKey, THREE.BufferGeometry>> = {
      BottleGlass: buildLathe(bodyProfile, radial),
      BottleCavity: buildLathe(cavityProfile, Math.max(36, Math.round(radial * 0.8))),
      PerfumeLiquid: buildLathe(liquidProfile, Math.max(32, Math.round(radial * 0.78))),
      LiquidMeniscus: new THREE.CircleGeometry(0.371, Math.max(32, Math.round(radial * 0.7))),
      BottleBase: buildLathe(baseProfile, radial),
      BottleCap: buildLathe(capProfile, radial),
      BottleNeck: new THREE.CylinderGeometry(
        0.138,
        0.148,
        0.185,
        Math.max(24, Math.round(radial * 0.6)),
        1
      ),
      Collar: new THREE.CylinderGeometry(
        0.176,
        0.182,
        0.084,
        Math.max(28, Math.round(radial * 0.65)),
        1
      ),
      SprayPump: new THREE.CylinderGeometry(
        0.106,
        0.12,
        0.118,
        Math.max(22, Math.round(radial * 0.5)),
        1
      ),
      AtomizerNozzle: new THREE.CylinderGeometry(
        0.082,
        0.094,
        0.092,
        Math.max(22, Math.round(radial * 0.5)),
        1
      ),
      DipTube: new THREE.TubeGeometry(dipCurve, 28, 0.011, 10, false),
      BottleLabel: buildCurvedOvalPatch(0.4265, 0.4265 * 0.662, 0.305, 0.34, 28, 8),
      LabelGoldRim: buildCurvedOvalPatch(0.4242, 0.4242 * 0.662, 0.316, 0.354, 28, 6),
    };

    return { geometries, labelTexture: createLabelTexture() };
  }, [quality.segments]);

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
        <MeshTransmissionMaterial
          backside
          backsideThickness={0.22}
          samples={quality.glassSamples}
          resolution={quality.glassResolution}
          transmission={0.98}
          thickness={0.52}
          roughness={0.032}
          ior={1.53}
          chromaticAberration={0.026}
          anisotropicBlur={0.08}
          distortion={0.035}
          distortionScale={0.14}
          temporalDistortion={0}
          clearcoat={1}
          clearcoatRoughness={0.03}
          attenuationColor="#e8efe9"
          attenuationDistance={3.2}
          color="#ffffff"
          background={new THREE.Color("#161120")}
        />
      ) : (
        <meshPhysicalMaterial
          color="#eef3f0"
          roughness={0.04}
          metalness={0.04}
          clearcoat={1}
          clearcoatRoughness={0.03}
          ior={1.52}
          reflectivity={1}
          transparent
          opacity={0.34}
          envMapIntensity={2.6}
          depthWrite={false}
        />
      );

    case "thinGlass":
      return (
        <meshPhysicalMaterial
          color="#eaeff0"
          transmission={useTransmission ? 0.92 : 0}
          thickness={0.2}
          roughness={0.055}
          ior={1.52}
          metalness={0.03}
          clearcoat={1}
          clearcoatRoughness={0.04}
          envMapIntensity={1.9}
          transparent
          opacity={useTransmission ? 1 : 0.58}
          depthWrite={false}
        />
      );

    case "liquid":
      return useTransmission ? (
        <meshPhysicalMaterial
          color="#bf7722"
          transmission={0.52}
          thickness={1.05}
          roughness={0.09}
          ior={1.39}
          metalness={0.02}
          attenuationColor="#8f4c0c"
          attenuationDistance={1.5}
          emissive={perfumePalette.liquidEmissive}
          emissiveIntensity={0.28}
          envMapIntensity={1.5}
          transparent
        />
      ) : (
        <meshPhysicalMaterial
          color="#cf862c"
          roughness={0.08}
          metalness={0.06}
          clearcoat={0.95}
          clearcoatRoughness={0.08}
          ior={1.39}
          reflectivity={0.92}
          emissive={perfumePalette.liquidEmissive}
          emissiveIntensity={0.34}
          envMapIntensity={2.0}
          transparent
          opacity={0.88}
        />
      );

    case "metal":
      return (
        <meshStandardMaterial
          color={perfumePalette.metal}
          metalness={1}
          roughness={0.17}
          envMapIntensity={2.0}
        />
      );

    case "darkMetal":
      return (
        <meshStandardMaterial
          color={perfumePalette.darkMetal}
          metalness={0.95}
          roughness={0.28}
          envMapIntensity={1.5}
        />
      );

    case "cap":
      return (
        <meshPhysicalMaterial
          color={perfumePalette.cap}
          metalness={0.45}
          roughness={0.16}
          clearcoat={1}
          clearcoatRoughness={0.07}
          reflectivity={1}
          envMapIntensity={1.85}
        />
      );

    case "tube":
      return (
        <meshPhysicalMaterial
          color="#e2ddd4"
          metalness={0.06}
          roughness={0.14}
          clearcoat={0.8}
          transparent
          opacity={0.42}
          depthWrite={false}
        />
      );

    case "label":
    default:
      return (
        <meshStandardMaterial
          map={labelTexture}
          roughness={0.46}
          metalness={0.14}
          side={THREE.FrontSide}
          polygonOffset
          polygonOffsetFactor={-2}
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
  /** Interactive horizontal spin offset (radians) controlled by pointer drag. */
  userYawRef?: MutableRefObject<{ target: number; current: number }>;
}

export function PerfumeBottleModel({ stateRef, quality, anchorsRef, userYawRef }: ModelProps) {
  const groupRef = useRef<THREE.Group>(null);
  const meniscusRef = useRef<THREE.Mesh>(null);
  const partRefs = useRef<Partial<Record<PartId, THREE.Group>>>({});
  const { geometries, labelTexture } = useProceduralGeometry(quality);

  const scratch = useMemo(
    () => ({
      position: [0, 0, 0] as [number, number, number],
      world: new THREE.Vector3(),
    }),
    []
  );

  useFrame((frameState, delta) => {
    const progress = stateRef.current?.progress ?? 0;
    const velocity = stateRef.current?.velocity ?? 0;
    const group = groupRef.current;
    if (!group) return;

    const time = frameState.clock.elapsedTime;
    const rig = explosionFactor(progress);
    const hero = stageProgress(progress, "heroReveal");
    const settle = subProgress(progress, stages.reassembly[1], 1);

    // Smoothly damp interactive user pointer spin
    let extraYaw = 0;
    if (userYawRef) {
      userYawRef.current.current +=
        (userYawRef.current.target - userYawRef.current.current) * Math.min(1, delta * 9);
      extraYaw = userYawRef.current.current;
    }

    // Subtle liquid meniscus slosh driven by scroll velocity
    if (meniscusRef.current) {
      const slosh = THREE.MathUtils.clamp((velocity / 2800) * 0.08, -0.07, 0.07);
      meniscusRef.current.rotation.z +=
        (slosh - meniscusRef.current.rotation.z) * Math.min(1, delta * 6);
    }

    // Idle presentation motion + scroll choreography + user spin
    const calm = 1 - rig * 0.65;
    const desiredRotY =
      Math.sin(time * 0.22) * 0.14 * calm + rig * 0.34 + progress * 0.42 + extraYaw;
    const desiredPosY = Math.sin(time * 0.56) * 0.03 * calm;
    const desiredRotZ = Math.sin(time * 0.34) * 0.011 * calm;

    group.rotation.y += (desiredRotY - group.rotation.y) * Math.min(1, delta * 10);
    group.position.y += (desiredPosY - group.position.y) * Math.min(1, delta * 10);
    group.rotation.z += (desiredRotZ - group.rotation.z) * Math.min(1, delta * 10);

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

      if (amount > 0.01) {
        const phase = part.stagger.start * 10;
        scratch.position[1] += Math.sin(time * 0.6 + phase) * 0.011 * amount;
        scratch.position[0] += Math.cos(time * 0.45 + phase) * 0.007 * amount;
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
          anchor.lerp(scratch.world, Math.min(1, delta * 16));
        }
      }
    }
  });

  const renderPart = (part: PartConfig) => {
    const geometry = geometries[part.id];
    if (!geometry) return null;

    const ovalise =
      part.id === "BottleGlass" || part.id === "PerfumeLiquid" || part.id === "BottleBase";
    const isDirectWorldScale = part.id === "BottleLabel" || part.id === "DipTube";
    const meshScale: [number, number, number] = ovalise
      ? [1, 1, 0.66]
      : isDirectWorldScale
        ? [1, 1, 1]
        : [1, 1, 0.78];

    const renderOrder =
      part.id === "PerfumeLiquid"
        ? 1
        : part.id === "DipTube"
          ? 2
          : part.id === "BottleNeck"
            ? 3
            : part.id === "BottleGlass"
              ? 4
              : part.id === "BottleLabel"
                ? 6
                : 0;

    return (
      <group
        key={part.id}
        name={part.id}
        ref={(node) => {
          if (node) partRefs.current[part.id] = node;
        }}
        position={part.assembled.position as unknown as [number, number, number]}
      >
        {/* Inner crystal cavity wall inside BottleGlass */}
        {part.id === "BottleGlass" && geometries.BottleCavity && (
          <mesh geometry={geometries.BottleCavity} scale={[1, 1, 0.66]} renderOrder={3}>
            <meshPhysicalMaterial
              color="#d8e4df"
              roughness={0.07}
              metalness={0.02}
              ior={1.52}
              reflectivity={0.85}
              envMapIntensity={1.6}
              transparent
              opacity={quality.transmission ? 0.2 : 0.22}
              side={THREE.BackSide}
              depthWrite={false}
            />
          </mesh>
        )}

        {/* Gold foil backing frame behind the curved label */}
        {part.id === "BottleLabel" && geometries.LabelGoldRim && (
          <mesh geometry={geometries.LabelGoldRim} renderOrder={5}>
            <meshStandardMaterial
              color={perfumePalette.metal}
              metalness={0.96}
              roughness={0.22}
              envMapIntensity={1.9}
            />
          </mesh>
        )}

        <mesh
          geometry={geometry}
          scale={meshScale}
          castShadow={part.material !== "glass" && part.material !== "liquid"}
          receiveShadow={false}
          renderOrder={renderOrder}
        >
          <PartMaterial kind={part.material} quality={quality} labelTexture={labelTexture} />
        </mesh>

        {/* Luminous top meniscus surface on PerfumeLiquid */}
        {part.id === "PerfumeLiquid" && geometries.LiquidMeniscus && (
          <mesh
            ref={meniscusRef}
            geometry={geometries.LiquidMeniscus}
            position={[0, 0.186, 0]}
            rotation={[-Math.PI / 2, 0, 0]}
            scale={[1, 0.66, 1]}
            renderOrder={2}
          >
            <meshPhysicalMaterial
              color="#f2ba68"
              emissive={perfumePalette.liquidEmissive}
              emissiveIntensity={0.38}
              roughness={0.04}
              metalness={0.08}
              clearcoat={1}
              envMapIntensity={2.3}
              transparent
              opacity={0.9}
            />
          </mesh>
        )}

        {/* Brushed gold trim ring cradling BottleBase */}
        {part.id === "BottleBase" && (
          <mesh position={[0, -0.058, 0]} rotation={[Math.PI / 2, 0, 0]} scale={[1, 0.66, 1]}>
            <torusGeometry args={[0.422, 0.0085, 10, Math.max(28, quality.segments / 2)]} />
            <meshStandardMaterial
              color={perfumePalette.metal}
              metalness={1}
              roughness={0.18}
              envMapIntensity={2.0}
            />
          </mesh>
        )}

        {/* Machined knurl rings on Collar */}
        {part.id === "Collar" && (
          <>
            {[-0.022, 0.004, 0.03].map((ry) => (
              <mesh
                key={ry}
                position={[0, ry, 0]}
                rotation={[Math.PI / 2, 0, 0]}
                scale={[1, 0.78, 1]}
              >
                <torusGeometry args={[0.181, 0.0055, 8, Math.max(24, quality.segments / 2)]} />
                <meshStandardMaterial color={perfumePalette.metal} metalness={1} roughness={0.2} />
              </mesh>
            ))}
          </>
        )}

        {/* Glass threads on BottleNeck */}
        {part.id === "BottleNeck" && (
          <>
            {[-0.015, 0.03].map((ry) => (
              <mesh
                key={ry}
                position={[0, ry, 0]}
                rotation={[Math.PI / 2, 0, 0]}
                scale={[1, 0.78, 1]}
                renderOrder={3}
              >
                <torusGeometry args={[0.144, 0.006, 8, Math.max(24, quality.segments / 2)]} />
                <PartMaterial kind="thinGlass" quality={quality} labelTexture={labelTexture} />
              </mesh>
            ))}
          </>
        )}

        {/* Recessed dark micro-mist orifice on AtomizerNozzle */}
        {part.id === "AtomizerNozzle" && (
          <mesh position={[0, 0.014, 0.068]} rotation={[Math.PI / 2, 0, 0]}>
            <cylinderGeometry args={[0.016, 0.016, 0.028, 14]} />
            <meshStandardMaterial color="#0d0a12" metalness={0.85} roughness={0.35} />
          </mesh>
        )}

        {/* Gold base band & brushed crown medallion on BottleCap */}
        {part.id === "BottleCap" && (
          <>
            <mesh position={[0, -0.194, 0]} rotation={[Math.PI / 2, 0, 0]} scale={[1, 0.78, 1]}>
              <torusGeometry args={[0.228, 0.01, 10, Math.max(28, quality.segments / 2)]} />
              <meshStandardMaterial
                color={perfumePalette.metal}
                metalness={1}
                roughness={0.16}
                envMapIntensity={2.1}
              />
            </mesh>
            <mesh position={[0, 0.243, 0]} rotation={[-Math.PI / 2, 0, 0]} scale={[1, 0.78, 1]}>
              <circleGeometry args={[0.128, Math.max(28, quality.segments / 2)]} />
              <meshStandardMaterial
                color={perfumePalette.metal}
                metalness={1}
                roughness={0.24}
                envMapIntensity={2.0}
              />
            </mesh>
          </>
        )}

        {/* Precision gold crimp ring on SprayPump */}
        {part.id === "SprayPump" && (
          <mesh position={[0, 0.056, 0]} rotation={[Math.PI / 2, 0, 0]} scale={[1, 0.78, 1]}>
            <torusGeometry args={[0.106, 0.0075, 8, Math.max(20, quality.segments / 3)]} />
            <meshStandardMaterial color={perfumePalette.metal} metalness={1} roughness={0.22} />
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
