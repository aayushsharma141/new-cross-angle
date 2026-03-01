import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Pencil, Trash2, Image as ImageIcon } from "lucide-react";
import type { ProjectWithCategory } from "@/pages/admin/AdminPortfolio";

interface PortfolioListProps {
    items: ProjectWithCategory[];
    onEdit: (item: ProjectWithCategory) => void;
    onDelete: (id: string) => void;
}

export function PortfolioList({ items, onEdit, onDelete }: PortfolioListProps) {
    if (items.length === 0) {
        return (
            <div className="text-center py-12 text-muted-foreground bg-muted/20 rounded-lg border-2 border-dashed border-muted">
                <ImageIcon className="w-12 h-12 mx-auto text-muted-foreground/30 mb-4" />
                <p>No projects found matching your criteria.</p>
            </div>
        );
    }

    return (
        <div className="border rounded-md bg-white overflow-hidden">
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead className="w-[80px]">Image</TableHead>
                        <TableHead>Title</TableHead>
                        <TableHead>Category</TableHead>
                        <TableHead>Year</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {items.map((item) => (
                        <TableRow key={item.id} className="hover:bg-muted/50">
                            <TableCell>
                                <div className="w-12 h-12 rounded bg-muted overflow-hidden relative">
                                    {item.cover_image_url ? (
                                        <img
                                            src={item.cover_image_url}
                                            alt={item.title}
                                            className="w-full h-full object-cover"
                                        />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center bg-secondary">
                                            <ImageIcon className="h-4 w-4 text-muted-foreground/50" />
                                        </div>
                                    )}
                                </div>
                            </TableCell>
                            <TableCell className="font-medium">
                                {item.title}
                            </TableCell>
                            <TableCell>
                                <Badge variant="outline" className="capitalize">
                                    {item.project_categories?.name || "Uncategorized"}
                                </Badge>
                            </TableCell>
                            <TableCell>{item.year_completed || "N/A"}</TableCell>
                            <TableCell>
                                {(item.status === 'draft' || !item.status) ? (
                                    <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200">
                                        Draft
                                    </Badge>
                                ) : (
                                    <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                                        Published
                                    </Badge>
                                )}
                            </TableCell>
                            <TableCell>
                                {item.featured && (
                                    <Badge variant="secondary" className="bg-purple-100 text-purple-700 hover:bg-purple-100 border-purple-200">
                                        Featured
                                    </Badge>
                                )}
                            </TableCell>
                            <TableCell className="text-right">
                                <div className="flex justify-end gap-2">
                                    <Button variant="ghost" size="icon" onClick={() => onEdit(item)}>
                                        <Pencil className="h-4 w-4 text-muted-foreground" />
                                    </Button>
                                    <Button variant="ghost" size="icon" onClick={() => onDelete(item.id)}>
                                        <Trash2 className="h-4 w-4 text-destructive" />
                                    </Button>
                                </div>
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </div>
    );
}
