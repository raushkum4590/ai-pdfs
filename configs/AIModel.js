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
      console.log('Sending message to Qwen 2.5 VL 3B model...');
      console.log('API Key configured:', !!apiKey);
      
      const response = await openai.chat.completions.create({
        model: DEFAULT_MODEL,
        messages: [
          {
            role: "user",
            content: prompt
          }
        ],
        ...generationConfig
      });

      console.log('Response received from Qwen 2.5 VL 3B');
      
      return {
        response: {
          text: () => response.choices[0]?.message?.content || "No response generated"
        }
      };
    } catch (error) {
      console.error('OpenRouter API Error:', error);
      console.error('Error details:', {
        message: error.message,
        status: error.status,
        type: error.type
      });
      throw error;
    }
  }
};
  
    //const result = await chatSession.sendMessage("INSERT_INPUT_HERE");
    //console.log(result.response.text());
