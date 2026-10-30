/**
 * Membuat file logo PLACEHOLDER sementara di public/logo/.
 *
 * Ganti ketiga file PNG ini dengan logo resmi:
 *   public/logo/tut-wuri-handayani.png
 *   public/logo/sdn2-kemutug-lor.png
 *   public/logo/krida-wacana.png
 *
 * Jalankan: node scripts/generate-logo-placeholders.mjs
 */
import sharp from "sharp";
import fs from "node:fs";
import path from "node:path";

const dir = path.join(process.cwd(), "public", "logo");
fs.mkdirSync(dir, { recursive: true });

function grayBox(lines) {
  return Buffer.from(`
    <svg width="160" height="160" xmlns="http://www.w3.org/2000/svg">
      <rect x="2" y="2" width="156" height="156" rx="18" fill="#E2E8F0" stroke="#CBD5E1" stroke-width="2"/>
      ${lines
        .map(
          (line, i) =>
            `<text x="80" y="${68 + i * 26}" text-anchor="middle" font-family="Arial, sans-serif" font-size="17" font-weight="bold" fill="#64748B">${line}</text>`,
        )
        .join("")}
    </svg>
  `);
}

const krida = Buffer.from(`
  <svg width="512" height="512" xmlns="http://www.w3.org/2000/svg">
    <circle cx="256" cy="256" r="250" fill="#FFFFFF" stroke="#0B1F4B" stroke-width="12"/>
    <circle cx="256" cy="256" r="198" fill="#0B1F4B"/>
    <text x="256" y="314" text-anchor="middle" font-family="Georgia, serif" font-size="166" font-weight="bold" fill="#FBBF24">KW</text>
  </svg>
`);

const jobs = [
  { file: "tut-wuri-handayani.png", svg: grayBox(["TUT WURI", "HANDAYANI"]) },
  { file: "sdn2-kemutug-lor.png", svg: grayBox(["SDN 2", "KEMUTUG", "LOR"]) },
  { file: "krida-wacana.png", svg: krida },
];

for (const job of jobs) {
  const target = path.join(dir, job.file);
  await sharp(job.svg).png().toFile(target);
  console.log("✅", target);
}

console.log("Placeholder logo selesai. Ganti dengan logo resmi bila sudah tersedia.");
