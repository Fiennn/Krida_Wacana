/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      // Foto profil yang berasal dari Google OAuth (diizinkan untuk Avatar)
      { protocol: "https", hostname: "lh3.googleusercontent.com" },
      { protocol: "https", hostname: "ssl.gstatic.com" },
      // Untuk gambar placeholder dari server lokal secara aman
      { protocol: "http", hostname: "localhost" },
    ],
    // Foto yang diunggah ke /public/uploads disajikan langsung (bukan unoptimized)
    formats: ["image/webp"],
  },
  // Tombol "Mulai" saat prisma generate dijalankan otomatis lewat script "build"
  eslint: {
    ignoreDuringBuilds: true,
  },
};

export default nextConfig;
