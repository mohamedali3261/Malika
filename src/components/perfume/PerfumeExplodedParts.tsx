import { Html } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import { useEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import { partsConfig, perfumePalette, type QualityProfile } from "@/config/perfumeModelConfig";
import { useLang } from "@/i18n/LanguageContext";
import { explosionFactor } from "@/utils/perfumeTransforms";
import type { ScrollState } from "@/hooks/usePerfumeScrollAnimation";

const connectorParts = partsConfig.filter((part) => part.connector);
const labelParts = partsConfig.filter((part) => part.showLabel && part.label && part.labelOffset);

/**
 * World-space hairline connectors + glowing anchor dots drawn from the bottle's
 * central axis out to each separated component.
 */
function Connectors({
  stateRef,
  anchorsRef,
}: {
  stateRef: React.RefObject<ScrollState>;
  anchorsRef: React.RefObject<Record<string, THREE.Vector3>>;
}) {
  const linesRef = useRef<THREE.LineSegments>(null);
  const dotsRef = useRef<THREE.Points>(null);

  const { lineGeo, linePos, dotGeo, dotPos } = useMemo(() => {
    const lArr = new Float32Array(connectorParts.length * 2 * 3);
    const lBuf = new THREE.BufferGeometry();
    lBuf.setAttribute("position", new THREE.BufferAttribute(lArr, 3));

    const dArr = new Float32Array(connectorParts.length * 3);
    const dBuf = new THREE.BufferGeometry();
    dBuf.setAttribute("position", new THREE.BufferAttribute(dArr, 3));

    return { lineGeo: lBuf, linePos: lArr, dotGeo: dBuf, dotPos: dArr };
  }, []);

  useEffect(
    () => () => {
      lineGeo.dispose();
      dotGeo.dispose();
    },
    [lineGeo, dotGeo]
  );

  useFrame(() => {
    const lines = linesRef.current;
    const dots = dotsRef.current;
    const anchors = anchorsRef.current;
    if (!lines || !dots || !anchors) return;

    const progress = stateRef.current?.progress ?? 0;
    const rig = explosionFactor(progress);
    const lineMat = lines.material as THREE.LineBasicMaterial;
    const dotMat = dots.material as THREE.PointsMaterial;

    const visibility = Math.max(0, Math.min(1, (rig - 0.42) / 0.28));
    lineMat.opacity = visibility * 0.38;
    dotMat.opacity = visibility * 0.85;
    lines.visible = visibility > 0.01;
    dots.visible = visibility > 0.01;
    if (!lines.visible) return;

    const spineX = anchors.BottleGlass?.x ?? 0;
    const spineZ = anchors.BottleGlass?.z ?? 0;

    connectorParts.forEach((part, index) => {
      const anchor = anchors[part.id];
      if (!anchor) return;
      const offset = index * 6;
      linePos[offset] = spineX;
      linePos[offset + 1] = anchor.y;
      linePos[offset + 2] = spineZ;
      linePos[offset + 3] = anchor.x;
      linePos[offset + 4] = anchor.y;
      linePos[offset + 5] = anchor.z;

      const dOffset = index * 3;
      dotPos[dOffset] = anchor.x;
      dotPos[dOffset + 1] = anchor.y;
      dotPos[dOffset + 2] = anchor.z;
    });

    lineGeo.attributes.position.needsUpdate = true;
    dotGeo.attributes.position.needsUpdate = true;
  });

  return (
    <group renderOrder={8}>
      <lineSegments ref={linesRef} geometry={lineGeo} frustumCulled={false}>
        <lineBasicMaterial
          color={perfumePalette.accent}
          transparent
          opacity={0}
          depthWrite={false}
          depthTest={false}
        />
      </lineSegments>
      <points ref={dotsRef} geometry={dotGeo} frustumCulled={false}>
        <pointsMaterial
          color={perfumePalette.accent}
          size={0.032}
          sizeAttenuation
          transparent
          opacity={0}
          depthWrite={false}
          depthTest={false}
        />
      </points>
    </group>
  );
}

/** Restrained technical callouts, rendered as DOM for crisp bilingual text. */
function TechnicalLabels({
  stateRef,
  anchorsRef,
}: {
  stateRef: React.RefObject<ScrollState>;
  anchorsRef: React.RefObject<Record<string, THREE.Vector3>>;
}) {
  const { l } = useLang();
  const groupRefs = useRef<Record<string, THREE.Group | null>>({});
  const wrapperRefs = useRef<Record<string, HTMLDivElement | null>>({});

  useFrame(() => {
    const anchors = anchorsRef.current;
    if (!anchors) return;
    const progress = stateRef.current?.progress ?? 0;
    const rig = explosionFactor(progress);
    const visibility = Math.max(0, Math.min(1, (rig - 0.56) / 0.25));

    labelParts.forEach((part) => {
      const group = groupRefs.current[part.id];
      const anchor = anchors[part.id];
      const wrapper = wrapperRefs.current[part.id];
      if (!group || !anchor) return;

      const offset = part.labelOffset ?? [0, 0, 0];
      group.position.set(
        anchor.x + offset[0] * 0.92,
        anchor.y + offset[1] * 0.92,
        anchor.z + offset[2] * 0.92
      );
      group.visible = visibility > 0.02;

      if (wrapper) {
        wrapper.style.opacity = String(visibility);
        wrapper.style.transform = `translate3d(${((1 - visibility) * 8).toFixed(1)}px, 0, 0)`;
      }
    });
  });

  return (
    <>
      {labelParts.map((part) => (
        <group
          key={part.id}
          ref={(node) => {
            groupRefs.current[part.id] = node;
          }}
          visible={false}
        >
          <Html
            center
            distanceFactor={3.1}
            zIndexRange={[20, 0]}
            style={{ pointerEvents: "none", transition: "opacity 140ms linear" }}
            wrapperClass="perfume-label-wrapper"
          >
            <div
              ref={(node) => {
                wrapperRefs.current[part.id] = node;
              }}
              className="perfume-label"
            >
              <span className="perfume-label__dot" />
              <span className="perfume-label__text">{part.label ? l(part.label) : part.id}</span>
            </div>
          </Html>
        </group>
      ))}
    </>
  );
}

interface Props {
  stateRef: React.RefObject<ScrollState>;
  quality: QualityProfile;
  anchorsRef: React.RefObject<Record<string, THREE.Vector3>>;
}

export function PerfumeExplodedParts({ stateRef, quality, anchorsRef }: Props) {
  return (
    <>
      {quality.connectors && <Connectors stateRef={stateRef} anchorsRef={anchorsRef} />}
      {quality.labels && <TechnicalLabels stateRef={stateRef} anchorsRef={anchorsRef} />}
    </>
  );
}
