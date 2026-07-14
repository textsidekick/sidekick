// Landing-page links wired to the EXISTING routes/destinations used on main.
export const LINKS = {
  bookDemo: "https://calendly.com/justin-textsidekick", // existing Book a Demo destination (external)
  blog: "https://textsidekick.substack.com/", // existing blog (external)
  login: "/login", // existing app entry point
  privacy: "/privacy", // src/app/(landing)/privacy
  terms: "/terms", // src/app/(landing)/terms
  contactEmail: "mailto:hello@textsidekick.com",
};

// true for links that should open in a new tab
export const EXTERNAL = new Set([LINKS.bookDemo, LINKS.blog]);
