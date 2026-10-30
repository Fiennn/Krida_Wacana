import sanitizeHtml from "sanitize-html";

/**
 * Susunan tag yang diizinkan pada konten artikel dari editor Tiptap.
 * Semua tag/atribut lain akan dihapus (mencegah XSS).
 */
const OPSI_SANITIZE: sanitizeHtml.IOptions = {
  allowedTags: [
    "p", "br", "b", "strong", "i", "em", "u", "s", "del",
    "h1", "h2", "h3", "h4", "blockquote",
    "ul", "ol", "li",
    "a", "img", "code", "pre",
    "hr", "span", "mark", "figure", "figcaption",
  ],
  allowedAttributes: {
    a: ["href", "target", "rel", "title"],
    img: ["src", "alt", "title", "width", "height", "loading"],
    span: ["class"],
    p: ["class"],
    code: ["class"],
    pre: ["class"],
    mark: ["class"],
  },
  // Link eksternal dibuka di tab baru + tanpa kebocoran referer (noopener)
  transformTags: {
    a: sanitizeHtml.simpleTransform("a", { rel: "noopener noreferrer", target: "_blank" }),
  },
  allowedSchemes: ["http", "https", "data"],
  allowedIframeHostnames: [],
};

/**
 * Bersihkan HTML dari editor.
 * Dipakai di waktu simpan (server action tulis/edit) DAN saat render.
 */
export function sanitizeArticleHtml(html: string): string {
  return sanitizeHtml(html, OPSI_SANITIZE);
}

/** Ekstrak teks biasa dari HTML (untuk meta deskripsi, estimasi kata, dsb.). */
export function htmlToText(html: string): string {
  return sanitizeHtml(html, { allowedTags: [], allowedAttributes: {} })
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .trim();
}
