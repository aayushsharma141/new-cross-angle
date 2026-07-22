import { useSiteSettings } from "@/hooks/useSiteSettings";
import { Link } from "@/components/primitives/interactive";

const WhatsAppIcon = () => (
  <svg
    width="100%"
    height="100%"
    viewBox="0 0 16 16"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    aria-hidden="true"
  >
    <path fill="white" d="M13.601 2.326A7.85 7.85 0 0 0 7.994 0C3.627 0 .068 3.558.064 7.926c0 1.399.366 2.76 1.057 3.965L0 16l4.204-1.102a7.9 7.9 0 0 0 3.79.965h.004c4.368 0 7.926-3.558 7.93-7.93A7.9 7.9 0 0 0 13.6 2.326z" />
    <path fill="#25D366" d="M7.994 14.521a6.6 6.6 0 0 1-3.356-.92l-.24-.144-2.494.654.666-2.433-.156-.251a6.56 6.56 0 0 1-1.007-3.505c0-3.626 2.957-6.584 6.591-6.584a6.56 6.56 0 0 1 4.66 1.931 6.56 6.56 0 0 1 1.928 4.66c-.004 3.639-2.961 6.592-6.592 6.592" />
    <path fill="white" d="M11.609 9.587c-.197-.099-1.17-.578-1.353-.646-.182-.065-.315-.099-.445.099-.133.197-.513.646-.627.775-.114.133-.232.148-.43.05-.197-.1-.836-.308-1.592-.985-.59-.525-.985-1.175-1.103-1.372-.114-.198-.011-.304.088-.403.087-.088.197-.232.296-.346.1-.114.133-.198.198-.33.065-.134.034-.248-.015-.347-.05-.099-.445-1.076-.612-1.47-.16-.389-.323-.335-.445-.34-.114-.007-.247-.007-.38-.007a.73.73 0 0 0-.529.247c-.182.198-.691.677-.691 1.654s.71 1.916.81 2.049c.098.133 1.394 2.132 3.383 2.992.47.205.84.326 1.129.418.475.152.904.129 1.246.08.38-.058 1.171-.48 1.338-.943.164-.464.164-.86.114-.943-.049-.084-.182-.133-.38-.232" />
  </svg>
);

const WhatsAppButton = () => {
  const { settings, loading } = useSiteSettings();

  const phoneNumber = settings?.whatsapp || "917909041132";
  const message = encodeURIComponent("Hi! I'm interested in your interior design services.");
  const whatsappUrl = `https://wa.me/${phoneNumber}?text=${message}`;

  if (loading) {
    return null;
  }

  return (
    <Link
      as="a"
      href={whatsappUrl}
      target="_blank"
      rel="noopener noreferrer"
      variant="inherit"
      underline="none"
      className="fixed right-5 z-[999] group md:hidden"
      style={{ bottom: "calc(1.5rem + env(safe-area-inset-bottom, 0px))" }}
      aria-label="Chat on WhatsApp"
    >
      <div className="relative">
        <div className="absolute inset-0 bg-[#25D366] rounded-full animate-ping opacity-30" />

        <div className="flex h-[52px] w-[52px] items-center justify-center p-[2px] bg-transparent drop-shadow-[0_4px_12px_rgba(37,211,102,0.5)] transition-transform duration-300 group-hover:scale-110">
          <WhatsAppIcon />
        </div>

        <div className="absolute right-full mr-3 top-1/2 -translate-y-1/2 bg-foreground text-background px-3 py-2 rounded-lg text-sm font-medium whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
          Chat with us
          <div className="absolute left-full top-1/2 -translate-y-1/2 border-8 border-transparent border-l-foreground" />
        </div>
      </div>
    </Link>
  );
};

export default WhatsAppButton;
