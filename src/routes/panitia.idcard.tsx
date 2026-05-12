import { createFileRoute } from "@tanstack/react-router";
import { DashboardLayout } from "@/components/DashboardLayout";
import { PrintPage } from "./panitia.sertifikat";

export const Route = createFileRoute("/panitia/idcard")({
  head: () => ({ meta: [{ title: "Cetak ID Card — Panitia" }] }),
  component: () => <DashboardLayout mode="panitia"><PrintPage kind="id" /></DashboardLayout>,
});
