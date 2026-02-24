import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { CheckCircle, XCircle, AlertTriangle, Info, X } from 'lucide-react';

const typeConfig = {
    success: {
        icon: CheckCircle,
        bg: 'bg-emerald-500/10',
        border: 'border-emerald-500/30',
        iconColor: 'text-emerald-400',
        progressColor: 'bg-emerald-400',
    },
    error: {
        icon: XCircle,
        bg: 'bg-red-500/10',
        border: 'border-red-500/30',
        iconColor: 'text-red-400',
        progressColor: 'bg-red-400',
    },
    warning: {
        icon: AlertTriangle,
        bg: 'bg-amber-500/10',
        border: 'border-amber-500/30',
        iconColor: 'text-amber-400',
        progressColor: 'bg-amber-400',
    },
    info: {
        icon: Info,
        bg: 'bg-blue-500/10',
        border: 'border-blue-500/30',
        iconColor: 'text-blue-400',
        progressColor: 'bg-blue-400',
    },
};

export default function Toast({ id, message, type = 'info', duration = 5000, onClose }) {
    const config = typeConfig[type] || typeConfig.info;
    const Icon = config.icon;
    const [progress, setProgress] = useState(100);

    // Animate the progress bar
    useEffect(() => {
        if (duration <= 0) return;

        const startTime = Date.now();
        const interval = setInterval(() => {
            const elapsed = Date.now() - startTime;
            const remaining = Math.max(0, 100 - (elapsed / duration) * 100);
            setProgress(remaining);

            if (remaining <= 0) {
                clearInterval(interval);
            }
        }, 50);

        return () => clearInterval(interval);
    }, [duration]);

    return (
        <motion.div
            layout
            initial={{ opacity: 0, x: 60, scale: 0.95 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: 60, scale: 0.95 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className={`
        relative overflow-hidden w-full max-w-sm
        ${config.bg} border ${config.border}
        backdrop-blur-xl rounded-2xl shadow-2xl shadow-black/20
      `}
        >
            {/* Content */}
            <div className="flex items-start gap-3 p-4">
                <div className={`mt-0.5 flex-shrink-0 ${config.iconColor}`}>
                    <Icon size={20} />
                </div>

                <p className="flex-1 text-sm text-slate-100 leading-relaxed pr-2">
                    {message}
                </p>

                <button
                    onClick={() => onClose(id)}
                    className="flex-shrink-0 text-slate-400 hover:text-white transition-colors rounded-lg hover:bg-white/10 p-1 -m-1"
                    aria-label="Dismiss notification"
                >
                    <X size={16} />
                </button>
            </div>

            {/* Progress bar */}
            {duration > 0 && (
                <div className="h-0.5 w-full bg-white/5">
                    <div
                        className={`h-full ${config.progressColor} transition-none`}
                        style={{ width: `${progress}%` }}
                    />
                </div>
            )}
        </motion.div>
    );
}
