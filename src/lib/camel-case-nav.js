import vscode from 'vscode';

export const DIRECTION_RIGHT = 1;
export const DIRECTION_LEFT = -1;
export const ACTION_MOVE = 1;
export const ACTION_SELECT = 2;
export const ACTION_DELETE = 3;

export const MODE_BOUNDARY = 1;
export const MODE_SPAAAACE = 2;
export const MODE_NEUTRAL = 3;
export const MODE_LOWER = 4;
export const MODE_UPPER = 5;

export class CamelCaseNav {

  constructor(config) {
    this.config = config || {
      stopAtNewLine: true,
      stopSymbols: '\'"`\n',
      boundarySymbols: '^`~!@#%^&*()-\\=+[]{}|;:",.<>/?]+_\'',
      spaceAsBoundary: false
    }
  }

  doAction(editor, edit, dir, action) {
    if (!editor) {
      return;
    }

    const { document, selections } = editor;
    const results = [];

    for (let i = 0, len = selections.length; i < len; i++) {
      results.push(this.singleCursorAction(document, edit, selections[i], dir, action))
    }

    editor.selections = results;

    editor.revealRange(results[0].with(results[0].active, results[0].active))
  }

  singleCursorAction(document, edit, selection, dir, action) {
    const nextPos = this.findNextPos(document, selection, selection.active, dir);

    if (nextPos.compareTo(selection.active) === 0) {
      return selection;
    }
    if (action === ACTION_MOVE) {
      return new vscode.Selection(nextPos, nextPos);
    }

    if (action === ACTION_SELECT) {
      return new vscode.Selection(selection.anchor, nextPos);
    }
    if (action === ACTION_DELETE) {
      const deleteRange = new vscode.Selection(selection.anchor, nextPos);

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
      const startSymbol = inclusive - (dir * steps);

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

