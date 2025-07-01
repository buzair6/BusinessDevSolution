import dotenv from "dotenv";
dotenv.config();

import { GoogleGenAI } from "@google/genai";

const apiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_AI_API_KEY || "";

const ai = new GoogleGenAI({ 
  apiKey: apiKey
});

interface BusinessAdviceContext {
  transcripts?: any[];
  marketData?: any[];
  businessForm?: any;
  context?: any;
}

export async function generateBusinessAdvice(
  userMessage: string, 
  context: BusinessAdviceContext
): Promise<string> {
  try {
    const systemPrompt = `You are an expert business advisor with access to industry insights, market data, and CEO interviews. 
    You help entrepreneurs refine their business ideas and provide actionable advice.
    
    Available context:
    ${context.transcripts ? `- SSDC Interview insights from ${context.transcripts.length} industry leaders` : ''}
    ${context.marketData ? `- Market research data from ${context.marketData.length} sources` : ''}
    ${context.businessForm ? `- Current business form: ${context.businessForm.title}` : ''}
    
    Provide specific, actionable advice based on the available data. Reference relevant market trends, 
    successful business strategies from the interviews, and practical next steps.`;

    let contextString = "";
    
    if (context.transcripts && context.transcripts.length > 0) {
      contextString += "\n\nRelevant SSDC Interview Insights:\n";
      context.transcripts.forEach((transcript, index) => {
        contextString += `${index + 1}. ${transcript.intervieweeName} (${transcript.industry}): ${transcript.content.substring(0, 200)}...\n`;
      });
    }
    
    if (context.marketData && context.marketData.length > 0) {
      contextString += "\n\nRelevant Market Data:\n";
      context.marketData.forEach((data, index) => {
        contextString += `${index + 1}. ${data.title} (${data.industry}): ${data.content.substring(0, 200)}...\n`;
        if (data.keyInsights && data.keyInsights.length > 0) {
          contextString += `   Key insights: ${data.keyInsights.slice(0, 2).join(', ')}\n`;
        }
      });
    }
    
    if (context.businessForm) {
      contextString += "\n\nCurrent Business Form:\n";
      contextString += `Title: ${context.businessForm.title}\n`;
      if (context.businessForm.industry) contextString += `Industry: ${context.businessForm.industry}\n`;
      if (context.businessForm.problemStatement) contextString += `Problem: ${context.businessForm.problemStatement}\n`;
      if (context.businessForm.targetMarket) contextString += `Target Market: ${context.businessForm.targetMarket}\n`;
      if (context.businessForm.revenueModel) contextString += `Revenue Model: ${context.businessForm.revenueModel}\n`;
    }

    const fullPrompt = `${systemPrompt}\n\n${contextString}\n\nUser Question: ${userMessage}\n\nProvide a helpful, specific response:`;

    const response = await ai.models.generateContent({
      model: "gemini-1.5-flash",
      contents: fullPrompt,
    });

    return response.text || "I'm sorry, I couldn't generate a response at this time. Please try again.";
  } catch (error) {
    console.error("Error generating business advice:", error);
    throw new Error("Failed to generate AI response. Please check your API configuration.");
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

    const response = await ai.models.generateContent({
      model: "gemini-1.5-flash",
      contents: prompt,
    });

    return response.text || "Unable to analyze the business idea at this time.";
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

    const response = await ai.models.generateContent({
      model: "gemini-1.5-flash",
      contents: prompt,
    });

    return response.text || "Unable to refine the business concept at this time.";
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

    const response = await ai.models.generateContent({
      model: "gemini-1.5-flash",
      contents: prompt,
    });

    const text = response.text || "";
    
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
