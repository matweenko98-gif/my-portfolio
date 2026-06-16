/**
 * Утилиты оптимизации изображений через Supabase Image Transformation API
 *
 * ── Совместимость с планами Supabase ─────────────────────────────────────────
 *
 * FREE-план:
 *   Supabase CDN игнорирует параметры width/quality/format на /object/public/.
 *   Изображения отдаются в оригинальном виде — 404 не возникает.
 *   HTML-атрибуты (loading, decoding, width, height) всё равно помогают CLS.
 *
 * PRO-план (и self-hosted с включённым Image Transformation):
 *   Те же URL уже с трансформацией — WebP, ресайз, сжатие.
 *   Переход на Pro активирует оптимизацию без единого изменения кода.
 *
 * Документация: https://supabase.com/docs/guides/storage/serving/image-transformations
 */

/**
 * Добавляет параметры трансформации к Supabase Storage URL.
 * Путь /object/public/ остаётся без изменений — безопасно на Free-плане.
 *
 * @param {string|null|undefined} url         — Исходный URL изображения
 * @param {object}  [opts]                    — Параметры трансформации
 * @param {number}  [opts.width]              — Целевая ширина в px
 * @param {number}  [opts.height]             — Целевая высота в px (опционально)
 * @param {number}  [opts.quality=80]         — Качество 1–100
 * @param {'webp'|'avif'|'origin'} [opts.format='webp'] — Формат
 * @param {'cover'|'contain'|'fill'} [opts.resize='cover'] — Режим ресайза
 * @returns {string} URL с добавленными параметрами (или оригинал если не Supabase)
 */
export function getOptimizedImageUrl(url, opts = {}) {
  if (!url || typeof url !== 'string') return url;

  // Трансформируем только Supabase Storage URL
  // Не меняем путь — /object/public/ остаётся как есть (Free-план совместимость)
  if (!url.includes('supabase.co/storage/')) return url;

  const {
    width,
    height,
    quality = 80,
    format = 'webp',
    resize = 'cover',
  } = opts;

  try {
    const urlObj = new URL(url);

    // Сбрасываем старые параметры, если они уже были
    urlObj.searchParams.delete('width');
    urlObj.searchParams.delete('height');
    urlObj.searchParams.delete('quality');
    urlObj.searchParams.delete('format');
    urlObj.searchParams.delete('resize');

    // Добавляем параметры трансформации
    // На Free-плане они игнорируются CDN, на Pro — применяются
    if (width)   urlObj.searchParams.set('width',   String(width));
    if (height)  urlObj.searchParams.set('height',  String(height));
    if (quality) urlObj.searchParams.set('quality', String(quality));
    if (format)  urlObj.searchParams.set('format',  format);
    if (resize)  urlObj.searchParams.set('resize',  resize);

    return urlObj.toString();
  } catch {
    // Если URL невалидный — возвращаем оригинал без изменений
    return url;
  }
}

// ─── Готовые пресеты для разных контекстов ────────────────────────────────────

/** Аватар в сайдбаре (80×80 px) */
export const avatarImg = (url) =>
  getOptimizedImageUrl(url, { width: 80, height: 80, quality: 85, format: 'webp', resize: 'cover' });

/** Превью карточки кейса на главной (соотношение 4:3, ~650 px) */
export const caseCardImg = (url) =>
  getOptimizedImageUrl(url, { width: 650, quality: 80, format: 'webp', resize: 'cover' });

/** Hero-изображение страницы кейса (LCP-элемент, до 1400 px) */
export const caseHeroImg = (url) =>
  getOptimizedImageUrl(url, { width: 1400, quality: 82, format: 'webp', resize: 'cover' });

/** Панорамное изображение шоукейса (горизонтальный скролл, ~900 px) */
export const panoramaImg = (url) =>
  getOptimizedImageUrl(url, { width: 900, quality: 80, format: 'webp', resize: 'cover' });

/** Десктопный скриншот фичи (16:9, ~800 px) */
export const featureImg = (url) =>
  getOptimizedImageUrl(url, { width: 800, quality: 80, format: 'webp', resize: 'cover' });

/** Мобильный скриншот фичи (9:19, ~400 px) */
export const mobileFeatureImg = (url) =>
  getOptimizedImageUrl(url, { width: 400, quality: 80, format: 'webp', resize: 'contain' });

/** Финальный шоукейс — outro (~1000 px) */
export const outroImg = (url) =>
  getOptimizedImageUrl(url, { width: 1000, quality: 82, format: 'webp', resize: 'cover' });

/** Кастомный блок-изображение (~1000 px) */
export const customBlockImg = (url) =>
  getOptimizedImageUrl(url, { width: 1000, quality: 80, format: 'webp', resize: 'cover' });

/** Отзыв в секции Reviews (~720 px) */
export const reviewImg = (url) =>
  getOptimizedImageUrl(url, { width: 720, quality: 80, format: 'webp', resize: 'contain' });
