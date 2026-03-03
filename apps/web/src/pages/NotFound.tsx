import { useLocation, Link } from "react-router-dom";
import { useEffect } from "react";

const NotFoundGlass = () => {
  const location = useLocation();

  useEffect(() => {
    console.error(`404: Non-existent route: ${location.pathname}`);
  }, [location.pathname]);

  return (
    <div 
      className="flex min-h-screen items-center justify-center p-6 bg-cover bg-center bg-no-repeat"
      style={{
        // Replace with your actual background image filename/path
        backgroundImage: "url('/404-background.jpg')",
      }}
    >
      {/* This is the "Glass" container. Key classes:
        - backdrop-blur-md (The frosting effect)
        - bg-white/20 (A semi-transparent background color)
        - border-white/20 (Subtle borders sell the effect)
      */}
      <div className="text-center rounded-2xl border border-white/20 bg-white/30 p-10 shadow-2xl backdrop-blur-md md:p-16" role="alert">
        {/* Large 404 text, maybe use a lighter color to match the aesthetic */}
        <h1 className="mb-4 text-7xl font-extrabold tracking-tighter text-white drop-shadow-lg md:text-9xl">
          404
        </h1>
        
        <h2 className="mb-3 text-xl font-semibold text-white drop-shadow-md md:text-2xl">
          Lost in Space?
        </h2>
        
        {/* Text colors are set to white for contrast against the blurry background */}
        <p className="mb-10 max-w-md text-base text-white/90 drop-shadow-sm">
          The coordinates you entered don't lead anywhere. We couldn't find 
          a page for <span className="font-mono text-white bg-black/30 p-1 rounded">"{location.pathname}"</span>.
        </p>
        
        {/* A light-colored button for maximum visibility on a blurry backdrop */}
        <Link
          to="/"
          className="inline-flex h-12 items-center justify-center rounded-xl bg-white/90 px-8 text-base font-semibold text-black transition-all hover:bg-white active:scale-[0.98]"
        >
          Return Home
        </Link>
      </div>
    </div>
  );
};

export default NotFoundGlass;