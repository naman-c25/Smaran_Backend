const express = require('express');
const router = express.Router();
const pool = require('../db');
const { authenticateToken } = require('../middleware/auth');
const { extractTags, generateEmbedding, generateAnswer, detectConnections } = require('../utils/llmUtils');

/**
 * Format date to DD-MM-YYYY
 */
function formatDate(dateStr) {
  const d = new Date(dateStr);
  const day = String(d.getDate()).padStart(2, '0');
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const year = d.getFullYear();
  return `${day}-${month}-${year}`;
}

/**
 * POST /api/memory
 * Save a new memory
 *
 * Request body:
 * {
 *   "text": "Aaj Rahul se baat ki...",
 *   "recordedAt": "2026-05-24T09:41:00Z",   (optional)
 *   "durationSeconds": 45                    (optional)
 * }
 */
router.post('/', authenticateToken, async (req, res) => {
  const { text, recordedAt, durationSeconds } = req.body;
  const user_id = req.user.id;

  if (!text) {
    return res.status(400).json({ error: 'text is required' });
  }

  try {
    // Step 1: Extract tags via Gemini
    const tags = await extractTags(text);
    console.log('Tags extracted:', tags);

    // Step 2: Generate embedding via Gemini
    const embeddingValues = await generateEmbedding(text);
    const embeddingLiteral = '[' + embeddingValues.map(n => Number(n).toFixed(6)).join(',') + ']';

    const recordedAtDate = recordedAt ? new Date(recordedAt) : new Date();
    const dateLabel = formatDate(recordedAtDate);

    // Step 3: Store in Postgres
    const result = await pool.query(`
      INSERT INTO memories
        (user_id, raw_text, summary, people, topics, mood, location,
         date_label, recorded_at, duration_seconds, embedding)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11::vector)
      RETURNING id
    `, [
      user_id,
      text,
      tags.summary,
      tags.people,
      tags.topics,
      tags.mood,
      tags.location,
      dateLabel,
      recordedAtDate,
      durationSeconds || null,
      embeddingLiteral
    ]);

    const newMemoryId = result.rows[0].id;

    // Step 4: Connection detection — async, don't block response
    detectConnectionsBackground(newMemoryId, user_id, {
      raw_text: text,
      people: tags.people,
      mood: tags.mood
    }).catch(console.error);

    res.status(201).json({ id: newMemoryId, status: 'saved' });

  } catch (err) {
    console.error('Error saving memory:', err);
    res.status(500).json({ error: err.message });
  }
});

/**
 * Background job — detect connections after saving memory
 */
async function detectConnectionsBackground(newMemoryId, userId, newMemory) {
  // Get last 30 memories for this user
  const recent = await pool.query(`
    SELECT id, raw_text, summary, people, mood, date_label
    FROM memories
    WHERE user_id = $1 AND id != $2
    ORDER BY recorded_at DESC
    LIMIT 30
  `, [userId, newMemoryId]);

  if (recent.rows.length === 0) return;

  const connections = await detectConnections(newMemory, recent.rows);

  if (connections.length === 0) return;

  // Find matching memory ids by summary match
  for (const conn of connections) {
    const matched = recent.rows.find(m =>
      m.summary && conn.connected_memory_summary &&
      m.summary.toLowerCase().includes(conn.connected_memory_summary.toLowerCase().slice(0, 20))
    );

    if (matched) {
      await pool.query(`
        INSERT INTO memory_connections
          (memory_a, memory_b, connection_type, pattern, insight)
        VALUES ($1, $2, $3, $4, $5)
      `, [
        newMemoryId,
        matched.id,
        conn.connection_type,
        conn.pattern,
        conn.insight
      ]);
      console.log(`Connection saved: ${conn.connection_type} — ${conn.pattern}`);
    }
  }
}

/**
 * POST /api/ask
 * Query memories and get AI-generated answer
 *
 * Request body:
 * {
 *   "query": "Why was I stressed this week?"
 * }
 */
router.post('/ask', authenticateToken, async (req, res) => {
  const { query } = req.body;
  const user_id = req.user.id;

  if (!query) {
    return res.status(400).json({ error: 'query is required' });
  }

  try {
    // Step 1: Embed the query
    const queryEmbedding = await generateEmbedding(query);
    const queryLiteral = '[' + queryEmbedding.map(n => Number(n).toFixed(6)).join(',') + ']';

    // Step 2: Vector search — top 20 by meaning
    const vectorResult = await pool.query(`
      SELECT id, raw_text, summary, people, topics, mood, location, date_label,
             1 - (embedding <=> $1::vector) AS similarity
      FROM memories
      WHERE user_id = $2
      ORDER BY embedding <=> $1::vector
      LIMIT 20
    `, [queryLiteral, user_id]);

    if (vectorResult.rows.length === 0) {
      return res.json({
        answer: 'Mujhe is baare mein koi memory nahi mili.',
        mood: 'neutral'
      });
    }

    // Step 3: Extract query tags and re-rank with tag boost
    const queryTags = await extractTags(query);

    const reranked = vectorResult.rows.map(memory => {
      let score = parseFloat(memory.similarity) || 0;

      // Boost if people match
      const peopleMatch = (memory.people || [])
        .filter(p => queryTags.people.includes(p)).length;

      // Boost if topics match
      const topicMatch = (memory.topics || [])
        .filter(t => queryTags.topics.includes(t)).length;

      // Boost if mood matches
      const moodMatch = memory.mood === queryTags.mood ? 0.1 : 0;

      score += peopleMatch * 0.2;
      score += topicMatch * 0.15;
      score += moodMatch;

      return { ...memory, finalScore: score };
    })
    .sort((a, b) => b.finalScore - a.finalScore)
    .slice(0, 5);

    // Step 4: Fetch connections for top memories
    const ids = reranked.map(m => `'${m.id}'`).join(',');
    let connections = [];
    if (ids.length > 0) {
      const connResult = await pool.query(`
        SELECT pattern, insight, connection_type
        FROM memory_connections
        WHERE memory_a IN (${ids}) OR memory_b IN (${ids})
        LIMIT 5
      `);
      connections = connResult.rows;
    }

    // Step 5: Generate answer via Gemini
    const { answer, mood } = await generateAnswer(query, reranked, connections);

    res.json({ answer, mood });

  } catch (err) {
    console.error('Error processing query:', err);
    res.status(500).json({ error: err.message });
  }
});

/**
 * GET /api/memory/all
 * Get all memories for current user
 */
router.get('/all', authenticateToken, async (req, res) => {
  const user_id = req.user.id;
  try {
    const result = await pool.query(`
      SELECT id, raw_text, summary, people, topics, mood, location,
             date_label, recorded_at, created_at
      FROM memories
      WHERE user_id = $1
      ORDER BY recorded_at DESC
      LIMIT 100
    `, [user_id]);

    res.json({ total: result.rows.length, memories: result.rows });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * DELETE /api/memory/:id
 * Delete a memory
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
    res.json({ success: true, message: 'Memory deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;