import fs from 'fs';
import path from 'path';

const filePath = 'c:/Users/aayus/Desktop/main/apps/web/src/addons/discovery/pages/BlueprintPage.tsx';
let content = fs.readFileSync(filePath, 'utf-8');

// The main return statement starts at:
//   return (
//     <div className="blueprint-page-wrapper bg-[#040404] text-[#E0E0E0] min-h-screen" ref={containerRef}>
// and ends near the bottom:
//     </div>
//   );

// Let's find the sections reliably.
const headerStart = content.indexOf('{/*  CURSOR  */}');
const techStackStart = content.indexOf('{/*  ═══════════ TECH STACK ═══════════  */}');
const componentsStart = content.indexOf('{/*  ═══════════ COMPONENTS ═══════════  */}');
const animationsStart = content.indexOf('{/*  ═══════════ ANIMATIONS ═══════════  */}');
const mainEnd = content.lastIndexOf('</div>\n  );\n}');

const headerContent = content.substring(headerStart, techStackStart);
const radarContent = content.substring(techStackStart, componentsStart);
const moodboardContent = content.substring(componentsStart, animationsStart);
const insightsContent = content.substring(animationsStart, mainEnd);

const newMainReturn = `
      <BlueprintHeader />
      <BlueprintRadar />
      <BlueprintMoodboard />
      <BlueprintInsights />
`;

const modifiedMain = content.substring(0, headerStart) + newMainReturn + content.substring(mainEnd);

const newComponents = `
function BlueprintHeader() {
  return (
    <>
${headerContent}
    </>
  );
}

function BlueprintRadar() {
  return (
    <>
${radarContent}
    </>
  );
}

function BlueprintMoodboard() {
  return (
    <>
${moodboardContent}
    </>
  );
}

function BlueprintInsights() {
  return (
    <>
${insightsContent}
    </>
  );
}
`;

fs.writeFileSync(filePath, modifiedMain + '\n' + newComponents);
console.log('Successfully split BlueprintPage.tsx into sub-components!');
