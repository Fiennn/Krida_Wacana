/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      // Foto profil yang berasal dari Google OAuth (diizinkan untuk Avatar)
      { protocol: "https", hostname: "lh3.googleusercontent.com" },
      { protocol: "https", hostname: "ssl.gstatic.com" },
      // Gambar hasil unggahan di produksi (Vercel Blob)
      { protocol: "https", hostname: "*.public.blob.vercel-storage.com" },
      // Untuk gambar placeholder dari server lokal secara aman
      { protocol: "http", hostname: "localhost" },
    ],
    // Foto yang diunggah ke /public/uploads disajikan langsung (bukan unoptimized)
    formats: ["image/webp"],
  },
  // sharp dipakai di server (upload-service) — jangan di-bundle ulang
  serverExternalPackages: ["sharp"],
  eslint: {
    ignoreDuringBuilds: true,
  },
};

export default nextConfig;
