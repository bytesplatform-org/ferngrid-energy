"use client";

import { Fragment, useId, useRef, useState, type FormEvent } from "react";
import { CONTACT, SITE } from "@/lib/content";
import { ArcSurface } from "../motion/arc-surface";
import { gsap, useGSAP, MQ } from "../motion/gsap";
import { cx } from "../ui/primitives";

const { form } = CONTACT;
const F = form.fields;

type Values = {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  business: string;
  message: string;
};
const EMPTY: Values = {
  firstName: "",
  lastName: "",
  email: "",
  phone: "",
  business: "",
  message: "",
};
const isEmail = (v: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim());

/** Text input / textarea with a floating label and a fern underline that draws on focus. */
function Field({
  label,
  name,
  required,
  type = "text",
  value,
  onChange,
  error,
  multiline,
  autoComplete,
}: {
  label: string;
  name: keyof Values;
  required?: boolean;
  type?: string;
  value: string;
  onChange: (v: string) => void;
  error?: string;
  multiline?: boolean;
  autoComplete?: string;
}) {
  const id = useId();
  const common = {
    id,
    name,
    value,
    required,
    placeholder: " ",
    autoComplete,
    "aria-invalid": error ? true : undefined,
    "aria-describedby": error ? `${id}-err` : undefined,
    onChange: (e: { target: { value: string } }) => onChange(e.target.value),
    className:
      // the fern underline below is the focus indicator, so no ring here
      "peer block w-full border-b bg-transparent pt-6 pb-2.5 text-base text-carbon outline-none transition-colors focus-visible:shadow-none focus-visible:outline-none " +
      (error ? "border-carbon" : "border-carbon/25"),
  };
  return (
    <div data-cf-rise className="group relative">
      {multiline ? (
        <textarea
          {...common}
          rows={4}
          className={cx(common.className, "resize-y")}
        />
      ) : (
        <input type={type} {...common} />
      )}
      <label
        htmlFor={id}
        className="pointer-events-none absolute top-6 left-0 origin-left text-base text-carbon/50 transition-all duration-300 peer-focus:top-0 peer-focus:scale-[0.8] peer-focus:text-fern peer-[:not(:placeholder-shown)]:top-0 peer-[:not(:placeholder-shown)]:scale-[0.8]"
      >
        {label}
        {required && " *"}
      </label>
      <span
        aria-hidden
        className="absolute bottom-0 left-0 h-[2px] w-full origin-left scale-x-0 bg-fern transition-transform duration-500 peer-focus:scale-x-100"
      />
      {error && (
        <p id={`${id}-err`} className="text-label mt-2 text-carbon">
          {error}
        </p>
      )}
    </div>
  );
}

/**
 * The contact form (fields and choices verbatim from the live page).
 * - Floating labels, fern underlines on focus, interest cards whose checks draw.
 * - A live checklist of the required items lights up as they're completed.
 * - Submit validates, sends the button's fern "charge" across, then opens the
 *   visitor's email app with the message addressed to FernGrid (no server
 *   needed); a confirmation replaces the form.
 * TODO: route submissions through an email service once the client picks one.
 */
export function ContactForm() {
  const ref = useRef<HTMLElement>(null);
  const [values, setValues] = useState<Values>(EMPTY);
  const [interests, setInterests] = useState<string[]>([]);
  const [tried, setTried] = useState(false);
  const [sent, setSent] = useState(false);
  const set = (k: keyof Values) => (v: string) =>
    setValues((s) => ({ ...s, [k]: v }));

  const checks = [
    { label: F.firstName, ok: values.firstName.trim().length > 0 },
    { label: F.lastName, ok: values.lastName.trim().length > 0 },
    { label: F.email, ok: isEmail(values.email) },
    { label: form.interestsLabel, ok: interests.length > 0 },
  ];
  const err = (ok: boolean, msg = "Please fill in this field.") =>
    tried && !ok ? msg : undefined;

  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add(MQ.motion, () => {
        gsap.from("[data-cf-word]", {
          yPercent: 110,
          duration: 1.1,
          stagger: 0.06,
          ease: "expo.out",
          scrollTrigger: {
            trigger: "[data-cf-head]",
            start: "top 85%",
            once: true,
          },
        });
        gsap.from("[data-cf-aside] > *:not(h2)", {
          y: 24,
          autoAlpha: 0,
          duration: 0.9,
          stagger: 0.08,
          ease: "expo.out",
          scrollTrigger: {
            trigger: "[data-cf-head]",
            start: "top 80%",
            once: true,
          },
        });
        gsap.from("[data-cf-rise]", {
          y: 34,
          autoAlpha: 0,
          duration: 0.9,
          stagger: 0.05,
          ease: "expo.out",
          scrollTrigger: {
            trigger: "[data-cf-form]",
            start: "top 85%",
            once: true,
          },
        });
      });
    },
    { scope: ref },
  );

  const toggle = (it: string, el: HTMLElement) => {
    const on = !interests.includes(it);
    setInterests((s) => (on ? [...s, it] : s.filter((x) => x !== it)));
    if (window.matchMedia(MQ.motion).matches) {
      const tick = el.querySelector("[data-cf-tick]");
      if (on && tick)
        gsap.fromTo(
          tick,
          { strokeDashoffset: 1 },
          { strokeDashoffset: 0, duration: 0.4, ease: "power2.out" },
        );
      gsap.fromTo(
        el,
        { scale: 0.97 },
        { scale: 1, duration: 0.5, ease: "elastic.out(1, 0.5)" },
      );
    }
  };

  const submit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setTried(true);
    if (!checks.every((c) => c.ok)) {
      const first = ref.current?.querySelector<HTMLElement>(
        "[aria-invalid='true'], [data-cf-interests-err]",
      );
      first?.focus?.();
      return;
    }
    const lines = [
      `${F.firstName}: ${values.firstName}`,
      `${F.lastName}: ${values.lastName}`,
      `${F.email}: ${values.email}`,
      `${F.phone}: ${values.phone}`,
      `${F.business}: ${values.business}`,
      `${form.interestsLabel}`,
      ...interests.map((i) => `- ${i}`),
      "",
      `${F.message}:`,
      values.message,
    ];
    const href = `mailto:${SITE.email}?subject=${encodeURIComponent(`${form.heading} — ${values.firstName} ${values.lastName}`)}&body=${encodeURIComponent(lines.join("\n"))}`;
    const go = () => {
      window.location.href = href;
      setSent(true);
    };
    const charge = ref.current?.querySelector("[data-cf-charge]");
    if (charge && window.matchMedia(MQ.motion).matches) {
      gsap.fromTo(
        charge,
        { scaleX: 0 },
        { scaleX: 1, duration: 0.7, ease: "power2.inOut", onComplete: go },
      );
    } else go();
  };

  return (
    <section
      ref={ref}
      aria-labelledby="contact-form-title"
      className="surface-light arc-next arc-prev relative z-10 px-5 md:px-10"
    >
      <ArcSurface tone="paper" parallax="[data-ch-inner]" />

      <div className="mx-auto grid max-w-[1300px] gap-12 lg:grid-cols-12 lg:gap-10">
        {/* Left: heading, live checklist, direct contact */}
        <aside
          data-cf-aside
          className="lg:sticky lg:top-28 lg:col-span-4 lg:self-start"
        >
          <h2
            id="contact-form-title"
            data-cf-head
            className="font-condensed text-[clamp(2.6rem,5vw,5.5rem)] leading-[0.88] uppercase"
          >
            {form.heading.split(" ").map((w, i) => (
              <Fragment key={i}>
                {i > 0 && " "}
                <span className="inline-block overflow-hidden pb-[0.05em] align-bottom">
                  <span
                    data-cf-word
                    className={cx("inline-block", i === 1 && "text-fern")}
                  >
                    {w}
                  </span>
                </span>
              </Fragment>
            ))}
          </h2>
          <span aria-hidden className="mt-5 block h-[2px] w-20 bg-fern" />

          <ul aria-label="Required" className="mt-8 space-y-3">
            {checks.map((c) => (
              <li key={c.label} className="flex items-center gap-3 text-[15px]">
                <span
                  aria-hidden
                  className={cx(
                    "grid size-5 place-items-center rounded-full ring-1 transition-[background-color,box-shadow] duration-500",
                    c.ok ? "bg-fern ring-fern" : "ring-carbon/25",
                  )}
                >
                  <svg
                    viewBox="0 0 12 12"
                    className={cx(
                      "size-3 transition-opacity duration-300",
                      c.ok ? "opacity-100" : "opacity-0",
                    )}
                  >
                    <path
                      d="M2.5 6.3 5 8.6 9.5 3.6"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.8"
                      strokeLinecap="round"
                      className="text-carbon"
                    />
                  </svg>
                </span>
                <span
                  className={cx(
                    "transition-colors duration-300",
                    c.ok ? "text-carbon" : "text-carbon/55",
                  )}
                >
                  {c.label} *
                </span>
              </li>
            ))}
          </ul>

          <div className="text-label-md mt-10 space-y-3 border-t border-carbon/15 pt-6">
            <a
              href={`mailto:${SITE.email}`}
              className="block normal-case tracking-[0.06em] text-carbon hover:text-fern"
            >
              {SITE.email}
            </a>
            <a
              href={SITE.phoneHref}
              className="block text-carbon hover:text-fern"
            >
              {SITE.phone}
            </a>
          </div>
        </aside>

        {/* Right: the form (or the confirmation) */}
        <div className="lg:col-span-8">
          {sent ? (
            <div
              role="status"
              className="rounded-[24px] bg-carbon p-8 text-paper md:p-12"
            >
              <p className="font-display text-[clamp(1.6rem,3vw,2.8rem)] leading-tight text-fern">
                {CONTACT.outro}
              </p>
              <p className="mt-4 max-w-[52ch] text-paper/75">
                Your email app has opened a message to{" "}
                <a
                  href={`mailto:${SITE.email}`}
                  className="text-paper underline decoration-fern underline-offset-4"
                >
                  {SITE.email}
                </a>
                .
              </p>
            </div>
          ) : (
            <form
              data-cf-form
              noValidate
              onSubmit={submit}
              className="rounded-[24px] bg-white p-6 shadow-[0_40px_90px_-50px_rgb(29_34_15/0.55)] md:p-10"
            >
              <div className="grid gap-x-8 gap-y-6 md:grid-cols-2">
                <Field
                  label={F.firstName}
                  name="firstName"
                  required
                  value={values.firstName}
                  onChange={set("firstName")}
                  error={err(checks[0].ok)}
                  autoComplete="given-name"
                />
                <Field
                  label={F.lastName}
                  name="lastName"
                  required
                  value={values.lastName}
                  onChange={set("lastName")}
                  error={err(checks[1].ok)}
                  autoComplete="family-name"
                />
                <Field
                  label={F.email}
                  name="email"
                  type="email"
                  required
                  value={values.email}
                  onChange={set("email")}
                  error={err(
                    checks[2].ok,
                    values.email ? "Please enter a valid email." : undefined,
                  )}
                  autoComplete="email"
                />
                <Field
                  label={F.phone}
                  name="phone"
                  type="tel"
                  value={values.phone}
                  onChange={set("phone")}
                  autoComplete="tel"
                />
                <div className="md:col-span-2">
                  <Field
                    label={F.business}
                    name="business"
                    value={values.business}
                    onChange={set("business")}
                    autoComplete="organization"
                  />
                </div>
              </div>

              <fieldset data-cf-rise className="mt-10">
                <legend className="text-label text-carbon/70">
                  {form.interestsLabel} *
                </legend>
                <div className="mt-4 grid gap-3 md:grid-cols-2">
                  {form.interests.map((it) => {
                    const on = interests.includes(it);
                    return (
                      <label
                        key={it}
                        className={cx(
                          "flex cursor-pointer items-start gap-3 rounded-[14px] p-4 text-[15px] leading-snug ring-1 transition-[background-color,box-shadow] duration-300 has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-fern",
                          on
                            ? "bg-fern/15 ring-fern"
                            : "ring-carbon/15 hover:ring-carbon/40",
                        )}
                        onClick={(e) => {
                          e.preventDefault();
                          toggle(it, e.currentTarget);
                        }}
                      >
                        <input
                          type="checkbox"
                          className="sr-only"
                          checked={on}
                          readOnly
                          name="interests"
                          value={it}
                        />
                        <span
                          aria-hidden
                          className={cx(
                            "mt-0.5 grid size-5 shrink-0 place-items-center rounded-[6px] ring-1 transition-colors duration-300",
                            on
                              ? "bg-carbon ring-carbon"
                              : "bg-paper ring-carbon/30",
                          )}
                        >
                          <svg
                            viewBox="0 0 12 12"
                            className={cx(
                              "size-3",
                              on ? "opacity-100" : "opacity-0",
                            )}
                          >
                            <path
                              data-cf-tick
                              d="M2.5 6.3 5 8.6 9.5 3.6"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="1.8"
                              strokeLinecap="round"
                              pathLength={1}
                              strokeDasharray="1 1"
                              className="text-fern"
                            />
                          </svg>
                        </span>
                        <span>{it}</span>
                      </label>
                    );
                  })}
                </div>
                {tried && interests.length === 0 && (
                  <p
                    data-cf-interests-err
                    tabIndex={-1}
                    className="text-label mt-3 text-carbon"
                  >
                    Please choose at least one.
                  </p>
                )}
              </fieldset>

              <div className="mt-10">
                <Field
                  label={F.message}
                  name="message"
                  multiline
                  value={values.message}
                  onChange={set("message")}
                />
              </div>

              <button
                data-cf-rise
                type="submit"
                className="group relative mt-10 flex h-14 w-full items-center justify-center overflow-hidden rounded-full bg-carbon text-[15px] font-medium text-paper"
              >
                <span
                  data-cf-charge
                  aria-hidden
                  className="absolute inset-0 origin-left scale-x-0 bg-fern"
                />
                <span
                  aria-hidden
                  className="absolute inset-0 origin-left scale-x-0 bg-ink transition-transform duration-500 group-hover:scale-x-100"
                />
                <span className="relative">{form.submit}</span>
              </button>
            </form>
          )}
        </div>
      </div>
    </section>
  );
}
