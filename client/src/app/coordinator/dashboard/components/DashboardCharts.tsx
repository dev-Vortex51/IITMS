import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";

export function DashboardCharts({ chartData }: { chartData: any }) {
  return (
    <div className="grid gap-6 md:grid-cols-2">
      <Card className="shadow-sm border-border/50">
        <CardHeader>
          <CardTitle className="text-base font-medium text-muted-foreground">
            Placement Status
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={260}>
            <PieChart>
              <Pie
                data={chartData.placementStatusData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={80} // Creates Donut effect
                paddingAngle={2}
                dataKey="value"
                stroke="none"
              >
                {chartData.placementStatusData.map(
                  (entry: any, index: number) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ),
                )}
              </Pie>
              <Tooltip
                contentStyle={{
                  borderRadius: "8px",
                  border: "none",
                  boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
                }}
              />
              <Legend verticalAlign="bottom" height={36} iconType="circle" />
            </PieChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <Card className="shadow-sm border-border/50">
        <CardHeader>
          <CardTitle className="text-base font-medium text-muted-foreground">
            Students by Level
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={260}>
            <BarChart
              data={chartData.levelData}
              margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
            >
              <CartesianGrid
                strokeDasharray="3 3"
                vertical={false}
                stroke="#e5e7eb"
              />
              <XAxis
                dataKey="level"
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 12, fill: "#6b7280" }}
                dy={10}
              />
              <YAxis
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 12, fill: "#6b7280" }}
              />
              <Tooltip
                cursor={{ fill: "#f3f4f6" }}
                contentStyle={{
                  borderRadius: "8px",
                  border: "none",
                  boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
                }}
              />
              <Bar
                dataKey="students"
                fill="#3b82f6"
                radius={[4, 4, 0, 0]}
                maxBarSize={50}
              />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
}
