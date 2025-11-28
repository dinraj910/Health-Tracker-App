import { Link } from "react-router-dom";

export default function AuthLayout({ children }) {
  return (
    <div className="min-h-screen w-full bg-slate-950 flex flex-col">
      
      {/* Navbar */}
      <nav className="flex justify-between items-center px-4 py-4 md:px-8 lg:px-16 border-b border-slate-800">
        <Link to="/" className="text-2xl md:text-3xl font-extrabold text-blue-500">
          MediTrack
        </Link>
        <Link 
          to="/"
          className="text-slate-400 hover:text-blue-400 transition text-sm"
        >
          ← Back to Home
        </Link>
      </nav>

      {/* Main Content */}
      <div className="flex-1 flex flex-col items-center justify-center px-4 py-8 md:py-12">
        
        {/* Background Glow Effects */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-blue-600/10 rounded-full blur-3xl"></div>
          <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-cyan-600/10 rounded-full blur-3xl"></div>
        </div>

        {/* Card */}
        <div className="relative z-10 w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl p-6 md:p-8 animate-fade-up">
          {children}
        </div>

        {/* Footer */}
        <p className="mt-6 md:mt-8 text-slate-500 text-xs text-center">
          © {new Date().getFullYear()} MediTrack. All rights reserved.
        </p>
      </div>
    </div>
  );
}
