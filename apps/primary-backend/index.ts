import { prisma } from "db/client";
import express from "express";
import cors from "cors";
import { authMiddleware } from "./middleware";

const app = express();
app.use(express.json());
app.use(cors())

app.post("/project",authMiddleware, async (req,res)=>{
    const { prompt } = req.body;
    const userId = String(req.userId!);
    //TODO:add logic to get a useful name to the project to show it to the user
    const description = prompt.split("/n")[0];
    const project = await prisma.project.create({
        data : {
            description,
            userId
        }
    })
    res.json({
        projectId:project.id
    })
})


app.get("/projects",authMiddleware , async(req,res)=>{
    const userId = String(req.userId!);

    const project = await prisma.project.findMany({
        where : { userId }
    })

    res.json(project);
})


app.listen(9090, ()=>{
    console.log("primary-backend running on port 9090");
})