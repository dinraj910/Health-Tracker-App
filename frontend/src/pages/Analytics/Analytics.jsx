import { useState, useEffect, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Heart, Activity, Moon, Droplets, Zap, Brain, Weight, Footprints,
  Pill, BarChart3, ThermometerSun, FileDown, Loader2, CalendarCheck,
  AlertCircle, TrendingUp, TrendingDown, Minus, TableProperties
} from 'lucide-react';
import DashboardLayout from '../../layouts/DashboardLayout';
import { Card, Badge, Loader } from '../../components/ui';
import {
  getWeeklyStats, getAdherenceRate, getMedicineStats,
  getVitalsTrends, getWellnessTrends,
} from '../../services/analyticsService';
import { downloadHealthReport } from '../../services/reportService';
import usePageTitle from '../../hooks/usePageTitle';

// ── Sparkline ─────────────────────────────────────────────────────────────────
const Sparkline = ({ data, color = '#14b8a6', height = 36, width = 90 }) => {
  if (!data || data.length < 2) return null;
  const max = Math.max(...data); const min = Math.min(...data); const range = max - min || 1;
  const points = data.map((val, i) => {
    const x = (i / (data.length - 1)) * width;
    const y = height - ((val - min) / range) * (height - 4) - 2;
    return `${x},${y}`;
  }).join(' ');
  const lastX = width;
  const lastY = height - ((data[data.length - 1] - min) / range) * (height - 4) - 2;
  return (
    <svg width={width} height={height} className="overflow-visible">
      <polyline fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" points={points} />
      <circle cx={lastX} cy={lastY} r="3" fill={color} />
    </svg>
  );
};

// ── Delta Badge ────────────────────────────────────────────────────────────────
const Delta = ({ curr, prev, invert = false }) => {
  if (curr == null || prev == null) return <span className="text-slate-600 text-[9px]">—</span>;
  const diff = curr - prev;
  if (Math.abs(diff) < 0.01) return <span className="flex items-center gap-0.5 text-slate-500 text-[9px]"><Minus size={8} />0</span>;
  const positive = invert ? diff < 0 : diff > 0;
  return (
    <span className={`flex items-center gap-0.5 text-[9px] font-bold ${positive ? 'text-emerald-400' : 'text-rose-400'}`}>
      {diff > 0 ? <TrendingUp size={9} /> : <TrendingDown size={9} />}
      {Math.abs(diff) % 1 === 0 ? Math.abs(diff) : Math.abs(diff).toFixed(1)}
    </span>
  );
};

// ── Vital Card ────────────────────────────────────────────────────────────────
const VitalCard = ({ icon: Icon, iconColor, iconBg, title, value, unit, spark, sparkColor, status, statusColor }) => (
  <Card variant="glass" className="p-4 flex flex-col justify-between hover:bg-slate-800/60 transition-colors">
    <div className="flex items-start justify-between mb-3">
      <div className="flex items-center gap-2">
        <div className={`w-8 h-8 rounded-lg ${iconBg} flex items-center justify-center`}>
          <Icon size={15} className={iconColor} />
        </div>
        <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">{title}</span>
      </div>
      {status && <Badge variant={statusColor || 'secondary'} className="text-[9px] uppercase tracking-wider font-bold">{status}</Badge>}
    </div>
    <div className="flex items-end justify-between">
      <div>
        <span className="text-2xl font-black text-white tracking-tight">{value ?? '—'}</span>
        {unit && <span className="text-[10px] text-slate-400 ml-1 uppercase">{unit}</span>}
      </div>
      <div className="pb-1"><Sparkline data={spark} color={sparkColor} /></div>
    </div>
  </Card>
);

// ── Mood helpers ──────────────────────────────────────────────────────────────
const MOOD_SCORE = { terrible: 1, bad: 2, okay: 3, good: 4, great: 5 };
const MOOD_EMOJI = { terrible: '😫', bad: '😞', okay: '😐', good: '🙂', great: '😄' };

// ── Day-by-Day Comparison Table ───────────────────────────────────────────────
const DayByDayTable = ({ vitals, wellness, weeklyData }) => {
  // Build unified day-indexed map
  const dayMap = useMemo(() => {
    const map = {};
    const addEntry = (date, key, value) => {
      if (!map[date]) map[date] = {};
      map[date][key] = value;
    };
    vitals?.bloodPressure?.forEach(d => addEntry(d.date, 'bp', `${d.systolic}/${d.diastolic}`));
    vitals?.heartRate?.forEach(d => addEntry(d.date, 'hr', d.value));
    vitals?.oxygenLevel?.forEach(d => addEntry(d.date, 'spo2', d.value));
    vitals?.bloodSugar?.forEach(d => addEntry(d.date, 'bsl', d.fasting));
    vitals?.bodyTemp?.forEach(d => addEntry(d.date, 'temp', d.value));
    vitals?.weight?.forEach(d => addEntry(d.date, 'wt', d.value));
    wellness?.sleep?.forEach(d => addEntry(d.date, 'sleep', d.hours));
    wellness?.steps?.forEach(d => addEntry(d.date, 'steps', d.value));
    wellness?.water?.forEach(d => addEntry(d.date, 'water', d.value));
    wellness?.mood?.forEach(d => addEntry(d.date, 'mood', d.value));
    weeklyData?.weeklyData?.forEach(d => {
      const dateStr = d.date;
      if (!map[dateStr]) map[dateStr] = {};
      map[dateStr].adh = d.adherence;
    });
    return map;
  }, [vitals, wellness, weeklyData]);

  const sortedDays = Object.keys(dayMap).sort((a, b) => new Date(b) - new Date(a));
  if (sortedDays.length === 0) return null;

  const cols = [
    { key: 'bp',    label: 'BP',         unit: 'mmHg',  numeric: false },
    { key: 'hr',    label: 'HR',         unit: 'bpm',   numeric: true  },
    { key: 'spo2',  label: 'SpO2',       unit: '%',     numeric: true  },
    { key: 'bsl',   label: 'Glucose',    unit: 'mg/dL', numeric: true, invert: true },
    { key: 'temp',  label: 'Temp',       unit: '°F',    numeric: true  },
    { key: 'wt',    label: 'Weight',     unit: 'kg',    numeric: true  },
    { key: 'sleep', label: 'Sleep',      unit: 'h',     numeric: true  },
    { key: 'steps', label: 'Steps',      unit: '',      numeric: true  },
    { key: 'mood',  label: 'Mood',       unit: '',      numeric: false },
    { key: 'adh',   label: 'Adherence',  unit: '%',     numeric: true  },
  ];

  return (
    <div className="overflow-x-auto rounded-xl border border-slate-800 bg-slate-900/50">
      <table className="min-w-full text-[11px]">
        <thead>
          <tr className="bg-slate-800/60 border-b border-slate-700">
            <th className="px-3 py-2.5 text-left font-bold text-slate-300 uppercase tracking-wider whitespace-nowrap sticky left-0 bg-slate-800/60 z-10 min-w-[90px]">Date</th>
            {cols.map(c => (
              <th key={c.key} className="px-3 py-2.5 text-center font-bold text-slate-300 uppercase tracking-wider whitespace-nowrap min-w-[70px]">
                {c.label}
                {c.unit && <span className="text-slate-500 ml-0.5 normal-case font-normal">({c.unit})</span>}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {sortedDays.map((day, ri) => {
            const d = dayMap[day];
            const prev = dayMap[sortedDays[ri + 1]] || {};
            const isToday = new Date(day).toDateString() === new Date().toDateString();
            const date = new Date(day);
            const label = isToday ? 'Today' : date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });

            return (
              <tr key={day} className={`border-b border-slate-800/60 transition-colors hover:bg-slate-800/30 ${isToday ? 'bg-teal-500/5' : ri % 2 === 0 ? 'bg-transparent' : 'bg-slate-900/30'}`}>
                <td className={`px-3 py-2.5 font-bold whitespace-nowrap sticky left-0 z-10 ${isToday ? 'bg-teal-500/10 text-teal-300' : 'bg-slate-900 text-slate-200'}`}>
                  {label}
                </td>
                {cols.map(col => {
                  const val = d[col.key];
                  const prevVal = prev[col.key];
                  const displayVal = val != null
                    ? col.key === 'mood' ? MOOD_EMOJI[val] || val
                      : col.key === 'steps' ? Number(val).toLocaleString()
                      : val
                    : null;

                  return (
                    <td key={col.key} className="px-3 py-2.5 text-center">
                      {displayVal != null ? (
                        <div className="flex flex-col items-center gap-0.5">
                          <span className="font-semibold text-slate-100">{displayVal}</span>
                          {col.numeric && <Delta curr={val} prev={prevVal} invert={col.invert} />}
                        </div>
                      ) : (
                        <span className="text-slate-700">—</span>
                      )}
                    </td>
                  );
                })}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

// ── Main Analytics Component ──────────────────────────────────────────────────
function Analytics() {
  usePageTitle('Analytics');
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState(7);
  const [reportLoading, setReportLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('overview'); // 'overview' | 'dayByDay' | 'medicines'
  const [weeklyData, setWeeklyData] = useState(null);
  const [adherence, setAdherence] = useState(null);
  const [medStats, setMedStats] = useState([]);
  const [vitals, setVitals] = useState(null);
  const [wellness, setWellness] = useState(null);

  const handleDownloadReport = async () => {
    try { setReportLoading(true); await downloadHealthReport(period); }
    catch (e) { console.error(e); }
    finally { setReportLoading(false); }
  };

  const fetchAll = useCallback(async () => {
    try {
      setLoading(true);
      const [wRes, aRes, mRes, vRes, wlRes] = await Promise.all([
        getWeeklyStats(period).catch(() => null),
        getAdherenceRate(period).catch(() => null),
        getMedicineStats(period).catch(() => null),
        getVitalsTrends(period).catch(() => null),
        getWellnessTrends(period).catch(() => null),
      ]);
      setWeeklyData(wRes?.data);
      setAdherence(aRes?.data);
      setMedStats(mRes?.data?.medicines || []);
      setVitals(vRes?.data?.trends || null);
      setWellness(wlRes?.data?.trends || null);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  }, [period]);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  // Derived spark arrays
  const BP   = vitals?.bloodPressure?.map(d => d.systolic) || [];
  const HR   = vitals?.heartRate?.map(d => d.value) || [];
  const WT   = vitals?.weight?.map(d => d.value) || [];
  const O2   = vitals?.oxygenLevel?.map(d => d.value) || [];
  const BS   = vitals?.bloodSugar?.map(d => d.fasting) || [];
  const TEMP = vitals?.bodyTemp?.map(d => d.value) || [];
  const SLEP = wellness?.sleep?.map(d => d.hours) || [];
  const STEP = wellness?.steps?.map(d => d.value) || [];
  const WATR = wellness?.water?.map(d => d.value) || [];
  const MOOD = wellness?.mood?.map(d => MOOD_SCORE[d.value] || 3) || [];

  const lBp   = vitals?.bloodPressure?.at(-1);
  const lHr   = vitals?.heartRate?.at(-1);
  const lWt   = vitals?.weight?.at(-1);
  const lO2   = vitals?.oxygenLevel?.at(-1);
  const lBs   = vitals?.bloodSugar?.at(-1);
  const lTemp = vitals?.bodyTemp?.at(-1);
  const lSlep = wellness?.sleep?.at(-1);
  const lStep = wellness?.steps?.at(-1);
  const lMood = wellness?.mood?.at(-1);
  const lWatr = wellness?.water?.at(-1);

  const hasVitals   = BP.length || HR.length || O2.length || BS.length || TEMP.length || WT.length;
  const hasWellness = SLEP.length || STEP.length || MOOD.length || WATR.length;
  const hasAny      = hasVitals || hasWellness || medStats.length > 0;

  if (loading) return (
    <DashboardLayout title="Analytics">
      <div className="flex items-center justify-center py-24">
        <Loader variant="gradient" size="xl" text="Loading health data..." />
      </div>
    </DashboardLayout>
  );

  const TABS = [
    { id: 'overview',  label: 'Vital Overview',   icon: Heart },
    { id: 'dayByDay',  label: 'Day-by-Day',        icon: TableProperties },
    { id: 'medicines', label: 'Medication',        icon: Pill },
  ];

  return (
    <DashboardLayout title="Analytics">
      <div className="space-y-5 max-w-7xl mx-auto">

        {/* ── Header ── */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 p-4 rounded-2xl bg-slate-800/30 border border-slate-800/50">
          <div>
            <h1 className="text-xl font-black text-white flex items-center gap-2">
              <BarChart3 className="text-teal-400" size={22} /> Health Analytics
            </h1>
            <p className="text-xs text-slate-400 mt-0.5">Comprehensive vitals, wellness & medication trends</p>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <button onClick={handleDownloadReport} disabled={reportLoading}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold text-xs transition-all disabled:opacity-50 whitespace-nowrap">
              {reportLoading ? <Loader2 size={14} className="animate-spin" /> : <FileDown size={14} />}
              {reportLoading ? 'Generating…' : 'Export PDF'}
            </button>
            <div className="flex bg-slate-900 rounded-xl p-0.5 border border-slate-800 shadow-inner">
              {[7, 14, 30].map(d => (
                <button key={d} onClick={() => setPeriod(d)}
                  className={`px-3 py-1.5 rounded-[10px] text-xs font-bold transition-all
                    ${period === d ? 'bg-teal-500 text-slate-950 shadow' : 'text-slate-400 hover:text-white'}`}>
                  {d}D
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* ── Tab Bar ── */}
        <div className="flex gap-1 p-1 bg-slate-900 rounded-xl border border-slate-800 w-full sm:w-auto">
          {TABS.map(tab => {
            const Icon = tab.icon;
            return (
              <button key={tab.id} onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-1.5 px-4 py-2 rounded-[10px] text-xs font-semibold flex-1 justify-center transition-all
                  ${activeTab === tab.id ? 'bg-slate-700 text-white' : 'text-slate-400 hover:text-slate-200'}`}>
                <Icon size={13} />{tab.label}
              </button>
            );
          })}
        </div>

        {!hasAny && (
          <Card variant="glass" className="p-12 text-center">
            <Activity size={48} className="text-slate-700 mx-auto mb-4" />
            <h3 className="text-lg font-bold text-white">No Data Yet</h3>
            <p className="text-sm text-slate-400 mt-2 max-w-sm mx-auto">Start logging vitals and medicines to see powerful analytics here.</p>
          </Card>
        )}

        <AnimatePresence mode="wait">
          {/* ══ TAB: VITAL OVERVIEW ══ */}
          {activeTab === 'overview' && (
            <motion.div key="overview" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} className="space-y-5">

              {/* Vitals Grid */}
              {!!hasVitals && (
                <div>
                  <h2 className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-3 flex items-center gap-2">
                    <Heart size={13} className="text-rose-400" /> Vital Sign Trends
                  </h2>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {lBp && <VitalCard icon={Activity} iconColor="text-rose-400" iconBg="bg-rose-500/10" title="Blood Pressure" value={`${lBp.systolic}/${lBp.diastolic}`} unit="mmHg" spark={BP} sparkColor="#f43f5e" status={lBp.systolic < 120 && lBp.diastolic < 80 ? 'Normal' : lBp.systolic >= 140 ? 'High' : 'Elevated'} statusColor={lBp.systolic < 120 ? 'success' : lBp.systolic >= 140 ? 'danger' : 'warning'} />}
                    {lHr  && <VitalCard icon={Heart}    iconColor="text-pink-400"  iconBg="bg-pink-500/10"  title="Heart Rate"      value={lHr.value}                      unit="bpm"  spark={HR} sparkColor="#ec4899" status={lHr.value >= 60 && lHr.value <= 100 ? 'Healthy' : 'Check'} statusColor={lHr.value >= 60 && lHr.value <= 100 ? 'success' : 'warning'} />}
                    {lO2  && <VitalCard icon={Zap}      iconColor="text-blue-400"  iconBg="bg-blue-500/10"  title="SpO2 (Oxygen)"   value={`${lO2.value}%`}               spark={O2} sparkColor="#3b82f6" status={lO2.value >= 95 ? 'Optimal' : 'Low'} statusColor={lO2.value >= 95 ? 'success' : 'danger'} />}
                    {lBs  && <VitalCard icon={Droplets} iconColor="text-amber-400" iconBg="bg-amber-500/10" title="Blood Sugar"      value={lBs.fasting}                    unit="mg/dL" spark={BS} sparkColor="#f59e0b" status={lBs.fasting <= 100 ? 'Normal' : lBs.fasting <= 125 ? 'Prediabetic' : 'High'} statusColor={lBs.fasting <= 100 ? 'success' : lBs.fasting <= 125 ? 'warning' : 'danger'} />}
                    {lWt  && <VitalCard icon={Weight}   iconColor="text-cyan-400"  iconBg="bg-cyan-500/10"  title="Body Weight"     value={lWt.value}                      unit="kg"   spark={WT} sparkColor="#06b6d4" />}
                    {lTemp && <VitalCard icon={ThermometerSun} iconColor="text-orange-400" iconBg="bg-orange-500/10" title="Temperature" value={lTemp.value} unit="°F" spark={TEMP} sparkColor="#f97316" status={lTemp.value >= 97 && lTemp.value <= 99.5 ? 'Normal' : lTemp.value > 99.5 ? 'Fever' : 'Low'} statusColor={lTemp.value >= 97 && lTemp.value <= 99.5 ? 'success' : 'danger'} />}
                  </div>
                </div>
              )}

              {/* Wellness Grid */}
              {!!hasWellness && (
                <div>
                  <h2 className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-3 flex items-center gap-2">
                    <Brain size={13} className="text-violet-400" /> Daily Wellness
                  </h2>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {lSlep && <VitalCard icon={Moon}      iconColor="text-indigo-400" iconBg="bg-indigo-500/10" title="Sleep Duration"  value={lSlep.hours} unit="hrs"  spark={SLEP} sparkColor="#6366f1" status={lSlep.hours >= 7 ? 'Good' : 'Low'} statusColor={lSlep.hours >= 7 ? 'success' : 'warning'} />}
                    {lStep && <VitalCard icon={Footprints} iconColor="text-emerald-400" iconBg="bg-emerald-500/10" title="Daily Steps" value={lStep.value > 999 ? (lStep.value/1000).toFixed(1)+'k' : lStep.value} spark={STEP} sparkColor="#10b981" status={lStep.value >= 10000 ? 'Goal!' : null} statusColor="success" />}
                    {lWatr && <VitalCard icon={Droplets}  iconColor="text-sky-400"    iconBg="bg-sky-500/10"    title="Hydration"      value={lWatr.value} unit="cups" spark={WATR} sparkColor="#0ea5e9" />}
                    {lMood && <VitalCard icon={Brain}     iconColor="text-violet-400" iconBg="bg-violet-500/10" title="Mood Tracker"   value={MOOD_EMOJI[lMood.value] || '😐'} spark={MOOD} sparkColor="#8b5cf6" />}
                  </div>
                </div>
              )}
            </motion.div>
          )}

          {/* ══ TAB: DAY-BY-DAY ══ */}
          {activeTab === 'dayByDay' && (
            <motion.div key="dayByDay" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} className="space-y-4">
              <div className="flex items-start justify-between">
                <div>
                  <h2 className="text-sm font-bold text-white flex items-center gap-2">
                    <TableProperties size={16} className="text-teal-400" /> Day-by-Day Comparison
                  </h2>
                  <p className="text-xs text-slate-400 mt-1">
                    Each row is one day. Delta badges (<span className="text-emerald-400">▲</span>/<span className="text-rose-400">▼</span>) show change vs the previous day.
                  </p>
                </div>
              </div>
              <DayByDayTable vitals={vitals} wellness={wellness} weeklyData={weeklyData} />
              {!hasVitals && !hasWellness && (
                <Card variant="glass" className="p-8 text-center">
                  <TableProperties size={32} className="text-slate-700 mx-auto mb-3" />
                  <p className="text-sm text-slate-400">Log vitals for at least 2 days to see comparisons.</p>
                </Card>
              )}
            </motion.div>
          )}

          {/* ══ TAB: MEDICATION ══ */}
          {activeTab === 'medicines' && (
            <motion.div key="medicines" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} className="space-y-4">

              {/* Adherence Ring + Stats */}
              {adherence && (
                <div className="grid grid-cols-1 sm:grid-cols-12 gap-4">
                  <Card variant="glass" className="sm:col-span-3 p-5 flex flex-col items-center justify-center text-center">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3">Overall Adherence</p>
                    <div className="relative w-28 h-28">
                      <svg className="w-full h-full -rotate-90">
                        <circle cx="56" cy="56" r="48" stroke="currentColor" strokeWidth="9" fill="transparent" className="text-slate-800" />
                        <motion.circle cx="56" cy="56" r="48" stroke="currentColor" strokeWidth="9" fill="transparent"
                          strokeDasharray="301.6" strokeLinecap="round"
                          initial={{ strokeDashoffset: 301.6 }}
                          animate={{ strokeDashoffset: 301.6 - (301.6 * adherence.adherenceRate) / 100 }}
                          transition={{ duration: 1.5, ease: "easeOut" }}
                          className={adherence.adherenceRate >= 80 ? 'text-teal-500' : adherence.adherenceRate >= 50 ? 'text-amber-500' : 'text-rose-500'}
                        />
                      </svg>
                      <span className="absolute inset-0 flex items-center justify-center text-2xl font-black text-white">{adherence.adherenceRate}%</span>
                    </div>
                    <div className="grid grid-cols-3 gap-2 mt-4 w-full text-center">
                      <div><p className="text-sm font-black text-teal-400">{adherence.takenDoses}</p><p className="text-[9px] text-slate-500 uppercase">Taken</p></div>
                      <div><p className="text-sm font-black text-rose-400">{adherence.missedDoses}</p><p className="text-[9px] text-slate-500 uppercase">Missed</p></div>
                      <div><p className="text-sm font-black text-amber-400">{adherence.streak}d</p><p className="text-[9px] text-slate-500 uppercase">Streak</p></div>
                    </div>
                  </Card>

                  {/* Daily intake cards */}
                  {weeklyData?.weeklyData && (
                    <Card variant="glass" className="sm:col-span-9 p-0 overflow-hidden flex flex-col">
                      <div className="p-3 border-b border-slate-800/60 bg-slate-800/30 flex items-center gap-2">
                        <CalendarCheck size={13} className="text-teal-400" />
                        <span className="text-xs font-bold text-slate-300 uppercase tracking-wider">Daily Intake Log</span>
                        <span className="text-[10px] text-slate-600 ml-auto">scroll →</span>
                      </div>
                      <div className="flex overflow-x-auto p-3 gap-2 snap-x">
                        {[...weeklyData.weeklyData].reverse().map(d => {
                          const day = new Date(d.date);
                          const isToday = day.toDateString() === new Date().toDateString();
                          return (
                            <div key={d.date} className={`min-w-[130px] flex flex-col p-3 rounded-xl border snap-start shrink-0
                              ${isToday ? 'bg-teal-500/5 border-teal-500/30' : 'bg-slate-900 border-slate-800'}`}>
                              <div className="flex justify-between items-center mb-2">
                                <span className="text-[10px] font-bold text-white">
                                  {isToday ? 'Today' : day.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
                                </span>
                                <span className={`w-2 h-2 rounded-full ${d.adherence === 100 ? 'bg-teal-500' : d.adherence >= 50 ? 'bg-amber-500' : 'bg-rose-500'}`} />
                              </div>
                              {d.medicinesTaken?.length > 0 ? (
                                <ul className="space-y-0.5 text-[9px]">
                                  {d.medicinesTaken.map((m, i) => (
                                    <li key={i} className="flex items-start gap-1 text-slate-300"><span className="text-teal-400">✓</span><span className="truncate" title={m}>{m}</span></li>
                                  ))}
                                </ul>
                              ) : (
                                <div className="flex flex-col items-center text-slate-600 text-[9px] gap-1 mt-1">
                                  <AlertCircle size={12} className="text-slate-700" />
                                  {d.total > 0 ? 'All missed' : 'No meds'}
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </Card>
                  )}
                </div>
              )}

              {/* Per-Medicine Compact Grid */}
              {medStats.length > 0 && (
                <div>
                  <h3 className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-3">Per-Medicine Breakdown</h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                    {medStats.map(med => (
                      <div key={med.medicineId} className="bg-slate-800/30 border border-slate-800 p-3 rounded-xl hover:bg-slate-800/60 transition-colors">
                        <div className="flex items-start justify-between mb-2">
                          <p className="text-xs font-bold text-white truncate pr-1" title={med.medicineName}>{med.medicineName}</p>
                          <Badge variant={med.adherenceRate >= 80 ? 'success' : med.adherenceRate >= 50 ? 'warning' : 'danger'}
                            className="text-[9px] px-1.5 py-0.5 whitespace-nowrap shrink-0">{med.adherenceRate}%</Badge>
                        </div>
                        <p className="text-[10px] text-slate-500 mb-2">{med.dosage || '—'}</p>
                        <div className="w-full h-1 bg-slate-700 rounded-full overflow-hidden">
                          <motion.div initial={{ width: 0 }} animate={{ width: `${med.adherenceRate}%` }} transition={{ duration: 0.8 }}
                            className={`h-full rounded-full ${med.adherenceRate >= 80 ? 'bg-teal-500' : med.adherenceRate >= 50 ? 'bg-amber-500' : 'bg-rose-500'}`} />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>

      </div>
    </DashboardLayout>
  );
}

export default Analytics;