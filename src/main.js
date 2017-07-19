'use strict';

const vscode = require('vscode');
const onCommandToggleAnchor = require('./lib/anchor-commands').onCommandToggleAnchor;
const onCommandActivateCursors = require('./lib/anchor-commands').onCommandActivateCursors;
const onCommandCleanAnchors = require('./lib/anchor-commands').onCommandCleanAnchors;
const onDidChangeTextDocument = require('./lib/anchor-commands').onDidChangeTextDocument;
const camelCaseNav = require('./lib/camel-case-nav');

module.exports = {
  activate(context) {

    const config = vscode.workspace.getConfiguration('cursor-tools');

    context.subscriptions.push(
      vscode.commands.registerTextEditorCommand('cursorToolsAnchorLeave', onCommandToggleAnchor),
      vscode.commands.registerTextEditorCommand('cursorToolsAnchorActivate', onCommandActivateCursors),
      vscode.commands.registerTextEditorCommand('cursorToolsAnchorClean', onCommandCleanAnchors)
    );

    if (config.subWordNavigation) {
      const navigator = new camelCaseNav.CamelCaseNav();

      context.subscriptions.push(
        vscode.commands.registerTextEditorCommand('cursorWordStartLeft', editor => navigator.doAction(editor, null, camelCaseNav.DIRECTION_LEFT, camelCaseNav.ACTION_MOVE)),
        vscode.commands.registerTextEditorCommand('cursorWordEndRight', editor => navigator.doAction(editor, null, camelCaseNav.DIRECTION_RIGHT, camelCaseNav.ACTION_MOVE)),
        vscode.commands.registerTextEditorCommand('cursorWordStartLeftSelect', editor => navigator.doAction(editor, null, camelCaseNav.DIRECTION_LEFT, camelCaseNav.ACTION_SELECT)),
        vscode.commands.registerTextEditorCommand('cursorWordEndRightSelect', editor => navigator.doAction(editor, null, camelCaseNav.DIRECTION_RIGHT, camelCaseNav.ACTION_SELECT)),
        vscode.commands.registerTextEditorCommand('deleteWordLeft', (editor, change) => navigator.doAction(editor, change, camelCaseNav.DIRECTION_LEFT, camelCaseNav.ACTION_DELETE)),
        vscode.commands.registerTextEditorCommand('deleteWordRight', (editor, change) => navigator.doAction(editor, change, camelCaseNav.DIRECTION_RIGHT, camelCaseNav.ACTION_DELETE)),
      );
    }

    vscode.window.onDidChangeActiveTextEditor(onTextEditorChange, null, context.subscriptions);
    vscode.workspace.onDidChangeTextDocument(onDidChangeTextDocument, null, context.subscriptions);

    if (vscode.window.activeTextEditor) {
      onTextEditorChange(vscode.window.activeTextEditor);
    }
  },
  deactivate() { }
};

function onTextEditorChange(textEditor) {
  if (textEditor) {
    textEditor.cursorAnchors = textEditor.cursorAnchors || [];
  }
}

