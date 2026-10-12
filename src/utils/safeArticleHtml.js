import sanitizeHtml from 'sanitize-html';

export function safeArticleHtml(source = '') {
  return sanitizeHtml(String(source), {
    allowedTags: [...sanitizeHtml.defaults.allowedTags, 'img', 'figure', 'figcaption'],
    allowedAttributes: {
      '*': ['class', 'id'],
      a: ['href', 'title', 'target', 'rel'],
      img: ['src', 'alt', 'width', 'height', 'loading', 'decoding'],
      td: ['colspan', 'rowspan'], th: ['colspan', 'rowspan', 'scope'],
      ol: ['start'],
    },
    allowedSchemes: ['http', 'https', 'mailto', 'tel'],
    allowedSchemesByTag: { img: ['http', 'https'] },
    allowProtocolRelative: false,
    transformTags: {
      a: (tagName, attribs) => ({ tagName, attribs: {
        ...attribs, ...(attribs.target === '_blank' ? { rel: 'noopener noreferrer' } : {}),
      } }),
      img: (tagName, attribs) => ({ tagName, attribs: {
        ...attribs, loading: 'lazy', decoding: 'async',
      } }),
    },
  });
}
