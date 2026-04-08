import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Skeleton } from "@/components/ui/skeleton";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";
import { format, subDays } from "date-fns";

const COLORS = ["hsl(24, 100%, 50%)", "hsl(45, 100%, 55%)", "hsl(142, 76%, 36%)", "hsl(217, 91%, 60%)", "hsl(280, 65%, 60%)"];

export function AdminAnalyticsTab() {
  // Fetch user signup trend (last 14 days)
  const { data: signupTrend, isLoading: signupLoading } = useQuery({
    queryKey: ["admin-signup-trend"],
    queryFn: async () => {
      const { data: profiles } = await supabase
        .from("profiles")
        .select("created_at")
        .gte("created_at", subDays(new Date(), 14).toISOString());

      const days = Array.from({ length: 14 }, (_, i) => {
        const date = subDays(new Date(), 13 - i);
        const dayProfiles = profiles?.filter((p) => {
          const pDate = new Date(p.created_at);
          return (
            pDate.getFullYear() === date.getFullYear() &&
            pDate.getMonth() === date.getMonth() &&
            pDate.getDate() === date.getDate()
          );
        });
        return {
          date: format(date, "MMM d"),
          signups: dayProfiles?.length || 0,
        };
      });

      return days;
    },
  });

  // Fetch participation trend (last 14 days)
  const { data: participationTrend, isLoading: participationLoading } = useQuery({
    queryKey: ["admin-participation-trend"],
    queryFn: async () => {
      const { data: participations } = await supabase
        .from("moment_participants")
        .select("joined_at")
        .gte("joined_at", subDays(new Date(), 14).toISOString());

      const days = Array.from({ length: 14 }, (_, i) => {
        const date = subDays(new Date(), 13 - i);
        const dayParts = participations?.filter((p) => {
          const pDate = new Date(p.joined_at);
          return (
            pDate.getFullYear() === date.getFullYear() &&
            pDate.getMonth() === date.getMonth() &&
            pDate.getDate() === date.getDate()
          );
        });
        return {
          date: format(date, "MMM d"),
          participations: dayParts?.length || 0,
        };
      });

      return days;
    },
  });

  // Fetch moments by category
  const { data: categoryData, isLoading: categoryLoading } = useQuery({
    queryKey: ["admin-moments-by-category"],
    queryFn: async () => {
      const { data: moments } = await supabase
        .from("moments")
        .select("category");

      const categoryCount: Record<string, number> = {};
      moments?.forEach((m) => {
        categoryCount[m.category] = (categoryCount[m.category] || 0) + 1;
      });

      return Object.entries(categoryCount).map(([name, value]) => ({
        name: name.charAt(0).toUpperCase() + name.slice(1),
        value,
      }));
    },
  });

  // Fetch users by role
  const { data: roleData, isLoading: roleLoading } = useQuery({
    queryKey: ["admin-users-by-role"],
    queryFn: async () => {
      const { data: roles } = await supabase
        .from("user_roles")
        .select("role");

      const roleCount: Record<string, number> = {};
      roles?.forEach((r) => {
        roleCount[r.role] = (roleCount[r.role] || 0) + 1;
      });

      return Object.entries(roleCount).map(([name, value]) => ({
        name: name.charAt(0).toUpperCase() + name.slice(1),
        value,
      }));
    },
  });

  // Fetch check-in rate
  const { data: checkInRate, isLoading: checkInLoading } = useQuery({
    queryKey: ["admin-checkin-rate"],
    queryFn: async () => {
      const { count: totalParts } = await supabase
        .from("moment_participants")
        .select("*", { count: "exact", head: true });

      const { count: checkedIn } = await supabase
        .from("moment_participants")
        .select("*", { count: "exact", head: true })
        .eq("status", "checked_in");

      return {
        total: totalParts || 0,
        checkedIn: checkedIn || 0,
        rate: totalParts ? Math.round((checkedIn || 0) / totalParts * 100) : 0,
      };
    },
  });

  return (
    <div className="space-y-8">
      {/* Charts Grid */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* User Signups Trend */}
        <div className="bg-card rounded-xl p-6 border border-border">
          <h3 className="font-semibold text-foreground mb-4">User Signups (14 Days)</h3>
          {signupLoading ? (
            <Skeleton className="h-64" />
          ) : (
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={signupTrend}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="date" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "hsl(var(--card))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "8px",
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="signups"
                  stroke="hsl(24, 100%, 50%)"
                  strokeWidth={3}
                  dot={{ fill: "hsl(24, 100%, 50%)", strokeWidth: 2, r: 4 }}
                />
              </LineChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Participation Trend */}
        <div className="bg-card rounded-xl p-6 border border-border">
          <h3 className="font-semibold text-foreground mb-4">Participations (14 Days)</h3>
          {participationLoading ? (
            <Skeleton className="h-64" />
          ) : (
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={participationTrend}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="date" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "hsl(var(--card))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "8px",
                  }}
                />
                <Bar dataKey="participations" fill="hsl(142, 76%, 36%)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Moments by Category */}
        <div className="bg-card rounded-xl p-6 border border-border">
          <h3 className="font-semibold text-foreground mb-4">Moments by Category</h3>
          {categoryLoading ? (
            <Skeleton className="h-64" />
          ) : categoryData && categoryData.length > 0 ? (
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={categoryData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={90}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {categoryData.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: "hsl(var(--card))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "8px",
                  }}
                />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-64 flex items-center justify-center text-muted-foreground">
              No data available
            </div>
          )}
        </div>

        {/* Users by Role */}
        <div className="bg-card rounded-xl p-6 border border-border">
          <h3 className="font-semibold text-foreground mb-4">Users by Role</h3>
          {roleLoading ? (
            <Skeleton className="h-64" />
          ) : roleData && roleData.length > 0 ? (
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={roleData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis type="number" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                <YAxis type="category" dataKey="name" stroke="hsl(var(--muted-foreground))" fontSize={12} width={80} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "hsl(var(--card))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "8px",
                  }}
                />
                <Bar dataKey="value" fill="hsl(217, 91%, 60%)" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-64 flex items-center justify-center text-muted-foreground">
              No data available
            </div>
          )}
        </div>
      </div>

      {/* Check-in Rate Card */}
      <div className="bg-card rounded-xl p-6 border border-border">
        <h3 className="font-semibold text-foreground mb-4">Platform Check-in Rate</h3>
        {checkInLoading ? (
          <Skeleton className="h-20" />
        ) : (
          <div className="grid md:grid-cols-3 gap-6">
            <div>
              <p className="text-sm text-muted-foreground">Total Participations</p>
              <p className="text-3xl font-bold text-foreground">{checkInRate?.total.toLocaleString()}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Verified Check-ins</p>
              <p className="text-3xl font-bold text-emerald-500">{checkInRate?.checkedIn.toLocaleString()}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Check-in Rate</p>
              <p className="text-3xl font-bold text-primary">{checkInRate?.rate}%</p>
              <div className="mt-2 h-2 bg-secondary rounded-full overflow-hidden">
                <div
                  className="h-full bg-primary rounded-full"
                  style={{ width: `${checkInRate?.rate || 0}%` }}
                />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
