'use strict';
const vscode = require('vscode');
const decor = vscode.window.createTextEditorDecorationType({
  borderStyle: 'solid',
  borderWidth: '1px',
  borderColor: 'rgba(255, 255, 255, 0.2)'
});

module.exports = {
  onCommandToggleAnchor,
  onCommandActivateCursors,
  onCommandCleanAnchors,
  onDidChangeTextDocument
};

function onCommandToggleAnchor (textEditor, textEditorEdit) {
  const currentDocumentOffset = textEditor.document.offsetAt(textEditor.selection.active);
  const index = isAnchorExist(textEditor, currentDocumentOffset);

  if (index === -1) {
    textEditor.cursorAnchors.push(currentDocumentOffset);
  } else {
    textEditor.cursorAnchors.splice(index, 1);
  }

  updateDecorations(textEditor);
}

function onCommandActivateCursors (textEditor, textEditorEdit) {
  const currentDocumentOffset = textEditor.document.offsetAt(textEditor.selection.active);

  textEditor.selections = [currentDocumentOffset]
    .concat(textEditor.cursorAnchors)
    .map(createSelection.bind(textEditor));

  onCommandCleanAnchors(textEditor, textEditorEdit);
}

function onCommandCleanAnchors (textEditor, textEditorEdit) {
  textEditor.cursorAnchors = [];

  updateDecorations(textEditor);
}

function onDidChangeTextDocument (textDocumentChangeEvent) {
  const textEditor = vscode.window.activeTextEditor;
  const textDocument = textDocumentChangeEvent.document;

  if (textEditor.document !== textDocument) {
    return;
  }

  const filters = textDocumentChangeEvent.contentChanges.map(contentChange => {
    const offsetStart = textDocument.offsetAt(contentChange.range.start);
    const offsetEnd = textDocument.offsetAt(contentChange.range.end);

    return (offset) => !(offset >= offsetStart && offset <= offsetEnd);
  });

  textEditor.cursorAnchors = filters
    .reduce((acc, fn) => acc.filter(fn), textEditor.cursorAnchors)
    .map(offset => {
      return textDocumentChangeEvent.contentChanges.reduce((acc, contentChange) => {
        if (textDocument.offsetAt(contentChange.range.start) <= offset) {
          return acc - contentChange.rangeLength + contentChange.text.length;
        }

        return acc;
      }, offset);
    });

  updateDecorations(textEditor);
}


function updateDecorations (textEditor) {
  const decorRange = textEditor.cursorAnchors
    .map(createRange.bind(textEditor));

  textEditor.setDecorations(decor, decorRange);
}


function isAnchorExist (textEditor, currentDocumentOffset) {
  return textEditor.cursorAnchors.indexOf(currentDocumentOffset);
}

function createSelection (offset) {
  const position = this.document.positionAt(offset);

  return new vscode.Selection(position, position);
}

function createRange (offset) {
  const position = this.document.positionAt(offset);

  return new vscode.Range(position, position);
}
