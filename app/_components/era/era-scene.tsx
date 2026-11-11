"use client";

import { Fragment, useCallback, useRef, useState, type KeyboardEvent } from "react";
import { FRAGMENTS, NERC } from "@/lib/content";
import { gsap, ScrollTrigger, useGSAP, MQ } from "../motion/gsap";
import { scrollToTarget } from "../motion/smooth-scroll";
import { SectionLabel, cx } from "../ui/primitives";
import { Callouts } from "./callouts";
import { PointCloud, type PointCloudHandle } from "./point-cloud";
import { SHAPES } from "./shapes";

/** Structural titles / ghost words for the four BAL-007-1 requirements. */
const STEPS = [
  { key: "load", title: "Load", ghost: "LOAD" },
  { key: "generation", title: "Generation", ghost: "GENERATION" },
  { key: "transfers", title: "Transfers", ghost: "TRANSFERS" },
  { key: "transmission", title: "Transmission", ghost: "TRANSMISSION" },
] as const;

/** carbon → warmer carbon → olive-tinted carbon */
const TONES = ["#1d220f", "#21230f", "#222711", "#252c14"];

const STEPS_END = 0.86; // remainder of the pin is the closing beat
const PIN_LENGTH = "+=360%";
const CLOSING = FRAGMENTS.eeaForecast.toUpperCase().replace("ERAS", "ERAs");
const pad = (n: number) => String(n).padStart(2, "0");

export function EraScene() {
  const sectionRef = useRef<HTMLElement>(null);
  const cloudRef = useRef<PointCloudHandle>(null);
  const triggerRef = useRef<ScrollTrigger | null>(null);
  const tabRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const [pinned, setPinned] = useState(false);
  const [active, setActive] = useState(0);
  const [closing, setClosing] = useState(false);

  // Decide layout: pinned stepper on desktop with motion, stacked cards otherwise.
  useGSAP(() => {
    const mm = gsap.matchMedia();
    mm.add(MQ.desktopMotion, () => {
      setPinned(true);
      return () => setPinned(false);
    });
  });

  // Pin + scroll → step mapping.
  useGSAP(
    () => {
      const section = sectionRef.current;
      if (!pinned || !section) return;

      const panels = section.querySelectorAll<HTMLElement>("[data-panel]");
      const ghosts = section.querySelectorAll<HTMLElement>("[data-ghost]");
      const callouts = section.querySelectorAll<HTMLElement>("[data-callouts]");
      gsap.set([...panels, ...ghosts, ...callouts].filter((_, i, a) => a.indexOf(_) === i), { autoAlpha: 0 });
      gsap.set([panels[0], ghosts[0], callouts[0]], { autoAlpha: 1 });
      gsap.set("[data-closing]", { autoAlpha: 0 });
      gsap.set("[data-closing-word]", { yPercent: 110 });

      triggerRef.current = ScrollTrigger.create({
        trigger: section,
        start: "top top",
        end: PIN_LENGTH,
        pin: true,
        anticipatePin: 1,
        onUpdate: (self) => {
          const p = self.progress;
          setActive(Math.min(STEPS.length - 1, Math.floor((p / STEPS_END) * STEPS.length)));
          setClosing(p > STEPS_END + 0.01);
        },
      });

      ScrollTrigger.sort();
      ScrollTrigger.refresh();

      return () => {
        triggerRef.current = null;
        gsap.set(
          [section, ...panels, ...ghosts, ...callouts, ...section.querySelectorAll("[data-panel-line],[data-era-stage],[data-closing],[data-closing-word]")],
          { clearProps: "all" },
        );
        setActive(0);
        setClosing(false);
      };
    },
    { dependencies: [pinned], revertOnUpdate: true },
  );

  // Step transitions (discrete, not scrubbed).
  useGSAP(
    () => {
      const section = sectionRef.current;
      if (!pinned || !section) return;
      const panels = gsap.utils.toArray<HTMLElement>("[data-panel]", section);
      const ghosts = gsap.utils.toArray<HTMLElement>("[data-ghost]", section);
      const callouts = gsap.utils.toArray<HTMLElement>("[data-callouts]", section);

      panels.forEach((panel, i) => {
        const on = i === active;
        const lines = panel.querySelectorAll("[data-panel-line]");
        if (on) {
          gsap.to(panel, { autoAlpha: 1, duration: 0.3, overwrite: true });
          gsap.fromTo(
            lines,
            { y: 40, autoAlpha: 0 },
            { y: 0, autoAlpha: 1, duration: 0.9, ease: "expo.out", stagger: 0.06, overwrite: true },
          );
        } else {
          gsap.to(panel, { autoAlpha: 0, duration: 0.35, overwrite: true });
        }
      });
      ghosts.forEach((g, i) =>
        gsap.to(g, {
          autoAlpha: i === active ? 1 : 0,
          xPercent: i === active ? 0 : i < active ? -6 : 6,
          duration: 1.1,
          ease: "expo.out",
          overwrite: true,
        }),
      );
      callouts.forEach((c, i) =>
        gsap.to(c, { autoAlpha: i === active ? 1 : 0, duration: 0.5, delay: i === active ? 0.6 : 0, overwrite: true }),
      );
      gsap.to(section, { backgroundColor: TONES[active], duration: 1, ease: "power2.out", overwrite: "auto" });
      cloudRef.current?.morphTo(active);
    },
    { dependencies: [active, pinned] },
  );

  // Closing beat.
  useGSAP(
    () => {
      if (!pinned) return;
      gsap.to("[data-era-stage]", { autoAlpha: closing ? 0 : 1, duration: 0.6, overwrite: true });
      gsap.to("[data-closing]", { autoAlpha: closing ? 1 : 0, duration: 0.4, overwrite: true });
      gsap.to("[data-closing-word]", {
        yPercent: closing ? 0 : 110,
        duration: closing ? 1.1 : 0.4,
        ease: closing ? "expo.out" : "power2.in",
        stagger: closing ? 0.04 : 0,
        overwrite: true,
      });
    },
    { scope: sectionRef, dependencies: [closing, pinned] },
  );

  /** Scroll so the pinned scene lands in the middle of step i. */
  const goTo = useCallback((i: number) => {
    const st = triggerRef.current;
    if (!st) return;
    scrollToTarget(st.start + ((i + 0.5) / STEPS.length) * STEPS_END * (st.end - st.start));
  }, []);

  const onTabKey = (e: KeyboardEvent<HTMLButtonElement>) => {
    const keys: Record<string, number> = {
      ArrowRight: (active + 1) % STEPS.length,
      ArrowLeft: (active - 1 + STEPS.length) % STEPS.length,
      Home: 0,
      End: STEPS.length - 1,
    };
    if (!(e.key in keys)) return;
    e.preventDefault();
    const next = keys[e.key];
    tabRefs.current[next]?.focus();
    goTo(next);
  };

  const reqs = NERC.requirements.accountFor;

  return (
    <section
      ref={sectionRef}
      aria-labelledby="era-title"
      className={cx(
        "surface-dark relative z-10 bg-carbon",
        pinned ? "h-svh overflow-hidden" : "overflow-clip px-5 py-24 md:px-10 md:py-32",
      )}
    >
      <div data-era-stage className={cx(pinned && "absolute inset-0")}>
        {/* Header */}
        <header className={cx(pinned ? "absolute top-24 left-10 z-10 w-[min(44vw,620px)]" : "mx-auto max-w-[1600px]")}>
          <SectionLabel index="03">What a Near-Term ERA must account for</SectionLabel>
          <h2 id="era-title" className="mt-6 text-sm font-medium text-paper/80">
            {NERC.requirements.heading}
          </h2>
          <p className="mt-3 max-w-[58ch] text-base leading-relaxed text-muted">{NERC.requirements.intro}</p>
        </header>

        {/* Steps */}
        <ol className={cx(pinned ? "absolute inset-0" : "mx-auto mt-16 max-w-[1600px] space-y-20 md:mt-24")}>
          {STEPS.map((s, i) => (
            <li
              key={s.key}
              id={`era-panel-${s.key}`}
              data-panel
              role={pinned ? "tabpanel" : undefined}
              aria-labelledby={pinned ? `era-tab-${s.key}` : undefined}
              aria-hidden={pinned && i !== active ? true : undefined}
              inert={pinned && i !== active ? true : undefined}
              className={cx(
                pinned
                  ? "pointer-events-none absolute inset-0"
                  : "relative grid gap-10 border-t border-line pt-10 md:grid-cols-2 md:gap-12",
              )}
            >
              <span
                data-ghost
                aria-hidden
                className={cx(
                  "font-display text-ghost pointer-events-none absolute whitespace-nowrap text-paper/[0.06] uppercase select-none",
                  pinned ? "bottom-[4vh] left-[-1.5vw]" : "top-6 right-0 text-[clamp(4rem,22vw,22rem)]",
                )}
              >
                {s.ghost}
              </span>

              <div
                className={cx(
                  pinned
                    ? "pointer-events-auto absolute top-1/2 left-10 w-[min(42vw,600px)] -translate-y-[28%]"
                    : "relative",
                )}
              >
                <p data-panel-line className="text-label text-muted">
                  {pad(i + 1)} / {pad(STEPS.length)}
                </p>
                <h3
                  data-panel-line
                  className="font-display mt-4 text-[clamp(3.75rem,8.5vw,10rem)] leading-[0.88]"
                >
                  {s.title}
                </h3>
                <p data-panel-line className="mt-6 max-w-[40ch] text-lg leading-relaxed text-paper/80">
                  {reqs[i]}
                </p>
                <p data-panel-line className="text-label mt-8 flex flex-wrap gap-x-6 gap-y-2 border-t border-line pt-4 text-muted">
                  <span>BAL-007-1</span>
                  <span>Requirement {pad(i + 1)}</span>
                  <span>Near-Term ERA</span>
                </p>
              </div>

              {!pinned && (
                <div className="relative mx-auto aspect-square w-full max-w-[460px]">
                  <PointCloud mode="static" initial={i} className="absolute inset-0 size-full" />
                  <Callouts items={SHAPES[i].callouts} />
                </div>
              )}
            </li>
          ))}
        </ol>

        {/* Shared morphing visual (pinned only) */}
        {pinned && (
          <div className="absolute top-1/2 right-10 aspect-square w-[min(40vw,62vh)] -translate-y-[44%]">
            <PointCloud ref={cloudRef} mode="morph" initial={0} className="absolute inset-0 size-full" />
            {SHAPES.map((shape) => (
              <div key={shape.key} data-callouts className="absolute inset-0">
                <Callouts items={shape.callouts} />
              </div>
            ))}
          </div>
        )}

        {/* Tabs (pinned only) */}
        {pinned && (
          <div className="absolute inset-x-0 bottom-7 z-20 flex justify-center">
            <div
              role="tablist"
              aria-label="BAL-007-1 requirements"
              className="flex gap-1.5 rounded-full bg-carbon/70 p-1.5 ring-1 ring-paper/10 backdrop-blur-sm"
            >
              {STEPS.map((s, i) => {
                const selected = i === active;
                return (
                  <button
                    key={s.key}
                    ref={(el) => {
                      tabRefs.current[i] = el;
                    }}
                    id={`era-tab-${s.key}`}
                    role="tab"
                    type="button"
                    aria-selected={selected}
                    aria-controls={`era-panel-${s.key}`}
                    tabIndex={selected ? 0 : -1}
                    onClick={() => goTo(i)}
                    onKeyDown={onTabKey}
                    className={cx(
                      "text-label flex h-9 items-center gap-2 rounded-full px-4 transition-colors duration-300",
                      selected ? "bg-paper text-carbon" : "text-paper/70 hover:text-paper",
                    )}
                  >
                    {selected && <span aria-hidden className="size-1.5 rounded-full bg-fern" />}
                    {pad(i + 1)} {s.title}
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Closing beat */}
      <div
        data-closing
        className={cx(
          "flex items-center justify-center text-center",
          pinned ? "absolute inset-0 px-10" : "mx-auto mt-28 max-w-[1600px] md:mt-40",
        )}
      >
        <p className="font-display max-w-[22ch] text-[clamp(2.25rem,6vw,7rem)] leading-[0.98]">
          {CLOSING.split(" ").map((w, i) => (
            <Fragment key={i}>
              {i > 0 && " "}
              <span className="-mb-[0.1em] inline-block overflow-hidden pb-[0.1em] align-bottom">
                <span data-closing-word className="inline-block">
                  {w}
                </span>
              </span>
            </Fragment>
          ))}
        </p>
      </div>
    </section>
  );
}
