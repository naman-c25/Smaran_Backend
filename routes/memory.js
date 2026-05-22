const express = require('express');
const router = express.Router();
const pool = require('../db');
const Groq = require('groq-sdk');

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

// POST /memory/save
router.post('/save', async (req, res) => {
  const { text } = req.body;
  try {
    // Step 1: Extract tags from transcript
    const tagResponse = await groq.chat.completions.create({
      model: 'llama-3.3-70b-versatile',
      messages: [
        {
          role: 'user',
          content: `Extract tags from this conversation. Return ONLY a JSON object like:
          {"people": ["Rahul", "Priya"], "topics": ["college", "placement"], "emotions": ["happy"], "date": "2025-05-23"}
          
          Conversation: ${text}`
        }
      ]
    });

    const raw = tagResponse.choices[0].message.content;
    const cleaned = raw.replace(/```json|```/g, '').trim();
    const tags = JSON.parse(cleaned);
    const allTags = [...tags.people, ...tags.topics, ...tags.emotions];

    // Step 2: Save to Postgres
    await pool.query(
      'INSERT INTO memories (text, tags, created_at) VALUES ($1, $2, NOW())',
      [text, allTags]
    );

    res.json({ success: true, tags: allTags });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

// POST /memory/query
router.post('/query', async (req, res) => {
  const { question } = req.body;
  try {
    // Step 1: Parse query into tags
    const parseResponse = await groq.chat.completions.create({
      model: 'llama-3.3-70b-versatile',
      messages: [
        {
          role: 'user',
          content: `Extract search tags from this question. Return ONLY a JSON array like: ["Rahul", "placement", "18 may"]
          
          Question: ${question}`
        }
      ]
    });

    const raw = parseResponse.choices[0].message.content;
    const cleaned = raw.replace(/```json|```/g, '').trim();
    const queryTags = JSON.parse(cleaned);

    // Step 2: Fetch from Postgres
    const result = await pool.query(
      'SELECT text, created_at FROM memories WHERE tags && $1::text[]',
      [queryTags]
    );

    const context = result.rows.map(r => `[${r.created_at}]: ${r.text}`).join('\n');

    // Step 3: AI generates final answer
    const answerResponse = await groq.chat.completions.create({
      model: 'llama-3.3-70b-versatile',
      messages: [
        {
          role: 'user',
          content: `Based on these memories:\n${context}\n\nAnswer this question: ${question}`
        }
      ]
    });

    const answer = answerResponse.choices[0].message.content;
    res.json({ answer });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;