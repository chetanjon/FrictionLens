"use client";

import { Suspense, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { trackLogin, identifyUser } from "@/lib/analytics";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { GoogleOAuthButton } from "@/components/auth/google-oauth-button";

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="w-full max-w-sm animate-pulse" />}>
      <LoginForm />
    </Suspense>
  );
}

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const message = searchParams.get("message");

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const supabase = createClient();
    const { error: signInError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (signInError) {
      setError(signInError.message);
      setLoading(false);
      return;
    }

    const { data: { user } } = await supabase.auth.getUser();
    if (user) identifyUser(user.id, user.email ?? undefined);
    trackLogin("email");

    router.push("/dashboard");
    router.refresh();
  }

  return (
    <div className="w-full max-w-sm">
      {/* Logo — visible only on mobile (desktop has left panel) */}
      <div className="mb-8 flex flex-col items-center gap-2 md:hidden">
        <Link href="/" className="flex items-center gap-3">
          <svg width="36" height="36" viewBox="-32 -32 64 64" fill="none">
            <ellipse cx="0" cy="0" rx="30" ry="29.5" fill="none" stroke="#4A90D9" strokeWidth="1.2"/>
            <ellipse cx="0" cy="0" rx="24" ry="23.5" fill="#4A90D9"/>
            <path d="M -7 -12 L 7 -12 L 7 -8.5 L -3 -8.5 L -3 -1.5 L 5 -1.5 L 5 1.5 L -3 1.5 L -3 13 L -7 13 Z" fill="white"/>
          </svg>
          <span className="text-xl font-semibold tracking-tight text-slate-900">
            FrictionLens
          </span>
        </Link>
        <p className="text-sm text-slate-400">
          App Review Intelligence
        </p>
      </div>

      {/* Card */}
      <div className="rounded-2xl border border-slate-200/50 bg-white p-8 shadow-xl shadow-slate-200/20">
        <div className="mb-6 text-center">
          <h1 className="text-lg font-bold text-slate-900">Welcome back</h1>
          <p className="mt-1 text-sm text-slate-400">Sign in to your account</p>
        </div>

        {message && (
          <div className="mb-4 rounded-xl bg-friction-blue/10 px-3 py-2 text-sm text-friction-blue">
            {message}
          </div>
        )}

        {error && (
          <div className="mb-4 rounded-xl bg-friction-red/10 px-3 py-2 text-sm text-friction-red">
            {error}
          </div>
        )}

        <GoogleOAuthButton mode="login" />

        <div className="relative my-5">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-slate-200/60" />
          </div>
          <div className="relative flex justify-center text-xs">
            <span className="bg-white px-2 text-slate-400">or</span>
          </div>
        </div>

        <form onSubmit={handleLogin} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <div className="flex items-center justify-between">
              <Label htmlFor="password">Password</Label>
              <button
                type="button"
                className="text-xs text-slate-400 hover:text-friction-blue transition-colors"
                onClick={() => {
                  /* Forgot password - future implementation */
                }}
              >
                Forgot password?
              </button>
            </div>
            <Input
              id="password"
              type="password"
              placeholder="Your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoComplete="current-password"
            />
          </div>

          <Button
            type="submit"
            size="lg"
            className="mt-1 w-full rounded-xl bg-slate-900 text-white hover:bg-slate-800"
            disabled={loading}
          >
            {loading ? "Signing in..." : "Sign in"}
          </Button>
        </form>

        <div className="mt-5 border-t border-slate-200/60 pt-5">
          <p className="text-center text-sm text-slate-400">
            Don&apos;t have an account?{" "}
            <Link
              href="/signup"
              className="font-medium text-friction-blue hover:underline"
            >
              Sign up
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
