export const cleanAIText = (text: string): string => {
  return text
    // Remove markdown bold
    .replace(/\*\*(.+?)\*\*/g, '$1')
    // Remove markdown italic
    .replace(/\*(.+?)\*/g, '$1')
    // Clean up extra asterisks
    .replace(/\*+/g, '')
    // Clean up multiple spaces
    .replace(/\s+/g, ' ')
    .trim();
};

export const parseAIContent = (text: string) => {
  if (!text) return [];
  
  // Split into paragraphs
  const paragraphs = text.split('\n\n').filter(p => p.trim());
  
  return paragraphs.map(para => {
    // Check if it's a bullet list
    if (para.includes('* ') || para.includes('- ')) {
      const items = para
        .split('\n')
        .filter(line => line.trim().startsWith('*') || line.trim().startsWith('-'))
        .map(line => cleanAIText(line.replace(/^[\*\-]\s*/, '')));
      
      return { type: 'list' as const, items };
    }
    
    return { type: 'paragraph' as const, content: cleanAIText(para) };
  });
};
