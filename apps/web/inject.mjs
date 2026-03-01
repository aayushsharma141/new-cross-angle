import fs from 'fs';

const blueprintPath = 'src/pages/BlueprintPage.tsx';
const blueprintCode = fs.readFileSync(blueprintPath, 'utf8');

const returnIndex = blueprintCode.indexOf('return (');
const blueprintReturn = blueprintCode.substring(returnIndex);

const useEffStart = blueprintCode.indexOf('useEffect(() => {');
const useEffEnd = blueprintCode.indexOf('    return (');
const blueprintUseEffect = blueprintCode.substring(useEffStart, useEffEnd);

const newResultsReveal = `import React, { useEffect, useState, useMemo, useRef } from 'react';
import '../../pages/BlueprintPage.css';
import { Link } from "react-router-dom";
import { AestheticScores, Archetype, AIAestheticResult } from "@/types/discovery";
import { visualImages } from "@/constants/discovery";

interface Props {
  scores: AestheticScores;
  archetype: Archetype;
  aiResult?: AIAestheticResult | null;
  onRetake?: () => void;
}

const ResultsReveal: React.FC<Props> = ({ scores, archetype, aiResult, onRetake }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  
  const displayName = aiResult?.identityName || archetype.name;
  const displayTagline = aiResult?.tagline || archetype.tagline;

  const alignmentScore = Math.round((scores.minimalism + scores.novelty + scores.luxury) / 3 * 10);
  const readinessValue = Math.round(50 + (scores.social * 5));

  const rankedImages = useMemo(() => {
    return [...visualImages]
      .map((img) => {
        let relevance = 0;
        for (const [k, v] of Object.entries(img.tags)) {
          relevance += (v || 0) * (scores[k as keyof AestheticScores] / 10);
        }
        return { ...img, relevance };
      })
      .sort((a, b) => b.relevance - a.relevance)
      .slice(0, 3);
  }, [scores]);

  ${blueprintUseEffect.trim()}

  ${blueprintReturn}
};

export default ResultsReveal;
`;

let finalCode = newResultsReveal;

finalCode = finalCode.replace(
  /<h1 className="s1-title r rd2">[\s\S]*?<\/h1>/,
  '<h1 className="s1-title r rd2" dangerouslySetInnerHTML={{ __html: displayName.replace(/(\\\\w+)$/, "<em>$1</em>") }}></h1>'
);

finalCode = finalCode.replace(
  /<p className="s1-sub r rd4">[\s\S]*?<\/p>/,
  '<p className="s1-sub r rd4">{displayTagline}</p>'
);

finalCode = finalCode.replace(
  /<div className="s1-tags r rd5">[\s\S]*?<\/div>(\s*<div className="authority-stamp)/,
  '<div className="s1-tags r rd5">{archetype.traits.slice(0,4).map(trait => (<div key={trait} className="s1-tag">{trait}</div>))}</div>$1'
);

finalCode = finalCode.replace(
  /<div className="orb-num">94<\/div>/,
  '<div className="orb-num">{alignmentScore}</div>'
);

finalCode = finalCode.replace(
  /const timer = setTimeout\(\(\) => {([\s\S]*?)}, 100\);/g,
  `const timer = setTimeout(() => {
$1
            try {
                const rFill = document.querySelector('.readiness-fill');
                if(rFill) {
                   (rFill as HTMLElement).style.width = readinessValue + '%';
                }
            } catch(e) {}
        }, 100);`
);

finalCode = finalCode.replace(
  /<div className="readiness-fill"[^>]*><\/div>/,
  '<div className="readiness-fill" style={{ width: `${readinessValue}%` }}></div>'
);

finalCode = finalCode.replace(
  /src="https:\/\/images.unsplash.com\/photo-1600585154340-be6161a56a0c[^"]*"/,
  'src={rankedImages[1] ? rankedImages[1].src : "/placeholder.jpg"}'
);
finalCode = finalCode.replace(
  /style=\{\{"backgroundImage":"url\\(https:\/\/images.unsplash.com\/photo-1600585154340-be6161a56a0c[^"]*\\)"\}\}/,
  'style={{ backgroundImage: `url(${rankedImages[1] ? rankedImages[1].src : "/placeholder.jpg"})` }}'
);

finalCode = finalCode.replace(
  /src="https:\/\/images.unsplash.com\/photo-1600566753086-00f18efc2294[^"]*"/,
  'src={rankedImages[0] ? rankedImages[0].src : "/placeholder.jpg"}'
);
finalCode = finalCode.replace(
  /src="https:\/\/images.unsplash.com\/photo-1600607687931-cebf58b3e8e2[^"]*"/,
  'src={rankedImages[2] ? rankedImages[2].src : "/placeholder.jpg"}'
);

finalCode = finalCode.replace(
  /<div className="rm-label"><span>Structural Disruption<\/span> <span>92%<\/span><\/div>[\s\S]*?<div className="rm-track"><div className="rm-fill"[^>]*><\/div><\/div>/g,
  '<div className="rm-label"><span>Structural Disruption</span> <span>{scores.novelty * 10}%</span></div><div className="rm-track"><div className="rm-fill" style={{ width: `${scores.novelty * 10}%` }}></div></div>'
);

finalCode = finalCode.replace(
  /<div className="rm-label"><span>Material Honesty<\/span> <span>88%<\/span><\/div>[\s\S]*?<div className="rm-track"><div className="rm-fill"[^>]*><\/div><\/div>/g,
  '<div className="rm-label"><span>Material Honesty</span> <span>{scores.minimalism * 10}%</span></div><div className="rm-track"><div className="rm-fill" style={{ width: `${scores.minimalism * 10}%` }}></div></div>'
);

finalCode = finalCode.replace(
  /<div className="rm-label"><span>Color Restraint<\/span> <span>96%<\/span><\/div>[\s\S]*?<div className="rm-track"><div className="rm-fill"[^>]*><\/div><\/div>/g,
  '<div className="rm-label"><span>Relational Structure</span> <span>{scores.social * 10}%</span></div><div className="rm-track"><div className="rm-fill" style={{ width: `${scores.social * 10}%` }}></div></div>'
);

// Cognitive Profiles
finalCode = finalCode.replace(
  /<div className="cp-val">82%<\/div>/,
  '<div className="cp-val">{scores.novelty * 10}%</div>'
);
finalCode = finalCode.replace(
  /<div className="cp-val">94%<\/div>/,
  '<div className="cp-val">{scores.minimalism * 10}%</div>'
);
finalCode = finalCode.replace(
  /<div className="cp-val">12%<\/div>/,
  '<div className="cp-val">{Math.round(100 - scores.social * 10)}%</div>'
);
finalCode = finalCode.replace(
  /<div className="cp-val">88%<\/div>/,
  '<div className="cp-val">{scores.luxury * 10}%</div>'
);

fs.writeFileSync('src/components/discovery/ResultsReveal.tsx', finalCode);
console.log('Successfully generated ResultsReveal.tsx');
