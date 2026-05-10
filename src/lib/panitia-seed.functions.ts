import { createServerFn } from "@tanstack/react-start";
import { supabaseAdmin } from "@/integrations/supabase/client.server";
import { PANITIA_SEED, DEFAULT_PANITIA_PASSWORD } from "@/data/panitia";

// Seed semua akun panitia. Idempoten: skip jika user sudah ada.
// Endpoint ini publik (memang dirancang untuk first-run setup) tetapi:
// - hanya membuat user di domain @panitia.smamsa.local
// - jika sudah ada akun panitia di sistem, tidak akan membuat ulang
export const seedPanitia = createServerFn({ method: "POST" }).handler(async () => {
  const created: string[] = [];
  const existing: string[] = [];

  for (const p of PANITIA_SEED) {
    const email = `${p.username}@panitia.smamsa.local`;

    // cek apakah user sudah ada
    const { data: list } = await supabaseAdmin.auth.admin.listUsers({ page: 1, perPage: 1000 });
    const found = list?.users?.find((u) => u.email?.toLowerCase() === email.toLowerCase());

    let userId: string | undefined = found?.id;

    if (!userId) {
      const { data: created1, error } = await supabaseAdmin.auth.admin.createUser({
        email,
        password: DEFAULT_PANITIA_PASSWORD,
        email_confirm: true,
        user_metadata: {
          is_panitia: true,
          username: p.username,
          label: p.label,
          role: p.role,
          akses: p.akses,
        },
      });
      if (error) {
        console.error("createUser failed for", p.username, error);
        continue;
      }
      userId = created1.user?.id;
      created.push(p.username);
    } else {
      existing.push(p.username);
    }

    if (userId) {
      // pastikan profile row tidak nyangkut
      await supabaseAdmin.from("profiles").upsert({ id: userId, email, nama_sekolah: p.label });

      // assign role (UNIQUE user_id+role+akses_lomba sehingga aman idempoten)
      await supabaseAdmin.from("user_roles").upsert(
        {
          user_id: userId,
          role: p.role,
          akses_lomba: p.akses,
          label: p.label,
          username: p.username,
        },
        { onConflict: "user_id,role,akses_lomba" },
      );
    }
  }

  return { created, existing, total: PANITIA_SEED.length, password: DEFAULT_PANITIA_PASSWORD };
});
