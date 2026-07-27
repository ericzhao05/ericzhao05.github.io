import { SECTIONS, type Section } from "../data/sections";

export type RouteChange = (section: Section | null, fromPop: boolean) => void;

// History API router over six routes. GitHub Pages serves 404.html for deep
// links; that page stashes the path in sessionStorage and bounces to "/", and
// bootstrap() restores it here so client-side routing resolves it (spec §1/§4).
export class Router {
  constructor(private onChange: RouteChange) {
    window.addEventListener("popstate", () => {
      this.onChange(this.currentSection(), true);
    });
  }

  bootstrap(): Section | null {
    const redirect = sessionStorage.getItem("spa-redirect");
    if (redirect) {
      sessionStorage.removeItem("spa-redirect");
      history.replaceState({}, "", redirect);
    }
    return this.currentSection();
  }

  currentSection(): Section | null {
    const path = location.pathname.replace(/\/+$/, "") || "/";
    return SECTIONS.find((s) => s.route === path) ?? null;
  }

  go(section: Section | null) {
    const path = section ? section.route : "/";
    if (path !== location.pathname) history.pushState({}, "", path);
    this.onChange(section, false);
  }
}
