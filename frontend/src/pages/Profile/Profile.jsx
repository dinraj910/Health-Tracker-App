import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import {
  User,
  Mail,
  Phone,
  Calendar,
  Camera,
  Save,
  Edit2,
  Shield,
  Lock,
  Eye,
  EyeOff,
  AlertCircle,
  Check,
  X,
  Bell,
  Moon,
  Trash2,
  Ruler,
  Weight,
  HeartPulse,
  Stethoscope,
  Dumbbell,
  Wine,
  Cigarette,
  Utensils,
  Plus,
  ShieldCheck
} from 'lucide-react';
import DashboardLayout from '../../layouts/DashboardLayout';
import { Card, Button, Input, Modal, Badge } from '../../components/ui';
import { useAuth } from '../../hooks/useAuth';
import { updateProfile, updatePassword, uploadAvatar, deleteAccount } from '../../services/userService';

// ── Section wrapper for collapsible health cards ──
const ProfileSection = ({ icon, iconColor, iconBg, title, children, defaultOpen = false }) => {
  const IconComponent = icon;
  const [open, setOpen] = useState(defaultOpen);
  return (
    <Card variant="default">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-3 w-full text-left"
      >
        <div className={`w-10 h-10 rounded-xl ${iconBg} flex items-center justify-center`}>
          <IconComponent size={20} className={iconColor} />
        </div>
        <h2 className="text-lg font-semibold text-white flex-1">{title}</h2>
        <motion.span
          animate={{ rotate: open ? 180 : 0 }}
          className="text-slate-400 text-sm"
        >
          ▼
        </motion.span>
      </button>
      {open && <div className="mt-5">{children}</div>}
    </Card>
  );
};

const Profile = () => {
  const { user, updateUser } = useAuth();
  const fileInputRef = useRef(null);

  const [loading, setLoading] = useState(false);
  const [editing, setEditing] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [error, setError] = useState('');

  // Basic profile
  const [profile, setProfile] = useState({
    name: '', email: '', phone: '', dateOfBirth: '', avatar: ''
  });

  // Health profile
  const [healthProfile, setHealthProfile] = useState({
    height: '', weight: '', bloodGroup: '', gender: '',
    chronicConditions: [],
    currentDoctors: [],
    insuranceInfo: { provider: '', policyNumber: '', validTill: '' },
    smokingStatus: 'never',
    alcoholUse: 'never',
    activityLevel: 'moderate',
    dietaryPreference: 'non-vegetarian',
  });
  const [conditionInput, setConditionInput] = useState('');
  const [doctorInput, setDoctorInput] = useState({ name: '', specialty: '', phone: '' });

  // Password
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '', newPassword: '', confirmPassword: ''
  });
  const [showPasswords, setShowPasswords] = useState({ current: false, new: false, confirm: false });
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [passwordError, setPasswordError] = useState('');

  // Delete
  const [deleteConfirm, setDeleteConfirm] = useState('');
  const [deleteLoading, setDeleteLoading] = useState(false);

  // Settings
  const [settings, setSettings] = useState({
    notifications: true, darkMode: true, emailAlerts: false
  });

  useEffect(() => {
    if (user) {
      setProfile({
        name: user.name || '',
        email: user.email || '',
        phone: user.phone || '',
        dateOfBirth: user.dateOfBirth ? new Date(user.dateOfBirth).toISOString().split('T')[0] : '',
        avatar: user.avatar || ''
      });
      setHealthProfile({
        height: user.height || '',
        weight: user.weight || '',
        bloodGroup: user.bloodGroup || '',
        gender: user.gender || '',
        chronicConditions: user.chronicConditions || [],
        currentDoctors: user.currentDoctors || [],
        insuranceInfo: {
          provider: user.insuranceInfo?.provider || '',
          policyNumber: user.insuranceInfo?.policyNumber || '',
          validTill: user.insuranceInfo?.validTill
            ? new Date(user.insuranceInfo.validTill).toISOString().split('T')[0]
            : '',
        },
        smokingStatus: user.smokingStatus || 'never',
        alcoholUse: user.alcoholUse || 'never',
        activityLevel: user.activityLevel || 'moderate',
        dietaryPreference: user.dietaryPreference || 'non-vegetarian',
      });
    }
  }, [user]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setProfile(prev => ({ ...prev, [name]: value }));
  };

  const handleHealthChange = (field, value) => {
    setHealthProfile(prev => ({ ...prev, [field]: value }));
  };

  const handleInsuranceChange = (field, value) => {
    setHealthProfile(prev => ({
      ...prev,
      insuranceInfo: { ...prev.insuranceInfo, [field]: value }
    }));
  };

  const addCondition = () => {
    if (conditionInput.trim()) {
      setHealthProfile(prev => ({
        ...prev,
        chronicConditions: [...prev.chronicConditions, conditionInput.trim()]
      }));
      setConditionInput('');
    }
  };

  const removeCondition = (idx) => {
    setHealthProfile(prev => ({
      ...prev,
      chronicConditions: prev.chronicConditions.filter((_, i) => i !== idx)
    }));
  };

  const addDoctor = () => {
    if (doctorInput.name.trim()) {
      setHealthProfile(prev => ({
        ...prev,
        currentDoctors: [...prev.currentDoctors, { ...doctorInput }]
      }));
      setDoctorInput({ name: '', specialty: '', phone: '' });
    }
  };

  const removeDoctor = (idx) => {
    setHealthProfile(prev => ({
      ...prev,
      currentDoctors: prev.currentDoctors.filter((_, i) => i !== idx)
    }));
  };

  const handleAvatarClick = () => fileInputRef.current?.click();

  const handleAvatarChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    try {
      setLoading(true);
      const formData = new FormData();
      formData.append('avatar', file);
      const data = await uploadAvatar(formData);
      setProfile(prev => ({ ...prev, avatar: data.avatarUrl }));
      updateUser({ ...user, avatar: data.avatarUrl });
    } catch {
      setError('Failed to upload avatar');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveProfile = async () => {
    try {
      setLoading(true);
      setError('');

      const payload = {
        name: profile.name,
        phone: profile.phone,
        dateOfBirth: profile.dateOfBirth,
        height: healthProfile.height ? Number(healthProfile.height) : undefined,
        weight: healthProfile.weight ? Number(healthProfile.weight) : undefined,
        bloodGroup: healthProfile.bloodGroup || undefined,
        gender: healthProfile.gender || undefined,
        chronicConditions: healthProfile.chronicConditions,
        currentDoctors: healthProfile.currentDoctors,
        insuranceInfo: healthProfile.insuranceInfo.provider ? healthProfile.insuranceInfo : undefined,
        smokingStatus: healthProfile.smokingStatus,
        alcoholUse: healthProfile.alcoholUse,
        activityLevel: healthProfile.activityLevel,
        dietaryPreference: healthProfile.dietaryPreference,
      };

      // Remove undefined keys
      Object.keys(payload).forEach(k => payload[k] === undefined && delete payload[k]);

      const data = await updateProfile(payload);
      updateUser(data.user);
      setEditing(false);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err) {
      setError(err.message || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    setPasswordError('');
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setPasswordError('Passwords do not match');
      return;
    }
    if (passwordForm.newPassword.length < 6) {
      setPasswordError('Password must be at least 6 characters');
      return;
    }
    try {
      setPasswordLoading(true);
      await updatePassword({
        currentPassword: passwordForm.currentPassword,
        newPassword: passwordForm.newPassword
      });
      setShowPasswordModal(false);
      setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err) {
      setPasswordError(err.message || 'Failed to update password');
    } finally {
      setPasswordLoading(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (deleteConfirm !== 'DELETE') return;
    try {
      setDeleteLoading(true);
      await deleteAccount();
      window.location.href = '/login';
    } catch {
      setError('Failed to delete account');
    } finally {
      setDeleteLoading(false);
    }
  };

  const getInitials = (name) =>
    name?.split(' ').map(n => n[0]).join('').toUpperCase() || 'U';

  const inputClass = "w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2.5 text-white text-sm focus:border-teal-500 focus:outline-none focus:ring-1 focus:ring-teal-500 transition-colors disabled:opacity-50";
  const labelClass = "text-xs font-medium text-slate-400 mb-1.5 block";
  const selectClass = `${inputClass} appearance-none cursor-pointer`;

  const ChoiceButton = ({ selected, onClick, children, disabled }) => (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={`px-3 py-2 rounded-xl text-xs font-medium transition-all border
        ${selected
          ? 'bg-teal-500/20 text-teal-300 border-teal-500/50'
          : 'bg-slate-800 text-slate-400 border-slate-700 hover:border-slate-600'}
        ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
    >
      {children}
    </button>
  );

  return (
    <DashboardLayout title="Profile">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Success Toast */}
        {saveSuccess && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed top-4 right-4 bg-green-500 text-white px-6 py-3 rounded-xl flex items-center gap-2 shadow-lg z-50"
          >
            <Check size={20} />
            <span>Saved successfully!</span>
          </motion.div>
        )}

        {/* ── Profile Header ── */}
        <Card variant="gradient">
          <div className="flex flex-col sm:flex-row items-center gap-6">
            <div className="relative group">
              <div onClick={handleAvatarClick}
                className="w-28 h-28 rounded-full overflow-hidden cursor-pointer border-4 border-white/20 relative">
                {profile.avatar ? (
                  <img src={profile.avatar} alt={profile.name} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-teal-400 to-cyan-500 flex items-center justify-center text-3xl font-bold text-white">
                    {getInitials(profile.name)}
                  </div>
                )}
                <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <Camera size={24} className="text-white" />
                </div>
              </div>
              <input ref={fileInputRef} type="file" accept="image/*" onChange={handleAvatarChange} className="hidden" />
              <div className="absolute bottom-0 right-0 w-8 h-8 bg-teal-500 rounded-full flex items-center justify-center border-2 border-slate-900 cursor-pointer">
                <Camera size={14} className="text-white" />
              </div>
            </div>

            <div className="flex-1 text-center sm:text-left">
              <h1 className="text-2xl font-bold text-white mb-1">{profile.name || 'User'}</h1>
              <p className="text-slate-300">{profile.email}</p>
              <div className="flex flex-wrap gap-2 mt-3 justify-center sm:justify-start">
                <Badge variant="primary" dot>Active</Badge>
                {healthProfile.bloodGroup && <Badge variant="secondary">{healthProfile.bloodGroup}</Badge>}
                <Badge variant="secondary">
                  Member since {user?.createdAt ? new Date(user.createdAt).getFullYear() : new Date().getFullYear()}
                </Badge>
              </div>
            </div>

            <Button
              variant={editing ? 'ghost' : 'outline'}
              leftIcon={editing ? <X size={18} /> : <Edit2 size={18} />}
              onClick={() => setEditing(!editing)}
            >
              {editing ? 'Cancel' : 'Edit'}
            </Button>
          </div>
        </Card>

        {/* ── Personal Information ── */}
        <Card variant="default">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl bg-teal-500/20 flex items-center justify-center">
              <User size={20} className="text-teal-400" />
            </div>
            <h2 className="text-lg font-semibold text-white">Personal Information</h2>
          </div>

          {error && (
            <div className="mb-4 p-4 bg-red-500/10 border border-red-500/20 rounded-xl flex items-center gap-3">
              <AlertCircle className="text-red-400" size={20} />
              <p className="text-red-400">{error}</p>
            </div>
          )}

          <div className="grid gap-6 sm:grid-cols-2">
            <Input label="Full Name" name="name" value={profile.name} onChange={handleInputChange}
              disabled={!editing} leftIcon={<User size={18} />} />
            <Input label="Email" name="email" type="email" value={profile.email}
              disabled leftIcon={<Mail size={18} />} hint="Email cannot be changed" />
            <Input label="Phone Number" name="phone" type="tel" value={profile.phone}
              onChange={handleInputChange} disabled={!editing} leftIcon={<Phone size={18} />}
              placeholder="Enter your phone number" />
            <Input label="Date of Birth" name="dateOfBirth" type="date" value={profile.dateOfBirth}
              onChange={handleInputChange} disabled={!editing} leftIcon={<Calendar size={18} />} />

            {/* Gender */}
            <div>
              <label className={labelClass}>Gender</label>
              <select value={healthProfile.gender} disabled={!editing}
                onChange={e => handleHealthChange('gender', e.target.value)} className={selectClass}>
                <option value="">Select</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="other">Other</option>
              </select>
            </div>

            {/* Blood Group */}
            <div>
              <label className={labelClass}>Blood Group</label>
              <select value={healthProfile.bloodGroup} disabled={!editing}
                onChange={e => handleHealthChange('bloodGroup', e.target.value)} className={selectClass}>
                <option value="">Select</option>
                {['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'].map(bg => (
                  <option key={bg} value={bg}>{bg}</option>
                ))}
              </select>
            </div>
          </div>
        </Card>

        {/* ── Body Metrics ── */}
        <ProfileSection icon={Ruler} iconColor="text-cyan-400" iconBg="bg-cyan-500/20"
          title="Body Metrics" defaultOpen={true}>
          <div className="grid gap-5 sm:grid-cols-2">
            <div>
              <label className={labelClass}>Height (cm)</label>
              <input type="number" step="0.1" placeholder="175" disabled={!editing}
                value={healthProfile.height}
                onChange={e => handleHealthChange('height', e.target.value)}
                className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>Weight (kg)</label>
              <input type="number" step="0.1" placeholder="72.5" disabled={!editing}
                value={healthProfile.weight}
                onChange={e => handleHealthChange('weight', e.target.value)}
                className={inputClass} />
            </div>
            {healthProfile.height && healthProfile.weight && (
              <div className="sm:col-span-2">
                <div className="p-4 bg-slate-800/50 rounded-xl flex items-center gap-4">
                  <div className="w-10 h-10 rounded-xl bg-teal-500/15 flex items-center justify-center">
                    <Weight size={18} className="text-teal-400" />
                  </div>
                  <div>
                    <p className="text-xs text-slate-400">BMI</p>
                    <p className="text-lg font-bold text-white">
                      {(Number(healthProfile.weight) / ((Number(healthProfile.height) / 100) ** 2)).toFixed(1)}
                    </p>
                  </div>
                  <div className="ml-auto">
                    {(() => {
                      const bmi = Number(healthProfile.weight) / ((Number(healthProfile.height) / 100) ** 2);
                      if (bmi < 18.5) return <Badge variant="warning">Underweight</Badge>;
                      if (bmi < 25) return <Badge variant="success">Normal</Badge>;
                      if (bmi < 30) return <Badge variant="warning">Overweight</Badge>;
                      return <Badge variant="danger">Obese</Badge>;
                    })()}
                  </div>
                </div>
              </div>
            )}
          </div>
        </ProfileSection>

        {/* ── Chronic Conditions ── */}
        <ProfileSection icon={HeartPulse} iconColor="text-red-400" iconBg="bg-red-500/20"
          title="Medical Conditions" defaultOpen={false}>
          <div className="space-y-3">
            {editing && (
              <div className="flex gap-2">
                <input type="text" placeholder="e.g., Diabetes, Hypertension"
                  value={conditionInput}
                  onChange={e => setConditionInput(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && addCondition()}
                  className={inputClass} />
                <button onClick={addCondition}
                  className="px-3 py-2 bg-teal-500/20 text-teal-400 rounded-xl text-sm hover:bg-teal-500/30 transition-colors flex items-center gap-1">
                  <Plus size={14} /> Add
                </button>
              </div>
            )}
            {healthProfile.chronicConditions.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {healthProfile.chronicConditions.map((c, i) => (
                  <span key={i}
                    className={`px-3 py-1.5 rounded-xl text-sm flex items-center gap-2 border
                      ${editing ? 'bg-red-500/10 border-red-500/20 text-red-300 cursor-pointer hover:bg-red-500/20' : 'bg-slate-800/50 border-slate-700 text-slate-300'}`}
                    onClick={() => editing && removeCondition(i)}>
                    {c} {editing && <X size={12} />}
                  </span>
                ))}
              </div>
            ) : (
              <p className="text-sm text-slate-500">No conditions added</p>
            )}
          </div>
        </ProfileSection>

        {/* ── Current Doctors ── */}
        <ProfileSection icon={Stethoscope} iconColor="text-green-400" iconBg="bg-green-500/20"
          title="My Doctors" defaultOpen={false}>
          <div className="space-y-3">
            {editing && (
              <div className="p-4 bg-slate-800/30 rounded-xl space-y-3">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <input type="text" placeholder="Doctor name" value={doctorInput.name}
                    onChange={e => setDoctorInput(p => ({ ...p, name: e.target.value }))}
                    className={inputClass} />
                  <input type="text" placeholder="Specialty" value={doctorInput.specialty}
                    onChange={e => setDoctorInput(p => ({ ...p, specialty: e.target.value }))}
                    className={inputClass} />
                  <input type="tel" placeholder="Phone" value={doctorInput.phone}
                    onChange={e => setDoctorInput(p => ({ ...p, phone: e.target.value }))}
                    className={inputClass} />
                </div>
                <button onClick={addDoctor}
                  className="px-4 py-2 bg-teal-500/20 text-teal-400 rounded-xl text-sm hover:bg-teal-500/30 transition-colors flex items-center gap-1">
                  <Plus size={14} /> Add Doctor
                </button>
              </div>
            )}

            {healthProfile.currentDoctors.length > 0 ? (
              <div className="space-y-2">
                {healthProfile.currentDoctors.map((doc, i) => (
                  <div key={i} className="flex items-center justify-between p-3 bg-slate-800/50 rounded-xl border border-slate-700">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-green-500/15 flex items-center justify-center">
                        <Stethoscope size={14} className="text-green-400" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-white">{doc.name}</p>
                        <p className="text-xs text-slate-400">
                          {doc.specialty}{doc.phone ? ` · ${doc.phone}` : ''}
                        </p>
                      </div>
                    </div>
                    {editing && (
                      <button onClick={() => removeDoctor(i)}
                        className="text-red-400 hover:text-red-300 p-1">
                        <X size={14} />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-slate-500">No doctors added</p>
            )}
          </div>
        </ProfileSection>

        {/* ── Insurance ── */}
        <ProfileSection icon={ShieldCheck} iconColor="text-blue-400" iconBg="bg-blue-500/20"
          title="Insurance Information" defaultOpen={false}>
          <div className="grid gap-5 sm:grid-cols-2">
            <div>
              <label className={labelClass}>Provider</label>
              <input type="text" placeholder="Insurance provider" disabled={!editing}
                value={healthProfile.insuranceInfo.provider}
                onChange={e => handleInsuranceChange('provider', e.target.value)}
                className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>Policy Number</label>
              <input type="text" placeholder="Policy #" disabled={!editing}
                value={healthProfile.insuranceInfo.policyNumber}
                onChange={e => handleInsuranceChange('policyNumber', e.target.value)}
                className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>Valid Till</label>
              <input type="date" disabled={!editing}
                value={healthProfile.insuranceInfo.validTill}
                onChange={e => handleInsuranceChange('validTill', e.target.value)}
                className={inputClass} />
            </div>
          </div>
        </ProfileSection>

        {/* ── Lifestyle ── */}
        <ProfileSection icon={Dumbbell} iconColor="text-orange-400" iconBg="bg-orange-500/20"
          title="Lifestyle" defaultOpen={false}>
          <div className="space-y-5">
            {/* Smoking */}
            <div>
              <label className={labelClass}>Smoking Status</label>
              <div className="flex flex-wrap gap-2">
                {['never', 'former', 'current', 'occasional'].map(v => (
                  <ChoiceButton key={v} disabled={!editing}
                    selected={healthProfile.smokingStatus === v}
                    onClick={() => handleHealthChange('smokingStatus', v)}>
                    {v === 'never' && <Cigarette size={12} className="inline mr-1" />}
                    {v.charAt(0).toUpperCase() + v.slice(1)}
                  </ChoiceButton>
                ))}
              </div>
            </div>

            {/* Alcohol */}
            <div>
              <label className={labelClass}>Alcohol Use</label>
              <div className="flex flex-wrap gap-2">
                {['never', 'social', 'moderate', 'heavy'].map(v => (
                  <ChoiceButton key={v} disabled={!editing}
                    selected={healthProfile.alcoholUse === v}
                    onClick={() => handleHealthChange('alcoholUse', v)}>
                    {v === 'social' && <Wine size={12} className="inline mr-1" />}
                    {v.charAt(0).toUpperCase() + v.slice(1)}
                  </ChoiceButton>
                ))}
              </div>
            </div>

            {/* Activity Level */}
            <div>
              <label className={labelClass}>Activity Level</label>
              <div className="flex flex-wrap gap-2">
                {['sedentary', 'light', 'moderate', 'active', 'intense'].map(v => (
                  <ChoiceButton key={v} disabled={!editing}
                    selected={healthProfile.activityLevel === v}
                    onClick={() => handleHealthChange('activityLevel', v)}>
                    {v === 'active' && <Dumbbell size={12} className="inline mr-1" />}
                    {v.charAt(0).toUpperCase() + v.slice(1)}
                  </ChoiceButton>
                ))}
              </div>
            </div>

            {/* Diet */}
            <div>
              <label className={labelClass}>Dietary Preference</label>
              <div className="flex flex-wrap gap-2">
                {['vegetarian', 'non-vegetarian', 'vegan', 'keto', 'other'].map(v => (
                  <ChoiceButton key={v} disabled={!editing}
                    selected={healthProfile.dietaryPreference === v}
                    onClick={() => handleHealthChange('dietaryPreference', v)}>
                    {v === 'vegetarian' && <Utensils size={12} className="inline mr-1" />}
                    {v.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join('-')}
                  </ChoiceButton>
                ))}
              </div>
            </div>
          </div>
        </ProfileSection>

        {/* ── Save Button (floating) ── */}
        {editing && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="sticky bottom-20 md:bottom-6 z-40"
          >
            <div className="flex justify-center">
              <Button
                variant="gradient"
                leftIcon={<Save size={18} />}
                onClick={handleSaveProfile}
                loading={loading}
                className="shadow-xl shadow-teal-500/25 px-8"
              >
                Save All Changes
              </Button>
            </div>
          </motion.div>
        )}

        {/* ── Security ── */}
        <Card variant="default">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl bg-violet-500/20 flex items-center justify-center">
              <Shield size={20} className="text-violet-400" />
            </div>
            <h2 className="text-lg font-semibold text-white">Security</h2>
          </div>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-slate-800/50 rounded-xl">
              <div className="flex items-center gap-4">
                <Lock size={20} className="text-slate-400" />
                <div>
                  <p className="text-white font-medium">Password</p>
                  <p className="text-sm text-slate-400">Last updated 30 days ago</p>
                </div>
              </div>
              <Button variant="outline" size="sm" onClick={() => setShowPasswordModal(true)}>Change</Button>
            </div>
          </div>
        </Card>

        {/* ── Preferences ── */}
        <Card variant="default">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl bg-cyan-500/20 flex items-center justify-center">
              <Bell size={20} className="text-cyan-400" />
            </div>
            <h2 className="text-lg font-semibold text-white">Preferences</h2>
          </div>
          <div className="space-y-4">
            {[
              { key: 'notifications', icon: Bell, label: 'Push Notifications', desc: 'Get reminded to take your medicines' },
              { key: 'emailAlerts', icon: Mail, label: 'Email Alerts', desc: 'Receive weekly health reports' },
              { key: 'darkMode', icon: Moon, label: 'Dark Mode', desc: 'Use dark theme (always on)' }
            ].map((setting) => (
              <div key={setting.key} className="flex items-center justify-between p-4 bg-slate-800/50 rounded-xl">
                <div className="flex items-center gap-4">
                  <setting.icon size={20} className="text-slate-400" />
                  <div>
                    <p className="text-white font-medium">{setting.label}</p>
                    <p className="text-sm text-slate-400">{setting.desc}</p>
                  </div>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" checked={settings[setting.key]}
                    onChange={(e) => setSettings(prev => ({ ...prev, [setting.key]: e.target.checked }))}
                    className="sr-only peer" disabled={setting.key === 'darkMode'} />
                  <div className="w-11 h-6 bg-slate-600 rounded-full peer peer-checked:bg-teal-500 peer-disabled:opacity-50 after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:after:translate-x-full"></div>
                </label>
              </div>
            ))}
          </div>
        </Card>

        {/* ── Danger Zone ── */}
        <Card variant="default" className="border border-red-500/20">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl bg-red-500/20 flex items-center justify-center">
              <AlertCircle size={20} className="text-red-400" />
            </div>
            <h2 className="text-lg font-semibold text-red-400">Danger Zone</h2>
          </div>
          <div className="flex items-center justify-between p-4 bg-red-500/5 rounded-xl border border-red-500/10">
            <div>
              <p className="text-white font-medium">Delete Account</p>
              <p className="text-sm text-slate-400">Permanently delete your account and all data</p>
            </div>
            <Button variant="destructive" size="sm" leftIcon={<Trash2 size={16} />}
              onClick={() => setShowDeleteModal(true)}>Delete</Button>
          </div>
        </Card>
      </div>

      {/* Change Password Modal */}
      <Modal isOpen={showPasswordModal}
        onClose={() => {
          setShowPasswordModal(false);
          setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
          setPasswordError('');
        }}
        title="Change Password" size="md">
        <form onSubmit={handlePasswordChange}>
          <Modal.Content>
            {passwordError && (
              <div className="mb-4 p-4 bg-red-500/10 border border-red-500/20 rounded-xl flex items-center gap-3">
                <AlertCircle className="text-red-400" size={20} />
                <p className="text-red-400">{passwordError}</p>
              </div>
            )}
            <div className="space-y-4">
              <Input label="Current Password"
                type={showPasswords.current ? 'text' : 'password'}
                value={passwordForm.currentPassword}
                onChange={(e) => setPasswordForm(prev => ({ ...prev, currentPassword: e.target.value }))}
                leftIcon={<Lock size={18} />}
                rightIcon={
                  <button type="button" onClick={() => setShowPasswords(prev => ({ ...prev, current: !prev.current }))}
                    className="text-slate-400 hover:text-slate-300">
                    {showPasswords.current ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                }
                required />
              <Input label="New Password"
                type={showPasswords.new ? 'text' : 'password'}
                value={passwordForm.newPassword}
                onChange={(e) => setPasswordForm(prev => ({ ...prev, newPassword: e.target.value }))}
                leftIcon={<Lock size={18} />}
                rightIcon={
                  <button type="button" onClick={() => setShowPasswords(prev => ({ ...prev, new: !prev.new }))}
                    className="text-slate-400 hover:text-slate-300">
                    {showPasswords.new ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                }
                hint="Minimum 6 characters" required />
              <Input label="Confirm New Password"
                type={showPasswords.confirm ? 'text' : 'password'}
                value={passwordForm.confirmPassword}
                onChange={(e) => setPasswordForm(prev => ({ ...prev, confirmPassword: e.target.value }))}
                leftIcon={<Lock size={18} />}
                rightIcon={
                  <button type="button" onClick={() => setShowPasswords(prev => ({ ...prev, confirm: !prev.confirm }))}
                    className="text-slate-400 hover:text-slate-300">
                    {showPasswords.confirm ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                }
                required />
            </div>
          </Modal.Content>
          <Modal.Footer>
            <Button variant="outline" type="button" onClick={() => setShowPasswordModal(false)}>Cancel</Button>
            <Button variant="gradient" type="submit" loading={passwordLoading}>Update Password</Button>
          </Modal.Footer>
        </form>
      </Modal>

      {/* Delete Account Modal */}
      <Modal isOpen={showDeleteModal}
        onClose={() => { setShowDeleteModal(false); setDeleteConfirm(''); }}
        title="Delete Account" size="md">
        <Modal.Content>
          <div className="space-y-4">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-full bg-red-500/20 flex items-center justify-center flex-shrink-0">
                <AlertCircle className="text-red-400" size={24} />
              </div>
              <div>
                <p className="text-white font-medium mb-2">This action is irreversible</p>
                <p className="text-slate-400 text-sm">
                  Deleting your account will permanently remove all your data including medicines,
                  logs, and medical records. This cannot be undone.
                </p>
              </div>
            </div>
            <div className="p-4 bg-red-500/10 rounded-xl border border-red-500/20">
              <p className="text-sm text-slate-300 mb-2">
                Type <span className="font-mono font-bold text-red-400">DELETE</span> to confirm:
              </p>
              <Input value={deleteConfirm} onChange={(e) => setDeleteConfirm(e.target.value)}
                placeholder="DELETE" />
            </div>
          </div>
        </Modal.Content>
        <Modal.Footer>
          <Button variant="outline" onClick={() => setShowDeleteModal(false)}>Cancel</Button>
          <Button variant="destructive" disabled={deleteConfirm !== 'DELETE'}
            loading={deleteLoading} onClick={handleDeleteAccount}>Delete My Account</Button>
        </Modal.Footer>
      </Modal>
    </DashboardLayout>
  );
};

export default Profile;