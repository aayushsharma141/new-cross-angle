import React from "react";

export const MeshGradientBg = () => {
  return (
    <div
      className="absolute inset-0 overflow-hidden pointer-events-none z-0"
      aria-hidden="true"
    >
      <style>{`
        @keyframes drift1 {
          0% { transform: translate(0px, 0px) scale(1); }
          33% { transform: translate(4vw, -6vh) scale(1.15); }
          66% { transform: translate(-3vw, 4vh) scale(0.9); }
          100% { transform: translate(0px, 0px) scale(1); }
        }
        @keyframes drift2 {
          0% { transform: translate(0px, 0px) scale(1); }
          50% { transform: translate(-5vw, 5vh) scale(1.2); }
          100% { transform: translate(0px, 0px) scale(1); }
        }
        .mesh-glow-1 {
          background: radial-gradient(circle, rgba(209, 175, 110, 0.04) 0%, transparent 70%);
          animation: drift1 32s ease-in-out infinite;
        }
        .mesh-glow-2 {
          background: radial-gradient(circle, rgba(250, 240, 230, 0.03) 0%, transparent 65%);
          animation: drift2 38s ease-in-out infinite;
        }
      `}</style>
      <div className="absolute top-[10%] left-[20%] w-[60vw] h-[60vw] rounded-full blur-[120px] mesh-glow-1" />
      <div className="absolute bottom-[20%] right-[10%] w-[50vw] h-[50vw] rounded-full blur-[100px] mesh-glow-2" />
    </div>
  );
};
