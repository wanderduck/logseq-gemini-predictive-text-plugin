# Logseq Gemini Predictive Text Plugin

A powerful, context-aware AI predictive text plugin for [Logseq](https://logseq.com/), powered by the Google Gemini API. As you type in Logseq, this plugin analyzes your current page (and optionally, your entire knowledge graph) to offer intelligent, inline autocomplete suggestions that adapt to your unique writing style.

## Features

- **Context-Aware Predictions**: Analyzes your current page's blocks to offer highly relevant completions for your thoughts.
- **Global Graph Context**: Optional setting to query your entire Logseq database for context when the AI needs more information.
- **Adaptive Memory**: Learns your writing style, vocabulary, and tone. Whenever you accept a suggestion, the plugin remembers it to improve future predictions via few-shot prompting.
- **Flexible Trigger Modes**: 
  - **Automatic (Pause)**: Suggests completions automatically whenever you pause typing for 1 second.
  - **Manual Trigger**: Suggests completions only when you press a custom hotkey.
- **Keyboard-Driven Workflow**: Seamlessly navigate and accept suggestions without taking your hands off the keyboard.

---

## Installation

### Option 1: Load Unpacked (Development / Manual Install)
1. Download or clone this repository to your local machine.
2. In your terminal, run `npm install` followed by `npm run build` to build the plugin.
3. Open Logseq.
4. Go to `Settings` > `Advanced` and ensure **Developer mode** is toggled on.
5. Open the **Plugins** menu (jigsaw puzzle icon in the top toolbar).
6. Click **Load unpacked plugin** and select the folder containing this plugin.

---

## Configuration & Settings

Before using the plugin, you must configure it in the plugin settings menu. Navigate to the Logseq Plugins page, find this plugin, and click the gear icon to access the settings.

* **Gemini API Key (Required)**: Enter your API Key from [Google AI Studio](https://aistudio.google.com/). The plugin will not function without this.
* **Trigger Mode**: 
  * `Automatic (Pause)`: The plugin will fetch predictions automatically after a 1-second pause in typing.
  * `Manual Trigger`: The plugin will only fetch predictions when you press the hotkey.
* **Manual Trigger Hotkey**: If using Manual Trigger, choose the shortcut (e.g., `CTRL+Space` or `ALT+Space`).
* **Model Selection**: Choose which Gemini model to use. Defaults to `gemini-3.6-flash` (recommended for speed and cost-efficiency).
* **Query Entire Database**: If enabled, the plugin will perform a global search across your entire Logseq graph to gather broader context. Note: this may slightly slow down prediction times.

---

## Usage

When the plugin is triggered (either automatically or manually), a tooltip will appear below your cursor containing multiple predictive text suggestions.

### Navigating Suggestions
While the tooltip is visible, you can use the following keyboard controls:
- **ArrowDown / ArrowUp**: Navigate through the list of suggestions.
- **Enter** or **Tab**: Accept the currently highlighted suggestion and insert it into your block.
- **Number Keys (1-9)**: Instantly accept a specific suggestion by pressing its corresponding number on your keyboard.
- **ESC**: Dismiss the tooltip and reject all suggestions.

> **Note**: If you simply want to type a number into your editor while the tooltip is open, press `ESC` first to dismiss the suggestions box, then type the number.
