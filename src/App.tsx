import { ReactNode, useEffect, useMemo, useRef, useState } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import InteractivePoints from "./points";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { Group } from "three";
import { div } from "three/tsl";

function CustomOrbitControls() {
  const { camera, gl } = useThree(); // Access camera and renderer
  const controlsRef = useRef<OrbitControls | null>(null);

  useEffect(() => {
    // Initialize OrbitControls
    controlsRef.current = new OrbitControls(camera, gl.domElement);

    // Optional settings for controls
    controlsRef.current.enableDamping = true;
    controlsRef.current.dampingFactor = 0.1;
    controlsRef.current.rotateSpeed = 0.5;

    return () => {
      // Clean up controls on unmount
      controlsRef.current?.dispose();
    };
  }, [camera, gl]);

  // Update the controls every frame
  useFrame(() => controlsRef.current?.update());

  return null;
}

export default function App() {
  // const data = useMemo(() => {
  //   const points: [number, number, number][] = [];
  //   for (let i = 0; i < 2000; i++) {
  //     points.push([
  //       (Math.random() - 0.5) * 20,
  //       (Math.random() - 0.5) * 20,
  //       (Math.random() - 0.5) * 20,
  //     ]);
  //   }
  //   return points;
  // }, []);

  const [data, setPoints] = useState(() => {
    const points: [number, number, number][] = [];
    for (let i = 0; i < 20; i++) {
      points.push([
        (Math.random() - 0.5) * 20,
        (Math.random() - 0.5) * 20,
        (Math.random() - 0.5) * 20,
      ]);
    }
    return points;
  });

  const handleAddPoints = () => {
    const newPoints: [number, number, number][] = [];
    for (let i = 0; i < 20; i++) {
      newPoints.push([
        (Math.random() - 0.5) * 20,
        (Math.random() - 0.5) * 20,
        (Math.random() - 0.5) * 20,
      ]);
    }
    setPoints((prevPoints) => [...prevPoints, ...newPoints]);
  };

  const handleRemovePoints = () => {
    setPoints((prevPoints) => prevPoints.slice(0, prevPoints.length - 20));
  };

  return (
    <div>
      <nav style={{ position: "absolute", zIndex: 1 }}>
        <button onClick={handleAddPoints}>Add points</button>
        <button onClick={handleRemovePoints}>Remove points</button>
      </nav>
      <Canvas
        camera={{
          position: [0.5, 0.5, 0.5], // Position along x, y, and z at 45 degrees
          near: 0.1,
          far: 1000,
        }}
        style={{ height: "100vh", width: "100vw" }}
      >
        <InteractivePoints data={data} />
        <axesHelper args={[5]} />
        <ambientLight />
        <CustomOrbitControls />
      </Canvas>
    </div>
  );
}
