const escapeHtml = text => text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

// Only server-generated tags are allowed; visitor text always stays plain text.
export function telegramMessages(message) {
  const parts = [];
  for (const line of message.split('\n')) {
    let fragment = '';
    for (const character of line) {
      const escaped = escapeHtml(character);
      if (fragment.length + escaped.length > 3400) { parts.push(fragment); fragment = ''; }
      fragment += escaped;
    }
    const label = fragment.match(/^([^:\n]{1,60}:)(.*)$/);
    parts.push(label ? `<b>${label[1]}</b>${label[2]}` : fragment);
  }
  if (parts[0] && !parts[0].startsWith('<b>')) parts[0] = `<b>${parts[0]}</b>`;
  const messages = [];
  let current = '';
  for (const part of parts) {
    if (current.length + part.length + 1 > 3800) { messages.push(current); current = part; }
    else current += (current ? '\n' : '') + part;
  }
  if (current) messages.push(current);
  return messages;
}
