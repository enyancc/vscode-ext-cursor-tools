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
	const leaveAnchorCommand = __webpack_require__(3).leaveAnchorCommand;
	const activateAnchorCommand = __webpack_require__(3).activateAnchorCommand;

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


/***/ },
/* 1 */
/***/ function(module, exports) {

	module.exports = require("vscode");

/***/ },
/* 2 */,
/* 3 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	const vscode = __webpack_require__(1);
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


/***/ }
/******/ ]);