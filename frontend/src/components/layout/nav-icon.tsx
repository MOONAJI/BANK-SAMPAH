import {
  Banknote,
  ChartNoAxesCombined,
  CircleCheck,
  ClipboardPlus,
  History,
  House,
  LayoutGrid,
  PackagePlus,
  Tags,
  User,
  UserRound,
  Users,
  Wallet,
  type LucideIcon,
} from "lucide-react";
import type { NavIcon as NavIconName } from "@/lib/navigation";

const ICONS: Record<NavIconName, LucideIcon> = {
  dashboard: LayoutGrid,
  catat: ClipboardPlus,
  riwayat: History,
  verifikasi: CircleCheck,
  nasabah: Users,
  laporan: ChartNoAxesCombined,
  jenis: Tags,
  pengguna: UserRound,
  profil: User,
  beranda: House,
  tabungan: Wallet,
  setoran: PackagePlus,
  tarik: Banknote,
};

export function NavIcon({ name, className }: { name: NavIconName; className?: string }) {
  const Icon = ICONS[name];
  return <Icon aria-hidden className={className} strokeWidth={1.75} />;
}
