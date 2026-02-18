import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
  Heart,
  Pill,
  TrendingUp,
  Activity,
  Plus,
  Droplets,
  Moon,
  Footprints,
  ThermometerSun,
  Zap,
  Brain,
  AlertCircle,
  CheckCircle2,
  Clock,
  Flame,
  FileText,
  ArrowRight,
  Smile,
  Frown,
  Meh,
  Angry,
  Laugh
} from 'lucide-react';
import DashboardLayout from '../../layouts/DashboardLayout';
import { Card, StatCard, Badge, Button, Loader } from '../../components/ui';
import { useAuth } from '../../hooks/useAuth';
import { getDashboardSummary } from '../../services/analyticsService';
import { saveHealthLog, getTodayLog } from '../../services/healthLogService';

// ── Mood Config ──
const MOODS = [
  { value: 'terrible', icon: Angry, label: 'Terrible', color: 'text-red-400', bg: 'bg-red-500/20' },
  { value: 'bad', icon: Frown, label: 'Bad', color: 'text-orange-400', bg: 'bg-orange-500/20' },
  { value: 'okay', icon: Meh, label: 'Okay', color: 'text-yellow-400', bg: 'bg-yellow-500/20' },
  { value: 'good', icon: Smile, label: 'Good', color: 'text-teal-400', bg: 'bg-teal-500/20' },
  { value: 'great', icon: Laugh, label: 'Great', color: 'text-green-400', bg: 'bg-green-500/20' },
];

// ── Circular Progress Ring ──
const ProgressRing = ({ value = 0, max = 100, size = 80, strokeWidth = 6, color = '#14b8a6', label, subLabel }) => {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const percent = Math.min(value / max, 1);
  const offset = circumference * (1 - percent);

  return (
    <div className="flex flex-col items-center gap-1">
      <svg width={size} height={size} className="-rotate-90">
        <circle
          cx={size / 2} cy={size / 2} r={radius}
          fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth={strokeWidth}
        />
        <motion.circle
          cx={size / 2} cy={size / 2} r={radius}
          fill="none" stroke={color} strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: 1.2, ease: 'easeOut' }}
        />
      </svg>
      <div className="absolute flex flex-col items-center justify-center" style={{ width: size, height: size }}>
        <span className="text-lg font-bold text-white">{Math.round(percent * 100)}%</span>
      </div>
      {label && <span className="text-xs font-medium text-slate-300">{label}</span>}
      {subLabel && <span className="text-[10px] text-slate-500">{subLabel}</span>}
    </div>
  );
};

// ── Quick Vitals Input Modal ──
const VitalsInputModal = ({ isOpen, onClose, onSave, existingLog }) => {
  const [vitals, setVitals] = useState({
    bloodPressure: { systolic: '', diastolic: '' },
    heartRate: '',
    oxygenLevel: '',
    weight: '',
    bloodSugar: { fasting: '', postMeal: '' },
    waterIntake: '',
    sleepHours: '',
    sleepQuality: '',
    stepsCount: '',
    exerciseMinutes: '',
    bodyTemp: '',
    stressLevel: '',
    energyLevel: '',
    symptoms: [],
    notes: '',
  });
  const [saving, setSaving] = useState(false);
  const [symptomInput, setSymptomInput] = useState('');

  useEffect(() => {
    if (existingLog) {
      setVitals({
        bloodPressure: {
          systolic: existingLog.bloodPressure?.systolic || '',
          diastolic: existingLog.bloodPressure?.diastolic || '',
        },
        heartRate: existingLog.heartRate || '',
        oxygenLevel: existingLog.oxygenLevel || '',
        weight: existingLog.weight || '',
        bloodSugar: {
          fasting: existingLog.bloodSugar?.fasting || '',
          postMeal: existingLog.bloodSugar?.postMeal || '',
        },
        waterIntake: existingLog.waterIntake || '',
        sleepHours: existingLog.sleepHours || '',
        sleepQuality: existingLog.sleepQuality || '',
        stepsCount: existingLog.stepsCount || '',
        exerciseMinutes: existingLog.exerciseMinutes || '',
        bodyTemp: existingLog.bodyTemp || '',
        stressLevel: existingLog.stressLevel || '',
        energyLevel: existingLog.energyLevel || '',
        symptoms: existingLog.symptoms || [],
        notes: existingLog.notes || '',
      });
    }
  }, [existingLog]);

  const handleChange = (field, value) => {
    setVitals(prev => ({ ...prev, [field]: value }));
  };

  const handleNestedChange = (parent, field, value) => {
    setVitals(prev => ({
      ...prev,
      [parent]: { ...prev[parent], [field]: value }
    }));
  };

  const addSymptom = () => {
    if (symptomInput.trim()) {
      setVitals(prev => ({
        ...prev,
        symptoms: [...prev.symptoms, symptomInput.trim()]
      }));
      setSymptomInput('');
    }
  };

  const removeSymptom = (idx) => {
    setVitals(prev => ({
      ...prev,
      symptoms: prev.symptoms.filter((_, i) => i !== idx)
    }));
  };

  const handleSubmit = async () => {
    setSaving(true);
    try {
      // Clean data — only send non-empty fields
      const cleanData = {};
      if (vitals.bloodPressure.systolic && vitals.bloodPressure.diastolic) {
        cleanData.bloodPressure = {
          systolic: Number(vitals.bloodPressure.systolic),
          diastolic: Number(vitals.bloodPressure.diastolic),
        };
      }
      if (vitals.heartRate) cleanData.heartRate = Number(vitals.heartRate);
      if (vitals.oxygenLevel) cleanData.oxygenLevel = Number(vitals.oxygenLevel);
      if (vitals.weight) cleanData.weight = Number(vitals.weight);
      if (vitals.bloodSugar.fasting || vitals.bloodSugar.postMeal) {
        cleanData.bloodSugar = {};
        if (vitals.bloodSugar.fasting) cleanData.bloodSugar.fasting = Number(vitals.bloodSugar.fasting);
        if (vitals.bloodSugar.postMeal) cleanData.bloodSugar.postMeal = Number(vitals.bloodSugar.postMeal);
      }
      if (vitals.waterIntake) cleanData.waterIntake = Number(vitals.waterIntake);
      if (vitals.sleepHours) cleanData.sleepHours = Number(vitals.sleepHours);
      if (vitals.sleepQuality) cleanData.sleepQuality = vitals.sleepQuality;
      if (vitals.stepsCount) cleanData.stepsCount = Number(vitals.stepsCount);
      if (vitals.exerciseMinutes) cleanData.exerciseMinutes = Number(vitals.exerciseMinutes);
      if (vitals.bodyTemp) cleanData.bodyTemp = Number(vitals.bodyTemp);
      if (vitals.stressLevel) cleanData.stressLevel = Number(vitals.stressLevel);
      if (vitals.energyLevel) cleanData.energyLevel = Number(vitals.energyLevel);
      if (vitals.symptoms.length > 0) cleanData.symptoms = vitals.symptoms;
      if (vitals.notes) cleanData.notes = vitals.notes;

      await onSave(cleanData);
      onClose();
    } catch (err) {
      console.error('Error saving vitals:', err);
    } finally {
      setSaving(false);
    }
  };

  if (!isOpen) return null;

  const inputClass = "w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white text-sm focus:border-teal-500 focus:outline-none focus:ring-1 focus:ring-teal-500 transition-colors";
  const labelClass = "text-xs font-medium text-slate-400 mb-1";

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9 }}
          onClick={e => e.stopPropagation()}
          className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-lg max-h-[85vh] overflow-y-auto"
        >
          {/* Header */}
          <div className="sticky top-0 bg-slate-900 border-b border-slate-700 px-6 py-4 rounded-t-2xl z-10">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <Activity className="text-teal-400" size={20} />
              Log Today&apos;s Vitals
            </h2>
            <p className="text-xs text-slate-400 mt-1">Fill in what you have — all fields are optional</p>
          </div>

          <div className="p-6 space-y-5">
            {/* Blood Pressure */}
            <div>
              <label className={labelClass}>Blood Pressure (mmHg)</label>
              <div className="flex gap-2">
                <input type="number" placeholder="Systolic" className={inputClass}
                  value={vitals.bloodPressure.systolic}
                  onChange={e => handleNestedChange('bloodPressure', 'systolic', e.target.value)} />
                <span className="text-slate-500 self-center">/</span>
                <input type="number" placeholder="Diastolic" className={inputClass}
                  value={vitals.bloodPressure.diastolic}
                  onChange={e => handleNestedChange('bloodPressure', 'diastolic', e.target.value)} />
              </div>
            </div>

            {/* Heart Rate & SpO2 */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className={labelClass}>Heart Rate (bpm)</label>
                <input type="number" placeholder="72" className={inputClass}
                  value={vitals.heartRate}
                  onChange={e => handleChange('heartRate', e.target.value)} />
              </div>
              <div>
                <label className={labelClass}>SpO2 (%)</label>
                <input type="number" placeholder="98" className={inputClass}
                  value={vitals.oxygenLevel}
                  onChange={e => handleChange('oxygenLevel', e.target.value)} />
              </div>
            </div>

            {/* Weight & Temp */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className={labelClass}>Weight (kg)</label>
                <input type="number" step="0.1" placeholder="72.5" className={inputClass}
                  value={vitals.weight}
                  onChange={e => handleChange('weight', e.target.value)} />
              </div>
              <div>
                <label className={labelClass}>Body Temp (°F)</label>
                <input type="number" step="0.1" placeholder="98.6" className={inputClass}
                  value={vitals.bodyTemp}
                  onChange={e => handleChange('bodyTemp', e.target.value)} />
              </div>
            </div>

            {/* Blood Sugar */}
            <div>
              <label className={labelClass}>Blood Sugar (mg/dL)</label>
              <div className="grid grid-cols-2 gap-3">
                <input type="number" placeholder="Fasting" className={inputClass}
                  value={vitals.bloodSugar.fasting}
                  onChange={e => handleNestedChange('bloodSugar', 'fasting', e.target.value)} />
                <input type="number" placeholder="Post-meal" className={inputClass}
                  value={vitals.bloodSugar.postMeal}
                  onChange={e => handleNestedChange('bloodSugar', 'postMeal', e.target.value)} />
              </div>
            </div>

            {/* Water & Sleep */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className={labelClass}>Water Intake (glasses)</label>
                <input type="number" placeholder="8" className={inputClass}
                  value={vitals.waterIntake}
                  onChange={e => handleChange('waterIntake', e.target.value)} />
              </div>
              <div>
                <label className={labelClass}>Sleep (hours)</label>
                <input type="number" step="0.5" placeholder="7.5" className={inputClass}
                  value={vitals.sleepHours}
                  onChange={e => handleChange('sleepHours', e.target.value)} />
              </div>
            </div>

            {/* Sleep Quality */}
            <div>
              <label className={labelClass}>Sleep Quality</label>
              <div className="flex gap-2">
                {['poor', 'fair', 'good', 'excellent'].map(q => (
                  <button key={q}
                    onClick={() => handleChange('sleepQuality', vitals.sleepQuality === q ? '' : q)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all
                      ${vitals.sleepQuality === q
                        ? 'bg-teal-500/30 text-teal-300 border border-teal-500/50'
                        : 'bg-slate-800 text-slate-400 border border-slate-700 hover:border-slate-600'}`}
                  >
                    {q.charAt(0).toUpperCase() + q.slice(1)}
                  </button>
                ))}
              </div>
            </div>

            {/* Steps & Exercise */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className={labelClass}>Steps</label>
                <input type="number" placeholder="8500" className={inputClass}
                  value={vitals.stepsCount}
                  onChange={e => handleChange('stepsCount', e.target.value)} />
              </div>
              <div>
                <label className={labelClass}>Exercise (min)</label>
                <input type="number" placeholder="30" className={inputClass}
                  value={vitals.exerciseMinutes}
                  onChange={e => handleChange('exerciseMinutes', e.target.value)} />
              </div>
            </div>

            {/* Stress & Energy */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className={labelClass}>Stress Level (1-5)</label>
                <div className="flex gap-1">
                  {[1, 2, 3, 4, 5].map(n => (
                    <button key={n}
                      onClick={() => handleChange('stressLevel', vitals.stressLevel === n ? '' : n)}
                      className={`w-9 h-9 rounded-lg text-sm font-medium transition-all
                        ${vitals.stressLevel === n
                          ? 'bg-red-500/30 text-red-300 border border-red-500/50'
                          : 'bg-slate-800 text-slate-400 border border-slate-700'}`}
                    >{n}</button>
                  ))}
                </div>
              </div>
              <div>
                <label className={labelClass}>Energy Level (1-5)</label>
                <div className="flex gap-1">
                  {[1, 2, 3, 4, 5].map(n => (
                    <button key={n}
                      onClick={() => handleChange('energyLevel', vitals.energyLevel === n ? '' : n)}
                      className={`w-9 h-9 rounded-lg text-sm font-medium transition-all
                        ${vitals.energyLevel === n
                          ? 'bg-green-500/30 text-green-300 border border-green-500/50'
                          : 'bg-slate-800 text-slate-400 border border-slate-700'}`}
                    >{n}</button>
                  ))}
                </div>
              </div>
            </div>

            {/* Symptoms */}
            <div>
              <label className={labelClass}>Symptoms</label>
              <div className="flex gap-2">
                <input type="text" placeholder="e.g., headache" className={inputClass}
                  value={symptomInput}
                  onChange={e => setSymptomInput(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && addSymptom()} />
                <button onClick={addSymptom}
                  className="px-3 py-2 bg-teal-500/20 text-teal-400 rounded-xl text-sm hover:bg-teal-500/30 transition-colors">
                  Add
                </button>
              </div>
              {vitals.symptoms.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mt-2">
                  {vitals.symptoms.map((s, i) => (
                    <span key={i}
                      className="px-2 py-1 bg-slate-800 text-slate-300 rounded-lg text-xs flex items-center gap-1 cursor-pointer hover:bg-red-500/20 hover:text-red-300 transition-colors"
                      onClick={() => removeSymptom(i)}>
                      {s} ×
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* Notes */}
            <div>
              <label className={labelClass}>Notes</label>
              <textarea placeholder="How are you feeling today?" className={`${inputClass} resize-none h-20`}
                value={vitals.notes}
                onChange={e => handleChange('notes', e.target.value)} />
            </div>
          </div>

          {/* Footer */}
          <div className="sticky bottom-0 bg-slate-900 border-t border-slate-700 px-6 py-4 rounded-b-2xl flex justify-end gap-3">
            <button onClick={onClose}
              className="px-4 py-2 text-sm text-slate-400 hover:text-white transition-colors">
              Cancel
            </button>
            <button onClick={handleSubmit} disabled={saving}
              className="px-6 py-2 bg-gradient-to-r from-teal-500 to-cyan-500 text-white font-medium rounded-xl text-sm hover:from-teal-400 hover:to-cyan-400 transition-all disabled:opacity-50 flex items-center gap-2">
              {saving ? <Loader size="sm" /> : <CheckCircle2 size={16} />}
              {saving ? 'Saving...' : 'Save Vitals'}
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};


// ═══════════════════════════════════════════
// DASHBOARD COMPONENT
// ═══════════════════════════════════════════
function Dashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [dashData, setDashData] = useState(null);
  const [todayHealth, setTodayHealth] = useState(null);
  const [showVitalsModal, setShowVitalsModal] = useState(false);
  const [savingMood, setSavingMood] = useState(false);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const [dashRes, healthRes] = await Promise.all([
        getDashboardSummary(),
        getTodayLog(),
      ]);
      setDashData(dashRes.data);
      setTodayHealth(healthRes.data?.log || null);
    } catch (err) {
      console.error('Dashboard fetch error:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Save mood
  const handleMoodSelect = async (mood) => {
    setSavingMood(true);
    try {
      const result = await saveHealthLog({ mood });
      setTodayHealth(result.data?.log || null);
    } catch (err) {
      console.error('Error saving mood:', err);
    } finally {
      setSavingMood(false);
    }
  };

  // Save vitals
  const handleSaveVitals = async (vitalsData) => {
    const result = await saveHealthLog(vitalsData);
    setTodayHealth(result.data?.log || null);
    await fetchData();
  };

  // Get greeting based on time of day
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 17) return 'Good Afternoon';
    return 'Good Evening';
  };

  // Get BP status label & color
  const getBpInfo = (log) => {
    if (!log?.bloodPressure?.systolic) return null;
    const { systolic, diastolic } = log.bloodPressure;
    const status = log.bpStatus;
    const colors = {
      low: 'text-blue-400',
      normal: 'text-green-400',
      elevated: 'text-yellow-400',
      'high-stage1': 'text-orange-400',
      'high-stage2': 'text-red-400',
    };
    return { systolic, diastolic, status, color: colors[status] || 'text-slate-400', label: status?.replace('-', ' ') || '' };
  };

  if (loading) {
    return (
      <DashboardLayout title="Dashboard">
        <div className="flex items-center justify-center py-20">
          <Loader variant="gradient" size="xl" text="Loading your health data..." />
        </div>
      </DashboardLayout>
    );
  }

  const medProgress = dashData?.todayProgress;
  const medPercent = medProgress?.total > 0 ? Math.round((medProgress.taken / medProgress.total) * 100) : 0;
  const waterPercent = todayHealth?.waterIntake ? Math.round((todayHealth.waterIntake / 8) * 100) : 0;
  const stepsPercent = todayHealth?.stepsCount ? Math.round((todayHealth.stepsCount / 10000) * 100) : 0;
  const bpInfo = getBpInfo(todayHealth);
  const currentMood = MOODS.find(m => m.value === todayHealth?.mood);

  return (
    <DashboardLayout>
      <div className="space-y-6">

        {/* ── Greeting + AI Briefing ── */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-br from-teal-500/20 via-cyan-500/10 to-slate-900 border border-teal-500/20 rounded-2xl p-5"
        >
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-xl md:text-2xl font-bold text-white">
                {getGreeting()}, {user?.name?.split(' ')[0] || 'there'} 👋
              </h1>
              <p className="text-sm text-slate-300 mt-1.5 max-w-md">
                {medProgress?.total > 0
                  ? `${medProgress.taken} of ${medProgress.total} medicines taken today. `
                  : 'No medicines scheduled today. '}
                {bpInfo ? `BP: ${bpInfo.systolic}/${bpInfo.diastolic} (${bpInfo.label}). ` : ''}
                {dashData?.streak > 0 ? `🔥 ${dashData.streak} day streak!` : ''}
              </p>
            </div>
            <div className="hidden md:flex items-center gap-2 text-xs text-slate-400">
              <Clock size={14} />
              {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}
            </div>
          </div>
        </motion.div>

        {/* ── Health Rings ── */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card variant="glass" className="p-5">
            <h2 className="text-sm font-semibold text-slate-300 mb-4 flex items-center gap-2">
              <Activity size={16} className="text-teal-400" />
              Today&apos;s Progress
            </h2>
            <div className="flex justify-around items-center">
              <div className="relative">
                <ProgressRing value={medPercent} color="#14b8a6" label="Medicines" subLabel={`${medProgress?.taken || 0}/${medProgress?.total || 0}`} />
              </div>
              <div className="relative">
                <ProgressRing value={waterPercent} color="#38bdf8" label="Water" subLabel={`${todayHealth?.waterIntake || 0}/8 glasses`} />
              </div>
              <div className="relative">
                <ProgressRing value={stepsPercent} color="#a78bfa" label="Steps" subLabel={`${todayHealth?.stepsCount?.toLocaleString() || 0}/10K`} />
              </div>
            </div>
          </Card>
        </motion.div>

        {/* ── Today's Vitals ── */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
        >
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-semibold text-slate-300 flex items-center gap-2">
              <Heart size={16} className="text-red-400" />
              Today&apos;s Vitals
            </h2>
            <button
              onClick={() => setShowVitalsModal(true)}
              className="text-xs text-teal-400 hover:text-teal-300 flex items-center gap-1 transition-colors"
            >
              <Plus size={14} /> {todayHealth ? 'Update' : 'Log Now'}
            </button>
          </div>

          {todayHealth && (todayHealth.bloodPressure?.systolic || todayHealth.heartRate || todayHealth.oxygenLevel || todayHealth.weight || todayHealth.bloodSugar?.fasting) ? (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {bpInfo && (
                <Card variant="glass" className="p-4 hover:border-teal-500/30 transition-colors">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-8 h-8 rounded-lg bg-red-500/15 flex items-center justify-center">
                      <Heart size={16} className="text-red-400" />
                    </div>
                    <span className="text-xs text-slate-400">Blood Pressure</span>
                  </div>
                  <p className="text-lg font-bold text-white">{bpInfo.systolic}/{bpInfo.diastolic}</p>
                  <span className={`text-xs font-medium capitalize ${bpInfo.color}`}>{bpInfo.label}</span>
                </Card>
              )}
              {todayHealth.heartRate && (
                <Card variant="glass" className="p-4 hover:border-teal-500/30 transition-colors">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-8 h-8 rounded-lg bg-pink-500/15 flex items-center justify-center">
                      <Activity size={16} className="text-pink-400" />
                    </div>
                    <span className="text-xs text-slate-400">Heart Rate</span>
                  </div>
                  <p className="text-lg font-bold text-white">{todayHealth.heartRate} <span className="text-xs font-normal text-slate-400">bpm</span></p>
                  <span className={`text-xs font-medium ${todayHealth.heartRate >= 60 && todayHealth.heartRate <= 100 ? 'text-green-400' : 'text-yellow-400'}`}>
                    {todayHealth.heartRate >= 60 && todayHealth.heartRate <= 100 ? 'Normal' : 'Check'}
                  </span>
                </Card>
              )}
              {todayHealth.oxygenLevel && (
                <Card variant="glass" className="p-4 hover:border-teal-500/30 transition-colors">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-8 h-8 rounded-lg bg-blue-500/15 flex items-center justify-center">
                      <Zap size={16} className="text-blue-400" />
                    </div>
                    <span className="text-xs text-slate-400">SpO2</span>
                  </div>
                  <p className="text-lg font-bold text-white">{todayHealth.oxygenLevel}%</p>
                  <span className={`text-xs font-medium ${todayHealth.oxygenLevel >= 95 ? 'text-green-400' : 'text-red-400'}`}>
                    {todayHealth.oxygenLevel >= 95 ? 'Normal' : 'Low'}
                  </span>
                </Card>
              )}
              {todayHealth.bloodSugar?.fasting && (
                <Card variant="glass" className="p-4 hover:border-teal-500/30 transition-colors">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-8 h-8 rounded-lg bg-amber-500/15 flex items-center justify-center">
                      <Droplets size={16} className="text-amber-400" />
                    </div>
                    <span className="text-xs text-slate-400">Blood Sugar</span>
                  </div>
                  <p className="text-lg font-bold text-white">{todayHealth.bloodSugar.fasting} <span className="text-xs font-normal text-slate-400">mg/dL</span></p>
                  <span className={`text-xs font-medium ${todayHealth.bloodSugar.fasting <= 100 ? 'text-green-400' : todayHealth.bloodSugar.fasting <= 125 ? 'text-yellow-400' : 'text-red-400'}`}>
                    {todayHealth.bloodSugar.fasting <= 100 ? 'Normal' : todayHealth.bloodSugar.fasting <= 125 ? 'Prediabetic' : 'High'}
                  </span>
                </Card>
              )}
            </div>
          ) : (
            <Card variant="glass" className="p-6 text-center">
              <AlertCircle size={32} className="text-slate-600 mx-auto mb-2" />
              <p className="text-sm text-slate-400">No vitals logged today</p>
              <button
                onClick={() => setShowVitalsModal(true)}
                className="mt-3 text-sm text-teal-400 hover:text-teal-300 font-medium transition-colors"
              >
                Log your first vitals →
              </button>
            </Card>
          )}
        </motion.div>

        {/* ── Mood Widget ── */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card variant="glass" className="p-5">
            <h2 className="text-sm font-semibold text-slate-300 mb-3 flex items-center gap-2">
              <Brain size={16} className="text-violet-400" />
              How are you feeling?
            </h2>
            <div className="flex justify-around">
              {MOODS.map(mood => {
                const MoodIcon = mood.icon;
                const isSelected = currentMood?.value === mood.value;
                return (
                  <motion.button
                    key={mood.value}
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => handleMoodSelect(mood.value)}
                    disabled={savingMood}
                    className={`flex flex-col items-center gap-1.5 p-2 rounded-xl transition-all
                      ${isSelected ? `${mood.bg} border border-current ${mood.color}` : 'text-slate-500 hover:text-slate-300'}`}
                  >
                    <MoodIcon size={24} />
                    <span className="text-[10px] font-medium">{mood.label}</span>
                  </motion.button>
                );
              })}
            </div>
          </Card>
        </motion.div>

        {/* ── Stats Row ── */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
          className="grid grid-cols-2 md:grid-cols-4 gap-3"
        >
          <StatCard
            title="Active Meds"
            value={dashData?.activeMedicines || 0}
            icon={<Pill size={18} />}
            color="teal"
          />
          <StatCard
            title="Weekly Adherence"
            value={`${dashData?.weeklyAdherence || 0}%`}
            icon={<TrendingUp size={18} />}
            color="green"
          />
          <StatCard
            title="Streak"
            value={`${dashData?.streak || 0} days`}
            icon={<Flame size={18} />}
            color="orange"
          />
          <StatCard
            title="Sleep"
            value={todayHealth?.sleepHours ? `${todayHealth.sleepHours}h` : '--'}
            icon={<Moon size={18} />}
            color="purple"
          />
        </motion.div>

        {/* ── Wellness Snapshot ── */}
        {todayHealth && (todayHealth.sleepHours || todayHealth.waterIntake || todayHealth.stepsCount || todayHealth.exerciseMinutes) && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <h2 className="text-sm font-semibold text-slate-300 mb-3 flex items-center gap-2">
              <ThermometerSun size={16} className="text-orange-400" />
              Wellness Snapshot
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {todayHealth.sleepHours != null && (
                <Card variant="glass" className="p-4">
                  <div className="flex items-center gap-2 mb-1">
                    <Moon size={14} className="text-indigo-400" />
                    <span className="text-xs text-slate-400">Sleep</span>
                  </div>
                  <p className="text-base font-bold text-white">{todayHealth.sleepHours}h</p>
                  {todayHealth.sleepQuality && (
                    <span className="text-xs text-slate-400 capitalize">{todayHealth.sleepQuality}</span>
                  )}
                </Card>
              )}
              {todayHealth.waterIntake != null && (
                <Card variant="glass" className="p-4">
                  <div className="flex items-center gap-2 mb-1">
                    <Droplets size={14} className="text-sky-400" />
                    <span className="text-xs text-slate-400">Water</span>
                  </div>
                  <p className="text-base font-bold text-white">{todayHealth.waterIntake} glasses</p>
                </Card>
              )}
              {todayHealth.stepsCount != null && (
                <Card variant="glass" className="p-4">
                  <div className="flex items-center gap-2 mb-1">
                    <Footprints size={14} className="text-violet-400" />
                    <span className="text-xs text-slate-400">Steps</span>
                  </div>
                  <p className="text-base font-bold text-white">{todayHealth.stepsCount.toLocaleString()}</p>
                </Card>
              )}
              {todayHealth.exerciseMinutes != null && (
                <Card variant="glass" className="p-4">
                  <div className="flex items-center gap-2 mb-1">
                    <Zap size={14} className="text-green-400" />
                    <span className="text-xs text-slate-400">Exercise</span>
                  </div>
                  <p className="text-base font-bold text-white">{todayHealth.exerciseMinutes} min</p>
                </Card>
              )}
            </div>
          </motion.div>
        )}

        {/* ── Quick Actions ── */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35 }}
        >
          <h2 className="text-sm font-semibold text-slate-300 mb-3">Quick Actions</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <motion.button
              whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
              onClick={() => setShowVitalsModal(true)}
              className="flex items-center gap-3 p-4 bg-slate-800/50 border border-slate-700 rounded-2xl hover:border-teal-500/30 transition-all"
            >
              <div className="w-10 h-10 rounded-xl bg-teal-500/15 flex items-center justify-center">
                <Activity size={18} className="text-teal-400" />
              </div>
              <div className="text-left">
                <span className="text-sm font-medium text-white">Log Vitals</span>
                <p className="text-[10px] text-slate-500">BP, heart rate...</p>
              </div>
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
              onClick={() => navigate('/medicines/add')}
              className="flex items-center gap-3 p-4 bg-slate-800/50 border border-slate-700 rounded-2xl hover:border-violet-500/30 transition-all"
            >
              <div className="w-10 h-10 rounded-xl bg-violet-500/15 flex items-center justify-center">
                <Pill size={18} className="text-violet-400" />
              </div>
              <div className="text-left">
                <span className="text-sm font-medium text-white">Add Medicine</span>
                <p className="text-[10px] text-slate-500">New prescription</p>
              </div>
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
              onClick={() => navigate('/records')}
              className="flex items-center gap-3 p-4 bg-slate-800/50 border border-slate-700 rounded-2xl hover:border-cyan-500/30 transition-all"
            >
              <div className="w-10 h-10 rounded-xl bg-cyan-500/15 flex items-center justify-center">
                <FileText size={18} className="text-cyan-400" />
              </div>
              <div className="text-left">
                <span className="text-sm font-medium text-white">Records</span>
                <p className="text-[10px] text-slate-500">View reports</p>
              </div>
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
              onClick={() => navigate('/analytics')}
              className="flex items-center gap-3 p-4 bg-slate-800/50 border border-slate-700 rounded-2xl hover:border-amber-500/30 transition-all"
            >
              <div className="w-10 h-10 rounded-xl bg-amber-500/15 flex items-center justify-center">
                <TrendingUp size={18} className="text-amber-400" />
              </div>
              <div className="text-left">
                <span className="text-sm font-medium text-white">Analytics</span>
                <p className="text-[10px] text-slate-500">Trends & stats</p>
              </div>
            </motion.button>
          </div>
        </motion.div>

        {/* ── Symptoms Alert ── */}
        {todayHealth?.symptoms?.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <Card variant="glass" className="p-4 border-amber-500/20">
              <h3 className="text-sm font-semibold text-amber-400 flex items-center gap-2 mb-2">
                <AlertCircle size={16} />
                Today&apos;s Symptoms
              </h3>
              <div className="flex flex-wrap gap-2">
                {todayHealth.symptoms.map((s, i) => (
                  <Badge key={i} variant="warning">{s}</Badge>
                ))}
              </div>
            </Card>
          </motion.div>
        )}

      </div>

      {/* Vitals Modal */}
      <VitalsInputModal
        isOpen={showVitalsModal}
        onClose={() => setShowVitalsModal(false)}
        onSave={handleSaveVitals}
        existingLog={todayHealth}
      />
    </DashboardLayout>
  );
}

export default Dashboard;