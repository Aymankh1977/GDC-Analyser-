import { GoogleGenAI, Type, Modality, Chat } from "@google/genai";
import { AnalysisResult, SpecificGuidelineResult } from '../types';

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });

// Helper function for the "Map" step. Summarizes a single document.
async function summarizeSingleDocument(content: string): Promise<string> {
    const prompt = `
        You are a GDC compliance analyst. Briefly summarize the key findings from the following inspection report. 
        Focus on:
        - Specific strengths or areas where requirements were 'met'.
        - Specific weaknesses or areas where requirements were 'not met'.
        - Any overall conclusions.
        Keep the summary concise and to the point, in markdown format.

        Report content:
        ---
        ${content}
        ---
    `;
    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash", // Use the faster model for summarization
            contents: prompt,
        });
        return response.text;
    } catch (e) {
        console.warn(`Could not summarize a document, skipping. Error: ${e}`);
        return ""; // Return empty string on error to not fail the whole batch
    }
}

// Uses a Map-Reduce strategy to handle large numbers of documents
export async function analyzeDocuments(
    fileContents: string[], 
    onProgress: (message: string) => void
): Promise<AnalysisResult> {
    
    // MAP step - now in parallel
    const totalDocs = fileContents.length;
    onProgress(`Starting parallel summarization of ${totalDocs} documents (Step 1 of 2)...`);
    
    const summaryPromises = fileContents.map(content => summarizeSingleDocument(content));
    const settledSummaries = await Promise.all(summaryPromises);
    const summaries = settledSummaries.filter(summary => summary); // Filter out empty strings from failed summaries


    // REDUCE step
    onProgress('Synthesizing final report from summaries (Step 2 of 2)...');
    const combinedSummaries = summaries.join('\n\n---\n\n');

    const finalPrompt = `
        You are an expert GDC (General Dental Council) compliance analyst. Based on the following SUMMARIES of inspection reports, create a consolidated final report.
        The output MUST be a single markdown string.
        The output MUST contain EXACTLY two sections.
        The first section MUST start with the heading: "## Best Practice Recommendations". Under this heading, synthesize all the strengths and 'met' requirements from the summaries to create a list of gold standards and best practice recommendations.
        The second section MUST start with the heading: "## Common Areas for Improvement". Under this heading, identify and synthesize the most common themes, weaknesses, and areas where requirements were 'not met' or 'partially met' from the summaries.

        Report Summaries:
        ---
        ${combinedSummaries}
        ---
    `;

    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-pro", // Use the powerful model for the final synthesis
            contents: finalPrompt,
        });
        
        const rawText = response.text;
        
        let bestPractices = '';
        let areasForImprovement = '';

        const improvementHeader = "## Common Areas for Improvement";
        const practicesHeader = "## Best Practice Recommendations";

        const improvementIndex = rawText.toLowerCase().indexOf(improvementHeader.toLowerCase());
        
        if (improvementIndex !== -1) {
            bestPractices = rawText.substring(0, improvementIndex);
            areasForImprovement = rawText.substring(improvementIndex);
        } else {
            bestPractices = rawText;
        }

        const practicesIndex = bestPractices.toLowerCase().indexOf(practicesHeader.toLowerCase());
        if (practicesIndex !== -1) {
            bestPractices = bestPractices.substring(practicesIndex);
        }

        return {
            bestPractices: bestPractices.trim(),
            areasForImprovement: areasForImprovement.trim()
        };

    } catch (error) {
        console.error("Error analyzing documents:", error);
        throw new Error("Failed to analyze documents. Please check the console for more details.");
    }
}

// Uses a Map-Reduce strategy for supporting documents
export async function generateSpecificGuidelines(
    targetProgramContent: string, 
    otherProgramsContents: string[], 
    targetProgramName: string,
    onProgress: (message: string) => void
): Promise<SpecificGuidelineResult> {
    
    // MAP step for other programs - now in parallel
    const otherDocsCount = otherProgramsContents.length;
    let summaries: string[] = [];
    if (otherDocsCount > 0) {
        onProgress(`Starting parallel summarization of ${otherDocsCount} supporting documents (Step 1 of 2)...`);
        const summaryPromises = otherProgramsContents.map(content => summarizeSingleDocument(content));
        const settledSummaries = await Promise.all(summaryPromises);
        summaries = settledSummaries.filter(summary => summary);
    }


    // REDUCE step
    onProgress(`Generating specific guidelines for ${targetProgramName} (Step 2 of 2)...`);
    const combinedSummaries = summaries.join('\n\n---\n\n');
  
    const prompt = `
      You are an expert GDC (General Dental Council) compliance analyst. Your task is to generate a specific, actionable report for a single dental program based on its own inspection report and a collection of SUMMARIES from other inspection reports.
  
      The target program is: ${targetProgramName}
  
      **Target Program Report Content:**
      ---
      ${targetProgramContent}
      ---
  
      **Supporting Summaries from Other Programs (for context and benchmarking):**
      ---
      ${combinedSummaries.length > 0 ? combinedSummaries : 'No supporting documents were provided.'}
      ---
  
      **Instructions:**
      1.  Analyze the supporting summaries to identify common themes, gold-standard best practices where requirements were 'met', and frequent areas for improvement where requirements were 'not met' or 'partially met'.
      2.  Thoroughly analyze the target program's full report.
      3.  Compare the target program against the benchmarks and themes identified from the supporting summaries.
      4.  Generate a structured report for the target program. The report should be professional, concise, and provide to-the-point recommendations.
      
      The output must be a JSON object.
    `;
  
    try {
      const response = await ai.models.generateContent({
        model: "gemini-2.5-pro",
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              programName: { type: Type.STRING, description: "The name of the target program." },
              executiveSummary: { type: Type.STRING, description: "A brief, high-level overview of the findings for the target program." },
              strengths: { type: Type.STRING, description: "A markdown list of specific strengths of the target program, especially highlighting where it meets or exceeds the best practices seen in other reports." },
              areasForImprovement: { type: Type.STRING, description: "A markdown list of specific areas where the target program can improve, especially in areas where other programs excel or where common failings are present." },
              recommendations: { type: Type.STRING, description: "A prioritized, actionable markdown list of recommendations for the target program to address the areas for improvement." },
            },
            required: ["programName", "executiveSummary", "strengths", "areasForImprovement", "recommendations"],
          },
        },
      });
  
      const jsonText = response.text.trim();
      return JSON.parse(jsonText) as SpecificGuidelineResult;
    } catch (error) {
      console.error("Error generating specific guidelines:", error);
      throw new Error("Failed to generate specific guidelines. Please check the console for more details.");
    }
}


export async function generateSpeech(text: string): Promise<string> {
    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash-preview-tts",
            contents: [{ parts: [{ text: `Read the following text clearly and professionally: ${text}` }] }],
            config: {
                responseModalities: [Modality.AUDIO],
                speechConfig: {
                    voiceConfig: {
                        prebuiltVoiceConfig: { voiceName: 'Kore' },
                    },
                },
            },
        });
        
        const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
        if (!base64Audio) {
            throw new Error("No audio data received from API.");
        }
        return base64Audio;
    } catch (error) {
        console.error("Error generating speech:", error);
        throw new Error("Failed to generate speech.");
    }
}


export function createChatSession(reportContext: string): Chat {
    const systemInstruction = `
        You are an expert AI assistant specializing in GDC (General Dental Council) standards and dental practice compliance. 
        Your primary role is to help users understand and implement the recommendations from a GDC analysis report.

        You have been provided with a specific GDC analysis report. You MUST base all of your answers, analysis, and advice directly on the content of this report.
        Do not invent information. If the report doesn't contain an answer, state that the information is not available in the provided context.

        Your capabilities:
        - Clarify any points mentioned in the report's strengths, weaknesses, or recommendations.
        - Provide detailed, step-by-step action plans for implementing the recommendations.
        - Help draft sample policies, checklists, or training materials based on the report's findings.
        - Answer specific questions about GDC standards ONLY as they relate to the issues raised in the report.
        - Maintain a professional, helpful, and encouraging tone.

        Here is the report context for our conversation:
        ---
        ${reportContext}
        ---
    `;

    const chat = ai.chats.create({
        model: 'gemini-2.5-pro',
        config: {
            systemInstruction: systemInstruction,
        },
    });

    return chat;
}
