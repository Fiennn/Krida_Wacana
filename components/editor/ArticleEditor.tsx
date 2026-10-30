"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import ImageExtension from "@tiptap/extension-image";
import LinkExtension from "@tiptap/extension-link";
import Placeholder from "@tiptap/extension-placeholder";
import { cn } from "@/lib/utils";

/* ============================================================
 * Editor Artikel Krida Wacana (Tiptap)
 * Fitur: judul, cover, konten rich text (heading, bold/italic,
 * list, quote, link, gambar), galeri foto, kategori, tag,
 * status Draft/Terbit.
 * ============================================================ */

type Kategori = { name: string; slug: string };

export type InitialArtikel = {
  id: string;
  title: string;
  excerpt: string;
  content: string;
  coverImage: string | null;
  categorySlug: string;
  tags: string[];
  galleryUrls: string[];
  status: "DRAFT" | "PUBLISHED";
};

type Props = {
  kategoriList: Kategori[];
  initial?: InitialArtikel;
};

/* ---------------- util kirim ke /api/upload ---------------- */

async function uploadGambar(file: File, preset: "cover" | "article" | "avatar"): Promise<string> {
  const fd = new FormData();
  fd.set("file", file);
  fd.set("preset", preset);
  const res = await fetch("/api/upload", { method: "POST", body: fd });
  const json = await res.json();
  if (!res.ok) throw new Error(json?.error ?? "Gagal mengunggah gambar.");
  return json.url as string;
}

/* ---------------- tombol kecil toolbar ---------------- */

function ToolBtn({
  onAction,
  active,
  label,
  children,
}: {
  onAction: () => void;
  active?: boolean;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onMouseDown={(e) => e.preventDefault()} // jaga fokus editor
      onClick={onAction}
      title={label}
      aria-label={label}
      className={cn(
        "flex h-9 min-w-9 items-center justify-center rounded-lg border text-sm transition-colors",
        active
          ? "border-navy-royal bg-navy text-white"
          : "border-line bg-white text-ink hover:border-navy-royal hover:text-navy-royal",
      )}
    >
      {children}
    </button>
  );
}

/* ---------------- upload gambar cover & galeri ---------------- */

function CoverPicker({
  coverImage,
  onChange,
}: {
  coverImage: string | null;
  onChange: (url: string | null) => void;
}) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  return (
    <div className="rounded-2xl border border-line bg-surface-muted p-4">
      <div className="flex items-center justify-between">
        <label className="text-xs font-semibold uppercase tracking-wider text-ink-secondary">
          Gambar Cover
        </label>
        {coverImage && (
          <button
            type="button"
            onClick={() => onChange(null)}
            className="text-xs font-semibold text-rose-500 hover:text-rose-600"
          >
            Hapus cover
          </button>
        )}
      </div>

      {coverImage ? (
        <div className="relative mt-3 overflow-hidden rounded-xl">
          <Image
            src={coverImage}
            alt="Cover artikel"
            width={900}
            height={320}
            className="h-44 w-full object-cover"
          />
        </div>
      ) : (
        <div className="mt-3 rounded-xl border-2 border-dashed border-line bg-white px-4 py-6 text-center">
          <p className="text-sm text-ink-secondary">
            Tanpa cover juga boleh — kartu akan memakai warna gradien.
          </p>
        </div>
      )}

      <input
        type="file"
        accept="image/jpeg,image/png,image/webp"
        className="mt-3 block w-full text-xs text-ink-secondary file:mr-3 file:h-9 file:rounded-lg file:border-0 file:bg-navy file:px-4 file:text-sm file:font-semibold file:text-white hover:file:bg-navy-royal"
        disabled={busy}
        onChange={async (e) => {
          const file = e.target.files?.[0];
          if (!file) return;
          setBusy(true);
          setError(null);
          try {
            const url = await uploadGambar(file, "cover");
            onChange(url);
          } catch (err) {
            setError(err instanceof Error ? err.message : "Gagal mengunggah.");
          } finally {
            setBusy(false);
            e.target.value = "";
          }
        }}
      />
      {busy && <p className="mt-2 text-xs text-ink-secondary">Mengunggah cover…</p>}
      {error && <p className="mt-2 text-xs text-rose-600">{error}</p>}
    </div>
  );
}

function GalleryPicker({
  urls,
  onChange,
}: {
  urls: string[];
  onChange: (urls: string[]) => void;
}) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  return (
    <div className="rounded-2xl border border-line bg-surface-muted p-4">
      <label className="text-xs font-semibold uppercase tracking-wider text-ink-secondary">
        Galeri Foto (maks. 12)
      </label>
      {urls.length > 0 && (
        <div className="mt-3 grid grid-cols-3 gap-2">
          {urls.map((u) => (
            <div key={u} className="group relative overflow-hidden rounded-lg">
              <Image src={u} alt="Foto galeri" width={200} height={120} className="h-20 w-full object-cover" />
              <button
                type="button"
                onClick={() => onChange(urls.filter((x) => x !== u))}
                className="absolute right-1 top-1 rounded-md bg-rose-600/90 px-1.5 py-0.5 text-[10px] font-bold text-white opacity-90 hover:bg-rose-600"
              >
                ✕
              </button>
            </div>
          ))}
        </div>
      )}
      <input
        type="file"
        accept="image/jpeg,image/png,image/webp"
        multiple
        className="mt-3 block w-full text-xs text-ink-secondary file:mr-3 file:h-9 file:rounded-lg file:border-0 file:bg-navy file:px-4 file:text-sm file:font-semibold file:text-white hover:file:bg-navy-royal"
        disabled={busy || urls.length >= 12}
        onChange={async (e) => {
          const files = Array.from(e.target.files ?? []);
          if (files.length === 0) return;
          setBusy(true);
          setError(null);
          try {
            const hasil = await Promise.all(
              files.slice(0, 12 - urls.length).map((f) => uploadGambar(f, "article")),
            );
            onChange([...urls, ...hasil]);
          } catch (err) {
            setError(err instanceof Error ? err.message : "Gagal mengunggah.");
          } finally {
            setBusy(false);
            e.target.value = "";
          }
        }}
      />
      {busy && <p className="mt-2 text-xs text-ink-secondary">Mengunggah foto…</p>}
      {error && <p className="mt-2 text-xs text-rose-600">{error}</p>}
    </div>
  );
}

/* ---------------- komponen utama ---------------- */

export default function ArticleEditor({ kategoriList, initial }: Props) {
  const router = useRouter();
  const sedangEdit = !!initial?.id;

  const [title, setTitle] = useState(initial?.title ?? "");
  const [excerpt, setExcerpt] = useState(initial?.excerpt ?? "");
  const [coverImage, setCoverImage] = useState<string | null>(initial?.coverImage ?? null);
  const [galleryUrls, setGalleryUrls] = useState<string[]>(initial?.galleryUrls ?? []);
  const [categorySlug, setCategorySlug] = useState(
    initial?.categorySlug || kategoriList[0]?.slug || "",
  );
  const [tagsRaw, setTagsRaw] = useState((initial?.tags ?? []).join(", "));
  const [status, setStatus] = useState<"DRAFT" | "PUBLISHED">(initial?.status ?? "DRAFT");

  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [imageUploading, setImageUploading] = useState(false);
  const [fileError, setFileError] = useState<string | null>(null);

  // Editor Tiptap
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: { levels: [2, 3] },
      }),
      ImageExtension.configure({ inline: false, allowBase64: false, HTMLAttributes: { loading: "lazy" } }),
      LinkExtension.configure({
        openOnClick: false,
        autolink: true,
        HTMLAttributes: { rel: "noopener noreferrer", target: "_blank" },
      }),
      Placeholder.configure({ placeholder: "Tulis isi artikel di sini… misalnya kabar kegiatan sekolah, prestasi siswa, atau catatan pembelajaran." }),
    ],
    content: initial?.content ?? "",
    editorProps: {
      attributes: {
        class: "prose-article outline-none min-h-[340px] px-1 py-2",
      },
    },
    immediatelyRender: false,
  });

  // Sisipkan gambar dari komputer langsung ke dalam konten
  const insertGambar = useCallback(
    async (files: FileList) => {
      const editorRef = editor;
      if (!editorRef) return;
      setImageUploading(true);
      setFileError(null);
      try {
        for (const file of Array.from(files)) {
          const url = await uploadGambar(file, "article");
          editorRef.chain().focus().setImage({ src: url }).run();
        }
      } catch (err) {
        setFileError(err instanceof Error ? err.message : "Gagal mengunggah gambar.");
      } finally {
        setImageUploading(false);
      }
    },
    [editor],
  );

  // Tautan (prompt sederhana)
  function setLink() {
    if (!editor) return;
    const sebelumnya = editor.getAttributes("link").href as string | undefined;
    const href = window.prompt("Masukkan URL tautan (mis. https://example.com)", sebelumnya ?? "https://");
    if (href === null) return;
    if (href === "") {
      editor.chain().focus().unsetLink().run();
      return;
    }
    editor.chain().focus().setLink({ href }).run();
  }

  /* ------------------ simpan ------------------ */
  async function simpan(tujuanStatus: "DRAFT" | "PUBLISHED") {
    if (saving || !editor) return;
    setFormError(null);

    const content = editor.getHTML();
    if (title.trim().length < 8) {
      setFormError("Judul minimal 8 karakter.");
      return;
    }
    if (content.replace(/<[^>]*>/g, "").trim().length < 30) {
      setFormError("Isi artikel terlalu pendek — minimal sekitar 50 karakter.");
      return;
    }

    const tags = tagsRaw
      .split(",")
      .map((t) => t.trim())
      .filter(Boolean)
      .slice(0, 8);

    setSaving(true);
    try {
      const payload = {
        title: title.trim(),
        excerpt: excerpt.trim(),
        content,
        coverImage,
        categorySlug,
        tags,
        galleryUrls,
        status: tujuanStatus,
      };

      const res = await fetch(
        sedangEdit ? `/api/artikel/${initial!.id}` : "/api/artikel",
        {
          method: sedangEdit ? "PATCH" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        },
      );
      const json = await res.json();
      if (!res.ok) {
        setFormError(json?.error ?? "Gagal menyimpan artikel.");
        return;
      }
      router.push("/dashboard?tersimpan=1");
      router.refresh();
    } catch {
      setFormError("Kendala jaringan saat menyimpan. Coba lagi sebentar.");
    } finally {
      setSaving(false);
    }
  }

  /* ------------------ render ------------------ */
  return (
    <div className="space-y-6">
      {/* ===== Kartu judul + isi ===== */}
      <div className="rounded-3xl bg-white p-5 shadow-card sm:p-8">
        <label htmlFor="afe-title" className="text-xs font-semibold uppercase tracking-wider text-ink-secondary">
          Judul Artikel
        </label>
        <input
          id="afe-title"
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Judul yang menarik, mis. Kegiatan Pramuka Siaga di Halaman Sekolah"
          maxLength={140}
          className="mt-1.5 w-full border-0 border-b-2 border-line bg-transparent pb-3 font-serif text-2xl font-bold text-ink outline-none transition-colors placeholder:text-ink-secondary/40 focus:border-amber-brand sm:text-3xl"
        />

        {/* Toolbar */}
        <div className="mt-6 flex flex-wrap items-center gap-1.5 rounded-xl border border-line bg-surface-muted p-2">
          <ToolBtn onAction={() => editor?.chain().focus().toggleBold().run()} active={editor?.isActive("bold")} label="Bold (tebal)">
            <strong>B</strong>
          </ToolBtn>
          <ToolBtn onAction={() => editor?.chain().focus().toggleItalic().run()} active={editor?.isActive("italic")} label="Italic (miring)">
            <em>I</em>
          </ToolBtn>
          <ToolBtn onAction={() => editor?.chain().focus().toggleStrike().run()} active={editor?.isActive("strike")} label="Coret">
            <s>S</s>
          </ToolBtn>
          <span className="mx-1 h-6 w-px bg-line" aria-hidden />
          <ToolBtn onAction={() => editor?.chain().focus().toggleHeading({ level: 2 }).run()} active={editor?.isActive("heading", { level: 2 })} label="Judul dalam (H2)">
            H2
          </ToolBtn>
          <ToolBtn onAction={() => editor?.chain().focus().toggleHeading({ level: 3 }).run()} active={editor?.isActive("heading", { level: 3 })} label="Subjudul (H3)">
            H3
          </ToolBtn>
          <span className="mx-1 h-6 w-px bg-line" aria-hidden />
          <ToolBtn onAction={() => editor?.chain().focus().toggleBulletList().run()} active={editor?.isActive("bulletList")} label="Daftar poin">
            •
          </ToolBtn>
          <ToolBtn onAction={() => editor?.chain().focus().toggleOrderedList().run()} active={editor?.isActive("orderedList")} label="Daftar bernomor">
            1.
          </ToolBtn>
          <ToolBtn onAction={() => editor?.chain().focus().toggleBlockquote().run()} active={editor?.isActive("blockquote")} label="Kutipan">
            <span aria-hidden>&ldquo;</span>
          </ToolBtn>
          <span className="mx-1 h-6 w-px bg-line" aria-hidden />
          <ToolBtn onAction={setLink} active={editor?.isActive("link")} label="Sisip tautan">
            🔗
          </ToolBtn>
          <label
            className={cn(
              "flex h-9 cursor-pointer items-center justify-center rounded-lg border border-line bg-white px-2.5 text-sm text-ink transition-colors hover:border-navy-royal hover:text-navy-royal",
              imageUploading && "cursor-wait opacity-60",
            )}
            title="Sisipkan gambar"
            aria-label="Sisipkan gambar ke isi"
          >
            🖼️
            <input
              type="file"
              accept="image/jpeg,image/png,image/webp"
              className="hidden"
              onChange={(e) => {
                if (e.target.files && e.target.files.length > 0) {
                  void insertGambar(e.target.files);
                }
                e.target.value = "";
              }}
            />
          </label>
        </div>
        {(imageUploading || fileError) && (
          <p className={cn("mt-2 text-xs", fileError ? "text-rose-600" : "text-ink-secondary")}>
            {fileError ?? "Mengunggah gambar ke isi…" }
          </p>
        )}

        {/* Area konten */}
        <div className="mt-2 rounded-2xl border border-line bg-white px-4 py-3 focus-within:border-navy-royal/60 focus-within:ring-2 focus-within:ring-navy-royal/15">
          <EditorContent editor={editor} />
        </div>

        {/* Ringkasan */}
        <label htmlFor="afe-excerpt" className="mt-6 block text-xs font-semibold uppercase tracking-wider text-ink-secondary">
          Ringkasan (opsional — otomatis bila kosong)
        </label>
        <textarea
          id="afe-excerpt"
          rows={2}
          value={excerpt}
          onChange={(e) => setExcerpt(e.target.value)}
          maxLength={300}
          placeholder="Satu-dua kalimat yang membuat orang penasaran…"
          className="mt-1.5 h-20 w-full resize-none rounded-xl border border-line bg-white px-4 py-3 text-sm text-ink outline-none transition-colors placeholder:text-ink-secondary/60 focus:border-navy-royal"
        />

        {/* Galeri */}
        <div className="mt-6">
          <GalleryPicker urls={galleryUrls} onChange={setGalleryUrls} />
        </div>
      </div>

      {/* ===== Panel pengaturan ===== */}
      <div className="rounded-3xl bg-white p-5 shadow-card sm:p-8">
        <h2 className="font-serif text-lg font-bold text-ink">Pengaturan Tulisan</h2>

        <div className="mt-5 grid gap-5 sm:grid-cols-2">
          {/* Kategori */}
          <div>
            <label htmlFor="afe-cat" className="text-xs font-semibold uppercase tracking-wider text-ink-secondary">
              Kategori
            </label>
            <select
              id="afe-cat"
              value={categorySlug}
              onChange={(e) => setCategorySlug(e.target.value)}
              className="mt-1.5 h-11 w-full rounded-xl border border-line bg-white px-3.5 text-sm font-medium text-ink outline-none focus:border-navy-royal"
            >
              {kategoriList.map((k) => (
                <option key={k.slug} value={k.slug}>
                  {k.name}
                </option>
              ))}
            </select>
          </div>

          {/* Tag */}
          <div>
            <label htmlFor="afe-tags" className="text-xs font-semibold uppercase tracking-wider text-ink-secondary">
              Tag (pisahkan dengan koma, maks. 8)
            </label>
            <input
              id="afe-tags"
              type="text"
              value={tagsRaw}
              onChange={(e) => setTagsRaw(e.target.value)}
              placeholder="kopi, keseharian, pasar"
              className="mt-1.5 h-11 w-full rounded-xl border border-line bg-white px-3.5 text-sm text-ink outline-none focus:border-navy-royal"
            />
          </div>

          {/* Cover */}
          <div className="sm:col-span-2">
            <CoverPicker coverImage={coverImage} onChange={setCoverImage} />
          </div>
        </div>

        {/* Status */}
        <div className="mt-6 grid gap-3 sm:grid-cols-2">
          {(
            [
              { value: "DRAFT" as const, label: "Simpan sebagai Draf", desc: "Belum tampil di publik. Bisa lanjut diedit kapan saja." },
              { value: "PUBLISHED" as const, label: "Terbitkan Sekarang", desc: "Langsung bisa dibaca semua orang." },
            ]
          ).map((opt) => (
            <button
              key={opt.value}
              type="button"
              onClick={() => setStatus(opt.value)}
              className={cn(
                "rounded-2xl border-2 p-4 text-left transition-all",
                status === opt.value
                  ? "border-navy bg-surface"
                  : "border-line bg-surface-muted hover:border-navy-royal/50",
              )}
              aria-pressed={status === opt.value}
            >
              <span className={cn("block text-sm font-bold", status === opt.value ? "text-navy" : "text-ink")}>
                {opt.label}
              </span>
              <span className="mt-1 block text-xs text-ink-secondary">{opt.desc}</span>
            </button>
          ))}
        </div>

        {formError && (
          <div role="alert" className="mt-4 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
            {formError}
          </div>
        )}

        {/* Tombol utama sesuai status dipilih + tombol aksi cepat */}
        <div className="mt-6 flex flex-col gap-3 sm:flex-row">
          <button
            type="button"
            onClick={() => setStatus("DRAFT")}
            disabled={saving}
            className="inline-flex h-12 flex-1 items-center justify-center rounded-full border border-line bg-white px-6 text-sm font-semibold text-ink transition-colors hover:border-navy-royal hover:text-navy-royal disabled:opacity-60"
          >
            {saving && initial?.status === "DRAFT" ? "Menyimpan…" : "Simpan sebagai Draf"}
          </button>
          <button
            type="button"
            onClick={() => setStatus("PUBLISHED")}
            disabled={saving}
            className="inline-flex h-12 flex-1 items-center justify-center rounded-full bg-amber-brand px-6 text-sm font-bold text-navy-dark transition-all hover:bg-amber-highlight hover:shadow-md active:scale-[0.98] disabled:opacity-60"
          >
            {saving && initial?.status === "PUBLISHED" ? "Menerbitkan…" : "Terbitkan Sekarang"}
          </button>
        </div>
        <p className="mt-3 text-center text-xs text-ink-secondary sm:text-left">
          Tekan tombol di atas sesuai status yang tampil terpilih (sedang:{" "}
          <strong className="text-ink">{status === "DRAFT" ? "Draf" : "Terbit"}</strong>).
          <Link href="/dashboard" className="ml-2 text-navy-royal underline-offset-2 hover:underline">
            Kembali ke dashboard tanpa menyimpan
          </Link>
        </p>
      </div>
    </div>
  );
}
