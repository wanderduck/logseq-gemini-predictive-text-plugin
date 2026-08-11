import '@logseq/libs';
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import type { SettingSchemaDesc } from '@logseq/libs/dist/LSPlugin.user';

const settingsSchema: SettingSchemaDesc[] = [
  {
    key: "apiKey",
    type: "string",
    title: "Gemini API Key",
    description: "Enter your Gemini API key from Google AI Studio. (Required)",
    default: "",
  },
  {
    key: "triggerMode",
    type: "enum",
    enumChoices: ["Automatic (Pause)", "Manual Trigger"],
    title: "Trigger Mode",
    description: "Choose how predictive text is triggered. 'Automatic' triggers when you pause typing. 'Manual' requires pressing a hotkey.",
    default: "Automatic (Pause)",
  },
  {
    key: "hotkey",
    type: "enum",
    enumChoices: ["CTRL+Space", "ALT+Space"],
    title: "Manual Trigger Hotkey",
    description: "If using Manual Trigger mode, choose the hotkey to activate predictions.",
    default: "CTRL+Space",
  },
  {
    key: "modelName",
    type: "enum",
    enumChoices: ["gemini-3.6-flash", "gemini-3.5-flash", "gemini-3.1-flash", "gemini-3.1-pro"],
    title: "Model Selection",
    description: "Select the Gemini model to use for predictions.",
    default: "gemini-3.6-flash",
  },
  {
    key: "queryEntireDb",
    type: "boolean",
    title: "Query Entire Database",
    description: "If enabled, gathers context from your entire graph (up to a safe token limit) to help the AI predict when uncertain. Can slow down predictions slightly.",
    default: false,
  }
];

function main() {
  logseq.useSettingsSchema(settingsSchema);
  
  createRoot(document.getElementById('root')!).render(
    <StrictMode>
      <App />
    </StrictMode>,
  );
}

logseq.ready(main).catch(console.error);
