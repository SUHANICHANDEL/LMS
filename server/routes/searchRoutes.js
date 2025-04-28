import express from 'express';
import { Client } from '@elastic/elasticsearch';

const router = express.Router();

// Configure Elasticsearch client with environment variables
const client = new Client({
  node: process.env.ELASTICSEARCH_URL || 'http://localhost:9200',
  maxRetries: 5,
  requestTimeout: 60000
});

// Input validation middleware
const validateSearchInput = (req, res, next) => {
  const { q: query } = req.query;
  
  if (!query || query.trim().length < 2) {
    return res.status(400).json({ 
      error: 'Search query must be at least 2 characters long' 
    });
  }
  
  req.cleanQuery = query.trim();
  next();
};

// Advanced search endpoint
router.get('/', validateSearchInput, async (req, res) => {
  try {
    const { cleanQuery: query } = req;
    const { page = 1, size = 10, sort = '_score' } = req.query;

    const searchParams = {
      index: 'courses',
      from: (page - 1) * size,
      size: parseInt(size),
      body: {
        query: {
          bool: {
            must: {
              multi_match: {
                query,
                fields: [
                  'courseName^3',  // Boost course name matches
                  'description^2', // Boost description slightly less
                  'instructor',
                  'tags'
                ],
                fuzziness: 'AUTO',
                operator: 'and'    // Require all terms to match
              }
            },
            filter: []  // Filters will be added dynamically
          }
        },
        sort: [{ [sort]: 'desc' }],
        highlight: {
          pre_tags: ['<mark>'],
          post_tags: ['</mark>'],
          fields: {
            courseName: { number_of_fragments: 0 },
            description: { fragment_size: 150 }
          }
        },
        aggs: {
          instructors: {
            terms: { field: 'instructor.keyword', size: 10 }
          },
          difficulties: {
            terms: { field: 'difficulty' }
          }
        }
      }
    };

    // Add filters if provided
    if (req.query.difficulty) {
      searchParams.body.query.bool.filter.push({
        term: { difficulty: req.query.difficulty }
      });
    }

    if (req.query.instructor) {
      searchParams.body.query.bool.filter.push({
        term: { 'instructor.keyword': req.query.instructor }
      });
    }

    const { body } = await client.search(searchParams);

    // Format response
    const response = {
      meta: {
        query,
        page: parseInt(page),
        size: parseInt(size),
        total_results: body.hits.total.value
      },
      results: body.hits.hits.map(hit => ({
        ...hit._source,
        highlights: hit.highlight
      })),
      aggregations: body.aggregations,
      suggestions: body.suggest?.course_suggest?.[0]?.options || []
    };

    res.json(response);
  } catch (error) {
    console.error('Elasticsearch error:', error.meta?.body?.error || error.message);
    
    res.status(500).json({ 
      error: 'Search service unavailable',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

export default router;