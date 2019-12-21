'use strict'

const vscode = require('vscode')
const onCommandToggleAnchor = require('./lib/anchor-commands').onCommandToggleAnchor
const onCommandActivateCursors = require('./lib/anchor-commands').onCommandActivateCursors
const onCommandCleanAnchors = require('./lib/anchor-commands').onCommandCleanAnchors
const onDidChangeTextDocument = require('./lib/anchor-commands').onDidChangeTextDocument

module.exports = {
    activate(context) {

        context.subscriptions.push(
            vscode.commands.registerTextEditorCommand('cursorToolsAnchorAdd', onCommandToggleAnchor),
            vscode.commands.registerTextEditorCommand('cursorToolsAnchorActivate', onCommandActivateCursors),
            vscode.commands.registerTextEditorCommand('cursorToolsAnchorClean', onCommandCleanAnchors)
        )

        vscode.window.onDidChangeActiveTextEditor(onTextEditorChange, null, context.subscriptions)
        vscode.workspace.onDidChangeTextDocument(onDidChangeTextDocument, null, context.subscriptions)

        if (vscode.window.activeTextEditor) {
            onTextEditorChange(vscode.window.activeTextEditor)
        }
    },
    deactivate() { }
}

function onTextEditorChange(textEditor) {
    if (textEditor) {
        textEditor.cursorAnchors = textEditor.cursorAnchors || []
    }
}
