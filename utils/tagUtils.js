const Groq = require('groq-sdk');

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

/**
 * Generate tags from transcription text using LLM
 * Returns: { people, topics, mood, date_ref, location }
 */
async function generateTags(text) {
  try {
    const systemPrompt = `You are a memory tagging system. Given a conversation or note, extract structured tags. Always respond in JSON only, no explanation.

Extract:
- people: names of people mentioned
- topics: main subjects (farewell, hackathon, doctor, project, etc.)
- mood: emotional tone (excited, stressed, happy, neutral, sad, angry)
- date_ref: any date references mentioned ("aaj", "kal", "Monday", etc.)
- location: any place mentioned if clear

Rules:
- Keep tags lowercase, single words or short phrases
- Maximum 5 tags per category
- If nothing fits a category, return empty array
- Be consistent — "farewell party" should always be "farewell", not "party" or "farewell party"`;

    const response = await groq.chat.completions.create({
      model: 'llama-3.3-70b-versatile',
      messages: [
        {
          role: 'system',
          content: systemPrompt
        },
        {
          role: 'user',
          content: `Input: "${text}"`
        }
      ],
      temperature: 0.3
    });

    const rawContent = response.choices[0].message.content;
    // Remove markdown code blocks if present
    const cleaned = rawContent.replace(/```json|```/g, '').trim();
    const tags = JSON.parse(cleaned);

    // Ensure all fields exist and are arrays
    return {
      people: Array.isArray(tags.people) ? tags.people : [],
      topics: Array.isArray(tags.topics) ? tags.topics : [],
      mood: Array.isArray(tags.mood) ? tags.mood : [],
      date_ref: Array.isArray(tags.date_ref) ? tags.date_ref : [],
      location: Array.isArray(tags.location) ? tags.location : []
    };
  } catch (err) {
    console.error('Error generating tags:', err);
    throw err;
  }
}

/**
 * Resolve date references to DD-MM-YYYY format
 */
function resolveDateReferences(dateRefs) {
  const today = new Date();
  
  const dateMap = {};
  const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  
  dateRefs.forEach(ref => {
    const lower = ref.toLowerCase().trim();
    let date = null;

    if (lower === 'aaj') {
      date = new Date(today);
    } else if (lower === 'kal' || lower === 'kaal') {
      date = new Date(today);
      date.setDate(date.getDate() - 1);
    } else if (lower === 'kal' || lower === 'next day') {
      date = new Date(today);
      date.setDate(date.getDate() + 1);
    } else {
      // Check if it's a day name
      const dayIndex = dayNames.findIndex(d => d.toLowerCase() === lower);
      if (dayIndex !== -1) {
        date = new Date(today);
        const currentDay = date.getDay();
        const daysBack = (currentDay - dayIndex + 7) % 7 || 7;
        date.setDate(date.getDate() - daysBack);
      } else if (lower === 'yesterday') {
        date = new Date(today);
        date.setDate(date.getDate() - 1);
      } else if (lower === 'today') {
        date = new Date(today);
      } else if (lower === 'tomorrow') {
        date = new Date(today);
        date.setDate(date.getDate() + 1);
      }
    }

    if (date) {
      const day = String(date.getDate()).padStart(2, '0');
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const year = date.getFullYear();
      dateMap[ref] = `${day}-${month}-${year}`;
    }
  });

  return dateMap;
}

/**
 * Get the primary date label from date references
 * Returns first resolved date or today's date in DD-MM-YYYY format
 */
function getPrimaryDateLabel(dateRefs) {
  if (!dateRefs || dateRefs.length === 0) {
    const today = new Date();
    const day = String(today.getDate()).padStart(2, '0');
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const year = today.getFullYear();
    return `${day}-${month}-${year}`;
  }

  const dateMap = resolveDateReferences(dateRefs);
  const firstRef = dateRefs[0];
  return dateMap[firstRef] || null;
}

module.exports = {
  generateTags,
  resolveDateReferences,
  getPrimaryDateLabel
};
