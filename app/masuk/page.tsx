import Link from "next/link";
import { redirect } from "next/navigation";
import LoginPasswordForm from "@/components/auth/LoginPasswordForm";
import GoogleButton from "@/components/auth/GoogleButton";
import { AuthBackdrop, AuthCard, AlertError } from "@/components/auth/auth-ui";
import { auth } from "@/lib/auth";

/** Pesan error OAuth yang diarahkan Auth.js kembali ke /masuk */
const OAUTH_ERROR_MESSAGE: Record<string, string> = {
  OAuthSignin: "Kendala membuka layanan Google. Coba lagi sebentar.",
  OAuthCallback: "Kendala menyelesaikan proses Google. Coba lagi sebentar.",
  Callback: "Kendala mengembalikan data login. Coba lagi sebentar.",
  OAuthAccountNotLinked:
    "Email akun Google ini sudah dipakai lewat metode lain. Masuk dengan email + password lama kamu.",
  Default: "Login gagal. Coba lagi sebentar.",
};

type PageProps = {
  searchParams: Promise<{ next?: string; callbackUrl?: string; error?: string }>;
};

export const metadata = {
  title: "Masuk",
};

export default async function MasukPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const session = await auth();

  // Dukung ?next= maupun ?callbackUrl= (dipakai Auth.js middleware)
  const mentah = params.next ?? params.callbackUrl;
  const tujuanAman =
    mentah && mentah.startsWith("/") && !mentah.startsWith("//")
      ? mentah
      : undefined;

  // Sudah login? Langsung ke tujuan — dengan pengaman role agar tidak berputar.
  if (session?.user) {
    const tujuan = tujuanAman ?? "/";

    if (tujuan.startsWith("/admin") && session.user.role !== "ADMIN") {
      redirect("/");
    }
    if (
      tujuan.startsWith("/tulis") &&
      session.user.role !== "ADMIN" &&
      session.user.role !== "PENULIS"
    ) {
      redirect("/dashboard?izin=menulis");
    }
    redirect(tujuan);
  }

  const hasGoogle = Boolean(
    process.env.GOOGLE_CLIENT_ID &&
    process.env.GOOGLE_CLIENT_ID !== "ISI-CLIENT-ID-GOOGLE"
  );

  const oauthError = params.error ? OAUTH_ERROR_MESSAGE[params.error] ?? OAUTH_ERROR_MESSAGE.Default : null;
  const callbackUrl = tujuanAman;

  return (
    <AuthBackdrop>
      <AuthCard
        title="Masuk ke Krida Wacana"
        subtitle="Portal artikel SD Negeri 2 Kemutug Lor. Masuk dengan email & password atau akun demo."
        footer={
          <span>
            Belum punya akun?{" "}
            <Link href="/daftar" className="font-semibold text-amber-brand hover:underline">
              Daftar sekarang
            </Link>
          </span>
        }
      >
        {oauthError && <AlertError message={oauthError} />}

        {hasGoogle && (
          <>
            <GoogleButton callbackUrl={callbackUrl} />
            <div className="my-6 flex items-center gap-4">
              <span className="h-px flex-1 bg-white/15" aria-hidden />
              <span className="text-xs font-semibold uppercase tracking-widest text-white/40">atau</span>
              <span className="h-px flex-1 bg-white/15" aria-hidden />
            </div>
          </>
        )}

        {/* Form Login Email + Password */}
        <LoginPasswordForm callbackUrl={callbackUrl} />

        {/* Informasi Akun Demo yang Bisa Langsung Dipakai Menulis */}
        <div className="mt-6 rounded-2xl border border-white/15 bg-white/5 p-4 text-xs text-white/80">
          <p className="font-bold text-amber-brand">🔑 Akun Langsung Pakai (Bisa Nulis):</p>
          <div className="mt-2.5 space-y-1.5 text-white/75">
            <div className="rounded-lg bg-white/5 p-2">
              <span className="font-semibold text-white">Akun Guru / Penulis (Reni Sudiatun):</span>
              <p className="font-mono text-amber-brand">Email: reni@example.com</p>
              <p className="font-mono text-amber-brand">Password: penulis123</p>
            </div>
            <div className="rounded-lg bg-white/5 p-2">
              <span className="font-semibold text-white">Akun Admin (Semua Akses):</span>
              <p className="font-mono text-amber-brand">Email: admin@kridawacana.id</p>
              <p className="font-mono text-amber-brand">Password: admin1234</p>
            </div>
          </div>
        </div>
      </AuthCard>
    </AuthBackdrop>
  );
}
