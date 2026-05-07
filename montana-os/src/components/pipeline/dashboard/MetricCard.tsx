'use client';

interface MetricCardProps {
  label: string;
  value: string | number;
  subtext?: string;
  trend?: 'up' | 'down' | 'neutral';
  icon?: React.ReactNode;
}

export function MetricCard({
  label,
  value,
  subtext,
  trend,
  icon,
}: MetricCardProps) {
  return (
    <div className="bg-white border border-border rounded-lg p-6 hover:shadow-sm transition-shadow">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-sm text-muted-foreground mb-2 uppercase tracking-wider">
            {label}
          </p>
          <div className="flex items-baseline gap-2">
            <p className="text-3xl font-bold font-editorial">{value}</p>
            {trend && (
              <span
                className={`text-xs font-medium ${
                  trend === 'up'
                    ? 'text-green-600'
                    : trend === 'down'
                    ? 'text-red-600'
                    : 'text-gray-600'
                }`}
              >
                {trend === 'up' ? '↑' : trend === 'down' ? '↓' : '→'}
              </span>
            )}
          </div>
          {subtext && (
            <p className="text-xs text-muted-foreground mt-3">{subtext}</p>
          )}
        </div>
        {icon && (
          <div className="text-2xl text-montana-gold opacity-50">{icon}</div>
        )}
      </div>
    </div>
  );
}
