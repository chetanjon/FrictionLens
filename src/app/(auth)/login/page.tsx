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
      {/* Logo */}
      <div className="mb-8 flex flex-col items-center gap-2">
        <Link href="/" className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-slate-900">
            <svg width="20" height="20" viewBox="0 0 500 500" fill="none">
              <path d="M78 430 C82 426,88 418,90 412 C96 394,108 370,124 346 C142 318,162 294,184 272 C200 256,216 246,234 240 C242 238,248 238,256 236 C268 232,280 224,296 208 C316 184,338 156,356 130 C370 112,382 96,394 80 C398 74,402 70,404 66 C400 64,396 64,392 66 C382 78,370 94,356 114 C340 142,320 168,300 196 C284 214,272 226,260 234 C252 238,244 240,236 242 C224 246,210 254,192 268 C170 288,150 310,132 336 C116 360,104 382,96 400 C90 414,88 420,84 428 C80 436,76 438,72 440Z" fill="white" opacity="0.94"/>
              <ellipse cx="249" cy="238" rx="6" ry="5.5" fill="#4A90D9"/>
              <circle cx="238" cy="246" r="2" fill="#4A90D9" opacity="0.3"/>
            </svg>
          </div>
          <span className="text-xl font-semibold tracking-tight text-slate-900">
            FrictionLens
          </span>
        </Link>
        <p className="text-sm text-slate-400">
          App Review Intelligence
        </p>
      </div>

      {/* Card */}
      <div className="rounded-2xl border border-slate-200/60 bg-white/65 backdrop-blur-xl p-7 shadow-lg shadow-slate-200/20">
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
