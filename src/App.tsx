import { ReactNode, useEffect, useMemo, useRef, useState } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import InteractivePoints from "./points";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { Group } from "three";

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

const generateRandomPoints = (minCount = 50, maxCount = 200, range = 5) => {
  const count =
    Math.floor(Math.random() * (maxCount - minCount + 1)) + minCount;
  return {
    points: Array.from({ length: count }, () => [
      (Math.random() - 0.5) * range,
      (Math.random() - 0.5) * range,
      (Math.random() - 0.5) * range,
    ]),
    count,
  };
};

export default function App() {
  const [pointsData, setPointsData] = useState(() =>
    generateRandomPoints(50, 200)
  );

  const handleClick = () => {
    setPointsData(generateRandomPoints(50, 200))
  }

  return (
    <>
      <nav>
        <button onClick={handleClick}>Click</button>
      </nav>
      <Canvas
        camera={{
          position: [0.5, 0.5, 0.5], // Position along x, y, and z at 45 degrees
          near: 0.1,
          far: 1000,
        }}
        style={{ height: "100vh", width: "100vw" }}
      >
        <InteractivePoints data={pointsData.points} />
        <axesHelper args={[5]} />
        <ambientLight />
      </Canvas>
    </>
  );
}
