import { motion } from 'framer-motion';
import { cn } from '../../utils/cn';
import Card from './Card';

const CircularProgress = ({ 
  value, 
  max = 100, 
  size = 80, 
  strokeWidth = 6,
  color = 'teal',
  showValue = true,
  className 
}) => {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const percentage = Math.min((value / max) * 100, 100);
  const strokeOffset = circumference - (percentage / 100) * circumference;

  const colorClasses = {
    teal: 'stroke-teal-500',
    violet: 'stroke-violet-500',
    green: 'stroke-green-500',
    blue: 'stroke-blue-500',
    amber: 'stroke-amber-500',
    red: 'stroke-red-500'
  };

  return (
    <div className={cn('relative inline-flex items-center justify-center', className)}>
      <svg width={size} height={size} className="transform -rotate-90">
        {/* Background circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="currentColor"
          strokeWidth={strokeWidth}
          fill="none"
          className="text-slate-700"
        />
        
        {/* Progress circle */}
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="currentColor"
          strokeWidth={strokeWidth}
          fill="none"
          strokeLinecap="round"
          className={colorClasses[color]}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: strokeOffset }}
          transition={{ duration: 1, ease: "easeOut" }}
          style={{
            strokeDasharray: circumference,
            filter: 'drop-shadow(0 0 6px currentColor)'
          }}
        />
      </svg>
      
      {/* Value display */}
      {showValue && (
        <motion.div
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.5, duration: 0.3 }}
          className="absolute inset-0 flex items-center justify-center"
        >
          <span className="text-sm md:text-lg font-bold text-white">
            {Math.round(percentage)}%
          </span>
        </motion.div>
      )}
    </div>
  );
};

const StatCard = ({
  title,
  value,
  unit,
  subtitle,
  icon,
  trend,
  trendValue,
  progress,
  progressMax = 100,
  progressColor = 'teal',
  variant = 'default',
  className,
  onClick,
  ...props
}) => {
  const trendIcon = trend === 'up' ? '↗️' : trend === 'down' ? '↘️' : '';
  const trendColor = trend === 'up' ? 'text-green-400' : trend === 'down' ? 'text-red-400' : 'text-slate-400';

  return (
    <Card
      variant={variant}
      clickable={!!onClick}
      hover={onClick ? 'lift' : 'none'}
      className={cn('relative overflow-hidden', className)}
      onClick={onClick}
      {...props}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1 min-w-0">
          {/* Title */}
          <p className="text-sm md:text-base text-slate-400 font-medium mb-1">
            {title}
          </p>
          
          {/* Main Value */}
          <div className="flex items-baseline gap-1 mb-2">
            <motion.h3
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-2xl md:text-3xl font-bold text-white truncate"
            >
              {value}
            </motion.h3>
            {unit && (
              <span className="text-sm text-slate-400 font-medium">
                {unit}
              </span>
            )}
          </div>
          
          {/* Subtitle */}
          {subtitle && (
            <p className="text-xs md:text-sm text-slate-500 mb-3">
              {subtitle}
            </p>
          )}
          
          {/* Trend */}
          {trend && (
            <div className={cn('flex items-center gap-1 text-sm', trendColor)}>
              <span>{trendIcon}</span>
              <span className="font-medium">
                {trendValue}
              </span>
            </div>
          )}
        </div>
        
        {/* Icon or Progress */}
        <div className="flex-shrink-0 ml-4">
          {progress !== undefined ? (
            <CircularProgress
              value={progress}
              max={progressMax}
              color={progressColor}
              size={64}
              strokeWidth={4}
            />
          ) : icon ? (
            <div className="w-10 h-10 md:w-12 md:h-12 rounded-2xl bg-gradient-to-br from-teal-500/10 to-cyan-500/10 border border-teal-500/20 flex items-center justify-center text-teal-400">
              {icon}
            </div>
          ) : null}
        </div>
      </div>
      
      {/* Background decoration */}
      <div className="absolute inset-0 bg-gradient-to-br from-transparent via-transparent to-teal-500/5 pointer-events-none" />
    </Card>
  );
};

// Predefined stat card variants
StatCard.Progress = ({ progress, progressMax, progressColor, ...props }) => (
  <StatCard 
    progress={progress} 
    progressMax={progressMax} 
    progressColor={progressColor}
    variant="teal"
    {...props} 
  />
);

StatCard.Metric = ({ icon, trend, trendValue, ...props }) => (
  <StatCard 
    icon={icon}
    trend={trend}
    trendValue={trendValue}
    variant="gradient"
    {...props} 
  />
);

StatCard.Simple = ({ value, title, ...props }) => (
  <StatCard 
    value={value}
    title={title}
    variant="glass"
    {...props} 
  />
);

export default StatCard;