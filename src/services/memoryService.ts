import '@logseq/libs';

const MEMORY_PAGE_NAME = 'gemini-predictive-text-memory';

export class MemoryService {
  private async ensureMemoryPage() {
    let page = await logseq.Editor.getPage(MEMORY_PAGE_NAME);
    if (!page) {
      page = await logseq.Editor.createPage(
        MEMORY_PAGE_NAME,
        { tags: 'hidden' },
        { createFirstBlock: true, redirect: false }
      );
      if (page) {
        // Initialize structure
        const blocks = await logseq.Editor.getPageBlocksTree(page.name);
        if (blocks.length > 0) {
          await logseq.Editor.updateBlock(blocks[0].uuid, '## Accepted Completions');
          await logseq.Editor.insertBlock(blocks[0].uuid, '## Custom Dictionary', { sibling: true });
        }
      }
    }
    return page;
  }

  public async getMemoryContext(): Promise<string> {
    try {
      const page = await logseq.Editor.getPage(MEMORY_PAGE_NAME);
      if (!page) return '';
      
      const blocks = await logseq.Editor.getPageBlocksTree(page.name);
      if (!blocks || blocks.length === 0) return '';
      
      let context = "User's preferred style/dictionary examples:\n";
      // Extract text from memory blocks
      const extractText = (blks: any[]): string => {
        let text = "";
        for (const b of blks) {
          if (b.content) text += b.content + "\n";
          if (b.children) text += extractText(b.children);
        }
        return text;
      };
      
      context += extractText(blocks).substring(0, 5000); // limit to 5000 chars to save tokens
      return context;
    } catch (e) {
      console.error("Error reading memory:", e);
      return '';
    }
  }

  public async saveAccepted(text: string) {
    try {
      const page = await this.ensureMemoryPage();
      if (!page) return;
      const blocks = await logseq.Editor.getPageBlocksTree(page.name);
      
      // Find the "Accepted Completions" block
      const acceptedHeader = blocks.find((b: any) => b.content.includes('Accepted Completions'));
      if (acceptedHeader) {
        // Append as a child
        await logseq.Editor.insertBlock(acceptedHeader.uuid, text, { sibling: false });
      } else if (blocks.length > 0) {
        // Just append to the bottom of the page
        const lastBlock = blocks[blocks.length - 1];
        await logseq.Editor.insertBlock(lastBlock.uuid, text, { sibling: true });
      }
    } catch (e) {
      console.error("Error saving accepted text:", e);
    }
  }
}

export const memoryService = new MemoryService();
