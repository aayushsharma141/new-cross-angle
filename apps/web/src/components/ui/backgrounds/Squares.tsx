import { useRef, useEffect, useState } from 'react';

export const Squares = ({
  direction = 'right', // 'diagonal', 'up', 'down', 'left', 'right'
  speed = 1,
  borderColor = '#333',
  squareSize = 40,
  hoverFillColor = '#222',
}: {
  direction?: 'diagonal' | 'up' | 'down' | 'left' | 'right';
  speed?: number;
  borderColor?: string;
  squareSize?: number;
  hoverFillColor?: string;
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const requestRef = useRef<number>();
  const numSquaresX = useRef<number>(0);
  const numSquaresY = useRef<number>(0);
  const gridOffset = useRef({ x: 0, y: 0 });
  const hoveredSquare = useRef<{ x: number, y: number } | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const resizeCanvas = () => {
      canvas.width = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
      numSquaresX.current = Math.ceil(canvas.width / squareSize) + 1;
      numSquaresY.current = Math.ceil(canvas.height / squareSize) + 1;
    };

    window.addEventListener('resize', resizeCanvas);
    resizeCanvas();

    const drawGrid = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const startX = Math.floor(gridOffset.current.x / squareSize) * squareSize;
      const startY = Math.floor(gridOffset.current.y / squareSize) * squareSize;

      for (let x = 0; x < numSquaresX.current; x++) {
        for (let y = 0; y < numSquaresY.current; y++) {
          const squareX = startX + (x * squareSize) - (gridOffset.current.x % squareSize);
          const squareY = startY + (y * squareSize) - (gridOffset.current.y % squareSize);

          if (
            hoveredSquare.current &&
            Math.floor((squareX + gridOffset.current.x) / squareSize) === hoveredSquare.current.x &&
            Math.floor((squareY + gridOffset.current.y) / squareSize) === hoveredSquare.current.y
          ) {
            ctx.fillStyle = hoverFillColor;
            ctx.fillRect(squareX, squareY, squareSize, squareSize);
          }

          ctx.strokeStyle = borderColor;
          ctx.strokeRect(squareX, squareY, squareSize, squareSize);
        }
      }
    };

    const updateAnimation = () => {
      let effectiveSpeed = Math.max(speed, 0.1);
      switch (direction) {
        case 'diagonal':
          gridOffset.current.x -= effectiveSpeed;
          gridOffset.current.y -= effectiveSpeed;
          break;
        case 'up':
          gridOffset.current.y -= effectiveSpeed;
          break;
        case 'down':
          gridOffset.current.y += effectiveSpeed;
          break;
        case 'left':
          gridOffset.current.x -= effectiveSpeed;
          break;
        case 'right':
          gridOffset.current.x += effectiveSpeed;
          break;
      }
      
      if (Math.abs(gridOffset.current.x) > squareSize) gridOffset.current.x %= squareSize;
      if (Math.abs(gridOffset.current.y) > squareSize) gridOffset.current.y %= squareSize;

      drawGrid();
      requestRef.current = requestAnimationFrame(updateAnimation);
    };

    const handleMouseMove = (event: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      const mouseX = event.clientX - rect.left;
      const mouseY = event.clientY - rect.top;
      
      const hoveredX = Math.floor((mouseX + gridOffset.current.x) / squareSize);
      const hoveredY = Math.floor((mouseY + gridOffset.current.y) / squareSize);
      
      hoveredSquare.current = { x: hoveredX, y: hoveredY };
    };

    const handleMouseLeave = () => {
      hoveredSquare.current = null;
    };

    canvas.addEventListener('mousemove', handleMouseMove);
    canvas.addEventListener('mouseleave', handleMouseLeave);

    requestRef.current = requestAnimationFrame(updateAnimation);

    return () => {
      window.removeEventListener('resize', resizeCanvas);
      canvas.removeEventListener('mousemove', handleMouseMove);
      canvas.removeEventListener('mouseleave', handleMouseLeave);
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
    };
  }, [direction, speed, borderColor, hoverFillColor, squareSize]);

  return <canvas ref={canvasRef} className="w-full h-full border-none block" />;
};
