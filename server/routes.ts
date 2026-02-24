import type { Express } from "express";
import type { Server } from "http";
import { storage } from "./storage";
import { api, errorSchemas } from "@shared/routes";
import { z } from "zod";
import multer from "multer";
import { analyzeChat } from "./chat-analyzer";

// Configure multer for memory storage (file parsed in memory)
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 50 * 1024 * 1024, // 50MB max file size
  }
});

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {

  // Endpoint to handle file upload and analysis
  app.post(api.chat.upload.path, upload.single('file'), async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ message: "No file uploaded" });
      }

      const fileContent = req.file.buffer.toString('utf-8');
      const filename = req.file.originalname;

      // Analyze the chat content
      const metrics = await analyzeChat(fileContent);

      // Store the session
      const session = await storage.createSession({
        filename,
        metrics
      });

      res.status(200).json({
        sessionId: session.id,
        metrics
      });
    } catch (err: any) {
      console.error("Analysis error:", err);
      res.status(500).json({
        message: err.message || "Failed to analyze chat file",
      });
    }
  });

  // Endpoint to get a specific session
  app.get(api.sessions.get.path, async (req, res) => {
    try {
      const sessionId = parseInt(req.params.id);
      if (isNaN(sessionId)) {
        return res.status(400).json({ message: "Invalid session ID" });
      }

      const session = await storage.getSession(sessionId);
      if (!session) {
        return res.status(404).json({ message: "Session not found" });
      }

      res.status(200).json({
        session: {
          id: session.id,
          filename: session.filename,
          createdAt: session.createdAt
        },
        metrics: session.metrics
      });
    } catch (err: any) {
      res.status(500).json({ message: "Failed to retrieve session" });
    }
  });

  // Endpoint to list recent sessions
  app.get(api.sessions.list.path, async (req, res) => {
    try {
      const sessions = await storage.getRecentSessions();
      res.status(200).json(sessions);
    } catch (err: any) {
      res.status(500).json({ message: "Failed to list sessions" });
    }
  });

  return httpServer;
}
