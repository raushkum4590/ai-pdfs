export const chatSession = {
  sendMessage: async (prompt) => {
    if (!prompt || prompt.trim() === "") {
      return {
        response: {
          text: () => "I received an empty prompt. Please provide some content to analyze.",
        },
      };
    }

    const res = await fetch("/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ prompt }),
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({ error: "Unknown error" }));
      throw new Error(err.error || `API error ${res.status}`);
    }

    const data = await res.json();
    return {
      response: {
        text: () => data.text || "No response generated",
      },
    };
  },
};
