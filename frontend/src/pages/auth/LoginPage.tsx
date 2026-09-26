import { useState, type FormEvent } from "react";
import { Navigate, useLocation, useNavigate } from "react-router-dom";
import { ErrorMessage } from "../../components/common/ErrorMessage";
import { useAuth } from "../../store/auth.store";
import { getDefaultDashboardForRole } from "../../utils/auth";
import { extractErrorMessage } from "../../utils/errors";

export const LoginPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, isAuthenticated, user, isLoading: isAuthLoading } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);

  // If already authenticated redirect
  if (!isAuthLoading && isAuthenticated && user) {
    const from = (location.state as { from?: { pathname?: string } })?.from?.pathname;
    const destination = from || getDefaultDashboardForRole(user.role);
    return <Navigate to={destination} replace />;
  }

  const validate = (): boolean => {
    if (!email.trim()) { setErrorMessage("Email is required."); return false; }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) { setErrorMessage("Please enter a valid email address."); return false; }
    if (!password.trim()) { setErrorMessage("Password is required."); return false; }
    return true;
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    if (!validate()) return;
    setIsSubmitting(true);
    try {
      const loggedUser = await login({ email: email.trim(), password });
      const from = (location.state as { from?: { pathname?: string } })?.from?.pathname;
      navigate(from || getDefaultDashboardForRole(loggedUser.role), { replace: true });
    } catch (err) {
      setErrorMessage(extractErrorMessage(err));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen relative flex items-center justify-center overflow-hidden bg-[#0a0818]">

      {/* Animated background orbs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div
          className="absolute -top-40 -left-40 w-96 h-96 rounded-full"
          style={{ background: "radial-gradient(circle, #7c3aed 0%, transparent 70%)", opacity: 0.3, animation: "pf-pulse 4s ease-in-out infinite" }}
        />
        <div
          className="absolute top-1/2 -right-32 w-80 h-80 rounded-full"
          style={{ background: "radial-gradient(circle, #4f46e5 0%, transparent 70%)", opacity: 0.2, animation: "pf-pulse 5s ease-in-out infinite 1s" }}
        />
        <div
          className="absolute -bottom-32 left-1/3 w-72 h-72 rounded-full"
          style={{ background: "radial-gradient(circle, #a21caf 0%, transparent 70%)", opacity: 0.2, animation: "pf-pulse 6s ease-in-out infinite 2s" }}
        />
        {/* Subtle grid */}
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: "linear-gradient(rgba(255,255,255,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.04) 1px, transparent 1px)",
            backgroundSize: "50px 50px",
          }}
        />
      </div>

      <style>{`
        @keyframes pf-pulse { 0%,100%{ transform:scale(1); opacity:0.25; } 50%{ transform:scale(1.12); opacity:0.4; } }
        @keyframes pf-float { 0%,100%{ transform:translateY(0); } 50%{ transform:translateY(-10px); } }
      `}</style>

      <div className="relative z-10 w-full max-w-5xl mx-auto px-4 sm:px-6 flex flex-col lg:flex-row items-center gap-12 lg:gap-20 py-12">

        {/* ── Left: Branding ── */}
        <div className="flex-1 text-center lg:text-left" style={{ animation: "pf-float 6s ease-in-out infinite" }}>
          <div
            className="inline-flex items-center justify-center w-16 h-16 rounded-2xl mb-6 shadow-2xl"
            style={{ background: "linear-gradient(135deg, #7c3aed, #4f46e5, #a21caf)", boxShadow: "0 20px 40px rgba(109,40,217,0.4)" }}
          >
            <svg className="w-9 h-9 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </div>

          <h1 className="text-4xl lg:text-5xl font-black text-white tracking-tight mb-3 leading-tight">
            Pulse
            <span style={{ background: "linear-gradient(135deg,#a78bfa,#818cf8)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
              Flow
            </span>
          </h1>

          <p className="text-slate-400 text-lg mb-8 leading-relaxed max-w-sm mx-auto lg:mx-0">
            Real-time project management with live collaboration, role-based access, and instant activity feeds.
          </p>

          <div className="space-y-3.5">
            {[
              { icon: "⚡", text: "Live real-time updates via Socket.io" },
              { icon: "🔐", text: "Role-based access — Admin, PM, Developer" },
              { icon: "📊", text: "Smart dashboards with task analytics" },
            ].map(({ icon, text }) => (
              <div key={text} className="flex items-center gap-3 text-sm text-slate-400 justify-center lg:justify-start">
                <span className="text-base">{icon}</span>
                <span>{text}</span>
              </div>
            ))}
          </div>
        </div>

        {/* ── Right: Login Card ── */}
        <div className="w-full max-w-md">
          <div
            className="rounded-2xl p-8"
            style={{
              background: "rgba(255,255,255,0.05)",
              backdropFilter: "blur(24px)",
              border: "1px solid rgba(255,255,255,0.1)",
              boxShadow: "0 25px 50px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.08)",
            }}
          >
            <div className="mb-7">
              <h2 className="text-2xl font-bold text-white mb-1">Welcome back</h2>
              <p className="text-slate-400 text-sm">Sign in to your PulseFlow account</p>
            </div>

            <ErrorMessage message={errorMessage} />

            <form onSubmit={handleSubmit} className="space-y-5" noValidate>
              {/* Email */}
              <div>
                <label htmlFor="email" className="block text-sm font-semibold text-slate-300 mb-2">
                  Email Address
                </label>
                <input
                  id="email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => { setEmail(e.target.value); if (errorMessage) setErrorMessage(null); }}
                  placeholder="you@example.com"
                  disabled={isSubmitting}
                  className="w-full px-4 py-3 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-violet-500 transition-all"
                  style={{ background: "rgba(255,255,255,0.07)", border: "1px solid rgba(255,255,255,0.12)" }}
                />
              </div>

              {/* Password */}
              <div>
                <label htmlFor="password" className="block text-sm font-semibold text-slate-300 mb-2">
                  Password
                </label>
                <div className="relative">
                  <input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    required
                    value={password}
                    onChange={(e) => { setPassword(e.target.value); if (errorMessage) setErrorMessage(null); }}
                    placeholder="••••••••"
                    disabled={isSubmitting}
                    className="w-full px-4 py-3 pr-12 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-violet-500 transition-all"
                    style={{ background: "rgba(255,255,255,0.07)", border: "1px solid rgba(255,255,255,0.12)" }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((p) => !p)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200 cursor-pointer transition-colors"
                    aria-label={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? (
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                      </svg>
                    ) : (
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                    )}
                  </button>
                </div>
              </div>

              {/* Submit */}
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3 px-4 text-white font-semibold rounded-xl text-sm transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 active:scale-[0.98]"
                style={{
                  background: "linear-gradient(135deg, #7c3aed, #4f46e5)",
                  boxShadow: "0 8px 24px rgba(109,40,217,0.4)",
                }}
              >
                {isSubmitting ? (
                  <>
                    <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    Signing in...
                  </>
                ) : (
                  <>
                    Sign In
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7l5 5m0 0l-5 5m5-5H6" />
                    </svg>
                  </>
                )}
              </button>
            </form>

            <div className="mt-6 pt-5 border-t border-white/10 text-center">
              <p className="text-xs text-slate-500">
                Secure access &bull; Role-based permissions &bull; Real-time sync
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
