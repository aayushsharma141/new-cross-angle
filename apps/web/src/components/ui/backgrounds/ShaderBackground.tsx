import { ShaderGradientCanvas, ShaderGradient } from "@shadergradient/react";
import { useEffect, useRef } from "react";

const NoiseOverlay = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d", { alpha: true });
    if (!ctx) return;

    const w = 128;
    const h = 128;
    canvas.width = w;
    canvas.height = h;

    const imageData = ctx.createImageData(w, h);
    const data = imageData.data;

    for (let i = 0; i < data.length; i += 4) {
      const v = Math.random() * 255;
      data[i] = v;
      data[i + 1] = v;
      data[i + 2] = v;
      data[i + 3] = 255;
    }

    ctx.putImageData(imageData, 0, 0);
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full pointer-events-none z-30"
      style={{
        opacity: 0.15,
        mixBlendMode: "overlay",
        imageRendering: "pixelated",
      }}
      aria-hidden="true"
    />
  );
};

export const ShaderBackground = () => {
  return (
    <div className="absolute inset-0 z-0 overflow-hidden bg-[#060606]">
      {/* 2. Large radial spotlight behind form */}
      <div
        className="pointer-events-none absolute left-1/2 top-1/2 z-10 -translate-x-1/2 -translate-y-1/2"
        style={{
          width: "900px",
          height: "900px",
          background: "radial-gradient(ellipse at center, rgba(184,154,99,0.08) 0%, transparent 70%)",
          filter: "blur(250px)",
          opacity: 0.12,
        }}
        aria-hidden="true"
      />
      
      {/* 3. Shader Gradient */}
      <ShaderGradientCanvas
        style={{ position: "absolute", inset: 0, zIndex: 20, pointerEvents: "none" }}
        pixelDensity={1}
        fov={45}
        pointerEvents="none"
      >
        <ShaderGradient 
          control="props"
          animate="on"
          axesHelper="off"
          brightness={0.6}
          cAzimuthAngle={180}
          cDistance={3.6}
          cPolarAngle={90}
          cameraZoom={1}
          color1="#060606"
          color2="#3D0F18"
          color3="#7E6852"
          destination="onCanvas"
          embedMode="off"
          envPreset="lobby"
          format="gif"
          fov={45}
          frameRate={10}
          gizmoHelper="hide"
          grain="on"
          lightType="3d"
          pixelDensity={1}
          positionX={-1.4}
          positionY={0}
          positionZ={0}
          range="disabled"
          rangeEnd={40}
          rangeStart={0}
          reflection={0.15}
          rotationX={0}
          rotationY={10}
          rotationZ={50}
          shader="defaults"
          type="plane"
          uAmplitude={1}
          uDensity={1.3}
          uFrequency={5.5}
          uSpeed={0.05}
          uStrength={4}
          uTime={0}
          wireframe={false}
        />
      </ShaderGradientCanvas>

      {/* 4. Film Grain */}
      <NoiseOverlay />
    </div>
  );
};
