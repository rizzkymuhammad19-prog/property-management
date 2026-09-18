"use client";

import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { signIn } from "next-auth/react";
import { Building2, Eye, EyeOff, Lock, Mail, ShieldCheck, TrendingUp, Users } from "lucide-react";
import { Button } from "@/components/ui/button";

const FEATURES = [
  { icon: TrendingUp, text: "Pantau leads, booking, dan KPR secara real-time" },
  { icon: Users, text: "Dashboard khusus untuk tiap peran — Owner, Sales, Marketing" },
  { icon: ShieldCheck, text: "Akses berjenjang, data setiap sales tetap privat" },
];

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [email, setEmail] = useState("owner@propertymanagement.local");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const res = await signIn("credentials", {
      email,
      password,
      redirect: false,
    });

    setLoading(false);

    if (res?.error) {
      setError("Email atau password salah. Silakan coba lagi.");
      return;
    }

    router.push(searchParams.get("callbackUrl") ?? "/dashboard");
  }

  return (
    <div className="flex min-h-screen bg-white">
      {/* Panel kiri — brand */}
      <div className="relative hidden w-1/2 flex-col justify-between overflow-hidden bg-sidebar-gradient p-10 text-white lg:flex">
        <div
          className="pointer-events-none absolute -right-24 -top-24 h-96 w-96 rounded-full bg-brand-gradient opacity-30 blur-3xl"
          aria-hidden
        />
        <div
          className="pointer-events-none absolute bottom-0 left-0 h-72 w-72 rounded-full bg-brand-500 opacity-10 blur-3xl"
          aria-hidden
        />

        <div className="relative z-10 flex items-center gap-2.5">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-gradient shadow-glow">
            <Building2 className="h-5 w-5 text-white" />
          </div>
          <div>
            <div className="text-sm font-bold tracking-tight">PROPERTY MANAGEMENT</div>
            <div className="text-[11px] text-navy-300">Command Center</div>
          </div>
        </div>

        <div className="relative z-10 max-w-md space-y-8">
          <h1 className="text-3xl font-bold leading-tight tracking-tight">
            Satu sistem untuk seluruh perjalanan penjualan properti Anda.
          </h1>
          <p className="text-sm leading-relaxed text-navy-200">
            Dari lead masuk sampai akad KPR — kelola unit, tim sales, dan
            marketing dalam satu dashboard yang rapi dan mudah dipahami.
          </p>
          <ul className="space-y-4">
            {FEATURES.map((f) => (
              <li key={f.text} className="flex items-start gap-3">
                <span className="mt-0.5 flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg bg-white/10">
                  <f.icon className="h-4 w-4 text-brand-300" />
                </span>
                <span className="text-sm text-navy-100">{f.text}</span>
              </li>
            ))}
          </ul>
        </div>

        <p className="relative z-10 text-[11px] text-navy-400">
          © {new Date().getFullYear()} PROPERTY MANAGEMENT — Integrated Property Sales &amp; Marketing System
        </p>
      </div>

      {/* Panel kanan — form */}
      <div className="flex w-full flex-1 items-center justify-center bg-surface-subtle px-4 py-10 lg:w-1/2 lg:bg-white">
        <div className="w-full max-w-sm animate-fade-in-up">
          <div className="mb-8 flex items-center gap-2.5 lg:hidden">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand-gradient">
              <Building2 className="h-[18px] w-[18px] text-white" />
            </div>
            <div className="text-sm font-bold tracking-tight text-navy-900">
              PROPERTY MANAGEMENT
            </div>
          </div>

          <div className="mb-7">
            <h2 className="text-2xl font-bold tracking-tight text-gray-900">
              Selamat datang kembali
            </h2>
            <p className="mt-1.5 text-sm text-gray-500">
              Masuk ke akun Anda untuk melanjutkan ke dashboard.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="mb-1.5 block text-xs font-semibold text-gray-700">
                Email
              </label>
              <div className="relative">
                <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                <input
                  type="email"
                  required
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="nama@propertymanagement.local"
                  className="w-full rounded-xl border border-surface-border bg-white px-3 py-2.5 pl-9 text-sm text-gray-900 placeholder:text-gray-400 focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-100"
                />
              </div>
            </div>

            <div>
              <label className="mb-1.5 block text-xs font-semibold text-gray-700">
                Password
              </label>
              <div className="relative">
                <Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Masukkan password"
                  className="w-full rounded-xl border border-surface-border bg-white px-3 py-2.5 pl-9 pr-9 text-sm text-gray-900 placeholder:text-gray-400 focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-100"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((s) => !s)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            {error && (
              <p className="rounded-lg bg-red-50 px-3 py-2 text-xs font-medium text-red-600">
                {error}
              </p>
            )}

            <Button type="submit" disabled={loading} size="lg" className="w-full">
              {loading ? "Memproses..." : "Masuk"}
            </Button>
          </form>

          <div className="mt-6 rounded-xl border border-surface-border bg-surface-subtle p-3.5 text-center">
            <p className="text-[11px] leading-relaxed text-gray-500">
              Akun demo tersedia untuk semua peran (password: <span className="font-mono font-semibold text-gray-700">password123</span>).
              Lihat README repo untuk daftar email tiap peran.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={null}>
      <LoginForm />
    </Suspense>
  );
}
