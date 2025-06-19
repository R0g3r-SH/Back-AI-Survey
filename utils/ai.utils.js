import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY2,
  timeout: 10000, // 10 seconds
  maxRetries: 3, // Retry up to 3 times on failure
  retryDelay: 1000, // Wait 1 second before retrying
  requestTimeout: 5000, // 5 seconds for each request
  responseTimeout: 5000, // 5 seconds for each response
  responseFormat: "json", // Expect JSON responses
});

export const generateAIResponse = async (prompt) => {
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [{ role: "user", content: prompt }],
      max_tokens: 150, // Adjust based on your needs
      temperature: 0.7, // Adjust for creativity
    });

    return response.choices[0].message.content;
  } catch (error) {
    console.error("Error generating AI response:", error);
    throw new Error("Failed to generate AI response");
  }
};

//dashboard data section 1

// Alternative version with proper function calling
export const calculatePotentialAutomation = async (data) => {

    console.log("Calculating potential automation for data:", data);

    const prompt = `Analyze this data and determine the automation potential: ${JSON.stringify(data)}`;
  
    try {
      const response = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: [
          {
            role: "system",
            content: "You are an expert in process automation analysis.",
          },
          { role: "user", content: prompt },
        ],
        temperature: 0,
        tools: [{
          type: "function",
          function: {
            name: "calculate_automation_potential",
            description: "Calculate the automation potential of a process",
            parameters: {
              type: "object",
              properties: {
                score: {
                  type: "number",
                  description: "Automation potential score (0-100)",
                },
              },
              required: ["score"]
            }
          }
        }],
        tool_choice: {
          type: "function",
          function: { name: "calculate_automation_potential" }
        }
      });
  
      const toolCall = response.choices[0].message.tool_calls[0];
      const args = JSON.parse(toolCall.function.arguments);
      const potentialAutomation = args.score;
  
      if (potentialAutomation < 0 || potentialAutomation > 100) {
        throw new Error("Invalid automation potential value");
      }
      console.log("Calculated automation potential:", potentialAutomation);
      return potentialAutomation;
    } catch (error) {
      console.error("Error:", error);
      throw new Error("Failed to calculate automation potential");
    }
  };