import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  ArrowLeft,
  Pill,
  Clock,
  Calendar,
  Plus,
  X,
  Save,
  AlertCircle
} from 'lucide-react';
import DashboardLayout from '../../layouts/DashboardLayout';
import { Button, Card, Input, Badge } from '../../components/ui';
import { createMedicine } from '../../services/medicineService';

const AddMedicine = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [formData, setFormData] = useState({
    medicineName: '',
    dosage: '',
    frequency: 'once-daily',
    timings: [],
    startDate: '',
    endDate: '',
    instructions: '',
    prescribedBy: '',
    category: 'tablet',
    remindersEnabled: true
  });

  const [newTiming, setNewTiming] = useState('');
  const [errors, setErrors] = useState({});

  const frequencyOptions = [
    { value: 'once-daily', label: 'Once Daily' },
    { value: 'twice-daily', label: 'Twice Daily' },
    { value: 'thrice-daily', label: 'Three Times' },
    { value: 'weekly', label: 'Weekly' },
    { value: 'as-needed', label: 'As Needed' }
  ];

  const commonTimings = ['08:00', '12:00', '18:00', '21:00'];

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));

    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const addTiming = (time) => {
    if (time && !formData.timings.includes(time)) {
      setFormData(prev => ({
        ...prev,
        timings: [...prev.timings, time].sort()
      }));
    }
    setNewTiming('');
  };

  const removeTiming = (time) => {
    setFormData(prev => ({
      ...prev,
      timings: prev.timings.filter(t => t !== time)
    }));
  };

  const formatTime = (time) => {
    const [hours, minutes] = time.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const hour12 = hour % 12 || 12;
    return `${hour12}:${minutes} ${ampm}`;
  };

  const validate = () => {
    const newErrors = {};

    if (!formData.medicineName.trim()) {
      newErrors.medicineName = 'Medicine name is required';
    }

    if (!formData.dosage.trim()) {
      newErrors.dosage = 'Dosage is required';
    }

    if (formData.timings.length === 0) {
      newErrors.timings = 'At least one timing is required';
    }

    if (!formData.startDate) {
      newErrors.startDate = 'Start date is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validate()) return;

    try {
      setLoading(true);
      setError('');

      await createMedicine({
        medicineName: formData.medicineName,
        dosage: formData.dosage,
        frequency: formData.frequency,
        timings: formData.timings,
        startDate: formData.startDate,
        endDate: formData.endDate || undefined,
        instructions: formData.instructions || undefined,
        prescribedBy: formData.prescribedBy || undefined,
        category: formData.category,
        remindersEnabled: formData.remindersEnabled
      });

      navigate('/medicines', {
        state: { message: 'Medicine added successfully!' }
      });
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to add medicine. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <DashboardLayout title="Add Medicine">
      <div className="max-w-2xl mx-auto">
        {/* Back Button */}
        <Link to="/medicines" className="inline-flex items-center gap-2 text-slate-400 hover:text-white mb-6 transition-colors">
          <ArrowLeft size={20} />
          <span>Back to Medicines</span>
        </Link>

        <Card variant="default">
          <Card.Header>
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-teal-500/20 to-cyan-500/20 border border-teal-500/30 flex items-center justify-center">
                <Pill size={24} className="text-teal-400" />
              </div>
              <div>
                <Card.Title>Add New Medicine</Card.Title>
                <Card.Description>Enter the details of your medicine</Card.Description>
              </div>
            </div>
          </Card.Header>

          <Card.Content>
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-6 p-4 bg-red-500/10 border border-red-500/30 rounded-2xl flex items-center gap-3"
              >
                <AlertCircle className="text-red-400" size={20} />
                <p className="text-red-400">{error}</p>
              </motion.div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Medicine Name */}
              <Input
                label="Medicine Name"
                name="medicineName"
                placeholder="e.g., Vitamin D, Aspirin"
                value={formData.medicineName}
                onChange={handleChange}
                error={errors.medicineName}
                leftIcon={<Pill size={18} />}
                required
              />

              {/* Dosage */}
              <Input
                label="Dosage"
                name="dosage"
                placeholder="e.g., 500mg, 1 tablet, 2 capsules"
                value={formData.dosage}
                onChange={handleChange}
                error={errors.dosage}
                required
              />

              {/* Frequency */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-slate-200">
                  Frequency
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {frequencyOptions.map((option) => (
                    <button
                      key={option.value}
                      type="button"
                      onClick={() => setFormData(prev => ({ ...prev, frequency: option.value }))}
                      className={`px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${formData.frequency === option.value
                          ? 'bg-teal-500 text-white'
                          : 'bg-slate-800 text-slate-300 hover:bg-slate-700 border border-slate-600'
                        }`}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Timings */}
              <div className="space-y-3">
                <label className="block text-sm font-medium text-slate-200">
                  Timings <span className="text-red-400">*</span>
                </label>

                {/* Quick Select */}
                <div className="flex flex-wrap gap-2">
                  {commonTimings.map((time) => (
                    <button
                      key={time}
                      type="button"
                      onClick={() => addTiming(time)}
                      disabled={formData.timings.includes(time)}
                      className={`px-3 py-1.5 rounded-lg text-sm transition-all duration-200 ${formData.timings.includes(time)
                          ? 'bg-teal-500/20 text-teal-400 border border-teal-500/30'
                          : 'bg-slate-800 text-slate-300 hover:bg-slate-700 border border-slate-600'
                        }`}
                    >
                      {formatTime(time)}
                    </button>
                  ))}
                </div>

                {/* Custom Time Input */}
                <div className="flex gap-2">
                  <Input
                    type="time"
                    value={newTiming}
                    onChange={(e) => setNewTiming(e.target.value)}
                    placeholder="Add custom time"
                    leftIcon={<Clock size={18} />}
                    className="flex-1"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => addTiming(newTiming)}
                    disabled={!newTiming}
                  >
                    <Plus size={18} />
                  </Button>
                </div>

                {/* Selected Timings */}
                {formData.timings.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-2">
                    {formData.timings.map((time) => (
                      <Badge
                        key={time}
                        variant="primary"
                        removable
                        onRemove={() => removeTiming(time)}
                      >
                        {formatTime(time)}
                      </Badge>
                    ))}
                  </div>
                )}

                {errors.timings && (
                  <p className="text-sm text-red-400 flex items-center gap-2">
                    <AlertCircle size={16} />
                    {errors.timings}
                  </p>
                )}
              </div>

              {/* Dates */}
              <div className="grid sm:grid-cols-2 gap-4">
                <Input
                  label="Start Date"
                  type="date"
                  name="startDate"
                  value={formData.startDate}
                  onChange={handleChange}
                  error={errors.startDate}
                  leftIcon={<Calendar size={18} />}
                  required
                />
                <Input
                  label="End Date (Optional)"
                  type="date"
                  name="endDate"
                  value={formData.endDate}
                  onChange={handleChange}
                  leftIcon={<Calendar size={18} />}
                  helperText="Leave empty for ongoing medication"
                />
              </div>

              {/* Notes */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-slate-200">
                  Instructions (Optional)
                </label>
                <textarea
                  name="instructions"
                  value={formData.instructions}
                  onChange={handleChange}
                  placeholder="e.g., Take with food, avoid dairy"
                  rows={3}
                  className="w-full px-4 py-3 rounded-2xl bg-slate-800 border border-slate-600 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent resize-none"
                />
              </div>

              {/* Reminders Toggle */}
              <div className="flex items-center justify-between p-4 bg-slate-800/50 rounded-2xl border border-slate-700">
                <div>
                  <h4 className="text-white font-medium">Enable Reminders</h4>
                  <p className="text-sm text-slate-400">Get notified when it's time to take this medicine</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    name="remindersEnabled"
                    checked={formData.remindersEnabled}
                    onChange={handleChange}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-slate-700 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-teal-500 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-teal-500"></div>
                </label>
              </div>

              {/* Submit Buttons */}
              <div className="flex gap-4 pt-4">
                <Link to="/medicines" className="flex-1">
                  <Button variant="outline" width="full" type="button">
                    Cancel
                  </Button>
                </Link>
                <Button
                  variant="gradient"
                  width="full"
                  type="submit"
                  loading={loading}
                  leftIcon={<Save size={18} />}
                  className="flex-1"
                >
                  Save Medicine
                </Button>
              </div>
            </form>
          </Card.Content>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default AddMedicine;