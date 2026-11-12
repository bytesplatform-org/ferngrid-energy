"use client";

import { useRef, type ElementType, type ReactNode, type ComponentPropsWithoutRef } from "react";
import { gsap, SplitText, useGSAP, MQ } from "./gsap";

type RevealProps<T extends ElementType> = {
  as?: T;
  children: ReactNode;
  /** Delay before the reveal, seconds. */
  delay?: number;
  /** ScrollTrigger start. */
  start?: string;
} & Omit<ComponentPropsWithoutRef<T>, "as" | "children">;

/**
 * Line-mask text reveal: splits its text into lines (re-splitting on resize
 * and font load) and slides each line up from behind a mask on enter.
 * Text is fully visible without JS and under reduced motion.
 */
export function SplitReveal<T extends ElementType = "div">({
  as,
  children,
  delay = 0,
  start = "top 85%",
  ...rest
}: RevealProps<T>) {
  const Tag = (as ?? "div") as ElementType;
  const ref = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add(MQ.motion, () => {
        const el = ref.current;
        if (!el) return;
        const split = SplitText.create(el, {
          type: "lines",
          mask: "lines",
          linesClass: "split-line",
          autoSplit: true,
          onSplit: (self) => {
            // Each line sits in an overflow-hidden mask exactly one line tall, which
            // clips descenders (g, y, p) at tight line-heights. Give the masks room
            // above/below, cancelled by negative margins so the layout doesn't move.
            gsap.set(self.masks, {
              paddingTop: "0.08em",
              marginTop: "-0.08em",
              paddingBottom: "0.24em",
              marginBottom: "-0.24em",
            });
            // Start far enough down to stay hidden below the taller mask.
            return gsap.from(self.lines, {
              yPercent: 140,
              duration: 1.15,
              ease: "expo.out",
              stagger: 0.07,
              delay,
              scrollTrigger: { trigger: el, start, once: true },
            });
          },
        });
        return () => split.revert();
      });
    },
    { scope: ref },
  );

  return (
    <Tag ref={ref} {...rest}>
      {children}
    </Tag>
  );
}

/** Fade + rise on enter. Children can opt into stagger with `data-stagger`. */
export function FadeUp<T extends ElementType = "div">({
  as,
  children,
  delay = 0,
  start = "top 88%",
  ...rest
}: RevealProps<T>) {
  const Tag = (as ?? "div") as ElementType;
  const ref = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add(MQ.motion, () => {
        const el = ref.current;
        if (!el) return;
        const items = el.querySelectorAll<HTMLElement>("[data-stagger]");
        gsap.from(items.length ? items : el, {
          y: 28,
          autoAlpha: 0,
          duration: 1.1,
          ease: "expo.out",
          stagger: 0.06,
          delay,
          scrollTrigger: { trigger: el, start, once: true },
        });
      });
    },
    { scope: ref },
  );

  return (
    <Tag ref={ref} {...rest}>
      {children}
    </Tag>
  );
}
