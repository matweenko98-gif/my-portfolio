import { normalizeCaseRecord, serializeCaseRecord } from './caseRecord.js';

export const isConcept = item => !!(item.is_ai_concept || item.isAiConcept);

export function mergePortfolioCases(records, localItems, legacyFallback = false) {
  const rows = (records || []).map(normalizeCaseRecord);
  const fallback = legacyFallback && !rows.length ? localItems : localItems.filter(isConcept);
  const existing = new Set(rows.map(item => item.slug));
  const lastOrder = Math.max(-1, ...rows.map(item => Number.isFinite(item.sort_order) ? item.sort_order : -1));
  const missing = fallback.filter(item => !existing.has(item.slug)).map((item, index) => ({
    ...item, id: `local:${item.slug || index}`, isLocalConcept: isConcept(item), sort_order: lastOrder + index + 1,
  }));
  return [...rows, ...missing].filter(item => !item.meta?.presentation?.hidden)
    .sort((a, b) => (a.sort_order ?? Number.MAX_SAFE_INTEGER) - (b.sort_order ?? Number.MAX_SAFE_INTEGER) || String(a.slug || a.id).localeCompare(String(b.slug || b.id)));
}

export function builtInConceptPayload(item, order = item.sort_order) {
  return serializeCaseRecord({
    slug: item.slug, title: item.title || item.card_title, card_title: item.card_title || item.title,
    card_image: item.card_image || item.imageMain || '', card_tags: item.card_tags || item.tags || ['ИИ-КОНЦЕПТ'],
    sort_order: order, is_ai_concept: true, is_desktop_only: !!item.is_desktop_only,
    description: item.description || '', demo_url: item.demo_url || item.link || '',
    meta: item.meta || {},
  });
}

export async function savePortfolioOrder(client, items) {
  // Materialize built-in demos only when the owner explicitly edits their order.
  for (const [index, item] of items.entries()) {
    const query = item.isLocalConcept
      ? client.from('cases').upsert(builtInConceptPayload(item, index), { onConflict: 'slug' })
      : client.from('cases').update({ sort_order: index }).eq('id', item.id);
    const { error } = await query;
    if (error) throw error;
  }
}
