import esClient from './client.js';

const COURSE_INDEX = 'courses';

export async function searchCourses({ query, filters = {}, pagination = {} }) {
  const { page = 1, size = 10 } = pagination;

  const searchBody = {
    query: {
      bool: {
        should: [],
        filter: []
      }
    },
    highlight: {
      fields: {
        course_title: {},
        course_description: {}
      }
    },
    from: (page - 1) * size,
    size
  };

  // 1️⃣ Flexible Query (multi_match with fuzziness)
  if (query) {
    searchBody.query.bool.should.push(
      {
        multi_match: {
          query,
          fields: ['course_title^3', 'course_description'],
          fuzziness: 'AUTO',
          prefix_length: 1,
          operator: 'or'
        }
      },
      {
        match_phrase_prefix: {
          course_title: {
            query
          }
        }
      },
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
    );

    searchBody.query.bool.minimum_should_match = 1;
  }

  // 2️⃣ Filters
  if (filters.level) {
    searchBody.query.bool.filter.push({ term: { difficulty: filters.level } });
  }

  if (filters.instructor) {
    searchBody.query.bool.filter.push({ term: { instructor: filters.instructor } });
  }

  // 3️⃣ Sorting
  if (filters.sort === 'newest') {
    searchBody.sort = [{ created_at: 'desc' }];
  } else if (filters.sort === 'rating') {
    searchBody.sort = [{ rating: 'desc' }];
  }

  // 4️⃣ Run Search
  const { body } = await esClient.search({
    index: COURSE_INDEX,
    body: searchBody
  });

  return {
    results: body.hits.hits.map(hit => ({
      id: hit._id,
      title: hit._source.course_title,
      description: hit._source.course_description,
      instructor: hit._source.instructor,
      difficulty: hit._source.difficulty,
      score: hit._score,
      createdAt: hit._source.created_at,
      rating: hit._source.rating,
      titleSnippet: hit.highlight?.course_title?.[0] || hit._source.course_title,
      descSnippet: hit.highlight?.course_description?.[0] || hit._source.course_description
    })),
    total: body.hits.total.value
  };
}
