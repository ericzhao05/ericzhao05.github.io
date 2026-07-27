import { COLORS, type ColorToken } from "./colors";

export interface MoonItem {
  id: string;
  label: string;
  href: string;
  external?: boolean;
  meta?: string; // technical/telemetry line (mono face)
  blurb?: string;
}

export interface Section {
  id: string;
  label: string;
  route: string; // History API path
  href: string; // real href for no-JS fallback (may be external)
  external: boolean; // clicking ultimately leaves the site
  color: ColorToken;
  icon: string; // key into ICONS
  blurb: string;
  meta: string; // mono telemetry line shown near the star / in overlay
  moons?: MoonItem[];
}

// Placeholder content is flagged in the design doc §6 — fill before launch.
export const SECTIONS: Section[] = [
  {
    id: "resume",
    label: "Resume",
    route: "/resume",
    href: "/resume.pdf",
    external: true,
    color: "lapis",
    icon: "resume",
    blurb: "One page. Network infrastructure and games.",
    meta: "PDF · updated 2026",
  },
  {
    id: "github",
    label: "GitHub",
    route: "/github",
    href: "https://github.com/ericzhao05",
    external: true,
    color: "cinnabar",
    icon: "github",
    blurb: "Source, experiments, and the things that never shipped.",
    meta: "github.com/ericzhao05",
  },
  {
    id: "linkedin",
    label: "LinkedIn",
    route: "/linkedin",
    href: "https://www.linkedin.com/",
    external: true,
    color: "ochre",
    icon: "linkedin",
    blurb: "The professional record, for people who want it.",
    meta: "linkedin.com/in/…",
  },
  {
    id: "projects",
    label: "Projects",
    route: "/projects",
    href: "/projects",
    external: false,
    color: "celadon",
    icon: "projects",
    blurb: "Five things worth showing.",
    meta: "5 orbiting",
    moons: [
      {
        id: "weight-of-the-cloud",
        label: "Weight of the Cloud",
        href: "#",
        meta: "game · Godot",
        blurb: "Placeholder — add description and link.",
      },
      {
        id: "hsrn-netbox",
        label: "HSRN NetBox automation",
        href: "#",
        meta: "infra · Python",
        blurb: "Placeholder — add description and link.",
      },
      {
        id: "hermes",
        label: "Hermes fitness agent",
        href: "#",
        meta: "agent · Python",
        blurb: "Placeholder — add description and link.",
      },
      {
        id: "ezdsviewer",
        label: "EzDSViewer",
        href: "#",
        meta: "tool · C++",
        blurb: "Placeholder — add description and link.",
      },
      {
        id: "arcampass",
        label: "Arcampass",
        href: "#",
        meta: "web · React",
        blurb: "Placeholder — add description and link.",
      },
    ],
  },
  {
    id: "skills",
    label: "Skills",
    route: "/skills",
    href: "/skills",
    external: false,
    color: "amethyst",
    icon: "skills",
    blurb: "The stack I reach for.",
    meta: "6 orbiting",
    moons: [
      { id: "cpp", label: "C++", href: "#", meta: "systems", blurb: "Placeholder." },
      { id: "python", label: "Python", href: "#", meta: "automation", blurb: "Placeholder." },
      { id: "react", label: "React", href: "#", meta: "web", blurb: "Placeholder." },
      { id: "godot", label: "Godot", href: "#", meta: "games", blurb: "Placeholder." },
      { id: "aws", label: "AWS", href: "#", meta: "cloud", blurb: "Placeholder." },
      { id: "docker", label: "Docker", href: "#", meta: "infra", blurb: "Placeholder." },
    ],
  },
  {
    id: "contact",
    label: "Contact",
    route: "/contact",
    href: "mailto:ericzhaoqqq@gmail.com",
    external: true,
    color: "gold",
    icon: "contact",
    blurb: "ericzhaoqqq@gmail.com",
    meta: "mailto",
  },
];

export const sectionColorHex = (s: Section): string => COLORS[s.color];
