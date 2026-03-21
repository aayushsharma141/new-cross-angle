import { useEffect, useRef } from "react";

interface SquaresProps {
  speed?: number;
  opacity?: number;
  className?: string;
}

const Squares = ({ speed = 0.05, opacity = 0.1, className = "" }: SquaresProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationId: number;
    let offset = 0;
    const squareSize = 40;

    const resize = () => {
      canvas.width = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
    };

    const draw = () => {
      if (!ctx || !canvas) return;
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      ctx.strokeStyle = `rgba(255, 255, 255, ${opacity})`;
      ctx.lineWidth = 0.5;

      const cols = Math.ceil(canvas.width / squareSize) + 2;
      const rows = Math.ceil(canvas.height / squareSize) + 2;
      const offsetX = offset % squareSize;
      const offsetY = offset % squareSize;

      for (let i = -1; i < cols; i++) {
        for (let j = -1; j < rows; j++) {
          ctx.strokeRect(
            i * squareSize - offsetX,
            j * squareSize - offsetY,
            squareSize,
            squareSize
          );
        }
      }

      offset += speed;
      animationId = requestAnimationFrame(draw);
    };

    resize();
    window.addEventListener("resize", resize);
    draw();

    return () => {
      window.removeEventListener("resize", resize);
      cancelAnimationFrame(animationId);
    };
  }, [speed, opacity]);

  return (
    <canvas
      ref={canvasRef}
      className={`absolute inset-0 w-full h-full pointer-events-none ${className}`}
      style={{ zIndex: 0 }}
    />
  );
};

export default Squares;
