import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Plus, 
  Search, 
  Filter,
  Pill,
  Clock,
  Calendar,
  MoreVertical,
  Edit,
  Trash2,
  CheckCircle,
  XCircle,
  AlertCircle
} from 'lucide-react';
import DashboardLayout from '../../layouts/DashboardLayout';
import { Button, Card, Badge, Input, Modal, Loader } from '../../components/ui';
import { getMedicines, deleteMedicine } from '../../services/medicineService';

const Medicines = () => {
  const [medicines, setMedicines] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filter, setFilter] = useState('all'); // all, active, completed
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedMedicine, setSelectedMedicine] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  useEffect(() => {
    fetchMedicines();
  }, []);

  const fetchMedicines = async () => {
    try {
      setLoading(true);
      const data = await getMedicines();
      setMedicines(data.medicines || []);
    } catch (error) {
      console.error('Error fetching medicines:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteClick = (medicine) => {
    setSelectedMedicine(medicine);
    setShowDeleteModal(true);
  };

  const handleDeleteConfirm = async () => {
    if (!selectedMedicine) return;
    
    try {
      setDeleteLoading(true);
      await deleteMedicine(selectedMedicine._id);
      setMedicines(medicines.filter(m => m._id !== selectedMedicine._id));
      setShowDeleteModal(false);
      setSelectedMedicine(null);
    } catch (error) {
      console.error('Error deleting medicine:', error);
    } finally {
      setDeleteLoading(false);
    }
  };

  const filteredMedicines = medicines.filter(medicine => {
    const matchesSearch = medicine.name?.toLowerCase().includes(searchQuery.toLowerCase());
    const isActive = new Date(medicine.endDate) >= new Date() || !medicine.endDate;
    
    if (filter === 'active') return matchesSearch && isActive;
    if (filter === 'completed') return matchesSearch && !isActive;
    return matchesSearch;
  });

  const getStatusBadge = (medicine) => {
    const isActive = new Date(medicine.endDate) >= new Date() || !medicine.endDate;
    return isActive ? (
      <Badge variant="success" dot>Active</Badge>
    ) : (
      <Badge variant="warning">Completed</Badge>
    );
  };

  const formatTime = (timings) => {
    if (!timings || timings.length === 0) return 'Not set';
    return timings.join(', ');
  };

  return (
    <DashboardLayout title="My Medicines">
      <div className="space-y-6">
        {/* Header Actions */}
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
          <div className="flex-1 w-full sm:max-w-md">
            <Input
              placeholder="Search medicines..."
              leftIcon={<Search size={18} />}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          
          <div className="flex gap-3 w-full sm:w-auto">
            {/* Filter Tabs */}
            <div className="flex bg-slate-800 rounded-xl p-1">
              {['all', 'active', 'completed'].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setFilter(tab)}
                  className={`px-3 py-1.5 text-sm font-medium rounded-lg transition-all duration-200 capitalize ${
                    filter === tab 
                      ? 'bg-teal-500 text-white' 
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>
            
            <Link to="/medicines/add">
              <Button variant="gradient" leftIcon={<Plus size={18} />}>
                <span className="hidden sm:inline">Add Medicine</span>
                <span className="sm:hidden">Add</span>
              </Button>
            </Link>
          </div>
        </div>

        {/* Medicines List */}
        {loading ? (
          <div className="flex justify-center py-12">
            <Loader variant="spinner" size="lg" color="primary" text="Loading medicines..." />
          </div>
        ) : filteredMedicines.length === 0 ? (
          <Card variant="glass" className="text-center py-12">
            <div className="flex flex-col items-center gap-4">
              <div className="w-16 h-16 rounded-full bg-slate-700 flex items-center justify-center">
                <Pill size={32} className="text-slate-400" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-white mb-1">No medicines found</h3>
                <p className="text-slate-400">
                  {searchQuery ? 'Try a different search term' : 'Add your first medicine to get started'}
                </p>
              </div>
              {!searchQuery && (
                <Link to="/medicines/add">
                  <Button variant="gradient" leftIcon={<Plus size={18} />}>
                    Add Medicine
                  </Button>
                </Link>
              )}
            </div>
          </Card>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <AnimatePresence>
              {filteredMedicines.map((medicine, index) => (
                <motion.div
                  key={medicine._id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <Card variant="default" hover="lift" className="relative group">
                    {/* Status Badge */}
                    <div className="absolute top-4 right-4">
                      {getStatusBadge(medicine)}
                    </div>

                    {/* Medicine Icon */}
                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-teal-500/20 to-cyan-500/20 border border-teal-500/30 flex items-center justify-center mb-4">
                      <Pill size={24} className="text-teal-400" />
                    </div>

                    {/* Medicine Info */}
                    <h3 className="text-lg font-semibold text-white mb-1 pr-20">
                      {medicine.name}
                    </h3>
                    <p className="text-slate-400 text-sm mb-4">
                      {medicine.dosage}
                    </p>

                    {/* Details */}
                    <div className="space-y-2 mb-4">
                      <div className="flex items-center gap-2 text-sm text-slate-300">
                        <Clock size={16} className="text-slate-500" />
                        <span>{formatTime(medicine.timings)}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-slate-300">
                        <Calendar size={16} className="text-slate-500" />
                        <span>
                          {medicine.startDate 
                            ? new Date(medicine.startDate).toLocaleDateString() 
                            : 'No start date'}
                          {medicine.endDate && ` - ${new Date(medicine.endDate).toLocaleDateString()}`}
                        </span>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-2 pt-4 border-t border-slate-700">
                      <Link to={`/medicines/edit/${medicine._id}`} className="flex-1">
                        <Button variant="outline" size="sm" width="full" leftIcon={<Edit size={16} />}>
                          Edit
                        </Button>
                      </Link>
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => handleDeleteClick(medicine)}
                        className="text-red-400 hover:text-red-300 hover:bg-red-500/10"
                      >
                        <Trash2 size={16} />
                      </Button>
                    </div>
                  </Card>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}

        {/* Stats Summary */}
        {medicines.length > 0 && (
          <Card variant="glass" className="mt-6">
            <div className="flex flex-wrap gap-6 justify-center sm:justify-between text-center sm:text-left">
              <div>
                <p className="text-2xl font-bold text-white">{medicines.length}</p>
                <p className="text-sm text-slate-400">Total Medicines</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-green-400">
                  {medicines.filter(m => new Date(m.endDate) >= new Date() || !m.endDate).length}
                </p>
                <p className="text-sm text-slate-400">Active</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-amber-400">
                  {medicines.filter(m => m.endDate && new Date(m.endDate) < new Date()).length}
                </p>
                <p className="text-sm text-slate-400">Completed</p>
              </div>
            </div>
          </Card>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        title="Delete Medicine"
        size="sm"
      >
        <Modal.Content>
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-full bg-red-500/20 flex items-center justify-center flex-shrink-0">
              <AlertCircle className="text-red-400" size={24} />
            </div>
            <div>
              <p className="text-slate-300">
                Are you sure you want to delete <strong className="text-white">{selectedMedicine?.name}</strong>?
              </p>
              <p className="text-sm text-slate-400 mt-2">
                This action cannot be undone. All logs associated with this medicine will also be deleted.
              </p>
            </div>
          </div>
        </Modal.Content>
        <Modal.Footer>
          <Button variant="outline" onClick={() => setShowDeleteModal(false)}>
            Cancel
          </Button>
          <Button 
            variant="destructive" 
            onClick={handleDeleteConfirm}
            loading={deleteLoading}
          >
            Delete
          </Button>
        </Modal.Footer>
      </Modal>
    </DashboardLayout>
  );
};

export default Medicines;