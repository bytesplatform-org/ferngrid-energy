"use client";

import {
  Fragment,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { FAQ, type FaqBlock, type FaqItem, type FaqLink } from "@/lib/content";
import { ArcSurface } from "../motion/arc-surface";
import { gsap, ScrollTrigger, useGSAP, MQ } from "../motion/gsap";
import { getLenis } from "../motion/smooth-scroll";
import { ArrowUpRight, cx } from "../ui/primitives";
import { TransitionLink } from "../ui/transition-link";
import { FAQ_OPEN_EVENT } from "./faq-hero";

const ALL = FAQ.categories.flatMap((c) =>
  c.items.map((it) => ({ ...it, category: c.id })),
);
const FIRST = FAQ.categories[0];

/** Plain text of an answer (for search). */
const answerText = (a: readonly FaqBlock[]) =>
  a
    .map((b) =>
      b.type === "p"
        ? b.parts.map((p) => (typeof p === "string" ? p : p.text)).join("")
        : b.items
            .map((it) =>
              typeof it === "string" ? it : `${it.text} ${it.sub.join(" ")}`,
            )
            .join(" "),
    )
    .join(" ");

/** Wrap matches of `query` in a fern highlight. */
function hl(text: string, query: string): ReactNode {
  if (!query) return text;
  const lower = text.toLowerCase();
  const q = query.toLowerCase();
  const out: ReactNode[] = [];
  let i = 0;
  for (
    let at = lower.indexOf(q);
    at !== -1;
    at = lower.indexOf(q, at + q.length)
  ) {
    if (at > i) out.push(text.slice(i, at));
    out.push(
      <mark
        key={at}
        className="rounded-[3px] bg-fern/35 px-[0.1em] text-inherit"
      >
        {text.slice(at, at + q.length)}
      </mark>,
    );
    i = at + q.length;
  }
  if (i < text.length) out.push(text.slice(i));
  return out;
}

const isExternal = (href: string) => href.startsWith("http");

function InlineLink({ link }: { link: FaqLink }) {
  const cls =
    "font-medium text-carbon underline decoration-fern decoration-2 underline-offset-4 hover:text-fern";
  return isExternal(link.href) ? (
    <a
      href={link.href}
      target="_blank"
      rel="noopener noreferrer"
      className={cls}
    >
      {link.text}
    </a>
  ) : (
    <TransitionLink href={link.href} className={cls}>
      {link.text}
    </TransitionLink>
  );
}

function Answer({ item, query }: { item: FaqItem; query: string }) {
  return (
    <div className="max-w-[72ch] space-y-4 pb-8 text-[15px] leading-relaxed text-carbon/80 md:pb-10 md:text-[1.05rem]">
      {item.a.map((b, i) =>
        b.type === "p" ? (
          <p key={i} data-ans>
            {b.parts.map((part, k) =>
              typeof part === "string" ? (
                // "R1." style requirement numbers get a small fern tag
                /^R\d\./.test(part) ? (
                  <Fragment key={k}>
                    <span className="font-condensed mr-1 inline-block rounded-[6px] bg-carbon px-1.5 py-0.5 text-[0.85em] leading-none text-fern">
                      {part.slice(0, part.indexOf(".") + 1)}
                    </span>
                    {hl(part.slice(part.indexOf(".") + 1), query)}
                  </Fragment>
                ) : (
                  <Fragment key={k}>{hl(part, query)}</Fragment>
                )
              ) : (
                <InlineLink key={k} link={part} />
              ),
            )}
          </p>
        ) : (
          <ul key={i} data-ans className="space-y-2">
            {b.items.map((it) => {
              const text = typeof it === "string" ? it : it.text;
              return (
                <li key={text} className="relative pl-6">
                  <span
                    aria-hidden
                    className="absolute top-[0.62em] left-1 size-1.5 rounded-full bg-fern"
                  />
                  {hl(text, query)}
                  {typeof it !== "string" && (
                    <ul className="mt-2 space-y-1.5">
                      {it.sub.map((s) => (
                        <li key={s} className="relative pl-6 text-carbon/70">
                          <span
                            aria-hidden
                            className="absolute top-[0.75em] left-1 h-px w-2.5 bg-carbon/40"
                          />
                          {hl(s, query)}
                        </li>
                      ))}
                    </ul>
                  )}
                </li>
              );
            })}
          </ul>
        ),
      )}
      {item.sources.length > 0 && (
        <div data-ans className="flex flex-wrap gap-2 pt-2">
          {item.sources.map((s) => (
            <a
              key={s.href + s.text}
              href={s.href}
              target="_blank"
              rel="noopener noreferrer"
              className="text-label inline-flex items-center gap-2 rounded-full px-3 py-2 text-carbon ring-1 ring-carbon/20 transition-colors hover:bg-carbon hover:text-paper"
            >
              {s.text}
              <ArrowUpRight />
            </a>
          ))}
        </div>
      )}
    </div>
  );
}

/**
 * The questions: search (across both categories, matches highlighted), category
 * tabs with a sliding underline, and an accordion that opens smoothly with the
 * answer rising in. Questions cascade in when the list changes; the hero's
 * floating questions jump straight to their answer.
 */
export function FaqList() {
  const ref = useRef<HTMLElement>(null);
  const [tab, setTab] = useState<string>(FIRST.id);
  const [query, setQuery] = useState("");
  const [openId, setOpenId] = useState<string | null>(FIRST.items[0].id);
  const pendingScroll = useRef<string | null>(null);

  const q = query.trim();
  const visible = useMemo(() => {
    if (!q) return ALL.filter((it) => it.category === tab);
    const needle = q.toLowerCase();
    return ALL.filter(
      (it) =>
        it.q.toLowerCase().includes(needle) ||
        answerText(it.a).toLowerCase().includes(needle),
    );
  }, [q, tab]);
  const listKey = visible.map((v) => v.id).join("|");

  // Hero → open a question.
  useEffect(() => {
    const onOpen = (e: Event) => {
      const { id, category } = (
        e as CustomEvent<{ id: string; category: string }>
      ).detail;
      setQuery("");
      setTab(category);
      setOpenId(id);
      pendingScroll.current = id;
    };
    window.addEventListener(FAQ_OPEN_EVENT, onOpen);
    return () => window.removeEventListener(FAQ_OPEN_EVENT, onOpen);
  }, []);

  const reduced = () => window.matchMedia(MQ.reduce).matches;

  // Accordion heights (GSAP owns them, so opening/closing animates).
  // A plain effect, not useGSAP: a context revert (React StrictMode runs effects
  // twice in dev) would undo the heights while the recorded state stayed "open".
  useEffect(
    () => {
      const root = ref.current;
      if (!root) return;
      root.querySelectorAll<HTMLElement>("[data-region]").forEach((region) => {
        const open = region.dataset.region === openId;
        const isOpen = region.dataset.state === "open";
        if (open === isOpen && region.dataset.ready) return;
        region.dataset.state = open ? "open" : "closed";
        region.dataset.ready = "1";
        if (reduced() || !region.dataset.animated) {
          gsap.set(region, { height: open ? "auto" : 0 });
          region.dataset.animated = "1";
          return;
        }
        gsap.to(region, {
          height: open ? "auto" : 0,
          duration: 0.55,
          ease: "power3.inOut",
          overwrite: true,
        });
        if (open) {
          gsap.fromTo(
            region.querySelectorAll("[data-ans]"),
            { y: 16, autoAlpha: 0 },
            {
              y: 0,
              autoAlpha: 1,
              duration: 0.6,
              stagger: 0.06,
              ease: "power3.out",
              delay: 0.12,
            },
          );
        }
      });

      // Jump from the hero: once the item is open, bring it into view.
      const id = pendingScroll.current;
      if (id) {
        pendingScroll.current = null;
        const el = root.querySelector<HTMLElement>(`[data-item="${id}"]`);
        if (el) {
          requestAnimationFrame(() => {
            ScrollTrigger.refresh();
            const y = el.getBoundingClientRect().top + window.scrollY - 120;
            const lenis = getLenis();
            if (lenis) lenis.scrollTo(y, { duration: 1.4 });
            else
              window.scrollTo({
                top: y,
                behavior: reduced() ? "auto" : "smooth",
              });
          });
        }
      }
    },
    [openId, listKey],
  );

  // Sliding tab underline (plain effect for the same reason).
  useEffect(
    () => {
      const root = ref.current;
      const bar = root?.querySelector<HTMLElement>("[data-tab-bar]");
      const btn = root?.querySelector<HTMLElement>(`[data-tab="${tab}"]`);
      if (!bar || !btn) return;
      const to = {
        x: btn.offsetLeft,
        width: btn.offsetWidth,
        opacity: q ? 0 : 1,
      };
      if (reduced() || !bar.dataset.ready) gsap.set(bar, to);
      else gsap.to(bar, { ...to, duration: 0.5, ease: "power3.inOut" });
      bar.dataset.ready = "1";
    },
    [tab, q],
  );

  // Questions cascade in: on first view (scroll), then whenever the list changes.
  const seen = useRef(false);
  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add(MQ.motion, () => {
        const items = gsap.utils.toArray<HTMLElement>(
          "[data-item]",
          ref.current,
        );
        if (!seen.current) {
          gsap.from(items, {
            y: 40,
            autoAlpha: 0,
            duration: 0.9,
            stagger: 0.07,
            ease: "expo.out",
            scrollTrigger: {
              trigger: ref.current?.querySelector("[data-list]"),
              start: "top 85%",
              once: true,
              onEnter: () => (seen.current = true),
            },
          });
        } else {
          gsap.fromTo(
            items,
            { y: 28, autoAlpha: 0 },
            {
              y: 0,
              autoAlpha: 1,
              duration: 0.7,
              stagger: 0.05,
              ease: "expo.out",
            },
          );
        }
      });
    },
    { scope: ref, dependencies: [listKey], revertOnUpdate: false },
  );

  return (
    <section
      ref={ref}
      id="questions"
      aria-label="Questions and answers"
      className="surface-light arc-next arc-prev relative z-10 px-5 md:px-10"
    >
      <ArcSurface tone="paper" parallax="[data-fqh-inner]" />

      <div className="mx-auto max-w-[1150px]">
        {/* Tabs + search */}
        <div className="flex flex-col-reverse gap-6 md:flex-row md:items-end md:justify-between">
          <div
            role="tablist"
            aria-label="Question categories"
            className="relative flex flex-wrap gap-x-6 gap-y-2"
          >
            {FAQ.categories.map((c) => {
              const active = !q && tab === c.id;
              return (
                <button
                  key={c.id}
                  type="button"
                  role="tab"
                  data-tab={c.id}
                  aria-selected={active}
                  aria-controls="faq-panel"
                  onClick={() => {
                    setQuery("");
                    setTab(c.id);
                  }}
                  className={cx(
                    "py-3 text-[15px] font-medium transition-colors duration-300 md:text-base",
                    active ? "text-carbon" : "text-carbon/45 hover:text-carbon",
                  )}
                >
                  {c.label}
                </button>
              );
            })}
            <span
              data-tab-bar
              aria-hidden
              className="absolute bottom-0 left-0 h-[2px] w-0 bg-fern"
            />
          </div>

          <label className="group relative block w-full md:w-80">
            <span className="sr-only">Search questions</span>
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search"
              className="w-full border-b border-carbon/25 bg-transparent py-3 pr-9 text-base text-carbon outline-none placeholder:text-carbon/40"
            />
            <span
              aria-hidden
              className="absolute bottom-0 left-0 h-[2px] w-full origin-left scale-x-0 bg-fern transition-transform duration-500 group-focus-within:scale-x-100"
            />
            <svg
              viewBox="0 0 20 20"
              aria-hidden
              className="absolute top-1/2 right-1 size-5 -translate-y-1/2 text-carbon/50"
            >
              <circle
                cx="8.5"
                cy="8.5"
                r="5.5"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
              />
              <path
                d="M13 13l4 4"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
              />
            </svg>
          </label>
        </div>

        {/* Questions */}
        <div
          id="faq-panel"
          role="tabpanel"
          data-list
          className="mt-8 border-t border-carbon/15 md:mt-12"
        >
          {visible.length === 0 && (
            <p className="py-12 text-center text-carbon/60">
              No matching questions.
            </p>
          )}
          {visible.map((item) => {
            const open = openId === item.id;
            return (
              <div
                key={item.id}
                data-item={item.id}
                className="group/item relative border-b border-carbon/15"
              >
                {/* fern accent bar */}
                <span
                  aria-hidden
                  className={cx(
                    "absolute top-0 bottom-0 -left-4 w-[3px] origin-top bg-fern transition-transform duration-500 md:-left-6",
                    open
                      ? "scale-y-100"
                      : "scale-y-0 group-hover/item:scale-y-100",
                  )}
                />
                <h3>
                  <button
                    type="button"
                    id={`q-${item.id}`}
                    aria-expanded={open}
                    aria-controls={`a-${item.id}`}
                    onClick={() => setOpenId(open ? null : item.id)}
                    className="flex w-full items-center justify-between gap-6 py-6 text-left md:py-8"
                  >
                    <span
                      className={cx(
                        "font-display text-[clamp(1.15rem,1.9vw,1.75rem)] leading-tight transition-transform duration-500 group-hover/item:translate-x-2",
                        open && "translate-x-2",
                      )}
                    >
                      {hl(item.q, q)}
                    </span>
                    <span
                      aria-hidden
                      className={cx(
                        "relative grid size-10 shrink-0 place-items-center rounded-full ring-1 transition-[background-color,box-shadow] duration-300 md:size-12",
                        open
                          ? "bg-carbon ring-carbon"
                          : "ring-carbon/25 group-hover/item:ring-carbon",
                      )}
                    >
                      <span
                        className={cx(
                          "absolute h-[1.5px] w-4 transition-colors",
                          open ? "bg-paper" : "bg-carbon",
                        )}
                      />
                      <span
                        className={cx(
                          "absolute h-4 w-[1.5px] transition-transform duration-500",
                          open ? "scale-y-0 bg-paper" : "bg-carbon",
                        )}
                      />
                    </span>
                  </button>
                </h3>
                <div
                  id={`a-${item.id}`}
                  role="region"
                  aria-labelledby={`q-${item.id}`}
                  data-region={item.id}
                  inert={!open}
                  className="overflow-hidden"
                  style={{ height: 0 }}
                >
                  <Answer item={item} query={q} />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
