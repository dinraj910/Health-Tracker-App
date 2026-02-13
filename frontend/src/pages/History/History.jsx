import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Calendar as CalendarIcon, 
  Check, 
  X, 
  Filter,
  ChevronLeft,
  ChevronRight,
  Pill,
  Clock,
  TrendingUp
} from 'lucide-react';
import DashboardLayout from '../../layouts/DashboardLayout';
import { Card, Badge, Button, Loader, Input } from '../../components/ui';
import { getLogHistory } from '../../services/logService';

const History = () => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedMonth, setSelectedMonth] = useState(new Date());
  const [filterStatus, setFilterStatus] = useState('all');
  const [stats, setStats] = useState({
    total: 0,
    taken: 0,
    missed: 0,
    adherence: 0
  });

  const fetchHistory = useCallback(async () => {
    try {
      setLoading(true);
      const startDate = new Date(selectedMonth.getFullYear(), selectedMonth.getMonth(), 1);
      const endDate = new Date(selectedMonth.getFullYear(), selectedMonth.getMonth() + 1, 0);
      
      const data = await getLogHistory(startDate.toISOString(), endDate.toISOString());
      setLogs(data.logs || []);
      
      // Calculate stats
      const total = data.logs?.length || 0;
      const taken = data.logs?.filter(l => l.status === 'taken').length || 0;
      const missed = data.logs?.filter(l => l.status === 'missed').length || 0;
      setStats({
        total,
        taken,
        missed,
        adherence: total > 0 ? Math.round((taken / total) * 100) : 0
      });
    } catch (error) {
      console.error('Error fetching history:', error);
    } finally {
      setLoading(false);
    }
  }, [selectedMonth]);

  useEffect(() => {
    fetchHistory();
  }, [fetchHistory]);

  const changeMonth = (direction) => {
    setSelectedMonth(prev => {
      const newDate = new Date(prev);
      newDate.setMonth(prev.getMonth() + direction);
      return newDate;
    });
  };

  const filteredLogs = logs.filter(log => {
    if (filterStatus === 'all') return true;
    return log.status === filterStatus;
  });

  const groupedLogs = filteredLogs.reduce((groups, log) => {
    const date = new Date(log.takenAt || log.createdAt).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
    if (!groups[date]) {
      groups[date] = [];
    }
    groups[date].push(log);
    return groups;
  }, {});

  const formatTime = (date) => {
    return new Date(date).toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  };

  return (
    <DashboardLayout title="Medicine History">
      <div className="space-y-6">
        {/* Month Navigator & Filters */}
        <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
          <div className="flex items-center gap-4 bg-slate-800/50 rounded-2xl p-2">
            <button
              onClick={() => changeMonth(-1)}
              className="p-2 hover:bg-slate-700 rounded-xl transition-colors"
            >
              <ChevronLeft size={20} className="text-slate-400" />
            </button>
            <div className="flex items-center gap-2 min-w-[180px] justify-center">
              <CalendarIcon size={20} className="text-teal-400" />
              <span className="text-white font-medium">
                {selectedMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
              </span>
            </div>
            <button
              onClick={() => changeMonth(1)}
              className="p-2 hover:bg-slate-700 rounded-xl transition-colors"
            >
              <ChevronRight size={20} className="text-slate-400" />
            </button>
          </div>

          <div className="flex gap-2">
            {['all', 'taken', 'missed'].map(status => (
              <button
                key={status}
                onClick={() => setFilterStatus(status)}
                className={`px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 ${
                  filterStatus === status
                    ? status === 'taken' 
                      ? 'bg-green-500 text-white'
                      : status === 'missed'
                      ? 'bg-red-500 text-white'
                      : 'bg-teal-500 text-white'
                    : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
                }`}
              >
                {status.charAt(0).toUpperCase() + status.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {/* Monthly Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <Card variant="glass">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-teal-500/20 flex items-center justify-center">
                <Pill size={24} className="text-teal-400" />
              </div>
              <div>
                <p className="text-2xl font-bold text-white">{stats.total}</p>
                <p className="text-sm text-slate-400">Total Doses</p>
              </div>
            </div>
          </Card>

          <Card variant="glass">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-green-500/20 flex items-center justify-center">
                <Check size={24} className="text-green-400" />
              </div>
              <div>
                <p className="text-2xl font-bold text-green-400">{stats.taken}</p>
                <p className="text-sm text-slate-400">Taken</p>
              </div>
            </div>
          </Card>

          <Card variant="glass">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-red-500/20 flex items-center justify-center">
                <X size={24} className="text-red-400" />
              </div>
              <div>
                <p className="text-2xl font-bold text-red-400">{stats.missed}</p>
                <p className="text-sm text-slate-400">Missed</p>
              </div>
            </div>
          </Card>

          <Card variant="glass">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-violet-500/20 flex items-center justify-center">
                <TrendingUp size={24} className="text-violet-400" />
              </div>
              <div>
                <p className="text-2xl font-bold text-violet-400">{stats.adherence}%</p>
                <p className="text-sm text-slate-400">Adherence</p>
              </div>
            </div>
          </Card>
        </div>

        {/* Log Timeline */}
        {loading ? (
          <div className="flex justify-center py-12">
            <Loader variant="spinner" size="lg" color="primary" text="Loading history..." />
          </div>
        ) : Object.keys(groupedLogs).length === 0 ? (
          <Card variant="glass" className="text-center py-12">
            <div className="flex flex-col items-center gap-4">
              <div className="w-16 h-16 rounded-full bg-slate-700 flex items-center justify-center">
                <CalendarIcon size={32} className="text-slate-400" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-white mb-1">No history found</h3>
                <p className="text-slate-400">
                  {filterStatus !== 'all' 
                    ? `No ${filterStatus} medicines for this month`
                    : 'No medicine logs for this month'}
                </p>
              </div>
            </div>
          </Card>
        ) : (
          <div className="space-y-6">
            {Object.entries(groupedLogs).map(([date, dayLogs]) => (
              <motion.div
                key={date}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
              >
                {/* Date Header */}
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-xl bg-teal-500/20 flex items-center justify-center">
                    <CalendarIcon size={20} className="text-teal-400" />
                  </div>
                  <div>
                    <h3 className="text-white font-semibold">{date}</h3>
                    <p className="text-sm text-slate-400">
                      {dayLogs.filter(l => l.status === 'taken').length} of {dayLogs.length} taken
                    </p>
                  </div>
                </div>

                {/* Day Logs */}
                <div className="space-y-3 ml-5 pl-5 border-l-2 border-slate-700">
                  <AnimatePresence>
                    {dayLogs.map((log, index) => (
                      <motion.div
                        key={log._id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.05 }}
                      >
                        <Card variant="default" className="relative">
                          {/* Timeline Dot */}
                          <div 
                            className={`absolute -left-[1.85rem] top-1/2 -translate-y-1/2 w-4 h-4 rounded-full border-2 ${
                              log.status === 'taken' 
                                ? 'bg-green-500 border-green-500'
                                : 'bg-red-500 border-red-500'
                            }`}
                          />

                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4">
                              {/* Medicine Icon */}
                              <div 
                                className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                                  log.status === 'taken'
                                    ? 'bg-green-500/20'
                                    : 'bg-red-500/20'
                                }`}
                              >
                                <Pill 
                                  size={24} 
                                  className={log.status === 'taken' ? 'text-green-400' : 'text-red-400'} 
                                />
                              </div>

                              {/* Medicine Info */}
                              <div>
                                <h4 className="font-semibold text-white">
                                  {log.medicine?.name || 'Unknown Medicine'}
                                </h4>
                                <div className="flex items-center gap-2 text-sm text-slate-400">
                                  <span>{log.medicine?.dosage}</span>
                                  <span>•</span>
                                  <span>{log.timing}</span>
                                </div>
                              </div>
                            </div>

                            <div className="flex items-center gap-3">
                              {/* Time */}
                              <div className="text-right">
                                <div className="flex items-center gap-1 text-sm text-slate-400">
                                  <Clock size={14} />
                                  <span>{formatTime(log.takenAt || log.createdAt)}</span>
                                </div>
                              </div>

                              {/* Status Badge */}
                              <Badge 
                                variant={log.status === 'taken' ? 'success' : 'error'}
                                size="md"
                              >
                                {log.status === 'taken' ? (
                                  <><Check size={14} className="mr-1" /> Taken</>
                                ) : (
                                  <><X size={14} className="mr-1" /> Missed</>
                                )}
                              </Badge>
                            </div>
                          </div>

                          {/* Notes if any */}
                          {log.notes && (
                            <p className="mt-3 text-sm text-slate-400 pl-16">
                              Note: {log.notes}
                            </p>
                          )}
                        </Card>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>
              </motion.div>
            ))}
          </div>
        )}

        {/* Adherence Progress Bar */}
        {stats.total > 0 && (
          <Card variant="gradient">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-white font-medium">Monthly Adherence</span>
                <span className="text-2xl font-bold text-white">{stats.adherence}%</span>
              </div>
              <div className="h-3 bg-slate-700 rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${stats.adherence}%` }}
                  transition={{ duration: 1, ease: 'easeOut' }}
                  className={`h-full rounded-full ${
                    stats.adherence >= 80 
                      ? 'bg-green-500' 
                      : stats.adherence >= 50 
                      ? 'bg-yellow-500'
                      : 'bg-red-500'
                  }`}
                />
              </div>
              <p className="text-sm text-slate-400">
                {stats.adherence >= 80 
                  ? 'Great job! Keep up the good work!' 
                  : stats.adherence >= 50
                  ? 'You\'re doing okay. Try to be more consistent.'
                  : 'Room for improvement. Set reminders to help you remember.'}
              </p>
            </div>
          </Card>
        )}
      </div>
    </DashboardLayout>
  );
};

export default History;