import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Plus, Trash2, ArrowUp, ArrowDown } from "lucide-react";
import { Feature, ProcessStep, FAQItem } from "@repo/types";

interface FeaturesEditorProps {
    features: string[];
    onChange: (features: string[]) => void;
}

export const FeaturesEditor = ({ features, onChange }: FeaturesEditorProps) => {
    const addFeature = () => onChange([...features, ""]);
    const removeFeature = (idx: number) => onChange(features.filter((_, i) => i !== idx));
    const updateFeature = (idx: number, val: string) => {
        const newFeatures = [...features];
        newFeatures[idx] = val;
        onChange(newFeatures);
    };

    return (
        <div className="space-y-3">
            <Label>Features</Label>
            {features.map((feature, idx) => (
                <div key={idx} className="flex gap-2">
                    <Input
                        value={feature}
                        onChange={(e) => updateFeature(idx, e.target.value)}
                        placeholder="e.g. 24/7 Support"
                    />
                    <Button type="button" variant="outline" size="icon" onClick={() => removeFeature(idx)}>
                        <Trash2 className="w-4 h-4 text-destructive" />
                    </Button>
                </div>
            ))}
            <Button type="button" variant="outline" size="sm" onClick={addFeature} className="w-full">
                <Plus className="w-4 h-4 mr-2" /> Add Feature
            </Button>
        </div>
    );
};

interface ProcessEditorProps {
    steps: ProcessStep[];
    onChange: (steps: ProcessStep[]) => void;
}

export const ProcessEditor = ({ steps, onChange }: ProcessEditorProps) => {
    const addStep = () => onChange([...steps, { title: "", description: "" }]);
    const removeStep = (idx: number) => onChange(steps.filter((_, i) => i !== idx));
    const updateStep = (idx: number, field: keyof ProcessStep, val: string) => {
        const newSteps = [...steps];
        newSteps[idx] = { ...newSteps[idx], [field]: val };
        onChange(newSteps);
    };

    return (
        <div className="space-y-3">
            <Label>Process Steps</Label>
            {steps.map((step, idx) => (
                <div key={idx} className="border p-3 rounded-md space-y-2 bg-accent/5">
                    <div className="flex justify-between items-center">
                        <span className="text-sm font-medium text-muted-foreground">Step {idx + 1}</span>
                        <Button type="button" variant="ghost" size="sm" onClick={() => removeStep(idx)}>
                            <Trash2 className="w-4 h-4 text-destructive" />
                        </Button>
                    </div>
                    <Input
                        value={step.title}
                        onChange={(e) => updateStep(idx, "title", e.target.value)}
                        placeholder="Step Title"
                    />
                    <Textarea
                        value={step.description}
                        onChange={(e) => updateStep(idx, "description", e.target.value)}
                        placeholder="Description"
                        rows={2}
                    />
                </div>
            ))}
            <Button type="button" variant="outline" size="sm" onClick={addStep} className="w-full">
                <Plus className="w-4 h-4 mr-2" /> Add Step
            </Button>
        </div>
    );
};

interface FAQEditorProps {
    faq: FAQItem[];
    onChange: (faq: FAQItem[]) => void;
}

export const FAQEditor = ({ faq, onChange }: FAQEditorProps) => {
    const addItem = () => onChange([...faq, { question: "", answer: "" }]);
    const removeItem = (idx: number) => onChange(faq.filter((_, i) => i !== idx));
    const updateItem = (idx: number, field: keyof FAQItem, val: string) => {
        const newFaq = [...faq];
        newFaq[idx] = { ...newFaq[idx], [field]: val };
        onChange(newFaq);
    };

    return (
        <div className="space-y-3">
            <Label>FAQ</Label>
            {faq.map((item, idx) => (
                <div key={idx} className="border p-3 rounded-md space-y-2 bg-accent/5">
                    <div className="flex justify-between items-center">
                        <span className="text-sm font-medium text-muted-foreground">Question {idx + 1}</span>
                        <Button type="button" variant="ghost" size="sm" onClick={() => removeItem(idx)}>
                            <Trash2 className="w-4 h-4 text-destructive" />
                        </Button>
                    </div>
                    <Input
                        value={item.question}
                        onChange={(e) => updateItem(idx, "question", e.target.value)}
                        placeholder="Question"
                    />
                    <Textarea
                        value={item.answer}
                        onChange={(e) => updateItem(idx, "answer", e.target.value)}
                        placeholder="Answer"
                        rows={2}
                    />
                </div>
            ))}
            <Button type="button" variant="outline" size="sm" onClick={addItem} className="w-full">
                <Plus className="w-4 h-4 mr-2" /> Add FAQ
            </Button>
        </div>
    );
};
