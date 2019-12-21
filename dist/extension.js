module.exports =
/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId]) {
/******/ 			return installedModules[moduleId].exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			i: moduleId,
/******/ 			l: false,
/******/ 			exports: {}
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.l = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// define getter function for harmony exports
/******/ 	__webpack_require__.d = function(exports, name, getter) {
/******/ 		if(!__webpack_require__.o(exports, name)) {
/******/ 			Object.defineProperty(exports, name, {
/******/ 				configurable: false,
/******/ 				enumerable: true,
/******/ 				get: getter
/******/ 			});
/******/ 		}
/******/ 	};
/******/
/******/ 	// getDefaultExport function for compatibility with non-harmony modules
/******/ 	__webpack_require__.n = function(module) {
/******/ 		var getter = module && module.__esModule ?
/******/ 			function getDefault() { return module['default']; } :
/******/ 			function getModuleExports() { return module; };
/******/ 		__webpack_require__.d(getter, 'a', getter);
/******/ 		return getter;
/******/ 	};
/******/
/******/ 	// Object.prototype.hasOwnProperty.call
/******/ 	__webpack_require__.o = function(object, property) { return Object.prototype.hasOwnProperty.call(object, property); };
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(__webpack_require__.s = 2);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


const vscode = __webpack_require__(1);
const config = vscode.workspace.getConfiguration('cursor-tools');
const decor = vscode.window.createTextEditorDecorationType({
    borderStyle: config.border.style,
    borderWidth: config.border.width,
    borderColor: config.border.color || new vscode.ThemeColor("editorCursor.foreground")
});

module.exports = {
    onCommandToggleAnchor,
    onCommandActivateCursors,
    onCommandCleanAnchors,
    onDidChangeTextDocument
};

function onCommandToggleAnchor(textEditor, textEditorEdit) {
    const currentDocumentOffset = textEditor.document.offsetAt(textEditor.selection.active);
    const index = isAnchorExist(textEditor, currentDocumentOffset);

    if (index === -1) {
        textEditor.cursorAnchors.push(currentDocumentOffset);
    } else {
        textEditor.cursorAnchors.splice(index, 1);
    }

    setContext(textEditor.cursorAnchors.length > 0);

    updateDecorations(textEditor);
}

function onCommandActivateCursors(textEditor, textEditorEdit) {
    const currentDocumentOffset = textEditor.document.offsetAt(textEditor.selection.active);

    textEditor.selections = [currentDocumentOffset].concat(textEditor.cursorAnchors).map(createSelection.bind(textEditor));

    onCommandCleanAnchors(textEditor, textEditorEdit);
}

function onCommandCleanAnchors(textEditor, textEditorEdit) {
    textEditor.cursorAnchors = [];

    setContext(false);

    updateDecorations(textEditor);
}

function onDidChangeTextDocument(textDocumentChangeEvent) {
    const textEditor = vscode.window.activeTextEditor;
    if (!textDocumentChangeEvent) {
        return;
    }

    const textDocument = textDocumentChangeEvent.document;

    if (textEditor.document !== textDocument) {
        return;
    }

    const filters = textDocumentChangeEvent.contentChanges.map(contentChange => {
        const offsetStart = textDocument.offsetAt(contentChange.range.start);
        const offsetEnd = textDocument.offsetAt(contentChange.range.end);

        return offset => !(offset >= offsetStart && offset <= offsetEnd);
    });

    textEditor.cursorAnchors = filters.reduce((acc, fn) => acc.filter(fn), textEditor.cursorAnchors).map(offset => {
        return textDocumentChangeEvent.contentChanges.reduce((acc, contentChange) => {
            if (textDocument.offsetAt(contentChange.range.start) <= offset) {
                return acc - contentChange.rangeLength + contentChange.text.length;
            }

            return acc;
        }, offset);
    });

    updateDecorations(textEditor);
}

function updateDecorations(textEditor) {
    const decorRange = textEditor.cursorAnchors.map(createRange.bind(textEditor));

    textEditor.setDecorations(decor, decorRange);
}

function isAnchorExist(textEditor, currentDocumentOffset) {
    return textEditor.cursorAnchors.indexOf(currentDocumentOffset);
}

function createSelection(offset) {
    const position = this.document.positionAt(offset);

    return new vscode.Selection(position, position);
}

function createRange(offset) {
    const position = this.document.positionAt(offset);

    return new vscode.Range(position, position);
}

function setContext(value) {
    vscode.commands.executeCommand('setContext', 'cursorToolsAnchors', value);
}

/***/ }),
/* 1 */
/***/ (function(module, exports) {

module.exports = require("vscode");

/***/ }),
/* 2 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


const vscode = __webpack_require__(1);
const onCommandToggleAnchor = __webpack_require__(0).onCommandToggleAnchor;
const onCommandActivateCursors = __webpack_require__(0).onCommandActivateCursors;
const onCommandCleanAnchors = __webpack_require__(0).onCommandCleanAnchors;
const onDidChangeTextDocument = __webpack_require__(0).onDidChangeTextDocument;

module.exports = {
    activate(context) {

        context.subscriptions.push(vscode.commands.registerTextEditorCommand('cursorToolsAnchorAdd', onCommandToggleAnchor), vscode.commands.registerTextEditorCommand('cursorToolsAnchorActivate', onCommandActivateCursors), vscode.commands.registerTextEditorCommand('cursorToolsAnchorClean', onCommandCleanAnchors));

        vscode.window.onDidChangeActiveTextEditor(onTextEditorChange, null, context.subscriptions);
        vscode.workspace.onDidChangeTextDocument(onDidChangeTextDocument, null, context.subscriptions);

        if (vscode.window.activeTextEditor) {
            onTextEditorChange(vscode.window.activeTextEditor);
        }
    },
    deactivate() {}
};

function onTextEditorChange(textEditor) {
    if (textEditor) {
        textEditor.cursorAnchors = textEditor.cursorAnchors || [];
    }
}

/***/ })
/******/ ]);
//# sourceMappingURL=extension.js.map