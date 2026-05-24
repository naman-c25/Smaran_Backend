const { GoogleGenAI } = require('@google/genai');

const ai = new GoogleGenAI({ apiKey: process.env.GOOGLE_API_KEY });

const GENERATE_MODEL = 'gemini-2.5-flash';
const EMBEDDING_MODEL = 'gemini-embedding-2';

/**
 * Extract tags from memory text
 * Model: gemini-2.5-flash
 * Returns: { people, topics, mood, location, summary }
 */
async function extractTags(text) {
  const prompt = `You are a memory tagging system for a personal memory app.
Extract structured information from this memory.
Respond in JSON only. No explanation. No markdown. No code blocks.

Rules:
- Keep all tags lowercase
- People: first names only
- Topics: single words or short phrases max 2 words
- Mood: exactly one of: happy, excited, sad, stressed, angry, neutral, anxious, proud, grateful
- Summary: one line, max 15 words, in same language as input
- Location: place names only
- If nothing fits a category return empty array

Memory: "${text}"

Return exactly this structure:
{
  "people": [],
  "topics": [],
  "mood": "",
  "location": [],
  "summary": ""
}`;

  try {
    const response = await ai.models.generateContent({
      model: GENERATE_MODEL,
      contents: prompt
    });

    const raw = response.text;
    const cleaned = raw.replace(/```json|```/g, '').trim();
    const tags = JSON.parse(cleaned);

    return {
      people: Array.isArray(tags.people) ? tags.people : [],
      topics: Array.isArray(tags.topics) ? tags.topics : [],
      mood: tags.mood || 'neutral',
      location: Array.isArray(tags.location) ? tags.location : [],
      summary: tags.summary || ''
    };
  } catch (err) {
    console.error('Tag extraction error:', err.message);
    return { people: [], topics: [], mood: 'neutral', location: [], summary: '' };
  }
}

/**
 * Generate embedding for text
 * Model: gemini-embedding-2 (3072 dimensions)
 * Returns: array of 3072 numbers
 */
async function generateEmbedding(text) {
  try {
    const response = await ai.models.embedContent({
      model: EMBEDDING_MODEL,
      contents: text
    });

    return response.embeddings[0].values;
  } catch (err) {
    console.error('Embedding error:', err.message);
    throw err;
  }
}

/**
 * Generate final answer from memories
 * Model: gemini-2.5-flash
 * Returns: { answer, mood }
 */
async function generateAnswer(query, memories, connections = []) {
  const memoriesText = memories
    .map(m => `[${m.date_label || m.recorded_at}] ${m.raw_text}\n(mood: ${m.mood}, people: ${(m.people || []).join(', ')})`)
    .join('\n\n');

  const connectionsText = connections.length > 0
    ? `\nPatterns detected across these memories:\n${connections.map(c => `- ${c.pattern}: ${c.insight}`).join('\n')}`
    : '';

  const prompt = `You are Smaran, a deeply personal AI memory assistant.
Answer the user's question using ONLY the memories below.

Rules:
- Be specific — use dates, names, details from memories
- Find patterns and emotional arcs, not just facts
- If memories show a pattern, highlight it
- Never make up anything not in the memories
- If answer not in memories say: "Mujhe is baare mein koi memory nahi mili"
- Respond in same language as the question (Hindi/Hinglish/English)
- Keep response conversational, warm, like a close friend
- Maximum 4-5 sentences
- Do not use bullet points or lists

User question: "${query}"

Relevant memories:
${memoriesText}
${connectionsText}

Return JSON only, no markdown, no code blocks:
{
  "answer": "your full answer here",
  "mood": "one of: happy | sad | excited | stressed | neutral"
}`;

  try {
    const response = await ai.models.generateContent({
      model: GENERATE_MODEL,
      contents: prompt
    });

    const raw = response.text;
    const cleaned = raw.replace(/```json|```/g, '').trim();
    const parsed = JSON.parse(cleaned);

    return {
      answer: parsed.answer || 'Mujhe is baare mein koi memory nahi mili.',
      mood: parsed.mood || 'neutral'
    };
  } catch (err) {
    console.error('Answer generation error:', err.message);
    return {
      answer: 'Kuch gadbad ho gayi, dobara try karo.',
      mood: 'neutral'
    };
  }
}

/**
 * Detect connections between new memory and recent memories
 * Model: gemini-2.5-flash
 * Returns: array of connection objects
 */
async function detectConnections(newMemory, recentMemories) {
  if (!recentMemories || recentMemories.length === 0) return [];

  const prompt = `You are analyzing personal memories for patterns.

New memory: "${newMemory.raw_text}"
New memory tags: people=${(newMemory.people || []).join(', ')}, mood=${newMemory.mood}

Recent memories:
${recentMemories.map(m => `- [${m.date_label}] ${m.summary} (people: ${(m.people || []).join(', ')}, mood: ${m.mood})`).join('\n')}

Find meaningful connections:
1. Same person appearing repeatedly
2. Same topic continuing over time
3. Emotional pattern forming
4. A story arc (conflict to resolution etc)

Return JSON only, no markdown, no code blocks:
{
  "connections": [
    {
      "connected_memory_summary": "",
      "connection_type": "same_person|topic_continuation|emotional_pattern|story_arc",
      "pattern": "one line describing the pattern",
      "insight": "one line insight about what this means"
    }
  ]
}
If no meaningful connections return { "connections": [] }`;

  try {
    const response = await ai.models.generateContent({
      model: GENERATE_MODEL,
      contents: prompt
    });

    const raw = response.text;
    const cleaned = raw.replace(/```json|```/g, '').trim();
    const parsed = JSON.parse(cleaned);
    return parsed.connections || [];
  } catch (err) {
    console.error('Connection detection error:', err.message);
    return [];
  }
}

module.exports = { extractTags, generateEmbedding, generateAnswer, detectConnections };