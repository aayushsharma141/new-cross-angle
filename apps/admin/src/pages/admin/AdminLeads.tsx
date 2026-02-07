import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Mail, Phone, Calendar, Tag, MessageSquare, Loader2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";

interface Lead {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  message: string | null;
  category: string;
  ai_response: string | null;
  created_at: string;
}

import { Pagination } from "@repo/ui";

const ITEMS_PER_PAGE = 9;

const AdminLeads = () => {
  const [viewMode, setViewMode] = useState<'list' | 'kanban'>('list');
  const [leads, setLeads] = useState<Lead[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    fetchLeads();
  }, [currentPage]);

  const fetchLeads = async () => {
    setIsLoading(true);
    const from = (currentPage - 1) * ITEMS_PER_PAGE;
    const to = from + ITEMS_PER_PAGE - 1;

    const { data, count } = await (supabase
      .from('leads' as any)
      .select('*', { count: 'exact' })
      .order('created_at', { ascending: false })
      .range(from, to)) as any;

    if (data) setLeads(data);
    if (count) setTotalPages(Math.ceil(count / ITEMS_PER_PAGE));

    setIsLoading(false);
  };

  if (isLoading) {
    return <div className="flex items-center justify-center h-64"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>;
  }



  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-3xl font-bold">Leads</h1>
          <p className="text-muted-foreground mt-1">Manage your inquiries</p>
        </div>
        <div className="flex bg-secondary p-1 rounded-lg">
          <Button
            variant={viewMode === 'list' ? 'secondary' : 'ghost'}
            size="sm"
            onClick={() => setViewMode('list')}
            className={viewMode === 'list' ? 'bg-background shadow-sm' : ''}
          >
            List
          </Button>
          <Button
            variant={viewMode === 'kanban' ? 'secondary' : 'ghost'}
            size="sm"
            onClick={() => setViewMode('kanban')}
            className={viewMode === 'kanban' ? 'bg-background shadow-sm' : ''}
          >
            Kanban
          </Button>
        </div>
      </div>

      {viewMode === 'list' ? (
        <div className="space-y-4">
          {leads.map((lead, i) => (
            <motion.div key={lead.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
              <Card className="bg-card border-border">
                <CardContent className="p-6">
                  <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="font-semibold text-lg">{lead.name}</h3>
                        <Badge variant="outline" className="capitalize">{lead.category}</Badge>
                      </div>
                      <div className="flex flex-wrap gap-4 text-sm text-muted-foreground mb-3">
                        <span className="flex items-center gap-1"><Mail size={14} />{lead.email}</span>
                        {lead.phone && <span className="flex items-center gap-1"><Phone size={14} />{lead.phone}</span>}
                        <span className="flex items-center gap-1"><Calendar size={14} />{format(new Date(lead.created_at), 'MMM dd, yyyy')}</span>
                      </div>
                      {lead.message && <p className="text-muted-foreground text-sm mb-3">{lead.message}</p>}
                      {lead.ai_response && (
                        <div className="p-3 rounded-lg bg-secondary/50 border border-border">
                          <p className="text-xs text-primary mb-1 flex items-center gap-1"><MessageSquare size={12} />AI Response</p>
                          <p className="text-sm text-muted-foreground">{lead.ai_response}</p>
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
          {leads.length === 0 && <div className="text-center py-12 text-muted-foreground">No leads yet.</div>}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 overflow-x-auto pb-4">
          {['Residential Interior', 'Commercial Interior', 'Office Space', 'Other'].map((category) => {
            // Filter leads for this column. 'Other' caches everything else.
            const categoryLeads = leads.filter(l => {
              if (category === 'Other') {
                return !['Residential Interior', 'Commercial Interior', 'Office Space'].includes(l.category);
              }
              return l.category === category || l.category === category.split(' ')[0].toLowerCase(); // Basic fuzzy matching if valid
            });

            return (
              <div key={category} className="min-w-[300px] flex flex-col gap-4">
                <div className="flex items-center justify-between p-2 bg-secondary/50 rounded-lg">
                  <h3 className="font-medium text-sm">{category}</h3>
                  <span className="text-xs text-muted-foreground bg-secondary px-2 py-0.5 rounded-full">
                    {categoryLeads.length}
                  </span>
                </div>
                <div className="space-y-3">
                  {categoryLeads.map(lead => (
                    <Card key={lead.id} className="bg-card border-border cursor-pointer hover:border-primary/50 transition-colors">
                      <CardContent className="p-4 space-y-3">
                        <div>
                          <h4 className="font-semibold text-sm truncate">{lead.name}</h4>
                          <p className="text-xs text-muted-foreground truncate">{lead.email}</p>
                        </div>
                        {lead.message && <p className="text-xs line-clamp-2 text-muted-foreground">{lead.message}</p>}
                        <div className="flex items-center justify-between text-xs text-muted-foreground pt-2 border-t border-border/50">
                          <span>{format(new Date(lead.created_at), 'MMM dd')}</span>
                          {lead.phone && <Phone size={12} />}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                  {categoryLeads.length === 0 && (
                    <div className="h-24 rounded-lg border-2 border-dashed border-border/50 flex items-center justify-center">
                      <p className="text-xs text-muted-foreground">Empty</p>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {totalPages > 1 && (
        <div className="py-4">
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
          />
        </div>
      )}
    </div>
  );
};

export default AdminLeads;