import { motion } from "framer-motion";
import { Pencil, Trash2, Image as ImageIcon } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface PortfolioItem {
    id: string;
    title: string;
    category_id: string | null;
    project_categories?: { name: string };
    cover_image_url: string | null;
    status?: string;
}

interface PortfolioGridProps {
    items: PortfolioItem[];
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    onEdit: (item: any) => void;
    onDelete: (id: string) => void;
}

export function PortfolioGrid({ items, onEdit, onDelete }: PortfolioGridProps) {
    if (items.length === 0) {
        return (
            <div className="text-center py-12 text-muted-foreground bg-muted/20 rounded-lg border-2 border-dashed border-muted">
                <ImageIcon className="w-12 h-12 mx-auto text-muted-foreground/30 mb-4" />
                <p>No projects found matching your criteria.</p>
            </div>
        );
    }

    return (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {items.map((item, index) => (
                <motion.div
                    key={item.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                >
                    <Card className="bg-card border-border overflow-hidden group hover:shadow-lg transition-all duration-300">
                        <div className="aspect-[4/3] relative overflow-hidden">
                            {item.cover_image_url ? (
                                <img
                                    src={item.cover_image_url}
                                    alt={item.title}
                                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                                />
                            ) : (
                                <div className="w-full h-full bg-secondary flex items-center justify-center">
                                    <ImageIcon className="w-12 h-12 text-muted-foreground/30" />
                                </div>
                            )}
                            <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2 backdrop-blur-sm">
                                <Button size="sm" variant="secondary" onClick={() => onEdit(item)}>
                                    <Pencil className="w-4 h-4 mr-2" /> Edit
                                </Button>
                                <Button size="sm" variant="destructive" onClick={() => onDelete(item.id)}>
                                    <Trash2 className="w-4 h-4" />
                                </Button>
                            </div>
                        </div>
                        <CardContent className="p-4">
                            <div className="flex items-start justify-between">
                                <div>
                                    <h3 className="font-semibold text-lg line-clamp-1">{item.title}</h3>
                                    <div className="flex gap-2 mt-1">
                                        <p className="text-xs text-muted-foreground capitalize px-2 py-0.5 bg-muted rounded-full inline-block">
                                            {item.project_categories?.name || "Uncategorized"}
                                        </p>
                                        {(item.status === 'draft' || !item.status) && (
                                            <p className="text-xs text-amber-700 bg-amber-100 capitalize px-2 py-0.5 rounded-full inline-block border border-amber-200">
                                                Draft
                                            </p>
                                        )}
                                        {item.status === 'live' && (
                                            <p className="text-xs text-green-700 bg-green-100 capitalize px-2 py-0.5 rounded-full inline-block border border-green-200">
                                                Live
                                            </p>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </motion.div>
            ))}
        </div>
    );
}

