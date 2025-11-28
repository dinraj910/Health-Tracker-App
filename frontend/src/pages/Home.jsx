import { Link } from "react-router-dom";
import { motion } from "framer-motion";

export default function Home() {
  const features = [
    {
      icon: "💊",
      title: "Smart Medicine Reminders",
      description: "Never miss a dose with intelligent notifications tailored to your schedule."
    },
    {
      icon: "📁",
      title: "Secure Medical Records",
      description: "Store prescriptions, lab reports, and medical documents in one encrypted place."
    },
    {
      icon: "📊",
      title: "Health Analytics",
      description: "Track symptoms, vitals, and medication adherence with visual insights."
    },
    {
      icon: "👨‍⚕️",
      title: "Doctor Appointments",
      description: "Manage appointments, prescriptions, and follow-ups seamlessly."
    },
    {
      icon: "🔔",
      title: "Family Health Tracking",
      description: "Monitor health records for your entire family in one dashboard."
    },
    {
      icon: "🔒",
      title: "Privacy First",
      description: "Your health data is encrypted and never shared without consent."
    }
  ];

  const stats = [
    { number: "10K+", label: "Active Users" },
    { number: "50K+", label: "Medications Tracked" },
    { number: "99.9%", label: "Uptime" },
    { number: "4.8/5", label: "User Rating" }
  ];

  return (
    <div className="bg-slate-950 min-h-screen text-slate-100">

      {/* NAVBAR */}
      <nav className="flex justify-between items-center px-4 py-4 md:px-8 lg:px-16 border-b border-slate-800 bg-slate-950/80 backdrop-blur-sm sticky top-0 z-50">
        <motion.h1 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="text-2xl md:text-3xl font-extrabold text-blue-500"
        >
          MediTrack
        </motion.h1>

        <div className="flex gap-3 md:gap-6 text-sm md:text-base font-medium">
          <Link 
            to="/login" 
            className="text-slate-300 hover:text-blue-400 transition px-3 py-2"
          >
            Login
          </Link>

          <Link
            to="/register"
            className="bg-blue-600 text-white px-4 py-2 md:px-5 rounded-lg hover:bg-blue-700 transition shadow-lg shadow-blue-600/30"
          >
            Get Started
          </Link>
        </div>
      </nav>

      {/* HERO SECTION */}
      <section className="px-4 py-12 md:px-8 lg:px-16 md:py-20 lg:py-24">
        <div className="max-w-7xl mx-auto">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center space-y-6 md:space-y-8"
          >
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600/10 border border-blue-600/20 rounded-full text-blue-400 text-sm">
              <span className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></span>
              Your Health Companion
            </div>

            {/* Main Heading */}
            <h2 className="text-4xl md:text-5xl lg:text-7xl font-extrabold leading-tight">
              Stay Healthy.
              <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-400">
                Never Miss a Medicine.
              </span>
            </h2>

            {/* Description */}
            <p className="text-base md:text-lg lg:text-xl text-slate-400 max-w-2xl mx-auto leading-relaxed">
              Your complete health management platform. Track medicines, store medical records, 
              monitor vitals, and stay on top of your wellness journey — all in one place.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-4">
              <Link
                to="/register"
                className="w-full sm:w-auto bg-blue-600 text-white px-8 py-3.5 rounded-lg shadow-lg shadow-blue-600/30 text-base md:text-lg font-semibold hover:bg-blue-700 transition transform hover:scale-105"
              >
                Start Free Today
              </Link>
              
              <Link
                to="/login"
                className="w-full sm:w-auto bg-slate-800 text-slate-200 px-8 py-3.5 rounded-lg text-base md:text-lg font-semibold hover:bg-slate-700 transition border border-slate-700"
              >
                Watch Demo
              </Link>
            </div>

            {/* Hero Image */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.3, duration: 0.5 }}
              className="pt-8 md:pt-12"
            >
              <img
                src="https://cdn-icons-png.flaticon.com/512/2966/2966486.png"
                alt="Medical Illustration"
                className="w-48 md:w-64 lg:w-80 mx-auto drop-shadow-2xl opacity-90"
              />
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* STATS SECTION */}
      <section className="px-4 py-12 md:px-8 lg:px-16 border-y border-slate-800 bg-slate-900/50">
        <div className="max-w-7xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8">
          {stats.map((stat, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className="text-center"
            >
              <div className="text-2xl md:text-4xl font-bold text-blue-400 mb-2">{stat.number}</div>
              <div className="text-xs md:text-sm text-slate-400">{stat.label}</div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* FEATURES */}
      <section className="px-4 py-12 md:px-8 lg:px-16 md:py-20">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12 md:mb-16"
          >
            <h3 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4">
              Everything You Need in{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-400">
                One Place
              </span>
            </h3>
            <p className="text-slate-400 text-base md:text-lg max-w-2xl mx-auto">
              Powerful features designed to make health management effortless
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="bg-slate-900 p-6 md:p-8 rounded-2xl border border-slate-800 hover:border-blue-600/50 transition group hover:shadow-xl hover:shadow-blue-600/10"
              >
                <div className="text-4xl md:text-5xl mb-4 group-hover:scale-110 transition">{feature.icon}</div>
                <h4 className="text-lg md:text-xl font-semibold mb-2 md:mb-3 text-slate-100 group-hover:text-blue-400 transition">
                  {feature.title}
                </h4>
                <p className="text-sm md:text-base text-slate-400 leading-relaxed">
                  {feature.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA SECTION */}
      <section className="px-4 py-12 md:px-8 lg:px-16 md:py-20">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          className="max-w-4xl mx-auto bg-gradient-to-br from-blue-600 to-cyan-600 rounded-3xl p-8 md:p-12 lg:p-16 text-center relative overflow-hidden"
        >
          {/* Background Pattern */}
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-0 left-0 w-40 h-40 bg-white rounded-full blur-3xl"></div>
            <div className="absolute bottom-0 right-0 w-60 h-60 bg-white rounded-full blur-3xl"></div>
          </div>

          <div className="relative z-10">
            <h3 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4 md:mb-6">
              Ready to Take Control of Your Health?
            </h3>
            <p className="text-base md:text-lg lg:text-xl mb-6 md:mb-8 text-blue-50">
              Join thousands of users managing their health smarter. Get started in under 2 minutes.
            </p>
            <Link
              to="/register"
              className="inline-block bg-white text-blue-600 px-8 md:px-10 py-3.5 md:py-4 rounded-lg text-base md:text-lg font-bold hover:bg-slate-100 transition transform hover:scale-105 shadow-2xl"
            >
              Create Free Account →
            </Link>
          </div>
        </motion.div>
      </section>

      {/* FOOTER */}
      <footer className="px-4 py-8 md:px-8 lg:px-16 md:py-12 border-t border-slate-800 bg-slate-900/50">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
            {/* Brand */}
            <div className="col-span-1 md:col-span-2">
              <h4 className="text-2xl font-bold text-blue-500 mb-3">MediTrack</h4>
              <p className="text-slate-400 text-sm mb-4">
                Your complete health management platform. Track, manage, and optimize your wellness journey.
              </p>
            </div>

            {/* Quick Links */}
            <div>
              <h5 className="font-semibold mb-3 text-slate-200">Quick Links</h5>
              <ul className="space-y-2 text-sm text-slate-400">
                <li><Link to="/features" className="hover:text-blue-400 transition">Features</Link></li>
                <li><Link to="/pricing" className="hover:text-blue-400 transition">Pricing</Link></li>
                <li><Link to="/about" className="hover:text-blue-400 transition">About</Link></li>
                <li><Link to="/contact" className="hover:text-blue-400 transition">Contact</Link></li>
              </ul>
            </div>

            {/* Legal */}
            <div>
              <h5 className="font-semibold mb-3 text-slate-200">Legal</h5>
              <ul className="space-y-2 text-sm text-slate-400">
                <li><Link to="/privacy" className="hover:text-blue-400 transition">Privacy Policy</Link></li>
                <li><Link to="/terms" className="hover:text-blue-400 transition">Terms of Service</Link></li>
                <li><Link to="/security" className="hover:text-blue-400 transition">Security</Link></li>
              </ul>
            </div>
          </div>

          <div className="pt-6 border-t border-slate-800 text-center text-slate-500 text-sm">
            © {new Date().getFullYear()} MediTrack. All rights reserved. Built with ❤️ for better health.
          </div>
        </div>
      </footer>
    </div>
  );
}
