function escapeHtml(value = '') {
  return value.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

export function normalizeRussianQuotes(value = '', state = { open: false }) {
  let result = '';
  for (const character of value) {
    if (character === '«' || character === '“') {
      state.open = true;
      result += '«';
    } else if (character === '»' || character === '”') {
      state.open = false;
      result += '»';
    } else if (character === '"') {
      result += state.open ? '»' : '«';
      state.open = !state.open;
    } else {
      result += character;
    }
  }
  return result;
}

export function normalizeRussianQuotesInElement(element) {
  const quoteState = { open: false };
  const walker = element.ownerDocument.createTreeWalker(element, 4);
  while (walker.nextNode()) {
    const node = walker.currentNode;
    if (node.parentElement?.closest('code, pre, script, style, textarea')) continue;
    node.textContent = normalizeRussianQuotes(node.textContent, quoteState);
  }
}

function cleanHeading(value = '') {
  return value.replace(/\.\s*$/, '').trim();
}

function preserveInlineMarkup(line) {
  return /<\/?(?:strong|em|b|i|u|span|a|code|br)\b/i.test(line) ? line : escapeHtml(line);
}

function plainTextToHtml(source) {
  const blocks = [];
  let list = [];
  const flushList = () => {
    if (!list.length) return;
    blocks.push(`<ul>${list.map(item => `<li>${escapeHtml(item)}</li>`).join('')}</ul>`);
    list = [];
  };

  for (const rawLine of source.split(/\r?\n/)) {
    const line = rawLine.trim();
    if (!line) {
      flushList();
      continue;
    }
    const bullet = /^[•*\-]\s+(.+)/.exec(line);
    if (bullet) {
      list.push(bullet[1]);
      continue;
    }
    flushList();

    const markdownHeading = /^(#{2,3})\s+(.+)/.exec(line);
    if (markdownHeading) {
      const tag = markdownHeading[1].length === 2 ? 'h2' : 'h3';
      blocks.push(`<${tag}>${preserveInlineMarkup(cleanHeading(markdownHeading[2]))}</${tag}>`);
    } else if (/^\d+[.)]\s+/.test(line) && line.length < 130) {
      blocks.push(`<h2>${preserveInlineMarkup(cleanHeading(line))}</h2>`);
    } else if (/^что изменить\s*:/i.test(line)) {
      const advice = line.replace(/^что изменить\s*:/i, '').trim();
      blocks.push(`<div class="article-callout"><strong>Что изменить</strong><p>${escapeHtml(advice)}</p></div>`);
    } else {
      blocks.push(`<p>${preserveInlineMarkup(line)}</p>`);
    }
  }
  flushList();
  return blocks.join('\n');
}

function isSectionHeading(paragraph) {
  if (paragraph.tagName !== 'P' || !paragraph.textContent ||
    Array.from(paragraph.children).some(child => !['STRONG', 'B'].includes(child.tagName))) return false;
  const text = paragraph.textContent.replace(/\s+/g, ' ').trim();
  const words = text.split(/\s+/);
  if (text.length < 12 || text.length > 105 || words.length < 2) return false;
  if (/[.!;:…→]$/.test(text) || /\t|https?:\/\/|www\./i.test(paragraph.textContent)) return false;
  if (/^\d+[.)]\s/.test(text)) return false;

  const previous = paragraph.previousElementSibling;
  const next = paragraph.nextElementSibling;
  const majorHeading = getInferredHeadingTag(text) === 'h2';
  if (!next || (!['P', 'UL', 'OL', 'TABLE'].includes(next.tagName) &&
    !next.classList.contains('article-table-wrap'))) return false;
  if (previous?.tagName === 'P' && /:\s*$/.test(previous.textContent.trim())) return false;
  if (!majorHeading && next.tagName === 'P' && next.textContent.trim().length < 25 && !next.textContent.includes('\t')) return false;
  if (!majorHeading && next.tagName === 'P' && /^[а-яё]/.test(next.textContent.trim()) && !text.endsWith('?')) return false;
  return text.endsWith('?') || words.length >= 3;
}

function getInferredHeadingTag(text) {
  return /^(?:Коротко(?:\s|:)|Когда\s|Если\s|Один\s+сайт(?:\s|$)|А\s+что\s|Ошибка(?:\s|:)|Как\s+я\s|Что\s+(?:выбрать|дешевле|в\s+итоге)(?:\s|\?|$)|Лендинг\s+или\s|Но\s+лендинг(?:\s|$))/i.test(text)
    ? 'h2'
    : 'h3';
}

function repairNumberedLists(body) {
  for (const heading of Array.from(body.children)) {
    if (heading.tagName !== 'H2') continue;
    const first = /^1[.)]\s+(.+)/.exec(heading.textContent.trim());
    if (!first) continue;

    const sequence = [heading];
    let next = heading.nextElementSibling;
    while (next?.tagName === 'H2') {
      const item = new RegExp(`^${sequence.length + 1}[.)]\\s+(.+)`).exec(next.textContent.trim());
      if (!item) break;
      sequence.push(next);
      next = next.nextElementSibling;
    }
    if (sequence.length < 3) continue;

    const list = body.ownerDocument.createElement('ol');
    for (const item of sequence) {
      const li = body.ownerDocument.createElement('li');
      li.textContent = item.textContent.trim().replace(/^\d+[.)]\s+/, '').replace(/[;,]\s*$/, '');
      list.appendChild(li);
    }
    heading.replaceWith(list);
    sequence.slice(1).forEach(item => item.remove());
  }
}

function formatTabularContent(body) {
  for (const paragraph of Array.from(body.children)) {
    if (paragraph.tagName !== 'P' || !paragraph.textContent.includes('\t')) continue;
    const rows = [];
    let current = paragraph;
    while (current?.tagName === 'P' && current.textContent.includes('\t')) {
      rows.push(current);
      current = current.nextElementSibling;
    }
    if (rows.length < 3) continue;

    const document = body.ownerDocument;
    const wrapper = document.createElement('div');
    wrapper.className = 'article-table-wrap';
    const table = document.createElement('table');
    const tableHead = document.createElement('thead');
    const tableBody = document.createElement('tbody');
    const columnCount = Math.max(...rows.map(row => row.textContent.split('\t').length));
    rows.forEach((row, rowIndex) => {
      const tr = document.createElement('tr');
      const cells = row.textContent.split('\t').map(cell => cell.trim());
      if (rowIndex === 0 && cells.length === columnCount - 1) cells.unshift('Критерий');
      cells.forEach(value => {
        const cell = document.createElement(rowIndex === 0 ? 'th' : 'td');
        cell.textContent = value;
        tr.appendChild(cell);
      });
      (rowIndex === 0 ? tableHead : tableBody).appendChild(tr);
    });
    table.append(tableHead, tableBody);
    wrapper.appendChild(table);
    paragraph.replaceWith(wrapper);
    rows.slice(1).forEach(row => row.remove());
  }
}

function formatShortLists(body) {
  for (const paragraph of Array.from(body.children)) {
    if (paragraph.tagName !== 'P' || !/:\s*$/.test(paragraph.textContent.trim())) continue;
    const items = [];
    let next = paragraph.nextElementSibling;
    while (next?.tagName === 'P' && next.textContent.trim().length <= 55 &&
      !/[.!?;:]$/.test(next.textContent.trim()) && !next.textContent.includes('\t')) {
      items.push(next);
      next = next.nextElementSibling;
    }
    if (items.length < 3) continue;
    const list = body.ownerDocument.createElement('ul');
    items.forEach(item => {
      const li = body.ownerDocument.createElement('li');
      li.textContent = item.textContent.trim();
      list.appendChild(li);
    });
    paragraph.after(list);
    items.forEach(item => item.remove());
  }
}

function formatQuestionPairs(body) {
  for (const paragraph of Array.from(body.children)) {
    if (paragraph.tagName !== 'P' || !/\?$/.test(paragraph.textContent.trim())) continue;
    const questions = [];
    let next = paragraph;
    while (next?.tagName === 'P' && /\?$/.test(next.textContent.trim())) {
      questions.push(next);
      next = next.nextElementSibling;
    }
    if (questions.length < 4) continue;
    const list = body.ownerDocument.createElement('ul');
    list.className = 'article-question-list';
    for (let index = 0; index < questions.length; index += 2) {
      const item = body.ownerDocument.createElement('li');
      const label = body.ownerDocument.createElement('strong');
      label.textContent = questions[index].textContent.trim();
      item.appendChild(label);
      if (questions[index + 1]) {
        const detail = body.ownerDocument.createElement('span');
        detail.textContent = questions[index + 1].textContent.trim();
        item.appendChild(detail);
      }
      list.appendChild(item);
    }
    paragraph.replaceWith(list);
    questions.slice(1).forEach(question => question.remove());
  }
}

export function autoFormatArticleText(rawText) {
  if (!rawText?.trim()) return '';
  let source = rawText.replace(/className=/g, 'class=').replace(/style="[^"]*"/gi, '');
  source = source.replace(/<div\b([^>]*)>/gi, (match, attributes) => (
    /\b(?:bg-black|bg-(?:zinc|neutral)-(?:8|9)\d{2})\b/.test(attributes) ? '<div>' : match
  ));
  const hasBlockHtml = /<\/?(?:p|h[1-6]|div|aside|ul|ol|li|figure|blockquote|table)\b/i.test(source);
  const document = new DOMParser().parseFromString(hasBlockHtml ? source : plainTextToHtml(source), 'text/html');
  const { body } = document;

  // Pasted content can mix raw paragraphs with blocks inserted by the toolbar.
  // Make those text nodes visible as paragraphs in both previews and the article.
  for (const node of Array.from(body.childNodes)) {
    if (node.nodeType !== 3 || !node.textContent.trim()) continue;
    const fragment = document.createDocumentFragment();
    node.textContent.split(/\r?\n/).map(line => line.trim()).filter(Boolean).forEach(line => {
      const paragraph = document.createElement('p');
      paragraph.textContent = line;
      fragment.appendChild(paragraph);
    });
    node.replaceWith(fragment);
  }

  body.querySelectorAll('script, style').forEach(element => element.remove());
  body.querySelectorAll('p').forEach(paragraph => {
    if (!paragraph.textContent.trim() && !paragraph.querySelector('img, br')) paragraph.remove();
  });

  formatTabularContent(body);
  formatShortLists(body);
  formatQuestionPairs(body);
  repairNumberedLists(body);
  const hasExplicitSections = Boolean(body.querySelector('h2'));
  body.querySelectorAll('ol').forEach(list => {
    Array.from(list.children).forEach((item, index) => {
      if (item.tagName !== 'LI') return;
      const firstTextNode = Array.from(item.childNodes).find(node => node.nodeType === 3 && node.textContent.trim());
      if (firstTextNode) {
        firstTextNode.nodeValue = firstTextNode.nodeValue.replace(new RegExp(`^\\s*${index + 1}[.)]\\s+`), '');
      }
    });
  });
  for (const paragraph of Array.from(body.children)) {
    if (!isSectionHeading(paragraph)) continue;
    const heading = document.createElement(hasExplicitSections ? getInferredHeadingTag(paragraph.textContent.trim()) : 'h2');
    heading.textContent = cleanHeading(paragraph.textContent);
    paragraph.replaceWith(heading);
  }
  body.querySelectorAll('h1, h2, h3, h4, h5, h6').forEach(heading => {
    heading.textContent = cleanHeading(heading.textContent);
  });

  normalizeRussianQuotesInElement(body);

  return body.innerHTML;
}
