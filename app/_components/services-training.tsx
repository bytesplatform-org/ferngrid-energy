"use client";

import Image from "next/image";
import { Fragment, useRef, useState } from "react";
import { FRAGMENTS, HOME } from "@/lib/content";
import { ArcSurface } from "./motion/arc-surface";
import { gsap, ScrollTrigger, SplitText, useGSAP, MQ } from "./motion/gsap";
import { cx } from "./ui/primitives";
import servicesImg from "@/public/images/our-services.webp";
import trainingImg from "@/public/images/training-services.webp";

/** Scroll distance (viewport heights) the story stays pinned for. */
const PIN_VH = 5.2;
/** Scroll distance (viewport heights) of the approach, from "top 80%" to the pin. */
const APPROACH_VH = 0.8;
/** The word the camera dives through, and the letter it dives into. */
const HOLE_WORD = "SERVICES";
const HOLE_CHAR = HOLE_WORD.indexOf("I");
/** Final scale of the dive: well past the point where the "I" fills the screen. */
const ZOOM_MAX = 90;
/** Largest size (px) the glyph itself is ever drawn at during the dive. */
const TEXT_PX_CAP = 7000;
/** Half the width of the I's stroke, in em (Dosis bold). */
const STEM_HALF_EM = 0.066;
const TRIAD_SIZE = "clamp(4rem, 15vw, 16rem)";

/** Static layout (no JS / reduced motion): the two services side by side with their photos. */
function StaticLayout() {
  const rows = [
    {
      id: "our-services",
      ...HOME.ourServices,
      img: servicesImg,
      items: FRAGMENTS.serviceSteps,
    },
    {
      id: "training-services",
      ...HOME.trainingServices,
      img: trainingImg,
      items: FRAGMENTS.trainingOfferings,
    },
  ];
  return (
    <div className="mx-auto max-w-[1600px] pb-24 md:pb-32">
      <h2
        id="services-title"
        className="font-condensed text-condensed-xl uppercase"
      >
        <span className="block">Software.</span>{" "}
        <span className="block text-paper/35">Services.</span>{" "}
        <span className="block">Training.</span>
      </h2>
      <div className="mt-16 grid gap-16 lg:grid-cols-2 lg:gap-10">
        {rows.map((r) => (
          <article key={r.id} id={r.id} className="scroll-mt-24">
            <div className="relative aspect-[16/10] overflow-hidden rounded-[18px]">
              <Image
                src={r.img}
                alt=""
                fill
                sizes="(min-width: 1024px) 50vw, 100vw"
                placeholder="blur"
                className="photo object-cover"
              />
            </div>
            <h3 className="mt-8 text-2xl font-medium tracking-tight md:text-3xl">
              {r.title}
            </h3>
            <p className="mt-4 max-w-[60ch] text-base leading-relaxed text-muted md:text-lg">
              {r.body}
            </p>
            <ul className="mt-6 flex flex-wrap gap-2">
              {r.items.map((it) => (
                <li
                  key={it}
                  className="text-label rounded-full px-3 py-1.5 text-paper ring-1 ring-paper/20"
                >
                  {it}
                </li>
              ))}
            </ul>
          </article>
        ))}
      </div>
    </div>
  );
}

/**
 * Software. Services. Training. — a pinned, scroll-scrubbed story:
 * 1. The three words stand huge; the photo shows only through SERVICES.
 * 2. The camera dives through the "I" into the photo (Our Services).
 * 3. The copy rises line by line; the four service steps light up along a fern rail.
 * 4. The scene recedes like a card; the training photo wipes up over it, a giant
 *    TRAINING rises letter by letter, the copy follows and the offerings are dealt in.
 * Static two-column layout without JS / under reduced motion.
 */
export function ServicesTraining() {
  const ref = useRef<HTMLElement>(null);
  const [story, setStory] = useState(false);
  const { ourServices, trainingServices } = HOME;

  useGSAP(() => {
    const mm = gsap.matchMedia();
    mm.add(MQ.motion, () => {
      setStory(true);
      return () => setStory(false);
    });
  });

  useGSAP(
    () => {
      const section = ref.current;
      const stage = section?.querySelector<HTMLElement>("[data-stage]");
      if (!story || !section || !stage) return;
      const q = gsap.utils.selector(section);
      const hole = q("[data-hole]")[0] as unknown as SVGGElement;
      const holeText = q("[data-hole-text]")[0] as unknown as SVGTextElement;

      // The dive: scale the word about the centre of its "I", exponentially
      // (ZOOM_MAX ** t), which reads as a steady push rather than a lurch. The
      // transform is written directly (translate · scale · translate back) so the
      // origin can never shift mid-zoom.
      //
      // Chrome mis-renders text once it is drawn ~10,000px tall, so the real glyph
      // is only scaled until it reaches TEXT_PX_CAP. By then only the I's stroke is
      // on screen, and the photo is clipped to that same rectangle for the rest of
      // the dive: visually seamless, and nothing huge is ever rasterised.
      const plate = q("[data-plate]")[0] as HTMLElement;
      const clip = q("[data-svc-clip]")[0] as HTMLElement;
      const zoom = { t: 0 };
      const glyph = { cx: 0, cy: 0, half: 0, font: 0 };
      const measureGlyph = () => {
        try {
          const ext = holeText.getExtentOfChar(HOLE_CHAR);
          const origin = holeText.getStartPositionOfChar(HOLE_CHAR);
          glyph.font = parseFloat(getComputedStyle(holeText).fontSize);
          glyph.cx = ext.x + ext.width / 2; // the I's stroke is centred in its advance
          glyph.cy = origin.y - glyph.font * 0.35; // middle of the capital
          glyph.half = glyph.font * STEM_HALF_EM;
        } catch {
          glyph.cx = stage.clientWidth / 2;
          glyph.cy = stage.clientHeight / 2;
        }
      };
      const applyZoom = () => {
        measureGlyph(); // cheap; always matches the font actually rendered
        const sc = Math.pow(ZOOM_MAX, zoom.t);
        const handoff = glyph.font ? TEXT_PX_CAP / glyph.font : ZOOM_MAX;
        const { cx, cy, half } = glyph;
        if (sc < handoff) {
          plate.style.display = "";
          clip.style.clipPath = "";
          hole.setAttribute(
            "transform",
            `translate(${cx} ${cy}) scale(${sc}) translate(${-cx} ${-cy})`,
          );
        } else {
          plate.style.display = "none";
          const left = cx - sc * half;
          const right = stage.clientWidth - (cx + sc * half);
          clip.style.clipPath = `inset(0px ${Math.max(0, right)}px 0px ${Math.max(0, left)}px)`;
        }
      };
      applyZoom();
      const onRefresh = () => applyZoom();
      ScrollTrigger.addEventListener("refresh", onRefresh);
      document.fonts?.ready.then(onRefresh);

      // Body copy: masked lines (padding keeps descenders inside the masks).
      const splits = q("[data-lines]").map((el) =>
        SplitText.create(el, {
          type: "lines",
          mask: "lines",
          linesClass: "st-line",
        }),
      );
      splits.forEach((s) =>
        gsap.set(s.masks, {
          paddingBottom: "0.2em",
          marginBottom: "-0.2em",
          paddingTop: "0.05em",
          marginTop: "-0.05em",
        }),
      );
      const svcLines = splits[0].lines;
      const trnLines = splits[1].lines;

      // Explicit starting states for every staggered target (a staggered fromTo
      // only pre-renders its first target).
      gsap.set(q("[data-tri]"), { xPercent: -50, yPercent: -50 });
      gsap.set(q("[data-tri-word]"), { yPercent: 110 });
      gsap.set(q("[data-svc-word]"), { yPercent: 110 });
      gsap.set(q("[data-trn-word]"), { yPercent: 110 });
      gsap.set([...svcLines, ...trnLines], { yPercent: 105 });
      gsap.set(q("[data-step]"), { autoAlpha: 0.18, x: -16 });
      gsap.set(q("[data-node]"), { scale: 0 });
      gsap.set(q("[data-tchar]"), { yPercent: 105 });
      gsap.set(q("[data-offer]"), {
        autoAlpha: 0,
        y: () => window.innerHeight * 0.6,
        rotate: (i) => [-14, 6, 18][i % 3],
      });

      // The pin on its own…
      const pinST = ScrollTrigger.create({
        trigger: stage,
        start: "top top",
        end: () => `+=${window.innerHeight * PIN_VH}`,
        pin: true,
        invalidateOnRefresh: true,
      });

      // …and one scrubbed timeline for the whole sequence.
      const pin = gsap.timeline({ defaults: { ease: "none" } });
      pin
        // 1 → 2. side words leave; the camera dives through the "I"
        .to(
          q("[data-tri='top'] [data-tri-word]"),
          { yPercent: -110, duration: 0.3, ease: "power2.in" },
          0,
        )
        .to(
          q("[data-tri='bottom'] [data-tri-word]"),
          { yPercent: 110, duration: 0.3, ease: "power2.in" },
          0,
        )
        .fromTo(
          zoom,
          { t: 0 },
          { t: 1, duration: 1.2, ease: "power1.inOut", onUpdate: applyZoom },
          0.15,
        )
        .fromTo(
          q("[data-svc-media]"),
          { scale: 1.25 },
          { scale: 1, duration: 1.2 },
          0.15,
        )
        // the photo dims gradually all the way through the dive
        .fromTo(
          q("[data-svc-shade]"),
          { autoAlpha: 0 },
          { autoAlpha: 1, duration: 1.2, ease: "power1.in" },
          0.15,
        )
        .fromTo(
          q("[data-svc-content]"),
          { autoAlpha: 0 },
          { autoAlpha: 1, duration: 0.05 },
          1.35,
        )
        // 3. Our Services
        .to(
          q("[data-svc-word]"),
          { yPercent: 0, duration: 0.3, stagger: 0.08, ease: "power3.out" },
          1.4,
        )
        .fromTo(
          q("[data-svc-rule]"),
          { scaleX: 0 },
          { scaleX: 1, duration: 0.3, ease: "power2.out" },
          1.55,
        )
        .to(
          svcLines,
          { yPercent: 0, duration: 0.3, stagger: 0.07, ease: "power3.out" },
          1.6,
        )
        .fromTo(
          q("[data-rail-fill]"),
          { scaleY: 0 },
          { scaleY: 1, duration: 1.1 },
          2.15,
        );
      q("[data-step]").forEach((step, i) => {
        const at = 2.15 + i * 0.3;
        pin
          .to(
            step,
            { autoAlpha: 1, x: 0, duration: 0.18, ease: "power3.out" },
            at,
          )
          .to(
            step.querySelector("[data-node]"),
            { scale: 1, duration: 0.14, ease: "back.out(3)" },
            at,
          );
      });
      pin
        .addLabel("services", 3.4)
        // 4. the scene recedes; training wipes up over it
        .to(
          q("[data-svc-content]"),
          { yPercent: -12, autoAlpha: 0, duration: 0.4, ease: "power2.in" },
          3.7,
        )
        .to(
          q("[data-svc-scene]"),
          {
            scale: 0.86,
            borderRadius: 28,
            duration: 0.7,
            ease: "power2.inOut",
          },
          3.8,
        )
        // darken with an overlay (a CSS filter here made Chrome paint the scene black)
        .fromTo(
          q("[data-svc-dim]"),
          { autoAlpha: 0 },
          { autoAlpha: 0.6, duration: 0.7, ease: "power2.inOut" },
          3.8,
        )
        .fromTo(
          q("[data-trn-panel]"),
          { clipPath: "inset(100% 0% 0% 0% round 0px)" },
          {
            clipPath: "inset(0% 0% 0% 0% round 0px)",
            duration: 0.8,
            ease: "power3.inOut",
          },
          4.0,
        )
        .fromTo(
          q("[data-trn-media]"),
          { yPercent: 18, scale: 1.15 },
          { yPercent: 0, scale: 1, duration: 0.9, ease: "power3.out" },
          4.0,
        )
        .to(
          q("[data-tchar]"),
          { yPercent: 0, duration: 0.5, stagger: 0.05, ease: "power3.out" },
          4.5,
        )
        .to(
          q("[data-trn-word]"),
          { yPercent: 0, duration: 0.3, stagger: 0.08, ease: "power3.out" },
          4.75,
        )
        .fromTo(
          q("[data-trn-rule]"),
          { scaleX: 0 },
          { scaleX: 1, duration: 0.3, ease: "power2.out" },
          4.9,
        )
        .to(
          trnLines,
          { yPercent: 0, duration: 0.3, stagger: 0.06, ease: "power3.out" },
          4.95,
        )
        .to(
          q("[data-offer]"),
          {
            autoAlpha: 1,
            y: 0,
            rotate: 0,
            duration: 0.5,
            stagger: 0.18,
            ease: "power3.out",
          },
          5.5,
        )
        .addLabel("training", 6.4)
        .to({}, { duration: 0.6 }); // hold on the finished scene

      // Approach: the three words rise as the section arrives, before the pin.
      const approach = (pin.duration() * APPROACH_VH) / PIN_VH;
      const master = gsap.timeline({
        defaults: { ease: "none" },
        scrollTrigger: {
          trigger: stage,
          start: "top 80%",
          end: () => `+=${window.innerHeight * (APPROACH_VH + PIN_VH)}`,
          scrub: 0.7,
          invalidateOnRefresh: true,
        },
      });
      master
        .to(
          q("[data-tri-word]"),
          {
            yPercent: 0,
            duration: approach * 0.6,
            stagger: approach * 0.12,
            ease: "power3.out",
          },
          approach * 0.1,
        )
        .add(pin, approach);

      // Anchors (#our-services / #training-services) land on their finished beats.
      const placeAnchors = () => {
        const total = master.duration();
        const span = window.innerHeight * (APPROACH_VH + PIN_VH);
        const startY = master.scrollTrigger!.start;
        const sectionTop = section.getBoundingClientRect().top + window.scrollY;
        for (const [id, label] of [
          ["our-services", "services"],
          ["training-services", "training"],
        ] as const) {
          const el = section.querySelector<HTMLElement>(
            `[data-anchor="${id}"]`,
          );
          if (!el) continue;
          const t = (approach + pin.labels[label]) / total;
          el.style.top = `${startY + t * span - sectionTop}px`;
        }
      };
      ScrollTrigger.addEventListener("refresh", placeAnchors);

      ScrollTrigger.sort();
      ScrollTrigger.refresh();

      return () => {
        ScrollTrigger.removeEventListener("refresh", placeAnchors);
        ScrollTrigger.removeEventListener("refresh", onRefresh);
        pinST.kill();
        splits.forEach((s) => s.revert());
      };
    },
    { scope: ref, dependencies: [story], revertOnUpdate: true },
  );

  return (
    <section
      ref={ref}
      aria-labelledby="services-title"
      className={cx(
        "surface-dark arc-next relative z-10",
        story ? "" : "px-5 md:px-10",
      )}
      // story: the stage starts right under the arc
      style={story ? { paddingTop: "var(--arc-depth)" } : undefined}
    >
      {/* No parallax: the ERA scene above is pinned. */}
      <ArcSurface tone="carbon-deep" />

      {!story ? (
        <StaticLayout />
      ) : (
        <>
          {/* Anchor targets, placed on their beats once the pin is measured. */}
          <span
            data-anchor="our-services"
            id="our-services"
            aria-hidden
            className="absolute left-0 h-px w-px"
          />
          <span
            data-anchor="training-services"
            id="training-services"
            aria-hidden
            className="absolute left-0 h-px w-px"
          />

          <div
            data-stage
            className="relative h-svh overflow-hidden bg-carbon-deep"
          >
            <h2 id="services-title" className="sr-only">
              Software. Services. Training.
            </h2>

            {/* ---------------- Services scene ---------------- */}
            <div
              data-svc-scene
              className="absolute inset-0 overflow-hidden will-change-transform"
            >
              <div data-svc-clip className="absolute inset-0">
                <div data-svc-media className="absolute inset-0">
                  <Image
                    src={servicesImg}
                    alt="A person working on a laptop at a white desk in a bright, minimal room"
                    fill
                    sizes="100vw"
                    placeholder="blur"
                    className="photo object-cover object-[50%_35%]"
                  />
                </div>
                <div
                  data-svc-shade
                  aria-hidden
                  className="invisible absolute inset-0 opacity-0 [background:linear-gradient(to_right,rgb(18_22_10/0.9),rgb(18_22_10/0.72)_55%,rgb(18_22_10/0.55)),linear-gradient(to_top,rgb(18_22_10/0.6),transparent_50%)]"
                />
              </div>

              <div
                data-svc-dim
                aria-hidden
                className="invisible absolute inset-0 z-30 bg-carbon-deep opacity-0"
              />

              {/* Carbon plate with the word cut out of it: the photo shows only through SERVICES */}
              <svg
                data-plate
                aria-hidden
                className="absolute inset-0 size-full"
              >
                <defs>
                  <mask
                    id="services-hole"
                    maskUnits="userSpaceOnUse"
                    x="0"
                    y="0"
                    width="100%"
                    height="100%"
                  >
                    <rect width="100%" height="100%" fill="#fff" />
                    <g data-hole>
                      <text
                        data-hole-text
                        x="50%"
                        y="50%"
                        dy="0.35em"
                        textAnchor="middle"
                        className="font-condensed"
                        style={{ fontSize: TRIAD_SIZE }}
                        fill="#000"
                      >
                        {HOLE_WORD}
                      </text>
                    </g>
                  </mask>
                </defs>
                <rect
                  width="100%"
                  height="100%"
                  className="fill-carbon-deep"
                  mask="url(#services-hole)"
                />
              </svg>

              {/* SOFTWARE. / TRAINING. above and below the cut-out word */}
              {(
                [
                  ["top", "Software.", "calc(50% - 0.92em)"],
                  ["bottom", "Training.", "calc(50% + 0.92em)"],
                ] as const
              ).map(([pos, word, top]) => (
                <p
                  key={pos}
                  data-tri={pos}
                  aria-hidden
                  className="font-condensed absolute left-1/2 overflow-hidden leading-[0.9] whitespace-nowrap text-paper/25 uppercase"
                  style={{ fontSize: TRIAD_SIZE, top }}
                >
                  <span data-tri-word className="block pb-[0.04em]">
                    {word}
                  </span>
                </p>
              ))}

              {/* Our Services */}
              <div
                data-svc-content
                className="invisible absolute inset-0 flex flex-col justify-center gap-8 px-5 pt-20 pb-8 md:px-10 lg:grid lg:grid-cols-12 lg:items-center lg:gap-10 lg:pt-24"
              >
                <div className="lg:col-span-6">
                  <h3 className="font-condensed text-[clamp(2.5rem,6vw,6.5rem)] leading-[0.9] text-paper uppercase">
                    {ourServices.title.split(" ").map((w, i) => (
                      <Fragment key={w}>
                        {i > 0 && " "}
                        <span className="inline-block overflow-hidden pb-[0.05em] align-bottom">
                          <span data-svc-word className="inline-block">
                            {w}
                          </span>
                        </span>
                      </Fragment>
                    ))}
                  </h3>
                  <span
                    data-svc-rule
                    aria-hidden
                    className="mt-4 block h-[2px] w-20 origin-left bg-fern md:mt-6"
                  />
                  <p
                    data-lines
                    className="mt-5 max-w-[54ch] text-[15px] leading-relaxed text-paper/85 md:mt-7 md:text-[clamp(1rem,1.2vw,1.2rem)]"
                  >
                    {ourServices.body}
                  </p>
                </div>

                <ol className="relative lg:col-span-5 lg:col-start-8">
                  {/* rail */}
                  <span
                    aria-hidden
                    className="absolute top-2 bottom-2 left-[7px] w-px bg-paper/15"
                  >
                    <span
                      data-rail-fill
                      className="absolute inset-0 origin-top bg-fern"
                    />
                  </span>
                  {FRAGMENTS.serviceSteps.map((s) => (
                    <li
                      key={s}
                      data-step
                      className="relative py-2 pl-10 md:py-[min(1.1rem,2svh)]"
                    >
                      <span
                        aria-hidden
                        className="absolute top-1/2 left-0 size-[15px] -translate-y-1/2 rounded-full bg-carbon-deep ring-1 ring-paper/30"
                      >
                        <span
                          data-node
                          className="absolute inset-[3px] rounded-full bg-fern"
                        />
                      </span>
                      <span className="font-display block text-[clamp(1.2rem,2.2vw,2.25rem)] leading-tight text-paper">
                        {s}
                      </span>
                    </li>
                  ))}
                </ol>
              </div>
            </div>

            {/* ---------------- Training panel (wipes up over the services scene) ---------------- */}
            <div
              data-trn-panel
              className="absolute inset-0 overflow-hidden bg-carbon-deep [clip-path:inset(100%_0%_0%_0%)]"
            >
              <div data-trn-media className="absolute inset-0">
                <Image
                  src={trainingImg}
                  alt="Empty boardroom with a long timber table, black office chairs and a blank presentation screen"
                  fill
                  sizes="100vw"
                  placeholder="blur"
                  className="photo object-cover"
                />
              </div>
              <div
                aria-hidden
                className="absolute inset-0 [background:linear-gradient(to_right,rgb(18_22_10/0.92),rgb(18_22_10/0.7)_55%,rgb(18_22_10/0.5)),linear-gradient(to_top,rgb(18_22_10/0.75),transparent_55%)]"
              />

              {/* Giant word along the bottom edge */}
              <p
                aria-hidden
                className="font-condensed absolute inset-x-0 -bottom-[0.14em] flex justify-center overflow-hidden text-[24vw] leading-[0.9] text-paper/[0.08] uppercase"
              >
                {"Training".split("").map((c, i) => (
                  <span key={i} data-tchar className="inline-block">
                    {c}
                  </span>
                ))}
              </p>

              <div className="absolute inset-0 flex flex-col justify-center gap-6 px-5 pt-20 pb-8 md:px-10 lg:grid lg:grid-cols-12 lg:items-center lg:gap-10 lg:pt-24">
                <div className="lg:col-span-6">
                  <h3 className="font-condensed text-[clamp(2.5rem,6vw,6.5rem)] leading-[0.9] text-paper uppercase">
                    {trainingServices.title.split(" ").map((w, i) => (
                      <Fragment key={w}>
                        {i > 0 && " "}
                        <span className="inline-block overflow-hidden pb-[0.05em] align-bottom">
                          <span data-trn-word className="inline-block">
                            {w}
                          </span>
                        </span>
                      </Fragment>
                    ))}
                  </h3>
                  <span
                    data-trn-rule
                    aria-hidden
                    className="mt-4 block h-[2px] w-20 origin-left bg-fern md:mt-6"
                  />
                  <p
                    data-lines
                    className="mt-5 max-w-[56ch] text-[14px] leading-relaxed text-paper/85 md:mt-7 md:text-[clamp(1rem,1.15vw,1.15rem)]"
                  >
                    {trainingServices.body}
                  </p>
                </div>

                <ul className="flex flex-col gap-2 lg:col-span-5 lg:col-start-8 lg:gap-4">
                  {FRAGMENTS.trainingOfferings.map((o, i) => (
                    <li
                      key={o}
                      data-offer
                      className={cx(
                        "invisible flex items-center gap-4 rounded-[14px] bg-paper px-4 py-3 text-carbon opacity-0 shadow-[0_24px_60px_-24px_rgb(0_0_0/0.7)] lg:rounded-[18px] lg:px-6 lg:py-6",
                        ["lg:mr-16", "lg:ml-8 lg:mr-8", "lg:ml-16"][i],
                      )}
                    >
                      <span
                        aria-hidden
                        className="size-2.5 shrink-0 rounded-full bg-fern"
                      />
                      <span className="font-display text-[clamp(1.05rem,1.8vw,1.85rem)] leading-tight">
                        {o}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </>
      )}
    </section>
  );
}
