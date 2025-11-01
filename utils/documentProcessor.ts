// Utility to optimize documents before analysis
export function preprocessDocument(content: string): string {
    if (!content) return '';
    
    let processed = content;
    
    // 1. Remove excessive whitespace
    processed = processed.replace(/\s+/g, ' ');
    
    // 2. Extract key sections (common in GDC reports)
    const keySections = extractKeySections(processed);
    
    // 3. Limit length while preserving important content
    if (processed.length > 10000) {
        processed = processed.substring(0, 10000) + '... [document truncated]';
    }
    
    return processed;
}

function extractKeySections(content: string): string {
    const sections: string[] = [];
    
    // Common GDC report sections
    const sectionPatterns = [
        /(?:strengths|positive aspects).*?(?=\n\s*\n|$)/gi,
        /(?:areas for improvement|issues|concerns).*?(?=\n\s*\n|$)/gi,
        /(?:recommendations|suggestions).*?(?=\n\s*\n|$)/gi,
        /(?:met.*?requirements?|compliant).*?(?=\n\s*\n|$)/gi,
        /(?:not met.*?requirements?|non.?compliant).*?(?=\n\s*\n|$)/gi,
    ];
    
    sectionPatterns.forEach(pattern => {
        const matches = content.match(pattern);
        if (matches) {
            sections.push(...matches);
        }
    });
    
    // If we found key sections, use them; otherwise use the full content
    return sections.length > 0 ? sections.join('\n\n') : content;
}

// Batch processing helper
export async function processInBatches<T, R>(
    items: T[],
    processor: (item: T) => Promise<R>,
    batchSize: number = 5,
    delayBetweenBatches: number = 500
): Promise<R[]> {
    const results: R[] = [];
    
    for (let i = 0; i < items.length; i += batchSize) {
        const batch = items.slice(i, i + batchSize);
        const batchPromises = batch.map(item => processor(item));
        
        const batchResults = await Promise.allSettled(batchPromises);
        
        batchResults.forEach(result => {
            if (result.status === 'fulfilled') {
                results.push(result.value);
            }
        });
        
        // Respect rate limits
        if (i + batchSize < items.length) {
            await new Promise(resolve => setTimeout(resolve, delayBetweenBatches));
        }
    }
    
    return results;
}
