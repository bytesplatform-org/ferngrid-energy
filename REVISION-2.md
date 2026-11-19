# FernGrid Energy — Revision 2: what changed

A checklist of every item in **"FernGrid Energy Revisions Round 2.pdf"** and what was done for it, so the site can be cross-checked against the request.
Slide numbers refer to that PDF.

| # | Request (slide) | Status | Where |
|---|-----------------|--------|-------|
| 1 | Home: remove the text circling the logo (3) | Done | `app/_components/statement.tsx` deleted; `app/page.tsx` |
| 2 | Home: the circle swipes up from the bottom into a screen listing Software / Services / Training stacked (3–5) | Done | `app/_components/triad-intro.tsx` (new) |
| 3 | Home: then only Software is highlighted, and the page continues into Our Software (6–8) | Done | `triad-intro.tsx`, `our-software.tsx` |
| 4 | Home: Services highlighted, then Our Services (15–16) | Done (already the case; periods removed) | `services-training.tsx` |
| 5 | Home: Training highlighted, then Training Services (17–18) | Done (new beat) | `services-training.tsx` |
| 6 | Desktop: NERC capacity chart label overlapping the paragraph (21) | Fixed | `capacity-energy.tsx` |
| 7 | Mobile, Home: white blotches at the hero buttons and under "Enough energy for every hour." (23) | Fixed | `hero/hero.tsx`, `triad-intro.tsx`, `nerc/hourly-story.tsx` |
| 8 | Mobile, About: heading overlapping the three visuals (24) | Fixed | `about/expertise-story.tsx` |
| 9 | Mobile, NERC: Energy Transfers diagram labels / heading overlap (25, 1st) | Fixed | `era/era-scene.tsx`, `era/callouts.tsx` |
| 10 | Mobile, NERC: Requirements text running into the Base Scenario box, list cut off (25, 2nd) | Fixed | `nerc/requirements-story.tsx` |
| 11 | Mobile, NERC: FEST badge and factor chips cut off under "Explore FEST" (25, 3rd–4th) | Fixed | `nerc/fest-era-story.tsx` |
| 12 | Mobile, FEST: "Our Packages" heading under the nav bar (26) | Fixed | `fest/packages-story.tsx` |
| 13 | NERC page side text names the four stress scenarios (28) | Done | `lib/content.ts` (`NERC.requirements.scenariosIntro`) |
| 14 | FEST page side text names the four requirements (29) | Done | `lib/content.ts` (`FEST_PAGE.requirementsIntro`), `fest/scenarios-story.tsx` |
| 15 | FEST page side text names the four stress scenarios (30) | Done (same text as 13) | `lib/content.ts`, `fest/scenarios-story.tsx` |
| 16 | Shorter "Our Packages" card text (32) | Done | `lib/content.ts` (`FEST_PAGE.packages`), `fest/packages-story.tsx` |

---

## 1. Home page order (slides 3–19)

New order after the hero:

1. **Hero** — unchanged, except the bottom buttons (Learn BAL-007-1, Explore FEST, Contact Us) now fade out as the circle rises over them.
2. **Software / Services / Training** *(new, replaces the logo with the circling text)*
   - A dark circle (the curved top of the next section) swipes up from the bottom of the screen.
   - The three words rise in stacked vertically, all white (slide 5).
   - Scrolling on, Services and Training dim and only **Software** stays lit (slide 6).
   - Without animation (reduced motion), the three words are shown with Software lit.
3. **Our Software** — same story as before (Fuel and Energy Security Tool title → photos → paragraph → Explore FEST), but it now starts on the same dark background, so it continues straight on from the triad. Previously it started on the light background.
4. **At a glance** timeline — unchanged (slide 9).
5. **How are ERAs different / hourly story** — unchanged apart from the mobile fix below (slides 10–14).
6. **Software / Services / Training, Services lit** — this was already the opening of the Services section (slide 15). The periods after "Software." and "Training." were removed to match the mock-ups.
7. **Our Services** — unchanged (slide 16).
8. **Software / Services / Training, Training lit** *(new beat)* — after Our Services leaves, the triad returns with only **Training** lit (slide 17), then the training photo wipes up.
9. **Training Services** — unchanged (slide 18).
10. **Closing** ("At FernGrid Energy, we believe…") — unchanged (slide 19).

The three triad screens share one size and spacing (`TRIAD_FONT` in `triad-intro.tsx`), so they read as the same screen.

## 2. Overlapping / cut-off content

### Desktop
- **NERC, capacity chart (slide 21):** the "Capacity — a point in time" label was centred over the bar at the chart's left edge, so half of it ran into the paragraph. On desktop it now breaks onto two lines ("Capacity —" / "a point in time") and stays clear of the paragraph. It was checked at 1366 px, where the label's left edge sits right of the paragraph.

### Mobile (checked at 390 × 664)
- **Home hero (slide 23, left):** the white "Learn BAL-007-1" pill sat on top of the rising curve. The hero buttons now fade out as the curve arrives. The curve is also dark now, not white.
- **Home, "Enough energy for every hour." (slide 23, right):** the white marks were the tails of letters (g, y, p) from the previous sentence peeking out of their masks. Lines now leave further and fade out, so nothing is left behind.
- **About, "Built on Power Systems Expertise" (slide 24):**
  - The heading and paragraph now keep their full height.
  - The visual (2026 ruler / sectors / Venn) takes the space left above them and scales its contents to that box, so it can't reach the heading or the nav.
  - On phones: the heading is slightly smaller, the paragraph is 12.5 px, and the sector labels are smaller and wrap.
- **NERC, Energy Transfers diagram (slide 25, 1st):**
  - The diagram now starts below the small "New BAL-007-1 Requirements" heading and is sized from the screen height that's left.
  - The step titles (Load / Generation / Energy Transfers / Transmission Limitations) are smaller on phones.
  - Diagram labels may wrap on phones, so two labels on one row can't run into each other.
- **NERC, New BAL-007-1 Requirements (slide 25, 2nd):** on phones the contingency scenarios now use the same 2 × 2 tree as desktop, not a long single column. The text is 13 px. The whole section fits one screen.
- **NERC, FernGrid Energy and ERAs (slide 25, 3rd–4th):**
  - The FEST visual takes the height left under the paragraph, so the FEST core and the "Interface limits" chip are no longer cut off.
  - On phones the Explore FEST button sits beside the visual, not under the paragraph.
  - The factor chips are a little smaller on phones.
- **FEST, Our Packages (slide 26):** on phones the section now starts from the top, so the heading can't slide up under the nav. The text, gaps and pricing button are slightly smaller, and with the shorter card text everything fits on one screen.

## 3. List of items in both the paragraph and the visual (slides 28–30)

- **NERC page — New BAL-007-1 Requirements**, and **FEST page — part 2 (Contingency Scenarios):**
  > These Near-Term ERAs must forecast Energy Emergency Alerts and consist of a set of Scenarios, starting with a base Scenario developed from expected system conditions then considering other Scenarios that stress the system due to higher than forecasted load profiles, energy/fuel supply contingency, or other stressed conditions with historical precedent.

  ⚠️ **Please confirm:** the slide reads "must Energy Emergency Alerts". The word **"forecast"** (from the original sentence) was kept, since without it the sentence doesn't read.
- **FEST page — part 1 (Base Scenario + four requirements):**
  > As of April 2027, NERC Standard BAL-007-1 will require Balancing Authorities to conduct Near Term Energy Reliability Assessments that account for forecasted or assumed hourly load profiles, generation operational limitations, energy transfers with other BAs, and known transfer limits.

  The NERC page's own intro ("…(BAs) to conduct Near Term Energy Reliability Assessments (ERA) that account for") is unchanged, because the slides only asked for the FEST page.

## 4. Shorter "Our Packages" card text (slide 32)

| Card | Lines |
|------|-------|
| **Standard Software License** | One Year of FEST License + 10 Free Hours of Support · No Reserved Retainer Months · Customer Run Near-Term ERAs |
| **Standard Software + Set Up Retainer** *(renamed from "Software License + Set-Up Retainer", as written on the slide)* | One Year of FEST License + 10 Free Hours of Support · 1-2 Retainer Months (10% Discount) · Customer Run Near-Term ERAs |
| **FernGrid Energy Run BAL-007-1 Studies** | One Year of FEST License + 10 Free Hours of Support · 12 Retainer Months (15% Discount) · **FernGrid Energy Run Near-Term ERAs** |

⚠️ **Please confirm:** the slide lists "Customer Run Near-Term ERAs" for the third package as well. That looks like a copy-paste slip: this package is the one where FernGrid Energy runs the studies (its title, the old card and its description all say so). The card says **"FernGrid Energy Run Near-Term ERAs"**. It is a one-line change in `lib/content.ts` if the slide wording is what's wanted.

The package descriptions under the cards (Basic / Standard / Premium Package) are unchanged.

---

## How it was checked
- `npx eslint app lib` and `npx next build` pass.
- Walked through every changed section in Chrome on desktop (1366–1440 px wide) and at phone size (390 × 664, the usable height of an iPhone with Safari's bars showing).
