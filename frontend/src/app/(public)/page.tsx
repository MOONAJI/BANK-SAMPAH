import Image from "next/image";
import Link from "next/link";
import { MapPin } from "lucide-react";
import { ButtonLink } from "@/components/ui/button";
import { getPublicWasteCategories } from "@/lib/api/waste";
import { PriceCards, PriceUnavailable } from "@/features/waste/price-cards";

const STEPS = [
  { title: "Pilah di rumah", body: "Pisahkan plastik, kertas, logam, dan kaca. Sampah bersih dihargai lebih baik." },
  { title: "Timbang di pos", body: "Petugas menimbang dan mencatat setoranmu. Harga mengikuti daftar hari itu." },
  { title: "Saldo masuk otomatis", body: "Cek buku tabungan digital kapan saja, lalu tarik tunai atau ke e-wallet." },
];

export default function LandingPage() {
  return (
    <div className="bg-surface">
      {/* Hero */}
      <section className="mx-auto grid max-w-6xl items-center gap-10 px-4 py-14 sm:px-6 lg:grid-cols-2 lg:py-16">
        <div>
          <p className="mb-3 text-sm font-semibold text-brand">Bank Sampah RW 05</p>
          <h1 className="font-display text-4xl leading-[1.1] font-bold tracking-tight text-balance sm:text-5xl">
            Sampah terpilah, saldo bertambah.
          </h1>
          <p className="mt-6 max-w-xl text-lg leading-relaxed text-neutral-600">
            Setoran ditimbang petugas, nilainya langsung masuk ke buku tabungan digitalmu. Tidak ada lagi buku tabungan
            yang hilang atau salah hitung.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <ButtonLink href="/daftar" size="lg">
              Daftar jadi nasabah
            </ButtonLink>
            <ButtonLink href="/harga" size="lg" variant="outline">
              Lihat harga sampah
            </ButtonLink>
          </div>
        </div>
        <Image
          src="/images/ilustrasi-bank-sampah.webp"
          width={2000}
          height={1372}
          alt="Warga menyerahkan sampah terpilah ke petugas di pos bank sampah, saldo masuk ke aplikasi di ponsel"
          priority
          sizes="(min-width: 1024px) 560px, 100vw"
          className="h-auto w-full rounded-xl border border-line"
        />
      </section>

      {/* Cara kerja */}
      <section className="border-y border-line">
        <div className="mx-auto max-w-6xl px-4 py-14 sm:px-6">
          <h2 className="text-2xl font-bold">Cara kerjanya</h2>
          <ol className="mt-8 grid gap-8 sm:grid-cols-3">
            {STEPS.map((step, i) => (
              <li key={step.title}>
                <span className="grid size-9 place-items-center rounded-full border border-neutral-500 text-sm font-semibold">
                  {i + 1}
                </span>
                <h3 className="mt-4 font-semibold">{step.title}</h3>
                <p className="mt-3 leading-relaxed text-neutral-600">{step.body}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* Harga hari ini */}
      <section className="mx-auto max-w-6xl px-4 py-14 sm:px-6">
        <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
          <div>
            <h2 className="text-2xl font-bold">Harga hari ini</h2>
            <p className="mt-1 text-neutral-600">Harga per kilogram dapat berubah sewaktu-waktu.</p>
          </div>
          <Link href="/harga" className="-my-2.5 inline-block py-2.5 text-sm font-semibold underline underline-offset-4">
            Semua harga →
          </Link>
        </div>
        <TodayPrices />
      </section>

      {/* Lokasi pos */}
      <section className="mx-auto grid max-w-6xl grid-cols-1 gap-5 px-4 pb-16 sm:px-6 lg:grid-cols-[minmax(0,1.6fr)_minmax(0,1fr)]">
        <div className="grid min-h-64 place-items-center rounded-(--radius-card) border-2 border-dashed border-neutral-300 bg-neutral-100 text-center text-neutral-500">
          <span className="flex items-center gap-2 px-4">
            <MapPin className="size-5" aria-hidden />
            Peta lokasi pos menyusul
          </span>
        </div>
        <div className="rounded-(--radius-card) border border-line p-5">
          <h3 className="font-semibold">Pos penimbangan</h3>
          <p className="mt-2 text-neutral-600">[ALAMAT POS]</p>
          <h3 className="mt-5 font-semibold">Jadwal</h3>
          <p className="mt-2 text-neutral-600">[HARI &amp; JAM PENIMBANGAN]</p>
        </div>
      </section>
    </div>
  );
}

async function TodayPrices() {
  const categories = await getPublicWasteCategories();
  if (!categories) return <PriceUnavailable />;
  return <PriceCards categories={categories} groups={["Plastik", "Kertas", "Logam", "Kaca"]} maxPerGroup={2} />;
}
