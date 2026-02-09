import { StyleQuiz } from "@/components/quiz/StyleQuiz";
import { motion } from "framer-motion";

const StyleQuizPage = () => {
    return (
        <div className="pt-24 min-h-screen bg-background relative overflow-hidden">
            {/* Abstract Background Elements */}
            <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary/5 rounded-full blur-[100px] opacity-50 pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-secondary/5 rounded-full blur-[100px] opacity-50 pointer-events-none" />

            <div className="container relative z-10 mx-auto px-4 py-8 md:py-12">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-center mb-12 space-y-4"
                >
                    <span className="px-4 py-1.5 rounded-full bg-gradient-to-r from-primary/10 to-transparent border border-primary/20 text-primary text-xs font-medium uppercase tracking-widest">
                        Discover Your Aesthetic
                    </span>
                    <h1 className="text-4xl md:text-6xl font-display font-bold text-foreground">
                        What's Your <span className="text-gradient-wine">Design Personality?</span>
                    </h1>
                    <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                        Take our 30-second visual quiz to uncover your unique interior design style and get personalized recommendations.
                    </p>
                </motion.div>

                <StyleQuiz />
            </div>
        </div>
    );
};

export default StyleQuizPage;
