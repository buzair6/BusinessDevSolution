import { Router } from "express";
import passport from "passport";
import { isAuthenticated } from "./auth";
import { storage } from "./storage";
import { 
  insertSsdcTranscriptSchema,
  insertMarketSurveyDataSchema,
  insertBusinessFormSchema,
  User 
} from "@shared/schema";
import { generateBusinessAdvice, analyzeBusinessIdea, refineBusinessConcept } from "./gemini";
import type { Request, Response, NextFunction } from "express";
import bcrypt from "bcryptjs";

const apiRouter = Router();
const saltRounds = 10;

// --- Authentication Routes ---

apiRouter.post("/register", async (req, res, next) => {
    const { email, password, firstName, lastName } = req.body;
    if (!email || !password) {
      return res.status(400).json({ message: "Email and password are required." });
    }

    try {
      const existingUser = await storage.getUserByEmail(email);
      if (existingUser) {
        return res.status(409).json({ message: "User already exists." });
      }

      const userCount = await storage.getUserCount();
      const isAdmin = userCount === 0;
      const hashedPassword = await bcrypt.hash(password, saltRounds);

      const newUser = await storage.upsertUser({
        id: crypto.randomUUID(),
        email,
        password: hashedPassword,
        firstName,
        lastName,
        isAdmin,
      });

      req.login(newUser, (err) => {
        if (err) return next(err);
        const { password, ...userWithoutPassword } = newUser;
        res.status(201).json(userWithoutPassword);
      });
    } catch (error) {
      console.error("Registration error:", error);
      res.status(500).json({ message: "Error registering user" });
    }
});

apiRouter.post("/login", (req: Request, res: Response, next: NextFunction) => {
    passport.authenticate("local", (err: Error | null, user: User | false, info: { message: string }) => {
      if (err) return next(err);
      if (!user) return res.status(401).json({ message: info.message || "Login failed" });
      
      req.login(user, (err) => {
        if (err) return next(err);
        const { password, ...userWithoutPassword } = user;
        return res.json(userWithoutPassword);
      });
    })(req, res, next);
});

apiRouter.post("/logout", (req, res, next) => {
    req.logout((err) => {
      if (err) return next(err);
      req.session.destroy((err) => {
        if (err) return next(err);
        res.clearCookie('connect.sid');
        res.status(200).json({ message: "Logged out successfully" });
      });
    });
});

apiRouter.get('/auth/user', isAuthenticated, (req, res) => {
    const { password, ...userWithoutPassword } = req.user as User;
    res.json(userWithoutPassword);
});


// --- SSDC Transcripts Routes ---

apiRouter.get('/ssdc-transcripts', async (req, res) => {
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

apiRouter.post('/ssdc-transcripts', isAuthenticated, async (req: any, res) => {
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

// --- Market Survey Data Routes ---

apiRouter.get('/market-survey-data', async (req, res) => {
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

apiRouter.post('/market-survey-data', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const validatedData = insertMarketSurveyDataSchema.parse({ ...req.body, uploadedBy: userId });
      const data = await storage.createMarketSurveyData(validatedData);
      res.status(201).json(data);
    } catch (error) {
      console.error("Error creating market survey data:", error);
      res.status(500).json({ message: "Failed to create market data" });
    }
});


// --- Business Forms Routes ---

apiRouter.get('/business-forms', isAuthenticated, async (req: any, res) => {
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

apiRouter.get('/business-forms/:id', isAuthenticated, async (req: any, res) => {
    try {
      const id = parseInt(req.params.id);
      const userId = req.user.id;
      const form = await storage.getBusinessForm(id);
      
      if (!form) return res.status(404).json({ message: "Form not found" });
      if (form.userId !== userId && !req.user?.isAdmin) return res.status(403).json({ message: "Access denied" });

      res.json(form);
    } catch (error) {
      console.error("Error fetching business form:", error);
      res.status(500).json({ message: "Failed to fetch form" });
    }
  });

apiRouter.post('/business-forms', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const validatedData = insertBusinessFormSchema.parse({ ...req.body, userId });
      const form = await storage.createBusinessForm(validatedData);
      res.status(201).json(form);
    } catch (error) {
      console.error("Error creating business form:", error);
      res.status(500).json({ message: "Failed to create form" });
    }
});

apiRouter.put('/business-forms/:id', isAuthenticated, async (req: any, res) => {
    try {
      const id = parseInt(req.params.id);
      const userId = req.user.id;
      const form = await storage.getBusinessForm(id);
      
      if (!form) return res.status(404).json({ message: "Form not found" });
      if (form.userId !== userId && !req.user?.isAdmin) return res.status(403).json({ message: "Access denied" });

      const validatedData = insertBusinessFormSchema.partial().parse(req.body);
      const updatedForm = await storage.updateBusinessForm(id, validatedData);
      res.json(updatedForm);
    } catch (error) {
      console.error("Error updating business form:", error);
      res.status(500).json({ message: "Failed to update form" });
    }
});


// --- AI Routes ---

apiRouter.post('/ai-chat', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const { message, formId, context } = req.body;

      if (!message) return res.status(400).json({ message: "Message is required" });

      const [transcripts, marketData, businessForm] = await Promise.all([
        storage.getSsdcTranscripts(),
        storage.getMarketSurveyData(),
        formId ? storage.getBusinessForm(formId) : null,
      ]);

      const aiResponse = await generateBusinessAdvice(message, { transcripts, marketData, businessForm, context });

      await storage.createAiChatSession({
        userId,
        formId: formId || null,
        messages: [
          { role: "user", content: message, timestamp: new Date() },
          { role: "assistant", content: aiResponse, timestamp: new Date() }
        ],
      });
      
      res.json({ response: aiResponse });
    } catch (error) {
      console.error("Error in AI chat:", error);
      res.status(500).json({ message: "Failed to process AI request" });
    }
});

apiRouter.post('/ai-analyze-idea', isAuthenticated, async (req, res) => {
    try {
      const { businessIdea } = req.body;
      if (!businessIdea) return res.status(400).json({ message: "Business idea is required" });
      const analysis = await analyzeBusinessIdea(businessIdea);
      res.json({ analysis });
    } catch (error) {
      console.error("Error analyzing business idea:", error);
      res.status(500).json({ message: "Failed to analyze business idea" });
    }
});

apiRouter.post('/ai-refine-concept', isAuthenticated, async (req, res) => {
    try {
      const { concept, targetMarket, industry } = req.body;
      if (!concept) return res.status(400).json({ message: "Business concept is required" });
      const refinedConcept = await refineBusinessConcept(concept, targetMarket, industry);
      res.json({ refinedConcept });
    } catch (error) {
      console.error("Error refining business concept:", error);
      res.status(500).json({ message: "Failed to refine business concept" });
    }
});


// --- Admin Routes ---

apiRouter.post('/admin/create-user', isAuthenticated, async (req: any, res) => {
    try {
      if (!req.user?.isAdmin) {
        return res.status(403).json({ message: "Admin access required" });
      }
      const { id, email, firstName, lastName, isAdmin } = req.body;
      if (!id || !email) return res.status(400).json({ message: "ID and email are required" });
      
      const newUser = await storage.upsertUser({ id, email, firstName, lastName, isAdmin: isAdmin || false });
      res.status(201).json(newUser);
    } catch (error) {
      console.error("Error creating user:", error);
      res.status(500).json({ message: "Failed to create user" });
    }
});


export default apiRouter;