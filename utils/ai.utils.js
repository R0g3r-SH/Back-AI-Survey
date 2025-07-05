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

// Function to generate AI response based on a prompt
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

// Alternative version with proper function calling
export const calculatePotentialAutomation = async (data) => {
  console.log("Calculating potential automation for data:", data);

  const prompt = `Analyze this data and determine the automation potential: ${JSON.stringify(
    data
  )}`;

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
      tools: [
        {
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
              required: ["score"],
            },
          },
        },
      ],
      tool_choice: {
        type: "function",
        function: { name: "calculate_automation_potential" },
      },
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

//Get the type of task based on the description
export const getTaskType = async (taskDescription) => {
  console.log("Getting task type for description:", taskDescription);

  const prompt = ` Classify the following task description into one of the following types: documentation, communication, analysis, creativity, management, reports. Task description: "${taskDescription}"`;

  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.2, // Slightly higher for slight variability
      tools: [
        {
          type: "function",
          function: {
            name: "clasificar_tipo_tarea",
            description: "Classify the type of task based on its description",
            parameters: {
              type: "object",
              properties: {
                tipoTarea: {
                  type: "string",
                  description: "The type of task based on the description",
                  enum: [
                    "documentation",
                    "communication",
                    "analysis",
                    "creativity",
                    "management",
                    "reports",
                  ],
                },
              },
              required: ["tipoTarea"],
            },
          },
        },
      ],
      tool_choice: {
        type: "function",
        function: { name: "clasificar_tipo_tarea" },
      },
    });

    const toolCall = response.choices[0].message.tool_calls[0];
    const args = JSON.parse(toolCall.function.arguments);
    const taskType = args.tipoTarea;

    return taskType;
  } catch (error) {
    console.error("Error getting task type:", error);
    throw new Error("Failed to determine task type");
  }
};

export const genrateAIReport = async (data) => {
  console.log("Generating AI report");
  const prompt = `You are an AI analyst. Analyze the following company data and generate:

  1. Two key insights based on the data.
  2. The expected impact of acting on these insights.
  3. A main recommendation based on potential ROI and implementation feasibility.
  
  Format your response clearly and concisely.
  Respond in Latin American Spanish(Mexico).
  **Example**  
  Main Recommendation:  
  Prioritize the clusters "Data Analysts" and "Content Creators" due to their high ROI and low implementation complexity.
  
  Data: ${JSON.stringify(data)}`;

  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content:
            "You are an expert in business process analysis and automation.",
        },
        { role: "user", content: prompt },
      ],
      temperature: 0.6, // Lower temperature for more focused responses
      tools: [
        {
          type: "function",
          function: {
            name: "generate_ai_report",
            description: "Generate a report based on the provided data",
            parameters: {
              type: "object",
              properties: {
                main_recommendation: {
                  type: "string",
                  description: "Main recommendation based on the analysis short and clear",
                },
                expected_impact: {
                  type: "string",
                  description: "Expected impact of the recommendation, short and clear",
                },
              },
              required: ["main_recommendation", "expected_impact"],
            },
          },
        },
      ],
      tool_choice: {
        type: "function",
        function: { name: "generate_ai_report" },
      },
    });

    const toolCall = response.choices[0].message.tool_calls[0];
    const args = JSON.parse(toolCall.function.arguments);

    return {
      main_recommendation: args.main_recommendation,
      expected_impact: args.expected_impact,
    };

  } catch (error) {
    console.error("Error:", error);
    throw new Error("Failed to calculate automation potential");
  }
};


export const generateAIRoadMap = async (data) => {

  console.log("Generando hoja de ruta de IA");
  const prompt = `Eres un analista de IA experto en automatización de procesos. Analiza los datos de la siguiente empresa y genera un plan detallado para la automatización de procesos utilizando tecnologías de Google y OpenAI, con un enfoque técnico específico.
  
  Datos proporcionados: ${JSON.stringify(data)}
  
  **Requisitos del roadmap:**
  1. **Estructura por fases:** 
     - 3-4 fases claramente definidas con cronogramas realistas (duración exacta en meses)
     - Cada fase debe tener un progreso inicial (0%), estado ("Pendiente") y presupuesto estimado en MXN.
  
  2. **Contenido técnico detallado por fase:**
     - Objetivos específicos y cuantificables
     - Entregables medibles con KPIs claros
     - Listado EXPLÍCITO de servicios tecnológicos a utilizar, incluyendo:
       * Servicios específicos de Google Cloud (ej: Cloud Functions, Vertex AI, Document AI)
       * Modelos específicos de OpenAI (ej: GPT-4-turbo, Whisper, DALL-E)
       * APIs exactas (ej: Google Natural Language API, OpenAI Assistants API)
     - Justificación técnica para cada selección tecnológica basada en los datos
  
  3. **Elementos adicionales:**
     - Riesgos potenciales y mitigaciones
     - Dependencias técnicas entre fases
     - Requisitos de infraestructura

  Ser muy específico en la selección de tecnologías y servicios, explicando por qué son adecuados para cada fase del roadmap.
  Importante Basar el roadmap en los datos proporcionados, alineado a las tecnologías de Google y OpenAI.
  Ser sumanente especifico en el los servicion tecnológicos a utilizar, incluyendo los modelos de OpenAI y herramientas de Google Cloud.
  Example structure:
  const roadmapPhases = [
    {
      phase: "Phase name",
      duration: "X months",
      progress: 0,
      status: "Pending",
      budget: "$XXX,XXX",
      objectives: [],
      deliverables: [],
      risks: []
    }
  ];
  Contesta en español de México, utilizando un lenguaje técnico preciso y detallado.
  `;


  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: "You are an expert in technical business process analysis and AI automation with Google and OpenAI technologies.",
        },
        { role: "user", content: prompt },
      ],
      temperature: 0.5,
      tools: [
        {
          type: "function",
          function: {
            name: "generate_ai_roadmap",
            description: "Generates a detailed AI implementation roadmap with phases, objectives, and metrics",
            parameters: {
              type: "object",
              properties: {
                roadmap_phases: {
                  type: "array",
                  items: {
                    type: "object",
                    properties: {
                      phase: { type: "string" },
                      duration: { type: "string" },
                      progress: { type: "number" },
                      status: { type: "string" },
                      budget: { type: "string" },
                      objectives: { 
                        type: "array",
                        items: { type: "string" }
                      },
                      deliverables: {
                        type: "array",
                        items: { type: "string" }
                      },
                      risks: {
                        type: "array",
                        items: { type: "string" }
                      }
                    },
                    required: ["phase", "duration", "objectives", "deliverables"]
                  }
                },
           
              },
              required: ["roadmap_phases"]
            }
          }
        }
      ],
      tool_choice: {
        type: "function",
        function: { name: "generate_ai_roadmap" }
      }
    });

    const toolCall = response.choices[0].message.tool_calls[0];
    if (toolCall.function.name === "generate_ai_roadmap") {
      return JSON.parse(toolCall.function.arguments);
    }
    
    throw new Error("No roadmap generated");

  } catch (error) {
    console.error("Error generating AI roadmap:", error);
    throw new Error("Failed to generate AI roadmap");
  }
};


export const generateAITraining = async (data) => {
  console.log("Generating AI training plan");
  
  const systemMessage = {
    role: "system",
    content: `You are an expert in business process analysis and AI automation with Google and OpenAI technologies. 
    Generate comprehensive training programs based on the provided roadmap data, following the exact specified format.`
  };

  const userPrompt = {
    role: "user",
    content: `Analyze the following roadmap data and create a detailed training plan for process automation using Google and OpenAI technologies.
    Maintain the exact same JSON structure as the example provided, including all fields.
    Capacitación especializada en herramientas Google y OpenAI, desde básico hasta avanzado.
    
    Respond in Latin American Spanish(Mexico).
    
    Required Training Program Structure:
    {
      name: "Program name",
      target: "Target audience",
      duration: "Training duration",
      format: "Training format",
      content: ["array", "of", "topics"],
      schedule: "Implementation timeline",
      participants: number,
      costPerParticipant: number,
      totalCost: participants * costPerParticipant
    }

    Roadmap Data: ${JSON.stringify(data, null, 2)}`
  };

  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4-turbo",
      messages: [systemMessage, userPrompt],
      temperature: 0.3, // Lower temperature for more consistent results
      response_format: { type: "json_object" }, // Ensure JSON output
      tools: [
        {
          type: "function",
          function: {
            name: "generate_training_programs",
            description: "Generates a complete AI training plan with multiple programs in specified format",
            parameters: {
              type: "object",
              properties: {
                trainingPrograms: {
                  type: "array",
                  items: {
                    type: "object",
                    properties: {
                      name: { type: "string" },
                      target: { type: "string" },
                      duration: { type: "string" },
                      format: { type: "string" },
                      content: { 
                        type: "array",
                        items: { type: "string" }
                      },
                      schedule: { type: "string" },
                      participants: { type: "number" },
                      costPerParticipant: { type: "number" },
                      totalCost: { type: "number" }
                    },
                    required: [
                      "name", "target", "duration", "format", 
                      "content", "schedule", "participants", 
                      "costPerParticipant", "totalCost"
                    ]
                  }
                }
              },
              required: ["trainingPrograms"]
            }
          }
        }
      ],
      tool_choice: {
        type: "function",
        function: { name: "generate_training_programs" }
      }
    });

    const toolCall = response.choices[0].message.tool_calls[0];
    if (toolCall.function.name === "generate_training_programs") {
      const result = JSON.parse(toolCall.function.arguments);
      // Validate the structure before returning
      if (result.trainingPrograms && Array.isArray(result.trainingPrograms)) {
        return result.trainingPrograms;
      }
    }
    
    throw new Error("Failed to generate valid training programs");

  } catch (error) {
    console.error("Error generating AI training plan:", error);
    throw new Error("Failed to generate AI training plan");
  }
};