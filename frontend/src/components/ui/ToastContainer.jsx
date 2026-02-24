import { AnimatePresence } from 'framer-motion';
import { useToast } from '../../context/ToastContext';
import Toast from './Toast';

export default function ToastContainer() {
    const { toasts, removeToast } = useToast();

    return (
        <div
            aria-live="polite"
            aria-label="Notifications"
            className="fixed top-4 right-4 left-4 sm:left-auto z-[9999] flex flex-col gap-3 sm:w-96 pointer-events-none"
        >
            <AnimatePresence mode="popLayout">
                {toasts.map((t) => (
                    <div key={t.id} className="pointer-events-auto">
                        <Toast
                            id={t.id}
                            message={t.message}
                            type={t.type}
                            duration={t.duration}
                            onClose={removeToast}
                        />
                    </div>
                ))}
            </AnimatePresence>
        </div>
    );
}
