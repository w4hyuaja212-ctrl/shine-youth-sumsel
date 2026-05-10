import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { supabaseAdmin } from "@/integrations/supabase/client.server";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

const WA_GATEWAY = "https://wg.smam1plg.sch.id/send-message";
const WA_API_KEY = "ipNI84Is2yMmooy6yI0nPccCDzVCmf";
const WA_SENDER = "628128522928";

function normalizeWa(no: string): string {
  let n = no.replace(/\D/g, "");
  if (n.startsWith("0")) n = "62" + n.slice(1);
  if (!n.startsWith("62")) n = "62" + n;
  return n;
}

async function sendWhatsApp(number: string, message: string) {
  const url = `${WA_GATEWAY}?api_key=${WA_API_KEY}&sender=${WA_SENDER}&number=${normalizeWa(number)}&message=${encodeURIComponent(message)}`;
  try {
    const res = await fetch(url, { method: "GET" });
    const text = await res.text();
    return { ok: res.ok, status: res.status, body: text.slice(0, 500) };
  } catch (e) {
    return { ok: false, status: 0, body: (e as Error).message };
  }
}

// === Verifikasi pendaftaran oleh panitia + kirim WA otomatis ===
export const verifyRegistration = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d) =>
    z.object({
      registrationId: z.string().uuid(),
      newStatus: z.enum(["verified", "rejected", "submitted", "draft"]),
      catatan: z.string().max(1000).optional(),
    }).parse(d),
  )
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;

    // ambil pendaftaran (RLS akan memastikan panitia berhak)
    const { data: reg, error: rErr } = await supabase
      .from("registrations").select("*").eq("id", data.registrationId).single();
    if (rErr || !reg) throw new Error("Pendaftaran tidak ditemukan / akses ditolak.");

    // pastikan panitia berhak modify
    const { data: canMod } = await supabase.rpc("can_modify_lomba", {
      _user_id: userId, _lomba_name: reg.lomba_name,
    });
    if (!canMod) throw new Error("Anda tidak memiliki izin mengubah cabang ini.");

    const { error: uErr } = await supabase
      .from("registrations")
      .update({
        status: data.newStatus,
        catatan_panitia: data.catatan ?? null,
        verified_by: userId,
        verified_at: new Date().toISOString(),
      })
      .eq("id", data.registrationId);
    if (uErr) throw new Error(uErr.message);

    // ambil profil sekolah untuk info di pesan
    const { data: profile } = await supabaseAdmin
      .from("profiles").select("nama_sekolah,no_wa,nama_pic").eq("id", reg.school_id).single();

    const target = reg.pic_wa || profile?.no_wa;
    let waResult: { ok: boolean; status: number; body: string } | null = null;

    if (target) {
      const statusLabel: Record<string, string> = {
        verified: "✅ DITERIMA / TERVERIFIKASI",
        rejected: "❌ DITOLAK",
        submitted: "📨 KEMBALI KE STATUS DIAJUKAN",
        draft:    "📝 DIKEMBALIKAN KE DRAFT",
      };
      const lines = [
        `*SHINE OF SMAMSA 2026*`,
        `Halo ${profile?.nama_pic ?? "Bapak/Ibu"} dari ${profile?.nama_sekolah ?? "sekolah Anda"},`,
        ``,
        `Status pendaftaran tim/peserta Anda telah diperbarui:`,
        `• Cabang: *${reg.lomba_name}*${reg.kategori ? ` (${reg.kategori})` : ""}`,
        reg.nama_tim ? `• Tim: ${reg.nama_tim}` : ``,
        `• Status baru: *${statusLabel[data.newStatus] ?? data.newStatus}*`,
        data.catatan ? `\nCatatan panitia:\n${data.catatan}` : ``,
        ``,
        `Silakan login kembali ke dashboard untuk melihat detail.`,
        `— Panitia SOF SMAMSA 2026`,
      ].filter(Boolean).join("\n");
      waResult = await sendWhatsApp(target, lines);
    }

    return { ok: true, sent_to: target ?? null, wa: waResult };
  });

// === Kirim WA bebas (untuk uji coba / broadcast ringan, hanya panitia) ===
export const sendCustomWa = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d) =>
    z.object({ number: z.string().min(8).max(20), message: z.string().min(1).max(2000) }).parse(d),
  )
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    const { data: isP } = await supabase.rpc("is_panitia", { _user_id: userId });
    if (!isP) throw new Error("Hanya panitia yang dapat mengirim pesan.");
    return sendWhatsApp(data.number, data.message);
  });
