export type ViewName = "train" | "predict";

export type ShowViewOptions = {
  focusSelector?: string;
};

const ENTER_MS = 550;

export function showView(
  root: HTMLElement,
  views: Record<ViewName, HTMLElement>,
  name: ViewName,
  options?: ShowViewOptions,
): void {
  root.dataset.activeView = name;

  for (const [viewName, el] of Object.entries(views) as [ViewName, HTMLElement][]) {
    const active = viewName === name;
    el.setAttribute("aria-hidden", active ? "false" : "true");
    if (active) {
      el.removeAttribute("inert");
    } else {
      el.setAttribute("inert", "");
    }
  }

  const activeEl = views[name];
  activeEl.classList.remove("view--entering");
  void activeEl.offsetWidth;
  activeEl.classList.add("view--entering");
  window.setTimeout(() => {
    activeEl.classList.remove("view--entering");
  }, ENTER_MS);

  if (options?.focusSelector) {
    window.setTimeout(() => {
      const target = activeEl.querySelector<HTMLElement>(options.focusSelector!);
      target?.focus();
    }, 50);
  }
}
