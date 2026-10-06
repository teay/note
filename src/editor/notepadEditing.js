import { DOMParser } from '@tiptap/pm/model';
import { sinkListItem } from '@tiptap/pm/schema-list';

const INDENT = '\t';
const SPACE_INDENT_PATTERN = /^(\t|[ ]{1,4})/;

function isInsideList($from) {
  for (let depth = $from.depth; depth > 0; depth -= 1) {
    if ($from.node(depth).type.name === 'listItem') return true;
  }
  return false;
}

function outdentLine(view, state) {
  const { selection, tr } = state;
  const { $from } = selection;
  if (!selection.empty) return false;

  const line = $from.parent
    .textBetween(0, $from.parentOffset, '\n', '\n')
    .split('\n')
    .pop();
  const match = line.match(SPACE_INDENT_PATTERN);
  if (!match) return false;
  if ($from.parentOffset < match[0].length) return false;

  view.dispatch(tr.deleteRange($from.pos - match[0].length, $from.pos));
  return true;
}

function insertTab(view, state) {
  const { selection, tr } = state;
  const { $from, $to } = selection;
  if (!selection.empty && $from.parent !== $to.parent) return false;

  if (!view.hasFocus()) view.focus();
  view.dispatch(tr.insertText(INDENT));
  return true;
}

export function textToPasteDom(text, doc) {
  const normalized = text.replace(/\r\n?/g, '\n').replace(/\n$/, '');
  const dom = doc.createElement('div');

  normalized.split('\n\n').forEach((block) => {
    const paragraph = doc.createElement('p');
    const lines = block.split('\n');
    if (lines.length > 1 && lines[lines.length - 1] === '') lines.pop();

    lines.forEach((line, index) => {
      if (index > 0) paragraph.appendChild(doc.createElement('br'));
      if (line) paragraph.appendChild(doc.createTextNode(line));
    });

    dom.appendChild(paragraph);
  });

  return dom;
}

export function notepadEditingProps() {
  return {
    handleKeyDown(view, event) {
      if (event.key !== 'Tab') return false;
      if (event.isComposing || event.keyCode === 229) return false;

      const { state } = view;
      const { $from } = state.selection;
      if (!$from.parent.isTextblock) return false;

      if (isInsideList($from)) {
        if (event.shiftKey) return false;
        const listItem = state.schema.nodes.listItem;
        // Let TipTap's list keymap indent when it can (sinking the first item of
        // a list is never possible), otherwise fall back to a literal tab.
        if (listItem && sinkListItem(listItem)(state, null)) return false;
        return insertTab(view, state);
      }

      if (event.shiftKey) return outdentLine(view, state);
      return insertTab(view, state);
    },

    clipboardTextParser(text, context, plainText, view) {
      const dom = textToPasteDom(text, view.dom.ownerDocument);
      return DOMParser.fromSchema(view.state.schema).parseSlice(dom, {
        preserveWhitespace: true,
        context,
      });
    },
  };
}
