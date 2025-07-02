import dotenv from "dotenv";
dotenv.config();

const apiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_AI_API_KEY || "";

// Temporary fallback while resolving import issues
let genAI: any = null;
let model: any = null;

async function initializeAI() {
  try {
    if (!apiKey) {
      console.warn("Warning: No Gemini API key found. AI features will use fallback responses.");
      return;
    }
    
    // Try dynamic import
    const { GoogleGenAI } = await import("@google/genai");
    genAI = new GoogleGenAI({ apiKey });
    model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    console.log("AI initialization successful");
  } catch (error: any) {
    console.warn("AI initialization failed, using fallback responses:", error?.message || error);
  }
}

// Initialize AI on module load
initializeAI();

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
    if (!model) {
      return generateFallbackAdvice(userMessage, context);
    }

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
    return generateFallbackAdvice(userMessage, context);
  }
}

function generateFallbackAdvice(userMessage: string, context?: any): string {
  let advice = `Thank you for your question: "${userMessage}"\n\n`;
  
  advice += "**Business Development Guidance:**\n\n";
  
  if (context?.businessForm) {
    advice += `I see you're working on "${context.businessForm.title || 'your business concept'}" in the ${context.businessForm.industry || 'business'} space.\n\n`;
  }
  
  advice += "Here are some general recommendations:\n\n";
  advice += "1. **Validate Your Market**: Conduct customer interviews to validate demand\n";
  advice += "2. **Define Your Value Proposition**: Clearly articulate what makes you unique\n";
  advice += "3. **Start Small**: Begin with a minimum viable product (MVP)\n";
  advice += "4. **Focus on Customer Acquisition**: Develop a clear go-to-market strategy\n";
  advice += "5. **Monitor Key Metrics**: Track progress with relevant KPIs\n\n";
  
  if (context?.transcripts?.length > 0) {
    advice += `**Insights from Industry Leaders:**\n`;
    advice += `Based on insights from ${context.transcripts.length} CEO interviews, focus on product-market fit and sustainable growth.\n\n`;
  }
  
  if (context?.marketData?.length > 0) {
    advice += `**Market Intelligence:**\n`;
    advice += `Current market data suggests opportunities in emerging trends and customer pain points.\n\n`;
  }
  
  advice += "*Note: AI features are currently in fallback mode. Please check the system configuration for full AI capabilities.*";
  
  return advice;
}

export async function analyzeBusinessIdea(businessIdea: string): Promise<string> {
  if (!model) {
    return `**Business Idea Analysis:**

**Your Idea:** ${businessIdea}

**Initial Assessment:**
1. **Market Opportunity**: Research the total addressable market size
2. **Target Customers**: Define your ideal customer profile clearly
3. **Competitive Landscape**: Identify direct and indirect competitors
4. **Revenue Potential**: Explore different monetization strategies
5. **Key Challenges**: Consider barriers to entry and scaling challenges
6. **Next Steps**: Start with customer validation and MVP development

*Note: This is a basic analysis. Full AI analysis is currently unavailable.*`;
  }

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
    return "I'm having trouble analyzing your business idea right now. Please try again later.";
  }
}

export async function refineBusinessConcept(
  concept: string, 
  targetMarket?: string, 
  industry?: string
): Promise<string> {
  if (!model) {
    return `**Business Concept Refinement:**

**Original Concept:** ${concept}
${targetMarket ? `**Target Market:** ${targetMarket}` : ''}
${industry ? `**Industry:** ${industry}` : ''}

**Refinement Suggestions:**
1. **Problem Statement**: Be more specific about the exact problem you're solving
2. **Value Proposition**: Clearly state the unique benefit you provide
3. **Target Customer**: Narrow down to a specific customer segment
4. **Business Model**: Consider subscription, marketplace, or direct sales models
5. **Differentiation**: Identify what makes you unique in the market

*Note: Full AI refinement is currently unavailable.*`;
  }

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
    return "I'm having trouble refining your concept right now. Please try again later.";
  }
}

export async function generateFormSuggestions(
  currentFormData: any,
  fieldName: string
): Promise<string[]> {
  if (!model) {
    return [
      "Be more specific about your target customer",
      "Research your competition thoroughly",
      "Validate your assumptions with real customers",
      "Consider different revenue models",
      "Focus on your unique value proposition"
    ];
  }

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
      .filter((line: string) => line.trim())
      .map((line: string) => line.replace(/^\d+\.\s*/, '').replace(/^[-*]\s*/, '').trim())
      .filter((suggestion: string) => suggestion.length > 10)
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