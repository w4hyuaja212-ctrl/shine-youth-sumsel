import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { supabaseAdmin } from "@/integrations/supabase/client.server";
import { getNpsnEndpoints } from "./settings.functions";

const npsnEmail = (npsn: string) => `npsn-${npsn.trim()}@smamsa.local`;

type SchoolInfo = { npsn: string; nama: string; bentuk: string; alamat: string };

function normalizeSchool(json: any, npsn: string): SchoolInfo | null {
  // Schema A: api.fazriansyah → { data: { satuanPendidikan: {...} } }
  const s = json?.data?.satuanPendidikan;
  if (s?.npsn && String(s.npsn) === npsn) {
    return {
      npsn: String(s.npsn),
      nama: s.nama ?? "Sekolah",
      bentuk: s.bentukPendidikan ?? "",
      alamat: [s.alamatJalan, s.namaDesa, s.namaKecamatan, s.namaKabupaten, s.namaProvinsi].filter(Boolean).join(", "),
    };
  }
  // Schema B: api-sekolah-indonesia → { dataSekolah: [{...}] }
  const arr = Array.isArray(json?.dataSekolah) ? json.dataSekolah : null;
  const m = arr?.find((x: any) => String(x?.npsn).trim() === npsn) ?? arr?.[0];
  if (m?.npsn && String(m.npsn).trim() === npsn) {
    return {
      npsn: String(m.npsn).trim(),
      nama: m.sekolah ?? m.nama ?? "Sekolah",
      bentuk: m.bentuk ?? "",
      alamat: [m.alamat_jalan, m.kecamatan, m.kabupaten_kota, m.propinsi].filter(Boolean).join(", "),
    };
  }
  return null;
}

async function tryEndpoint(base: string, npsn: string, timeoutMs: number): Promise<SchoolInfo> {
  const url = `${base}/sekolah?npsn=${npsn}`;
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), timeoutMs);
  try {
    const res = await fetch(url, {
      headers: { Accept: "application/json", "User-Agent": "SMAMSA-Lomba/1.0" },
      signal: ctrl.signal,
    });
    if (!res.ok) throw new Error(`${base} → HTTP ${res.status}`);
    const json: any = await res.json().catch(() => null);
    const info = normalizeSchool(json, npsn);
    if (!info) throw new Error(`${base} → NPSN tidak ditemukan`);
    return info;
  } catch (e) {
    const msg = (e as Error)?.message || String(e);
    const hint = /abort/i.test(msg) ? `${base} → timeout ${timeoutMs / 1000}s`
      : /fetch failed|ENOTFOUND|EAI_AGAIN|ECONNREFUSED|ECONNRESET/i.test(msg) ? `${base} → host tidak dapat dihubungi`
      : msg;
    throw new Error(hint);
  } finally {
    clearTimeout(timer);
  }
}

async function fetchNpsnFromAnyEndpoint(npsn: string): Promise<SchoolInfo> {
  const endpoints = await getNpsnEndpoints();
  const TIMEOUT = 15_000;
  // Race semua endpoint paralel — yang pertama sukses dipakai
  const attempt = async () => {
    try {
      return await Promise.any(endpoints.map((b) => tryEndpoint(b, npsn, TIMEOUT)));
    } catch (e: any) {
      const errs: Error[] = e?.errors ?? [e];
      throw new Error(errs.map((x) => x?.message || String(x)).join(" | "));
    }
  };
  try {
    return await attempt();
  } catch (firstErr) {
    // Retry sekali (cold-start Vercel sering gagal di percobaan pertama)
    try {
      return await attempt();
    } catch (secondErr) {
      throw new Error(
        `Gagal menghubungi server NPSN. Detail: ${(secondErr as Error).message}. ` +
        `Minta Superadmin menambah/mengganti endpoint di menu Pengaturan.`,
      );
    }
  }
}

function jenjangFromBentuk(b: string | undefined): string {
  const v = (b || "").toUpperCase();
  if (["SD", "MI"].includes(v)) return "SD/MI";
  if (["SMP", "MTS"].includes(v)) return "SMP/MTs";
  if (["SMA", "MA", "SMK"].includes(v)) return "SMA/MA/SMK";
  return "SMP/MTs";
}

// Login sekolah: cukup NPSN. Server membuat/meremajakan akun + return password sementara.
export const loginByNPSN = createServerFn({ method: "POST" })
  .inputValidator((d) =>
    z.object({ npsn: z.string().regex(/^\d{8}$/, "NPSN harus 8 digit") }).parse(d),
  )
  .handler(async ({ data }) => {
    // 1) Verifikasi ke endpoint NPSN (failover beberapa link, dikelola Superadmin)
    const sat = await fetchNpsnFromAnyEndpoint(data.npsn);

    const email = npsnEmail(data.npsn);
    const namaSekolah = sat.nama;
    const alamat = sat.alamat;
    const jenjang = jenjangFromBentuk(sat.bentuk);
    const tempPassword = crypto.randomUUID() + "Aa1!";

    // 2) Cari akun lewat tabel profiles (npsn → uid)
    const { data: existingProfile } = await supabaseAdmin
      .from("profiles").select("id").eq("npsn", data.npsn).maybeSingle();

    let userId = existingProfile?.id ?? null;

    if (!userId) {
      const { data: created, error: cErr } = await supabaseAdmin.auth.admin.createUser({
        email,
        password: tempPassword,
        email_confirm: true,
        user_metadata: {
          npsn: data.npsn,
          nama_sekolah: namaSekolah,
          alamat,
          jenjang,
        },
      });
      if (cErr || !created.user) {
        // mungkin sudah ada di auth tapi tidak ada di profiles → cari via listUsers (paginasi pertama)
        const { data: list } = await supabaseAdmin.auth.admin.listUsers({ page: 1, perPage: 200 });
        const found = list?.users?.find((u) => u.email === email);
        if (!found) throw new Error(cErr?.message ?? "Gagal membuat akun sekolah.");
        userId = found.id;
      } else {
        userId = created.user.id;
      }
    }

    // 3) Set password sementara (rotasi setiap login)
    const { error: upErr } = await supabaseAdmin.auth.admin.updateUserById(userId!, {
      password: tempPassword,
      email_confirm: true,
    });
    if (upErr) throw new Error(upErr.message);

    // 4) Upsert profile dari Dapodik (refresh data)
    await supabaseAdmin.from("profiles").upsert({
      id: userId!,
      npsn: data.npsn,
      nama_sekolah: namaSekolah,
      alamat,
      jenjang,
    }, { onConflict: "id" });

    // 5) Pastikan role 'school' ada
    await supabaseAdmin.from("user_roles").upsert(
      { user_id: userId!, role: "school", label: namaSekolah },
      { onConflict: "user_id,role" },
    );

    return { email, tempPassword, namaSekolah };
  });
