'use strict';
const vscode = require('vscode');
const decor = vscode.window.createTextEditorDecorationType({
  borderStyle: 'solid',
  borderWidth: '1px',
  borderColor: 'rgba(255, 255, 255, 0.2)'
});

module.exports = {
  leaveAnchorCommand,
  activateAnchorCommand
};

function leaveAnchorCommand (textEditor, textEditorEdit) {
  if (!textEditor.cursorAnchors) {
    textEditor.cursorAnchors = [];
  }

  const currentActivePosition = textEditor.selection.active;
  const index = isAnchorExist(textEditor, currentActivePosition);

  if (index === -1) {
    textEditor.cursorAnchors.push(currentActivePosition);
  } else {
    textEditor.cursorAnchors.splice(index, 1);
  }

  updateDecorations(textEditor);
}

function updateDecorations (textEditor) {
  const decorRange = textEditor.cursorAnchors
    .map(createRange.bind(textEditor));

  textEditor.setDecorations(decor, decorRange);
}

function isAnchorExist (textEditor, currentActivePosition) {
  // todo: check existing anchor

  return -1;
}


function activateAnchorCommand (textEditor, textEditorEdit) {
  // const line = textEditor.document.lineAt(cursorPosition);
  textEditor.selections = [textEditor.selection.active]
    .concat(textEditor.cursorAnchors)
    .map(createSelection);

  textEditor.cursorAnchors = [];
  updateDecorations(textEditor);
}

function createSelection (position) {
  return new vscode.Selection(position, position);
}

function createRange (position) {
  return new vscode.Range(position, position.translate(0, 0));
}
