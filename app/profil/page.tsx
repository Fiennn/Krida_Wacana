import Image from "next/image";
import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { formatCompactNumber, formatDate } from "@/lib/utils";
import ProfileForm from "@/components/profil/ProfileForm";

export const metadata = {
  title: "Profil Saya",
};

export const dynamic = "force-dynamic";

/**
 * /profil — edit profil (foto, nama, username, bio) milik sendiri.
 */
export default async function ProfilPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/masuk?next=/profil");

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    include: {
      _count: {
        select: {
          articles: true,
          followers: true,
          following: true,
        },
      },
    },
  });
  if (!user) redirect("/masuk?next=/profil");

  const agg = await prisma.article.aggregate({
    where: { authorId: user.id, status: "PUBLISHED" },
    _sum: { views: true },
  });

  return (
    <section className="mx-auto max-w-4xl px-4 py-10 sm:px-6">
      <header className="mb-8 flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.24em] text-amber-brand">
            Akun Saya
          </p>
          <h1 className="mt-2 font-serif text-3xl font-bold text-ink sm:text-4xl">
            Profil <span className="text-amber-brand">Saya</span>
          </h1>
        </div>
        <Link
          href={`/penulis/${user.username}`}
          className="inline-flex h-10 items-center justify-center rounded-full border border-line bg-white px-5 text-sm font-semibold text-ink transition-colors hover:border-navy-royal hover:text-navy-royal"
        >
          Tampilan publik penulis ↗
        </Link>
      </header>

      {/* Kartu ringkas identitas */}
      <div className="mb-8 flex flex-col gap-5 rounded-3xl bg-gradient-to-br from-navy via-navy-royal to-navy-dark p-6 text-white shadow-card sm:flex-row sm:items-center sm:p-8">
        {user.image ? (
          <Image
            src={user.image}
            alt={user.name ?? "Avatar"}
            width={72}
            height={72}
            className="h-[72px] w-[72px] rounded-full object-cover ring-2 ring-amber-brand/50"
          />
        ) : (
          <span className="flex h-[72px] w-[72px] items-center justify-center rounded-full bg-amber-brand font-serif text-2xl font-bold text-navy-dark">
            {(user.name ?? "K").slice(0, 1)}
          </span>
        )}
        <div className="min-w-0 flex-1">
          <p className="truncate font-serif text-2xl font-bold">{user.name}</p>
          <p className="mt-0.5 text-sm text-white/60">
            @{user.username} &middot; Bergabung {formatDate(user.createdAt)}
          </p>
        </div>
        <dl className="grid grid-cols-3 gap-2 text-center">
          {[
            { label: "Artikel", value: user._count.articles },
            { label: "Pembaca", value: agg._sum.views ?? 0 },
            { label: "Pengikut", value: user._count.followers },
          ].map((s) => (
            <div key={s.label} className="glass rounded-xl px-3 py-2">
              <dt className="text-[9px] font-semibold uppercase tracking-wider text-white/50">
                {s.label}
              </dt>
              <dd className="font-serif text-lg font-bold text-amber-brand">
                {formatCompactNumber(s.value)}
              </dd>
            </div>
          ))}
        </dl>
      </div>

      {/* Form edit */}
      <div className="rounded-3xl bg-white p-6 shadow-card sm:p-8">
        <h2 className="mb-6 font-serif text-xl font-bold text-ink">
          Edit <span className="text-amber-brand">Informasi Akun</span>
        </h2>
        <ProfileForm
          user={{
            name: user.name,
            username: user.username,
            bio: user.bio,
            image: user.image,
          }}
        />
      </div>
    </section>
  );
}
