import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { PDFDocument, StandardFonts, rgb } from "pdf-lib";
import QRCode from "qrcode";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

const fmtDate = () => new Date().toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" });

async function fetchTeamData(supabase: any, registrationId: string) {
  const { data: reg } = await supabase.from("registrations").select("*").eq("id", registrationId).single();
  if (!reg) throw new Error("Pendaftaran tidak ditemukan");
  const { data: members } = await supabase.from("registration_members").select("*").eq("registration_id", registrationId);
  const { data: profile } = await supabase.from("profiles").select("nama_sekolah,npsn").eq("id", reg.school_id).single();
  return { reg, members: members ?? [], profile };
}

export const generateCertificates = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d) => z.object({ registrationId: z.string().uuid() }).parse(d))
  .handler(async ({ data, context }) => {
    const { reg, members, profile } = await fetchTeamData(context.supabase, data.registrationId);
    if (reg.status !== "verified") throw new Error("Sertifikat hanya untuk tim yang sudah TERVERIFIKASI.");

    const pdf = await PDFDocument.create();
    const font = await pdf.embedFont(StandardFonts.HelveticaBold);
    const fontReg = await pdf.embedFont(StandardFonts.Helvetica);
    const fontIt = await pdf.embedFont(StandardFonts.HelveticaOblique);

    const targets = members.length > 0 ? members : [{ nama: reg.nama_tim ?? "Peserta", peran: "Peserta" }];

    for (const m of targets) {
      const page = pdf.addPage([842, 595]); // A4 landscape
      // border
      page.drawRectangle({ x: 20, y: 20, width: 802, height: 555, borderColor: rgb(0.83, 0.69, 0.22), borderWidth: 4 });
      page.drawRectangle({ x: 32, y: 32, width: 778, height: 531, borderColor: rgb(0.83, 0.69, 0.22), borderWidth: 1 });
      // header
      page.drawText("SHINE OF SMAMSA 2026", { x: 421 - font.widthOfTextAtSize("SHINE OF SMAMSA 2026", 26) / 2, y: 510, size: 26, font, color: rgb(0.05, 0.13, 0.35) });
      page.drawText("SMA Muhammadiyah 1 Palembang", { x: 421 - fontReg.widthOfTextAtSize("SMA Muhammadiyah 1 Palembang", 12) / 2, y: 488, size: 12, font: fontReg, color: rgb(0.3, 0.3, 0.3) });
      // title
      page.drawText("SERTIFIKAT", { x: 421 - font.widthOfTextAtSize("SERTIFIKAT", 36) / 2, y: 420, size: 36, font, color: rgb(0.83, 0.69, 0.22) });
      page.drawText("Diberikan kepada:", { x: 421 - fontReg.widthOfTextAtSize("Diberikan kepada:", 14) / 2, y: 380, size: 14, font: fontReg });
      // name
      const nm = (m.nama || "Peserta").toUpperCase();
      const nmSize = nm.length > 30 ? 28 : 36;
      page.drawText(nm, { x: 421 - font.widthOfTextAtSize(nm, nmSize) / 2, y: 320, size: nmSize, font, color: rgb(0.05, 0.13, 0.35) });
      // line
      page.drawLine({ start: { x: 200, y: 305 }, end: { x: 642, y: 305 }, thickness: 1, color: rgb(0.83, 0.69, 0.22) });
      // body
      const sekolah = profile?.nama_sekolah ?? "—";
      const lines = [
        `Sebagai peserta cabang lomba ${reg.lomba_name}${reg.kategori ? ` (${reg.kategori})` : ""}`,
        `mewakili ${sekolah}`,
        `dalam ajang SHINE OF SMAMSA 2026 — Sportsmanship, Harmony, Innovation, Nurture, Excellence.`,
      ];
      lines.forEach((t, i) => {
        page.drawText(t, { x: 421 - fontReg.widthOfTextAtSize(t, 13) / 2, y: 270 - i * 20, size: 13, font: fontReg });
      });
      // footer
      page.drawText(`Palembang, ${fmtDate()}`, { x: 580, y: 130, size: 11, font: fontIt });
      page.drawText("Ketua Panitia", { x: 600, y: 70, size: 11, font });
      page.drawText("SHINE OF SMAMSA 2026", { x: 580, y: 56, size: 9, font: fontReg });
    }

    const bytes = await pdf.save();
    return { base64: Buffer.from(bytes).toString("base64"), filename: `sertifikat-${reg.lomba_slug}-${reg.id.slice(0, 6)}.pdf` };
  });

export const generateIdCards = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d) => z.object({ registrationId: z.string().uuid() }).parse(d))
  .handler(async ({ data, context }) => {
    const { reg, members, profile } = await fetchTeamData(context.supabase, data.registrationId);
    if (reg.status !== "verified") throw new Error("ID Card hanya untuk tim yang sudah TERVERIFIKASI.");

    const pdf = await PDFDocument.create();
    const font = await pdf.embedFont(StandardFonts.HelveticaBold);
    const fontReg = await pdf.embedFont(StandardFonts.Helvetica);

    const targets = members.length > 0 ? members : [{ nama: reg.nama_tim ?? "Peserta", peran: "Peserta", jenis_kelamin: "-", kelas: "-", nisn: "-" }];

    // 4 ID per A4 portrait (210x297mm). Card 85x54mm scaled
    const mm = 2.83465;
    const cardW = 85 * mm, cardH = 54 * mm;
    const perPage = 4;

    for (let pi = 0; pi < Math.ceil(targets.length / perPage); pi++) {
      const page = pdf.addPage([595, 842]);
      const slice = targets.slice(pi * perPage, pi * perPage + perPage);
      for (let i = 0; i < slice.length; i++) {
        const col = i % 1, row = Math.floor(i / 1);
        const x = (595 - cardW) / 2 + col * (cardW + 10);
        const y = 842 - 60 - (row + 1) * cardH - row * 15;
        const m = slice[i];
        // card bg
        page.drawRectangle({ x, y, width: cardW, height: cardH, color: rgb(0.05, 0.13, 0.35) });
        page.drawRectangle({ x, y: y + cardH - 22, width: cardW, height: 22, color: rgb(0.83, 0.69, 0.22) });
        page.drawText("SHINE OF SMAMSA 2026", { x: x + 8, y: y + cardH - 16, size: 11, font, color: rgb(0.05, 0.13, 0.35) });
        // QR
        const qrPng = await QRCode.toBuffer(`${reg.id}|${m.nama}|${reg.lomba_name}`, { width: 200, margin: 0 });
        const qr = await pdf.embedPng(qrPng);
        const qrSize = 60;
        page.drawImage(qr, { x: x + cardW - qrSize - 8, y: y + 8, width: qrSize, height: qrSize });
        // text
        const nm = String(m.nama || "Peserta").slice(0, 28);
        page.drawText(nm, { x: x + 8, y: y + cardH - 50, size: 14, font, color: rgb(1, 1, 1) });
        page.drawText(String(m.peran || "Peserta"), { x: x + 8, y: y + cardH - 66, size: 9, font: fontReg, color: rgb(0.83, 0.69, 0.22) });
        const meta = [`${reg.lomba_name}${reg.kategori ? ` • ${reg.kategori}` : ""}`, profile?.nama_sekolah ?? "", `NPSN ${profile?.npsn ?? "-"} • NISN ${m.nisn || "-"}`];
        meta.forEach((t, k) => {
          page.drawText(String(t).slice(0, 38), { x: x + 8, y: y + cardH - 86 - k * 12, size: 8, font: fontReg, color: rgb(0.9, 0.9, 0.95) });
        });
      }
    }

    const bytes = await pdf.save();
    return { base64: Buffer.from(bytes).toString("base64"), filename: `idcard-${reg.lomba_slug}-${reg.id.slice(0, 6)}.pdf` };
  });
