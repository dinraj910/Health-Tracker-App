import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import AuthLayout from "../../layouts/AuthLayout";
import { useToast } from "../../hooks/useToast";
import { forgotPassword } from "../../services/authService";

export default function ForgotPassword() {
    const [email, setEmail] = useState("");
    const [loading, setLoading] = useState(false);
    const { toast } = useToast();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const data = await forgotPassword(email);
            toast.success(data.message);
            // Navigate to reset page after a short delay
            setTimeout(() => {
                navigate("/reset-password", { state: { email } });
            }, 1500);
        } catch (err) {
            toast.error(err.response?.data?.message || "Something went wrong. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <AuthLayout>
            <div className="space-y-6">

                {/* Header */}
                <div className="text-center space-y-2">
                    <div className="inline-flex items-center justify-center w-12 h-12 md:w-14 md:h-14 bg-amber-600/20 rounded-full mb-2">
                        <span className="text-2xl md:text-3xl">🔑</span>
                    </div>
                    <h1 className="text-2xl md:text-3xl font-bold text-slate-100">
                        Forgot Password?
                    </h1>
                    <p className="text-slate-400 text-sm md:text-base">
                        Enter your email and we'll send you a reset code
                    </p>
                </div>



                {/* Form */}
                <form onSubmit={handleSubmit} className="space-y-4 md:space-y-5">
                    <div>
                        <label className="block mb-1.5 text-sm font-medium text-slate-300">Email Address</label>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full px-4 py-3 md:py-3.5 rounded-xl bg-slate-800 border border-slate-700 
              text-slate-100 placeholder-slate-500
              focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
                            placeholder="yourmail@example.com"
                            required
                            disabled={loading}
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white py-3 md:py-3.5 rounded-xl 
            font-semibold transition shadow-lg shadow-blue-600/30 transform hover:scale-[1.02] active:scale-[0.98]"
                    >
                        {loading ? "Sending Code..." : "Send Reset Code"}
                    </button>
                </form>

                {/* Footer */}
                <div className="text-center text-sm text-slate-400 pt-2">
                    Remember your password?{" "}
                    <Link to="/login" className="text-blue-400 font-semibold hover:text-blue-300 transition">
                        Back to Login
                    </Link>
                </div>
            </div>
        </AuthLayout>
    );
}
