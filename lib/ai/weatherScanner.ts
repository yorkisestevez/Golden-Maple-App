
export interface WeatherRisk {
  hasRisk: boolean;
  summary: string;
  recommendedAction: string;
  affectedDays: string[];
}

export const scanWeatherRisk = async (address: string, startDate: string): Promise<WeatherRisk | null> => {
  const prompt = `
    Check the 7-day weather forecast for ${address} starting from ${startDate}.
    Determine if there are any significant weather events (Heavy rain, thunderstorms, extreme heat >35C, or frost) that would stop landscaping/hardscape work.
    
    Return a JSON object with:
    - hasRisk: boolean
    - summary: string (concise)
    - recommendedAction: string (e.g., "Delay excavation", "Cover open base")
    - affectedDays: string[] (dates)
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
    console.error("Weather Scan Error:", error);
    return null;
  }
};
