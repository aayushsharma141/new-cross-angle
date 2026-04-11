import { DiscoveryAddon } from "@/addons/discovery";
import { Helmet } from "react-helmet-async";

import { Link } from "react-router-dom";
import logoIcon from "@/assets/logo-icon.png";

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

            <DiscoveryAddon />
        </div>
    );
}

export default DiscoveryPage;
