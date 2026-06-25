const fs = require('fs');

const path = 'c:\\Users\\aayus\\Desktop\\main\\apps\\web\\src\\components\\layout\\Footer.tsx';
let content = fs.readFileSync(path, 'utf-8');

// 1. Update lucide-react import
content = content.replace(
  'import { MapPin, Mail, Phone, ArrowRight } from "lucide-react";',
  'import { MapPin, Mail, Phone, ArrowRight, Plus, Minus } from "lucide-react";'
);

// 2. Add FooterSection helper above Footer
const helperStr = `
const FooterSection = ({ title, id, openSection, toggleSection, children, delay }: any) => {
  const isOpen = openSection === id;
  return (
    <motion.div
      className="flex-1 min-w-[150px] p-[clamp(16px,2vw,32px)] md:border-r border-white/5 border-b md:border-b-0 last:border-b-0"
      initial={{ opacity: 0, y: 80 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 1, delay, ease: "easeOut" }}
    >
      <div 
        className="font-sans text-[10px] tracking-[0.3em] text-white/50 mb-0 md:mb-5 flex justify-between items-center cursor-pointer md:cursor-default"
        onClick={() => toggleSection(id)}
      >
        <span>// {title}</span>
        <span className="md:hidden">
          {isOpen ? <Minus className="w-3 h-3" /> : <Plus className="w-3 h-3" />}
        </span>
      </div>
      <div className={\`overflow-hidden transition-all duration-500 ease-in-out \${isOpen ? 'max-h-[500px] mt-5 opacity-100' : 'max-h-0 opacity-0 md:max-h-[1000px] md:opacity-100 md:mt-5'}\`}>
        {children}
      </div>
    </motion.div>
  );
};

// MAIN COMPONENT
export default function Footer() {
  const [openSection, setOpenSection] = useState<string | null>(null);
  const toggleSection = (section: string) => {
    setOpenSection(openSection === section ? null : section);
  };
`;

content = content.replace(
  '// MAIN COMPONENT\nexport default function Footer() {',
  helperStr
);

// 3. Replace the GRID section
const originalGrid = content.substring(
  content.indexOf('{/* --- GRID --- */}'),
  content.indexOf('{/* --- BOTTOM --- */}')
);

const newGrid = `{/* --- GRID --- */}
      <div ref={gridRef} className="flex flex-col md:flex-row flex-wrap lg:flex-nowrap justify-between w-full relative z-20 border-t border-white/5 px-[6vw]">
        
        {/* Col 1 */}
        <FooterSection title="STUDIO" id="studio" openSection={openSection} toggleSection={toggleSection} delay={0}>
          <div className="block mb-3 text-[20px] transition-transform duration-300 hover:translate-x-2 hover:text-[#C41230] cursor-pointer">
            <a href={\`mailto:\${settings?.email || 'hello@crossangle.com'}\`} className="text-inherit no-underline">
              {settings?.email || 'hello@crossangle.com'}
            </a>
          </div>
        </FooterSection>

        {/* Col 2 */}
        <FooterSection title="LOCATIONS" id="locations" openSection={openSection} toggleSection={toggleSection} delay={0.1}>
          {settings?.address ? (
            <div className="text-[20px] font-serif mb-1 leading-snug max-w-[280px]">{settings.address}</div>
          ) : (
            <>
              <div className="text-[30px] font-serif mb-1">Jamshedpur</div>
              <div className="text-[20px] font-serif text-white/55">Jharkhand, India</div>
            </>
          )}
          <LiveClock />
        </FooterSection>

        {/* Col 3: Quick Links — Core Navigation */}
        <FooterSection title="NAVIGATE" id="navigate" openSection={openSection} toggleSection={toggleSection} delay={0.2}>
          {[
            { key: 'home', name: 'Home', path: '/' },
            { key: 'services', name: 'Services', path: '/services' },
            { key: 'portfolio', name: 'Portfolio', path: '/portfolio' },
            { key: 'about', name: 'About Us', path: '/about-us' },
            { key: 'blog', name: 'Blog', path: '/blog' },
            { key: 'contact', name: 'Contact Us', path: '/contact-us' },
          ].map(({ key, name, path }) => (
            <Link
              key={key}
              to={path}
              onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
              className="block mb-3 text-[18px] transition-transform duration-300 hover:translate-x-[10px] hover:text-[#C41230] cursor-pointer text-white no-underline"
            >
              {name}
            </Link>
          ))}
        </FooterSection>

        {/* Col 4: Quick Links — Tools & Resources */}
        <FooterSection title="QUICK LINKS" id="quick-links" openSection={openSection} toggleSection={toggleSection} delay={0.3}>
          {[
            { key: 'gallery', name: 'Gallery', path: '/gallery' },
            { key: 'estimate', name: 'Cost Estimator', path: '/estimate' },
            { key: 'discovery', name: 'Style Discovery', path: '/aesthetic-discovery-engine' }
          ].map(({ key, name, path }) => (
            <Link
              key={key}
              to={path}
              onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
              className="block mb-3 text-[18px] transition-transform duration-300 hover:translate-x-[10px] hover:text-[#C41230] cursor-pointer text-white no-underline"
            >
              {name}
            </Link>
          ))}
        </FooterSection>

        {/* Col 5: Socials */}
        <FooterSection title="SOCIALS" id="socials" openSection={openSection} toggleSection={toggleSection} delay={0.4}>
          {[
            { key: 'facebook', name: 'Facebook' },
            { key: 'instagram', name: 'Instagram' },
            { key: 'twitter', name: 'Twitter' },
            { key: 'linkedin', name: 'LinkedIn' },
            { key: 'youtube', name: 'YouTube' },
            { key: 'pinterest', name: 'Pinterest' }
          ].map(({ key, name }) => {
            const url = settings?.social_links?.[key];
            const href = (url && typeof url === 'string' && url.trim().length > 0) ? url : "#";
            return (
              <a
                key={key}
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                className="block mb-3 text-[20px] transition-transform duration-300 hover:translate-x-[10px] hover:text-[#C41230] cursor-pointer text-white no-underline capitalize"
              >
                {name}
              </a>
            );
          })}
        </FooterSection>
      </div>

      `;

content = content.replace(originalGrid, newGrid);

fs.writeFileSync(path, content, 'utf-8');
console.log('Footer updated successfully.');
