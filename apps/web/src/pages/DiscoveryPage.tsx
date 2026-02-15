import { DiscoveryEngine } from "@/components/discovery/DiscoveryEngine";
import { Helmet } from "react-helmet-async";

const DiscoveryPage = () => {
    return (
        <div className="min-h-screen bg-background">
            <Helmet>
                <title>Discover Your Aesthetic | Cross Angle Interior</title>
                <meta
                    name="description"
                    content="Uncover your unique design language with our Aesthetic Discovery Engine. A guided journey through instinct, emotion, and texture."
                />
                <meta property="og:title" content="Discover Your Aesthetic | Cross Angle Interior" />
                <meta property="og:description" content="Uncover your unique design language with our Aesthetic Discovery Engine." />
            </Helmet>
            <DiscoveryEngine />
        </div>
    );
}

export default DiscoveryPage;
