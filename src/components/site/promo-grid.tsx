import Image from "next/image";
import Link from "next/link";

const promos = [
  { src: "/banners/banner-3-garrafa-1014x535.jpg", alt: "Garrafa térmica 600ml personalizada" },
  { src: "/banners/banner-6-churrasco-1014x535.jpg", alt: "Kit churrasco personalizado" },
  { src: "/banners/banner-4-squeeze-1014x535.jpg", alt: "Squeeze dobrável em TPU 500ml" },
  { src: "/banners/banner-5-caderno-1014x535.jpg", alt: "Caderno ecológico com caneta" },
  { src: "/banners/banner-1-armband-1014x535.jpg", alt: "Braçadeira esportiva personalizada" },
  { src: "/banners/banner-2-bolsa-1014x535.jpg", alt: "Bolsa em tela PVC personalizada" },
  { src: "/banners/banner-8-frasqueira-1014x535.jpg", alt: "Frasqueira plástica 10L" },
];

export function PromoGridSection() {
  return (
    <section className="container-premium py-20">
      <h2 className="text-2xl font-semibold tracking-tight sm:text-3xl">Destaques da semana</h2>
      <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {promos.map((promo) => (
          <Link
            key={promo.src}
            href="/produtos"
            className="group relative aspect-[1014/535] overflow-hidden rounded-xl border border-border"
          >
            <Image
              src={promo.src}
              alt={promo.alt}
              fill
              className="object-cover transition-transform duration-500 group-hover:scale-105"
              sizes="(max-width: 1024px) 100vw, 33vw"
            />
          </Link>
        ))}
      </div>
    </section>
  );
}
