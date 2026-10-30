import Link from "next/link";
import { redirect } from "next/navigation";
import LoginPasswordForm from "@/components/auth/LoginPasswordForm";
import GoogleButton from "@/components/auth/GoogleButton";
import { AuthBackdrop, AuthCard, AlertError } from "@/components/auth/auth-ui";
import { auth, signIn as serverSignIn } from "@/lib/auth";

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

  // Jika URL Google belum dikonfigurasi, tampilkan pesan yang ramah
  if (
    !process.env.GOOGLE_CLIENT_ID ||
    process.env.GOOGLE_CLIENT_ID === "ISI-CLIENT-ID-GOOGLE"
  ) {
    return (
      <AuthBackdrop>
        <AuthCard
          title="Maaf, login Google belum aktif"
          subtitle="Belum ada konfigurasi Client ID Google di server ini."
          footer={
            <span>
              Sudah punya akun?{" "}
              <Link href="/daftar" className="font-semibold text-amber-brand hover:underline">
                Daftar di sini
              </Link>
            </span>
          }
        >
          <AlertError message="Login Google belum aktif di server ini." />
          <p className="text-sm text-white/70">
            Admin dapat mengaktifkannya dengan mengisi{" "}
            <code className="rounded bg-white/10 px-1.5 py-0.5 text-amber-brand">
              GOOGLE_CLIENT_ID
            </code>{" "}
            dan{" "}
            <code className="rounded bg-white/10 px-1.5 py-0.5 text-amber-brand">
              GOOGLE_CLIENT_SECRET
            </code>{" "}
            pada file <code className="rounded bg-white/10 px-1.5 py-0.5 text-amber-brand">.env</code>. Langkahnya
            ada di README (bagian Setup Google OAuth). Sementara itu, kamu
            tetap bisa masuk menggunakan email + password di bawah.
          </p>
          <div className="mt-6">
            <LoginPasswordForm callbackUrl={tujuanAman} />
          </div>
        </AuthCard>
      </AuthBackdrop>
    );
  }

  const oauthError = params.error ? OAUTH_ERROR_MESSAGE[params.error] ?? OAUTH_ERROR_MESSAGE.Default : null;
  const callbackUrl = tujuanAman;

  return (
    <AuthBackdrop>
      <AuthCard
        title="Masuk ke Krida Wacana"
        subtitle="Portal artikel SD Negeri 2 Kemutug Lor. Masuk untuk membaca dan berdiskusi."
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

        {/* Tombol utama Google */}
        <GoogleButton callbackUrl={callbackUrl} />

        {/* Pemisah "atau" */}
        <div className="my-6 flex items-center gap-4">
          <span className="h-px flex-1 bg-white/15" aria-hidden />
          <span className="text-xs font-semibold uppercase tracking-widest text-white/40">atau</span>
          <span className="h-px flex-1 bg-white/15" aria-hidden />
        </div>

        {/* Alternatif email + password */}
        <LoginPasswordForm callbackUrl={callbackUrl} />
      </AuthCard>
    </AuthBackdrop>
  );
}
