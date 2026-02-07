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
  Building2
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import AnimatedCounter from "@/components/ui/AnimatedCounter";
import { StatsSkeleton } from "@/components/ui/skeleton";
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

interface DashboardStats {
  totalLeads: number;
  leadsThisWeek: number;
  leadsThisMonth: number;
  residentialLeads: number;
  commercialLeads: number;
  publishedBlogs: number;
  portfolioItems: number;
}

const COLORS = ['hsl(38, 75%, 55%)', 'hsl(217, 33%, 17.5%)', 'hsl(0, 0%, 40%)'];

const AdminDashboard = () => {
  const [stats, setStats] = useState<DashboardStats>({
    totalLeads: 0,
    leadsThisWeek: 0,
    leadsThisMonth: 0,
    residentialLeads: 0,
    commercialLeads: 0,
    publishedBlogs: 0,
    portfolioItems: 0
  });
  const [weeklyData, setWeeklyData] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const now = new Date();
      const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

      // Fetch leads
      const { data: leads } = await supabase
        .from('leads')
        .select('id, created_at, category');

      // Fetch blogs
      const { data: blogs } = await supabase
        .from('blogs')
        .select('id')
        .eq('published', true);

      // Fetch portfolio
      const { data: portfolio } = await supabase
        .from('portfolio')
        .select('id');

      if (leads) {
        const weekLeads = leads.filter(l => new Date(l.created_at) >= weekAgo);
        const monthLeads = leads.filter(l => new Date(l.created_at) >= monthAgo);
        const residential = leads.filter(l => l.category === 'residential');
        const commercial = leads.filter(l => l.category === 'commercial');

        setStats({
          totalLeads: leads.length,
          leadsThisWeek: weekLeads.length,
          leadsThisMonth: monthLeads.length,
          residentialLeads: residential.length,
          commercialLeads: commercial.length,
          publishedBlogs: blogs?.length || 0,
          portfolioItems: portfolio?.length || 0
        });

        // Generate weekly data
        const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
        const weekData = days.map((day, index) => {
          const dayLeads = weekLeads.filter(l =>
            new Date(l.created_at).getDay() === index
          );
          return { name: day, leads: dayLeads.length };
        });
        setWeeklyData(weekData);
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
      trend: stats.leadsThisWeek > 0 ? "up" : "neutral",
      trendValue: `+${stats.leadsThisWeek} this week`
    },
    {
      title: "This Month",
      value: stats.leadsThisMonth,
      icon: TrendingUp,
      trend: "up",
      trendValue: "Active leads"
    },
    {
      title: "Published Posts",
      value: stats.publishedBlogs,
      icon: FileText,
      trend: "neutral",
      trendValue: "Blog articles"
    },
    {
      title: "Portfolio Items",
      value: stats.portfolioItems,
      icon: Eye,
      trend: "neutral",
      trendValue: "Projects"
    }
  ];

  if (isLoading) {
    return (
      <div className="space-y-8">
        <div>
          <h1 className="font-display text-3xl font-bold">Dashboard</h1>
          <p className="text-muted-foreground mt-1">Loading your data...</p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => <StatsSkeleton key={i} />)}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-display text-3xl font-bold">Dashboard</h1>
        <p className="text-muted-foreground mt-1">Welcome to your admin panel</p>
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
            <Card className="bg-card border-border">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                    <stat.icon className="w-5 h-5 text-primary" />
                  </div>
                  {stat.trend === "up" && (
                    <ArrowUpRight className="w-4 h-4 text-green-500" />
                  )}
                </div>
                <div className="text-3xl font-bold mb-1">
                  <AnimatedCounter value={stat.value} duration={1.5} />
                </div>
                <div className="text-sm text-muted-foreground">{stat.title}</div>
                <div className="text-xs text-muted-foreground mt-2">{stat.trendValue}</div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Charts */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Weekly Leads Chart */}
        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="text-lg font-semibold">Weekly Leads</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={weeklyData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="name" stroke="hsl(var(--muted-foreground))" />
                  <YAxis stroke="hsl(var(--muted-foreground))" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'hsl(var(--card))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px'
                    }}
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
            <CardTitle className="text-lg font-semibold">Leads by Category</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64 flex items-center justify-center">
              {pieData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={pieData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={100}
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
            <div className="flex justify-center gap-6 mt-4">
              {pieData.map((entry, index) => (
                <div key={entry.name} className="flex items-center gap-2">
                  <div
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: COLORS[index % COLORS.length] }}
                  />
                  <span className="text-sm text-muted-foreground">{entry.name}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdminDashboard;