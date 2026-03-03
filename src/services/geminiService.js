import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });

export async function compareResumeWithJD(resumeText, jdText, metadata = {}) {
  const { companyName, position, candidateName, yearsOfExperience } = metadata;
  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: `
      Compare the following Resume against the Job Description (JD).
      
      CANDIDATE NAME: ${candidateName || 'Not Provided'}
      TARGET POSITION: ${position || 'Not Provided'}
      TARGET COMPANY: ${companyName || 'Not Provided'}
      REQUIRED EXPERIENCE: ${yearsOfExperience || 'Not Provided'}

      RESUME:
      ${resumeText}
      
      JOB DESCRIPTION:
      ${jdText}
    `,
    config: {
      systemInstruction: "You are an expert HR recruiter and technical screener. Analyze the resume against the JD and provide a detailed comparison in JSON format.",
      responseMimeType: "application/json",
      responseSchema: {
        type: "OBJECT",
        properties: {
          matchPercentage: { type: "NUMBER" },
          matchingSkills: { type: "ARRAY", items: { type: "STRING" } },
          missingSkills: { type: "ARRAY", items: { type: "STRING" } },
          strengths: { type: "ARRAY", items: { type: "STRING" } },
          weaknesses: { type: "ARRAY", items: { type: "STRING" } },
          recommendations: { type: "ARRAY", items: { type: "STRING" } },
          emailDraft: { type: "STRING" }
        },
        required: ["matchPercentage", "matchingSkills", "missingSkills", "strengths", "weaknesses", "recommendations", "emailDraft"]
      }
    }
  });

  return JSON.parse(response.text || "{}");
}
