import { ClosingCta } from "./closing-cta";

/**
 * Site footer (every page): the closing "At FernGrid Energy…" section — pylon
 * photo, consultation call, buttons, email and phone — with the email / phone /
 * copyright line along its bottom edge.
 *
 * `stackOver` / `hideExplore` pass through (see ClosingCta): on pages that end
 * in a pinned scene it slides over it like a card; on FEST it shows Contact Us only.
 */
export function Footer(props: { stackOver?: string; hideExplore?: boolean }) {
  return <ClosingCta footer {...props} />;
}
