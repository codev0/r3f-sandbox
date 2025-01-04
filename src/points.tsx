import { useState, useMemo, useRef } from "react";
import {
  WebGLRenderTarget,
  RGBAFormat,
  UnsignedByteType,
  Scene,
  Color,
  Vector2,
} from "three";
import {
  createPortal,
  ThreeEvent,
  useFrame,
  useThree,
} from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";

const InteractivePoints = ({ data }: { data: [number, number, number][] }) => {
  const [hoveredPoint, setHoveredPoint] = useState(null);
  const { size, camera, gl } = useThree();
  const mouse = new Vector2();
  const controlsRef = useRef<OrbitControls | null>(null);

  // Create picking scene
  const pickingScene = useMemo(() => new Scene(), []);

  // Create picking render target
  const pickingTarget = useMemo(() => {
    return new WebGLRenderTarget(size.width, size.height, {
      format: RGBAFormat,
      type: UnsignedByteType,
    });
  }, [size.width, size.height]);

  // Generate positions and colors for points
  const { positions, pickingColors, visibleColors } = useMemo(() => {
    const positions = new Float32Array(data.length * 3);
    const pickingColors = new Float32Array(data.length * 3);
    const visibleColors = new Float32Array(data.length * 3).fill(0);

    // Set purple color for all visible points
    const purpleColor = new Color("#800080");

    data.forEach((point, i) => {
      // Set positions
      positions[i * 3] = point[0];
      positions[i * 3 + 1] = point[1];
      positions[i * 3 + 2] = point[2];

      // Generate unique color for picking
      const id = i + 1;
      const r = (id & 0xff) / 255;
      const g = ((id >> 8) & 0xff) / 255;
      const b = ((id >> 16) & 0xff) / 255;

      pickingColors[i * 3] = r;
      pickingColors[i * 3 + 1] = g;
      pickingColors[i * 3 + 2] = b;

      // Set visible color (purple)
      visibleColors[i * 3] = purpleColor.r;
      visibleColors[i * 3 + 1] = purpleColor.g;
      visibleColors[i * 3 + 2] = purpleColor.b;
    });

    return { positions, pickingColors, visibleColors };
  }, [data]);

  const pointsRef = useRef(null);
  const pixelBuffer = useMemo(() => new Uint8Array(4), []);

  useFrame((state) => {
    if (!controlsRef.current?.isDragging) {
      const { gl } = state;

      // Clear previous render target
      gl.setRenderTarget(pickingTarget);
      gl.clear();

      // Render picking scene
      gl.render(pickingScene, camera);

      // Read pixel under mouse
      const x = (mouse.x * 0.5 + 0.5) * pickingTarget.width;
      const y = (mouse.y * 0.5 + 0.5) * pickingTarget.height;

      // Check if coordinates are within bounds
      if (x >= 0 && x < size.width && y >= 0 && y < size.height) {
        gl.readRenderTargetPixels(pickingTarget, x, y, 1, 1, pixelBuffer);

        // Only process if alpha channel indicates a point was hit
        if (pixelBuffer[3] > 0) {
          const id =
            pixelBuffer[0] + (pixelBuffer[1] << 8) + (pixelBuffer[2] << 16) - 1;
          if (id >= 0 && id < data.length) {
            console.log(id);

            setHoveredPoint(id);
          } else {
            setHoveredPoint(null);
          }
        } else {
          setHoveredPoint(null);
        }
      }

      // Reset render target
      gl.setRenderTarget(null);
    }
  });

  const handlePointerMove = (event: ThreeEvent<MouseEvent>) => {
    event.stopPropagation();
    mouse.x = (event.clientX / gl.domElement.clientWidth) * 2 - 1;
    mouse.y = -(event.clientY / gl.domElement.clientHeight) * 2 + 1;
  };

  return (
    <group>
      <OrbitControls
        ref={controlsRef}
        autoRotate={true}
        autoRotateSpeed={0.5}
        enableDamping={true}
        dampingFactor={0.05}
      />
      {/* Visible points */}
      <points ref={pointsRef} onPointerMove={handlePointerMove}>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            count={data.length}
            array={positions}
            itemSize={3}
          />
          <bufferAttribute
            attach="attributes-color"
            count={data.length}
            array={visibleColors}
            itemSize={3}
          />
        </bufferGeometry>
        <pointsMaterial size={5} color="#800080" sizeAttenuation={false} />
      </points>

      {/* Picking scene rendered to offscreen target */}
      {createPortal(
        <points>
          <bufferGeometry>
            <bufferAttribute
              attach="attributes-position"
              count={data.length}
              array={positions}
              itemSize={3}
            />
            <bufferAttribute
              attach="attributes-color"
              count={data.length}
              array={pickingColors}
              itemSize={3}
            />
          </bufferGeometry>
          <pointsMaterial size={5} vertexColors sizeAttenuation={false} />
        </points>,
        pickingScene
      )}

      {/* Hover indicator */}
      {hoveredPoint !== null && (
        <mesh
          position={[
            data[hoveredPoint][0],
            data[hoveredPoint][1],
            data[hoveredPoint][2],
          ]}
        >
          <sphereGeometry args={[0.1]} />
          <meshBasicMaterial color="yellow" />
        </mesh>
      )}
    </group>
  );
};

export default InteractivePoints;
