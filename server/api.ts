import { Router } from "express";
import passport from "./auth";
import { isAuthenticated } from "./auth"; //
import { storage } from "./storage"; //
import { User, insertBusinessIdeaSchema, updateBusinessIdeaSchema } from "../shared/schema.js"; // Import new schema/types
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

// Middleware to check if user is admin
const isAdmin: RequestHandler = (req, res, next) => {
  if (req.isAuthenticated() && (req.user as User)?.isAdmin) {
    return next();
  }
  res.status(403).json({ message: "Forbidden: Admin access required" });
};

// --- Business Idea Routes ---

// Submit a new business idea (for authenticated users)
apiRouter.post("/ideas", isAuthenticated, async (req, res, next) => {
  try {
    const parsedIdea = insertBusinessIdeaSchema.safeParse({
      ...req.body,
      userId: (req.user as User).id // Automatically assign current user's ID
    });

    if (!parsedIdea.success) {
      return res.status(400).json({ message: parsedIdea.error.errors });
    }

    const newIdea = await storage.createBusinessIdea(parsedIdea.data);
    res.status(201).json(newIdea);
  } catch (error) {
    console.error("Error submitting idea:", error);
    next(error);
  }
});

// Get all approved business ideas (publicly accessible)
apiRouter.get("/ideas/approved", async (req, res, next) => {
  try {
    const approvedIdeas = await storage.getApprovedBusinessIdeas();
    res.status(200).json(approvedIdeas);
  } catch (error) {
    console.error("Error fetching approved ideas:", error);
    next(error);
  }
});

// Upvote an idea (authenticated users)
apiRouter.post("/ideas/:id/upvote", isAuthenticated, async (req, res, next) => {
  try {
    const ideaId = parseInt(req.params.id);
    if (isNaN(ideaId)) {
      return res.status(400).json({ message: "Invalid idea ID." });
    }
    const updatedIdea = await storage.updateBusinessIdeaVotes(ideaId, "upvote");
    if (!updatedIdea) {
      return res.status(404).json({ message: "Idea not found." });
    }
    res.status(200).json(updatedIdea);
  } catch (error) {
    console.error("Error upvoting idea:", error);
    next(error);
  }
});

// Downvote an idea (authenticated users)
apiRouter.post("/ideas/:id/downvote", isAuthenticated, async (req, res, next) => {
  try {
    const ideaId = parseInt(req.params.id);
    if (isNaN(ideaId)) {
      return res.status(400).json({ message: "Invalid idea ID." });
    }
    const updatedIdea = await storage.updateBusinessIdeaVotes(ideaId, "downvote");
    if (!updatedIdea) {
      return res.status(404).json({ message: "Idea not found." });
    }
    res.status(200).json(updatedIdea);
  } catch (error) {
    console.error("Error downvoting idea:", error);
    next(error);
  }
});

// --- Admin Idea Management Routes (Admin Only) ---

// Get all business ideas for admin review (pending, approved, rejected)
apiRouter.get("/admin/ideas", isAdmin, async (req, res, next) => {
  try {
    const allIdeas = await storage.getAllBusinessIdeas();
    res.status(200).json(allIdeas);
  } catch (error) {
    console.error("Error fetching all ideas for admin:", error);
    next(error);
  }
});

// Get a specific business idea by ID (for admin to view/edit details)
apiRouter.get("/admin/ideas/:id", isAdmin, async (req, res, next) => {
  try {
    const ideaId = parseInt(req.params.id);
    if (isNaN(ideaId)) {
      return res.status(400).json({ message: "Invalid idea ID." });
    }
    const idea = await storage.getBusinessIdeaById(ideaId);
    if (!idea) {
      return res.status(404).json({ message: "Idea not found." });
    }
    res.status(200).json(idea);
  } catch (error) {
    console.error("Error fetching idea for admin:", error);
    next(error);
  }
});

// Update the status of a business idea (approve/reject)
apiRouter.put("/admin/ideas/:id/status", isAdmin, async (req, res, next) => {
  try {
    const ideaId = parseInt(req.params.id);
    const { status } = req.body;
    if (isNaN(ideaId) || !["pending", "approved", "rejected"].includes(status)) {
      return res.status(400).json({ message: "Invalid idea ID or status." });
    }
    const updatedIdea = await storage.updateBusinessIdeaStatus(ideaId, status as "pending" | "approved" | "rejected");
    if (!updatedIdea) {
      return res.status(404).json({ message: "Idea not found." });
    }
    res.status(200).json(updatedIdea);
  } catch (error) {
    console.error("Error updating idea status:", error);
    next(error);
  }
});

// Edit specific fields of a business idea
apiRouter.put("/admin/ideas/:id", isAdmin, async (req, res, next) => {
  try {
    const ideaId = parseInt(req.params.id);
    const updateData = updateBusinessIdeaSchema.safeParse(req.body); // Use Zod for validation
    
    if (isNaN(ideaId)) {
      return res.status(400).json({ message: "Invalid idea ID." });
    }
    if (!updateData.success) {
      return res.status(400).json({ message: updateData.error.errors });
    }

    const updatedIdea = await storage.updateBusinessIdea(ideaId, updateData.data);
    if (!updatedIdea) {
      return res.status(404).json({ message: "Idea not found." });
    }
    res.status(200).json(updatedIdea);
  } catch (error) {
    console.error("Error editing idea:", error);
    next(error);
  }
});

// Delete a business idea
apiRouter.delete("/admin/ideas/:id", isAdmin, async (req, res, next) => {
  try {
    const ideaId = parseInt(req.params.id);
    if (isNaN(ideaId)) {
      return res.status(400).json({ message: "Invalid idea ID." });
    }
    await storage.deleteBusinessIdea(ideaId);
    res.status(204).send(); // No content for successful deletion
  } catch (error) {
    console.error("Error deleting idea:", error);
    next(error);
  }
});

export default apiRouter;