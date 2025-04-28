const searchCourses = async (query) => {
  const response = await client.search({
    index: 'courses',
    body: {
      query: {
        bool: {
          should: [
            // Primary fuzzy search with boosted title
            {
              multi_match: {
                query,
                fields: ['course_title^3', 'course_description'],
                fuzziness: 'AUTO', // AUTO means 0-2 chars: 1 edit, 3-5: 2 edits, >5: 3 edits
                prefix_length: 1, // Require first letter to match
                operator: 'or' // Change from 'and' to 'or' for better fuzzy matching
              }
            },
            // Edge ngram-style matching for prefixes
            {
              match_phrase_prefix: {
                course_title: {
                  query,
                  max_expansions: 50 // Increase from default 50 if needed
                }
              }
            },
            // Add a separate fuzzy match for title only
            {
              fuzzy: {
                course_title: {
                  value: query,
                  fuzziness: 'AUTO',
                  transpositions: true // Allow swapping adjacent chars
                }
              }
            }
          ],
          minimum_should_match: 1
        }
      },
      // Add this to catch very poor spellings
      suggest: {
        text: query,
        title_suggest: {
          term: {
            field: 'course_title',
            suggest_mode: 'always',
            sort: 'frequency',
            string_distance: 'levenshtein'
          }
        }
      },
      highlight: {
        fields: {
          course_title: {},
          course_description: {}
        }
      }
    }
  });

  // Process results including suggestions if no hits
  const hits = response.body.hits.hits;
  if (hits.length > 0) {
    return hits.map(hit => ({
      id: hit._id,
      score: hit._score,
      title: hit._source.course_title,
      description: hit._source.course_description,
      instructor: hit._source.instructor,
      rating: hit._source.rating,
      highlights: hit.highlight || {}
    }));
  }
  
  // Fallback to suggestions if no direct hits
  const suggestions = response.body.suggest?.title_suggest[0]?.options || [];
  return suggestions.map(suggestion => ({
    suggestion: suggestion.text,
    score: suggestion.score
  }));
};