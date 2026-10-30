import Link from "next/link";
import { redirect } from "next/navigation";
import RegisterForm from "@/components/auth/RegisterForm";
import GoogleButton from "@/components/auth/GoogleButton";
import { AuthBackdrop, AuthCard } from "@/components/auth/auth-ui";
import { auth } from "@/lib/auth";

type PageProps = {
  searchParams: Promise<{ next?: string }>;
};

export const metadata = {
  title: "Daftar",
};

export default async function DaftarPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const session = await auth();

  if (session?.user) {
    redirect("/");
  }

  const callbackUrl =
    params.next && params.next.startsWith("/") && !params.next.startsWith("//")
      ? params.next
      : "/";

  const hasGoogle = Boolean(
    process.env.GOOGLE_CLIENT_ID &&
    process.env.GOOGLE_CLIENT_ID !== "ISI-CLIENT-ID-GOOGLE"
  );

  return (
    <AuthBackdrop>
      <AuthCard
        title="Buat Akun Krida Wacana"
        subtitle="Daftar gratis dengan email dan password. Akun baru berstatus pembaca; admin dapat memberi izin menulis."
        footer={
          <span>
            Sudah punya akun?{" "}
            <Link href="/masuk" className="font-semibold text-amber-brand hover:underline">
              Masuk di sini
            </Link>
          </span>
        }
      >
        {hasGoogle && (
          <>
            <GoogleButton
              callbackUrl={callbackUrl}
              label="Daftar dengan Google"
            />
            <div className="my-6 flex items-center gap-4">
              <span className="h-px flex-1 bg-white/15" aria-hidden />
              <span className="text-xs font-semibold uppercase tracking-widest text-white/40">atau</span>
              <span className="h-px flex-1 bg-white/15" aria-hidden />
            </div>
          </>
        )}

        <RegisterForm />
      </AuthCard>
    </AuthBackdrop>
  );
}
