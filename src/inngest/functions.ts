
import { inngest } from "./client";
import { Agent, openai, createAgent, createTool, createNetwork, Message, createState } from "@inngest/agent-kit";
import { getAssessmentData, generateFitnessPlan } from "./utils";
import z from "zod";
import { FITNESS_ASSESSMENT_PROMPT, PLAN_GENERATION_PROMPT } from "@/prompt";
import { PrismaClient } from "../generated/prisma";
import OpenAI from "openai";
import { generateMealWithAI, generateWorkoutWithAI } from "./ai-generation";




