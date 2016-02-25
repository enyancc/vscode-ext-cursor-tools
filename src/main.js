'use strict';

const vscode = require('vscode');
const leaveAnchorCommand = require('./lib/anchor-commands').leaveAnchorCommand;
const activateAnchorCommand = require('./lib/anchor-commands').activateAnchorCommand;

module.exports = {
  activate (context) {
    context.subscriptions.push(
      vscode.commands.registerTextEditorCommand('extension.leave-cursor.anchor', (editor, textEdit) => {
        return leaveAnchorCommand(editor, textEdit);
      })
    );

    context.subscriptions.push(
      vscode.commands.registerTextEditorCommand('extension.leave-cursor.activate', (editor, textEdit) => {
        return activateAnchorCommand(editor, textEdit);
      })
    );

  },
  deactivate () { }
};
