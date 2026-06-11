const CHIP_ICONS = {
  layout: `<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><rect width="18" height="18" x="3" y="3" rx="2"/><path d="M3 9h18"/><path d="M9 21V9"/></svg>`,
  files: `<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M20 7h-3a2 2 0 0 1-2-2V2"/><path d="M9 18a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h7l4 4v10a2 2 0 0 1-2 2Z"/><path d="M3 7.6v12.8A2 2 0 0 0 5 22h9"/></svg>`,
  fileText: `<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z"/><path d="M14 2v4a2 2 0 0 0 2 2h4"/><path d="M10 9H8"/><path d="M16 13H8"/><path d="M16 17H8"/></svg>`,
};

function createFlyChip(step, iconKey) {
  const chip = document.createElement('div');
  chip.className =
    'fly-item fixed z-[9999] flex items-center gap-1.5 rounded-full bg-white border border-zinc-200 text-zinc-800 px-2 py-1.5 shadow-lg';
  chip.innerHTML = `
    <span class="w-5 h-5 rounded-full bg-zinc-100 border border-zinc-200 flex items-center justify-center text-[10px] font-bold text-zinc-700">${step}</span>
    <span class="text-zinc-600">${CHIP_ICONS[iconKey] || CHIP_ICONS.layout}</span>
  `;
  return chip;
}

export function flyChipToCart(sourceEl, targetEl, { step, iconKey }, onComplete) {
  if (!sourceEl || !targetEl) {
    onComplete?.();
    return;
  }

  const start = sourceEl.getBoundingClientRect();
  const target = targetEl.getBoundingClientRect();
  const clone = createFlyChip(step, iconKey);
  document.body.appendChild(clone);

  const chipRect = clone.getBoundingClientRect();
  const duration = 620;
  const startTime = performance.now();

  const sx = start.left + start.width / 2;
  const sy = start.top + start.height / 2;
  const ex = target.left + target.width / 2;
  const ey = target.top + target.height / 2;

  const cx = (sx + ex) / 2;
  const cy = Math.min(sy, ey) - Math.max(90, Math.abs(ex - sx) * 0.28);

  const ease = (t) => --t * t * t + 1;

  const stepFrame = (now) => {
    const t = Math.min(1, (now - startTime) / duration);
    const e = ease(t);

    const x = (1 - e) * (1 - e) * sx + 2 * (1 - e) * e * cx + e * e * ex;
    const y = (1 - e) * (1 - e) * sy + 2 * (1 - e) * e * cy + e * e * ey;

    clone.style.left = `${x - chipRect.width / 2}px`;
    clone.style.top = `${y - chipRect.height / 2}px`;
    clone.style.transform = `scale(${1 - 0.15 * e})`;
    clone.style.opacity = `${1 - 0.35 * e}`;

    if (t < 0.92) {
      requestAnimationFrame(stepFrame);
    } else {
      clone.remove();
      onComplete?.();
    }
  };

  requestAnimationFrame(stepFrame);
}

/** @deprecated use flyChipToCart */
export function flyItemToSlot(sourceEl, targetEl, label, onComplete) {
  flyChipToCart(sourceEl, targetEl, { step: '•', iconKey: 'layout' }, onComplete);
}
