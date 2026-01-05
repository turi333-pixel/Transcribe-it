
import { GoogleGenAI } from "@google/genai";

export const transcribeAudio = async (base64Data: string, mimeType: string): Promise<string> => {
  // Creating a new instance right before the call ensures it uses the most up-to-date configuration
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });

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
            text: `Transcribe the provided audio with precise speaker diarization and timestamps. 

Follow these specific formatting rules:
1. TIMESTAMPS: Include a timestamp marker in the format '[MM:SS]' at the beginning of every speaker turn and at the start of new paragraphs if a speaker talks for a long duration.
2. DIARIZATION: Detect different voices and assign a unique label to each speaker (e.g., '[00:00] Speaker 1:', '[00:15] Speaker 2:').
3. NAMING: If a speaker identifies themselves or is addressed by name in the audio, use their actual name (e.g., '[01:02] Sarah:').
4. STRUCTURE: Start a new line every time the speaker changes or when there is a significant pause/topic shift.
5. ACCURACY: Provide a verbatim transcription. Maintain the natural flow of conversation.
6. PARAGRAPHS: For long segments, use logical breaks and repeat the timestamp at the start of the new paragraph.
7. OUTPUT: Return only the final transcribed text with labels and timestamps. Do not include any meta-commentary or introductory text.`
          }
        ]
      },
      config: {
        temperature: 0.1,
        systemInstruction: "You are an expert transcriptionist specializing in speaker diarization and time-coded transcripts. You accurately distinguish between voices and provide precise [MM:SS] timestamps for every segment of dialogue."
      }
    });

    return response.text || "Transcription failed or returned no text.";
  } catch (error) {
    console.error("Gemini Transcription Error:", error);
    throw new Error("Failed to transcribe audio. Ensure the file is clear and try again.");
  }
};
