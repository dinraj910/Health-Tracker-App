import { useState, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search,
  Pill,
  AlertTriangle,
  Info,
  Shield,
  Beaker,
  ChevronRight,
  X,
  Loader2,
  Stethoscope,
  BookOpen,
  Heart,
  Syringe,
  Tablets,
} from 'lucide-react';
import DashboardLayout from '../../layouts/DashboardLayout';
import { Card, Badge, Button, Input } from '../../components/ui';
import { searchDrugs, getDrugDetails } from '../../services/drugService';
import usePageTitle from '../../hooks/usePageTitle';

const QUICK_CATEGORIES = [
  { label: 'Pain Relief', query: 'pain relief', icon: Heart, color: 'text-red-400' },
  { label: 'Antibiotic', query: 'antibiotic', icon: Shield, color: 'text-green-400' },
  { label: 'Diabetes', query: 'diabetes', icon: Beaker, color: 'text-amber-400' },
  { label: 'Blood Pressure', query: 'hypertension', icon: Stethoscope, color: 'text-blue-400' },
  { label: 'Allergy', query: 'allergy', icon: AlertTriangle, color: 'text-violet-400' },
  { label: 'Vitamin', query: 'vitamin', icon: Tablets, color: 'text-orange-400' },
];

function DrugDatabase() {
  usePageTitle('Medicine Database');
  const [query, setQuery] = useState('');
  const [drugs, setDrugs] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [selectedDrug, setSelectedDrug] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [page, setPage] = useState(0);
  const searchTimeout = useRef(null);

  const handleSearch = useCallback(async (searchQuery, skip = 0) => {
    if (!searchQuery || searchQuery.trim().length < 2) return;

    try {
      setLoading(true);
      setSearched(true);
      const res = await searchDrugs(searchQuery, 20, skip);
      const drugList = res.data?.drugs || res.drugs || [];
      setDrugs(skip > 0 ? prev => [...prev, ...drugList] : drugList);
      setTotal(res.data?.total || res.total || 0);
      setPage(skip);
    } catch (error) {
      console.error('Drug search error:', error);
      setDrugs([]);
    } finally {
      setLoading(false);
    }
  }, []);

  const handleInputChange = (e) => {
    const val = e.target.value;
    setQuery(val);

    if (searchTimeout.current) clearTimeout(searchTimeout.current);
    if (val.trim().length >= 2) {
      searchTimeout.current = setTimeout(() => handleSearch(val), 500);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (searchTimeout.current) clearTimeout(searchTimeout.current);
    handleSearch(query);
  };

  const handleCategoryClick = (catQuery) => {
    setQuery(catQuery);
    handleSearch(catQuery);
  };

  const handleViewDetails = async (drug) => {
    try {
      setDetailLoading(true);
      setSelectedDrug(drug); // show immediately with basic data
      if (drug.id) {
        const res = await getDrugDetails(drug.id);
        const detailed = res.data?.drug || res.drug;
        if (detailed) {
          setSelectedDrug(detailed);
        }
      }
    } catch (error) {
      console.error('Drug detail error:', error);
    } finally {
      setDetailLoading(false);
    }
  };

  const handleLoadMore = () => {
    handleSearch(query, page + 20);
  };

  const truncateText = (text, maxLen = 200) => {
    if (!text) return '';
    const str = Array.isArray(text) ? text[0] : text;
    if (!str) return '';
    return str.length > maxLen ? str.substring(0, maxLen) + '...' : str;
  };

  return (
    <DashboardLayout title="Medicine Database">
      <div className="space-y-6">

        {/* Header */}
        <div>
          <h1 className="text-xl font-bold text-white flex items-center gap-2">
            <BookOpen className="text-teal-400" size={22} />
            Medicine Database
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Search 100,000+ FDA-approved drugs — view uses, dosages, warnings, and more
          </p>
        </div>

        {/* Search Bar */}
        <form onSubmit={handleSubmit}>
          <div className="relative">
            <Search size={20} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search any medicine (e.g. Aspirin, Metformin, Amoxicillin)..."
              value={query}
              onChange={handleInputChange}
              className="w-full pl-12 pr-4 py-3.5 bg-slate-800/80 border border-slate-700 rounded-2xl text-white placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all"
            />
            {loading && (
              <Loader2 size={20} className="absolute right-4 top-1/2 -translate-y-1/2 text-teal-400 animate-spin" />
            )}
          </div>
        </form>

        {/* Quick Categories */}
        {!searched && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-3"
          >
            <p className="text-xs font-medium text-slate-400 uppercase tracking-wider">Quick Browse</p>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2">
              {QUICK_CATEGORIES.map(cat => {
                const Icon = cat.icon;
                return (
                  <button
                    key={cat.label}
                    onClick={() => handleCategoryClick(cat.query)}
                    className="flex flex-col items-center gap-2 p-4 bg-slate-800/50 border border-slate-700 rounded-2xl hover:bg-slate-700/50 hover:border-slate-600 transition-all duration-200 group"
                  >
                    <Icon size={20} className={`${cat.color} group-hover:scale-110 transition-transform`} />
                    <span className="text-xs font-medium text-slate-300">{cat.label}</span>
                  </button>
                );
              })}
            </div>
          </motion.div>
        )}

        {/* Search Results */}
        {searched && (
          <div className="space-y-4">
            {/* Results count */}
            {!loading && (
              <p className="text-sm text-slate-400">
                {total > 0 ? (
                  <>Found <span className="text-white font-semibold">{total.toLocaleString()}</span> results for "<span className="text-teal-400">{query}</span>"</>
                ) : (
                  <>No results found for "<span className="text-teal-400">{query}</span>"</>
                )}
              </p>
            )}

            {/* Drug Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <AnimatePresence mode="popLayout">
                {drugs.map((drug, idx) => (
                  <motion.div
                    key={`${drug.id}-${idx}`}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.03 }}
                  >
                    <Card
                      variant="glass"
                      className="p-4 hover:border-teal-500/30 transition-all duration-200 cursor-pointer group"
                      onClick={() => handleViewDetails(drug)}
                    >
                      <div className="flex items-start gap-3">
                        {/* Icon */}
                        <div className="w-10 h-10 rounded-xl bg-teal-500/15 flex items-center justify-center flex-shrink-0">
                          <Pill size={20} className="text-teal-400" />
                        </div>

                        {/* Info */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2">
                            <div>
                              <h3 className="font-semibold text-white text-sm group-hover:text-teal-300 transition-colors">
                                {drug.brandName || 'Unknown Drug'}
                              </h3>
                              {drug.genericName && drug.genericName !== drug.brandName && (
                                <p className="text-xs text-slate-400 mt-0.5">{drug.genericName}</p>
                              )}
                            </div>
                            <ChevronRight size={16} className="text-slate-600 group-hover:text-teal-400 transition-colors flex-shrink-0 mt-1" />
                          </div>

                          {/* Purpose / Indications */}
                          {(drug.purpose?.length > 0 || drug.indications?.length > 0) && (
                            <p className="text-xs text-slate-400 mt-2 line-clamp-2">
                              {truncateText(drug.purpose?.[0] || drug.indications?.[0], 150)}
                            </p>
                          )}

                          {/* Tags */}
                          <div className="flex flex-wrap gap-1.5 mt-2">
                            {drug.dosageForm?.slice(0, 2).map((form, i) => (
                              <Badge key={i} variant="secondary" className="text-[10px]">{form}</Badge>
                            ))}
                            {drug.route?.slice(0, 2).map((r, i) => (
                              <Badge key={`r-${i}`} variant="info" className="text-[10px]">{r}</Badge>
                            ))}
                            {drug.categories?.slice(0, 1).map((c, i) => (
                              <Badge key={`c-${i}`} variant="primary" className="text-[10px]">{c}</Badge>
                            ))}
                          </div>
                        </div>
                      </div>
                    </Card>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>

            {/* Load More */}
            {drugs.length > 0 && drugs.length < total && (
              <div className="flex justify-center pt-4">
                <Button
                  variant="outline"
                  onClick={handleLoadMore}
                  loading={loading}
                  leftIcon={<ChevronRight size={16} />}
                >
                  Load More Results
                </Button>
              </div>
            )}

            {/* Empty state */}
            {!loading && drugs.length === 0 && total === 0 && (
              <Card variant="glass" className="p-8 text-center">
                <Search size={48} className="text-slate-600 mx-auto mb-3" />
                <h3 className="text-lg font-semibold text-slate-300">No medicines found</h3>
                <p className="text-sm text-slate-500 mt-1">Try a different search term or browse by category</p>
              </Card>
            )}
          </div>
        )}
      </div>

      {/* Detail Modal */}
      <AnimatePresence>
        {selectedDrug && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-start justify-center pt-8 pb-8 px-4 overflow-y-auto"
          >
            {/* Backdrop */}
            <div
              className="fixed inset-0 bg-black/60 backdrop-blur-sm"
              onClick={() => setSelectedDrug(null)}
            />

            {/* Modal Content */}
            <motion.div
              initial={{ scale: 0.95, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 20 }}
              className="relative bg-slate-900 border border-slate-700 rounded-3xl w-full max-w-2xl max-h-[85vh] overflow-y-auto shadow-2xl z-10"
            >
              {/* Header */}
              <div className="sticky top-0 bg-slate-900/95 backdrop-blur-md border-b border-slate-700 p-5 rounded-t-3xl flex items-start justify-between z-10">
                <div className="flex items-start gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-teal-500/15 flex items-center justify-center flex-shrink-0">
                    <Pill size={24} className="text-teal-400" />
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-white">{selectedDrug.brandName}</h2>
                    {selectedDrug.genericName && selectedDrug.genericName !== selectedDrug.brandName && (
                      <p className="text-sm text-slate-400">{selectedDrug.genericName}</p>
                    )}
                    {selectedDrug.manufacturer && (
                      <p className="text-xs text-slate-500 mt-1">by {selectedDrug.manufacturer}</p>
                    )}
                  </div>
                </div>
                <button
                  onClick={() => setSelectedDrug(null)}
                  className="p-1.5 rounded-xl hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
                >
                  <X size={20} />
                </button>
              </div>

              {/* Body */}
              <div className="p-5 space-y-5">
                {detailLoading && (
                  <div className="flex items-center justify-center py-4">
                    <Loader2 size={24} className="text-teal-400 animate-spin" />
                    <span className="ml-2 text-sm text-slate-400">Loading full details...</span>
                  </div>
                )}

                {/* Quick Info Badges */}
                <div className="flex flex-wrap gap-2">
                  {selectedDrug.dosageForm?.map((form, i) => (
                    <Badge key={i} variant="secondary">{form}</Badge>
                  ))}
                  {selectedDrug.route?.map((r, i) => (
                    <Badge key={`r-${i}`} variant="info">{r}</Badge>
                  ))}
                  {selectedDrug.productType && (
                    <Badge variant="primary">{selectedDrug.productType}</Badge>
                  )}
                </div>

                {/* Pharmacologic Class */}
                {selectedDrug.categories?.length > 0 && (
                  <DetailSection icon={Beaker} title="Pharmacologic Class" color="text-violet-400">
                    <div className="flex flex-wrap gap-1.5">
                      {selectedDrug.categories.map((c, i) => (
                        <Badge key={i} variant="secondary" className="text-xs">{c}</Badge>
                      ))}
                    </div>
                    {selectedDrug.mechanism?.length > 0 && (
                      <p className="text-xs text-slate-500 mt-2">
                        <span className="text-slate-400 font-medium">Mechanism: </span>
                        {selectedDrug.mechanism.join(', ')}
                      </p>
                    )}
                  </DetailSection>
                )}

                {/* Purpose / Indications */}
                {(selectedDrug.purpose?.length > 0 || selectedDrug.indications?.length > 0) && (
                  <DetailSection icon={Info} title="Uses & Indications" color="text-teal-400">
                    {selectedDrug.purpose?.map((p, i) => (
                      <p key={i} className="text-sm text-slate-300 leading-relaxed">{p}</p>
                    ))}
                    {selectedDrug.indications?.map((ind, i) => (
                      <p key={`ind-${i}`} className="text-sm text-slate-300 leading-relaxed mt-1">{ind}</p>
                    ))}
                  </DetailSection>
                )}

                {/* Active Ingredients */}
                {selectedDrug.activeIngredient?.length > 0 && (
                  <DetailSection icon={Beaker} title="Active Ingredients" color="text-cyan-400">
                    {selectedDrug.activeIngredient.map((ing, i) => (
                      <p key={i} className="text-sm text-slate-300">{ing}</p>
                    ))}
                  </DetailSection>
                )}

                {/* Dosage */}
                {selectedDrug.dosage?.length > 0 && (
                  <DetailSection icon={Syringe} title="Dosage & Administration" color="text-blue-400">
                    {selectedDrug.dosage.map((d, i) => (
                      <p key={i} className="text-sm text-slate-300 leading-relaxed">{d}</p>
                    ))}
                  </DetailSection>
                )}

                {/* Warnings */}
                {selectedDrug.warnings?.length > 0 && (
                  <DetailSection icon={AlertTriangle} title="Warnings" color="text-amber-400">
                    {selectedDrug.warnings.map((w, i) => (
                      <p key={i} className="text-sm text-slate-300 leading-relaxed">{w}</p>
                    ))}
                  </DetailSection>
                )}

                {/* Adverse Reactions */}
                {selectedDrug.adverseReactions?.length > 0 && (
                  <DetailSection icon={AlertTriangle} title="Side Effects" color="text-red-400">
                    {selectedDrug.adverseReactions.map((r, i) => (
                      <p key={i} className="text-sm text-slate-300 leading-relaxed">{r}</p>
                    ))}
                  </DetailSection>
                )}

                {/* Drug Interactions */}
                {selectedDrug.drugInteractions?.length > 0 && (
                  <DetailSection icon={Shield} title="Drug Interactions" color="text-orange-400">
                    {selectedDrug.drugInteractions.map((d, i) => (
                      <p key={i} className="text-sm text-slate-300 leading-relaxed">{d}</p>
                    ))}
                  </DetailSection>
                )}

                {/* Contraindications */}
                {selectedDrug.contraindications?.length > 0 && (
                  <DetailSection icon={X} title="Contraindications" color="text-red-400">
                    {selectedDrug.contraindications.map((c, i) => (
                      <p key={i} className="text-sm text-slate-300 leading-relaxed">{c}</p>
                    ))}
                  </DetailSection>
                )}

                {/* Description */}
                {selectedDrug.description?.length > 0 && (
                  <DetailSection icon={BookOpen} title="Description" color="text-slate-400">
                    {selectedDrug.description.map((d, i) => (
                      <p key={i} className="text-sm text-slate-300 leading-relaxed">{d}</p>
                    ))}
                  </DetailSection>
                )}

                {/* FDA Disclaimer */}
                <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-3 mt-4">
                  <p className="text-[10px] text-slate-500 leading-relaxed">
                    Data provided by the U.S. Food and Drug Administration (FDA) OpenFDA API. This information is for educational purposes only and does not constitute medical advice. Always consult a healthcare professional before starting or changing medication.
                  </p>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </DashboardLayout>
  );
}

// Detail Section Component
function DetailSection({ icon: Icon, title, color, children }) {
  return (
    <div className="bg-slate-800/40 border border-slate-700/50 rounded-2xl p-4">
      <h3 className={`text-sm font-semibold ${color} flex items-center gap-2 mb-2`}>
        <Icon size={16} />
        {title}
      </h3>
      <div className="space-y-1 max-h-48 overflow-y-auto pr-1 custom-scrollbar">
        {children}
      </div>
    </div>
  );
}

export default DrugDatabase;
