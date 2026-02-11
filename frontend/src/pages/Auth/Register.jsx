import { useState, useContext } from "react";
import { Link, useNavigate } from "react-router-dom";
import AuthLayout from "../../layouts/AuthLayout";
import { AuthContext } from "../../context/AuthContext";
import { registerUser } from "../../services/authService";

export default function Register() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    age: "",
    bloodGroup: "O+"
  });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const data = await registerUser(formData);
      login(data);
      navigate("/");
    } catch (err) {
      setError(err.response?.data?.message || "Registration failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout>
      <div className="space-y-5 md:space-y-6">
        
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center w-12 h-12 md:w-14 md:h-14 bg-blue-600/20 rounded-full mb-2">
            <span className="text-2xl md:text-3xl">🚀</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-bold text-slate-100">
            Create Account
          </h1>
          <p className="text-slate-400 text-sm md:text-base">
            Start your health journey in seconds
          </p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-500/10 border border-red-500/50 text-red-400 px-4 py-3 rounded-xl text-sm">
            {error}
          </div>
        )}

        {/* Register Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          
          <div>
            <label className="block mb-1.5 text-sm font-medium text-slate-300">Full Name</label>
            <input 
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className="w-full px-4 py-3 md:py-3.5 rounded-xl bg-slate-800 border border-slate-700 
              text-slate-100 placeholder-slate-500
              focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
              placeholder="John Doe"
              required
            />
          </div>

          <div>
            <label className="block mb-1.5 text-sm font-medium text-slate-300">Email</label>
            <input 
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className="w-full px-4 py-3 md:py-3.5 rounded-xl bg-slate-800 border border-slate-700 
              text-slate-100 placeholder-slate-500
              focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
              placeholder="yourmail@example.com"
              required
            />
          </div>

          <div>
            <label className="block mb-1.5 text-sm font-medium text-slate-300">Password</label>
            <div className="relative">
              <input 
                type={showPassword ? "text" : "password"}
                name="password"
                value={formData.password}
                onChange={handleChange}
                className="w-full px-4 py-3 md:py-3.5 rounded-xl bg-slate-800 border border-slate-700 
                text-slate-100 placeholder-slate-500
                focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition pr-12"
                placeholder="••••••••"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-300 transition"
              >
                {showPassword ? "🙈" : "👁️"}
              </button>
            </div>
            <p className="text-xs text-slate-500 mt-1.5">Must be at least 8 characters</p>
          </div>

          {/* Health Profile */}
          <div className="grid grid-cols-2 gap-3 md:gap-4">
            <div>
              <label className="block mb-1.5 text-sm font-medium text-slate-300">Age</label>
              <input 
                type="number"
                name="age"
                value={formData.age}
                onChange={handleChange}
                min="1"
                max="120"
                className="w-full px-4 py-3 md:py-3.5 rounded-xl bg-slate-800 border border-slate-700 
                text-slate-100 placeholder-slate-500
                focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
                placeholder="25"
              />
            </div>

            <div>
              <label className="block mb-1.5 text-sm font-medium text-slate-300">Blood Group</label>
              <select 
                name="bloodGroup"
                value={formData.bloodGroup}
                onChange={handleChange}
                className="w-full px-4 py-3 md:py-3.5 rounded-xl bg-slate-800 border border-slate-700 
                text-slate-100
                focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
              >
                <option value="O+">O+</option>
                <option value="A+">A+</option>
                <option value="B+">B+</option>
                <option value="AB+">AB+</option>
                <option value="O-">O-</option>
                <option value="A-">A-</option>
                <option value="B-">B-</option>
                <option value="AB-">AB-</option>
              </select>
            </div>
          </div>

          {/* Terms */}
          <div className="flex items-start gap-3">
            <input 
              type="checkbox" 
              id="terms"
              required
              className="mt-1 w-4 h-4 rounded bg-slate-800 border-slate-700 text-blue-600 focus:ring-blue-500"
            />
            <label htmlFor="terms" className="text-xs md:text-sm text-slate-400">
              I agree to the{" "}
              <Link to="/terms" className="text-blue-400 hover:text-blue-300">Terms of Service</Link>
              {" "}and{" "}
              <Link to="/privacy" className="text-blue-400 hover:text-blue-300">Privacy Policy</Link>
            </label>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white py-3 md:py-3.5 rounded-xl 
            font-semibold transition shadow-lg shadow-blue-600/30 transform hover:scale-[1.02] active:scale-[0.98]"
          >
            {loading ? "Creating Account..." : "Create Account"}
          </button>
        </form>

        {/* Divider */}
        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-slate-700"></div>
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-4 bg-slate-900 text-slate-500">or sign up with</span>
          </div>
        </div>

        {/* Social Login */}
        <div className="grid grid-cols-2 gap-3">
          <button className="flex items-center justify-center gap-2 py-2.5 md:py-3 px-4 bg-slate-800 border border-slate-700 rounded-xl hover:bg-slate-700 transition text-slate-300 text-sm">
            <span>🔵</span> Google
          </button>
          <button className="flex items-center justify-center gap-2 py-2.5 md:py-3 px-4 bg-slate-800 border border-slate-700 rounded-xl hover:bg-slate-700 transition text-slate-300 text-sm">
            <span>⚫</span> Apple
          </button>
        </div>

        {/* Footer */}
        <div className="text-center text-sm text-slate-400 pt-1">
          Already have an account?{" "}
          <Link to="/login" className="text-blue-400 font-semibold hover:text-blue-300 transition">
            Sign In
          </Link>
        </div>
      </div>
    </AuthLayout>
  );
}
