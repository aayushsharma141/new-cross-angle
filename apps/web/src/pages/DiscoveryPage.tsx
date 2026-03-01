import { DiscoveryEngine } from "@/components/discovery/DiscoveryEngine";
import { Helmet } from "react-helmet-async";

import { Link } from "react-router-dom";

const DiscoveryPage = () => {
    return (
        <div className="min-h-screen bg-background relative">
            <Helmet>
                <title>Spatial Identity OS | Cross Angle Interior</title>
                <meta
                    name="description"
                    content="Uncover your unique design language with Spatial Identity OS. A guided journey through instinct, emotion, and texture."
                />
                <meta property="og:title" content="Spatial Identity OS | Cross Angle Interior" />
                <meta property="og:description" content="Uncover your unique design language with Spatial Identity OS." />
            </Helmet>

            <Link to="/" className="fixed top-6 left-6 z-[100] hover:opacity-80 transition-opacity">
                <img src="/logo.png" alt="CrossAngle Logo" className="h-8 md:h-10 w-auto" />
            </Link>

            <DiscoveryEngine />
        </div>
    );
}

export default DiscoveryPage;
