
import { GoogleGenAI } from "@google/genai";

export const transcribeAudio = async (base64Data: string, mimeType: string): Promise<string> => {
  // Creating a new instance right before the call ensures it uses the most up-to-date configuration
  // Always use new GoogleGenAI({ apiKey: process.env.API_KEY }) as per guidelines
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-preview',
      contents: {
        parts: [
          {
            inlineData: {
              data: base64Data,
              mimeType: mimeType
            }
          },
          {
            text: `Please process this audio and provide a professional document with the following structure:

1. SUMMARY: Provide a concise 2-3 sentence summary of the main topics discussed.
2. TRANSCRIPT: Transcribe the audio with precise speaker diarization and timestamps. 
   - Use '[MM:SS]' markers at the start of every speaker turn.
   - Assign unique labels like 'Speaker 1:' or use real names if mentioned.
   - Start a new line for every speaker change.
3. ACTION ITEMS: List any tasks, decisions, or agreed-upon actions in a clear, bulleted format. 
   - Specify who is responsible for each action if their name is identifiable from the context.

Maintain high accuracy and a professional tone. Return ONLY the final structured text. Do not include introductory remarks or meta-commentary.`
          }
        ]
      },
      config: {
        temperature: 0.1,
        systemInstruction: "You are an elite executive assistant specializing in meeting transcription and synthesis. You transform audio recordings into structured professional documents featuring summaries, time-coded transcripts with speaker identification, and clear action item tracking."
      }
    });

    // The text property is a getter, not a method.
    return response.text || "Transcription failed or returned no text.";
  } catch (error) {
    console.error("Gemini Transcription Error:", error);
    throw new Error("Failed to transcribe audio. Ensure the file is clear and try again.");
  }
};
