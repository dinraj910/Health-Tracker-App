import { useState, useRef } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import AuthLayout from "../../layouts/AuthLayout";
import { useToast } from "../../hooks/useToast";
import { resetPasswordService } from "../../services/authService";
import usePageTitle from "../../hooks/usePageTitle";

export default function ResetPassword() {
    usePageTitle('Reset Password');
    const location = useLocation();
    const navigate = useNavigate();
    const emailFromState = location.state?.email || "";

    const [email, setEmail] = useState(emailFromState);
    const [otp, setOtp] = useState(["", "", "", "", "", ""]);
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const { toast } = useToast();

    const otpRefs = useRef([]);

    const handleOtpChange = (index, value) => {
        // Only allow digits
        if (value && !/^\d$/.test(value)) return;

        const newOtp = [...otp];
        newOtp[index] = value;
        setOtp(newOtp);

        // Auto-focus next input
        if (value && index < 5) {
            otpRefs.current[index + 1]?.focus();
        }
    };

    const handleOtpKeyDown = (index, e) => {
        // Handle backspace — move to previous input
        if (e.key === "Backspace" && !otp[index] && index > 0) {
            otpRefs.current[index - 1]?.focus();
        }
    };

    const handleOtpPaste = (e) => {
        e.preventDefault();
        const pastedData = e.clipboardData.getData("text").trim();
        if (/^\d{6}$/.test(pastedData)) {
            const digits = pastedData.split("");
            setOtp(digits);
            otpRefs.current[5]?.focus();
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        const otpString = otp.join("");
        if (otpString.length !== 6) {
            toast.error("Please enter the complete 6-digit code");
            return;
        }

        if (newPassword !== confirmPassword) {
            toast.error("Passwords do not match");
            return;
        }

        if (newPassword.length < 8) {
            toast.error("Password must be at least 8 characters");
            return;
        }

        setLoading(true);
        try {
            const data = await resetPasswordService({
                email,
                otp: otpString,
                newPassword,
            });
            toast.success(data.message);
            setTimeout(() => {
                navigate("/login");
            }, 2000);
        } catch (err) {
            toast.error(err.response?.data?.message || "Reset failed. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <AuthLayout>
            <div className="space-y-6">

                {/* Header */}
                <div className="text-center space-y-2">
                    <div className="inline-flex items-center justify-center w-12 h-12 md:w-14 md:h-14 bg-emerald-600/20 rounded-full mb-2">
                        <span className="text-2xl md:text-3xl">🔒</span>
                    </div>
                    <h1 className="text-2xl md:text-3xl font-bold text-slate-100">
                        Reset Password
                    </h1>
                    <p className="text-slate-400 text-sm md:text-base">
                        Enter the code sent to your email and set a new password
                    </p>
                </div>



                {/* Form */}
                <form onSubmit={handleSubmit} className="space-y-4 md:space-y-5">

                    {/* Email (shown if not from state) */}
                    {!emailFromState && (
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
                            />
                        </div>
                    )}

                    {/* OTP Input */}
                    <div>
                        <label className="block mb-2 text-sm font-medium text-slate-300">Verification Code</label>
                        <div className="flex gap-2 justify-center" onPaste={handleOtpPaste}>
                            {otp.map((digit, index) => (
                                <input
                                    key={index}
                                    ref={(el) => (otpRefs.current[index] = el)}
                                    type="text"
                                    inputMode="numeric"
                                    maxLength={1}
                                    value={digit}
                                    onChange={(e) => handleOtpChange(index, e.target.value)}
                                    onKeyDown={(e) => handleOtpKeyDown(index, e)}
                                    className="w-12 h-14 md:w-14 md:h-16 text-center text-xl md:text-2xl font-bold rounded-xl 
                  bg-slate-800 border border-slate-700 text-slate-100
                  focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
                                />
                            ))}
                        </div>
                        <p className="text-xs text-slate-500 mt-2 text-center">
                            Code expires in 10 minutes
                        </p>
                    </div>

                    {/* New Password */}
                    <div>
                        <label className="block mb-1.5 text-sm font-medium text-slate-300">New Password</label>
                        <div className="relative">
                            <input
                                type={showPassword ? "text" : "password"}
                                value={newPassword}
                                onChange={(e) => setNewPassword(e.target.value)}
                                className="w-full px-4 py-3 md:py-3.5 rounded-xl bg-slate-800 border border-slate-700 
                text-slate-100 placeholder-slate-500
                focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition pr-12"
                                placeholder="Minimum 8 characters"
                                required
                                minLength={8}
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-300 transition text-sm"
                            >
                                {showPassword ? "Hide" : "Show"}
                            </button>
                        </div>
                    </div>

                    {/* Confirm Password */}
                    <div>
                        <label className="block mb-1.5 text-sm font-medium text-slate-300">Confirm Password</label>
                        <input
                            type={showPassword ? "text" : "password"}
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            className="w-full px-4 py-3 md:py-3.5 rounded-xl bg-slate-800 border border-slate-700 
              text-slate-100 placeholder-slate-500
              focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
                            placeholder="Confirm your new password"
                            required
                            minLength={8}
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white py-3 md:py-3.5 rounded-xl 
            font-semibold transition shadow-lg shadow-blue-600/30 transform hover:scale-[1.02] active:scale-[0.98]"
                    >
                        {loading ? "Resetting Password..." : "Reset Password"}
                    </button>
                </form>

                {/* Footer */}
                <div className="flex flex-col items-center gap-2 text-sm text-slate-400 pt-2">
                    <Link to="/forgot-password" className="text-blue-400 hover:text-blue-300 transition">
                        Didn't receive code? Send again
                    </Link>
                    <Link to="/login" className="text-slate-500 hover:text-slate-300 transition">
                        ← Back to Login
                    </Link>
                </div>
            </div>
        </AuthLayout>
    );
}
