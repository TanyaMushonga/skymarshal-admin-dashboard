import React from "react";

interface StatCardProps {
  label: string;
  value: string | number;
  icon: React.ReactNode;
  trend?: string;
  color?: string;
}

const StatCard: React.FC<StatCardProps> = ({
  label,
  value,
  icon,
  trend,
  color = "blue",
}) => {
  // Mapping color prop to tailwind classes carefully for theme support
  const colorClasses: Record<string, string> = {
    blue: "bg-primary/10 text-primary border-primary/20",
    indigo: "bg-indigo-500/10 text-indigo-400 border-indigo-500/20",
    emerald: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
    amber: "bg-amber-500/10 text-amber-400 border-amber-500/20",
    destructive: "bg-destructive/10 text-destructive border-destructive/20",
  };

  const activeColorClass = colorClasses[color] || colorClasses.blue;

  return (
    <div className="bg-card border border-border rounded-xl p-5 shadow-lg shadow-primary/5 transition-all hover:scale-[1.02]">
      <div className="flex justify-between items-start mb-4">
        <div className={`p-2 rounded-lg border ${activeColorClass}`}>
          {icon}
        </div>
        {trend && (
          <span className="text-[10px] font-bold text-emerald-500 bg-emerald-500/10 px-2.5 py-1 rounded-full border border-emerald-500/20">
            {trend}
          </span>
        )}
      </div>
      <h3 className="text-muted-foreground text-xs font-bold uppercase tracking-[0.2em] mb-1">
        {label}
      </h3>
      <p className="text-3xl font-bold text-foreground tabular-nums tracking-tighter">
        {value}
      </p>
    </div>
  );
};

export default StatCard;
