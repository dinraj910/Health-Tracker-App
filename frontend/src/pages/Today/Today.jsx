import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Check, 
  X, 
  Clock, 
  Pill,
  AlertCircle,
  ChevronLeft,
  ChevronRight,
  Calendar,
  TrendingUp
} from 'lucide-react';
import DashboardLayout from '../../layouts/DashboardLayout';
import { Button, Card, Badge, Loader, StatCard } from '../../components/ui';
import { getTodayMedicines, logMedicine } from '../../services/logService';

const Today = () => {
  const [medicines, setMedicines] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [actionLoading, setActionLoading] = useState(null);

  const fetchTodayMedicines = useCallback(async () => {
    try {
      setLoading(true);
      const data = await getTodayMedicines(selectedDate.toISOString().split('T')[0]);
      setMedicines(data.medicines || []);
    } catch (error) {
      console.error('Error fetching medicines:', error);
    } finally {
      setLoading(false);
    }
  }, [selectedDate]);

  useEffect(() => {
    fetchTodayMedicines();
  }, [fetchTodayMedicines]);

  const handleLogMedicine = async (medicineId, status) => {
    try {
      setActionLoading(medicineId);
      await logMedicine({
        medicineId,
        date: selectedDate.toISOString().split('T')[0],
        status
      });
      
      // Update local state
      setMedicines(medicines.map(m => 
        m._id === medicineId 
          ? { ...m, todayStatus: status }
          : m
      ));
    } catch (error) {
      console.error('Error logging medicine:', error);
    } finally {
      setActionLoading(null);
    }
  };

  const changeDate = (days) => {
    const newDate = new Date(selectedDate);
    newDate.setDate(newDate.getDate() + days);
    if (newDate <= new Date()) {
      setSelectedDate(newDate);
    }
  };

  const isToday = selectedDate.toDateString() === new Date().toDateString();

  const formatTime = (time) => {
    const [hours, minutes] = time.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const hour12 = hour % 12 || 12;
    return `${hour12}:${minutes} ${ampm}`;
  };

  const getTimeStatus = (time) => {
    if (!isToday) return 'past';
    
    const now = new Date();
    const [hours, minutes] = time.split(':');
    const medicineTime = new Date();
    medicineTime.setHours(parseInt(hours), parseInt(minutes), 0);
    
    const diffMinutes = (medicineTime - now) / (1000 * 60);
    
    if (diffMinutes < -30) return 'past';
    if (diffMinutes <= 30) return 'now';
    return 'upcoming';
  };

  const stats = {
    total: medicines.length,
    taken: medicines.filter(m => m.todayStatus === 'taken').length,
    missed: medicines.filter(m => m.todayStatus === 'missed').length,
    pending: medicines.filter(m => !m.todayStatus).length
  };

  const adherenceRate = stats.total > 0 
    ? Math.round((stats.taken / stats.total) * 100) 
    : 0;

  return (
    <DashboardLayout title="Today's Medicines">
      <div className="space-y-6">
        {/* Date Navigation */}
        <Card variant="glass" className="flex items-center justify-between">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => changeDate(-1)}
          >
            <ChevronLeft size={20} />
          </Button>
          
          <div className="text-center">
            <div className="flex items-center justify-center gap-2">
              <Calendar size={18} className="text-teal-400" />
              <h2 className="text-lg font-semibold text-white">
                {isToday ? "Today" : selectedDate.toLocaleDateString('en-US', { 
                  weekday: 'long',
                  month: 'short',
                  day: 'numeric'
                })}
              </h2>
            </div>
            <p className="text-sm text-slate-400">
              {selectedDate.toLocaleDateString('en-US', { 
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              })}
            </p>
          </div>
          
          <Button
            variant="ghost"
            size="icon"
            onClick={() => changeDate(1)}
            disabled={isToday}
          >
            <ChevronRight size={20} />
          </Button>
        </Card>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <StatCard
            title="Total"
            value={stats.total}
            icon={<Pill size={20} />}
            variant="glass"
          />
          <StatCard
            title="Taken"
            value={stats.taken}
            progress={stats.total > 0 ? (stats.taken / stats.total) * 100 : 0}
            progressColor="green"
            variant="teal"
          />
          <StatCard
            title="Missed"
            value={stats.missed}
            progress={stats.total > 0 ? (stats.missed / stats.total) * 100 : 0}
            progressColor="red"
          />
          <StatCard
            title="Adherence"
            value={adherenceRate}
            unit="%"
            icon={<TrendingUp size={20} />}
            variant="violet"
          />
        </div>

        {/* Medicine List */}
        {loading ? (
          <div className="flex justify-center py-12">
            <Loader variant="spinner" size="lg" color="primary" text="Loading medicines..." />
          </div>
        ) : medicines.length === 0 ? (
          <Card variant="glass" className="text-center py-12">
            <div className="flex flex-col items-center gap-4">
              <div className="w-16 h-16 rounded-full bg-slate-700 flex items-center justify-center">
                <Pill size={32} className="text-slate-400" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-white mb-1">No medicines for today</h3>
                <p className="text-slate-400">
                  You don't have any medicines scheduled for this day
                </p>
              </div>
            </div>
          </Card>
        ) : (
          <div className="space-y-4">
            <AnimatePresence>
              {medicines.map((medicine, index) => {
                const timeStatus = medicine.timings?.[0] ? getTimeStatus(medicine.timings[0]) : 'past';
                
                return (
                  <motion.div
                    key={medicine._id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, x: -100 }}
                    transition={{ delay: index * 0.05 }}
                  >
                    <Card 
                      variant={
                        medicine.todayStatus === 'taken' ? 'teal' :
                        medicine.todayStatus === 'missed' ? 'default' : 
                        timeStatus === 'now' ? 'violet' : 'default'
                      }
                      className={`relative ${
                        medicine.todayStatus === 'missed' ? 'opacity-60' : ''
                      }`}
                    >
                      <div className="flex items-center gap-4">
                        {/* Icon */}
                        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${
                          medicine.todayStatus === 'taken' 
                            ? 'bg-green-500/20 border border-green-500/30' 
                            : medicine.todayStatus === 'missed'
                            ? 'bg-red-500/20 border border-red-500/30'
                            : timeStatus === 'now'
                            ? 'bg-violet-500/20 border border-violet-500/30 animate-pulse'
                            : 'bg-slate-700 border border-slate-600'
                        }`}>
                          {medicine.todayStatus === 'taken' ? (
                            <Check size={24} className="text-green-400" />
                          ) : medicine.todayStatus === 'missed' ? (
                            <X size={24} className="text-red-400" />
                          ) : (
                            <Pill size={24} className={
                              timeStatus === 'now' ? 'text-violet-400' : 'text-slate-400'
                            } />
                          )}
                        </div>

                        {/* Info */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className={`font-semibold ${
                              medicine.todayStatus === 'missed' 
                                ? 'text-slate-400 line-through' 
                                : 'text-white'
                            }`}>
                              {medicine.name}
                            </h3>
                            {timeStatus === 'now' && !medicine.todayStatus && (
                              <Badge variant="violet" animation="pulse">Due Now</Badge>
                            )}
                          </div>
                          <p className="text-sm text-slate-400">
                            {medicine.dosage}
                          </p>
                          <div className="flex items-center gap-2 mt-1 text-sm text-slate-500">
                            <Clock size={14} />
                            <span>
                              {medicine.timings?.map(t => formatTime(t)).join(', ') || 'No time set'}
                            </span>
                          </div>
                        </div>

                        {/* Actions */}
                        {!medicine.todayStatus ? (
                          <div className="flex gap-2">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleLogMedicine(medicine._id, 'missed')}
                              disabled={actionLoading === medicine._id}
                              className="text-red-400 hover:bg-red-500/10"
                            >
                              {actionLoading === medicine._id ? (
                                <Loader variant="spinner" size="sm" />
                              ) : (
                                <X size={20} />
                              )}
                            </Button>
                            <Button
                              variant="gradient"
                              size="sm"
                              onClick={() => handleLogMedicine(medicine._id, 'taken')}
                              disabled={actionLoading === medicine._id}
                              leftIcon={actionLoading === medicine._id ? null : <Check size={16} />}
                            >
                              {actionLoading === medicine._id ? (
                                <Loader variant="spinner" size="sm" color="white" />
                              ) : (
                                'Take'
                              )}
                            </Button>
                          </div>
                        ) : (
                          <Badge 
                            variant={medicine.todayStatus === 'taken' ? 'success' : 'danger'}
                            dot
                          >
                            {medicine.todayStatus === 'taken' ? 'Taken' : 'Missed'}
                          </Badge>
                        )}
                      </div>
                    </Card>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        )}

        {/* Progress Summary */}
        {medicines.length > 0 && (
          <Card variant="gradient">
            <div className="text-center">
              <div className="w-24 h-24 mx-auto mb-4 rounded-full bg-slate-800 flex items-center justify-center relative">
                <svg className="w-24 h-24 transform -rotate-90" viewBox="0 0 100 100">
                  <circle
                    cx="50"
                    cy="50"
                    r="40"
                    stroke="currentColor"
                    strokeWidth="8"
                    fill="none"
                    className="text-slate-700"
                  />
                  <motion.circle
                    cx="50"
                    cy="50"
                    r="40"
                    stroke="currentColor"
                    strokeWidth="8"
                    fill="none"
                    strokeLinecap="round"
                    className="text-teal-500"
                    initial={{ strokeDasharray: '0 251.2' }}
                    animate={{ 
                      strokeDasharray: `${(adherenceRate / 100) * 251.2} 251.2`
                    }}
                    transition={{ duration: 1, ease: 'easeOut' }}
                  />
                </svg>
                <span className="absolute text-2xl font-bold text-white">
                  {adherenceRate}%
                </span>
              </div>
              <h3 className="text-lg font-semibold text-white mb-1">
                {isToday ? "Today's Progress" : "Day's Summary"}
              </h3>
              <p className="text-slate-400">
                {stats.taken} of {stats.total} medicines taken
              </p>
            </div>
          </Card>
        )}
      </div>
    </DashboardLayout>
  );
};

export default Today;