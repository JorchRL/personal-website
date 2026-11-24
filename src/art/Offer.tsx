// How to have a painting, under its facts: an enquiry by email when it is his
// to part with ("Interested in this painting? Email me", the painting named in
// the subject), and a print when prints are sold (`prints`). Never on fan art:
// it is someone else's character. Renders nothing when there is nothing to offer.

import { enquiryHref, offersEnquiry, printsLink, type Painting } from "@/content/art";

/**
 * How to have it: an enquiry by email when it is his to part with, and a
 * print when prints are sold. Never on fan art: it is someone else's character.
 */
export function Offer({ painting }: { painting: Pick<Painting, "available" | "fanArt" | "prints" | "title" | "year"> }) {
  const enquiry = offersEnquiry(painting);
  const prints = printsLink(painting);
  if (!enquiry && !prints) return null;
  return (
    <div className="art-offer" data-offer>
      {enquiry && (
        <p>
          <span className="q">Interested in this painting?</span>{" "}
          <a className="btn btn-primary" href={enquiryHref(painting)} data-enquiry>
            Email me <span className="k" aria-hidden="true">→</span>
          </a>
        </p>
      )}
      {prints && (
        <p>
          <a className="btn" href={prints} data-prints rel="noopener">
            Get a print <span className="k" aria-hidden="true">↗</span>
          </a>
        </p>
      )}
    </div>
  );
}
