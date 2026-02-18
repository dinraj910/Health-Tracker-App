import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Pill,
  FileText,
  BarChart3,
  Clock,
  Shield,
  Users,
  ArrowRight,
  Sparkles,
  Activity,
  Heart,
  Calendar,
  Upload
} from "lucide-react";
import { useAuth } from "../hooks/useAuth";

export default function Home() {
  const { user, logout, loading } = useAuth();

  const features = [
    {
      icon: Pill,
      title: "Smart Medicine Reminders",
      description: "Never miss a dose with intelligent notifications tailored to your schedule.",
      color: "teal"
    },
    {
      icon: FileText,
      title: "Secure Medical Records",
      description: "Store prescriptions, lab reports, and medical documents in one encrypted place.",
      color: "violet"
    },
    {
      icon: BarChart3,
      title: "Health Analytics",
      description: "Track symptoms, vitals, and medication adherence with visual insights.",
      color: "cyan"
    },
    {
      icon: Calendar,
      title: "Daily Tracking",
      description: "Log your daily medicine intake and monitor your health journey.",
      color: "emerald"
    },
    {
      icon: Users,
      title: "Family Health Tracking",
      description: "Monitor health records for your entire family in one dashboard.",
      color: "orange"
    },
    {
      icon: Shield,
      title: "Privacy First",
      description: "Your health data is encrypted and never shared without consent.",
      color: "rose"
    }
  ];

  const stats = [
    { number: "10K+", label: "Active Users", icon: Users },
    { number: "50K+", label: "Medications Tracked", icon: Pill },
    { number: "99.9%", label: "Uptime", icon: Activity },
    { number: "4.8/5", label: "User Rating", icon: Heart }
  ];

  return (
    <div className="bg-slate-950 min-h-screen text-slate-100">
      {/* Animated Background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 -left-40 w-80 h-80 bg-teal-500/10 rounded-full blur-3xl" />
        <div className="absolute top-1/2 -right-40 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-1/3 w-72 h-72 bg-violet-500/10 rounded-full blur-3xl" />
      </div>

      {/* NAVBAR */}
      <nav className="relative flex justify-between items-center px-4 py-4 md:px-8 lg:px-16 border-b border-slate-800/50 bg-slate-950/80 backdrop-blur-xl sticky top-0 z-50">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="flex items-center gap-2"
        >
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-teal-400 to-cyan-500 flex items-center justify-center">
            <Heart className="text-white" size={22} />
          </div>
          <span className="text-2xl md:text-3xl font-extrabold bg-gradient-to-r from-teal-400 to-cyan-400 bg-clip-text text-transparent">
            MediTrack
          </span>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="flex gap-3 md:gap-4 items-center"
        >
          {loading ? (
            <div className="w-10 h-10 rounded-full bg-slate-700 animate-pulse" />
          ) : user ? (
            <>
              <Link
                to="/dashboard"
                className="flex items-center gap-2 bg-gradient-to-r from-teal-500 to-cyan-500 text-white px-5 py-2.5 rounded-xl font-semibold hover:shadow-lg hover:shadow-teal-500/25 transition-all duration-300 hover:scale-105"
              >
                <span>Dashboard</span>
                <ArrowRight size={18} />
              </Link>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-teal-400 to-cyan-500 flex items-center justify-center text-white font-bold">
                  {user.name?.charAt(0).toUpperCase() || "U"}
                </div>
                <button
                  onClick={logout}
                  className="text-slate-400 hover:text-red-400 transition px-3 py-2 text-sm"
                >
                  Logout
                </button>
              </div>
            </>
          ) : (
            <>
              <Link
                to="/login"
                className="text-slate-300 hover:text-teal-400 transition px-3 py-2 font-medium"
              >
                Login
              </Link>
              <Link
                to="/register"
                className="bg-gradient-to-r from-teal-500 to-cyan-500 text-white px-5 py-2.5 rounded-xl font-semibold hover:shadow-lg hover:shadow-teal-500/25 transition-all duration-300 hover:scale-105"
              >
                Get Started
              </Link>
            </>
          )}
        </motion.div>
      </nav>

      {/* HERO SECTION FOR LOGGED IN USERS */}
      {user && (
        <section className="relative px-4 py-12 md:px-8 lg:px-16 md:py-20">
          <div className="max-w-7xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="relative overflow-hidden bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 rounded-3xl border border-slate-700/50 p-8 md:p-12"
            >
              {/* Decorative Elements */}
              <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-teal-500/20 to-cyan-500/10 rounded-full blur-3xl" />
              <div className="absolute bottom-0 left-0 w-48 h-48 bg-gradient-to-tr from-violet-500/20 to-purple-500/10 rounded-full blur-3xl" />

              <div className="relative grid lg:grid-cols-2 gap-8 items-center">
                {/* Left Content */}
                <div>
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="inline-flex items-center gap-2 px-4 py-2 bg-teal-500/10 border border-teal-500/30 rounded-full text-teal-400 text-sm mb-6"
                  >
                    <Sparkles size={16} />
                    <span>Welcome back, {user.name?.split(' ')[0]}!</span>
                  </motion.div>

                  <motion.h1
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4"
                  >
                    Ready to manage your
                    <span className="block bg-gradient-to-r from-teal-400 to-cyan-400 bg-clip-text text-transparent">
                      health today?
                    </span>
                  </motion.h1>

                  <motion.p
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                    className="text-slate-400 text-lg mb-8"
                  >
                    Access your personalized dashboard to track medicines, view analytics, and manage your health records.
                  </motion.p>

                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 }}
                    className="flex flex-wrap gap-4"
                  >
                    <Link
                      to="/dashboard"
                      className="group flex items-center gap-3 bg-gradient-to-r from-teal-500 to-cyan-500 text-white px-8 py-4 rounded-2xl font-semibold text-lg hover:shadow-xl hover:shadow-teal-500/25 transition-all duration-300 hover:scale-105"
                    >
                      <span>Go to Dashboard</span>
                      <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
                    </Link>
                    <Link
                      to="/today"
                      className="flex items-center gap-3 bg-slate-800 hover:bg-slate-700 text-white px-8 py-4 rounded-2xl font-semibold text-lg transition-all duration-300 border border-slate-600"
                    >
                      <Clock size={20} />
                      <span>Today's Doses</span>
                    </Link>
                  </motion.div>
                </div>

                {/* Right Content - Quick Actions Grid */}
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.4, duration: 0.5 }}
                  className="grid grid-cols-2 gap-4"
                >
                  <Link
                    to="/medicines"
                    className="group p-6 rounded-2xl bg-slate-800/50 border border-slate-700/50 hover:border-teal-500/30 hover:bg-slate-800 transition-all duration-300"
                  >
                    <div className="w-12 h-12 rounded-xl bg-teal-500/20 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                      <Pill size={24} className="text-teal-400" />
                    </div>
                    <h3 className="font-semibold text-white group-hover:text-teal-400 transition-colors">
                      My Medicines
                    </h3>
                  </Link>

                  <Link
                    to="/records"
                    className="group p-6 rounded-2xl bg-slate-800/50 border border-slate-700/50 hover:border-violet-500/30 hover:bg-slate-800 transition-all duration-300"
                  >
                    <div className="w-12 h-12 rounded-xl bg-violet-500/20 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                      <Upload size={24} className="text-violet-400" />
                    </div>
                    <h3 className="font-semibold text-white group-hover:text-violet-400 transition-colors">
                      Upload Record
                    </h3>
                  </Link>

                  <Link
                    to="/analytics"
                    className="group p-6 rounded-2xl bg-slate-800/50 border border-slate-700/50 hover:border-cyan-500/30 hover:bg-slate-800 transition-all duration-300"
                  >
                    <div className="w-12 h-12 rounded-xl bg-cyan-500/20 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                      <BarChart3 size={24} className="text-cyan-400" />
                    </div>
                    <h3 className="font-semibold text-white group-hover:text-cyan-400 transition-colors">
                      Analytics
                    </h3>
                  </Link>

                  <Link
                    to="/history"
                    className="group p-6 rounded-2xl bg-slate-800/50 border border-slate-700/50 hover:border-emerald-500/30 hover:bg-slate-800 transition-all duration-300"
                  >
                    <div className="w-12 h-12 rounded-xl bg-emerald-500/20 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                      <Calendar size={24} className="text-emerald-400" />
                    </div>
                    <h3 className="font-semibold text-white group-hover:text-emerald-400 transition-colors">
                      History
                    </h3>
                  </Link>
                </motion.div>
              </div>

              {/* User Info Bar */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
                className="relative mt-8 pt-8 border-t border-slate-700/50"
              >
                <div className="flex flex-wrap items-center gap-6 text-sm text-slate-400">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                    <span>Account Active</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span>📧</span>
                    <span>{user.email}</span>
                  </div>
                  {user.createdAt && (
                    <div className="flex items-center gap-2">
                      <span>📅</span>
                      <span>Member since {new Date(user.createdAt).getFullYear()}</span>
                    </div>
                  )}
                </div>
              </motion.div>
            </motion.div>
          </div>
        </section>
      )}

      {/* HERO SECTION FOR GUESTS */}
      {!user && (
        <section className="relative px-4 py-16 md:px-8 lg:px-16 md:py-24 lg:py-32">
          <div className="max-w-7xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="text-center space-y-8"
            >
              {/* Badge */}
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.2 }}
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-teal-500/10 border border-teal-500/30 rounded-full text-teal-400 text-sm font-medium"
              >
                <Sparkles size={16} className="animate-pulse" />
                <span>Your Health Companion</span>
              </motion.div>

              {/* Main Heading */}
              <motion.h1
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="text-4xl md:text-6xl lg:text-7xl font-extrabold leading-tight"
              >
                Stay Healthy.
                <br />
                <span className="bg-gradient-to-r from-teal-400 via-cyan-400 to-teal-400 bg-clip-text text-transparent">
                  Never Miss a Medicine.
                </span>
              </motion.h1>

              {/* Description */}
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="text-lg md:text-xl text-slate-400 max-w-2xl mx-auto leading-relaxed"
              >
                Your complete health management platform. Track medicines, store medical records,
                monitor vitals, and stay on top of your wellness journey — all in one place.
              </motion.p>

              {/* CTA Buttons */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-4"
              >
                <Link
                  to="/register"
                  className="group w-full sm:w-auto flex items-center justify-center gap-2 bg-gradient-to-r from-teal-500 to-cyan-500 text-white px-8 py-4 rounded-2xl text-lg font-semibold hover:shadow-2xl hover:shadow-teal-500/30 transition-all duration-300 hover:scale-105"
                >
                  <span>Start Free Today</span>
                  <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
                </Link>

                <Link
                  to="/login"
                  className="w-full sm:w-auto bg-slate-800/80 backdrop-blur text-slate-200 px-8 py-4 rounded-2xl text-lg font-semibold hover:bg-slate-700 transition-all duration-300 border border-slate-700"
                >
                  Sign In
                </Link>
              </motion.div>

              {/* Hero Visual */}
              <motion.div
                initial={{ opacity: 0, y: 40 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6, duration: 0.8 }}
                className="pt-12 md:pt-16"
              >
                <div className="relative max-w-4xl mx-auto">
                  {/* Dashboard Preview Mock */}
                  <div className="relative bg-gradient-to-br from-slate-800 to-slate-900 rounded-3xl border border-slate-700/50 p-4 md:p-6 shadow-2xl">
                    <div className="flex gap-2 mb-4">
                      <div className="w-3 h-3 rounded-full bg-red-500" />
                      <div className="w-3 h-3 rounded-full bg-yellow-500" />
                      <div className="w-3 h-3 rounded-full bg-green-500" />
                    </div>

                    <div className="grid grid-cols-4 gap-4">
                      {/* Sidebar Mock */}
                      <div className="hidden md:block col-span-1 bg-slate-800/50 rounded-2xl p-4">
                        <div className="w-8 h-8 bg-gradient-to-br from-teal-400 to-cyan-500 rounded-xl mb-6" />
                        {[1, 2, 3, 4, 5].map(i => (
                          <div key={i} className="h-8 bg-slate-700/50 rounded-lg mb-2" />
                        ))}
                      </div>

                      {/* Main Content Mock */}
                      <div className="col-span-4 md:col-span-3 space-y-4">
                        <div className="h-32 bg-gradient-to-r from-teal-500/20 to-cyan-500/20 rounded-2xl border border-teal-500/20" />
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                          {[1, 2, 3, 4].map(i => (
                            <div key={i} className="h-24 bg-slate-800/50 rounded-xl border border-slate-700/50" />
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Floating Elements */}
                  <motion.div
                    animate={{ y: [0, -10, 0] }}
                    transition={{ duration: 3, repeat: Infinity }}
                    className="absolute -top-6 -right-6 bg-gradient-to-br from-teal-500 to-cyan-500 p-4 rounded-2xl shadow-xl hidden md:block"
                  >
                    <Pill size={32} className="text-white" />
                  </motion.div>

                  <motion.div
                    animate={{ y: [0, 10, 0] }}
                    transition={{ duration: 4, repeat: Infinity }}
                    className="absolute -bottom-6 -left-6 bg-gradient-to-br from-violet-500 to-purple-500 p-4 rounded-2xl shadow-xl hidden md:block"
                  >
                    <BarChart3 size={32} className="text-white" />
                  </motion.div>
                </div>
              </motion.div>
            </motion.div>
          </div>
        </section>
      )}

      {/* STATS SECTION */}
      <section className="relative px-4 py-16 md:px-8 lg:px-16 border-y border-slate-800/50 bg-slate-900/30 backdrop-blur">
        <div className="max-w-7xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-8">
          {stats.map((stat, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className="text-center group"
            >
              <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-teal-500/10 border border-teal-500/20 mb-4 group-hover:scale-110 transition-transform">
                <stat.icon size={24} className="text-teal-400" />
              </div>
              <div className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-teal-400 to-cyan-400 bg-clip-text text-transparent mb-1">
                {stat.number}
              </div>
              <div className="text-sm text-slate-400">{stat.label}</div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* FEATURES */}
      <section className="relative px-4 py-16 md:px-8 lg:px-16 md:py-24">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4">
              Everything You Need in{" "}
              <span className="bg-gradient-to-r from-teal-400 to-cyan-400 bg-clip-text text-transparent">
                One Place
              </span>
            </h2>
            <p className="text-slate-400 text-lg max-w-2xl mx-auto">
              Powerful features designed to make health management effortless
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="group relative bg-slate-900/50 backdrop-blur p-8 rounded-3xl border border-slate-800/50 hover:border-teal-500/30 transition-all duration-300 hover:shadow-2xl hover:shadow-teal-500/5"
              >
                <div className="w-14 h-14 rounded-2xl bg-teal-500/20 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                  <feature.icon size={28} className="text-teal-400" />
                </div>
                <h3 className="text-xl font-semibold mb-3 text-slate-100 group-hover:text-teal-400 transition-colors">
                  {feature.title}
                </h3>
                <p className="text-slate-400 leading-relaxed">
                  {feature.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA SECTION - Only for guests */}
      {!user && (
        <section className="relative px-4 py-16 md:px-8 lg:px-16 md:py-24">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="max-w-4xl mx-auto relative"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-teal-500 to-cyan-500 rounded-3xl blur-xl opacity-20" />
            <div className="relative bg-gradient-to-br from-teal-500 to-cyan-600 rounded-3xl p-10 md:p-16 text-center overflow-hidden">
              {/* Background Pattern */}
              <div className="absolute inset-0 opacity-10">
                <div className="absolute top-0 left-0 w-40 h-40 bg-white rounded-full blur-3xl" />
                <div className="absolute bottom-0 right-0 w-60 h-60 bg-white rounded-full blur-3xl" />
              </div>

              <div className="relative z-10">
                <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-6">
                  Ready to Take Control of Your Health?
                </h2>
                <p className="text-lg md:text-xl mb-8 text-teal-50">
                  Join thousands of users managing their health smarter. Get started in under 2 minutes.
                </p>
                <Link
                  to="/register"
                  className="group inline-flex items-center gap-3 bg-white text-teal-600 px-10 py-4 rounded-2xl text-lg font-bold hover:bg-slate-100 transition-all duration-300 hover:scale-105 shadow-2xl"
                >
                  <span>Create Free Account</span>
                  <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
                </Link>
              </div>
            </div>
          </motion.div>
        </section>
      )}

      {/* FOOTER */}
      <footer className="relative px-4 py-12 md:px-8 lg:px-16 border-t border-slate-800/50 bg-slate-900/30">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
            {/* Brand */}
            <div className="col-span-1 md:col-span-2">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-teal-400 to-cyan-500 flex items-center justify-center">
                  <Heart className="text-white" size={22} />
                </div>
                <span className="text-2xl font-bold bg-gradient-to-r from-teal-400 to-cyan-400 bg-clip-text text-transparent">
                  MediTrack
                </span>
              </div>
              <p className="text-slate-400 text-sm mb-4 max-w-sm">
                Your complete health management platform. Track, manage, and optimize your wellness journey.
              </p>
            </div>

            {/* Quick Links */}
            <div>
              <h5 className="font-semibold mb-4 text-slate-200">Quick Links</h5>
              <ul className="space-y-3 text-sm text-slate-400">
                <li><Link to="/dashboard" className="hover:text-teal-400 transition">Dashboard</Link></li>
                <li><Link to="/medicines" className="hover:text-teal-400 transition">Medicines</Link></li>
                <li><Link to="/records" className="hover:text-teal-400 transition">Records</Link></li>
                <li><Link to="/analytics" className="hover:text-teal-400 transition">Analytics</Link></li>
              </ul>
            </div>

            {/* Legal */}
            <div>
              <h5 className="font-semibold mb-4 text-slate-200">Legal</h5>
              <ul className="space-y-3 text-sm text-slate-400">
                <li><Link to="/privacy" className="hover:text-teal-400 transition">Privacy Policy</Link></li>
                <li><Link to="/terms" className="hover:text-teal-400 transition">Terms of Service</Link></li>
                <li><Link to="/security" className="hover:text-teal-400 transition">Security</Link></li>
              </ul>
            </div>
          </div>

          <div className="pt-8 border-t border-slate-800/50 text-center text-slate-500 text-sm">
            © {new Date().getFullYear()} MediTrack. All rights reserved. Built with ❤️ for better health.
          </div>
        </div>
      </footer>
    </div>
  );
}