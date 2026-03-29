import { useState, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ScanLine,
  Upload,
  X,
  Loader2,
  Pill,
  CheckCircle2,
  AlertCircle,
  Clock,
  FileImage,
  Sparkles,
  Plus,
  ChevronDown,
  ChevronUp,
  ClipboardList,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import DashboardLayout from "../../layouts/DashboardLayout";
import usePageTitle from "../../hooks/usePageTitle";

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:5000";

// ——————————————————————————————————————————
// Sub-components
// ——————————————————————————————————————————

function UploadZone({ onFileSelect, preview, onClear, isLoading }) {
  const inputRef = useRef(null);
  const [dragging, setDragging] = useState(false);

  const handleDrop = useCallback(
    (e) => {
      e.preventDefault();
      setDragging(false);
      const file = e.dataTransfer.files?.[0];
      if (file && file.type.startsWith("image/")) {
        onFileSelect(file);
      }
    },
    [onFileSelect]
  );

  return (
    <div className="relative">
      {preview ? (
        <motion.div
          initial={{ opacity: 0, scale: 0.97 }}
          animate={{ opacity: 1, scale: 1 }}
          className="relative rounded-2xl overflow-hidden border-2 border-teal-500/40"
        >
          <img
            src={preview}
            alt="Prescription preview"
            className="w-full max-h-72 object-contain bg-slate-950"
          />
          {!isLoading && (
            <button
              onClick={onClear}
              className="absolute top-3 right-3 bg-slate-900/80 hover:bg-red-500/80 text-white rounded-full p-1.5 transition-colors"
            >
              <X size={16} />
            </button>
          )}
        </motion.div>
      ) : (
        <motion.div
          onDragOver={(e) => {
            e.preventDefault();
            setDragging(true);
          }}
          onDragLeave={() => setDragging(false)}
          onDrop={handleDrop}
          onClick={() => inputRef.current?.click()}
          animate={{
            borderColor: dragging ? "rgb(20,184,166)" : "rgb(71,85,105)",
            backgroundColor: dragging ? "rgba(20,184,166,0.05)" : "rgba(0,0,0,0)",
          }}
          className="border-2 border-dashed rounded-2xl p-10 flex flex-col items-center gap-4 cursor-pointer transition-all hover:border-teal-500/60 hover:bg-teal-500/5"
        >
          <div className="w-16 h-16 bg-gradient-to-br from-teal-500/20 to-cyan-500/20 rounded-2xl flex items-center justify-center">
            <FileImage size={32} className="text-teal-400" />
          </div>
          <div className="text-center">
            <p className="text-white font-semibold text-base">
              Drop your prescription here
            </p>
            <p className="text-slate-400 text-sm mt-1">
              or click to browse · PNG, JPG, WEBP up to 10 MB
            </p>
          </div>
          <div className="flex items-center gap-1.5 text-xs text-teal-400 bg-teal-500/10 px-3 py-1.5 rounded-full">
            <Sparkles size={12} />
            Powered by Gemini AI Vision
          </div>
        </motion.div>
      )}
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        capture="environment"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) onFileSelect(file);
        }}
      />
    </div>
  );
}

function MedicineCard({ medicine, index }) {
  const navigate = useNavigate();
  const [expanded, setExpanded] = useState(false);

  const fields = [
    { label: "Dosage", value: medicine.dosage },
    { label: "Frequency", value: medicine.frequency },
    { label: "Duration", value: medicine.duration },
    { label: "Instructions", value: medicine.instructions },
    { label: "Quantity", value: medicine.quantity },
  ].filter((f) => f.value && f.value !== "Not specified");

  const handleAddToTracker = () => {
    navigate("/medicines/add", {
      state: {
        prefill: {
          name: medicine.name,
          dosage: medicine.dosage !== "Not specified" ? medicine.dosage : "",
          frequency: medicine.frequency !== "Not specified" ? medicine.frequency : "",
          notes: [medicine.instructions, medicine.duration]
            .filter((v) => v && v !== "Not specified")
            .join(" · "),
        },
      },
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.07 }}
      className="bg-slate-800/60 border border-slate-700/60 rounded-2xl overflow-hidden"
    >
      <div
        className="flex items-center gap-3 p-4 cursor-pointer"
        onClick={() => setExpanded((v) => !v)}
      >
        <div className="w-9 h-9 bg-gradient-to-br from-teal-500/20 to-cyan-500/20 rounded-xl flex items-center justify-center flex-shrink-0">
          <Pill size={18} className="text-teal-400" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-white font-semibold truncate">{medicine.name}</p>
          <p className="text-slate-400 text-xs mt-0.5">
            {[medicine.dosage, medicine.frequency]
              .filter((v) => v && v !== "Not specified")
              .join(" · ") || "See details"}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleAddToTracker();
            }}
            className="flex items-center gap-1.5 bg-teal-500 hover:bg-teal-400 text-slate-900 text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors"
          >
            <Plus size={13} />
            Add
          </button>
          {expanded ? (
            <ChevronUp size={16} className="text-slate-500" />
          ) : (
            <ChevronDown size={16} className="text-slate-500" />
          )}
        </div>
      </div>

      <AnimatePresence>
        {expanded && fields.length > 0 && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="border-t border-slate-700/60 overflow-hidden"
          >
            <div className="grid grid-cols-2 gap-3 p-4">
              {fields.map((f) => (
                <div key={f.label}>
                  <p className="text-slate-500 text-xs">{f.label}</p>
                  <p className="text-slate-200 text-sm font-medium mt-0.5">{f.value}</p>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

// ——————————————————————————————————————————
// Main Page
// ——————————————————————————————————————————

export default function PrescriptionScanner() {
  usePageTitle('Prescription Scanner');
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState(null); // { medicines, message }
  const [error, setError] = useState(null);

  const handleFileSelect = (f) => {
    setFile(f);
    setPreview(URL.createObjectURL(f));
    setResult(null);
    setError(null);
  };

  const handleClear = () => {
    setFile(null);
    setPreview(null);
    setResult(null);
    setError(null);
  };

  const handleScan = async () => {
    if (!file) return;
    setIsLoading(true);
    setError(null);
    setResult(null);

    try {
      const formData = new FormData();
      formData.append("prescription", file);

      const { data } = await axios.post(
        `${API_BASE}/api/prescription/scan`,
        formData,
        {
          withCredentials: true,
          headers: { "Content-Type": "multipart/form-data" },
        }
      );

      setResult(data);
    } catch (err) {
      const msg =
        err.response?.data?.message ||
        "Failed to scan the prescription. Please try again with a clearer image.";
      setError(msg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <DashboardLayout title="Prescription Scanner">
      <div className="max-w-2xl mx-auto px-4 py-8 space-y-6">
        {/* Header */}
        <div>
          <div className="flex items-center gap-3 mb-1">
            <div className="w-10 h-10 bg-gradient-to-br from-teal-500 to-cyan-400 rounded-2xl flex items-center justify-center shadow-lg shadow-teal-500/20">
              <ScanLine size={22} className="text-slate-900" />
            </div>
            <h1 className="text-2xl font-bold text-white">Prescription Scanner</h1>
          </div>
          <p className="text-slate-400 text-sm ml-[52px]">
            Upload a photo of any handwritten prescription — our AI will decode
            it and list all the medicines for you.
          </p>
        </div>

        {/* Privacy notice */}
        <div className="flex items-start gap-3 bg-slate-800/50 border border-slate-700/50 rounded-xl p-4">
          <CheckCircle2 size={18} className="text-teal-400 mt-0.5 flex-shrink-0" />
          <p className="text-slate-300 text-sm">
            <span className="font-semibold text-white">Your privacy is protected.</span>{" "}
            The prescription image is analyzed in memory and{" "}
            <span className="text-teal-400 font-medium">never saved</span> to our
            servers or database.
          </p>
        </div>

        {/* Upload zone */}
        <UploadZone
          onFileSelect={handleFileSelect}
          preview={preview}
          onClear={handleClear}
          isLoading={isLoading}
        />

        {/* Scan button */}
        {file && !isLoading && !result && (
          <motion.button
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            onClick={handleScan}
            className="w-full flex items-center justify-center gap-2.5 bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-400 hover:to-cyan-400 text-slate-900 font-bold py-3.5 rounded-2xl transition-all shadow-lg shadow-teal-500/25 hover:shadow-teal-500/40 active:scale-[0.98]"
          >
            <ScanLine size={20} />
            Scan Prescription
          </motion.button>
        )}

        {/* Loading */}
        <AnimatePresence>
          {isLoading && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col items-center gap-4 py-10"
            >
              <div className="relative">
                <div className="w-16 h-16 bg-teal-500/10 rounded-full flex items-center justify-center">
                  <Loader2 size={32} className="text-teal-400 animate-spin" />
                </div>
                <motion.div
                  animate={{ scale: [1, 1.4, 1], opacity: [0.4, 0, 0.4] }}
                  transition={{ repeat: Infinity, duration: 2 }}
                  className="absolute inset-0 bg-teal-500/20 rounded-full"
                />
              </div>
              <div className="text-center">
                <p className="text-white font-semibold">AI is reading your prescription…</p>
                <p className="text-slate-400 text-sm mt-1">
                  Gemini Vision is decoding the handwriting
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Error */}
        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="flex items-start gap-3 bg-red-500/10 border border-red-500/30 rounded-2xl p-4"
            >
              <AlertCircle size={18} className="text-red-400 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-red-300 font-semibold text-sm">Scan failed</p>
                <p className="text-red-400/80 text-sm mt-0.5">{error}</p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Results */}
        <AnimatePresence>
          {result && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="space-y-4"
            >
              {/* Result header */}
              <div className="flex items-center gap-3">
                <ClipboardList size={18} className="text-teal-400" />
                <h2 className="text-white font-semibold">
                  {result.medicines?.length > 0
                    ? `${result.medicines.length} Medicine${result.medicines.length > 1 ? "s" : ""} Found`
                    : "No Medicines Found"}
                </h2>
              </div>

              {result.medicines?.length === 0 ? (
                <div className="text-center py-10 text-slate-500">
                  <Pill size={36} className="mx-auto mb-3 opacity-30" />
                  <p className="text-sm">{result.message}</p>
                  <p className="text-xs mt-1">
                    Try taking a clearer, well-lit photo of the prescription.
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {result.medicines.map((med, i) => (
                    <MedicineCard key={i} medicine={med} index={i} />
                  ))}
                </div>
              )}

              {/* Tip */}
              <div className="flex items-start gap-2.5 bg-slate-800/40 border border-slate-700/40 rounded-xl p-3.5 mt-2">
                <Clock size={15} className="text-slate-500 mt-0.5 flex-shrink-0" />
                <p className="text-slate-500 text-xs leading-relaxed">
                  Always verify the extracted information with your doctor or pharmacist before
                  taking any medication.
                </p>
              </div>

              {/* Scan again */}
              <button
                onClick={handleClear}
                className="w-full flex items-center justify-center gap-2 border border-slate-600 hover:border-teal-500/50 text-slate-400 hover:text-white py-3 rounded-2xl text-sm font-medium transition-all"
              >
                <Upload size={16} />
                Scan Another Prescription
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </DashboardLayout>
  );
}
