import cors from "cors";
import express, { text } from "express";
import Anthropic from "@anthropic-ai/sdk";
import { prisma } from "db/client";
import { systemPrompt } from "./systemPrompt";
import { ArtifactProcessor } from "./parser";
import { onShellCommand , onFileUpdate } from "./os";

const app = express();
app.use(cors())
app.use(express.json())


app.post("/prompt", async (req,res)=>{
    const { prompt , projectId } = req.body;
    const client = new Anthropic();
    
    await prisma.prompt.create({
        data:{
            content:prompt,
            projectId,
            type:"USER"
        }
    })

    const allPrompts = await prisma.prompt.findMany({
        where:{
            projectId
        },
        orderBy:{
            createdAt:"asc"
        }
    });

    let artifactProcessor = new ArtifactProcessor("", onFileUpdate, onShellCommand);
    let artifact = "";


    let response = client.messages.stream({
        messages : allPrompts.map((p:any)=>({
            role: p.type === "USER" ? "user" : "assistant",
            content :    p.content,
        })),
        system:systemPrompt,
        model:"claude-3-7-sonnet-20250219",
        max_tokens:8000,
    }).on('text',(text)=>{
        artifactProcessor.append(text);
        artifactProcessor.parse();
        artifact+=text
    }).on("finalMessage",async(message)=>{
        console.log(`Done ${message}`);
        await prisma.prompt.create({
            data:{
                content:artifact,
                projectId,
                type:"SYSTEM"
            }
        })
    }).on("error",(error)=>{
        console.error("error",error);
    })
    res.json({response})
})

app.listen(9091, ()=>{
    console.log("Worker running on PORT 9091")
})