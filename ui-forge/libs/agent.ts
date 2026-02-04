import { HfInference } from "@huggingface/inference";
import { StateGraph, END, Annotation } from "@langchain/langgraph";
import { BaseMessage } from "@langchain/core/messages";

// --- 1. SETUP ---
const getClient = () => {
  const token = process.env.HF_TOKEN;
  if (!token) throw new Error("❌ MISSING HF_TOKEN in .env file");
  return new HfInference(token);
};

// Use the 72B model if you have Pro, otherwise stick to 7B or 72B-Int4
const MODEL_ID = "Qwen/Qwen2.5-VL-7B-Instruct"; 

// --- 2. STATE ---
const AgentState = Annotation.Root({
  messages: Annotation<BaseMessage[]>({ reducer: (x, y) => x.concat(y), default: () => [] }),
  userRequest: Annotation<string>({ reducer: (x, y) => y ?? x, default: () => "" }),
  imageUrl: Annotation<string | undefined>({ reducer: (x, y) => y ?? x, default: () => undefined }),
  currentCode: Annotation<string | undefined>({ reducer: (x, y) => y ?? x, default: () => undefined }),
  plan: Annotation<string>({ reducer: (x, y) => y ?? x, default: () => "" }),
  finalCode: Annotation<string>({ reducer: (x, y) => y ?? x, default: () => "" }),
  reply: Annotation<string>({ reducer: (x, y) => y ?? x, default: () => "" }),
});

// --- 3. PLANNER NODE (The "Eye") ---
async function plannerNode(state: typeof AgentState.State) {
  const { userRequest, imageUrl, currentCode } = state;
  const client = getClient();

  console.log("🧠 PLANNER: Extracting design system...");

  const systemPrompt = `You are a Lead UI/UX Designer.
  Analyze the user's request and the provided image (if any) to create a strict implementation plan.
  
  YOUR GOAL:
  Extract the exact visual style for the developer.
  
  OUTPUT FORMAT:
  1. **Color Palette**: Extract specific Hex codes from the image (e.g., Background: #0f172a, Accent: #3b82f6).
  2. **Typography**: Guess the font family (sans-serif, serif, mono) and weights.
  3. **Layout Structure**: Flexbox vs Grid strategies.
  4. **Component Breakdown**: List every button, card, and input field required.
  5. **Interactive Elements**: What should happen when clicking buttons? (e.g., "Mobile menu toggle").
  
  CONTEXT:
  - User Request: "${userRequest}"
  - Code Status: ${currentCode ? "Refactoring existing code" : "New Build"}
  `;

  const messages: any[] = [{ role: "user", content: [{ type: "text", text: systemPrompt }] }];

  if (imageUrl) {
    messages[0].content.push({ type: "image_url", image_url: { url: imageUrl } });
  }

  const response = await client.chatCompletion({
    model: MODEL_ID,
    messages: messages,
    max_tokens: 8192, // Enough for a detailed plan
    temperature: 0.2, // Slightly creative to infer missing details
  });

  return { plan: response.choices[0].message.content || "" };
}

// --- 4. CODER NODE (The "Hands") ---
async function coderNode(state: typeof AgentState.State) {
  const { plan, currentCode } = state;
  const client = getClient();

  console.log("👨‍💻 CODER: Writing Pixel-Perfect HTML...");

  const systemPrompt = `You are a World-Class Frontend Engineer specialized in Tailwind CSS.
  Your goal is PIXEL-PERFECT replication of the design plan.
  
  DESIGN PLAN:
  ${plan}
  
  STRICT RULES:
  1. **Exact Colors**: Use Tailwind ARBITRARY values for specific colors found in the plan (e.g., use 'bg-[#1e293b]' NOT 'bg-slate-800').
  2. **Google Fonts**: Always include 'Inter' or 'Poppins' via Google Fonts link.
  3. **Icons**: Use FontAwesome 6 (CDN Provided below).
  4. **Layout**: Use 'flex', 'grid', 'min-h-screen', 'w-full'. Ensure the page looks good on mobile.
  5. **No Placeholders**: Do not use "Lorem Ipsum". Use realistic text relevant to the UI context.
  6. **Single File**: Output valid HTML5 with embedded CSS (<style>) and JS (<script>).
  
  REQUIRED HEAD SECTION:
  <script src="https://cdn.tailwindcss.com"></script>
  <link href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css" rel="stylesheet">
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap" rel="stylesheet">
  <script>
    tailwind.config = {
      theme: {
        extend: {
          fontFamily: {
            sans: ['Inter', 'sans-serif'],
          }
        }
      }
    }
  </script>

  OUTPUT FORMAT:
  Return ONLY the raw HTML code. Start immediately with <!DOCTYPE html>.
  `;

  const response = await client.chatCompletion({
    model: MODEL_ID,
    messages: [
      { role: "system", content: systemPrompt },
      { role: "user", content: "Generate the code now." }
    ],
    max_tokens: 8192, // INCREASED: Prevents code cutoff for complex UIs
    temperature: 0.1, // LOW: Forces strict adherence to the plan
    repetition_penalty: 1.05,
  });

  let cleanCode = response.choices[0].message.content || "";
  cleanCode = cleanCode.replace(/```html|```/g, "").trim();

  return { finalCode: cleanCode };
}

// --- 5. REVIEWER NODE (The "Quality Control") ---
async function reviewerNode(state: typeof AgentState.State) {
  const { finalCode } = state;
  const client = getClient();

  console.log("🕵️ REVIEWER: Polishing...");
  
  if (!finalCode || finalCode.length < 50) return { finalCode };

  const systemPrompt = `You are a QA Automation Bot.
  Review the provided HTML code for critical errors.
  
  CHECKLIST:
  1. Are all tags closed? (</div>, </script>)
  2. Is the Tailwind script present?
  3. Is the FontAwesome link present?
  4. **Responsiveness**: Does the main container have reasonable padding (e.g., p-4 or max-w-7xl)?
  5. **Images**: If <img> tags exist, ensure they have 'src' attributes (use 'https://placehold.co/600x400' as fallback if empty).
  
  INPUT CODE:
  ${finalCode.slice(0, 15000)} // Pass snippet if too large, or full if fits
  
  OUTPUT:
  Return the FIXED, READY-TO-RUN HTML code only.
  `;

  const response = await client.chatCompletion({
    model: MODEL_ID,
    messages: [
      { role: "system", content: systemPrompt },
      { role: "user", content: "Fix any issues and output final HTML." }
    ],
    max_tokens: 8192,
    temperature: 0.1,
  });

  let fixedCode = response.choices[0].message.content || "";
  fixedCode = fixedCode.replace(/```html|```/g, "").trim();

  return { finalCode: fixedCode };
}

// --- 6. NEW: RESPONDER NODE (The "Voice") ---
async function responderNode(state: typeof AgentState.State) {
  const { userRequest, plan } = state;
  const client = getClient();

  console.log("💬 RESPONDER: Generating conversational reply...");

  const systemPrompt = `You are a helpful AI coding assistant named "UI Forge".
  The user asked: "${userRequest}".
  You have just executed this plan: 
  ${plan.slice(0, 500)}...

  TASK:
  Write a short, friendly, professional 1-sentence response to the user confirming the changes.
  
  Examples:
  - "I've implemented the dashboard layout with the dark mode colors you requested."
  - "I've fixed the alignment issues in the navbar."
  
  OUTPUT:
  Return ONLY the message string.`;

  const response = await client.chatCompletion({
    model: MODEL_ID,
    messages: [
      { role: "system", content: systemPrompt },
      { role: "user", content: "Write the reply." }
    ],
    max_tokens: 200,
    temperature: 0.7, // Higher temp for more natural conversation
  });

  return { reply: response.choices[0].message.content || "Code generated successfully." };
}

// --- 6. BUILD GRAPH ---
const workflow = new StateGraph(AgentState)
  .addNode("planner", plannerNode)
  .addNode("coder", coderNode)
  .addNode("reviewer", reviewerNode)
  .addNode("responder", responderNode)
  .addEdge("__start__", "planner")
  .addEdge("planner", "coder")
  .addEdge("coder", "reviewer")
  .addEdge("reviewer", "responder")   
  .addEdge("responder", END);

export const agent = workflow.compile();