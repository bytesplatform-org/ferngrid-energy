"use client";

import Image, { type StaticImageData } from "next/image";
import { useRef, useState } from "react";
import { gsap, useGSAP, MQ } from "./motion/gsap";
import services from "@/public/images/our-services.webp";
import training from "@/public/images/training-services.webp";
import fest1 from "@/public/images/fest-1.webp";
import fest2 from "@/public/images/fest-2.webp";
import fest3 from "@/public/images/fest-3.webp";
import fest4 from "@/public/images/fest-4.webp";
import powerLines from "@/public/images/power-lines.webp";

const SLIDES: { src: StaticImageData; alt: string; position?: string }[] = [
  { src: services, alt: "A person working on a laptop at a white desk in a bright, minimal room", position: "50% 35%" },
  { src: training, alt: "Empty boardroom with a long timber table, black office chairs and a blank presentation screen" },
  { src: fest1, alt: "Power plant with smoking stacks in a snowy valley" },
  { src: fest2, alt: "Wind turbines standing in a snow-covered field beside bare trees" },
  { src: fest3, alt: "Rows of solar panels in deep snow with a wind turbine behind" },
  { src: fest4, alt: "Niagara Falls in winter, mist rising over the falls" },
  { src: powerLines, alt: "Looking up at a transmission tower with power lines converging overhead", position: "50% 70%" },
];

const pad = (n: number) => String(n).padStart(2, "0");

/** Wide greyscale strip that crossfades through photos as it scrolls past. */
export function ImageStrip() {
  const ref = useRef<HTMLDivElement>(null);
  const [index, setIndex] = useState(0);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add(MQ.motion, () => {
        const slides = gsap.utils.toArray<HTMLElement>("[data-slide]");
        const tl = gsap.timeline({
          defaults: { ease: "none" },
          scrollTrigger: {
            trigger: ref.current,
            start: "top 80%",
            end: "bottom 20%",
            scrub: 0.4,
            onUpdate: (self) => setIndex(Math.min(SLIDES.length - 1, Math.floor(self.progress * SLIDES.length))),
          },
        });
        slides.forEach((s, i) => {
          if (i === 0) return;
          tl.fromTo(s, { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.6 }, i - 0.6);
        });
        tl.fromTo(slides, { scale: 1.08 }, { scale: 1, duration: SLIDES.length - 1 }, 0);
      });
    },
    { scope: ref },
  );

  return (
    <div ref={ref} className="relative aspect-[4/3] w-full overflow-hidden bg-carbon md:aspect-[21/9]">
      {SLIDES.map((s, i) => (
        <div key={i} data-slide className={i === 0 ? "absolute inset-0" : "absolute inset-0 opacity-0"}>
          <Image
            src={s.src}
            alt={s.alt}
            fill
            sizes="(min-width: 1600px) 1600px, 100vw"
            placeholder="blur"
            className="photo object-cover"
            style={{ objectPosition: s.position }}
          />
        </div>
      ))}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_top,rgb(18_22_10/0.55),transparent_40%)]"
      />
      <p aria-hidden className="text-label absolute bottom-4 left-4 text-paper md:bottom-6 md:left-6">
        <span className="text-paper">{pad(index + 1)}</span>
        <span className="text-paper/60"> / {pad(SLIDES.length)}</span>
      </p>
    </div>
  );
}
