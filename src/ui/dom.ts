export function createEl<K extends keyof HTMLElementTagNameMap>(
  tag: K,
  props?: {
    className?: string;
    text?: string;
    attrs?: Record<string, string>;
  },
): HTMLElementTagNameMap[K] {
  const el = document.createElement(tag);
  if (props?.className) el.className = props.className;
  if (props?.text !== undefined) el.textContent = props.text;
  if (props?.attrs) {
    for (const [key, value] of Object.entries(props.attrs)) {
      el.setAttribute(key, value);
    }
  }
  return el;
}

export function qs<T extends Element>(root: ParentNode, selector: string): T {
  const el = root.querySelector(selector);
  if (!el) throw new Error(`Missing element: ${selector}`);
  return el as T;
}
