import { useState, useEffect, useRef } from 'react';
import { geminiService } from '../services/geminiService';
import { memoryService } from '../services/memoryService';

export function usePredictiveText() {
  const [position, setPosition] = useState<{ left: number; top: number; rect?: DOMRect } | null>(null);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const clearSuggestions = () => {
    setPosition(null);
    setSuggestions([]);
    setIsLoading(false);
  };

  const triggerPrediction = async () => {
    const isEditing = await logseq.Editor.checkEditing();
    if (!isEditing) return;

    // Get Cursor Position
    const pos = await logseq.Editor.getEditingCursorPosition();
    if (!pos) return;
    setPosition(pos);
    setIsLoading(true);

    try {
      const block = await logseq.Editor.getCurrentBlock();
      if (!block) throw new Error("No block context");

      // 1. Get Local Page Context
      const pageBlocks = await logseq.Editor.getCurrentPageBlocksTree();
      const extractText = (blocks: any[]): string => {
        let text = "";
        for (const b of blocks) {
          if (b.content) text += b.content + "\n";
          if (b.children) text += extractText(b.children);
        }
        return text;
      };
      const localContext = pageBlocks ? extractText(pageBlocks).substring(0, 3000) : "";

      // 2. Get Memory Context (Few-shot examples)
      const memoryContext = await memoryService.getMemoryContext();

      // 3. Get Global Context (if enabled)
      let globalContext = "";
      if (logseq.settings?.queryEntireDb) {
        try {
          const allBlocks = await logseq.DB.datascriptQuery(`
            [:find (pull ?b [:block/content])
             :where
             [?b :block/content ?c]
             [(not= ?c "")]
            ]
          `);
          if (allBlocks && allBlocks.length > 0) {
            const blocksText = allBlocks.map((b: any) => b[0]?.content).filter(Boolean);
            globalContext = blocksText.slice(-500).join("\n").substring(0, 15000);
          }
        } catch (dbError) {
          console.warn("Global DB query failed:", dbError);
        }
      }

      // Generate Predictions
      const preds = await geminiService.generatePredictions(
        localContext,
        globalContext,
        memoryContext,
        block.content
      );
      
      setSuggestions(preds);
    } catch (e) {
      console.error(e);
      clearSuggestions();
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const handleKeyDown = async (e: KeyboardEvent) => {
      // If suggestions are showing, we intercept keys
      if (position) {
        if (e.key === 'Escape') {
          clearSuggestions();
          e.preventDefault();
          e.stopPropagation();
          return;
        }
        if (e.key === 'Tab' && suggestions.length > 0) {
          // Accept first suggestion
          const acceptedText = suggestions[0];
          await logseq.Editor.insertAtEditingCursor(acceptedText);
          await memoryService.saveAccepted(acceptedText); // Save to Memory
          clearSuggestions();
          e.preventDefault();
          e.stopPropagation();
          return;
        }
        if (['1','2','3'].includes(e.key) && e.ctrlKey && suggestions.length >= parseInt(e.key)) {
          // Accept specific suggestion via Ctrl+1/2/3
          const acceptedText = suggestions[parseInt(e.key) - 1];
          await logseq.Editor.insertAtEditingCursor(acceptedText);
          await memoryService.saveAccepted(acceptedText); // Save to Memory
          clearSuggestions();
          e.preventDefault();
          e.stopPropagation();
          return;
        }
      }

      // Check Trigger Mode
      const triggerMode = logseq.settings?.triggerMode || 'Automatic (Pause)';
      const hotkey = logseq.settings?.hotkey || 'CTRL+Space';

      if (triggerMode === 'Manual Trigger') {
        const isCtrlSpace = hotkey === 'CTRL+Space' && e.ctrlKey && e.code === 'Space';
        const isAltSpace = hotkey === 'ALT+Space' && e.altKey && e.code === 'Space';
        if (isCtrlSpace || isAltSpace) {
          e.preventDefault();
          triggerPrediction();
        }
      } else {
        // Automatic Mode
        if (e.target && (e.target as HTMLElement).tagName === 'TEXTAREA') {
          if (timerRef.current) clearTimeout(timerRef.current);
          
          if (e.key.length === 1 || e.key === 'Backspace') {
            timerRef.current = setTimeout(() => {
              triggerPrediction();
            }, 1000); // 1s pause
          } else if (!e.shiftKey && !e.ctrlKey && !e.altKey) {
            clearSuggestions(); 
          }
        }
      }
    };

    const parentDoc = parent.document;
    parentDoc.addEventListener('keydown', handleKeyDown, { capture: true });

    return () => {
      parentDoc.removeEventListener('keydown', handleKeyDown, { capture: true });
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [position, suggestions]);

  return {
    position,
    suggestions,
    isLoading,
    clearSuggestions,
    acceptSuggestion: async (text: string) => {
      await logseq.Editor.insertAtEditingCursor(text);
      await memoryService.saveAccepted(text); // Save to Memory
      clearSuggestions();
    }
  };
}
