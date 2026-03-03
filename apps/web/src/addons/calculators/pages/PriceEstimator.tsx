import { CostEstimator } from "@/addons/calculators/components/CostEstimator";
import { Helmet } from "react-helmet-async";

const PriceEstimator = () => {
    return (
        <div className="h-screen w-full bg-background overflow-hidden">
            <Helmet>
                <title>Interior Cost Estimator | Cross Angle Interior</title>
                <meta
                    name="description"
                    content="Get a transparent, instant estimate for your interior design project. No hidden costs, just honest pricing."
                />
            </Helmet>
            <CostEstimator />
        </div>
    );
};

export default PriceEstimator;
