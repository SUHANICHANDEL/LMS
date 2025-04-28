const client = require('../configs/elasticsearch');  // Assuming client is set up
const { enhancedSearch } = require('./indexCourses');

async function searchCourses(query) {
  try {
    const results = await client.search({
      index: 'courses',
      body: {
        query: {
          bool: {
            should: [
              // 1️⃣ Fuzzy match (typo handling)
              {
                multi_match: {
                  query,
                  fields: ['course_title^3', 'course_description'],
                  fuzziness: 'AUTO',
                  prefix_length: 1,
                  operator: 'or'
                }
              },
              // 2️⃣ Match phrase prefix (autocomplete-style suggestions)
              {
                match_phrase_prefix: {
                  course_title: {
                    query
                  }
                }
              },
              // 3️⃣ Regex (for jumbled/missing characters)
              {
                regexp: {
                  course_title: {
                    value: `.*${query.toLowerCase().replace(/\s+/g, '.*')}.*`,
                    flags: 'ALL',
                    case_insensitive: true,
                    max_determinized_states: 10000
                  }
                }
              },
              {
                regexp: {
                  course_description: {
                    value: `.*${query.toLowerCase().replace(/\s+/g, '.*')}.*`,
                    flags: 'ALL',
                    case_insensitive: true,
                    max_determinized_states: 10000
                  }
                }
              }
            ],
            minimum_should_match: 1
          }
        },
        highlight: {
          fields: {
            course_title: {},
            course_description: {}
          }
        },
        size: 10
      }
    });

    return {
      results: results.body.hits.hits.map(hit => ({
        id: hit._id,
        title: hit._source.course_title,
        description: hit._source.course_description,
        score: hit._score,
        titleSnippet: hit.highlight?.course_title?.[0] || hit._source.course_title,
        descSnippet: hit.highlight?.course_description?.[0] || hit._source.course_description
      })),
      total: results.body.hits.total.value
    };
  } catch (err) {
    console.error('Search error:', err);
    throw new Error('Search failed');
  }
}

module.exports = { searchCourses };
