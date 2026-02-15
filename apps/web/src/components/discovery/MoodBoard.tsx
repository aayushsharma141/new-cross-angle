import { useRef, useCallback, useState } from "react";
import { motion } from "framer-motion";
import { AestheticScores, Archetype } from "@/types/discovery";
import { visualImages } from "@/constants/discovery";
import { Download } from "lucide-react";
import { toast } from "sonner";

interface Props {
  scores: AestheticScores;
  archetype: Archetype;
}

const MoodBoard = ({ scores, archetype }: Props) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [generating, setGenerating] = useState(false);

  const rankedImages = [...visualImages]
    .map((img) => {
      let relevance = 0;
      for (const [k, v] of Object.entries(img.tags)) {
        const key = k as keyof AestheticScores;
        relevance += (v || 0) * (scores[key] / 10);
      }
      return { ...img, relevance };
    })
    .sort((a, b) => b.relevance - a.relevance)
    .slice(0, 3);

  const generateCard = useCallback(async () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    setGenerating(true);
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const W = 1200;
    const H = 630;
    canvas.width = W;
    canvas.height = H;

    ctx.fillStyle = "#f5f0eb";
    ctx.fillRect(0, 0, W, H);
    ctx.fillStyle = "#1a1714";
    ctx.fillRect(0, 0, 440, H);

    ctx.fillStyle = "#a09890";
    ctx.font = "11px sans-serif";
    ctx.letterSpacing = "3px";
    ctx.fillText("YOUR AESTHETIC IDENTITY", 40, 60);
    ctx.letterSpacing = "0px";

    ctx.fillStyle = "#f5f0eb";
    ctx.font = "italic 36px Georgia, serif";
    ctx.fillText(archetype.name, 40, 120);

    ctx.font = "14px Georgia, serif";
    ctx.fillStyle = "#a09890";
    const taglineWords = archetype.tagline.split(" ");
    let line = "";
    let y = 160;
    for (const word of taglineWords) {
      const test = line + word + " ";
      if (ctx.measureText(test).width > 360) {
        ctx.fillText(line.trim(), 40, y);
        line = word + " ";
        y += 20;
      } else {
        line = test;
      }
    }
    ctx.fillText(line.trim(), 40, y);

    y += 50;
    ctx.fillStyle = "#706860";
    ctx.font = "11px sans-serif";
    ctx.letterSpacing = "2px";
    ctx.fillText("KEY TRAITS", 40, y);
    ctx.letterSpacing = "0px";
    y += 25;
    ctx.fillStyle = "#c0b8b0";
    ctx.font = "14px sans-serif";
    for (const trait of archetype.traits) {
      ctx.fillText(`• ${trait}`, 40, y);
      y += 24;
    }

    y += 20;
    ctx.fillStyle = "#706860";
    ctx.font = "11px sans-serif";
    ctx.letterSpacing = "2px";
    ctx.fillText("MATERIAL BIAS", 40, y);
    ctx.letterSpacing = "0px";
    y += 25;
    ctx.fillStyle = "#c0b8b0";
    ctx.font = "14px sans-serif";
    ctx.fillText(archetype.materialBias, 40, y);

    y += 50;
    ctx.fillStyle = "#706860";
    ctx.font = "11px sans-serif";
    ctx.letterSpacing = "2px";
    ctx.fillText("AESTHETIC DNA", 40, y);
    ctx.letterSpacing = "0px";
    y += 20;
    const dims = [
      { label: "Warmth", val: scores.warmth },
      { label: "Minimalism", val: scores.minimalism },
      { label: "Social", val: scores.social },
      { label: "Structure", val: scores.structure },
    ];
    for (const d of dims) {
      ctx.fillStyle = "#706860";
      ctx.font = "12px sans-serif";
      ctx.fillText(d.label, 40, y);
      ctx.fillStyle = "#333";
      ctx.fillRect(140, y - 8, 240, 6);
      ctx.fillStyle = "#c0b8b0";
      ctx.fillRect(140, y - 8, (d.val / 10) * 240, 6);
      y += 24;
    }

    ctx.fillStyle = "#504840";
    ctx.font = "italic 13px Georgia, serif";
    ctx.fillText("Aesthetic.", 40, H - 30);

    const imgWidth = 370;
    const imgHeight = 300;
    const gap = 10;
    const startX = 460;

    const loadImage = (src: string): Promise<HTMLImageElement> =>
      new Promise((resolve, reject) => {
        const img = new Image();
        img.crossOrigin = "anonymous";
        img.onload = () => resolve(img);
        img.onerror = reject;
        img.src = src;
      });

    try {
      const images = await Promise.all(rankedImages.map((i) => loadImage(i.url)));
      if (images[0]) ctx.drawImage(images[0], startX, 20, imgWidth, H - 40);
      const smallX = startX + imgWidth + gap;
      const smallW = W - smallX - 20;
      if (images[1]) ctx.drawImage(images[1], smallX, 20, smallW, imgHeight);
      if (images[2]) ctx.drawImage(images[2], smallX, 20 + imgHeight + gap, smallW, H - 40 - imgHeight - gap);
      ctx.fillStyle = "#a09890";
      ctx.font = "10px sans-serif";
      ctx.letterSpacing = "2px";
      ctx.textAlign = "right";
      ctx.fillText("CURATED FROM SELECTIONS", W - 20, H - 10);
      ctx.textAlign = "left";
      ctx.letterSpacing = "0px";
    } catch { /* fallback text-only */ }

    setGenerating(false);
  }, [scores, archetype, rankedImages]);

  const handleDownloadCard = useCallback(async () => {
    await generateCard();
    const canvas = canvasRef.current;
    if (!canvas) return;
    canvas.toBlob((blob) => {
      if (!blob) return;
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `aesthetic-card-${archetype.name.toLowerCase().replace(/\s+/g, "-")}.png`;
      a.click();
      URL.revokeObjectURL(url);
      toast.success("Mood board card downloaded!");
    }, "image/png");
  }, [generateCard, archetype]);

  const handleShareCard = useCallback(async () => {
    await generateCard();
    const canvas = canvasRef.current;
    if (!canvas) return;
    canvas.toBlob(async (blob) => {
      if (!blob) return;
      if (navigator.share && navigator.canShare) {
        const file = new File([blob], "aesthetic-mood-board.png", { type: "image/png" });
        const shareData = { title: `My Spatial Personality: ${archetype.name}`, text: `"${archetype.tagline}"`, files: [file] };
        if (navigator.canShare(shareData)) {
          try { await navigator.share(shareData); return; } catch { /* cancelled */ }
        }
      }
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "aesthetic-mood-board.png";
      a.click();
      URL.revokeObjectURL(url);
      toast.success("Mood board saved! Share it anywhere.");
    }, "image/png");
  }, [generateCard, archetype]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: 0.2 }}
    >
      <div className="flex items-baseline justify-between mb-4">
        <h3 className="font-serif-display text-2xl">Your Mood Board</h3>
        <p className="tracking-premium text-muted-foreground text-xs">CURATED FROM SELECTIONS</p>
      </div>

      {/* Enhanced mood board grid with hover effects */}
      <div className="grid grid-cols-3 gap-2 mb-6">
        <motion.div
          className="col-span-2 row-span-2 aspect-[4/3] overflow-hidden rounded-sm group cursor-pointer"
          whileHover={{ scale: 1.01 }}
          transition={{ duration: 0.3 }}
        >
          <img
            src={rankedImages[0]?.url}
            alt="Primary mood"
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
          />
        </motion.div>
        <motion.div
          className="aspect-square overflow-hidden rounded-sm group cursor-pointer"
          whileHover={{ scale: 1.02 }}
        >
          <img
            src={rankedImages[1]?.url}
            alt="Secondary mood"
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
          />
        </motion.div>
        <motion.div
          className="aspect-square overflow-hidden rounded-sm group cursor-pointer"
          whileHover={{ scale: 1.02 }}
        >
          <img
            src={rankedImages[2]?.url}
            alt="Tertiary mood"
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
          />
        </motion.div>
      </div>

      <div className="flex gap-2">
        <button
          onClick={handleDownloadCard}
          disabled={generating}
          className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground text-xs font-medium tracking-wide hover:opacity-90 transition-opacity disabled:opacity-50"
        >
          <Download size={14} />
          {generating ? "Generating…" : "Download Card"}
        </button>
        <button
          onClick={handleShareCard}
          disabled={generating}
          className="px-4 py-2 border border-border text-xs font-medium tracking-wide hover:bg-muted transition-colors disabled:opacity-50"
        >
          Share as Image
        </button>
      </div>

      <canvas ref={canvasRef} className="hidden" />
    </motion.div>
  );
};

export default MoodBoard;
