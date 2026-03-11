import { LucideIcon } from "lucide-react";

interface StatsCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  trend?: string;
  trendUp?: boolean;
  colorClass?: string;
}

const StatsCard = ({ title, value, icon: Icon, trend, trendUp, colorClass = "text-primary" }: StatsCardProps) => (
  <div className="bg-card rounded-xl p-5 shadow-card border border-border/50">
    <div className="flex items-start justify-between">
      <div>
        <p className="text-sm text-muted-foreground">{title}</p>
        <p className="text-2xl font-bold font-display mt-1">{value}</p>
        {trend && (
          <p className={`text-xs mt-1 ${trendUp ? "text-success" : "text-danger"}`}>
            {trendUp ? "↑" : "↓"} {trend}
          </p>
        )}
      </div>
      <div className={`p-3 rounded-lg bg-primary/10 ${colorClass}`}>
        <Icon className="w-5 h-5" />
      </div>
    </div>
  </div>
);

export default StatsCard;
