import OpenAI from 'openai';

const apiKey = process.env.NEXT_PUBLIC_OPEN_ROUTER_API_KEY;

if (!apiKey) {
  console.error('OpenRouter API key is not configured. Please set NEXT_PUBLIC_OPEN_ROUTER_API_KEY in your .env.local file');
  console.log('Current environment variables:', Object.keys(process.env).filter(key => key.includes('OPEN_ROUTER')));
}

const openai = new OpenAI({
  baseURL: "https://openrouter.ai/api/v1",
  apiKey: apiKey,
  dangerouslyAllowBrowser: true // Required for client-side usage
});

export const generationConfig = {
  temperature: 0.3, // Lower temperature for faster, more focused responses
  max_tokens: 4096, // Reduced for faster generation
  top_p: 0.9,
};

// Available OpenRouter models - you can choose from these
const MODELS = {
  QWEN_VL_3B: "qwen/qwen2.5-vl-3b-instruct:free",
  DEEPSEEK_R1: "deepseek/deepseek-r1-0528:free",
  CLAUDE_SONNET: "anthropic/claude-3.5-sonnet",
  CLAUDE_HAIKU: "anthropic/claude-3-haiku",
  GPT4_TURBO: "openai/gpt-4-turbo",
  GPT4_MINI: "openai/gpt-4o-mini",
  LLAMA_3_70B: "meta-llama/llama-3-70b-instruct",
  GEMINI_PRO: "google/gemini-pro-1.5",
  QWEN_72B: "qwen/qwen-2-72b-instruct"
};

// Use Qwen 2.5 VL 3B free model as default (very fast and free)
const DEFAULT_MODEL = MODELS.QWEN_VL_3B;

export const chatSession = {
  sendMessage: async (prompt) => {
    try {
      console.log('Sending message to AI model...');
      console.log('API Key configured:', !!apiKey);
      
      // Handle empty prompts gracefully
      if (!prompt || prompt.trim() === '') {
        console.warn('Empty prompt received');
        return {
          response: {
            text: () => "I received an empty prompt. Please provide some content to analyze."
          }
        };
      }

      // Check if prompt is too large and trim it if necessary
      const MAX_PROMPT_LENGTH = 32000; // Model context limit
      let trimmedPrompt = prompt;
      if (prompt.length > MAX_PROMPT_LENGTH) {
        console.warn(`Prompt too large (${prompt.length} chars), trimming to ${MAX_PROMPT_LENGTH}`);
        trimmedPrompt = prompt.substring(0, MAX_PROMPT_LENGTH);
      }
      
      // Add timeout handling
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Request timed out after 30 seconds')), 30000)
      );
      
      const responsePromise = openai.chat.completions.create({
        model: DEFAULT_MODEL,
        messages: [
          {
            role: "user",
            content: trimmedPrompt
          }
        ],
        ...generationConfig
      });
      
      const response = await Promise.race([responsePromise, timeoutPromise]);

      console.log('Response received from model:', response.model);
      console.log('Response tokens:', response.usage?.total_tokens || 'unknown');
      
      return {
        response: {
          text: () => response.choices[0]?.message?.content || "No response generated"
        }
      };
    } catch (error) {
      console.error('AI Model API Error:', error);
      console.error('Error details:', {
        message: error.message,
        status: error.status,
        type: error.type
      });
      
      // More graceful error handling with specific messages
      if (error.message?.includes('timeout')) {
        throw new Error('The AI service took too long to respond. Please try a shorter query or try again later.');
      } else if (error.status === 401 || error.message?.includes('API key')) {
        throw new Error('Authentication error with the AI service. Please check your API key configuration.');
      } else if (error.status === 429) {
        throw new Error('Rate limit exceeded. Please wait a moment before trying again.');
      } else {
        throw error;
      }
    }
  }
};
  
    //const result = await chatSession.sendMessage("INSERT_INPUT_HERE");
    //console.log(result.response.text());
