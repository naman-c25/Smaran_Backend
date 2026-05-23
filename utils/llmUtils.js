const Groq = require('groq-sdk');

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

/**
 * Generate an answer based on query and matched memories
 */
async function generateAnswer(query, memories) {
  try {
    const systemPrompt = `You are Smaran, a personal memory assistant.
Answer the user's question using ONLY the memories provided below.
Be specific — mention dates, people, and details from the memories.
If the answer isn't in the memories, say "Mujhe is baare mein koi memory nahi mili."
Never make up information not present in the memories.
Respond in the same language the user asked in (Hindi/Hinglish/English).
Keep the answer conversational and natural, not like a list.`;

    const memoriesText = memories
      .map(m => `[${m.date_label || m.recorded_at}] ${m.raw_text}`)
      .join('\n\n');

    const userMessage = `User question: "${query}"

Relevant memories:
${memoriesText}`;

    const response = await groq.chat.completions.create({
      model: 'llama-3.3-70b-versatile',
      messages: [
        {
          role: 'system',
          content: systemPrompt
        },
        {
          role: 'user',
          content: userMessage
        }
      ],
      temperature: 0.7
    });

    const answer = response.choices[0].message.content;
    return answer;
  } catch (err) {
    console.error('Error generating answer:', err);
    throw err;
  }
}

module.exports = {
  generateAnswer
};
