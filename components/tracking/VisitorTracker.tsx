"use client";

import { usePathname, useSearchParams } from "next/navigation";
import { useEffect, useRef } from "react";
import {
  initOrUpdateSession,
  recordActivity,
} from "@/lib/tracking-storage";

export default function VisitorTracker() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const lastTrackedPath = useRef<string>("");
  const readLoggedRef = useRef<boolean>(false);

  // 1. Lacak perpindahan halaman / artikel
  useEffect(() => {
    if (typeof window === "undefined") return;

    const fullPath = pathname + (searchParams?.toString() ? `?${searchParams.toString()}` : "");
    if (lastTrackedPath.current === fullPath) return;
    lastTrackedPath.current = fullPath;
    readLoggedRef.current = false;

    // Tunggu sedikit agar document.title sudah terpasang
    const timer = setTimeout(() => {
      let activityType: "page_view" | "article_view" | "category_view" | "search" = "page_view";
      let activityTitle = "Membuka Halaman";
      let detailName = "";

      if (pathname === "/") {
        activityTitle = "Membuka Beranda";
        detailName = "Beranda";
      } else if (pathname === "/kategori/profil-sekolah") {
        activityTitle = "Membuka Profil Sekolah";
        detailName = "Profil Sekolah";
        activityType = "category_view";
      } else if (pathname === "/kategori/kegiatan-sekolah") {
        activityTitle = "Membuka Kegiatan Sekolah";
        detailName = "Kegiatan Sekolah";
        activityType = "category_view";
      } else if (pathname === "/kategori/prestasi") {
        activityTitle = "Membuka Prestasi";
        detailName = "Prestasi Siswa";
        activityType = "category_view";
      } else if (pathname === "/kategori/pembelajaran") {
        activityTitle = "Membuka Pembelajaran";
        detailName = "Pembelajaran";
        activityType = "category_view";
      } else if (pathname === "/kategori/ekstrakurikuler") {
        activityTitle = "Membuka Ekstrakurikuler";
        detailName = "Ekstrakurikuler";
        activityType = "category_view";
      } else if (pathname.startsWith("/kategori/")) {
        const slug = pathname.replace("/kategori/", "");
        const cleanName = slug.replace(/-/g, " ");
        activityTitle = `Membuka Kategori: ${cleanName.charAt(0).toUpperCase() + cleanName.slice(1)}`;
        detailName = `Kategori ${cleanName}`;
        activityType = "category_view";
      } else if (pathname.startsWith("/artikel/")) {
        const h1Text = document.querySelector("h1")?.textContent?.trim();
        const title = h1Text || document.title.split("|")[0].trim() || pathname;
        activityTitle = `Membuka Artikel: ${title}`;
        detailName = title;
        activityType = "article_view";
      } else if (pathname === "/cari") {
        const q = searchParams?.get("q") || "";
        activityTitle = q ? `Mencari Artikel: "${q}"` : "Mencari Artikel";
        detailName = q ? `Pencarian: ${q}` : "Halaman Pencarian";
        activityType = "search";
      } else if (pathname === "/profil") {
        activityTitle = "Membuka Profil Penulis";
        detailName = "Profil";
      } else if (pathname === "/dashboard") {
        activityTitle = "Membuka Tulisan Saya";
        detailName = "Dashboard Penulis";
      } else if (pathname === "/tersimpan") {
        activityTitle = "Membuka Artikel Tersimpan";
        detailName = "Tersimpan";
      } else if (pathname === "/tulis") {
        activityTitle = "Membuka Halaman Tulis Artikel";
        detailName = "Editor Artikel";
      } else if (pathname.startsWith("/admin")) {
        activityTitle = "Membuka Panel Admin";
        detailName = "Panel Admin";
      } else {
        activityTitle = `Membuka Halaman: ${pathname}`;
        detailName = pathname;
      }

      recordActivity(activityType, activityTitle, pathname, detailName);
    }, 150);

    return () => clearTimeout(timer);
  }, [pathname, searchParams]);

  // 2. Heartbeat berkala untuk menghitung durasi sesi
  useEffect(() => {
    if (typeof window === "undefined") return;

    const interval = setInterval(() => {
      // Hanya perbarui jika tab aktif / terlihat
      if (document.visibilityState === "visible") {
        initOrUpdateSession();
      }
    }, 20000);

    return () => clearInterval(interval);
  }, []);

  // 3. Deteksi membaca artikel saat user scrolling
  useEffect(() => {
    if (typeof window === "undefined") return;
    if (!pathname.startsWith("/artikel/")) return;

    function handleScroll() {
      if (readLoggedRef.current) return;
      const scrollY = window.scrollY;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      if (docHeight > 0 && scrollY / docHeight > 0.3) {
        readLoggedRef.current = true;
        const h1Text = document.querySelector("h1")?.textContent?.trim();
        const title = h1Text || document.title.split("|")[0].trim() || "Artikel";
        recordActivity(
          "article_read",
          `Membaca Artikel: ${title}`,
          pathname,
          title
        );
      }
    }

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [pathname]);

  // 4. Tangkap event kustom (misal tombol Bagikan)
  useEffect(() => {
    if (typeof window === "undefined") return;

    function onCustomTrack(e: Event) {
      const customEvent = e as CustomEvent<{
        type: "share" | "article_read" | "page_view";
        title: string;
        path?: string;
        details?: string;
      }>;
      if (customEvent.detail) {
        const { type, title, path, details } = customEvent.detail;
        recordActivity(type, title, path || window.location.pathname, details);
      }
    }

    window.addEventListener("krida_wacana_track_event", onCustomTrack);
    return () => window.removeEventListener("krida_wacana_track_event", onCustomTrack);
  }, []);

  return null;
}

