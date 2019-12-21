# [vscode-ext-cursor-tools](https://github.com/naumovs/vscode-ext-cursor-tools)

With this extension you can leave anchors in the document at cursor position and later on activate create multiple cursors out of all anchors in the current editor.

Also it has a feature of sub-word navigation.

## Config

```json
"cursor-tools.border": {
    "style": "solid",
    "width": "1px",
    "color": "" // if not set, will use 'editorCursor.foreground
}
```

## Usage

Keybinds:

- ctrl+alt+down - toggle anchor at current place
- ctrl+alt+up - create cursors at anchor positions
- escape - Remove all anchors in current document

## Contribution

Feel free to contribute!
Have ideas? Create issues at the github repo
