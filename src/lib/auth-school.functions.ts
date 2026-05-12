import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { supabaseAdmin } from "@/integrations/supabase/client.server";

const NPSN_API = "https://api.fazriansyah.eu.org/v1/sekolah";

const npsnEmail = (npsn: string) => `npsn-${npsn.trim()}@smamsa.local`;

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
    // 1) Verifikasi ke Dapodik publik
    const res = await fetch(`${NPSN_API}?npsn=${data.npsn}`, {
      headers: { Accept: "application/json" },
    }).catch(() => null);
    if (!res || !res.ok) throw new Error("Tidak dapat menghubungi server NPSN. Coba lagi.");
    const json: any = await res.json().catch(() => ({}));
    const sat = json?.data?.satuanPendidikan;
    if (!sat?.npsn || String(sat.npsn) !== data.npsn) {
      throw new Error("NPSN tidak ditemukan di Data Pokok Pendidikan.");
    }

    const email = npsnEmail(data.npsn);
    const namaSekolah: string = sat.nama ?? "Sekolah";
    const alamat = [sat.alamatJalan, sat.namaDesa, sat.namaKecamatan, sat.namaKabupaten, sat.namaProvinsi]
      .filter(Boolean).join(", ");
    const jenjang = jenjangFromBentuk(sat.bentukPendidikan);
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
