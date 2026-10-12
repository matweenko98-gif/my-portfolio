// These presentation settings are stored in the existing JSON meta column.
// Older databases do not have separate columns for them.
const presentationKeys = ['demo_url', 'description', 'is_ai_concept', 'is_desktop_only'];

export function normalizeCaseRecord(record) {
  if (!record) return record;
  const settings = record.meta?.presentation || {};
  return { ...settings, ...record };
}

export function serializeCaseRecord(record, previousMeta = {}) {
  const payload = { ...record };
  const meta = { ...previousMeta, ...record.meta };
  const presentation = { ...previousMeta.presentation, ...meta.presentation };
  for (const key of presentationKeys) {
    if (Object.hasOwn(payload, key)) presentation[key] = payload[key];
    delete payload[key];
  }
  payload.meta = { ...meta, presentation };
  return payload;
}
