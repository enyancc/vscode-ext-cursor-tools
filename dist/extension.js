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
const decor = vscode.window.createTextEditorDecorationType({
  borderStyle: 'solid',
  borderWidth: '1px',
  borderColor: 'rgba(255, 255, 255, 0.3)',
  light: {
    borderColor: 'rgba(0, 0, 0, 0.3)'
  }
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
const camelCaseNav = __webpack_require__(3);

module.exports = {
  activate(context) {

    const config = vscode.workspace.getConfiguration('cursor-tools');

    context.subscriptions.push(vscode.commands.registerTextEditorCommand('cursorToolsAnchorLeave', onCommandToggleAnchor), vscode.commands.registerTextEditorCommand('cursorToolsAnchorActivate', onCommandActivateCursors), vscode.commands.registerTextEditorCommand('cursorToolsAnchorClean', onCommandCleanAnchors));

    if (config.subWordNavigation) {
      const navigator = new camelCaseNav.CamelCaseNav();

      context.subscriptions.push(vscode.commands.registerTextEditorCommand('cursorWordStartLeft', editor => navigator.doAction(editor, null, camelCaseNav.DIRECTION_LEFT, camelCaseNav.ACTION_MOVE)), vscode.commands.registerTextEditorCommand('cursorWordEndRight', editor => navigator.doAction(editor, null, camelCaseNav.DIRECTION_RIGHT, camelCaseNav.ACTION_MOVE)), vscode.commands.registerTextEditorCommand('cursorWordStartLeftSelect', editor => navigator.doAction(editor, null, camelCaseNav.DIRECTION_LEFT, camelCaseNav.ACTION_SELECT)), vscode.commands.registerTextEditorCommand('cursorWordEndRightSelect', editor => navigator.doAction(editor, null, camelCaseNav.DIRECTION_RIGHT, camelCaseNav.ACTION_SELECT)), vscode.commands.registerTextEditorCommand('deleteWordLeft', (editor, change) => navigator.doAction(editor, change, camelCaseNav.DIRECTION_LEFT, camelCaseNav.ACTION_DELETE)), vscode.commands.registerTextEditorCommand('deleteWordRight', (editor, change) => navigator.doAction(editor, change, camelCaseNav.DIRECTION_RIGHT, camelCaseNav.ACTION_DELETE)));
    }

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

/***/ }),
/* 3 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
Object.defineProperty(__webpack_exports__, "__esModule", { value: true });
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0_vscode__ = __webpack_require__(1);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0_vscode___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_0_vscode__);


const DIRECTION_RIGHT = 1;
/* harmony export (immutable) */ __webpack_exports__["DIRECTION_RIGHT"] = DIRECTION_RIGHT;

const DIRECTION_LEFT = -1;
/* harmony export (immutable) */ __webpack_exports__["DIRECTION_LEFT"] = DIRECTION_LEFT;

const ACTION_MOVE = 1;
/* harmony export (immutable) */ __webpack_exports__["ACTION_MOVE"] = ACTION_MOVE;

const ACTION_SELECT = 2;
/* harmony export (immutable) */ __webpack_exports__["ACTION_SELECT"] = ACTION_SELECT;

const ACTION_DELETE = 3;
/* harmony export (immutable) */ __webpack_exports__["ACTION_DELETE"] = ACTION_DELETE;


const MODE_BOUNDARY = 1;
/* harmony export (immutable) */ __webpack_exports__["MODE_BOUNDARY"] = MODE_BOUNDARY;

const MODE_SPAAAACE = 2;
/* harmony export (immutable) */ __webpack_exports__["MODE_SPAAAACE"] = MODE_SPAAAACE;

const MODE_NEUTRAL = 3;
/* harmony export (immutable) */ __webpack_exports__["MODE_NEUTRAL"] = MODE_NEUTRAL;

const MODE_LOWER = 4;
/* harmony export (immutable) */ __webpack_exports__["MODE_LOWER"] = MODE_LOWER;

const MODE_UPPER = 5;
/* harmony export (immutable) */ __webpack_exports__["MODE_UPPER"] = MODE_UPPER;


class CamelCaseNav {

  constructor(config) {
    this.config = config || {
      stopAtNewLine: true,
      stopSymbols: '\'"`\n',
      boundarySymbols: '^`~!@#%^&*()-\\=+[]{}|;:",.<>/?]+_\'',
      spaceAsBoundary: false
    };
  }

  doAction(editor, edit, dir, action) {
    if (!editor) {
      return;
    }

    const document = editor.document,
          selections = editor.selections;

    const results = [];

    for (let i = 0, len = selections.length; i < len; i++) {
      results.push(this.singleCursorAction(document, edit, selections[i], dir, action));
    }

    editor.selections = results;

    editor.revealRange(results[0].with(results[0].active, results[0].active));
  }

  singleCursorAction(document, edit, selection, dir, action) {
    const nextPos = this.findNextPos(document, selection, selection.active, dir);

    if (nextPos.compareTo(selection.active) === 0) {
      return selection;
    }
    if (action === ACTION_MOVE) {
      return new __WEBPACK_IMPORTED_MODULE_0_vscode___default.a.Selection(nextPos, nextPos);
    }

    if (action === ACTION_SELECT) {
      return new __WEBPACK_IMPORTED_MODULE_0_vscode___default.a.Selection(selection.anchor, nextPos);
    }
    if (action === ACTION_DELETE) {
      const deleteRange = new __WEBPACK_IMPORTED_MODULE_0_vscode___default.a.Selection(selection.anchor, nextPos);

      edit.delete(deleteRange);

      return selection;
    }
  }

  findNextPos(document, selection, pos, dir) {
    const text = document.getText();

    let cursor = document.offsetAt(pos);
    let modCache = {};
    let steps = 0;

    while (true) {
      const charOffset = dir === DIRECTION_LEFT ? cursor - 1 : cursor;

      if (charOffset >= text.length) {
        return document.positionAt(text.length);
      }

      if (charOffset < 0) {
        return document.positionAt(0);
      }

      const char = text[charOffset];
      const decision = this.makeDecision(text, charOffset, dir, steps, modCache);

      if (decision !== null) {
        return document.positionAt(decision);
      }

      steps++;
      cursor = cursor + dir;
    }
  }

  modeForChar(ch) {
    if (typeof ch === 'undefined' || ch === null) {
      return 0;
    }

    if (this.config.boundarySymbols.indexOf(ch) > -1) {
      return MODE_BOUNDARY;
    }

    if (/\s/.test(ch)) {
      if (this.config.spaceAsBoundary) {
        return MODE_BOUNDARY;
      } else {
        return MODE_SPAAAACE;
      }
    }

    const lower = ch.toLowerCase();

    if (lower === ch.toUpperCase()) {
      return MODE_NEUTRAL;
    }
    if (lower === ch) {
      return MODE_LOWER;
    }
    return MODE_UPPER;
  }

  modeFor(text, offset, cache) {
    if (!cache[offset]) {
      const ch = text[offset];

      cache[offset] = this.modeForChar(text[offset]);
    }

    return cache[offset];
  }

  makeDecision(text, offset, dir, steps, modCache) {
    const inclusive = dir === DIRECTION_LEFT ? offset - 1 : offset + 2;
    const exclusive = dir === DIRECTION_LEFT ? offset : offset + 1;

    const mode = this.modeFor(text, offset, modCache);
    const nextMode = this.modeFor(text, offset + dir, modCache);

    // when going left, always stop at the new line, but only once
    if (dir === DIRECTION_LEFT && text[inclusive] === '\n') {
      const startSymbol = inclusive - dir * steps;

      if (text[startSymbol] !== '\n') {
        return exclusive;
      }
    }
    // if (this.config.stopSymbols.indexOf(ch) > -1) {
    //   if (prevMode === null) {
    //     return { mode: mode };
    //   }

    //   if (this.config.stopAtNewLine && ch === '\n') {
    //     return { stopAt: exclusive };
    //   }
    // }

    if (mode === nextMode) {
      return null;
    }

    if (mode === MODE_SPAAAACE) {
      // if (steps === 0 && text[exclusive] !== '\n') {
      // return null;
      // }

      if (text[offset] === '\n') {
        return exclusive;
      }

      const prevMode = this.modeFor(text, offset - dir, modCache);

      if (prevMode === MODE_SPAAAACE) {
        return exclusive;
      }
    } else if (mode === MODE_BOUNDARY) {
      if (steps === 0 && nextMode !== MODE_SPAAAACE) {
        return null;
      }

      return exclusive;
    } else if (mode === MODE_LOWER) {
      if (nextMode == MODE_UPPER) {
        return dir === DIRECTION_LEFT ? inclusive : exclusive;
      }
      if (nextMode == MODE_SPAAAACE || nextMode == MODE_BOUNDARY || nextMode == MODE_NEUTRAL) {
        return exclusive;
      }
    } else if (mode === MODE_UPPER) {
      if (nextMode == MODE_SPAAAACE || nextMode == MODE_BOUNDARY || nextMode == MODE_NEUTRAL) {
        return exclusive;
      }

      if (dir === DIRECTION_LEFT && nextMode == MODE_LOWER) {
        return exclusive;
      }
    } else if (mode === MODE_NEUTRAL) {
      return exclusive;
    }

    return null;
  }

}
/* harmony export (immutable) */ __webpack_exports__["CamelCaseNav"] = CamelCaseNav;


/***/ })
/******/ ]);
//# sourceMappingURL=extension.js.map