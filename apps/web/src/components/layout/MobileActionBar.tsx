import { useSiteSettings } from "@/hooks/useSiteSettings";
import { useCookieConsent } from "@/components/cookies/CookieConsentProvider";
import { SITE_CONSTANTS } from "@/lib/constants";

const WhatsAppIcon = () => (
  <svg width="20" height="20" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
    <path fill="currentColor" d="M13.601 2.326A7.85 7.85 0 0 0 7.994 0C3.627 0 .068 3.558.064 7.926c0 1.399.366 2.76 1.057 3.965L0 16l4.204-1.102a7.9 7.9 0 0 0 3.79.965h.004c4.368 0 7.926-3.558 7.93-7.93A7.9 7.9 0 0 0 13.6 2.326z" />
    <path fill="#25D366" d="M7.994 14.521a6.6 6.6 0 0 1-3.356-.92l-.24-.144-2.494.654.666-2.433-.156-.251a6.56 6.56 0 0 1-1.007-3.505c0-3.626 2.957-6.584 6.591-6.584a6.56 6.56 0 0 1 4.66 1.931 6.56 6.56 0 0 1 1.928 4.66c-.004 3.639-2.961 6.592-6.592 6.592" />
    <path fill="currentColor" d="M11.609 9.587c-.197-.099-1.17-.578-1.353-.646-.182-.065-.315-.099-.445.099-.133.197-.513.646-.627.775-.114.133-.232.148-.43.05-.197-.1-.836-.308-1.592-.985-.59-.525-.985-1.175-1.103-1.372-.114-.198-.011-.304.088-.403.087-.088.197-.232.296-.346.1-.114.133-.198.198-.33.065-.134.034-.248-.015-.347-.05-.099-.445-1.076-.612-1.47-.16-.389-.323-.335-.445-.34-.114-.007-.247-.007-.38-.007a.73.73 0 0 0-.529.247c-.182.198-.691.677-.691 1.654s.71 1.916.81 2.049c.098.133 1.394 2.132 3.383 2.992.47.205.84.326 1.129.418.475.152.904.129 1.246.08.38-.058 1.171-.48 1.338-.943.164-.464.164-.86.114-.943-.049-.084-.182-.133-.38-.232" />
  </svg>
);

const MobileActionBar = () => {
  const { settings, loading } = useSiteSettings();
  const { hasChoice } = useCookieConsent();
  
  if (loading || !hasChoice) return null;
  
  const whatsappNumber = settings?.whatsapp || SITE_CONSTANTS.defaultWhatsApp;
  const phoneNumber = settings?.phone || whatsappNumber;
  const message = encodeURIComponent("Hi! I'm interested in your interior design services.");
  const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${message}`;
  const callUrl = `tel:${phoneNumber.replace(/\s+/g, '')}`;
  
  return (
    <div 
      className="md:hidden fixed bottom-0 left-0 right-0 z-[110] flex bg-[#0A0A0A]/95 backdrop-blur-xl border-t border-white/[0.08]"
      style={{ paddingBottom: "env(safe-area-inset-bottom, 0px)" }}
    >
      <a 
        href={callUrl} 
        className="flex-1 flex items-center justify-center py-4 font-medium text-[13px] tracking-wide border-r border-white/[0.08] text-white hover:bg-white/[0.03] transition-colors"
      >
        <svg className="w-[18px] h-[18px] mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" /></svg>
        Call Us
      </a>
      <a 
        href={whatsappUrl} 
        target="_blank"
        rel="noopener noreferrer"
        className="flex-1 flex items-center justify-center py-4 font-medium text-[13px] tracking-wide text-white hover:bg-[#25D366]/10 transition-colors"
      >
        <span className="mr-2 text-white"><WhatsAppIcon /></span>
        WhatsApp
      </a>
    </div>
  );
};

export default MobileActionBar;
