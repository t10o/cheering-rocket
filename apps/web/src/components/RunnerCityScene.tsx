/* eslint-disable react/no-unknown-property */
import { Suspense, useMemo, useRef } from "react";
import { Environment } from "@react-three/drei";
import { Canvas, useFrame } from "@react-three/fiber";
import { type MotionValue, useMotionValueEvent } from "framer-motion";
import type { MutableRefObject } from "react";
import * as THREE from "three";

type Building = {
  position: [number, number, number];
  scale: [number, number, number];
  parallax: number;
  color: string;
};

const BUILDING_COLORS = [
  "#38bdf8",
  "#0ea5e9",
  "#facc15",
  "#fef3c7",
  "#94a3b8",
] as const;

const LOOP_RANGE = 120;
const HALF_RANGE = LOOP_RANGE / 2;
const SCROLL_DISTANCE = LOOP_RANGE;

const createBuilding = (): Building => {
  const x = Math.random() * LOOP_RANGE - HALF_RANGE;
  const y = -3 + Math.random() * 1.5;
  const z = -20 - Math.random() * 40;
  const scaleX = 1.5 + Math.random() * 2;
  const scaleY = 8 + Math.random() * 10;
  const scaleZ = 1.5 + Math.random() * 2;
  const color =
    BUILDING_COLORS[Math.floor(Math.random() * BUILDING_COLORS.length)] ??
    "#38bdf8";
  const depthFactor = 0.5 + Math.random() * 0.8;
  return {
    position: [x, y, z],
    scale: [scaleX, scaleY, scaleZ],
    parallax: depthFactor,
    color,
  };
};

const Buildings = ({
  progressRef,
}: {
  progressRef: MutableRefObject<number>;
}) => {
  const data = useMemo(
    () => Array.from({ length: 70 }, () => createBuilding()),
    [],
  );
  const group = useRef<THREE.Group>(null);
  const lastProgress = useRef(progressRef.current);

  useFrame(() => {
    const root = group.current;
    if (!root) return;

    const currentProgress = progressRef.current;
    const deltaProgress = currentProgress - lastProgress.current;
    lastProgress.current = currentProgress;
    if (deltaProgress === 0) return;

    const offset = deltaProgress * SCROLL_DISTANCE;

    root.children.forEach((child: THREE.Object3D, index: number) => {
      const mesh = child as THREE.Mesh;
      const info = data[index];
      if (!info) return;

      const movement = offset * info.parallax;
      mesh.position.x -= movement;
      mesh.position.y = info.position[1];
      mesh.position.z = info.position[2];

      if (mesh.position.x < -HALF_RANGE) {
        mesh.position.x += LOOP_RANGE;
      } else if (mesh.position.x > HALF_RANGE) {
        mesh.position.x -= LOOP_RANGE;
      }

      info.position[0] = mesh.position.x;
    });
  });

  return (
    <group ref={group} position={[0, -2, 0]}>
      {data.map((building, index) => (
        <mesh
          key={`building-${index}`}
          position={building.position}
          scale={building.scale}
          castShadow
          receiveShadow
        >
          <boxGeometry args={[1, 1, 1]} />
          <meshStandardMaterial
            color={building.color}
            emissive={new THREE.Color(building.color).multiplyScalar(0.08)}
            metalness={0.25}
            roughness={0.55}
          />
        </mesh>
      ))}
    </group>
  );
};

const GlowParticles = ({
  progressRef,
}: {
  progressRef: MutableRefObject<number>;
}) => {
  const count = 80;
  const positions = useMemo(() => {
    const posArray = new Float32Array(count * 3);
    for (let i = 0; i < count; i += 1) {
      posArray[i * 3] = Math.random() * LOOP_RANGE - HALF_RANGE;
      posArray[i * 3 + 1] = Math.random() * 6 + 1;
      posArray[i * 3 + 2] = -15 - Math.random() * 30;
    }
    return posArray;
  }, [count]);

  const parallaxFactors = useMemo(() => {
    const arr = new Float32Array(count);
    for (let i = 0; i < count; i += 1) {
      arr[i] = 0.4 + Math.random() * 0.6;
    }
    return arr;
  }, [count]);

  const pointsRef = useRef<THREE.Points>(null);
  const lastProgress = useRef(progressRef.current);

  useFrame(() => {
    const points = pointsRef.current;
    if (!points) return;

    const geometry = points.geometry as THREE.BufferGeometry | undefined;
    if (!geometry) return;

    const attribute = geometry.getAttribute("position") as
      | THREE.BufferAttribute
      | undefined;
    if (!attribute) return;

    const currentProgress = progressRef.current;
    const deltaProgress = currentProgress - lastProgress.current;
    lastProgress.current = currentProgress;
    if (deltaProgress === 0) return;

    const offset = deltaProgress * SCROLL_DISTANCE;
    const arr = attribute.array as Float32Array;

    for (let i = 0; i < count; i += 1) {
      const idx = i * 3;
      const parallax = parallaxFactors[i] ?? 0;
      let nextX = (arr[idx] ?? 0) - offset * parallax;
      if (nextX < -HALF_RANGE) {
        nextX += LOOP_RANGE;
        arr[idx + 1] = Math.random() * 6 + 1;
        arr[idx + 2] = -15 - Math.random() * 25;
      } else if (nextX > HALF_RANGE) {
        nextX -= LOOP_RANGE;
        arr[idx + 1] = Math.random() * 6 + 1;
        arr[idx + 2] = -15 - Math.random() * 25;
      }
      arr[idx] = nextX;
    }

    attribute.needsUpdate = true;
  });

  return (
    <points ref={pointsRef} position={[0, 0, 0]}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
      </bufferGeometry>
      <pointsMaterial
        color="#fde047"
        size={0.35}
        sizeAttenuation
        transparent
        opacity={0.75}
      />
    </points>
  );
};

type RunnerCitySceneProps = {
  progress: MotionValue<number>;
};

export const RunnerCityScene = ({ progress }: RunnerCitySceneProps) => {
  const progressRef = useRef(0);

  useMotionValueEvent(progress, "change", (latest) => {
    progressRef.current = latest;
  });

  return (
    <div className="pointer-events-none absolute inset-0 -z-10">
      <Canvas camera={{ position: [0, 5, 18], fov: 45 }} dpr={[1, 2]} shadows>
        <color attach="background" args={["#e3f2ff"]} />
        <fog attach="fog" args={["#e3f2ff", 60, 140]} />
        <ambientLight intensity={0.9} color="#ffffff" />
        <directionalLight
          position={[18, 28, 12]}
          intensity={1.4}
          color="#fbbf24"
          castShadow
        />
        <directionalLight
          position={[-12, 18, 8]}
          intensity={0.6}
          color="#60a5fa"
        />
        <Suspense fallback={null}>
          <Buildings progressRef={progressRef} />
          <GlowParticles progressRef={progressRef} />
          <mesh
            position={[0, -3.6, -8]}
            rotation={[-Math.PI / 2, 0, 0]}
            receiveShadow
          >
            <planeGeometry args={[160, 160]} />
            <meshStandardMaterial
              color="#f1f5f9"
              roughness={0.95}
              opacity={0.9}
              transparent
            />
          </mesh>
          <Environment preset="sunset" />
        </Suspense>
      </Canvas>
    </div>
  );
};
