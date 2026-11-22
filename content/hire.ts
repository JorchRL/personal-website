// How to hire Jorge: the terms that /about, /work-with-me and the CV all
// show. Written once, here; the city and time zone come from content/site.ts.

import { site } from "./site";

export const hire = {
  // How a company outside Mexico can pay him.
  route:
    "As an independent contractor invoicing in USD, or through your employer of record. A US company has paid me as a contractor through Gusto.",
  timeZone: `${site.city}, ${site.timeZone} all year.`,
  overlap:
    "Full overlap with US working hours. In winter I am on US Central time; in summer, one hour behind Chicago and two behind New York.",
  // The one place his languages are asked; the CV shows it under "Languages".
  english:
    "Spanish, native. English, professional: I worked in it every day, written and spoken, with a US company and with an Italian one.",
} as const;
