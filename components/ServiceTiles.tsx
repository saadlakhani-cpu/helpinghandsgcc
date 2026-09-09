import Image from "next/image";
import Link from "next/link";
import { trainingTracks } from "@/lib/training";
export function ServiceTiles() {
  return (
    <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
      {trainingTracks.map((track) => (
        <article key={track.slug}>
          <Link href={`/ai-training/${track.slug}`} className="group block">
            <div className="relative aspect-[3/2] overflow-hidden rounded-lg">
              <Image src={`/images/services/${track.image}.webp`} alt={track.alt} fill sizes="(max-width:640px) 100vw, (max-width:1024px) 50vw, 25vw" className="object-cover transition duration-300 group-hover:scale-[1.03]" />
            </div>
            <h3 className="mt-5 text-xl font-bold">{track.title}</h3>
            <p className="mt-2 text-sm leading-6 text-gray-600">{track.summary}</p>
            <p className="mt-4 text-sm font-semibold text-finance">Explore Training <span aria-hidden="true">&rarr;</span></p>
          </Link>
        </article>
      ))}
    </div>
  );
}
