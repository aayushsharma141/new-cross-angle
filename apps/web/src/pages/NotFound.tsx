import { useLocation, Link } from "react-router-dom";
import { useEffect } from "react";
import { Helmet } from "react-helmet-async";
import { MediaSlot } from "@/components/ui/enhanced/MediaSlot";

const NotFoundGlass = () => {
  const location = useLocation();

  useEffect(() => {
    console.error(`404: Non-existent route: ${location.pathname}`);
  }, [location.pathname]);

  return (
    <>
      <Helmet>
        <title>404 — Page Not Found | Cross Angle Interior</title>
        <meta name="description" content="The page you're looking for doesn't exist. Return to Cross Angle Interior's homepage." />
        <meta name="robots" content="noindex" />
      </Helmet>
      <main
        id="main-content"
        className="relative flex min-h-screen items-center justify-center p-6 bg-[#050505]"
      >
        <MediaSlot
          assetKey="not_found_bg"
          fallbackUrl="/reality_render.jpg"
          alt=""
          className="absolute inset-0 h-full w-full object-cover opacity-40"
        />
        <div className="text-center rounded-2xl border border-white/20 bg-white/30 p-10 shadow-2xl backdrop-blur-md md:p-16" role="alert">
          <h1 className="mb-4 text-7xl font-extrabold tracking-tighter text-white drop-shadow-lg md:text-9xl">
            404
          </h1>

          <p className="mb-3 text-xl font-semibold text-white drop-shadow-md md:text-2xl">
            Lost in Space?
          </p>

          <p className="mb-10 max-w-md text-base text-white/90 drop-shadow-sm">
            The coordinates you entered don't lead anywhere. We couldn't find
            a page for <span className="font-mono text-white bg-black/30 p-1 rounded">"{location.pathname}"</span>.
          </p>

          <Link
            to="/"
            className="inline-flex h-12 items-center justify-center rounded-xl bg-white/90 px-8 text-base font-semibold text-black transition-all hover:bg-white active:scale-[0.98]"
          >
            Return Home
          </Link>
        </div>
      </main>
    </>
  );
};

export default NotFoundGlass;