export function htmlToPlainText(content) {
  if (!content) return '';
  const tmp = document.createElement('div');
  tmp.innerHTML = content;
  tmp.querySelectorAll('p, li, h1, h2, h3, h4, h5, h6, br, tr').forEach((el) => {
    if (el.tagName === 'BR') {
      el.insertAdjacentText('afterend', '\n');
    } else {
      el.insertAdjacentText('beforeend', '\n');
    }
  });
  return tmp.textContent || '';
}
