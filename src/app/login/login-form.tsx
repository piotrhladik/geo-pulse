"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@supabase/supabase-js";
import { ArrowLeft, CheckCircle2, Eye, EyeOff, Loader2, LockKeyhole, Mail } from "lucide-react";

type AuthMode = "sign-in" | "sign-up";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

export function LoginForm() {
  const router = useRouter();
  const supabase = useMemo(
    () =>
      supabaseUrl && supabaseAnonKey
        ? createClient(supabaseUrl, supabaseAnonKey)
        : null,
    []
  );
  const [mode, setMode] = useState<AuthMode>("sign-in");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    if (!supabase) return;

    const redirectAuthenticatedUser = async () => {
      const { data, error: sessionError } = await supabase.auth.getSession();
      if (!sessionError && data.session) router.replace("/dashboard");
    };

    void redirectAuthenticatedUser();
  }, [router, supabase]);

  const changeMode = (nextMode: AuthMode) => {
    setMode(nextMode);
    setError(null);
    setSuccess(null);
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    setSuccess(null);

    const normalizedEmail = email.trim();
    if (!normalizedEmail || !password) {
      setError("Enter your email address and password to continue.");
      return;
    }

    if (!/^\S+@\S+\.\S+$/.test(normalizedEmail)) {
      setError("Enter a valid email address.");
      return;
    }

    if (password.length < 6) {
      setError("Your password must be at least 6 characters long.");
      return;
    }

    if (!supabase) {
      setError("Authentication is not configured. Add the Supabase public environment variables and try again.");
      return;
    }

    setLoading(true);
    try {
      if (mode === "sign-in") {
        const { error: signInError } = await supabase.auth.signInWithPassword({
          email: normalizedEmail,
          password,
        });

        if (signInError) throw signInError;
        router.replace("/dashboard");
        router.refresh();
        return;
      }

      const { data, error: signUpError } = await supabase.auth.signUp({
        email: normalizedEmail,
        password,
      });

      if (signUpError) throw signUpError;

      if (data.session) {
        router.replace("/dashboard");
        router.refresh();
        return;
      }

      setSuccess("Account created. Check your inbox to confirm your email, then sign in.");
      setMode("sign-in");
      setPassword("");
    } catch (authError) {
      setError(authError instanceof Error ? authError.message : "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const isSignIn = mode === "sign-in";

  return (
    <main className="relative isolate flex min-h-screen items-center justify-center overflow-hidden bg-[#090a0f] px-5 py-12 text-zinc-100">
      <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute left-[10%] top-[-15%] h-80 w-80 rounded-full bg-violet-600/20 blur-3xl" />
        <div className="absolute bottom-[-18%] right-[4%] h-96 w-96 rounded-full bg-cyan-500/15 blur-3xl" />
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.025)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.025)_1px,transparent_1px)] bg-[size:48px_48px]" />
      </div>

      <section className="w-full max-w-md">
        <Link href="/" className="mb-8 inline-flex items-center gap-2 text-sm text-zinc-400 transition-colors hover:text-zinc-100">
          <ArrowLeft className="h-4 w-4" />
          Back to home
        </Link>

        <div className="rounded-2xl border border-zinc-800/80 bg-[#12141d]/90 p-6 shadow-2xl shadow-black/30 backdrop-blur-xl sm:p-8">
          <div className="mb-8">
            <Link href="/" className="mb-6 inline-flex items-center gap-2.5">
              <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-violet-500 to-cyan-500 text-sm font-bold text-white shadow-lg shadow-violet-500/20">G</span>
              <span className="font-semibold tracking-tight text-zinc-100">GEO Pulse AI</span>
            </Link>
            <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">
              {isSignIn ? "Welcome back" : "Create your account"}
            </h1>
            <p className="mt-2 text-sm leading-6 text-zinc-400">
              {isSignIn ? "Sign in to access your AI visibility audits." : "Start measuring and improving your AI search visibility."}
            </p>
          </div>

          <div className="mb-6 grid grid-cols-2 rounded-xl border border-zinc-800 bg-zinc-950/60 p-1" role="tablist" aria-label="Authentication mode">
            {(["sign-in", "sign-up"] as const).map((tab) => (
              <button
                key={tab}
                type="button"
                role="tab"
                aria-selected={mode === tab}
                onClick={() => changeMode(tab)}
                className={`rounded-lg px-3 py-2 text-sm font-medium transition-all ${mode === tab ? "bg-zinc-800 text-zinc-100 shadow-sm" : "text-zinc-500 hover:text-zinc-300"}`}
              >
                {tab === "sign-in" ? "Sign in" : "Sign up"}
              </button>
            ))}
          </div>

          {error && <p role="alert" className="mb-5 rounded-xl border border-red-500/25 bg-red-500/10 px-4 py-3 text-sm leading-5 text-red-200">{error}</p>}
          {success && <p role="status" className="mb-5 flex gap-2 rounded-xl border border-emerald-500/25 bg-emerald-500/10 px-4 py-3 text-sm leading-5 text-emerald-200"><CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" />{success}</p>}

          <form className="space-y-5" onSubmit={handleSubmit} noValidate>
            <label className="block">
              <span className="mb-2 block text-sm font-medium text-zinc-300">Email address</span>
              <span className="relative block">
                <Mail className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500" />
                <input type="email" autoComplete="email" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="you@company.com" required disabled={loading} className="w-full rounded-xl border border-zinc-700/80 bg-zinc-950/70 py-3 pl-10 pr-4 text-sm text-zinc-100 outline-none transition placeholder:text-zinc-600 focus:border-violet-400 focus:ring-4 focus:ring-violet-500/15 disabled:cursor-not-allowed disabled:opacity-60" />
              </span>
            </label>

            <label className="block">
              <span className="mb-2 block text-sm font-medium text-zinc-300">Password</span>
              <span className="relative block">
                <LockKeyhole className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500" />
                <input type={showPassword ? "text" : "password"} autoComplete={isSignIn ? "current-password" : "new-password"} value={password} onChange={(event) => setPassword(event.target.value)} placeholder="At least 6 characters" minLength={6} required disabled={loading} className="w-full rounded-xl border border-zinc-700/80 bg-zinc-950/70 py-3 pl-10 pr-11 text-sm text-zinc-100 outline-none transition placeholder:text-zinc-600 focus:border-violet-400 focus:ring-4 focus:ring-violet-500/15 disabled:cursor-not-allowed disabled:opacity-60" />
                <button type="button" onClick={() => setShowPassword((visible) => !visible)} aria-label={showPassword ? "Hide password" : "Show password"} className="absolute right-3 top-1/2 -translate-y-1/2 rounded p-1 text-zinc-500 transition hover:text-zinc-200 focus:outline-none focus:ring-2 focus:ring-violet-500" tabIndex={-1}>
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </span>
            </label>

            <button type="submit" disabled={loading} className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-violet-600 to-cyan-600 px-4 py-3 text-sm font-semibold text-white shadow-lg shadow-violet-500/20 transition hover:from-violet-500 hover:to-cyan-500 focus:outline-none focus:ring-4 focus:ring-violet-500/25 disabled:cursor-not-allowed disabled:opacity-60">
              {loading && <Loader2 className="h-4 w-4 animate-spin" />}
              {loading ? "Please wait..." : isSignIn ? "Sign in" : "Create account"}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-zinc-500">
            {isSignIn ? "New to GEO Pulse AI?" : "Already have an account?"}{" "}
            <button type="button" onClick={() => changeMode(isSignIn ? "sign-up" : "sign-in")} className="font-medium text-cyan-400 transition hover:text-cyan-300 focus:outline-none focus:underline">
              {isSignIn ? "Create an account" : "Sign in"}
            </button>
          </p>
        </div>
      </section>
    </main>
  );
}
