import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Users,
  TrendingUp,
  Eye,
  FileText,
  ArrowUpRight,
  ArrowDownRight,
  Home,
  Building2,
  Calendar,
  Activity
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from "recharts";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { format, subDays, isAfter, parseISO } from "date-fns";

interface DashboardStats {
  totalLeads: number;
  periodLeads: number;
  residentialLeads: number;
  commercialLeads: number;
  publishedBlogs: number;
  portfolioItems: number;
}

interface ActivityItem {
  id: string;
  type: 'lead' | 'project' | 'blog';
  title: string;
  date: string;
  meta?: string;
}

const COLORS = ['hsl(38, 75%, 55%)', 'hsl(217, 33%, 17.5%)', 'hsl(0, 0%, 40%)'];

const AdminDashboard = () => {
  const [timeRange, setTimeRange] = useState("30d");
  const [stats, setStats] = useState<DashboardStats>({
    totalLeads: 0,
    periodLeads: 0,
    residentialLeads: 0,
    commercialLeads: 0,
    publishedBlogs: 0,
    portfolioItems: 0
  });
  const [weeklyData, setWeeklyData] = useState<any[]>([]);
  const [recentActivity, setRecentActivity] = useState<ActivityItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, [timeRange]);

  const fetchDashboardData = async () => {
    setIsLoading(true);
    try {
      const now = new Date();
      let startDate = subDays(now, 30);

      if (timeRange === "7d") startDate = subDays(now, 7);
      if (timeRange === "90d") startDate = subDays(now, 90);
      if (timeRange === "all") startDate = new Date(0); // Beginning of time

      // Fetch leads
      // @ts-ignore
      const { data: leadsData, error: leadsError } = await supabase
        .from('leads')
        .select('id, created_at, category, full_name');

      if (leadsError) throw leadsError;
      const leads = leadsData as unknown as { id: string, created_at: string, category: string, full_name: string }[];

      // Fetch blogs
      const { data: blogsData, error: blogsError } = await supabase
        .from('blogs')
        .select('id, title, created_at, is_published')
        .eq('is_published', true);

      if (blogsError) throw blogsError;
      const blogs = blogsData as unknown as { id: string, title: string, created_at: string, is_published: boolean }[];

      // Fetch portfolio
      const { data: portfolioData, error: portfolioError } = await supabase
        .from('projects')
        .select('id, title, created_at');

      if (portfolioError) throw portfolioError;
      const portfolio = portfolioData as unknown as { id: string, title: string, created_at: string }[];

      if (leads) {
        const periodLeads = leads.filter(l => isAfter(parseISO(l.created_at), startDate));
        const residential = leads.filter(l => l.category === 'residential' || l.category === 'Residential Interior');
        const commercial = leads.filter(l => l.category === 'commercial' || l.category === 'Commercial Interior' || l.category === 'Office Space');

        setStats({
          totalLeads: leads.length,
          periodLeads: periodLeads.length,
          residentialLeads: residential.length,
          commercialLeads: commercial.length,
          publishedBlogs: blogs?.filter(b => b.is_published).length || 0,
          portfolioItems: portfolio?.length || 0
        });

        // Generate chart data based on range
        // For simplicity, we'll group by day for < 90d, otherwise by month could be better but let's stick to days/weeks logic
        // Actually for the chart, let's keep it simple: "Recent Trend"
        // If range is large, maybe group by week? For now, let's show last 7-14 days regardless of range for the chart, 
        // OR map the "periodLeads" distribution.
        // Let's make the Bar Chart always show the "Last 7 Days" trend for immediate utility, or match the filter?
        // Matching filter is better.

        const chartDays = timeRange === "7d" ? 7 : timeRange === "30d" ? 30 : 7; // limitation for chart clarity

        // Creating simple daily data for the chart period (defaults to last 7 days if range is huge for visual clarity)
        const daysToShow = 7;
        const chartData = Array.from({ length: daysToShow }).map((_, i) => {
          const d = subDays(now, daysToShow - 1 - i);
          const dayLeads = leads.filter(l =>
            format(parseISO(l.created_at), 'yyyy-MM-dd') === format(d, 'yyyy-MM-dd')
          );
          return {
            name: format(d, 'EEE'), // Mon, Tue...
            fullDate: format(d, 'MMM dd'),
            leads: dayLeads.length
          };
        });
        setWeeklyData(chartData);

        // Activity Feed Aggregation
        const activities: ActivityItem[] = [
          ...(leads.map(l => ({
            id: l.id,
            type: 'lead' as const,
            title: `New Lead: ${l.full_name}`,
            date: l.created_at,
            meta: l.category
          }))),
          ...(blogs?.map(b => ({
            id: b.id,
            type: 'blog' as const,
            title: `Post ${b.is_published ? 'Published' : 'Created'}: ${b.title}`,
            date: b.created_at,
            meta: 'Blog'
          })) || []),
          ...(portfolio?.map(p => ({
            id: p.id,
            type: 'project' as const,
            title: `Project Added: ${p.title}`,
            date: p.created_at,
            meta: 'Portfolio'
          })) || [])
        ];

        // Sort by date desc and take top 5
        setRecentActivity(
          activities.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).slice(0, 5)
        );
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const pieData = [
    { name: 'Residential', value: stats.residentialLeads },
    { name: 'Commercial', value: stats.commercialLeads },
    { name: 'Other', value: stats.totalLeads - stats.residentialLeads - stats.commercialLeads }
  ].filter(d => d.value > 0);

  const statCards = [
    {
      title: "Total Leads",
      value: stats.totalLeads,
      icon: Users,
      trend: "neutral" as const,
      trendValue: "Lifetime volume"
    },
    {
      title: timeRange === "7d" ? "This Week" : timeRange === "30d" ? "This Month" : "Selected Period",
      value: stats.periodLeads,
      icon: TrendingUp,
      trend: "up" as const,
      trendValue: "New inquiries"
    },
    {
      title: "Published Posts",
      value: stats.publishedBlogs,
      icon: FileText,
      trend: "neutral" as const,
      trendValue: "Blog articles"
    },
    {
      title: "Portfolio Items",
      value: stats.portfolioItems,
      icon: Eye,
      trend: "neutral" as const,
      trendValue: "Projects"
    }
  ];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-bold">Dashboard</h1>
          <p className="text-muted-foreground mt-1">Welcome to your admin panel</p>
        </div>

        <Select value={timeRange} onValueChange={setTimeRange}>
          <SelectTrigger className="w-[180px] bg-card">
            <Calendar className="w-4 h-4 mr-2 text-muted-foreground" />
            <SelectValue placeholder="Select Range" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="7d">Last 7 Days</SelectItem>
            <SelectItem value="30d">Last 30 Days</SelectItem>
            <SelectItem value="90d">Last 3 months</SelectItem>
            <SelectItem value="all">All Time</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat, index) => (
          <motion.div
            key={stat.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <Card className="bg-card border-border hover:border-primary/50 transition-colors">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                    <stat.icon className="w-5 h-5 text-primary" />
                  </div>
                  {stat.trend === "up" && (
                    <ArrowUpRight className="w-4 h-4 text-green-500" />
                  )}
                </div>
                <div className="text-3xl font-bold mb-1">{stat.value}</div>
                <div className="text-sm font-medium text-foreground">{stat.title}</div>
                <div className="text-xs text-muted-foreground mt-1">{stat.trendValue}</div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Charts & Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Charts Column */}
        <div className="lg:col-span-2 space-y-6">
          {/* Recent Trend Chart */}
          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle className="text-lg font-semibold">Lead Trend (Last 7 Days)</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={weeklyData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis
                      dataKey="name"
                      stroke="hsl(var(--muted-foreground))"
                      fontSize={12}
                    />
                    <YAxis
                      stroke="hsl(var(--muted-foreground))"
                      fontSize={12}
                      allowDecimals={false}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: 'hsl(var(--card))',
                        border: '1px solid hsl(var(--border))',
                        borderRadius: '8px'
                      }}
                      labelStyle={{ color: 'hsl(var(--foreground))' }}
                    />
                    <Bar dataKey="leads" fill="hsl(38, 75%, 55%)" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* Leads by Category */}
          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle className="text-lg font-semibold">All-Time Statistics</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-4">
                <div className="h-[250px] flex items-center justify-center">
                  {pieData.length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={pieData}
                          cx="50%"
                          cy="50%"
                          innerRadius={60}
                          outerRadius={80}
                          paddingAngle={5}
                          dataKey="value"
                        >
                          {pieData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip
                          contentStyle={{
                            backgroundColor: 'hsl(var(--card))',
                            border: '1px solid hsl(var(--border))',
                            borderRadius: '8px'
                          }}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                  ) : (
                    <p className="text-muted-foreground">No lead data available</p>
                  )}
                </div>
                <div className="flex flex-col justify-center space-y-4">
                  <h4 className="font-medium text-muted-foreground text-sm">Distribution by Category</h4>
                  {pieData.map((entry, index) => (
                    <div key={entry.name} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div
                          className="w-3 h-3 rounded-full"
                          style={{ backgroundColor: COLORS[index % COLORS.length] }}
                        />
                        <span className="text-sm font-medium">{entry.name}</span>
                      </div>
                      <span className="text-sm text-muted-foreground">{entry.value} leads</span>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Recent Activity Column */}
        <div className="lg:col-span-1">
          <Card className="bg-card border-border h-full">
            <CardHeader>
              <div className="flex items-center gap-2">
                <Activity className="w-5 h-5 text-primary" />
                <CardTitle className="text-lg font-semibold">Recent Activity</CardTitle>
              </div>
              <CardDescription>Latest system events</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6 relative">
                {/* Vertical line */}
                <div className="absolute left-[19px] top-2 bottom-2 w-[1px] bg-border" />

                {recentActivity.map((item, index) => (
                  <motion.div
                    key={`${item.type}-${item.id}`}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="flex gap-4 relative"
                  >
                    <div className={`
                       relative z-10 w-10 h-10 rounded-full flex items-center justify-center shrink-0 border-4 border-card
                       ${item.type === 'lead' ? 'bg-blue-100 text-blue-600' :
                        item.type === 'project' ? 'bg-amber-100 text-amber-600' :
                          'bg-green-100 text-green-600'}
                     `}>
                      {item.type === 'lead' && <Users className="w-4 h-4" />}
                      {item.type === 'project' && <Eye className="w-4 h-4" />}
                      {item.type === 'blog' && <FileText className="w-4 h-4" />}
                    </div>
                    <div className="pt-1">
                      <p className="text-sm font-medium leading-none mb-1">{item.title}</p>
                      <div className="flex items-center text-xs text-muted-foreground gap-2">
                        <span>{format(parseISO(item.date), 'MMM dd, HH:mm')}</span>
                        <span>•</span>
                        <span className="capitalize">{item.meta}</span>
                      </div>
                    </div>
                  </motion.div>
                ))}

                {recentActivity.length === 0 && (
                  <p className="text-center text-muted-foreground text-sm py-4">No recent activity</p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;