import { Input } from "@/design-system/components/Input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/primitives/select";
import { Search, Users, Thermometer, Globe } from "lucide-react";
import {
  CRM_SOURCES,
  CRM_STAGES,
  CRM_TEMPERATURES,
} from "@/lib/crm";

interface LeadToolbarProps {
  search: string;
  setSearch: (val: string) => void;
  statusFilter: string;
  setStatusFilter: (val: string) => void;
  tempFilter: string;
  setTempFilter: (val: string) => void;
  sourceFilter: string;
  setSourceFilter: (val: string) => void;
}

export function LeadToolbar({
  search,
  setSearch,
  statusFilter,
  setStatusFilter,
  tempFilter,
  setTempFilter,
  sourceFilter,
  setSourceFilter,
}: LeadToolbarProps) {
  return (
    <div className="flex flex-col sm:flex-row items-center gap-3 bg-zinc-900/40 backdrop-blur-md p-3 rounded-2xl border border-zinc-800/50 analytics-glass mb-4">
      <div className="relative flex-1 w-full max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
        <Input
          placeholder="Search by name or email…"
          className="pl-10 bg-black/40 border-zinc-700/50 focus:border-primary/50 transition-all rounded-xl"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <div className="flex items-center gap-2 w-full sm:w-auto ml-auto flex-wrap">
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[130px] bg-black/40 border-zinc-700/50 rounded-xl h-9 text-zinc-300 text-xs">
            <Users className="w-3.5 h-3.5 mr-1.5 text-zinc-500" />
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent className="bg-zinc-900 border-zinc-800">
            <SelectItem value="all">All Statuses</SelectItem>
            {CRM_STAGES.map((stage) => (
              <SelectItem key={stage.id} value={stage.id}>
                {stage.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={tempFilter} onValueChange={setTempFilter}>
          <SelectTrigger className="w-[120px] bg-black/40 border-zinc-700/50 rounded-xl h-9 text-zinc-300 text-xs">
            <Thermometer className="w-3.5 h-3.5 mr-1.5 text-zinc-500" />
            <SelectValue placeholder="Heat" />
          </SelectTrigger>
          <SelectContent className="bg-zinc-900 border-zinc-800">
            <SelectItem value="all">All Temps</SelectItem>
            {CRM_TEMPERATURES.map((t) => (
              <SelectItem key={t.id} value={t.id}>
                {t.emoji} {t.label}
                {t.minScore > 0 ? ` (${t.minScore}+)` : ""}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={sourceFilter} onValueChange={setSourceFilter}>
          <SelectTrigger className="w-[130px] bg-black/40 border-zinc-700/50 rounded-xl h-9 text-zinc-300 text-xs">
            <Globe className="w-3.5 h-3.5 mr-1.5 text-zinc-500" />
            <SelectValue placeholder="Source" />
          </SelectTrigger>
          <SelectContent className="bg-zinc-900 border-zinc-800">
            <SelectItem value="all">All Sources</SelectItem>
            {CRM_SOURCES.map((src) => (
              <SelectItem key={src.id} value={src.id}>
                {src.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}
