import { GoogleGenerativeAI } from "@google/generative-ai";
import '@logseq/libs';

export class GeminiService {
  private genAI: GoogleGenerativeAI | null = null;
  private apiKey: string = '';
  private authMode: string = 'OAuth (Subscription)';
  private oauthToken: string = '';

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
    
    this.authMode = (logseq.settings.authMode as string) || 'OAuth (Subscription)';
    this.apiKey = (logseq.settings.apiKey as string) || '';
    
    if (this.authMode === 'API Key' && this.apiKey) {
      this.genAI = new GoogleGenerativeAI(this.apiKey);
    } else {
      this.genAI = null; // Use REST with OAuth token
    }
  }

  public setOAuthToken(token: string) {
    this.oauthToken = token;
  }

  public getAuthMode() {
    return this.authMode;
  }

  public hasValidCredentials(): boolean {
    if (this.authMode === 'API Key') return !!this.apiKey;
    return !!this.oauthToken;
  }

  public async generatePredictions(
    localContext: string,
    globalContext: string,
    memoryContext: string,
    currentBlockContent: string,
    suggestionCount: number = 3
  ): Promise<string[]> {
    const modelName = logseq.settings?.modelName || 'gemini-1.5-flash';
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
      if (this.authMode === 'API Key' && this.genAI) {
        const model = this.genAI.getGenerativeModel({ model: modelName as string });
        const result = await model.generateContent(prompt);
        const text = result.response.text();
        return this.parsePredictions(text);
      } else if (this.authMode === 'OAuth (Subscription)' && this.oauthToken) {
        // Fallback to REST API using OAuth Bearer Token
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${this.oauthToken}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            contents: [{ parts: [{ text: prompt }] }]
          })
        });
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        const text = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
        return this.parsePredictions(text);
      } else {
        throw new Error("Missing API Key or OAuth Token. Please check plugin settings.");
      }
    } catch (error) {
      console.error("Gemini API Error:", error);
      logseq.UI.showMsg("Failed to generate prediction. Check console for details.", "error");
      return [];
    }
  }

  private parsePredictions(rawText: string): string[] {
    return rawText.split("|||").map(p => p.trim()).filter(p => p.length > 0);
  }
}

export const geminiService = new GeminiService();
