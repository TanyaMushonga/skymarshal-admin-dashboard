
import React from 'react';

interface StatCardProps {
  label: string;
  value: string | number;
  icon: React.ReactNode;
  trend?: string;
  color?: string;
}

const StatCard: React.FC<StatCardProps> = ({ label, value, icon, trend, color = 'blue' }) => {
  return (
    <div className="glass rounded-xl p-5 shadow-lg shadow-blue-500/5 transition-all hover:scale-[1.02]">
      <div className="flex justify-between items-start mb-4">
        <div className={`p-2 rounded-lg bg-${color}-500/10 text-${color}-500`}>
          {icon}
        </div>
        {trend && (
          <span className="text-xs font-medium text-emerald-500 bg-emerald-500/10 px-2 py-1 rounded-full">
            {trend}
          </span>
        )}
      </div>
      <h3 className="text-slate-400 text-sm font-medium">{label}</h3>
      <p className="text-2xl font-bold mt-1 text-slate-100">{value}</p>
    </div>
  );
};

export default StatCard;
