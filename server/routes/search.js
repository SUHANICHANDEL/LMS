const express = require('express');
const { searchCourses } = require('../searchService');
const router = express.Router();

router.get('/', async (req, res) => {
  try {
    const { q: query } = req.query;
    if (!query) return res.status(400).json({ error: 'Query required' });
    
    const results = await searchCourses(query);
    res.json(results);
  } catch (err) {
    console.error('API search error:', err);
    res.status(500).json({ error: 'Search failed' });
  }
});

module.exports = router;