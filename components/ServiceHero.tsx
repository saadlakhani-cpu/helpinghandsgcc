import Image from "next/image";
import Link from "next/link";

export function ServiceHero({
  eyebrow,
  title,
  description,
  image,
  action,
  href,
  secondary,
}: {
  eyebrow: string;
  title: string;
  description: string;
  image: string;
  action: string;
  href: string;
  secondary?: { label: string; href: string };
}) {
  return (
    <section className="relative isolate overflow-hidden bg-neutral-900 text-white">
      <Image
        src={image}
        alt="Illustrative AI workshop and business workflow"
        fill
        priority
        sizes="100vw"
        className="object-cover object-center"
      />
      <div className="absolute inset-0 bg-black/45" />
      <div className="relative mx-auto flex min-h-[460px] max-w-6xl items-center px-4 py-16 sm:px-6 lg:min-h-[500px]">
        <div className="max-w-xl">
          <p className="text-sm font-semibold text-emerald-200">{eyebrow}</p>
          <h1 className="mt-4 text-4xl font-bold leading-tight sm:text-5xl">
            {title}
          </h1>
          <p className="mt-5 max-w-lg text-lg leading-7 text-white/90">
            {description}
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              href={href}
              className="rounded-md bg-emerald-600 px-6 py-3 text-sm font-semibold text-white hover:bg-emerald-700"
            >
              {action}
            </Link>
            {secondary && (
              <Link
                href={secondary.href}
                className="rounded-md border border-white/70 bg-black/20 px-6 py-3 text-sm font-semibold text-white hover:bg-black/40"
              >
                {secondary.label}
              </Link>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
