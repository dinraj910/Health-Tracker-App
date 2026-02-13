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
  Trash2
} from 'lucide-react';
import DashboardLayout from '../../layouts/DashboardLayout';
import { Card, Button, Input, Modal, Badge, Loader } from '../../components/ui';
import { useAuth } from '../../context/AuthContext';
import { updateProfile, updatePassword, uploadAvatar, deleteAccount } from '../../services/userService';

const Profile = () => {
  const { user, updateUser } = useAuth();
  const fileInputRef = useRef(null);
  
  const [loading, setLoading] = useState(false);
  const [editing, setEditing] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [error, setError] = useState('');

  const [profile, setProfile] = useState({
    name: '',
    email: '',
    phone: '',
    dateOfBirth: '',
    avatar: ''
  });

  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false
  });
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [passwordError, setPasswordError] = useState('');

  const [deleteConfirm, setDeleteConfirm] = useState('');
  const [deleteLoading, setDeleteLoading] = useState(false);

  // Settings
  const [settings, setSettings] = useState({
    notifications: true,
    darkMode: true,
    emailAlerts: false
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
    }
  }, [user]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setProfile(prev => ({ ...prev, [name]: value }));
  };

  const handleAvatarClick = () => {
    fileInputRef.current?.click();
  };

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
      
      const data = await updateProfile({
        name: profile.name,
        phone: profile.phone,
        dateOfBirth: profile.dateOfBirth
      });
      
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
      // This will trigger logout
      window.location.href = '/login';
    } catch {
      setError('Failed to delete account');
    } finally {
      setDeleteLoading(false);
    }
  };

  const getInitials = (name) => {
    return name
      ?.split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase() || 'U';
  };

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

        {/* Profile Header Card */}
        <Card variant="gradient">
          <div className="flex flex-col sm:flex-row items-center gap-6">
            {/* Avatar */}
            <div className="relative group">
              <div 
                onClick={handleAvatarClick}
                className="w-28 h-28 rounded-full overflow-hidden cursor-pointer border-4 border-white/20 relative"
              >
                {profile.avatar ? (
                  <img 
                    src={profile.avatar} 
                    alt={profile.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-teal-400 to-cyan-500 flex items-center justify-center text-3xl font-bold text-white">
                    {getInitials(profile.name)}
                  </div>
                )}
                <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <Camera size={24} className="text-white" />
                </div>
              </div>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleAvatarChange}
                className="hidden"
              />
              <div className="absolute bottom-0 right-0 w-8 h-8 bg-teal-500 rounded-full flex items-center justify-center border-2 border-slate-900 cursor-pointer">
                <Camera size={14} className="text-white" />
              </div>
            </div>

            {/* User Info */}
            <div className="flex-1 text-center sm:text-left">
              <h1 className="text-2xl font-bold text-white mb-1">{profile.name || 'User'}</h1>
              <p className="text-slate-300">{profile.email}</p>
              <div className="flex flex-wrap gap-2 mt-3 justify-center sm:justify-start">
                <Badge variant="primary" dot>Active</Badge>
                <Badge variant="secondary">
                  Member since {user?.createdAt ? new Date(user.createdAt).getFullYear() : new Date().getFullYear()}
                </Badge>
              </div>
            </div>

            {/* Edit Button */}
            <Button 
              variant={editing ? 'ghost' : 'outline'} 
              leftIcon={editing ? <X size={18} /> : <Edit2 size={18} />}
              onClick={() => setEditing(!editing)}
            >
              {editing ? 'Cancel' : 'Edit'}
            </Button>
          </div>
        </Card>

        {/* Personal Information */}
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
            <Input
              label="Full Name"
              name="name"
              value={profile.name}
              onChange={handleInputChange}
              disabled={!editing}
              leftIcon={<User size={18} />}
            />
            <Input
              label="Email"
              name="email"
              type="email"
              value={profile.email}
              disabled
              leftIcon={<Mail size={18} />}
              hint="Email cannot be changed"
            />
            <Input
              label="Phone Number"
              name="phone"
              type="tel"
              value={profile.phone}
              onChange={handleInputChange}
              disabled={!editing}
              leftIcon={<Phone size={18} />}
              placeholder="Enter your phone number"
            />
            <Input
              label="Date of Birth"
              name="dateOfBirth"
              type="date"
              value={profile.dateOfBirth}
              onChange={handleInputChange}
              disabled={!editing}
              leftIcon={<Calendar size={18} />}
            />
          </div>

          {editing && (
            <div className="flex justify-end mt-6">
              <Button 
                variant="gradient" 
                leftIcon={<Save size={18} />}
                onClick={handleSaveProfile}
                loading={loading}
              >
                Save Changes
              </Button>
            </div>
          )}
        </Card>

        {/* Security */}
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
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => setShowPasswordModal(true)}
              >
                Change
              </Button>
            </div>
          </div>
        </Card>

        {/* Preferences */}
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
                  <input
                    type="checkbox"
                    checked={settings[setting.key]}
                    onChange={(e) => setSettings(prev => ({ ...prev, [setting.key]: e.target.checked }))}
                    className="sr-only peer"
                    disabled={setting.key === 'darkMode'}
                  />
                  <div className="w-11 h-6 bg-slate-600 rounded-full peer peer-checked:bg-teal-500 peer-disabled:opacity-50 after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:after:translate-x-full"></div>
                </label>
              </div>
            ))}
          </div>
        </Card>

        {/* Danger Zone */}
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
            <Button 
              variant="destructive" 
              size="sm"
              leftIcon={<Trash2 size={16} />}
              onClick={() => setShowDeleteModal(true)}
            >
              Delete
            </Button>
          </div>
        </Card>
      </div>

      {/* Change Password Modal */}
      <Modal
        isOpen={showPasswordModal}
        onClose={() => {
          setShowPasswordModal(false);
          setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
          setPasswordError('');
        }}
        title="Change Password"
        size="md"
      >
        <form onSubmit={handlePasswordChange}>
          <Modal.Content>
            {passwordError && (
              <div className="mb-4 p-4 bg-red-500/10 border border-red-500/20 rounded-xl flex items-center gap-3">
                <AlertCircle className="text-red-400" size={20} />
                <p className="text-red-400">{passwordError}</p>
              </div>
            )}

            <div className="space-y-4">
              <Input
                label="Current Password"
                type={showPasswords.current ? 'text' : 'password'}
                value={passwordForm.currentPassword}
                onChange={(e) => setPasswordForm(prev => ({ ...prev, currentPassword: e.target.value }))}
                leftIcon={<Lock size={18} />}
                rightIcon={
                  <button
                    type="button"
                    onClick={() => setShowPasswords(prev => ({ ...prev, current: !prev.current }))}
                    className="text-slate-400 hover:text-slate-300"
                  >
                    {showPasswords.current ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                }
                required
              />
              <Input
                label="New Password"
                type={showPasswords.new ? 'text' : 'password'}
                value={passwordForm.newPassword}
                onChange={(e) => setPasswordForm(prev => ({ ...prev, newPassword: e.target.value }))}
                leftIcon={<Lock size={18} />}
                rightIcon={
                  <button
                    type="button"
                    onClick={() => setShowPasswords(prev => ({ ...prev, new: !prev.new }))}
                    className="text-slate-400 hover:text-slate-300"
                  >
                    {showPasswords.new ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                }
                hint="Minimum 6 characters"
                required
              />
              <Input
                label="Confirm New Password"
                type={showPasswords.confirm ? 'text' : 'password'}
                value={passwordForm.confirmPassword}
                onChange={(e) => setPasswordForm(prev => ({ ...prev, confirmPassword: e.target.value }))}
                leftIcon={<Lock size={18} />}
                rightIcon={
                  <button
                    type="button"
                    onClick={() => setShowPasswords(prev => ({ ...prev, confirm: !prev.confirm }))}
                    className="text-slate-400 hover:text-slate-300"
                  >
                    {showPasswords.confirm ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                }
                required
              />
            </div>
          </Modal.Content>
          <Modal.Footer>
            <Button variant="outline" type="button" onClick={() => setShowPasswordModal(false)}>
              Cancel
            </Button>
            <Button 
              variant="gradient" 
              type="submit"
              loading={passwordLoading}
            >
              Update Password
            </Button>
          </Modal.Footer>
        </form>
      </Modal>

      {/* Delete Account Modal */}
      <Modal
        isOpen={showDeleteModal}
        onClose={() => {
          setShowDeleteModal(false);
          setDeleteConfirm('');
        }}
        title="Delete Account"
        size="md"
      >
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
              <Input
                value={deleteConfirm}
                onChange={(e) => setDeleteConfirm(e.target.value)}
                placeholder="DELETE"
              />
            </div>
          </div>
        </Modal.Content>
        <Modal.Footer>
          <Button variant="outline" onClick={() => setShowDeleteModal(false)}>
            Cancel
          </Button>
          <Button 
            variant="destructive"
            disabled={deleteConfirm !== 'DELETE'}
            loading={deleteLoading}
            onClick={handleDeleteAccount}
          >
            Delete My Account
          </Button>
        </Modal.Footer>
      </Modal>
    </DashboardLayout>
  );
};

export default Profile;