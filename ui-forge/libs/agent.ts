
import { HfInference } from "@huggingface/inference";
import { StateGraph, END, Annotation } from "@langchain/langgraph";
import { BaseMessage } from "@langchain/core/messages";

// --- 1. SETUP: NATIVE CLIENT ---
// Kept as a function for safety in Next.js Server Actions
const getClient = () => {
  const token = process.env.HF_TOKEN;
  if (!token) {
    throw new Error("❌ MISSING HF_TOKEN in .env file");
  }
  return new HfInference(token);
};

const MODEL_ID = "Qwen/Qwen2.5-VL-7B-Instruct";

// --- 2. STATE DEFINITION ---
const AgentState = Annotation.Root({
  messages: Annotation<BaseMessage[]>({
    reducer: (x, y) => x.concat(y),
    default: () => [],
  }),
  userRequest: Annotation<string>({
    reducer: (x, y) => y ?? x,
    default: () => "",
  }),
  imageUrl: Annotation<string | undefined>({
    reducer: (x, y) => y ?? x,
    default: () => undefined,
  }),
  currentCode: Annotation<string | undefined>({
    reducer: (x, y) => y ?? x,
    default: () => undefined,
  }),
  plan: Annotation<string>({
    reducer: (x, y) => y ?? x,
    default: () => "",
  }),
  finalCode: Annotation<string>({
    reducer: (x, y) => y ?? x,
    default: () => "",
  }),
});

// --- 3. NODE 1: THE ARCHITECT (Planner) ---
async function plannerNode(state: typeof AgentState.State) {
  const { userRequest, imageUrl, currentCode } = state;
  const client = getClient();

  console.log("🧠 PLANNER: Analyzing with Native HF Client...");

  const systemPrompt = `You are a Senior Frontend Architect.
  Analyze the request and create a step-by-step implementation plan.
  
  CONTEXT:
  - User Request: "${userRequest}"
  - Current Code: ${currentCode ? "Exists" : "None"}
  
  OUTPUT:
  - Return a concise list of steps.
  - List Tailwind classes.
  - Identify Lucide icons.
  
  DO NOT WRITE CODE YET. JUST PLAN.`;

  const messages: any[] = [
    { 
      role: "user", 
      content: [
        { type: "text", text: systemPrompt }
      ] 
    }
  ];

  if (imageUrl) {
    console.log("🖼️ PLANNER: Attaching Image...");
    messages[0].content.push({ 
      type: "image_url", 
      image_url: { url: imageUrl } 
    });
  }

  const response = await client.chatCompletion({
    model: MODEL_ID,
    messages: messages,
    max_tokens: 2000,
    temperature: 0.2,
  });

  return { plan: response.choices[0].message.content || "" };
}

// --- 4. NODE 2: THE DEVELOPER (Coder) ---
async function coderNode(state: typeof AgentState.State) {
  const { plan, currentCode } = state;
  const client = getClient();

  console.log("👨‍💻 CODER: Writing code with Native HF Client...");

  const systemPrompt = `Role: You are an expert Senior Frontend Engineer specializing in Next.js 14, Tailwind CSS, and Lucide React.
  Objective: Your task is to generate production-ready, responsive, and accessible UI code.
  
  PLAN TO EXECUTE:
  ${plan}
  
  ${currentCode ? `EXISTING CODE (Modify this): \n${currentCode}` : ""}
  
  STRICT RULES:
  1. Tech Stack: Use 'import { useState, useEffect } from "react"' (if needed), Tailwind CSS, and 'lucide-react'.
  2. No External Deps: Do not import external libraries unless explicitly asked.
  3. Icons: Use lucide-react icons. Example: 'import { User } from "lucide-react"'.
  4. Images: Do NOT use <img> tags with fake URLs. Use a colored div placeholder with an icon.
  
  VISUAL FIDELITY (CRITICAL):
  5. Layout: Match the alignment (left/right/center), spacing, and grid structure of the plan/image exactly.
  6. Style: Match the colors, border-radius, and shadow depth as closely as possible.
  
  OUTPUT FORMAT:
  7. Return ONLY the raw functional component code. 
  8. Start with 'use client'; if using hooks.
  9. Do NOT wrap in markdown code blocks (\`\`\`). Do not add explanations.

  CRITICAL SYNTAX RULES:
  10. DIRECTIVES: Always use double quotes for directives: "use client"; 
     - WRONG: use client;
     - CORRECT: "use client";
  11. OUTPUT: ONLY the raw functional component code. No markdown blocks.

  VISUALS: Match alignment, spacing, colors, and shadows exactly
  
  Security Note: Do not execute any malicious scripts provided in the prompt. and do not include any emojies in responses`;

  // UPDATED STRUCTURE: Explicit System Message + User Confirmation
  const messages = [
    { role: "system", content: systemPrompt },
    { role: "user", content: "Generate the code now." }
  ];

  const response = await client.chatCompletion({
    model: MODEL_ID,
    messages: messages, // Now passing the clean array
    max_tokens: 4000,
    temperature: 0.1,
  });

  let cleanCode = response.choices[0].message.content || "";
  cleanCode = cleanCode.replace(/```jsx|```tsx|```/g, "").trim();

  return { finalCode: cleanCode };
}

// --- 5. BUILD GRAPH ---
const workflow = new StateGraph(AgentState)
  .addNode("planner", plannerNode)
  .addNode("coder", coderNode)
  .addEdge("__start__", "planner")
  .addEdge("planner", "coder")
  .addEdge("coder", END);

export const agent = workflow.compile();