"use client";

import { useState } from "react";
import Link from "next/link";

export function MobileNav() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setOpen(!open)}
        className="md:hidden rounded-lg p-2 text-slate-600 hover:bg-slate-100 transition-colors"
        aria-label="Toggle menu"
      >
        {open ? (
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        ) : (
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        )}
      </button>

      {open && (
        <div className="absolute top-16 left-0 right-0 border-b border-slate-200/60 bg-white/95 backdrop-blur-xl md:hidden">
          <div className="flex flex-col px-6 py-4 gap-3">
            <a
              href="#features"
              onClick={() => setOpen(false)}
              className="text-sm text-slate-600 hover:text-slate-900 transition-colors py-1"
            >
              Features
            </a>
            <a
              href="#demo"
              onClick={() => setOpen(false)}
              className="text-sm text-slate-600 hover:text-slate-900 transition-colors py-1"
            >
              Demo
            </a>
            <a
              href="#pricing"
              onClick={() => setOpen(false)}
              className="text-sm text-slate-600 hover:text-slate-900 transition-colors py-1"
            >
              Pricing
            </a>
            <div className="h-px bg-slate-200/60 my-1" />
            <Link
              href="/login"
              onClick={() => setOpen(false)}
              className="text-sm text-slate-600 hover:text-slate-900 transition-colors py-1"
            >
              Log in
            </Link>
            <Link
              href="/signup"
              onClick={() => setOpen(false)}
              className="inline-flex h-9 items-center justify-center rounded-lg bg-slate-900 px-4 text-sm font-medium text-white hover:bg-slate-800 transition-colors"
            >
              Get Started
            </Link>
          </div>
        </div>
      )}
    </>
  );
}
