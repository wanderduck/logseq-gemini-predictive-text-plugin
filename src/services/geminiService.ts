import { GoogleGenerativeAI } from "@google/generative-ai";
import '@logseq/libs';

export class GeminiService {
  private genAI: GoogleGenerativeAI | null = null;
  private apiKey: string = '';

  constructor() {
    // Initial configuration sync
    setTimeout(() => this.updateConfig(), 1000); // give time for logseq.settings to populate

    // Listen for settings changes
    logseq.onSettingsChanged(() => {
      this.updateConfig();
    });
  }

  public updateConfig() {
    if (!logseq.settings) return;
    
    this.apiKey = (logseq.settings.apiKey as string) || '';
    
    if (this.apiKey) {
      this.genAI = new GoogleGenerativeAI(this.apiKey);
    } else {
      this.genAI = null;
    }
  }

  public hasValidCredentials(): boolean {
    return !!this.apiKey;
  }

  public async generatePredictions(
    localContext: string,
    globalContext: string,
    memoryContext: string,
    currentBlockContent: string,
    suggestionCount: number = 3
  ): Promise<string[]> {
    const modelName = logseq.settings?.modelName || 'gemini-3.6-flash';
    const prompt = `You are a predictive text AI in Logseq.
Based on the following context, provide ${suggestionCount} short, natural, inline completions for the current text.
Use the User Memory Examples to match their tone, vocabulary, and style.
Provide ONLY the predicted continuation text, separated by "|||". Do not repeat the current text.

User Memory Examples:
${memoryContext}

Global Knowledge Context:
${globalContext}

Current Page Context:
${localContext}

Current Text:
${currentBlockContent}`;

    try {
      if (this.genAI) {
        const model = this.genAI.getGenerativeModel({ model: modelName as string });
        const result = await model.generateContent(prompt);
        const text = result.response.text();
        return this.parsePredictions(text);
      } else {
        throw new Error("Missing API Key. Please check plugin settings.");
      }
    } catch (error: any) {
      console.error("Gemini API Error:", error);
      logseq.UI.showMsg(`Prediction failed: ${error.message || "Check console for details."}`, "error");
      return [];
    }
  }

  private parsePredictions(rawText: string): string[] {
    return rawText.split("|||").map(p => p.trim()).filter(p => p.length > 0);
  }
}

export const geminiService = new GeminiService();
