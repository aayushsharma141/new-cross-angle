import { useState, useEffect } from "react";
import { useFlowConfig } from "@/hooks/useFlowConfig";
import { Button } from "@/components/ui/primitives/button";
import { Input } from "@/components/ui/primitives/input";
import { Save, Plus, X, Loader2, MessageSquare, Palette } from "lucide-react";
import { AdminFormCard } from "@/components/admin/shared";

interface DesignLanguage {
  name: string;
  desc: string;
}

interface ColorMood {
  name: string;
  color: string;
  border?: boolean;
}

interface QuestionsData {
  design_languages: DesignLanguage[];
  color_moods: ColorMood[];
  dislike_colors: string[];
}

export function QuestionsEditor() {
  const { data, isLoading, save, isSaving } = useFlowConfig<QuestionsData>("discovery_questions");
  const [questions, setQuestions] = useState<QuestionsData | null>(null);
  const [dirty, setDirty] = useState(false);
  const [newLanguageName, setNewLanguageName] = useState("");
  const [newLanguageDesc, setNewLanguageDesc] = useState("");
  const [newMoodName, setNewMoodName] = useState("");
  const [newMoodColor, setNewMoodColor] = useState("#ffffff");
  const [newDislikeColor, setNewDislikeColor] = useState("");

  useEffect(() => {
    if (data && !dirty) {
      setQuestions(data as QuestionsData);
    }
  }, [data, dirty]);

  const handleUpdate = (updater: (prev: QuestionsData) => QuestionsData) => {
    if (!questions) return;
    setQuestions(updater(questions));
    setDirty(true);
  };

  const handleSave = () => {
    if (!questions) return;
    save(questions, { onSuccess: () => setDirty(false) });
  };

  const addDesignLanguage = () => {
    const name = newLanguageName.trim();
    const desc = newLanguageDesc.trim();
    if (!name) return;
    handleUpdate((prev) => ({
      ...prev,
      design_languages: [...prev.design_languages, { name, desc }],
    }));
    setNewLanguageName("");
    setNewLanguageDesc("");
  };

  const removeDesignLanguage = (index: number) => {
    handleUpdate((prev) => ({
      ...prev,
      design_languages: prev.design_languages.filter((_, idx) => idx !== index),
    }));
  };

  const addColorMood = () => {
    const name = newMoodName.trim();
    if (!name) return;
    handleUpdate((prev) => ({
      ...prev,
      color_moods: [...prev.color_moods, { name, color: newMoodColor, border: newMoodColor.toLowerCase() === "#ffffff" }],
    }));
    setNewMoodName("");
    setNewMoodColor("#ffffff");
  };

  const removeColorMood = (index: number) => {
    handleUpdate((prev) => ({
      ...prev,
      color_moods: prev.color_moods.filter((_, idx) => idx !== index),
    }));
  };

  const addDislikeColor = () => {
    const name = newDislikeColor.trim();
    if (!name) return;
    handleUpdate((prev) => ({
      ...prev,
      dislike_colors: prev.dislike_colors.includes(name) ? prev.dislike_colors : [...prev.dislike_colors, name],
    }));
    setNewDislikeColor("");
  };

  const removeDislikeColor = (index: number) => {
    handleUpdate((prev) => ({
      ...prev,
      dislike_colors: prev.dislike_colors.filter((_, idx) => idx !== index),
    }));
  };

  if (isLoading || !questions) {
    return (
      <div className="flex justify-center py-16">
        <Loader2 className="w-5 h-5 animate-spin text-[hsl(var(--admin-primary))]" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Design Languages Section */}
      <AdminFormCard
        title={
          <div className="flex items-center gap-2">
            <MessageSquare className="w-4 h-4 text-[hsl(var(--admin-primary))]" />
            <span>Stated Design Languages (Step 4)</span>
          </div>
        }
        description="Configure the options displayed to users on the style orientation question step."
        action={
          <Button
            size="sm"
            onClick={handleSave}
            disabled={!dirty || isSaving}
            className="h-7 text-xs gap-1.5 bg-[hsl(var(--admin-primary))] text-black hover:bg-[hsl(var(--admin-primary))]/90"
          >
            {isSaving ? <Loader2 className="w-3 h-3 animate-spin" /> : <Save className="w-3 h-3" />}
            Save Changes
          </Button>
        }
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          {questions.design_languages.map((style, idx) => (
            <div
              key={idx}
              className="flex justify-between items-center p-3 rounded-xl border border-[hsl(var(--admin-border))]/50 bg-[hsl(var(--admin-surface))]/30 group"
            >
              <div>
                <p className="text-xs font-semibold text-[hsl(var(--admin-text))]">{style.name}</p>
                <p className="text-[10px] text-[hsl(var(--admin-text-muted))]">{style.desc}</p>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => removeDesignLanguage(idx)}
                className="h-6 w-6 opacity-0 group-hover:opacity-100 text-red-400 hover:text-red-300 transition-opacity"
              >
                <X className="w-3 h-3" />
              </Button>
            </div>
          ))}
        </div>

        <div className="flex flex-col sm:flex-row gap-3 pt-3 border-t border-[hsl(var(--admin-border))]/50">
          <Input
            value={newLanguageName}
            onChange={(e) => setNewLanguageName(e.target.value)}
            placeholder="Aesthetic Style (e.g. Mid-Century Modern)"
            className="h-8 text-xs bg-[hsl(var(--admin-surface))] border-[hsl(var(--admin-border))]"
          />
          <Input
            value={newLanguageDesc}
            onChange={(e) => setNewLanguageDesc(e.target.value)}
            placeholder="Short description..."
            className="h-8 text-xs bg-[hsl(var(--admin-surface))] border-[hsl(var(--admin-border))]"
          />
          <Button
            variant="outline"
            size="sm"
            onClick={addDesignLanguage}
            disabled={!newLanguageName.trim()}
            className="h-8 text-xs shrink-0"
          >
            <Plus className="w-3.5 h-3.5 mr-1" /> Add Style
          </Button>
        </div>
      </AdminFormCard>

      {/* Color Moods Section */}
      <AdminFormCard
        title={
          <div className="flex items-center gap-2">
            <Palette className="w-4 h-4 text-[hsl(var(--admin-primary))]" />
            <span>Color Moods & Dislikes</span>
          </div>
        }
        description="Edit the color mood cards and standard colors that users can flag as dislikes."
      >
        <div className="space-y-6">
          <div>
            <h4 className="text-xs font-semibold text-[hsl(var(--admin-text))] mb-3">Liveable Moods</h4>
            <div className="flex flex-wrap gap-2.5 mb-4">
              {questions.color_moods.map((mood, idx) => (
                <span
                  key={idx}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-[hsl(var(--admin-surface))] border border-[hsl(var(--admin-border))] text-xs text-[hsl(var(--admin-text))]"
                >
                  <span
                    className="w-3 h-3 rounded-full border border-white/20"
                    style={{ backgroundColor: mood.color }}
                  />
                  {mood.name}
                  <button
                    onClick={() => removeColorMood(idx)}
                    className="text-[hsl(var(--admin-text-muted))] hover:text-red-400 ml-1"
                    aria-label={`Remove ${mood.name}`}
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </span>
              ))}
            </div>

            <div className="flex gap-3 items-center pt-3 border-t border-[hsl(var(--admin-border))]/50">
              <Input
                value={newMoodName}
                onChange={(e) => setNewMoodName(e.target.value)}
                placeholder="Mood Name (e.g. Warm Clay)"
                className="h-8 text-xs bg-[hsl(var(--admin-surface))] border-[hsl(var(--admin-border))]"
              />
              <div className="flex items-center gap-1.5 shrink-0">
                <label htmlFor="mood-color-input" className="text-[10px] text-[hsl(var(--admin-text-muted))]">Color:</label>
                <input
                  id="mood-color-input"
                  type="color"
                  value={newMoodColor}
                  onChange={(e) => setNewMoodColor(e.target.value)}
                  title="Select mood color"
                  className="w-6 h-6 rounded-md cursor-pointer border border-[hsl(var(--admin-border))] bg-transparent"
                />
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={addColorMood}
                disabled={!newMoodName.trim()}
                className="h-8 text-xs shrink-0"
              >
                <Plus className="w-3.5 h-3.5 mr-1" /> Add Mood
              </Button>
            </div>
          </div>

          <hr className="border-t border-[hsl(var(--admin-border))]/30" />

          <div>
            <h4 className="text-xs font-semibold text-[hsl(var(--admin-text))] mb-3">Dislike Candidates</h4>
            <div className="flex flex-wrap gap-2 mb-4">
              {questions.dislike_colors.map((color, idx) => (
                <span
                  key={idx}
                  className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-[hsl(var(--admin-surface))] border border-[hsl(var(--admin-border))] text-xs text-[hsl(var(--admin-text))]"
                >
                  {color}
                  <button
                    onClick={() => removeDislikeColor(idx)}
                    className="text-[hsl(var(--admin-text-muted))] hover:text-red-400"
                    aria-label={`Remove dislike option ${color}`}
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </span>
              ))}
            </div>

            <div className="flex gap-2 max-w-sm pt-3 border-t border-[hsl(var(--admin-border))]/50">
              <Input
                value={newDislikeColor}
                onChange={(e) => setNewDislikeColor(e.target.value)}
                placeholder="Color candidate (e.g. Orange)"
                className="h-8 text-xs bg-[hsl(var(--admin-surface))] border-[hsl(var(--admin-border))]"
              />
              <Button
                variant="outline"
                size="sm"
                onClick={addDislikeColor}
                disabled={!newDislikeColor.trim()}
                className="h-8 text-xs shrink-0"
              >
                <Plus className="w-3.5 h-3.5" />
              </Button>
            </div>
          </div>
        </div>
      </AdminFormCard>
    </div>
  );
}
