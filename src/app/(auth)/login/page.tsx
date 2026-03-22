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
              <path d="M102 82 C118 98,138 126,155 150 C168 170,182 190,198 210 C210 226,222 237,236 244 C244 248,252 249,260 252 C272 257,284 268,300 290 C318 316,340 348,360 376 C374 396,390 414,410 436 C406 440,400 442,394 444 C374 422,358 400,340 374 C322 348,304 322,288 298 C276 280,266 268,256 260 C248 254,240 252,232 250 C222 248,212 238,198 222 C180 200,165 178,150 156 C136 134,122 112,110 94Z" fill="white" opacity="0.92"/>
              <ellipse cx="250" cy="251" rx="5.5" ry="5" fill="#4A90D9"/>
              <ellipse cx="236" cy="240" rx="2.2" ry="1.8" fill="#4A90D9" opacity="0.3"/>
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
