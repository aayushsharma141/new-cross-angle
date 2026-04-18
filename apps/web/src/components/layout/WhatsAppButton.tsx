import { MessageCircle } from "lucide-react";
import { useSiteSettings } from "@/hooks/useSiteSettings";

const WhatsAppButton = () => {
  const { settings, loading } = useSiteSettings();
  
  const phoneNumber = settings?.whatsapp || "917909041132";
  const message = encodeURIComponent("Hi! I'm interested in your interior design services.");
  const whatsappUrl = `https://wa.me/${phoneNumber}?text=${message}`;

  if (loading) {
    return null;
  }

  return (
    <a 
      href={whatsappUrl} 
      target="_blank" 
      rel="noopener noreferrer" 
      className="fixed bottom-6 right-6 md:bottom-6 z-50 group"
      aria-label="Chat on WhatsApp"
    >
      <div className="relative">
        <div className="absolute inset-0 bg-[hsl(142,70%,45%)] rounded-full animate-ping opacity-30" />
        
        <div className="flex h-14 w-14 items-center justify-center rounded-full bg-[hsl(142,70%,45%)] shadow-lg transition-transform duration-300 group-hover:scale-110">
          <MessageCircle className="h-7 w-7 text-white" />
        </div>
        
        <div className="absolute right-full mr-3 top-1/2 -translate-y-1/2 bg-foreground text-background px-3 py-2 rounded-lg text-sm font-medium whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
          Chat with us
          <div className="absolute left-full top-1/2 -translate-y-1/2 border-8 border-transparent border-l-foreground" />
        </div>
      </div>
    </a>
  );
};

export default WhatsAppButton;
