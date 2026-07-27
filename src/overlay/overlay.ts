import type { Section, MoonItem } from "../data/sections";
import { COLORS } from "../data/colors";

// DOM overlay for focused section content. Moves focus in and traps it while
// open; returns focus to the originating star label on close (spec §8.5).
export class Overlay {
  private root = document.getElementById("overlay-root") as HTMLDivElement;
  private lastFocused: HTMLElement | null = null;
  private onClose: (() => void) | null = null;
  isOpen = false;

  constructor() {
    this.root.addEventListener("keydown", this.onKeydown);
  }

  openSection(section: Section, origin: HTMLElement | null, onClose: () => void) {
    this.onClose = onClose;
    this.lastFocused = origin;
    this.root.innerHTML = this.sectionHTML(section);
    this.mount(COLORS[section.color]);

    // Wire moon items to swap content in place (spec §4: without leaving the star).
    section.moons?.forEach((m) => {
      const el = this.root.querySelector<HTMLElement>(`[data-moon="${m.id}"]`);
      el?.addEventListener("click", (e) => {
        if (m.href === "#") e.preventDefault();
        this.showMoon(section, m);
      });
    });
  }

  showMoon(section: Section, moon: MoonItem) {
    const body = this.root.querySelector(".overlay-card");
    if (!body) return;
    body.innerHTML = `
      ${this.closeBtn()}
      <button class="overlay-eyebrow" data-back style="background:none;border:none;padding:0;cursor:pointer;">&larr; ${section.label}</button>
      <h2 class="overlay-title">${moon.label}</h2>
      <p class="overlay-blurb">${moon.blurb ?? ""}</p>
      ${
        moon.href && moon.href !== "#"
          ? `<a class="overlay-button" href="${moon.href}" target="_blank" rel="noopener">Open &nearr;</a>`
          : `<p class="overlay-blurb" style="opacity:.5;font-family:var(--mono);font-size:.75rem">link coming soon</p>`
      }`;
    this.wireControls();
    this.root
      .querySelector<HTMLElement>("[data-back]")
      ?.addEventListener("click", () => this.openSection(section, this.lastFocused, this.onClose!));
    this.focusFirst();
  }

  private sectionHTML(s: Section): string {
    const moons = s.moons
      ? `<ul class="overlay-list">${s.moons
          .map(
            (m) => `<a class="overlay-item" data-moon="${m.id}" href="${m.href}"${
              m.href !== "#" ? ' target="_blank" rel="noopener"' : ""
            }><span class="il">${m.label}</span><span class="im">${m.meta ?? ""}</span></a>`
          )
          .join("")}</ul>`
      : "";
    const button = s.external
      ? `<a class="overlay-button" href="${s.href}"${
          s.id === "resume" ? "" : ' target="_blank" rel="noopener"'
        }>${this.buttonLabel(s)}</a>`
      : "";
    return `
      <div class="overlay-scrim" data-scrim></div>
      <div class="overlay-card" role="dialog" aria-modal="true" aria-label="${s.label}">
        ${this.closeBtn()}
        <div class="overlay-eyebrow">${s.meta}</div>
        <h2 class="overlay-title">${s.label}</h2>
        <p class="overlay-blurb">${s.blurb}</p>
        ${moons}
        ${button}
      </div>`;
  }

  private buttonLabel(s: Section): string {
    if (s.id === "resume") return "Open résumé (PDF) ↗";
    if (s.id === "contact") return "Email me ↗";
    return `Visit ${s.label} ↗`;
  }

  private closeBtn() {
    return `<button class="overlay-close" data-close aria-label="Close">✕</button>`;
  }

  private mount(accent: string) {
    this.root.style.setProperty("--accent", accent);
    this.root.classList.add("open");
    this.isOpen = true;
    this.wireControls();
    this.focusFirst();
  }

  private wireControls() {
    this.root
      .querySelector<HTMLElement>("[data-close]")
      ?.addEventListener("click", () => this.requestClose());
    this.root
      .querySelector<HTMLElement>("[data-scrim]")
      ?.addEventListener("click", () => this.requestClose());
  }

  private focusFirst() {
    const focusable = this.focusables();
    (focusable[0] ?? this.root.querySelector<HTMLElement>(".overlay-card"))?.focus();
  }

  private focusables(): HTMLElement[] {
    return Array.from(
      this.root.querySelectorAll<HTMLElement>(
        'a[href], button, [tabindex]:not([tabindex="-1"])'
      )
    ).filter((el) => el.offsetParent !== null);
  }

  private onKeydown = (e: KeyboardEvent) => {
    if (!this.isOpen) return;
    if (e.key === "Escape") {
      e.preventDefault();
      this.requestClose();
    } else if (e.key === "Tab") {
      const f = this.focusables();
      if (f.length === 0) return;
      const first = f[0];
      const last = f[f.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    }
  };

  private requestClose() {
    this.onClose?.();
  }

  close() {
    this.root.classList.remove("open");
    this.isOpen = false;
    this.root.innerHTML = "";
    this.lastFocused?.focus();
  }
}
