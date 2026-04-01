"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { trackSignup } from "@/lib/analytics";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { GoogleOAuthButton } from "@/components/auth/google-oauth-button";

export default function SignupPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSignup(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }

    setLoading(true);

    const supabase = createClient();
    const { error: signUpError } = await supabase.auth.signUp({
      email,
      password,
    });

    if (signUpError) {
      setError(signUpError.message);
      setLoading(false);
      return;
    }

    trackSignup("email");
    router.push("/login?message=Check your email to confirm your account");
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
          <h1 className="text-lg font-bold text-slate-900">Create your account</h1>
          <p className="mt-1 text-sm text-slate-400">
            Start analyzing app reviews in minutes
          </p>
        </div>

        {error && (
          <div className="mb-4 rounded-xl bg-friction-red/10 px-3 py-2 text-sm text-friction-red">
            {error}
          </div>
        )}

        <GoogleOAuthButton mode="signup" />

        <div className="relative my-5">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-slate-200/60" />
          </div>
          <div className="relative flex justify-center text-xs">
            <span className="bg-white px-2 text-slate-400">or</span>
          </div>
        </div>

        <form onSubmit={handleSignup} className="flex flex-col gap-4">
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
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              placeholder="At least 6 characters"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoComplete="new-password"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="confirm-password">Confirm password</Label>
            <Input
              id="confirm-password"
              type="password"
              placeholder="Repeat your password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              autoComplete="new-password"
            />
          </div>

          <Button
            type="submit"
            size="lg"
            className="mt-1 w-full rounded-xl bg-slate-900 text-white hover:bg-slate-800"
            disabled={loading}
          >
            {loading ? "Creating account..." : "Create account"}
          </Button>
        </form>

        <div className="mt-5 border-t border-slate-200/60 pt-5">
          <p className="text-center text-sm text-slate-400">
            Already have an account?{" "}
            <Link
              href="/login"
              className="font-medium text-friction-blue hover:underline"
            >
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
