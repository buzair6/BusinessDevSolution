import dotenv from "dotenv";
dotenv.config();

import { GoogleGenAI } from "@google/genai";

const apiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_AI_API_KEY || "";

const ai = new GoogleGenAI({ 
  apiKey: apiKey
});

const model = ai.getGenerativeModel({ model: "gemini-1.5-flash" });

interface BusinessAdviceContext {
  transcripts?: any[];
  marketData?: any[];
  businessForm?: any;
  context?: any;
}

export async function generateBusinessAdvice(
  userMessage: string,
  context?: {
    transcripts?: any[];
    marketData?: any[];
    businessForm?: any;
    context?: any;
  }
): Promise<string> {
  try {
    // Build context from available data
    let contextPrompt = "";
    
    if (context?.transcripts && context.transcripts.length > 0) {
      contextPrompt += "\n\nSSDC EXPERT INSIGHTS:\n";
      context.transcripts.forEach((transcript, index) => {
        contextPrompt += `${index + 1}. ${transcript.intervieweeName} (${transcript.intervieweeRole} at ${transcript.intervieweeCompany || 'Company'}):
"${transcript.content.substring(0, 300)}..."
Key Tags: ${transcript.tags?.join(', ') || 'N/A'}
Industry: ${transcript.industry}\n\n`;
      });
    }

    if (context?.marketData && context.marketData.length > 0) {
      contextPrompt += "\n\nMARKET INTELLIGENCE:\n";
      context.marketData.forEach((data, index) => {
        contextPrompt += `${index + 1}. ${data.title} (${data.industry}):
${data.content.substring(0, 200)}...
Key Insights: ${data.keyInsights?.join(', ') || 'N/A'}
Data Type: ${data.dataType}\n\n`;
      });
    }

    if (context?.businessForm) {
      contextPrompt += "\n\nCURRENT BUSINESS CONTEXT:\n";
      contextPrompt += `Business: ${context.businessForm.title || 'Unnamed Business'}
Industry: ${context.businessForm.industry || 'Not specified'}
Problem Statement: ${context.businessForm.problemStatement || 'Not provided'}
Target Market: ${context.businessForm.targetMarket || 'Not defined'}
Revenue Model: ${context.businessForm.revenueModel || 'Not selected'}\n\n`;
    }

    const prompt = `You are an expert business advisor with access to insights from top CEOs and current market intelligence. 

${contextPrompt}

Based on the above context and your expertise, please provide detailed, actionable advice for the following query:

USER QUERY: ${userMessage}

INSTRUCTIONS:
1. Reference specific insights from the SSDC interviews when relevant
2. Incorporate market data and trends that apply to the user's situation
3. Provide concrete, actionable recommendations
4. If the user has a business form in progress, tailor advice specifically to their business
5. Use a professional but approachable tone
6. Structure your response clearly with key points
7. If relevant data is limited, acknowledge this and provide general best practices

Please provide comprehensive business guidance:`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    return response.text();
  } catch (error) {
    console.error("Error generating business advice:", error);
    throw new Error("Failed to generate business advice");
  }
}

export async function analyzeBusinessIdea(businessIdea: string): Promise<string> {
  try {
    const prompt = `As a business expert, analyze this business idea and provide structured feedback:

Business Idea: ${businessIdea}

Please provide analysis in the following areas:
1. Market Opportunity & Size
2. Target Customer Analysis
3. Competitive Landscape
4. Revenue Potential
5. Key Challenges & Risks
6. Recommended Next Steps

Be specific and actionable in your feedback.`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    return response.text() || "Unable to analyze the business idea at this time.";
  } catch (error) {
    console.error("Error analyzing business idea:", error);
    throw new Error("Failed to analyze business idea.");
  }
}

export async function refineBusinessConcept(
  concept: string, 
  targetMarket?: string, 
  industry?: string
): Promise<string> {
  try {
    const prompt = `Help refine this business concept with specific improvements:

Business Concept: ${concept}
${targetMarket ? `Target Market: ${targetMarket}` : ''}
${industry ? `Industry: ${industry}` : ''}

Please provide:
1. Refined problem statement
2. Improved value proposition  
3. More specific target customer profile
4. Suggested business model adjustments
5. Key differentiators to emphasize

Focus on making the concept more compelling and market-ready.`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    return response.text() || "Unable to refine the business concept at this time.";
  } catch (error) {
    console.error("Error refining business concept:", error);
    throw new Error("Failed to refine business concept.");
  }
}

export async function generateFormSuggestions(
  currentFormData: any,
  fieldName: string
): Promise<string[]> {
  try {
    const prompt = `Based on this business form data, suggest 3-5 improvements for the "${fieldName}" field:

Current Form Data:
${JSON.stringify(currentFormData, null, 2)}

Provide specific, actionable suggestions that would make this business concept stronger. 
Return as a simple array of strings, each suggestion should be concise and implementable.`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text() || "";
    
    // Parse suggestions from the response
    const suggestions = text
      .split('\n')
      .filter(line => line.trim())
      .map(line => line.replace(/^\d+\.\s*/, '').replace(/^[-*]\s*/, '').trim())
      .filter(suggestion => suggestion.length > 10)
      .slice(0, 5);

    return suggestions.length > 0 ? suggestions : [
      "Consider adding more specific details",
      "Think about your unique value proposition", 
      "Research your target market more deeply"
    ];
  } catch (error) {
    console.error("Error generating form suggestions:", error);
    return ["Consider refining this section with more specific details"];
  }
}
