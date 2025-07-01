import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { isAuthenticated } from "./auth";
import { 
  insertSsdcTranscriptSchema,
  insertMarketSurveyDataSchema,
  insertBusinessFormSchema,
  insertAiChatSessionSchema 
} from "@shared/schema";
import { generateBusinessAdvice, analyzeBusinessIdea, refineBusinessConcept } from "./gemini";

export async function registerRoutes(app: Express): Promise<Server> {
  // Auth routes
  app.get('/api/auth/user', (req, res) => {
    if (req.user) {
      res.json(req.user);
    } else {
      res.status(401).json({ message: "Unauthorized" });
    }
  });

  // SSDC Transcripts routes
  app.get('/api/ssdc-transcripts', async (req, res) => {
    try {
      const { industry, search } = req.query;
      const transcripts = await storage.getSsdcTranscripts({
        industry: industry as string,
        search: search as string,
      });
      res.json(transcripts);
    } catch (error) {
      console.error("Error fetching SSDC transcripts:", error);
      res.status(500).json({ message: "Failed to fetch transcripts" });
    }
  });

  app.get('/api/ssdc-transcripts/:id', async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const transcript = await storage.getSsdcTranscript(id);
      if (!transcript) {
        return res.status(404).json({ message: "Transcript not found" });
      }
      res.json(transcript);
    } catch (error) {
      console.error("Error fetching SSDC transcript:", error);
      res.status(500).json({ message: "Failed to fetch transcript" });
    }
  });

  app.post('/api/ssdc-transcripts', isAuthenticated, async (req: any, res) => {
    try {
      if (!req.user?.isAdmin) {
        return res.status(403).json({ message: "Admin access required" });
      }

      const validatedData = insertSsdcTranscriptSchema.parse(req.body);
      const transcript = await storage.createSsdcTranscript(validatedData);
      res.status(201).json(transcript);
    } catch (error) {
      console.error("Error creating SSDC transcript:", error);
      res.status(500).json({ message: "Failed to create transcript" });
    }
  });

  app.put('/api/ssdc-transcripts/:id', isAuthenticated, async (req: any, res) => {
    try {
      if (!req.user?.isAdmin) {
        return res.status(403).json({ message: "Admin access required" });
      }

      const id = parseInt(req.params.id);
      const validatedData = insertSsdcTranscriptSchema.partial().parse(req.body);
      const transcript = await storage.updateSsdcTranscript(id, validatedData);
      res.json(transcript);
    } catch (error) {
      console.error("Error updating SSDC transcript:", error);
      res.status(500).json({ message: "Failed to update transcript" });
    }
  });

  app.delete('/api/ssdc-transcripts/:id', isAuthenticated, async (req: any, res) => {
    try {
      if (!req.user?.isAdmin) {
        return res.status(403).json({ message: "Admin access required" });
      }

      const id = parseInt(req.params.id);
      await storage.deleteSsdcTranscript(id);
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting SSDC transcript:", error);
      res.status(500).json({ message: "Failed to delete transcript" });
    }
  });

  // Market Survey Data routes
  app.get('/api/market-survey-data', async (req, res) => {
    try {
      const { industry, dataType } = req.query;
      const data = await storage.getMarketSurveyData({
        industry: industry as string,
        dataType: dataType as string,
      });
      res.json(data);
    } catch (error) {
      console.error("Error fetching market survey data:", error);
      res.status(500).json({ message: "Failed to fetch market data" });
    }
  });

  app.post('/api/market-survey-data', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const validatedData = insertMarketSurveyDataSchema.parse({
        ...req.body,
        uploadedBy: userId,
      });
      const data = await storage.createMarketSurveyData(validatedData);
      res.status(201).json(data);
    } catch (error) {
      console.error("Error creating market survey data:", error);
      res.status(500).json({ message: "Failed to create market data" });
    }
  });

  // Business Forms routes
  app.get('/api/business-forms', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const user = await storage.getUser(userId);
      
      const forms = await storage.getBusinessForms(user?.isAdmin ? undefined : userId);
      res.json(forms);
    } catch (error) {
      console.error("Error fetching business forms:", error);
      res.status(500).json({ message: "Failed to fetch forms" });
    }
  });

  app.get('/api/business-forms/:id', isAuthenticated, async (req: any, res) => {
    try {
      const id = parseInt(req.params.id);
      const userId = req.user.id;
      const form = await storage.getBusinessForm(id);
      
      if (!form) {
        return res.status(404).json({ message: "Form not found" });
      }

      if (form.userId !== userId && !req.user?.isAdmin) {
        return res.status(403).json({ message: "Access denied" });
      }

      res.json(form);
    } catch (error) {
      console.error("Error fetching business form:", error);
      res.status(500).json({ message: "Failed to fetch form" });
    }
  });

  app.post('/api/business-forms', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const validatedData = insertBusinessFormSchema.parse({
        ...req.body,
        userId,
      });
      const form = await storage.createBusinessForm(validatedData);
      res.status(201).json(form);
    } catch (error) {
      console.error("Error creating business form:", error);
      res.status(500).json({ message: "Failed to create form" });
    }
  });

  app.put('/api/business-forms/:id', isAuthenticated, async (req: any, res) => {
    try {
      const id = parseInt(req.params.id);
      const userId = req.user.id;
      const form = await storage.getBusinessForm(id);
      
      if (!form) {
        return res.status(404).json({ message: "Form not found" });
      }

      if (form.userId !== userId && !req.user?.isAdmin) {
        return res.status(403).json({ message: "Access denied" });
      }

      const validatedData = insertBusinessFormSchema.partial().parse(req.body);
      const updatedForm = await storage.updateBusinessForm(id, validatedData);
      res.json(updatedForm);
    } catch (error) {
      console.error("Error updating business form:", error);
      res.status(500).json({ message: "Failed to update form" });
    }
  });

  // AI Chat routes
  app.post('/api/ai-chat', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const { message, formId, context } = req.body;

      if (!message) {
        return res.status(400).json({ message: "Message is required" });
      }

      const contextData = await Promise.all([
        storage.getSsdcTranscripts(),
        storage.getMarketSurveyData(),
        formId ? storage.getBusinessForm(formId) : null,
      ]);

      const [transcripts, marketData, businessForm] = contextData;

      const aiResponse = await generateBusinessAdvice(message, {
        transcripts: transcripts.slice(0, 5),
        marketData: marketData.slice(0, 5),
        businessForm,
        context,
      });

      const sessionData = {
        userId,
        formId: formId || null,
        messages: [
          { role: "user", content: message, timestamp: new Date() },
          { role: "assistant", content: aiResponse, timestamp: new Date() }
        ],
      };

      const session = await storage.createAiChatSession(sessionData);
      
      res.json({ 
        response: aiResponse,
        sessionId: session.id 
      });
    } catch (error) {
      console.error("Error in AI chat:", error);
      res.status(500).json({ message: "Failed to process AI request" });
    }
  });

  app.post('/api/ai-analyze-idea', isAuthenticated, async (req: any, res) => {
    try {
      const { businessIdea } = req.body;
      if (!businessIdea) {
        return res.status(400).json({ message: "Business idea is required" });
      }
      const analysis = await analyzeBusinessIdea(businessIdea);
      res.json({ analysis });
    } catch (error) {
      console.error("Error analyzing business idea:", error);
      res.status(500).json({ message: "Failed to analyze business idea" });
    }
  });

  app.post('/api/ai-refine-concept', isAuthenticated, async (req: any, res) => {
    try {
      const { concept, targetMarket, industry } = req.body;
      if (!concept) {
        return res.status(400).json({ message: "Business concept is required" });
      }
      const refinedConcept = await refineBusinessConcept(concept, targetMarket, industry);
      res.json({ refinedConcept });
    } catch (error) {
      console.error("Error refining business concept:", error);
      res.status(500).json({ message: "Failed to refine business concept" });
    }
  });

  // Admin routes
  app.post('/api/admin/create-user', isAuthenticated, async (req: any, res) => {
    try {
      if (!req.user?.isAdmin) {
        return res.status(403).json({ message: "Admin access required" });
      }
      const { id, email, firstName, lastName, isAdmin } = req.body;
      if (!id || !email) {
        return res.status(400).json({ message: "ID and email are required" });
      }
      const newUser = await storage.upsertUser({
        id,
        email,
        firstName,
        lastName,
        isAdmin: isAdmin || false,
      });
      res.status(201).json(newUser);
    } catch (error) {
      console.error("Error creating user:", error);
      res.status(500).json({ message: "Failed to create user" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}