import { Search } from "lucide-react";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/primitives/input";

interface TestimonialsToolbarProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  statusFilter: "all" | "active" | "inactive";
  onStatusFilterChange: (status: "all" | "active" | "inactive") => void;
  resultCount: number;
}

export const TestimonialsToolbar = ({ searchQuery, onSearchChange, statusFilter, onStatusFilterChange, resultCount }: TestimonialsToolbarProps) => (
  <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 p-4 bg-[hsl(var(--admin-surface))]/50 border border-[hsl(var(--admin-border))] rounded-xl mb-6">
    <div className="flex items-center gap-3 w-full md:w-auto">
      <div className="relative flex-1 md:w-80">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[hsl(var(--admin-muted))]" />
        <Input placeholder="Search testimonials..." value={searchQuery} onChange={(e) => onSearchChange(e.target.value)} className="pl-10 bg-[hsl(var(--admin-background))] border-[hsl(var(--admin-border))] focus:border-[hsl(var(--admin-primary))]" />
      </div>
      <div className="flex items-center gap-2 border border-[hsl(var(--admin-border))] p-1 rounded-lg bg-[hsl(var(--admin-background))]">
        {(["all", "active", "inactive"] as const).map((status) => (
          <button key={status} onClick={() => onStatusFilterChange(status)} className={cn("capitalize px-3 py-1.5 text-sm font-medium rounded-md transition-colors", statusFilter === status ? "bg-[hsl(var(--admin-primary))]/20 text-[hsl(var(--admin-primary))]" : "text-[hsl(var(--admin-text-muted))] hover:text-[hsl(var(--admin-text))]")}>{status}</button>
        ))}
      </div>
    </div>
    <div className="flex items-center gap-2 w-full md:w-auto">
      <span className="text-xs text-[hsl(var(--admin-muted))] font-medium">{resultCount} results</span>
    </div>
  </div>
);
