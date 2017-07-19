'use strict';

const vscode = require('vscode');
const onCommandToggleAnchor = require('./lib/anchor-commands').onCommandToggleAnchor;
const onCommandActivateCursors = require('./lib/anchor-commands').onCommandActivateCursors;
const onCommandCleanAnchors = require('./lib/anchor-commands').onCommandCleanAnchors;
const onDidChangeTextDocument = require('./lib/anchor-commands').onDidChangeTextDocument;
const camelCaseNav = require('./lib/camel-case-nav');


module.exports = {
  activate (context) {
    const navigator = new camelCaseNav.CamelCaseNav();

    context.subscriptions.push(
      vscode.commands.registerTextEditorCommand('cursorWordStartLeft', editor => navigator.doAction(editor, camelCaseNav.DIRECTION_LEFT, camelCaseNav.ACTION_MOVE)),
      vscode.commands.registerTextEditorCommand('cursorWordEndRight', editor => navigator.doAction(editor, camelCaseNav.DIRECTION_RIGHT, camelCaseNav.ACTION_MOVE)),
      vscode.commands.registerTextEditorCommand('cursorWordStartLeftSelect', editor => navigator.doAction(editor, camelCaseNav.DIRECTION_LEFT, camelCaseNav.ACTION_SELECT)),
      vscode.commands.registerTextEditorCommand('cursorWordEndRightSelect', editor => navigator.doAction(editor, camelCaseNav.DIRECTION_RIGHT, camelCaseNav.ACTION_SELECT)),
      vscode.commands.registerTextEditorCommand('extension.cursor-tools.anchor', onCommandToggleAnchor),
      vscode.commands.registerTextEditorCommand('extension.cursor-tools.activate', onCommandActivateCursors),
      vscode.commands.registerTextEditorCommand('extension.cursor-tools.clean', onCommandCleanAnchors)
    );

    vscode.window.onDidChangeActiveTextEditor(onTextEditorChange, null, context.subscriptions);
    vscode.workspace.onDidChangeTextDocument(onDidChangeTextDocument, null, context.subscriptions);

    if (vscode.window.activeTextEditor) {
      onTextEditorChange(vscode.window.activeTextEditor);
    }
  },
  deactivate () { }
};


function onTextEditorChange (textEditor) {
  textEditor.cursorAnchors = textEditor.cursorAnchors || [];
}
