const fs = require('fs');
const path = 'apps/web/src/addons/calculators/components/steps/StepPropertyDetails.tsx';
let content = fs.readFileSync(path, 'utf8');

// Replace '{/* ── Area slider ── */}' with the progressive disclosure opening tag + the comment
content = content.replace(
    /\{\/\* ── Area slider ── \*\/\}/, 
    `{/* ── Progressive Disclosure ── */}
            {(!((isApartment || isVilla || isTurnkey) && !formData.bhk)) && (
                <div className="animate-in fade-in slide-in-from-top-4 duration-500 space-y-6">
            {/* ── Area slider ── */}`
);

// Replace the very last '</div>' before the final return closing tag
// Find the last occurrence of '</div>\n    );\n}'
content = content.replace(
    /        <\/div>\n    \);\n\}/,
    `                </div>
            )}
        </div>
    );
}`
);

fs.writeFileSync(path, content);
