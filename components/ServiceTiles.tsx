import Image from "next/image";
import Link from "next/link";
const services = [
  {
    title: "AI for Finance",
    copy: "Practical AI skills for reports, analysis and everyday finance work.",
    image: "/images/services/finance.webp",
    href: "/ai-training",
    action: "Explore Training",
  },
  {
    title: "Corporate Workshops",
    copy: "Hands-on learning shaped around the tasks your team does every day.",
    image: "/images/services/workshop.webp",
    href: "/ai-training#corporate",
    action: "Train Your Team",
  },
  {
    title: "AI Solutions",
    copy: "Explore how documents and repetitive tasks become useful workflows.",
    image: "/images/services/workflow.webp",
    href: "/ai-solutions",
    action: "Discuss Your Needs",
  },
];
export function ServiceTiles() {
  return (
    <div className="grid gap-8 md:grid-cols-3">
      {services.map((s) => (
        <article key={s.title}>
          <Link href={s.href} className="group block">
            <div className="relative aspect-[3/2] overflow-hidden rounded-lg">
              <Image
                src={s.image}
                alt={
                  s.title === "Corporate Workshops"
                    ? "Illustrative corporate workshop"
                    : s.title === "AI for Finance"
                      ? "Illustrative finance professional reviewing a report"
                      : "Example invoice and structured spreadsheet"
                }
                fill
                sizes="(max-width: 768px) 100vw, 33vw"
                className="object-cover transition duration-300 group-hover:scale-[1.03]"
              />
            </div>
            <h3 className="mt-5 text-xl font-bold">{s.title}</h3>
            <p className="mt-2 text-sm leading-6 text-gray-600">{s.copy}</p>
            <p className="mt-4 text-sm font-semibold text-finance">
              {s.action} <span aria-hidden="true">&rarr;</span>
            </p>
          </Link>
        </article>
      ))}
    </div>
  );
}
