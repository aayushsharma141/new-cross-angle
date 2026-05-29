import React, { ReactNode } from 'react';
import { TrendingUp, TrendingDown, Minus, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { cn } from '@/lib/utils';

interface KPIProps {
  title: string;
  value: string | number;
  change?: number;
  changeLabel?: string;
  icon?: ReactNode;
  trend?: 'up' | 'down' | 'neutral';
  className?: string;
}

export function KPI({
  title,
  value,
  change,
  changeLabel = 'vs last period',
  icon,
  trend,
  className,
}: KPIProps) {
  const isPositive = change && change > 0;
  const isNegative = change && change < 0;
  const displayTrend = trend || (isPositive ? 'up' : isNegative ? 'down' : 'neutral');

  return (
    <div className={cn('rounded-lg border bg-card p-6', className)}>
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-muted-foreground">{title}</span>
        {icon && <div className="text-muted-foreground">{icon}</div>}
      </div>
      <div className="mt-2 flex items-baseline gap-2">
        <span className="text-3xl font-bold">{value}</span>
        {change !== undefined && (
          <div
            className={cn(
              'flex items-center gap-1 text-sm',
              displayTrend === 'up' && 'text-emerald-500',
              displayTrend === 'down' && 'text-red-500',
              displayTrend === 'neutral' && 'text-muted-foreground'
            )}
          >
            {displayTrend === 'up' && <TrendingUp className="h-4 w-4" />}
            {displayTrend === 'down' && <TrendingDown className="h-4 w-4" />}
            {displayTrend === 'neutral' && <Minus className="h-4 w-4" />}
            <span className="font-medium">
              {isPositive && '+'}
              {change}%
            </span>
          </div>
        )}
      </div>
      {change !== undefined && (
        <p className="mt-1 text-xs text-muted-foreground">{changeLabel}</p>
      )}
    </div>
  );
}

interface KPIGridProps {
  children: ReactNode;
  columns?: 1 | 2 | 3 | 4;
  className?: string;
}

export function KPIGrid({ children, columns = 4, className }: KPIGridProps) {
  const gridCols = {
    1: 'grid-cols-1',
    2: 'grid-cols-1 md:grid-cols-2',
    3: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3',
    4: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-4',
  };

  return (
    <div className={cn('grid gap-4', gridCols[columns], className)}>
      {children}
    </div>
  );
}

interface MetricCardProps {
  title: string;
  value: number | string;
  subtitle?: string;
  icon?: ReactNode;
  progress?: number;
  color?: 'primary' | 'success' | 'warning' | 'danger';
  className?: string;
}

const colorStyles = {
  primary: 'text-[hsl(var(--admin-primary))] bg-[hsl(var(--admin-primary-muted))]',
  success: 'text-[hsl(var(--admin-success))] bg-[hsl(var(--admin-success-muted))]',
  warning: 'text-[hsl(var(--admin-warning))] bg-[hsl(var(--admin-warning-muted))]',
  danger: 'text-[hsl(var(--admin-danger))] bg-[hsl(var(--admin-danger-muted))]',
};

export function MetricCard({
  title,
  value,
  subtitle,
  icon,
  progress,
  color = 'primary',
  className,
}: MetricCardProps) {
  return (
    <div className={cn('rounded-lg border bg-card p-4', className)}>
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-muted-foreground">{title}</p>
          <p className="mt-1 text-2xl font-bold">{value}</p>
          {subtitle && (
            <p className="mt-1 text-xs text-muted-foreground">{subtitle}</p>
          )}
        </div>
        {icon && (
          <div className={cn('rounded-lg p-2', colorStyles[color])}>
            {icon}
          </div>
        )}
      </div>
      {progress !== undefined && (
        <div className="mt-3">
          <div className="h-2 w-full overflow-hidden rounded-full bg-[hsl(var(--admin-surface))]">
            <div
              className={cn(
                'h-full transition-all',
                color === 'primary' && 'bg-[hsl(var(--admin-primary))]',
                color === 'success' && 'bg-[hsl(var(--admin-success))]',
                color === 'warning' && 'bg-[hsl(var(--admin-warning))]',
                color === 'danger' && 'bg-[hsl(var(--admin-danger))]'
              )}
              style={{ width: `${Math.min(100, Math.max(0, progress))}%` }}
            />
          </div>
          <p className="mt-1 text-xs text-muted-foreground text-right">
            {progress.toFixed(0)}%
          </p>
        </div>
      )}
    </div>
  );
}

interface ConversionFunnelProps {
  stages: {
    name: string;
    count: number;
    value?: number;
  }[];
  className?: string;
}

export function ConversionFunnel({ stages, className }: ConversionFunnelProps) {
  const maxCount = Math.max(...stages.map((s) => s.count));

  return (
    <div className={cn('space-y-2', className)}>
      {stages.map((stage, index) => {
        const percentage = (stage.count / maxCount) * 100;
        const conversionRate = index > 0 
          ? ((stage.count / stages[index - 1].count) * 100).toFixed(1)
          : '100';

        return (
          <div key={stage.name}>
            <div className="flex items-center justify-between text-sm">
              <span className="font-medium">{stage.name}</span>
              <div className="flex items-center gap-2">
                {stage.value !== undefined && (
                  <span className="text-muted-foreground">
                    ₹{stage.value.toLocaleString()}
                  </span>
                )}
                <span className="font-mono text-muted-foreground">
                  {stage.count.toLocaleString()}
                </span>
                {index > 0 && (
                  <span className="flex items-center text-xs text-[hsl(var(--admin-success))]">
                    <ArrowUpRight className="h-3 w-3" />
                    {conversionRate}%
                  </span>
                )}
              </div>
            </div>
            <div className="mt-1 h-6 w-full overflow-hidden rounded-md bg-muted">
              <div
                className="h-full bg-primary transition-all duration-500"
                style={{ width: `${percentage}%` }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}

interface TrendIndicatorProps {
  value: number;
  label?: string;
  className?: string;
}

export function TrendIndicator({ value, label, className }: TrendIndicatorProps) {
  const isPositive = value > 0;
  const isNegative = value < 0;

  return (
    <div className={cn('flex items-center gap-1', className)}>
      {isPositive && (
        <>
          <ArrowUpRight className="h-4 w-4 text-[hsl(var(--admin-success))]" />
          <span className="text-sm font-medium text-[hsl(var(--admin-success))]">+{value}%</span>
        </>
      )}
      {isNegative && (
        <>
          <ArrowDownRight className="h-4 w-4 text-[hsl(var(--admin-danger))]" />
          <span className="text-sm font-medium text-[hsl(var(--admin-danger))]">{value}%</span>
        </>
      )}
      {!isPositive && !isNegative && (
        <span className="text-sm text-muted-foreground">0%</span>
      )}
      {label && <span className="text-sm text-muted-foreground">{label}</span>}
    </div>
  );
}
