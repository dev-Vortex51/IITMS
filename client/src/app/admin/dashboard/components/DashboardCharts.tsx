import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

interface DashboardChartsProps {
  departmentsData: any[];
  placementsData: any[];
}

export function DashboardCharts({
  departmentsData,
  placementsData,
}: DashboardChartsProps) {
  return (
    <div className="grid gap-6 md:grid-cols-2">
      <Card className="shadow-sm border-border/50">
        <CardHeader>
          <CardTitle className="text-lg">Students by Department</CardTitle>
        </CardHeader>
        <CardContent>
          {departmentsData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart
                data={departmentsData}
                margin={{ top: 10, right: 10, left: -20, bottom: 25 }}
              >
                <CartesianGrid
                  strokeDasharray="3 3"
                  vertical={false}
                  stroke="hsl(var(--border))"
                />
                <XAxis
                  dataKey="name"
                  tick={{ fontSize: 12 }}
                  angle={-45}
                  textAnchor="end"
                  height={60}
                  stroke="hsl(var(--muted-foreground))"
                />
                <YAxis
                  tick={{ fontSize: 12 }}
                  stroke="hsl(var(--muted-foreground))"
                />
                <Tooltip
                  cursor={{ fill: "hsl(var(--muted))" }}
                  contentStyle={{
                    borderRadius: "8px",
                    border: "1px solid hsl(var(--border))",
                  }}
                />
                <Bar
                  dataKey="students"
                  fill="hsl(var(--primary))"
                  name="Students"
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-[300px] text-muted-foreground text-sm">
              No department data available
            </div>
          )}
        </CardContent>
      </Card>

      <Card className="shadow-sm border-border/50">
        <CardHeader>
          <CardTitle className="text-lg">Placement Status</CardTitle>
        </CardHeader>
        <CardContent>
          {placementsData.some((d) => d.value > 0) ? (
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={placementsData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) =>
                    `${name}: ${(percent * 100).toFixed(0)}%`
                  }
                  outerRadius={90}
                  innerRadius={60}
                  paddingAngle={2}
                  dataKey="value"
                >
                  {placementsData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    borderRadius: "8px",
                    border: "1px solid hsl(var(--border))",
                  }}
                />
                <Legend verticalAlign="bottom" height={36} />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-[300px] text-muted-foreground text-sm">
              No placement data available
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
