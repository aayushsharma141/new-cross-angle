import { DiscoveryAddon } from "@/addons/discovery";
import { Helmet } from "react-helmet-async";

import { Link } from "react-router-dom";

const DiscoveryPage = () => {
    return (
        <div className="min-h-screen bg-background relative">
            <Helmet>
                <title>Style Discovery | Cross Angle Interior</title>
                <meta
                    name="description"
                    content="Uncover your unique design language with our Style Discovery tool. A guided journey through instinct, emotion, and texture."
                />
                <meta property="og:title" content="Style Discovery | Cross Angle Interior" />
                <meta property="og:description" content="Uncover your unique design language with our Style Discovery tool." />
            </Helmet>

            <Link to="/" className="fixed top-6 left-6 z-[100] hover:opacity-80 transition-opacity">
                <img src="/logo.png" alt="CrossAngle Logo" className="h-8 md:h-10 w-auto" />
            </Link>

            <DiscoveryAddon />
        </div>
    );
}

export default DiscoveryPage;
