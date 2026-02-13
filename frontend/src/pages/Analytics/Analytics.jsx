import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { 
  TrendingUp, 
  TrendingDown,
  Calendar,
  Pill,
  Check,
  X,
  Activity,
  BarChart3,
  Clock,
  Award,
  Target,
  Flame
} from 'lucide-react';
import DashboardLayout from '../../layouts/DashboardLayout';
import { Card, StatCard, Badge, Button, Loader } from '../../components/ui';
import { getAnalytics } from '../../services/analyticsService';

const Analytics = () => {
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState('week');
  const [analytics, setAnalytics] = useState({
    totalMedicines: 0,
    activeMedicines: 0,
    completedMedicines: 0,
    totalDoses: 0,
    takenDoses: 0,
    missedDoses: 0,
    adherenceRate: 0,
    currentStreak: 0,
    longestStreak: 0,
    weeklyData: []
  });

  const fetchAnalytics = useCallback(async () => {
    try {
      setLoading(true);
      const data = await getAnalytics(period);
      setAnalytics(data);
    } catch (error) {
      console.error('Error fetching analytics:', error);
    } finally {
      setLoading(false);
    }
  }, [period]);

  useEffect(() => {
    fetchAnalytics();
  }, [fetchAnalytics]);

  const weekDays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  
  // Mock data for chart if API doesn't return it
  const chartData = analytics.weeklyData?.length > 0 
    ? analytics.weeklyData 
    : weekDays.map((day) => ({
        day,
        taken: Math.floor(Math.random() * 10) + 5,
        missed: Math.floor(Math.random() * 3)
      }));

  const maxValue = Math.max(...chartData.map(d => d.taken + d.missed));

  return (
    <DashboardLayout title="Analytics">
      <div className="space-y-6">
        {/* Period Selector */}
        <div className="flex justify-between items-center">
          <div className="flex gap-2 bg-slate-800/50 rounded-xl p-1">
            {['week', 'month', 'year'].map(p => (
              <button
                key={p}
                onClick={() => setPeriod(p)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                  period === p
                    ? 'bg-teal-500 text-white'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {p.charAt(0).toUpperCase() + p.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center py-12">
            <Loader variant="spinner" size="lg" color="primary" text="Loading analytics..." />
          </div>
        ) : (
          <>
            {/* Main Stats Grid */}
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <StatCard
                title="Adherence Rate"
                value={`${analytics.adherenceRate}%`}
                icon={Target}
                trend={{ value: 5, isPositive: true }}
                progress={analytics.adherenceRate}
                progressColor={analytics.adherenceRate >= 80 ? 'green' : analytics.adherenceRate >= 60 ? 'yellow' : 'red'}
              />
              <StatCard
                title="Current Streak"
                value={`${analytics.currentStreak} days`}
                icon={Flame}
                subtitle={`Best: ${analytics.longestStreak} days`}
                className="bg-gradient-to-br from-orange-500/10 to-red-500/5 border-orange-500/20"
              />
              <StatCard
                title="Doses Taken"
                value={analytics.takenDoses}
                icon={Check}
                subtitle={`of ${analytics.totalDoses} scheduled`}
                className="bg-gradient-to-br from-green-500/10 to-emerald-500/5 border-green-500/20"
              />
              <StatCard
                title="Doses Missed"
                value={analytics.missedDoses}
                icon={X}
                subtitle={`${Math.round((analytics.missedDoses / (analytics.totalDoses || 1)) * 100)}% miss rate`}
                className="bg-gradient-to-br from-red-500/10 to-rose-500/5 border-red-500/20"
              />
            </div>

            {/* Weekly Chart */}
            <Card variant="default">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-teal-500/20 flex items-center justify-center">
                    <BarChart3 size={20} className="text-teal-400" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-white">Weekly Overview</h3>
                    <p className="text-sm text-slate-400">Doses taken vs missed</p>
                  </div>
                </div>
                <div className="flex items-center gap-4 text-sm">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-teal-500" />
                    <span className="text-slate-400">Taken</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-red-500" />
                    <span className="text-slate-400">Missed</span>
                  </div>
                </div>
              </div>

              {/* Bar Chart */}
              <div className="h-64 flex items-end justify-between gap-2 sm:gap-4">
                {chartData.map((data, index) => (
                  <div key={data.day} className="flex-1 flex flex-col items-center gap-2">
                    {/* Bars */}
                    <div className="w-full flex flex-col gap-1 h-48">
                      <motion.div
                        initial={{ height: 0 }}
                        animate={{ height: `${(data.taken / maxValue) * 100}%` }}
                        transition={{ delay: index * 0.1, duration: 0.5 }}
                        className="w-full bg-gradient-to-t from-teal-600 to-teal-400 rounded-t-lg"
                      />
                      {data.missed > 0 && (
                        <motion.div
                          initial={{ height: 0 }}
                          animate={{ height: `${(data.missed / maxValue) * 100}%` }}
                          transition={{ delay: index * 0.1 + 0.2, duration: 0.5 }}
                          className="w-full bg-gradient-to-t from-red-600 to-red-400 rounded-b-lg"
                        />
                      )}
                    </div>
                    {/* Day Label */}
                    <span className="text-xs text-slate-400">{data.day}</span>
                  </div>
                ))}
              </div>
            </Card>

            {/* Medicines Overview */}
            <div className="grid gap-4 lg:grid-cols-2">
              {/* Medicine Status */}
              <Card variant="glass">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 rounded-xl bg-violet-500/20 flex items-center justify-center">
                    <Pill size={20} className="text-violet-400" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-white">Medicine Status</h3>
                    <p className="text-sm text-slate-400">{analytics.totalMedicines} total medicines</p>
                  </div>
                </div>

                <div className="space-y-4">
                  {/* Active */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-green-500/20 flex items-center justify-center">
                        <Activity size={18} className="text-green-400" />
                      </div>
                      <div>
                        <p className="text-white font-medium">Active</p>
                        <p className="text-sm text-slate-400">Currently taking</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-bold text-green-400">{analytics.activeMedicines}</p>
                    </div>
                  </div>

                  {/* Completed */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-slate-500/20 flex items-center justify-center">
                        <Check size={18} className="text-slate-400" />
                      </div>
                      <div>
                        <p className="text-white font-medium">Completed</p>
                        <p className="text-sm text-slate-400">Course finished</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-bold text-slate-400">{analytics.completedMedicines}</p>
                    </div>
                  </div>

                  {/* Progress Bar */}
                  <div className="pt-4 border-t border-slate-700">
                    <div className="flex justify-between text-sm mb-2">
                      <span className="text-slate-400">Completion Rate</span>
                      <span className="text-white">
                        {analytics.totalMedicines > 0 
                          ? Math.round((analytics.completedMedicines / analytics.totalMedicines) * 100)
                          : 0}%
                      </span>
                    </div>
                    <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ 
                          width: analytics.totalMedicines > 0 
                            ? `${(analytics.completedMedicines / analytics.totalMedicines) * 100}%`
                            : '0%'
                        }}
                        transition={{ duration: 1 }}
                        className="h-full bg-gradient-to-r from-violet-500 to-purple-500 rounded-full"
                      />
                    </div>
                  </div>
                </div>
              </Card>

              {/* Achievements */}
              <Card variant="glass">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 rounded-xl bg-yellow-500/20 flex items-center justify-center">
                    <Award size={20} className="text-yellow-400" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-white">Achievements</h3>
                    <p className="text-sm text-slate-400">Your health milestones</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  {[
                    { 
                      title: '7-Day Streak', 
                      desc: 'Take all meds for a week',
                      unlocked: analytics.longestStreak >= 7,
                      icon: Flame,
                      color: 'orange'
                    },
                    { 
                      title: 'First Dose', 
                      desc: 'Log your first dose',
                      unlocked: analytics.takenDoses > 0,
                      icon: Pill,
                      color: 'teal'
                    },
                    { 
                      title: '90% Adherence', 
                      desc: 'Reach 90% adherence',
                      unlocked: analytics.adherenceRate >= 90,
                      icon: Target,
                      color: 'green'
                    },
                    { 
                      title: '30-Day Streak', 
                      desc: 'Never miss for a month',
                      unlocked: analytics.longestStreak >= 30,
                      icon: Award,
                      color: 'yellow'
                    }
                  ].map((achievement) => {
                    const Icon = achievement.icon;
                    return (
                      <div 
                        key={achievement.title}
                        className={`p-4 rounded-xl border ${
                          achievement.unlocked 
                            ? `bg-${achievement.color}-500/10 border-${achievement.color}-500/30`
                            : 'bg-slate-800/50 border-slate-700 opacity-50'
                        }`}
                      >
                        <Icon 
                          size={24} 
                          className={achievement.unlocked ? `text-${achievement.color}-400` : 'text-slate-500'} 
                        />
                        <h4 className={`font-medium mt-2 ${achievement.unlocked ? 'text-white' : 'text-slate-500'}`}>
                          {achievement.title}
                        </h4>
                        <p className="text-xs text-slate-400 mt-1">{achievement.desc}</p>
                        {achievement.unlocked && (
                          <Badge variant="secondary" size="sm" className="mt-2">
                            Unlocked!
                          </Badge>
                        )}
                      </div>
                    );
                  })}
                </div>
              </Card>
            </div>

            {/* Time-Based Analysis */}
            <Card variant="default">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-xl bg-cyan-500/20 flex items-center justify-center">
                  <Clock size={20} className="text-cyan-400" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-white">Time Analysis</h3>
                  <p className="text-sm text-slate-400">Best times for adherence</p>
                </div>
              </div>

              <div className="grid grid-cols-4 gap-4">
                {[
                  { time: 'Morning', range: '6AM - 12PM', rate: 95, icon: '🌅' },
                  { time: 'Afternoon', range: '12PM - 6PM', rate: 82, icon: '☀️' },
                  { time: 'Evening', range: '6PM - 10PM', rate: 78, icon: '🌆' },
                  { time: 'Night', range: '10PM - 6AM', rate: 65, icon: '🌙' }
                ].map((period) => (
                  <div key={period.time} className="text-center">
                    <div className="text-3xl mb-2">{period.icon}</div>
                    <p className="text-white font-medium">{period.time}</p>
                    <p className="text-xs text-slate-400 mb-2">{period.range}</p>
                    <div className="relative h-24 w-4 mx-auto bg-slate-700 rounded-full overflow-hidden">
                      <motion.div
                        initial={{ height: 0 }}
                        animate={{ height: `${period.rate}%` }}
                        transition={{ duration: 1, delay: 0.2 }}
                        className={`absolute bottom-0 w-full rounded-full ${
                          period.rate >= 90 ? 'bg-green-500' :
                          period.rate >= 70 ? 'bg-teal-500' :
                          period.rate >= 50 ? 'bg-yellow-500' : 'bg-red-500'
                        }`}
                      />
                    </div>
                    <p className={`text-lg font-bold mt-2 ${
                      period.rate >= 90 ? 'text-green-400' :
                      period.rate >= 70 ? 'text-teal-400' :
                      period.rate >= 50 ? 'text-yellow-400' : 'text-red-400'
                    }`}>{period.rate}%</p>
                  </div>
                ))}
              </div>
            </Card>

            {/* Tips based on analytics */}
            <Card variant="gradient">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-xl bg-white/10 flex items-center justify-center flex-shrink-0">
                  <TrendingUp size={24} className="text-white" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-white mb-2">Insights</h3>
                  <ul className="space-y-2 text-slate-200">
                    {analytics.adherenceRate < 80 && (
                      <li className="flex items-center gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-yellow-400" />
                        Set reminders to improve your adherence rate
                      </li>
                    )}
                    {analytics.missedDoses > 0 && (
                      <li className="flex items-center gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-red-400" />
                        You missed {analytics.missedDoses} doses this {period}. Try setting alarms.
                      </li>
                    )}
                    {analytics.currentStreak > 0 && (
                      <li className="flex items-center gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-green-400" />
                        Great job! Keep your {analytics.currentStreak}-day streak going!
                      </li>
                    )}
                    {analytics.adherenceRate >= 90 && (
                      <li className="flex items-center gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-teal-400" />
                        Excellent adherence! You're on track with your health goals.
                      </li>
                    )}
                  </ul>
                </div>
              </div>
            </Card>
          </>
        )}
      </div>
    </DashboardLayout>
  );
};

export default Analytics;