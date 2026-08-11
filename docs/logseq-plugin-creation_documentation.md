# Logseq Plugin Creation Documentation

## 1. Plugin Structure & Manifest Requirements
Logseq plugins run within a client-side, sandboxed iframe architecture that communicates with Logseq's Electron/web host application via an asynchronous JSON-RPC messaging interface exposed through the `@logseq/libs` SDK. 

### A. Manifest (`package.json`)
The `package.json` must contain a dedicated `logseq` metadata block alongside standard NPM metadata.
```json
{
  "name": "logseq-gemini-predictive-text",
  "version": "0.1.0",
  "main": "dist/index.html",
  "logseq": {
    "id": "logseq-gemini-predictive-text",
    "title": "Gemini Predictive Text",
    "icon": "./icon.png"
  },
  "dependencies": {
    "@logseq/libs": "^0.0.15"
  }
}
```

### B. Initialization Entry Point: `logseq.ready()`
All plugin logic must be executed inside or after the `logseq.ready()` promise resolves. This ensures the host-to-iframe communication bridge is established.
```typescript
import "@logseq/libs";
async function main() {
  console.log("Plugin initialized successfully!");
}
logseq.ready(main).catch(console.error);
```

## 2. Core API Namespaces (`@logseq/libs`)

### A. `logseq.App` (Application Context & Events)
- `logseq.App.showMsg(content, status)`: Displays native toast notifications.
- `logseq.App.registerUIItem(type, options)`: Registers custom UI icons/buttons in UI slots (e.g., toolbar).
- `logseq.App.registerCommandPalette(options, action)`: Registers `Cmd+K` commands.

### B. `logseq.Editor` (Document & Block Operations)
- `logseq.Editor.getCurrentBlock()`: Retrieves the currently focused `BlockEntity`.
- `logseq.Editor.getEditingBlockContent()`: Gets the active text string inside the currently focused editor block.
- `logseq.Editor.getEditingCursorPosition()`: Returns `{ pos, left, top, rect }` of the text cursor, crucial for aligning ghost text.
- `logseq.Editor.insertAtEditingCursor(text)`: Inserts accepted predictive suggestion directly at the cursor.
- `logseq.Editor.getBlock(uuid, opts)`: Retrieves specific blocks, useful for pulling contextual history.
- `logseq.Editor.getPageBlocksTree(pageName)`: Returns full tree of blocks for the active page, useful for broader RAG context.

### C. Settings API (`logseq.useSettingsSchema`)
Plugins can dynamically auto-generate a configuration settings page within Logseq. This is perfect for storing API keys, models, and toggles.
```typescript
logseq.useSettingsSchema([
  {
    key: "apiKey",
    type: "string",
    title: "Gemini API Key",
    description: "Enter your Google Gemini API key",
    default: ""
  },
  {
    key: "modelName",
    type: "enum",
    enumChoices: ["gemini-1.5-flash", "gemini-1.5-pro"],
    title: "Model Selection",
    default: "gemini-1.5-flash"
  }
]);
```
Settings can be accessed reactively via `logseq.settings?.apiKey`.

## 3. Implementation Strategy for Predictive Text

### A. Typing Detection (Event Interception)
Logseq plugins run inside an isolated `<iframe>`. However, they can access `parent.document` to attach capturing-phase event listeners to Logseq's main application window. This is the **recommended approach for real-time typing detection**:

```typescript
// Attach input listener to trigger completions
parent.document.addEventListener('input', debounce(async (e: Event) => {
  const target = e.target as HTMLTextAreaElement;
  if (target && target.classList.contains('editor-has-focus')) {
    // Trigger predictive completion request here
  }
}, 300));

// Attach keydown listener to intercept Tab/Escape keys
parent.document.addEventListener('keydown', (e: KeyboardEvent) => {
  const target = e.target as HTMLElement;
  if (target && target.classList.contains('editor-has-focus')) {
    if (e.key === 'Tab' && isPredictionVisible) {
      e.preventDefault();
      e.stopPropagation();
      acceptPrediction();
    }
    if (e.key === 'Escape' && isPredictionVisible) {
      dismissPrediction();
    }
  }
}, true); // Capturing phase
```

### B. UI Overlay (Ghost Text)
Using `getEditingCursorPosition()`, the plugin can retrieve the exact pixel coordinates of the cursor (`cursor.rect`, `cursor.top`, `cursor.left`). 
With this data, we can use `logseq.provideUI()` or `logseq.setMainUIInlineStyle()` to position a ghost text overlay immediately adjacent to the cursor.

### C. End-to-End Workflow
1. User types in a block; `parent.document` `input` event listener fires.
2. Plugin fetches `logseq.Editor.getCurrentBlock()`, `getEditingBlockContent()`, and context (previous blocks).
3. The context and current text are sent to the Gemini API (via HTTP request or SDK).
4. The response is rendered as ghost text placed at the coordinates returned by `getEditingCursorPosition()`.
5. User presses `Tab`; the `keydown` listener intercepts it and calls `logseq.Editor.insertAtEditingCursor(predictedText)`. The UI overlay is hidden.
