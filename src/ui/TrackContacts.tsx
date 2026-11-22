"use client";

// One click listener for the whole page: a click on a link that means a
// contact may be coming sends its event (src/ui/contactEvents.ts). The links
// stay plain links, so they work the same with JavaScript off; the event is
// only sent when it is on.

import { track } from "@vercel/analytics";
import { useEffect } from "react";
import { contactEvent } from "./contactEvents";

export function TrackContacts() {
  useEffect(() => {
    const onClick = (event: MouseEvent) => {
      if (event.button > 1) return;
      const link = (event.target as Element | null)?.closest?.("a[href]");
      if (!(link instanceof HTMLAnchorElement)) return;
      const name = contactEvent(link.href, link.dataset.track);
      if (name) track(name, { path: location.pathname });
    };
    document.addEventListener("click", onClick, { capture: true });
    document.addEventListener("auxclick", onClick, { capture: true });
    return () => {
      document.removeEventListener("click", onClick, { capture: true });
      document.removeEventListener("auxclick", onClick, { capture: true });
    };
  }, []);
  return null;
}
