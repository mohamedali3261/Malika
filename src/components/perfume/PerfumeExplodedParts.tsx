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
 * Hairline connectors drawn from each separated component back to the
 * product's central axis — the visual grammar of a technical exploded view.
 * One geometry, updated in place: no per-frame allocation.
 */
function Connectors({
  stateRef,
  anchorsRef,
}: {
  stateRef: React.RefObject<ScrollState>;
  anchorsRef: React.RefObject<Record<string, THREE.Vector3>>;
}) {
  const linesRef = useRef<THREE.LineSegments>(null);

  const { geometry, positions } = useMemo(() => {
    const array = new Float32Array(connectorParts.length * 2 * 3);
    const buffer = new THREE.BufferGeometry();
    buffer.setAttribute("position", new THREE.BufferAttribute(array, 3));
    return { geometry: buffer, positions: array };
  }, []);

  useEffect(() => () => geometry.dispose(), [geometry]);

  useFrame(() => {
    const lines = linesRef.current;
    const anchors = anchorsRef.current;
    if (!lines || !anchors) return;

    const progress = stateRef.current?.progress ?? 0;
    const rig = explosionFactor(progress);
    const material = lines.material as THREE.LineBasicMaterial;

    // Connectors only exist while the product is meaningfully apart.
    const visibility = Math.max(0, Math.min(1, (rig - 0.45) / 0.3));
    material.opacity = visibility * 0.32;
    lines.visible = visibility > 0.01;
    if (!lines.visible) return;

    connectorParts.forEach((part, index) => {
      const anchor = anchors[part.id];
      if (!anchor) return;
      const offset = index * 6;
      // from the central axis, at the part's height…
      positions[offset] = 0;
      positions[offset + 1] = anchor.y;
      positions[offset + 2] = 0;
      // …to the component itself
      positions[offset + 3] = anchor.x;
      positions[offset + 4] = anchor.y;
      positions[offset + 5] = anchor.z;
    });

    geometry.attributes.position.needsUpdate = true;
  });

  return (
    <lineSegments ref={linesRef} geometry={geometry} frustumCulled={false} renderOrder={5}>
      <lineBasicMaterial color={perfumePalette.accent} transparent opacity={0} depthWrite={false} />
    </lineSegments>
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
    const visibility = Math.max(0, Math.min(1, (rig - 0.6) / 0.25));

    labelParts.forEach((part) => {
      const group = groupRefs.current[part.id];
      const anchor = anchors[part.id];
      const wrapper = wrapperRefs.current[part.id];
      if (!group || !anchor) return;

      const offset = part.labelOffset ?? [0, 0, 0];
      group.position.set(anchor.x + offset[0], anchor.y + offset[1], anchor.z + offset[2]);
      group.visible = visibility > 0.02;

      if (wrapper) {
        wrapper.style.opacity = String(visibility);
        wrapper.style.transform = `translateX(${(1 - visibility) * 10}px)`;
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
            style={{ pointerEvents: "none", transition: "opacity 160ms linear" }}
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
