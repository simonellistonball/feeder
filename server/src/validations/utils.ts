import { z } from "zod";
import sanitizeHtml from "sanitize-html";

// Add a transformer for sanitizing html
export const sanitizedHtml = (html: string) =>
  sanitizeHtml(html, {
    allowedTags: [
      "b",
      "i",
      "em",
      "strong",
      "p",
      "ul",
      "li",
      "ol",
      "h1",
      "h2",
      "h3",
      "br",
      "span",
      "div",
    ],
    allowedAttributes: {}, // No attributes allowed by default
    disallowedTagsMode: "escape",
  });

export const sanitize = (input: string) =>
  sanitizeHtml(input, {
    allowedTags: [],
    allowedAttributes: {},
    disallowedTagsMode: "escape",
  });

// a simple named object
export const namedObject = {
  id: z.string().uuid(),
  name: z.string().transform(sanitize),
  active: z.boolean().default(true),
};
