import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Plus, 
  Search, 
  FileText,
  Image,
  File,
  Trash2,
  Download,
  Eye,
  Upload,
  AlertCircle,
  Calendar,
  Filter
} from 'lucide-react';
import DashboardLayout from '../../layouts/DashboardLayout';
import { Button, Card, Badge, Input, Modal, Loader } from '../../components/ui';
import { getRecords, deleteRecord, uploadRecord } from '../../services/recordService';

const Records = () => {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [uploadLoading, setUploadLoading] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  
  const fileInputRef = useRef(null);
  const [uploadForm, setUploadForm] = useState({
    file: null,
    description: '',
    type: 'prescription'
  });

  const recordTypes = [
    { value: 'prescription', label: 'Prescription', icon: FileText, color: 'teal' },
    { value: 'lab-report', label: 'Lab Report', icon: File, color: 'violet' },
    { value: 'scan', label: 'Scan/X-Ray', icon: Image, color: 'blue' },
    { value: 'other', label: 'Other', icon: File, color: 'slate' }
  ];

  useEffect(() => {
    fetchRecords();
  }, []);

  const fetchRecords = async () => {
    try {
      setLoading(true);
      const data = await getRecords();
      setRecords(data.records || []);
    } catch (error) {
      console.error('Error fetching records:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      setUploadForm(prev => ({ ...prev, file }));
    }
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!uploadForm.file) return;

    try {
      setUploadLoading(true);
      const formData = new FormData();
      formData.append('file', uploadForm.file);
      formData.append('description', uploadForm.description);
      formData.append('type', uploadForm.type);

      const data = await uploadRecord(formData);
      setRecords([data.record, ...records]);
      setShowUploadModal(false);
      setUploadForm({ file: null, description: '', type: 'prescription' });
    } catch (error) {
      console.error('Error uploading record:', error);
    } finally {
      setUploadLoading(false);
    }
  };

  const handleDeleteClick = (record) => {
    setSelectedRecord(record);
    setShowDeleteModal(true);
  };

  const handleDeleteConfirm = async () => {
    if (!selectedRecord) return;

    try {
      setDeleteLoading(true);
      await deleteRecord(selectedRecord._id);
      setRecords(records.filter(r => r._id !== selectedRecord._id));
      setShowDeleteModal(false);
      setSelectedRecord(null);
    } catch (error) {
      console.error('Error deleting record:', error);
    } finally {
      setDeleteLoading(false);
    }
  };

  const handlePreview = (record) => {
    setSelectedRecord(record);
    setShowPreviewModal(true);
  };

  const filteredRecords = records.filter(record => {
    const matchesSearch = 
      record.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      record.type?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = filterType === 'all' || record.type === filterType;
    return matchesSearch && matchesFilter;
  });

  const getRecordIcon = (type) => {
    const recordType = recordTypes.find(t => t.value === type);
    return recordType?.icon || File;
  };

  const getRecordColor = (type) => {
    const recordType = recordTypes.find(t => t.value === type);
    return recordType?.color || 'slate';
  };

  const formatFileSize = (bytes) => {
    if (!bytes) return 'Unknown size';
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  return (
    <DashboardLayout title="Medical Records">
      <div className="space-y-6">
        {/* Header Actions */}
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
          <div className="flex-1 w-full sm:max-w-md">
            <Input
              placeholder="Search records..."
              leftIcon={<Search size={18} />}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <div className="flex gap-3 w-full sm:w-auto">
            {/* Filter */}
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="px-4 py-2 bg-slate-800 border border-slate-600 rounded-xl text-white text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
            >
              <option value="all">All Types</option>
              {recordTypes.map(type => (
                <option key={type.value} value={type.value}>{type.label}</option>
              ))}
            </select>

            <Button 
              variant="gradient" 
              leftIcon={<Plus size={18} />}
              onClick={() => setShowUploadModal(true)}
            >
              <span className="hidden sm:inline">Upload Record</span>
              <span className="sm:hidden">Upload</span>
            </Button>
          </div>
        </div>

        {/* Records Grid */}
        {loading ? (
          <div className="flex justify-center py-12">
            <Loader variant="spinner" size="lg" color="primary" text="Loading records..." />
          </div>
        ) : filteredRecords.length === 0 ? (
          <Card variant="glass" className="text-center py-12">
            <div className="flex flex-col items-center gap-4">
              <div className="w-16 h-16 rounded-full bg-slate-700 flex items-center justify-center">
                <FileText size={32} className="text-slate-400" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-white mb-1">No records found</h3>
                <p className="text-slate-400">
                  {searchQuery ? 'Try a different search term' : 'Upload your first medical record'}
                </p>
              </div>
              {!searchQuery && (
                <Button 
                  variant="gradient" 
                  leftIcon={<Upload size={18} />}
                  onClick={() => setShowUploadModal(true)}
                >
                  Upload Record
                </Button>
              )}
            </div>
          </Card>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <AnimatePresence>
              {filteredRecords.map((record, index) => {
                const Icon = getRecordIcon(record.type);
                const color = getRecordColor(record.type);

                return (
                  <motion.div
                    key={record._id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    transition={{ delay: index * 0.05 }}
                  >
                    <Card variant="default" hover="lift" className="relative group">
                      {/* Preview Area */}
                      <div 
                        className={`h-32 rounded-2xl mb-4 flex items-center justify-center cursor-pointer bg-gradient-to-br from-${color}-500/10 to-${color}-500/5 border border-${color}-500/20`}
                        onClick={() => handlePreview(record)}
                      >
                        {record.fileUrl?.match(/\.(jpg|jpeg|png|gif)$/i) ? (
                          <img 
                            src={record.fileUrl} 
                            alt={record.description}
                            className="w-full h-full object-cover rounded-2xl"
                          />
                        ) : (
                          <Icon size={48} className={`text-${color}-400`} />
                        )}
                      </div>

                      {/* Info */}
                      <div className="mb-4">
                        <div className="flex items-center gap-2 mb-2">
                          <Badge variant={color === 'teal' ? 'primary' : color === 'violet' ? 'violet' : 'info'}>
                            {recordTypes.find(t => t.value === record.type)?.label || record.type}
                          </Badge>
                        </div>
                        <h3 className="font-semibold text-white truncate">
                          {record.description || 'Untitled Record'}
                        </h3>
                        <div className="flex items-center gap-2 text-sm text-slate-400 mt-1">
                          <Calendar size={14} />
                          <span>{new Date(record.createdAt).toLocaleDateString()}</span>
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex gap-2 pt-4 border-t border-slate-700">
                        <Button 
                          variant="outline" 
                          size="sm" 
                          width="full"
                          leftIcon={<Eye size={16} />}
                          onClick={() => handlePreview(record)}
                        >
                          View
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteClick(record)}
                          className="text-red-400 hover:text-red-300 hover:bg-red-500/10"
                        >
                          <Trash2 size={16} />
                        </Button>
                      </div>
                    </Card>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        )}

        {/* Stats */}
        {records.length > 0 && (
          <Card variant="glass">
            <div className="flex flex-wrap gap-6 justify-center sm:justify-between text-center sm:text-left">
              <div>
                <p className="text-2xl font-bold text-white">{records.length}</p>
                <p className="text-sm text-slate-400">Total Records</p>
              </div>
              {recordTypes.map(type => (
                <div key={type.value}>
                  <p className="text-2xl font-bold text-white">
                    {records.filter(r => r.type === type.value).length}
                  </p>
                  <p className="text-sm text-slate-400">{type.label}s</p>
                </div>
              ))}
            </div>
          </Card>
        )}
      </div>

      {/* Upload Modal */}
      <Modal
        isOpen={showUploadModal}
        onClose={() => setShowUploadModal(false)}
        title="Upload Medical Record"
        size="lg"
      >
        <form onSubmit={handleUpload}>
          <Modal.Content>
            <div className="space-y-4">
              {/* File Upload */}
              <div
                onClick={() => fileInputRef.current?.click()}
                className={`border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-all duration-200 ${
                  uploadForm.file 
                    ? 'border-teal-500 bg-teal-500/10' 
                    : 'border-slate-600 hover:border-slate-500'
                }`}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".pdf,.jpg,.jpeg,.png,.gif"
                  onChange={handleFileSelect}
                  className="hidden"
                />
                {uploadForm.file ? (
                  <div className="flex flex-col items-center gap-2">
                    <FileText size={48} className="text-teal-400" />
                    <p className="text-white font-medium">{uploadForm.file.name}</p>
                    <p className="text-sm text-slate-400">{formatFileSize(uploadForm.file.size)}</p>
                  </div>
                ) : (
                  <div className="flex flex-col items-center gap-2">
                    <Upload size={48} className="text-slate-400" />
                    <p className="text-white">Click to upload or drag and drop</p>
                    <p className="text-sm text-slate-400">PDF, PNG, JPG up to 10MB</p>
                  </div>
                )}
              </div>

              {/* Record Type */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-slate-200">
                  Record Type
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {recordTypes.map(type => {
                    const Icon = type.icon;
                    return (
                      <button
                        key={type.value}
                        type="button"
                        onClick={() => setUploadForm(prev => ({ ...prev, type: type.value }))}
                        className={`flex items-center gap-3 p-3 rounded-xl text-left transition-all duration-200 ${
                          uploadForm.type === type.value
                            ? 'bg-teal-500 text-white'
                            : 'bg-slate-800 text-slate-300 hover:bg-slate-700 border border-slate-600'
                        }`}
                      >
                        <Icon size={20} />
                        <span className="text-sm font-medium">{type.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Description */}
              <Input
                label="Description"
                placeholder="Brief description of the record..."
                value={uploadForm.description}
                onChange={(e) => setUploadForm(prev => ({ ...prev, description: e.target.value }))}
              />
            </div>
          </Modal.Content>
          <Modal.Footer>
            <Button variant="outline" type="button" onClick={() => setShowUploadModal(false)}>
              Cancel
            </Button>
            <Button 
              variant="gradient" 
              type="submit"
              disabled={!uploadForm.file}
              loading={uploadLoading}
              leftIcon={<Upload size={18} />}
            >
              Upload
            </Button>
          </Modal.Footer>
        </form>
      </Modal>

      {/* Delete Modal */}
      <Modal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        title="Delete Record"
        size="sm"
      >
        <Modal.Content>
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-full bg-red-500/20 flex items-center justify-center flex-shrink-0">
              <AlertCircle className="text-red-400" size={24} />
            </div>
            <div>
              <p className="text-slate-300">
                Are you sure you want to delete this record?
              </p>
              <p className="text-sm text-slate-400 mt-2">
                This action cannot be undone.
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

      {/* Preview Modal */}
      <Modal
        isOpen={showPreviewModal}
        onClose={() => setShowPreviewModal(false)}
        title={selectedRecord?.description || 'Record Preview'}
        size="4xl"
      >
        <Modal.Content>
          {selectedRecord?.fileUrl?.match(/\.(jpg|jpeg|png|gif)$/i) ? (
            <img 
              src={selectedRecord.fileUrl}
              alt={selectedRecord.description}
              className="w-full rounded-2xl"
            />
          ) : selectedRecord?.fileUrl?.match(/\.pdf$/i) ? (
            <iframe
              src={selectedRecord.fileUrl}
              className="w-full h-96 rounded-2xl"
              title="PDF Preview"
            />
          ) : (
            <div className="text-center py-12">
              <FileText size={64} className="text-slate-400 mx-auto mb-4" />
              <p className="text-slate-400">Preview not available</p>
              <a 
                href={selectedRecord?.fileUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-teal-400 hover:underline mt-2 inline-block"
              >
                Download to view
              </a>
            </div>
          )}
        </Modal.Content>
      </Modal>
    </DashboardLayout>
  );
};

export default Records;