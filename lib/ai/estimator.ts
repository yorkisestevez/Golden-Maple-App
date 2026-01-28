
export const analyzeProjectForEstimation = async (context: {
  projectType: string;
  notes: string;
  address: string;
}) => {
  const prompt = `
    Analyze this landscaping project and provide a detailed estimate structure.
    Project: ${context.projectType} at ${context.address}
    Site Notes: ${context.notes}

    Provide suggested quantities and production blocks for:
    1. Mobilization
    2. Demolition/Excavation (calculate estimated cubic yards if dimensions provided)
    3. Base Aggregates
    4. Primary Installation
    5. Finishing/Cleanup

    Return the data in a structured format suitable for a professional contractor.
  `;

  try {
    const response = await fetch("/.netlify/functions/gemini", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ prompt }),
    });

    if (!response.ok) {
      throw new Error(`Gemini request failed: ${response.status}`);
    }

    const data = await response.json();
    return JSON.parse(data.text);
  } catch (error) {
    console.error("AI Estimation Error:", error);
    return null;
  }
};
