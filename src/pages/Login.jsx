import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { login } from "../services/auth";

export default function Login() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    username: "", // Matches backend schema
    password: "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!form.username || !form.password) {
      setError("Please enter both username and password.");
      return;
    }

    try {
      setLoading(true);
      // Calls updated auth.js login helper
      await login(form.username, form.password);
      navigate("/chat");
    } catch (err) {
      console.error("Login Error Object:", err.response);

      const backendError = err.response?.data?.detail;

      if (typeof backendError === "string") {
        setError(backendError);
      } else if (Array.isArray(backendError)) {
        setError(backendError[0]?.msg || "Invalid request format.");
      } else {
        setError(err.response?.data?.message || "Login failed. Check server console.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#121212] relative overflow-hidden w-full p-4">
      
      {/* Centered Glassmorphism Card */}
      <div className="relative z-10 w-full max-w-sm rounded-3xl bg-gradient-to-r from-[#ffffff10] to-[#121212] backdrop-blur-sm shadow-2xl p-8 flex flex-col items-center border border-white/10">
        
        {/* Logo Element */}
        <div className="flex items-center justify-center w-12 h-12 rounded-full bg-white/20 mb-4 shadow-lg text-white font-bold text-lg">
          RAG
        </div>

        {/* Header Title */}
          <h1 className="text-2xl font-semibold text-white mb-2 text-center">
            RAG Assistant
          </h1>
         

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="flex flex-col w-full gap-4">
          <div className="w-full flex flex-col gap-3">
            {/* USERNAME INPUT */}
            <input
              placeholder="Username"
              type="text"
              disabled={loading}
              value={form.username}
              className="w-full px-5 py-3 rounded-xl bg-white/10 text-white placeholder-gray-400 text-sm focus:outline-none focus:ring-2 focus:ring-white/40 disabled:opacity-50 transition-all"
              onChange={(e) => setForm({ ...form, username: e.target.value })}
            />

            {/* PASSWORD INPUT */}
            <input
              placeholder="Password"
              type="password"
              disabled={loading}
              value={form.password}
              className="w-full px-5 py-3 rounded-xl bg-white/10 text-white placeholder-gray-400 text-sm focus:outline-none focus:ring-2 focus:ring-white/40 disabled:opacity-50 transition-all"
              onChange={(e) => setForm({ ...form, password: e.target.value })}
            />

            {/* ERROR DISPLAY */}
            {error && (
              <div className="text-xs text-red-400 text-left px-1 mt-1 font-medium">
                {error}
              </div>
            )}
          </div>

          <hr className="border-white/10 my-1" />

          <div>
            {/* SUBMIT BUTTON */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-white/10 text-white font-medium px-5 py-3 rounded-full shadow hover:bg-white/20 active:scale-[0.98] transition mb-3 text-sm cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "Logging in..." : "Sign in"}
            </button>

            {/* GOOGLE SIGN IN BUTTON */}
            <button
              type="button"
              className="w-full flex items-center justify-center gap-2 bg-gradient-to-b from-[#232526] to-[#2d2e30] rounded-full px-5 py-3 font-medium text-white shadow hover:brightness-110 active:scale-[0.98] transition mb-4 text-sm cursor-pointer"
            >
              <img
                src="https://www.svgrepo.com/show/475656/google-color.svg"
                alt="Google"
                className="w-5 h-5"
              />
              Continue with Google
            </button>

            {/* SIGN UP LINK */}
            <div className="w-full text-center">
              <span className="text-xs text-gray-400">
                Don&apos;t have an account?{" "}
                <Link
                  to="/signup"
                  className="underline text-white/80 hover:text-white transition-colors"
                >
                  Sign up, it&apos;s free!
                </Link>
              </span>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}