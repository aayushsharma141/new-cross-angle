import { motion } from "framer-motion";
import { Button } from "@/components/ui/primitives/button";
import { MessageCircle, Calendar } from "lucide-react";
import { Link } from "react-router-dom";
import { useSiteSettings } from "@/hooks/useSiteSettings";

const HubFinalCTA = () => {
  const { settings } = useSiteSettings();
  const whatsapp = settings?.whatsapp || "917909041132";
  return (
    <div className="relative h-screen w-full overflow-hidden bg-black">
      {/* Background Stage */}
      <motion.div 
        initial={{ scale: 1.1 }}
        whileInView={{ scale: 1 }}
        transition={{ duration: 2 }}
        className="absolute inset-0"
      >
        <div 
          className="h-full w-full bg-cover bg-center bg-no-repeat opacity-40 brightness-50"
          style={{ backgroundImage: `url('https://static.wixstatic.com/media/59fa67_d16a3e2cd29944beac603524f8290acb~mv2.jpg/v1/fill/w_1000%2Ch_844%2Cal_c%2Cq_85%2Cusm_0.66_1.00_0.01/59fa67_d16a3e2cd29944beac603524f8290acb~mv2.jpg')` }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent" />
      </motion.div>

      {/* Content Stage */}
      <div className="relative z-10 flex h-full flex-col items-center justify-center px-6 text-center">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 1, delay: 0.5 }}
          className="max-w-3xl space-y-12"
        >
          <div className="space-y-6">
            <span className="text-[11px] uppercase tracking-[0.5em] text-site-gold">Your Turn</span>
            <h2 className="text-4xl font-extralight tracking-tight text-white md:text-7xl">
              Your space is ready for its<br />
              <span className="italic">next chapter.</span>
            </h2>
            <p className="mx-auto max-w-lg text-lg font-light text-white/50">
              Transform your vision into an experienced reality. 
              Let's craft the home that reflects your true identity.
            </p>
          </div>

          <div className="flex flex-col items-center justify-center gap-6 sm:flex-row">
            <Link to="/contact-us">
              <Button 
                size="lg" 
                className="group h-16 w-full sm:w-auto rounded-none bg-white px-12 text-[11px] uppercase tracking-[0.3em] text-black transition-all hover:bg-site-gold hover:text-white"
              >
                <Calendar className="mr-3 h-4 w-4" />
                Book Free Consultation
              </Button>
            </Link>
            <a href={`https://wa.me/${whatsapp}`} target="_blank" rel="noopener noreferrer">
              <Button 
                variant="outline" 
                size="lg" 
                className="h-16 w-full sm:w-auto rounded-none border-white/20 bg-black/40 px-12 text-[11px] uppercase tracking-[0.3em] text-white backdrop-blur-xl transition-all hover:bg-[#25D366] hover:border-[#25D366]"
              >
                <MessageCircle className="mr-3 h-4 w-4 text-[#25D366] group-hover:text-white" />
                WhatsApp Chat
              </Button>
            </a>
          </div>
        </motion.div>
      </div>

      {/* Decorative Elements */}
      <div className="absolute bottom-10 left-10 flex flex-col gap-4">
        <div className="h-20 w-[1px] bg-gradient-to-t from-site-gold via-white/10 to-transparent" />
        <span className="text-[9px] uppercase tracking-[0.5em] text-white/60 [writing-mode:vertical-lr]">Cross Angle Design</span>
      </div>
    </div>
  );
};

export default HubFinalCTA;
