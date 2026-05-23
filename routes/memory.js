const express = require('express');
const router = express.Router();
const pool = require('../db');
const { generateTags, getPrimaryDateLabel } = require('../utils/tagUtils');
const { generateAnswer } = require('../utils/llmUtils');
const { authenticateToken, requireOwnership } = require('../middleware/auth');
const Groq = require('groq-sdk');

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

/**
 * Phase 1: POST /api/memory
 * Save a new memory with AI-generated tags
 * Requires: Authentication
 * 
 * Request body:
 * {
 *   "text": "Rahul ke saath aaj farewell party mein gaya, bohot excited tha!",
 *   "recorded_at": "2026-05-23T10:30:00Z",
 *   "duration_seconds": 45
 * }
 */
router.post('/', authenticateToken, async (req, res) => {
  const { text, recorded_at, duration_seconds } = req.body;
  const user_id = req.user.id;

  if (!text) {
    return res.status(400).json({ error: 'text is required' });
  }

  try {
    // Step 1: Generate tags from transcription
    const tags = await generateTags(text);
    console.log('Generated tags:', tags);

    // Step 2: Resolve date references to DD-MM-YYYY
    const dateLabel = getPrimaryDateLabel(tags.date_ref);

    // Step 3: Store in Postgres with all tag categories
    const query = `
      INSERT INTO memories (
        user_id, 
        raw_text, 
        tags_people, 
        tags_topics, 
        tags_mood, 
        tags_location,
        date_label,
        recorded_at,
        duration_seconds
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
      RETURNING id, user_id, date_label, tags_people, tags_topics, tags_mood, tags_location;
    `;

    const result = await pool.query(query, [
      user_id,
      text,
      tags.people,
      tags.topics,
      tags.mood,
      tags.location,
      dateLabel,
      recorded_at || new Date(),
      duration_seconds || null
    ]);

    const saved = result.rows[0];

    res.status(201).json({
      success: true,
      memory_id: saved.id,
      tags: {
        people: saved.tags_people,
        topics: saved.tags_topics,
        mood: saved.tags_mood,
        location: saved.tags_location,
        date_label: saved.date_label
      }
    });
  } catch (err) {
    console.error('Error saving memory:', err);
    res.status(500).json({ error: err.message });
  }
});

/**
 * Phase 2: POST /api/memory/ask
 * Query memories and get an AI-generated answer
 * Requires: Authentication
 * 
 * Request body:
 * {
 *   "query": "Rahul ke saath farewell mein kab gaye the?"
 * }
 */
router.post('/ask', authenticateToken, async (req, res) => {
  const { query } = req.body;
  const user_id = req.user.id;

  if (!query) {
    return res.status(400).json({ error: 'query is required' });
  }

  try {
    // Step 1: Generate query tags (same as memory saving)
    const queryTags = await generateTags(query);
    console.log('Query tags:', queryTags);

    // Step 2: Tag matching in Postgres using array overlap
    // Users can only query their own memories
    const matchQuery = `
      SELECT 
        id,
        raw_text,
        tags_people,
        tags_topics,
        tags_mood,
        tags_location,
        date_label,
        recorded_at
      FROM memories
      WHERE user_id = $1
      AND (
        tags_people && $2::text[]
        OR tags_topics && $3::text[]
        OR tags_mood && $4::text[]
        OR tags_location && $5::text[]
      )
      ORDER BY recorded_at DESC
      LIMIT 10;
    `;

    const matchResult = await pool.query(matchQuery, [
      user_id,
      queryTags.people,
      queryTags.topics,
      queryTags.mood,
      queryTags.location
    ]);

    const matchedMemories = matchResult.rows;

    if (matchedMemories.length === 0) {
      return res.json({
        answer: 'Mujhe is baare mein koi memory nahi mili.',
        memories_used: 0
      });
    }

    // Step 3: Send matched memories to LLM with answer prompt
    const answer = await generateAnswer(query, matchedMemories);

    // Step 4: Return answer to client
    res.json({
      answer,
      memories_used: matchedMemories.length,
      matched_memory_ids: matchedMemories.map(m => m.id)
    });
  } catch (err) {
    console.error('Error processing query:', err);
    res.status(500).json({ error: err.message });
  }
});

/**
 * GET /api/memory/all
 * Retrieve all memories for current user
 * Requires: Authentication
 */
router.get('/all', authenticateToken, async (req, res) => {
  const user_id = req.user.id;

  try {
    const result = await pool.query(
      `SELECT id, raw_text, tags_people, tags_topics, tags_mood, tags_location, 
              date_label, recorded_at, created_at 
       FROM memories 
       WHERE user_id = $1 
       ORDER BY recorded_at DESC 
       LIMIT 100`,
      [user_id]
    );

    res.json({
      total: result.rows.length,
      memories: result.rows
    });
  } catch (err) {
    console.error('Error retrieving memories:', err);
    res.status(500).json({ error: err.message });
  }
});

/**
 * GET /api/memory/:id
 * Retrieve a specific memory
 * Requires: Authentication (user can only access their own memories)
 */
router.get('/:id', authenticateToken, async (req, res) => {
  const { id } = req.params;
  const user_id = req.user.id;

  try {
    const result = await pool.query(
      `SELECT * FROM memories WHERE id = $1 AND user_id = $2`,
      [id, user_id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Memory not found' });
    }

    res.json(result.rows[0]);
  } catch (err) {
    console.error('Error retrieving memory:', err);
    res.status(500).json({ error: err.message });
  }
});

/**
 * PUT /api/memory/:id
 * Update a memory
 * Requires: Authentication (user can only update their own memories)
 */
router.put('/:id', authenticateToken, async (req, res) => {
  const { id } = req.params;
  const { raw_text } = req.body;
  const user_id = req.user.id;

  if (!raw_text) {
    return res.status(400).json({ error: 'raw_text is required' });
  }

  try {
    // Check if memory belongs to user
    const memory = await pool.query(
      'SELECT id FROM memories WHERE id = $1 AND user_id = $2',
      [id, user_id]
    );

    if (memory.rows.length === 0) {
      return res.status(404).json({ error: 'Memory not found' });
    }

    // Regenerate tags for updated text
    const tags = await generateTags(raw_text);
    const dateLabel = getPrimaryDateLabel(tags.date_ref);

    const result = await pool.query(
      `UPDATE memories 
       SET raw_text = $1, 
           tags_people = $2,
           tags_topics = $3,
           tags_mood = $4,
           tags_location = $5,
           date_label = $6,
           updated_at = NOW()
       WHERE id = $7 AND user_id = $8
       RETURNING id, raw_text, tags_people, tags_topics, tags_mood, tags_location`,
      [raw_text, tags.people, tags.topics, tags.mood, tags.location, dateLabel, id, user_id]
    );

    res.json({
      success: true,
      memory: result.rows[0]
    });
  } catch (err) {
    console.error('Error updating memory:', err);
    res.status(500).json({ error: err.message });
  }
});

/**
 * DELETE /api/memory/:id
 * Delete a memory
 * Requires: Authentication (user can only delete their own memories)
 */
router.delete('/:id', authenticateToken, async (req, res) => {
  const { id } = req.params;
  const user_id = req.user.id;

  try {
    const result = await pool.query(
      'DELETE FROM memories WHERE id = $1 AND user_id = $2 RETURNING id',
      [id, user_id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Memory not found' });
    }

    res.json({
      success: true,
      message: 'Memory deleted successfully'
    });
  } catch (err) {
    console.error('Error deleting memory:', err);
    res.status(500).json({ error: err.message });
  }
});

const cron = require('node-cron');

// Runs every day at 11:59 PM
cron.schedule('59 23 * * *', async () => {
  console.log('Running daily summary...');
  try {
    const today = new Date().toISOString().split('T')[0];

    // Get all users
    const usersResult = await pool.query('SELECT id FROM users WHERE is_active = true');

    for (const userRow of usersResult.rows) {
      const userId = userRow.id;

      const result = await pool.query(
        `SELECT raw_text FROM memories WHERE user_id = $1 AND DATE(recorded_at) = $2`,
        [userId, today]
      );

      if (result.rows.length === 0) {
        console.log(`No memories to summarize for user ${userId} today.`);
        continue;
      }

      const allText = result.rows.map(r => r.raw_text).join('\n');

      const summaryResponse = await groq.chat.completions.create({
        model: 'llama-3.3-70b-versatile',
        messages: [
          {
            role: 'user',
            content: `Create a concise summary of today's memories (in Hindi/English as appropriate). Return ONLY the summary text.\n\nMemories:\n${allText}`
          }
        ]
      });

      const summary = summaryResponse.choices[0].message.content;

      // Generate tags for the summary itself
      const summaryTags = await generateTags(summary);

      await pool.query(
        `INSERT INTO memories (
          user_id,
          raw_text,
          tags_people,
          tags_topics,
          tags_mood,
          tags_location,
          date_label,
          recorded_at
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, NOW())`,
        [
          userId,
          `[DAILY SUMMARY] ${summary}`,
          summaryTags.people,
          summaryTags.topics,
          summaryTags.mood,
          summaryTags.location,
          today
        ]
      );

      console.log(`Daily summary saved for user ${userId}.`);
    }
  } catch (err) {
    console.error('Summary error:', err);
  }
});

module.exports = router;