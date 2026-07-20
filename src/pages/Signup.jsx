import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { signup } from "../services/auth";
import { cn } from "../lib/utils";

export default function Signup() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    username: "",
    email: "",
    password: "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(""); // Clear previous errors

    if (!form.username || !form.email || !form.password) {
      setError("Please fill in all fields.");
      return;
    }

    try {
      setLoading(true);
      await signup(form.username, form.email, form.password);
      // Redirect to Login page on success
      navigate("/");
    } catch (err) {
      // Extract specific backend error message if available
      const backendError = err.response?.data?.detail;
      if (backendError) {
        setError(typeof backendError === "string" ? backendError : "Signup failed");
      } else if (err.response?.status === 404) {
        setError("Error 404: Endpoint not found. Check backend URL route.");
      } else {
        setError("Network error. Please make sure the backend server is running.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative flex min-h-dvh w-full items-center justify-center bg-[#121212] font-sans text-white p-4">
      {/* CARD PANEL */}
      <div className="w-full max-w-[400px] rounded-3xl border border-[#2d2d2d] bg-[#1e1e1e] px-8 py-10 text-center shadow-2xl">
        
        {/* CIRCULAR RAG LOGO BADGE */}
        <div className="mx-auto mb-6 flex h-14 w-14 items-center justify-center rounded-full bg-[#383838] text-xs font-bold text-white shadow-inner">
          RAG
        </div>

        {/* HEADING */}
        <h1 className="mb-8 text-3xl font-bold tracking-tight text-white">
          RAG Assistant
        </h1>

        <form onSubmit={handleSubmit} className="flex flex-col gap-3.5">
          {/* USERNAME FIELD */}
          <input
            placeholder="Username"
            type="text"
            disabled={loading}
            value={form.username}
            onChange={(e) => setForm({ ...form, username: e.target.value })}
            className={cn(
              "w-full rounded-2xl border border-transparent bg-[#2e2e2e] px-5 py-3.5 text-sm text-white outline-none transition-all placeholder:text-[#888888]",
              "focus:border-[#4f4f4f] focus:bg-[#333333] disabled:opacity-50"
            )}
          />

          {/* EMAIL FIELD */}
          <input
            placeholder="Email Address"
            type="email"
            disabled={loading}
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            className={cn(
              "w-full rounded-2xl border border-transparent bg-[#2e2e2e] px-5 py-3.5 text-sm text-white outline-none transition-all placeholder:text-[#888888]",
              "focus:border-[#4f4f4f] focus:bg-[#333333] disabled:opacity-50"
            )}
          />

          {/* PASSWORD FIELD */}
          <input
            type="password"
            placeholder="Password"
            disabled={loading}
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
            className={cn(
              "w-full rounded-2xl border border-transparent bg-[#2e2e2e] px-5 py-3.5 text-sm text-white outline-none transition-all placeholder:text-[#888888]",
              "focus:border-[#4f4f4f] focus:bg-[#333333] disabled:opacity-50"
            )}
          />

          {/* DIVIDER LINE */}
          <div className="my-1 border-t border-[#2d2d2d]" />

          {/* ACTION BUTTON */}
          <button
            type="submit"
            disabled={loading}
            className={cn(
              "w-full rounded-2xl bg-[#333333] px-5 py-3.5 text-sm font-semibold text-white transition-all hover:bg-[#3f3f3f]",
              loading ? "cursor-default opacity-70" : "cursor-pointer"
            )}
          >
            {loading ? "Creating Account..." : "Sign up"}
          </button>

          {/* DYNAMIC ERROR MESSAGE */}
          {error && (
            <p className="mt-1 text-center text-xs text-red-400">
              {error}
            </p>
          )}
        </form>

        {/* FOOTER LINK */}
        <p className="mt-8 text-xs text-[#888888]">
          Already have an account?{" "}
          <Link
            to="/"
            className="font-medium text-white underline hover:text-gray-300"
          >
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}