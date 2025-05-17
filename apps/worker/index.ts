import cors from "cors";
import express from "express";
import Anthropic from "@anthropic-ai/sdk";
import { prisma } from "db/client";
import { systemPrompt } from "./systemPrompt";
import { ArtifactProcessor } from "./parser";
import { onShellCommand, onFileUpdate } from "./os";

const app = express();

// Make sure body parsing middleware is correctly configured
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true }));

// Add debugging middleware
app.use((req, res, next) => {
  console.log('Request received:', req.method, req.path);
  console.log('Request headers:', req.headers);
  console.log('Request body type:', typeof req.body);
  console.log('Request body:', JSON.stringify(req.body, null, 2));
  next();
});

app.post("/prompt", async (req, res) => {
  try {
    console.log("Processing prompt request");
    
    // Check if body exists and has the expected properties
    if (!req.body) {
      res.status(400).json({ error: "Request body is missing" });
      return;
    }
    
    // Get prompt and projectId safely, without destructuring
    const prompt = req.body.prompt;
    const projectId = req.body.projectId;
    
    if (!prompt) {
      res.status(400).json({ error: "Prompt is required" });
      return;
    }
    
    if (!projectId) {
      res.status(400).json({ error: "ProjectId is required" });
      return;
    }
    
    console.log(`Received prompt for project ${projectId}`);
    
    const client = new Anthropic();
    
    await prisma.prompt.create({
      data: {
        content: prompt,
        projectId,
        type: "USER"
      }
    });
    
    const allPrompts = await prisma.prompt.findMany({
      where: {
        projectId
      },
      orderBy: {
        createdAt: "asc"
      }
    });
    
    console.log(`Found ${allPrompts.length} prompts for project ${projectId}`);
    
    let artifactProcessor = new ArtifactProcessor("", onFileUpdate, onShellCommand);
    let artifact = "";
    
    // Send initial response
    res.json({ status: "processing started" });
    
    console.log("Starting Anthropic client stream");
    
    // Create message array correctly
    const messages = [];
    for (const p of allPrompts) {
      messages.push({
        role: p.type === "USER" ? "user" : "assistant",
        content: p.content
      });
    }
    
    const stream = await client.messages.stream({
        messages: allPrompts.map(p => ({
            role: p.type === "USER" ? "user" : "assistant",
            content: p.content,
        })),
      system: systemPrompt,
      model: "claude-3-7-sonnet-20250219",
      max_tokens: 8000,
    });
    
    stream.on('text', text => {
      artifactProcessor.append(text);
      artifactProcessor.parse();
      artifact += text;
    });
    
    stream.on("finalMessage", async message => {
      console.log(`Done ${message}`);
      await prisma.prompt.create({
        data: {
          content: artifact,
          projectId,
          type: "SYSTEM"
        }
      });
    });
    
    stream.on("error", error => {
      console.error("Stream error:", error);
    });
    
  } catch (error) {
    console.error("Error processing request:", error);
    // Only send error response if headers haven't been sent yet
    if (!res.headersSent) {
      res.status(500).json({ error: "An error occurred processing your request" });
    }
  }
});

app.listen(9091, () => {
  console.log("Worker running on PORT 9091");
});