import { useState } from "react";
import { motion } from "framer-motion";
import {
  BarChart3, MapPin, Briefcase, DollarSign, UserCheck, Globe, TrendingDown,
  CalendarIcon, Download, RefreshCw, ChevronRight
} from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { icons } from "@/design-system/tokens/icons";
import { Button } from "@/components/ui/primitives/button";
import { Calendar } from "@/components/ui/primitives/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/primitives/popover";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/design-system/components/Table";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell,
  PieChart, Pie, LineChart, Line, CartesianGrid, Legend, AreaChart, Area
} from "recharts";
import { StatCard } from "./StatCard";
import {
  type LeadRow, type SessionRow,
  PRESET_RANGES, PIE_COLORS, CHART_TOOLTIP_STYLE,
  scoreLeadIntent, computeLeadBreakdown, renderPieLabel,
} from "./analytics-utils";

interface LeadsTabProps {
  leads: LeadRow[];
  sessions: SessionRow[];
  dateFrom: Date | undefined;
  dateTo: Date | undefined;
  activePreset: number | null;
  refreshing: boolean;
  onPreset: (days: number | null) => void;
  onDateFromChange: (d: Date | undefined) => void;
  onDateToChange: (d: Date | undefined) => void;
  onExportLeads: () => void;
  onRefresh: () => void;
  onSelectLead: (lead: LeadRow) => void;
}

export const LeadsTab = ({
  leads, dateFrom, dateTo, activePreset, refreshing,
  onPreset, onDateFromChange, onDateToChange, onExportLeads, onRefresh, onSelectLead,
}: LeadsTabProps) => {
  const [leadTrendGranularity, setLeadTrendGranularity] = useState<"daily" | "weekly" | "monthly">("daily");

  return (
    <>
      {/* Date Range Filter */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.05 }} className="flex flex-wrap items-center gap-2 mb-8">
        {PRESET_RANGES.map((p) => (
          <Button variant={activePreset === p.days ? "default" : "secondary"} size="sm" key={p.label} onClick={() => onPreset(p.days)} className="text-xs h-8">{p.label}</Button>
        ))}
        <div className="w-px h-6 bg-border mx-1 hidden sm:block" />
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline" size="sm" className={cn("text-xs gap-1.5", !dateFrom && "text-muted-foreground")}><CalendarIcon size={14} />{dateFrom ? format(dateFrom, "MMM d, yyyy") : "From"}</Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <Calendar mode="single" selected={dateFrom} onSelect={(d) => onDateFromChange(d)} disabled={(d) => d > new Date() || (dateTo ? d > dateTo : false)} initialFocus className="p-3 pointer-events-auto" />
          </PopoverContent>
        </Popover>
        <span className="text-xs text-muted-foreground">→</span>
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline" size="sm" className={cn("text-xs gap-1.5", !dateTo && "text-muted-foreground")}><CalendarIcon size={14} />{dateTo ? format(dateTo, "MMM d, yyyy") : "To"}</Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <Calendar mode="single" selected={dateTo} onSelect={(d) => onDateToChange(d)} disabled={(d) => d > new Date() || (dateFrom ? d < dateFrom : false)} initialFocus className="p-3 pointer-events-auto" />
          </PopoverContent>
        </Popover>
        <div className="flex items-center gap-2 ml-auto">
          <Button variant="outline" size="sm" onClick={onExportLeads} className="text-xs gap-1.5"><Download className={icons.sm} />Export Leads</Button>
          <Button variant="outline" size="sm" onClick={onRefresh} disabled={refreshing} className="text-xs gap-1.5"><RefreshCw size={14} className={cn(refreshing && "animate-spin")} />Refresh</Button>
        </div>
      </motion.div>

      {/* Lead Overview Stats */}
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }} className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
        <StatCard icon={UserCheck} label="Total Leads" value={String(leads.length)} delay={0} />
        <StatCard icon={MapPin} label="Cities" value={String(new Set(leads.map(l => l.city).filter(Boolean)).size)} sub="unique locations" delay={0.05} />
        <StatCard icon={Briefcase} label="Project Types" value={String(new Set(leads.map(l => l.project_type).filter(Boolean)).size)} sub="categories" delay={0.1} />
        <StatCard icon={DollarSign} label="High Intent" value={String(leads.filter(l => scoreLeadIntent(l).label === "High").length)} sub="qualified leads" delay={0.15} />
      </motion.div>

      {/* Lead Visualization Charts */}
      {leads.length > 0 && (
        <motion.section initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 }} className="mb-10">
          <h2 className="text-lg font-serif-display font-medium mb-4 flex items-center gap-2">
            <BarChart3 className={cn("text-muted-foreground", icons.md)} /> Lead Insights
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div className="rounded-lg border border-border bg-card p-5">
              <h3 className="tracking-premium text-muted-foreground mb-4 flex items-center gap-2 text-xs"><MapPin className={icons.sm} /> BY CITY</h3>
              <div className="h-56">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={computeLeadBreakdown(leads, "city").slice(0, 6)} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} innerRadius={35} label={renderPieLabel} labelLine={{ stroke: "hsl(var(--muted-foreground))", strokeWidth: 1 }}>
                      {computeLeadBreakdown(leads, "city").slice(0, 6).map((_, i) => (<Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />))}
                    </Pie>
                    <Tooltip {...CHART_TOOLTIP_STYLE} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>
            <div className="rounded-lg border border-border bg-card p-5">
              <h3 className="tracking-premium text-muted-foreground mb-4 flex items-center gap-2 text-xs"><Briefcase className={icons.sm} /> BY PROJECT TYPE</h3>
              <div className="h-56">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={computeLeadBreakdown(leads, "project_type").slice(0, 6)} layout="vertical" margin={{ left: 0, right: 12, top: 0, bottom: 0 }}>
                    <XAxis type="number" hide />
                    <YAxis type="category" dataKey="name" width={100} tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} axisLine={false} tickLine={false} />
                    <Tooltip {...CHART_TOOLTIP_STYLE} />
                    <Bar dataKey="value" radius={[0, 4, 4, 0]} maxBarSize={24}>
                      {computeLeadBreakdown(leads, "project_type").slice(0, 6).map((_, i) => (<Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="rounded-lg border border-border bg-card p-5">
              <h3 className="tracking-premium text-muted-foreground mb-4 flex items-center gap-2 text-xs"><DollarSign className={icons.sm} /> BY BUDGET RANGE</h3>
              <div className="h-56">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={computeLeadBreakdown(leads, "budget_range").slice(0, 6)} margin={{ left: 0, right: 0, top: 4, bottom: 20 }}>
                    <XAxis dataKey="name" tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} axisLine={false} tickLine={false} interval={0} angle={-20} textAnchor="end" />
                    <YAxis tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} axisLine={false} tickLine={false} allowDecimals={false} />
                    <Tooltip {...CHART_TOOLTIP_STYLE} />
                    <Bar dataKey="value" radius={[4, 4, 0, 0]} maxBarSize={40}>
                      {computeLeadBreakdown(leads, "budget_range").slice(0, 6).map((_, i) => (<Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
            <div className="rounded-lg border border-border bg-card p-5">
              <h3 className="tracking-premium text-muted-foreground mb-4 flex items-center gap-2 text-xs"><UserCheck className={icons.sm} /> BY INTENT LEVEL</h3>
              <div className="h-56">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={(() => {
                      const counts: Record<string, number> = {};
                      for (const l of leads) { const intent = scoreLeadIntent(l).label; counts[intent] = (counts[intent] ?? 0) + 1; }
                      return ["High", "Medium", "Low"].filter(k => counts[k]).map(name => ({ name, value: counts[name] }));
                    })()}
                    margin={{ left: 0, right: 0, top: 4, bottom: 4 }}
                  >
                    <XAxis dataKey="name" tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} axisLine={false} tickLine={false} allowDecimals={false} />
                    <Tooltip {...CHART_TOOLTIP_STYLE} />
                    <Bar dataKey="value" radius={[4, 4, 0, 0]} maxBarSize={50}>
                      <Cell fill="hsl(142 71% 45% / 0.6)" />
                      <Cell fill="hsl(38 92% 50% / 0.6)" />
                      <Cell fill="hsl(var(--muted-foreground) / 0.4)" />
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </motion.section>
      )}

      {/* Lead Source Breakdown */}
      {leads.length > 0 && (() => {
        const sourceMap: Record<string, number> = {};
        for (const l of leads) { const src = l.lead_source || l.utm_source || "Unknown"; sourceMap[src] = (sourceMap[src] ?? 0) + 1; }
        const sourceData = Object.entries(sourceMap).map(([name, value]) => ({ name, value })).sort((a, b) => b.value - a.value);
        const COLORS = ["hsl(var(--foreground) / 0.8)", "hsl(var(--foreground) / 0.6)", "hsl(var(--foreground) / 0.4)", "hsl(var(--foreground) / 0.25)", "hsl(var(--foreground) / 0.15)", "hsl(var(--foreground) / 0.1)"];
        return (
          <motion.section initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.25 }} className="mb-6">
            <h2 className="text-lg font-serif-display font-medium mb-4 flex items-center gap-2"><Globe className={cn("text-muted-foreground", icons.md)} /> Lead Sources</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="rounded-lg border border-border bg-card p-5">
                <div className="h-56">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie data={sourceData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} innerRadius={40} strokeWidth={1} stroke="hsl(var(--background))">
                        {sourceData.map((_, i) => (<Cell key={i} fill={COLORS[i % COLORS.length]} />))}
                      </Pie>
                      <Tooltip {...CHART_TOOLTIP_STYLE} />
                      <Legend wrapperStyle={{ fontSize: "11px" }} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>
              <div className="rounded-lg border border-border bg-card p-5">
                <div className="h-56">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={sourceData} layout="vertical" margin={{ left: 0, right: 20, top: 0, bottom: 0 }}>
                      <XAxis type="number" tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} axisLine={false} tickLine={false} allowDecimals={false} />
                      <YAxis type="category" dataKey="name" width={100} tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} axisLine={false} tickLine={false} />
                      <Tooltip {...CHART_TOOLTIP_STYLE} />
                      <Bar dataKey="value" radius={[0, 4, 4, 0]} name="Leads">
                        {sourceData.map((_, i) => (<Cell key={i} fill={COLORS[i % COLORS.length]} />))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          </motion.section>
        );
      })()}

      {/* Lead Conversion Over Time */}
      {leads.length > 0 && (
        <motion.section initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }} className="mb-10">
          <h2 className="text-lg font-serif-display font-medium mb-4 flex items-center gap-2"><TrendingDown className={cn("text-muted-foreground", icons.md)} /> Lead Conversion Over Time</h2>
          <div className="rounded-lg border border-border bg-card p-5">
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart
                  data={(() => {
                    const byDate: Record<string, { total: number; high: number; medium: number; low: number }> = {};
                    for (const l of leads) {
                      const d = new Date(l.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric" });
                      if (!byDate[d]) byDate[d] = { total: 0, high: 0, medium: 0, low: 0 };
                      byDate[d].total++;
                      const intent = scoreLeadIntent(l).label.toLowerCase() as "high" | "medium" | "low";
                      byDate[d][intent]++;
                    }
                    return Object.entries(byDate).map(([date, v]) => ({ date, ...v }));
                  })()}
                  margin={{ left: 0, right: 12, top: 4, bottom: 4 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="date" tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} axisLine={false} tickLine={false} allowDecimals={false} />
                  <Tooltip {...CHART_TOOLTIP_STYLE} />
                  <Legend wrapperStyle={{ fontSize: "12px" }} />
                  <Line type="monotone" dataKey="total" stroke="hsl(var(--foreground) / 0.7)" strokeWidth={2} dot={{ r: 4 }} name="Total" />
                  <Line type="monotone" dataKey="high" stroke="hsl(142 71% 45%)" strokeWidth={1.5} dot={{ r: 3 }} name="High Intent" />
                  <Line type="monotone" dataKey="medium" stroke="hsl(38 92% 50%)" strokeWidth={1.5} dot={{ r: 3 }} name="Medium Intent" />
                  <Line type="monotone" dataKey="low" stroke="hsl(var(--muted-foreground) / 0.5)" strokeWidth={1.5} dot={{ r: 3 }} name="Low Intent" />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </motion.section>
      )}

      {/* Lead Acquisition Trend */}
      {leads.length > 0 && (
        <motion.section initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }} className="mb-10">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-serif-display font-medium flex items-center gap-2"><TrendingDown className={cn("text-muted-foreground", icons.md)} /> Lead Acquisition Trend</h2>
            <div className="flex items-center gap-1 rounded-lg border border-border bg-muted/50 p-0.5">
              {(["daily", "weekly", "monthly"] as const).map((g) => (
                <button key={g} onClick={() => setLeadTrendGranularity(g)} className={cn("px-3 py-1 text-xs rounded-md transition-colors capitalize", leadTrendGranularity === g ? "bg-background text-foreground shadow-sm font-medium" : "text-muted-foreground hover:text-foreground")}>{g}</button>
              ))}
            </div>
          </div>
          <div className="rounded-lg border border-border bg-card p-5">
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart
                  data={(() => {
                    const sorted = [...leads].sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
                    const buckets: Record<string, number> = {};
                    for (const l of sorted) {
                      const d = new Date(l.created_at);
                      let key: string;
                      if (leadTrendGranularity === "daily") { key = d.toLocaleDateString("en-US", { month: "short", day: "numeric" }); }
                      else if (leadTrendGranularity === "weekly") { const ws = new Date(d); ws.setDate(d.getDate() - d.getDay()); key = ws.toLocaleDateString("en-US", { month: "short", day: "numeric" }); }
                      else { key = d.toLocaleDateString("en-US", { month: "short", year: "2-digit" }); }
                      buckets[key] = (buckets[key] ?? 0) + 1;
                    }
                    let cumulative = 0;
                    return Object.entries(buckets).map(([date, count]) => { cumulative += count; return { date, [leadTrendGranularity]: count, cumulative }; });
                  })()}
                  margin={{ left: 0, right: 12, top: 4, bottom: 4 }}
                >
                  <defs>
                    <linearGradient id="leadAcqGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="hsl(var(--foreground))" stopOpacity={0.15} />
                      <stop offset="95%" stopColor="hsl(var(--foreground))" stopOpacity={0.02} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="date" tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} axisLine={false} tickLine={false} allowDecimals={false} />
                  <Tooltip {...CHART_TOOLTIP_STYLE} />
                  <Legend wrapperStyle={{ fontSize: "12px" }} />
                  <Area type="monotone" dataKey="cumulative" stroke="hsl(var(--foreground) / 0.6)" strokeWidth={2} fill="url(#leadAcqGradient)" name="Cumulative Leads" />
                  <Area type="monotone" dataKey={leadTrendGranularity} stroke="hsl(142 71% 45% / 0.7)" strokeWidth={1.5} fill="hsl(142 71% 45% / 0.08)" name={`${leadTrendGranularity.charAt(0).toUpperCase() + leadTrendGranularity.slice(1)} Leads`} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        </motion.section>
      )}

      {/* Leads Table */}
      <motion.section initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.55 }} className="mb-16">
        <h2 className="text-lg font-serif-display font-medium mb-4 flex items-center gap-2"><UserCheck className={cn("text-muted-foreground", icons.md)} /> Leads ({leads.length})</h2>
        {leads.length === 0 ? (
          <p className="text-sm text-muted-foreground">No leads captured yet.</p>
        ) : (
          <div className="rounded-lg border border-border bg-card overflow-x-auto">
            <Table className="w-full text-sm">
              <TableHeader>
                <TableRow className="border-b border-border text-left hover:bg-transparent">
                  <TableHead className="px-4 py-3 font-medium text-muted-foreground tracking-premium border-none bg-transparent">Name</TableHead>
                  <TableHead className="px-4 py-3 font-medium text-muted-foreground tracking-premium border-none bg-transparent">Email</TableHead>
                  <TableHead className="px-4 py-3 font-medium text-muted-foreground tracking-premium hidden sm:table-cell border-none bg-transparent">City</TableHead>
                  <TableHead className="px-4 py-3 font-medium text-muted-foreground tracking-premium hidden md:table-cell border-none bg-transparent">Project</TableHead>
                  <TableHead className="px-4 py-3 font-medium text-muted-foreground tracking-premium hidden md:table-cell border-none bg-transparent">Budget</TableHead>
                  <TableHead className="px-4 py-3 font-medium text-muted-foreground tracking-premium hidden lg:table-cell border-none bg-transparent">Timeline</TableHead>
                  <TableHead className="px-4 py-3 font-medium text-muted-foreground tracking-premium hidden lg:table-cell border-none bg-transparent">Source</TableHead>
                  <TableHead className="px-4 py-3 font-medium text-muted-foreground tracking-premium hidden sm:table-cell border-none bg-transparent">Intent</TableHead>
                  <TableHead className="px-4 py-3 font-medium text-muted-foreground tracking-premium text-right border-none bg-transparent">Date</TableHead>
                  <TableHead className="px-4 py-3 w-10 border-none bg-transparent"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody className="divide-y divide-border">
                {leads.map((lead) => (
                  <TableRow key={lead.id} onClick={() => onSelectLead(lead)} className="hover:bg-muted/50 transition-colors cursor-pointer border-t border-border">
                    <TableCell className="px-4 py-2.5 font-medium border-none">{lead.name}</TableCell>
                    <TableCell className="px-4 py-2.5 text-muted-foreground text-xs border-none">{lead.email}</TableCell>
                    <TableCell className="px-4 py-2.5 text-muted-foreground hidden sm:table-cell border-none">{lead.city || "—"}</TableCell>
                    <TableCell className="px-4 py-2.5 text-muted-foreground hidden md:table-cell border-none">{lead.project_type || "—"}</TableCell>
                    <TableCell className="px-4 py-2.5 text-muted-foreground hidden md:table-cell border-none">{lead.budget_range || "—"}</TableCell>
                    <TableCell className="px-4 py-2.5 text-muted-foreground hidden lg:table-cell border-none">{lead.timeline || "—"}</TableCell>
                    <TableCell className="px-4 py-2.5 text-muted-foreground hidden lg:table-cell border-none">{lead.lead_source || lead.utm_source || "—"}</TableCell>
                    <TableCell className="px-4 py-2.5 hidden sm:table-cell border-none">
                      {(() => { const intent = scoreLeadIntent(lead); return (<span className={cn("inline-block px-2 py-0.5 rounded-full text-xs font-medium", intent.cls)}>{intent.label}</span>); })()}
                    </TableCell>
                    <TableCell className="px-4 py-2.5 text-xs text-muted-foreground text-right whitespace-nowrap border-none">{new Date(lead.created_at).toLocaleDateString()}</TableCell>
                    <TableCell className="px-4 py-2.5 text-muted-foreground border-none"><ChevronRight className={icons.sm} /></TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </motion.section>
    </>
  );
};
