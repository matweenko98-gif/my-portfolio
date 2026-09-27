import React, { forwardRef, useEffect, useImperativeHandle, useRef, useState } from 'react';
import { EditorContent, Node, useEditor, useEditorState } from '@tiptap/react';
import { Fragment } from '@tiptap/pm/model';
import StarterKit from '@tiptap/starter-kit';
import Image from '@tiptap/extension-image';
import Paragraph from '@tiptap/extension-paragraph';
import { TableKit } from '@tiptap/extension-table';
import { autoFormatArticleText, normalizeRussianQuotes, normalizeRussianQuotesInElement } from '../utils/articleFormatting';

const ASIDE_LABELS = { example: 'Пример', tip: 'Что изменить', keypoint: 'Важная мысль', conclusion: 'Вывод' };

const ArticleParagraph = Paragraph.extend({
  addAttributes() {
    return {
      ...this.parent?.(),
      compact: {
        default: false,
        parseHTML: element => element.getAttribute('data-compact') === 'true',
        renderHTML: attributes => attributes.compact ? { 'data-compact': 'true' } : {},
      },
    };
  },
});

function safeArticleHref(value) {
  const href = value.trim();
  if (/^(https?:\/\/|mailto:|tel:|\/(?!\/)|#)/i.test(href)) return href;
  if (/^[\w-]+(?:\.[\w-]+)+(?:[/?#].*)?$/i.test(href)) return `https://${href}`;
  return '';
}

function wrapSelectedListItems(editor, kind) {
  const { selection, schema } = editor.state;
  if (selection.empty) return false;
  const { $from, $to } = selection;
  for (let depth = $from.depth; depth > 0; depth -= 1) {
    const list = $from.node(depth);
    if (!['bulletList', 'orderedList', 'articleSpecialList'].includes(list.type.name)) continue;
    const listPosition = $from.before(depth);
    if ($to.pos >= listPosition + list.nodeSize) continue;
    const selected = [];
    list.forEach((item, offset, index) => {
      const itemStart = listPosition + 1 + offset;
      // A selection ending at the start of the next item's text does not include that item.
      const firstTextStart = itemStart + 2;
      if (selection.from < itemStart + item.nodeSize && selection.to > firstTextStart) selected.push(index);
    });
    if (!selected.length) return false;
    const first = selected[0];
    const last = selected[selected.length - 1] + 1;
    const items = Array.from({ length: list.childCount }, (_, index) => list.child(index));
    const makeList = (children, startIndex) => list.type.create(
      list.type.name === 'orderedList' ? { ...list.attrs, start: (list.attrs.start || 1) + startIndex } : list.attrs,
      children
    );
    const replacement = [];
    if (first > 0) replacement.push(makeList(items.slice(0, first), 0));
    replacement.push(schema.nodes.articleAside.create(
      { kind, label: ASIDE_LABELS[kind] },
      makeList(items.slice(first, last), first)
    ));
    if (last < items.length) replacement.push(makeList(items.slice(last), last));
    editor.view.dispatch(editor.state.tr.replaceWith(listPosition, listPosition + list.nodeSize, Fragment.fromArray(replacement)));
    editor.commands.focus();
    return true;
  }
  return false;
}

const ArticleAside = Node.create({
  name: 'articleAside',
  group: 'block',
  content: 'block+',
  defining: true,
  addAttributes() {
    return {
      kind: {
        default: 'keypoint',
        parseHTML: element => ['example', 'tip', 'keypoint', 'conclusion'].find(kind => element.classList.contains(`article-${kind}`)) || 'keypoint',
      },
      label: {
        default: '',
        parseHTML: element => element.getAttribute('data-label') || element.querySelector('.article-block-label')?.textContent?.trim() || ASIDE_LABELS[['example', 'tip', 'keypoint', 'conclusion'].find(kind => element.classList.contains(`article-${kind}`))] || '',
      },
    };
  },
  parseHTML() {
    return [
      { tag: 'aside.article-example' },
      { tag: 'aside.article-tip' },
      { tag: 'aside.article-keypoint' },
      { tag: 'aside.article-conclusion' },
    ];
  },
  renderHTML({ node }) {
    return ['aside', { class: `article-${node.attrs.kind}`, 'data-label': node.attrs.label || ASIDE_LABELS[node.attrs.kind] }, 0];
  },
});

const ArticleButton = Node.create({
  name: 'articleButton',
  group: 'block',
  atom: true,
  selectable: true,
  addAttributes() {
    return {
      href: { default: '', parseHTML: element => element.getAttribute('href') || '' },
      label: { default: '', parseHTML: element => element.textContent?.trim() || '' },
    };
  },
  parseHTML() { return [{ tag: 'a.article-cta-btn-orange' }]; },
  renderHTML({ node }) {
    return ['a', { class: 'article-cta-btn-orange', href: node.attrs.href, target: '_blank', rel: 'noopener noreferrer' }, node.attrs.label];
  },
});

const ArticleFigure = Node.create({
  name: 'articleFigure',
  group: 'block',
  atom: true,
  draggable: true,
  addAttributes() {
    return {
      src: { default: '', parseHTML: element => element.querySelector('img')?.getAttribute('src') || '' },
      alt: { default: '', parseHTML: element => element.querySelector('img')?.getAttribute('alt') || '' },
      caption: { default: '', parseHTML: element => element.querySelector('figcaption')?.textContent?.trim() || '' },
    };
  },
  parseHTML() {
    return [{ tag: 'figure:has(img)' }];
  },
  renderHTML({ node }) {
    const { src, alt, caption } = node.attrs;
    return ['figure', { class: 'article-inline-image' },
      ['img', { src, alt }],
      ...(caption ? [['figcaption', {}, caption]] : []),
    ];
  },
});

const ArticleSpecialList = Node.create({
  name: 'articleSpecialList',
  priority: 1000,
  group: 'block list',
  content: 'listItem+',
  addAttributes() {
    return {
      kind: {
        default: 'detail',
        parseHTML: element => element.classList.contains('article-question-list') ? 'question' : 'detail',
      },
    };
  },
  parseHTML() {
    return [{ tag: 'ul.article-detail-list' }, { tag: 'ul.article-question-list' }];
  },
  renderHTML({ node }) {
    return ['ul', { class: node.attrs.kind === 'question' ? 'article-question-list' : 'article-detail-list' }, 0];
  },
});

function prepareEditorHtml(content) {
  if (!content?.trim()) return '<p></p>';
  const document = new DOMParser().parseFromString(autoFormatArticleText(content), 'text/html');
  document.body.querySelectorAll('div.article-callout').forEach(callout => {
    const aside = document.createElement('aside');
    aside.className = 'article-tip';
    const labelElement = Array.from(callout.children).find(child =>
      child.matches('strong, .article-block-label') || child.tagName === 'DIV' && child.textContent.trim().length < 50
    );
    aside.setAttribute('data-label', labelElement?.textContent?.trim() || ASIDE_LABELS.tip);
    Array.from(callout.children).forEach(child => {
      if (child === labelElement) return;
      aside.appendChild(child.cloneNode(true));
    });
    if (!aside.children.length) {
      const paragraph = document.createElement('p');
      paragraph.textContent = callout.textContent.trim();
      aside.appendChild(paragraph);
    }
    callout.replaceWith(aside);
  });
  document.body.querySelectorAll('aside .article-block-label').forEach(label => {
    if (!label.parentElement.hasAttribute('data-label')) label.parentElement.setAttribute('data-label', label.textContent.trim());
    label.remove();
  });
  document.body.querySelectorAll('.article-table-wrap').forEach(wrapper => {
    const table = wrapper.querySelector('table');
    if (table) wrapper.replaceWith(table);
  });
  return document.body.innerHTML;
}

const TOOL_BUTTON = 'px-2.5 py-1.5 text-[11px] sm:text-xs font-medium border rounded-sm transition-colors cursor-pointer';

const ArticleRichEditor = forwardRef(function ArticleRichEditor({ content, onChange }, ref) {
  const onChangeRef = useRef(onChange);
  const lastEditorHtmlRef = useRef(content);
  const [linkForm, setLinkForm] = useState(null);
  const [linkLabel, setLinkLabel] = useState('');
  const [linkHref, setLinkHref] = useState('');
  onChangeRef.current = onChange;

  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit.configure({ heading: { levels: [2, 3] }, paragraph: false }),
      ArticleParagraph,
      Image,
      TableKit,
      ArticleAside,
      ArticleButton,
      ArticleFigure,
      ArticleSpecialList,
    ],
    content: prepareEditorHtml(content),
    editorProps: {
      attributes: {
        class: 'article-editor-surface',
        'aria-label': 'Текст статьи — визуальный редактор',
      },
      handleTextInput(view, from, to, text) {
        if (text !== '"' && text !== '“' && text !== '”') return false;
        const state = { open: false };
        const blockStart = view.state.doc.resolve(from).start();
        normalizeRussianQuotes(view.state.doc.textBetween(blockStart, from), state);
        view.dispatch(view.state.tr.insertText(normalizeRussianQuotes(text, state), from, to));
        return true;
      },
      transformPastedText: text => normalizeRussianQuotes(text),
      transformPastedHTML(html) {
        const parsed = new DOMParser().parseFromString(html, 'text/html');
        normalizeRussianQuotesInElement(parsed.body);
        return parsed.body.innerHTML;
      },
    },
    onUpdate: ({ editor: currentEditor }) => {
      const html = currentEditor.getHTML();
      lastEditorHtmlRef.current = html;
      onChangeRef.current(html);
    },
  });

  useEffect(() => {
    if (!editor || content === lastEditorHtmlRef.current) return;
    editor.commands.setContent(prepareEditorHtml(content), { emitUpdate: false });
    lastEditorHtmlRef.current = content;
  }, [content, editor]);

  useImperativeHandle(ref, () => ({
    insertFigure: ({ src, alt, caption }) => editor?.chain().focus().insertContent({ type: 'articleFigure', attrs: { src, alt, caption } }).run(),
    focus: () => editor?.commands.focus(),
  }), [editor]);

  const active = useEditorState({
    editor,
    selector: ({ editor: current }) => current ? ({
      empty: current.isEmpty,
      h2: current.isActive('heading', { level: 2 }),
      h3: current.isActive('heading', { level: 3 }),
      bold: current.isActive('bold'),
      italic: current.isActive('italic'),
      bulletList: current.isActive('bulletList'),
      orderedList: current.isActive('orderedList'),
      aside: current.getAttributes('articleAside').kind || '',
      inAside: current.isActive('articleAside'),
      asideLabel: current.getAttributes('articleAside').label || '',
      link: current.isActive('link'),
      compact: current.isActive('paragraph', { compact: true }),
    }) : {},
  });

  const setAside = kind => {
    if (!editor) return;
    if (!editor.isActive('articleAside') && wrapSelectedListItems(editor, kind)) return;
    const chain = editor.chain().focus();
    if (editor.isActive('articleAside')) chain.updateAttributes('articleAside', { kind, label: ASIDE_LABELS[kind] }).run();
    else chain.wrapIn('articleAside', { kind, label: ASIDE_LABELS[kind] }).run();
  };

  const openLinkForm = type => {
    if (!editor) return;
    const { from, to } = editor.state.selection;
    setLinkForm({ type, from, to });
    setLinkLabel(editor.state.doc.textBetween(from, to, ' ') || (type === 'button' ? 'Подробнее' : ''));
    setLinkHref(type === 'link' ? editor.getAttributes('link').href || '' : '');
  };

  const applyLink = event => {
    event?.preventDefault();
    if (!editor || !linkForm) return;
    const href = safeArticleHref(linkHref);
    if (!href) return;
    const label = linkLabel.trim();
    if (linkForm.type === 'button') {
      if (!label) return;
      editor.chain().focus().setTextSelection({ from: linkForm.from, to: linkForm.to }).insertContent({ type: 'articleButton', attrs: { href, label } }).run();
    } else if (linkForm.from !== linkForm.to) {
      const selectedText = editor.state.doc.textBetween(linkForm.from, linkForm.to, ' ');
      const chain = editor.chain().focus().setTextSelection({ from: linkForm.from, to: linkForm.to });
      if (label && label !== selectedText) chain.insertContent({ type: 'text', text: label, marks: [{ type: 'link', attrs: { href, target: '_blank', rel: 'noopener noreferrer' } }] }).run();
      else chain.setLink({ href, target: '_blank', rel: 'noopener noreferrer' }).run();
    } else {
      if (!label) return;
      editor.chain().focus().setTextSelection(linkForm.from).insertContent({ type: 'text', text: label, marks: [{ type: 'link', attrs: { href, target: '_blank', rel: 'noopener noreferrer' } }] }).run();
    }
    setLinkForm(null);
  };

  const toolbarButton = (label, action, pressed = false, title = '') => (
    <button
      key={label}
      type="button"
      onMouseDown={event => event.preventDefault()}
      onClick={action}
      aria-pressed={pressed}
      title={title || label}
      className={`${TOOL_BUTTON} ${pressed ? 'bg-zinc-900 border-zinc-900 text-white' : 'bg-white border-zinc-300 text-zinc-800 hover:border-zinc-700'}`}
    >
      {label}
    </button>
  );

  return (
    <div className="border border-zinc-300 rounded-sm bg-white overflow-hidden">
      <div className="flex flex-wrap gap-1.5 p-2.5 sm:p-3 border-b border-zinc-200 bg-zinc-50">
        {toolbarButton('Абзац', () => editor?.chain().focus().setParagraph().run(), !active.h2 && !active.h3 && !active.inAside)}
        {toolbarButton('Раздел', () => editor?.chain().focus().setHeading({ level: 2 }).run(), active.h2, 'Заголовок раздела H2')}
        {toolbarButton('Подзаголовок', () => editor?.chain().focus().setHeading({ level: 3 }).run(), active.h3, 'Подзаголовок H3')}
        <span className="w-px h-7 bg-zinc-300 mx-0.5" />
        {toolbarButton('Жирный', () => editor?.chain().focus().toggleBold().run(), active.bold)}
        {toolbarButton('Курсив', () => editor?.chain().focus().toggleItalic().run(), active.italic)}
        {toolbarButton('• Список', () => editor?.chain().focus().toggleBulletList().run(), active.bulletList)}
        {toolbarButton('1. Список', () => editor?.chain().focus().toggleOrderedList().run(), active.orderedList)}
        {toolbarButton('Убрать отступ', () => editor?.chain().focus().updateAttributes('paragraph', { compact: !active.compact }).run(), active.compact, 'Выделите соседние абзацы: расстояние между ними станет меньше. Повторное нажатие вернёт отступ.')}
        <span className="w-px h-7 bg-zinc-300 mx-0.5" />
        {toolbarButton('Ссылка', () => openLinkForm('link'), active.link, 'Подчёркнутая текстовая ссылка')}
        {toolbarButton('Кнопка', () => openLinkForm('button'), false, 'Кнопка со ссылкой')}
        {active.link && toolbarButton('Убрать ссылку', () => editor?.chain().focus().unsetLink().run())}
      </div>
      <div className="flex flex-wrap gap-1.5 px-2.5 sm:px-3 py-2 border-b border-zinc-200 bg-white">
        {toolbarButton('Пример', () => setAside('example'), active.inAside && active.aside === 'example')}
        {toolbarButton('Что изменить', () => setAside('tip'), active.inAside && active.aside === 'tip')}
        {toolbarButton('Важная мысль', () => setAside('keypoint'), active.inAside && active.aside === 'keypoint')}
        {toolbarButton('Вывод', () => setAside('conclusion'), active.inAside && active.aside === 'conclusion')}
        {active.inAside && toolbarButton('Убрать плашку', () => editor?.chain().focus().lift('articleAside').run())}
        {active.inAside && <label className="flex items-center gap-2 text-[11px] text-zinc-600"><span>Надпись:</span><input aria-label="Надпись плашки" type="text" value={active.asideLabel || ASIDE_LABELS[active.aside] || ''} onChange={event => editor?.commands.updateAttributes('articleAside', { label: event.target.value })} className="px-2 py-1 border border-zinc-300 rounded-sm w-36 text-zinc-900" /></label>}
        <span className="text-[11px] text-zinc-500 self-center ml-auto">Выделите несколько абзацев или весь список, затем нажмите тип плашки — они окажутся в одной плашке</span>
      </div>
      {linkForm && <div className="flex flex-wrap gap-2 items-center p-3 border-b border-zinc-200 bg-orange-50/50" onKeyDown={event => { if (event.key === 'Enter') applyLink(event); }}>
        <input autoFocus type="text" value={linkLabel} onChange={event => setLinkLabel(event.target.value)} placeholder="Текст ссылки или кнопки" aria-label="Текст ссылки или кнопки" className="flex-1 min-w-36 px-2 py-1.5 text-xs border border-zinc-300 rounded-sm" />
        <input type="text" value={linkHref} onChange={event => setLinkHref(event.target.value)} placeholder="https://... или /страница" aria-label="Адрес ссылки" className="flex-1 min-w-36 px-2 py-1.5 text-xs border border-zinc-300 rounded-sm" />
        <button type="button" onClick={applyLink} className="px-3 py-1.5 bg-[#FF5B23] text-white text-xs font-semibold rounded-sm">Добавить</button>
        <button type="button" onClick={() => setLinkForm(null)} className="px-2 py-1.5 text-xs text-zinc-600">Отмена</button>
      </div>}
      <div className="relative">
        {active.empty && <span className="absolute top-6 left-4 sm:left-12 text-sm text-zinc-400 pointer-events-none">Начните писать статью или вставьте готовый текст…</span>}
        <EditorContent editor={editor} className="article-content-body article-rich-editor prose prose-zinc max-w-none" />
      </div>
    </div>
  );
});

export default ArticleRichEditor;
