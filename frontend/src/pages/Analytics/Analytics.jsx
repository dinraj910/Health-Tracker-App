import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import {
  Heart,
  Activity,
  Moon,
  Droplets,
  Zap,
  Brain,
  Weight,
  Footprints,
  Pill,
  BarChart3,
} from 'lucide-react';
import DashboardLayout from '../../layouts/DashboardLayout';
import { Card, Badge, Loader } from '../../components/ui';
import {
  getWeeklyStats,
  getAdherenceRate,
  getMedicineStats,
  getVitalsTrends,
  getWellnessTrends,
} from '../../services/analyticsService';

// ── Mini Sparkline (SVG) ──
const Sparkline = ({ data, color = '#14b8a6', height = 40, width = 120 }) => {
  if (!data || data.length < 2) return null;
  const max = Math.max(...data);
  const min = Math.min(...data);
  const range = max - min || 1;
  const points = data.map((val, i) => {
    const x = (i / (data.length - 1)) * width;
    const y = height - ((val - min) / range) * (height - 4) - 2;
    return `${x},${y}`;
  }).join(' ');

  return (
    <svg width={width} height={height} className="overflow-visible">
      <polyline
        fill="none" stroke={color} strokeWidth="2"
        strokeLinecap="round" strokeLinejoin="round"
        points={points}
      />
      {/* End dot */}
      {data.length > 0 && (() => {
        const lastX = width;
        const lastY = height - ((data[data.length - 1] - min) / range) * (height - 4) - 2;
        return <circle cx={lastX} cy={lastY} r="3" fill={color} />;
      })()}
    </svg>
  );
};

// ── Bar Chart (simple SVG) ──
const BarChart = ({ data, labels, colors = { taken: '#14b8a6', missed: '#ef4444', skipped: '#eab308' }, height = 120 }) => {
  if (!data || data.length === 0) return null;
  const maxTotal = Math.max(...data.map(d => d.total || 1));

  return (
    <div className="flex items-end gap-1.5 justify-around" style={{ height }}>
      {data.map((d, i) => {
        const takenH = d.total > 0 ? (d.taken / maxTotal) * height : 0;
        const missedH = d.total > 0 ? (d.missed / maxTotal) * height : 0;
        const skippedH = d.total > 0 ? (d.skipped / maxTotal) * height : 0;
        return (
          <div key={i} className="flex flex-col items-center gap-1 flex-1">
            <div className="flex flex-col-reverse w-full max-w-[24px] rounded-t-md overflow-hidden">
              {takenH > 0 && (
                <motion.div
                  initial={{ height: 0 }}
                  animate={{ height: takenH }}
                  transition={{ duration: 0.5, delay: i * 0.05 }}
                  style={{ backgroundColor: colors.taken }}
                />
              )}
              {missedH > 0 && (
                <motion.div
                  initial={{ height: 0 }}
                  animate={{ height: missedH }}
                  transition={{ duration: 0.5, delay: i * 0.05 }}
                  style={{ backgroundColor: colors.missed }}
                />
              )}
              {skippedH > 0 && (
                <motion.div
                  initial={{ height: 0 }}
                  animate={{ height: skippedH }}
                  transition={{ duration: 0.5, delay: i * 0.05 }}
                  style={{ backgroundColor: colors.skipped }}
                />
              )}
            </div>
            <span className="text-[9px] text-slate-500">{labels?.[i] || ''}</span>
          </div>
        );
      })}
    </div>
  );
};

// ── Vital Trend Card ──
const VitalTrendCard = (props) => {
  const IconComponent = props.icon;
  const { iconColor, iconBg, title, latestValue, unit, sparkData, sparkColor, status, statusColor } = props;
  return (
    <Card variant="glass" className="p-4">
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className={`w-8 h-8 rounded-lg ${iconBg} flex items-center justify-center`}>
            <IconComponent size={16} className={iconColor} />
          </div>
          <span className="text-xs font-medium text-slate-400">{title}</span>
        </div>
        {status && <Badge variant={statusColor || 'secondary'} className="text-[10px]">{status}</Badge>}
      </div>
      <div className="flex items-end justify-between">
        <div>
          <span className="text-2xl font-bold text-white">{latestValue}</span>
          {unit && <span className="text-xs text-slate-400 ml-1">{unit}</span>}
        </div>
        <Sparkline data={sparkData} color={sparkColor} />
      </div>
    </Card>
  );
};

// ── Mood Map ──
const MOOD_EMOJI = { terrible: '😫', bad: '😞', okay: '😐', good: '🙂', great: '😄' };
const MOOD_SCORE = { terrible: 1, bad: 2, okay: 3, good: 4, great: 5 };

function Analytics() {
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState(7);
  const [weeklyData, setWeeklyData] = useState(null);
  const [adherence, setAdherence] = useState(null);
  const [medStats, setMedStats] = useState([]);
  const [vitals, setVitals] = useState(null);
  const [wellness, setWellness] = useState(null);

  const fetchAll = useCallback(async () => {
    try {
      setLoading(true);
      const [weeklyRes, adhRes, medRes, vitalsRes, wellnessRes] = await Promise.all([
        getWeeklyStats().catch(() => null),
        getAdherenceRate(period).catch(() => null),
        getMedicineStats(period).catch(() => null),
        getVitalsTrends(period).catch(() => null),
        getWellnessTrends(period).catch(() => null),
      ]);
      setWeeklyData(weeklyRes?.data);
      setAdherence(adhRes?.data);
      setMedStats(medRes?.data?.medicines || []);
      setVitals(vitalsRes?.data?.trends || null);
      setWellness(wellnessRes?.data?.trends || null);
    } catch (err) {
      console.error('Analytics fetch error:', err);
    } finally {
      setLoading(false);
    }
  }, [period]);

  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  // Derive sparkline data
  const bpSystolicSpark = vitals?.bloodPressure?.map(d => d.systolic) || [];
  const heartRateSpark = vitals?.heartRate?.map(d => d.value) || [];
  const weightSpark = vitals?.weight?.map(d => d.value) || [];
  const oxygenSpark = vitals?.oxygenLevel?.map(d => d.value) || [];
  const sleepSpark = wellness?.sleep?.map(d => d.hours) || [];
  const stepsSpark = wellness?.steps?.map(d => d.value) || [];
  const waterSpark = wellness?.water?.map(d => d.value) || [];
  const moodSpark = wellness?.mood?.map(d => MOOD_SCORE[d.value] || 3) || [];

  const latestBp = vitals?.bloodPressure?.length > 0 ? vitals.bloodPressure[vitals.bloodPressure.length - 1] : null;
  const latestHr = vitals?.heartRate?.length > 0 ? vitals.heartRate[vitals.heartRate.length - 1] : null;
  const latestWeight = vitals?.weight?.length > 0 ? vitals.weight[vitals.weight.length - 1] : null;
  const latestO2 = vitals?.oxygenLevel?.length > 0 ? vitals.oxygenLevel[vitals.oxygenLevel.length - 1] : null;
  const latestSleep = wellness?.sleep?.length > 0 ? wellness.sleep[wellness.sleep.length - 1] : null;
  const latestSteps = wellness?.steps?.length > 0 ? wellness.steps[wellness.steps.length - 1] : null;
  const latestMood = wellness?.mood?.length > 0 ? wellness.mood[wellness.mood.length - 1] : null;

  if (loading) {
    return (
      <DashboardLayout title="Analytics">
        <div className="flex items-center justify-center py-20">
          <Loader variant="gradient" size="xl" text="Loading analytics..." />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title="Analytics">
      <div className="space-y-6">

        {/* ── Header + Period Selector ── */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <h1 className="text-xl font-bold text-white flex items-center gap-2">
              <BarChart3 className="text-teal-400" size={22} /> Health Analytics
            </h1>
            <p className="text-sm text-slate-400 mt-1">Track trends and spot patterns in your health data</p>
          </div>
          <div className="flex gap-2 bg-slate-800/50 rounded-xl p-1 border border-slate-700">
            {[7, 14, 30].map(d => (
              <button key={d}
                onClick={() => setPeriod(d)}
                className={`px-4 py-1.5 rounded-lg text-xs font-medium transition-all
                  ${period === d ? 'bg-teal-500/20 text-teal-300' : 'text-slate-400 hover:text-slate-300'}`}
              >
                {d}D
              </button>
            ))}
          </div>
        </div>

        {/* ── Medicine Adherence Overview ── */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <Card variant="glass" className="p-5">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-semibold text-slate-300 flex items-center gap-2">
                <Pill size={16} className="text-teal-400" />
                Medicine Adherence
              </h2>
              {adherence && (
                <span className={`text-2xl font-bold ${adherence.adherenceRate >= 80 ? 'text-green-400' : adherence.adherenceRate >= 50 ? 'text-yellow-400' : 'text-red-400'}`}>
                  {adherence.adherenceRate}%
                </span>
              )}
            </div>

            {/* Weekly bar chart */}
            {weeklyData?.weeklyData && (
              <div className="mt-2">
                <BarChart
                  data={weeklyData.weeklyData}
                  labels={weeklyData.weeklyData.map(d => {
                    const day = new Date(d.date).toLocaleDateString('en-US', { weekday: 'short' });
                    return day;
                  })}
                />
                {/* Legend */}
                <div className="flex justify-center gap-4 mt-3">
                  <span className="flex items-center gap-1.5 text-[10px] text-slate-400">
                    <span className="w-2 h-2 rounded-full bg-teal-500" /> Taken
                  </span>
                  <span className="flex items-center gap-1.5 text-[10px] text-slate-400">
                    <span className="w-2 h-2 rounded-full bg-red-500" /> Missed
                  </span>
                  <span className="flex items-center gap-1.5 text-[10px] text-slate-400">
                    <span className="w-2 h-2 rounded-full bg-yellow-500" /> Skipped
                  </span>
                </div>
              </div>
            )}

            {/* Summary stats */}
            {adherence && (
              <div className="grid grid-cols-4 gap-2 mt-4">
                <div className="text-center p-2 bg-slate-800/50 rounded-lg">
                  <p className="text-lg font-bold text-white">{adherence.totalDoses}</p>
                  <p className="text-[10px] text-slate-400">Total</p>
                </div>
                <div className="text-center p-2 bg-slate-800/50 rounded-lg">
                  <p className="text-lg font-bold text-teal-400">{adherence.takenDoses}</p>
                  <p className="text-[10px] text-slate-400">Taken</p>
                </div>
                <div className="text-center p-2 bg-slate-800/50 rounded-lg">
                  <p className="text-lg font-bold text-red-400">{adherence.missedDoses}</p>
                  <p className="text-[10px] text-slate-400">Missed</p>
                </div>
                <div className="text-center p-2 bg-slate-800/50 rounded-lg">
                  <p className="text-lg font-bold text-yellow-400">{adherence.skippedDoses}</p>
                  <p className="text-[10px] text-slate-400">Skipped</p>
                </div>
              </div>
            )}
          </Card>
        </motion.div>

        {/* ── Vitals Trends ── */}
        {vitals && (bpSystolicSpark.length > 0 || heartRateSpark.length > 0 || weightSpark.length > 0 || oxygenSpark.length > 0) && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
            <h2 className="text-sm font-semibold text-slate-300 mb-3 flex items-center gap-2">
              <Heart size={16} className="text-red-400" />
              Vital Signs Trends
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {latestBp && (
                <VitalTrendCard
                  icon={Heart} iconColor="text-red-400" iconBg="bg-red-500/15"
                  title="Blood Pressure"
                  latestValue={`${latestBp.systolic}/${latestBp.diastolic}`}
                  unit="mmHg"
                  sparkData={bpSystolicSpark}
                  sparkColor="#ef4444"
                  status={latestBp.status?.replace('-', ' ')}
                  statusColor={latestBp.status === 'normal' ? 'success' : latestBp.status?.includes('high') ? 'danger' : 'warning'}
                />
              )}
              {latestHr && (
                <VitalTrendCard
                  icon={Activity} iconColor="text-pink-400" iconBg="bg-pink-500/15"
                  title="Heart Rate"
                  latestValue={latestHr.value}
                  unit="bpm"
                  sparkData={heartRateSpark}
                  sparkColor="#ec4899"
                  status={latestHr.value >= 60 && latestHr.value <= 100 ? 'Normal' : 'Check'}
                  statusColor={latestHr.value >= 60 && latestHr.value <= 100 ? 'success' : 'warning'}
                />
              )}
              {latestWeight && (
                <VitalTrendCard
                  icon={Weight} iconColor="text-cyan-400" iconBg="bg-cyan-500/15"
                  title="Weight"
                  latestValue={latestWeight.value}
                  unit="kg"
                  sparkData={weightSpark}
                  sparkColor="#06b6d4"
                />
              )}
              {latestO2 && (
                <VitalTrendCard
                  icon={Zap} iconColor="text-blue-400" iconBg="bg-blue-500/15"
                  title="SpO2"
                  latestValue={`${latestO2.value}%`}
                  sparkData={oxygenSpark}
                  sparkColor="#3b82f6"
                  status={latestO2.value >= 95 ? 'Normal' : 'Low'}
                  statusColor={latestO2.value >= 95 ? 'success' : 'danger'}
                />
              )}
            </div>
          </motion.div>
        )}

        {/* ── Wellness Trends ── */}
        {wellness && (sleepSpark.length > 0 || stepsSpark.length > 0 || moodSpark.length > 0 || waterSpark.length > 0) && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
            <h2 className="text-sm font-semibold text-slate-300 mb-3 flex items-center gap-2">
              <Brain size={16} className="text-violet-400" />
              Wellness Trends
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {latestMood && (
                <VitalTrendCard
                  icon={Brain} iconColor="text-violet-400" iconBg="bg-violet-500/15"
                  title="Mood"
                  latestValue={MOOD_EMOJI[latestMood.value] || '😐'}
                  unit={latestMood.value}
                  sparkData={moodSpark}
                  sparkColor="#8b5cf6"
                />
              )}
              {latestSleep && (
                <VitalTrendCard
                  icon={Moon} iconColor="text-indigo-400" iconBg="bg-indigo-500/15"
                  title="Sleep"
                  latestValue={latestSleep.hours}
                  unit="hours"
                  sparkData={sleepSpark}
                  sparkColor="#6366f1"
                  status={latestSleep.quality || null}
                />
              )}
              {latestSteps && (
                <VitalTrendCard
                  icon={Footprints} iconColor="text-green-400" iconBg="bg-green-500/15"
                  title="Steps"
                  latestValue={latestSteps.value.toLocaleString()}
                  sparkData={stepsSpark}
                  sparkColor="#22c55e"
                  status={latestSteps.value >= 10000 ? 'Goal met!' : null}
                  statusColor="success"
                />
              )}
              {wellness.water?.length > 0 && (
                <VitalTrendCard
                  icon={Droplets} iconColor="text-sky-400" iconBg="bg-sky-500/15"
                  title="Water Intake"
                  latestValue={wellness.water[wellness.water.length - 1].value}
                  unit="glasses"
                  sparkData={waterSpark}
                  sparkColor="#0ea5e9"
                />
              )}
            </div>
          </motion.div>
        )}

        {/* ── Per-Medicine Stats ── */}
        {medStats.length > 0 && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
            <h2 className="text-sm font-semibold text-slate-300 mb-3 flex items-center gap-2">
              <Pill size={16} className="text-violet-400" />
              Medicine-wise Adherence
            </h2>
            <div className="space-y-2">
              {medStats.map(med => (
                <Card key={med.medicineId} variant="glass" className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg flex items-center justify-center"
                        style={{ backgroundColor: (med.color || '#14b8a6') + '30' }}>
                        <Pill size={14} style={{ color: med.color || '#14b8a6' }} />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-white">{med.medicineName}</p>
                        <p className="text-[10px] text-slate-400">{med.dosage} · {med.category}</p>
                      </div>
                    </div>
                    <span className={`text-lg font-bold
                      ${med.adherenceRate >= 80 ? 'text-green-400' : med.adherenceRate >= 50 ? 'text-yellow-400' : 'text-red-400'}`}>
                      {med.adherenceRate}%
                    </span>
                  </div>
                  {/* Progress bar */}
                  <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${med.adherenceRate}%` }}
                      transition={{ duration: 0.8 }}
                      className={`h-full rounded-full
                        ${med.adherenceRate >= 80 ? 'bg-green-500' : med.adherenceRate >= 50 ? 'bg-yellow-500' : 'bg-red-500'}`}
                    />
                  </div>
                  <div className="flex gap-4 mt-2 text-[10px] text-slate-400">
                    <span>Taken: {med.takenDoses}</span>
                    <span>Missed: {med.missedDoses}</span>
                    <span>Total: {med.totalDoses}</span>
                  </div>
                </Card>
              ))}
            </div>
          </motion.div>
        )}

        {/* ── Empty State ── */}
        {!vitals && !wellness && medStats.length === 0 && !weeklyData && (
          <Card variant="glass" className="p-8 text-center">
            <BarChart3 size={48} className="text-slate-600 mx-auto mb-3" />
            <h3 className="text-lg font-semibold text-slate-300">No Data Yet</h3>
            <p className="text-sm text-slate-500 mt-1">Start logging vitals and taking medicines to see your health analytics</p>
          </Card>
        )}
      </div>
    </DashboardLayout>
  );
}

export default Analytics;