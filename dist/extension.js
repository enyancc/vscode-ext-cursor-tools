module.exports =
/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};

/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {

/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId])
/******/ 			return installedModules[moduleId].exports;

/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			exports: {},
/******/ 			id: moduleId,
/******/ 			loaded: false
/******/ 		};

/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);

/******/ 		// Flag the module as loaded
/******/ 		module.loaded = true;

/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}


/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;

/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;

/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";

/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(0);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	const vscode = __webpack_require__(1);
	const onCommandToggleAnchor = __webpack_require__(2).onCommandToggleAnchor;
	const onCommandActivateCursors = __webpack_require__(2).onCommandActivateCursors;
	const onCommandCleanAnchors = __webpack_require__(2).onCommandCleanAnchors;
	const onDidChangeTextDocument = __webpack_require__(2).onDidChangeTextDocument;

	module.exports = {
	  activate (context) {
	    context.subscriptions.push(
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


/***/ },
/* 1 */
/***/ function(module, exports) {

	module.exports = require("vscode");

/***/ },
/* 2 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	const vscode = __webpack_require__(1);
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


/***/ }
/******/ ]);