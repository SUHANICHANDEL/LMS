import esClient from './client.js';

const COURSE_INDEX = 'courses';

export async function setupCourseIndex() {
  const exists = await esClient.indices.exists({ index: COURSE_INDEX });

  if (exists.body) {
    await esClient.indices.delete({ index: COURSE_INDEX });
  }

  await esClient.indices.create({
    index: COURSE_INDEX,
    body: {
      settings: {
        analysis: {
          analyzer: {
            course_analyzer: {
              type: 'custom',
              tokenizer: 'standard',
              filter: [
                'lowercase',
                'asciifolding',
                'edge_ngram_filter'
              ]
            },
            search_analyzer: {
              type: 'custom',
              tokenizer: 'standard',
              filter: ['lowercase', 'asciifolding']
            },
            english_analyzer: {
              type: 'custom',
              tokenizer: 'standard',
              filter: [
                'lowercase',
                'asciifolding',
                'english_stop',
                'english_stemmer'
              ]
            }
          },
          filter: {
            edge_ngram_filter: {
              type: 'edge_ngram',
              min_gram: 2,
              max_gram: 15
            },
            english_stop: {
              type: 'stop',
              stopwords: '_english_'
            },
            english_stemmer: {
              type: 'stemmer',
              language: 'english'
            }
          }
        }
      },
      mappings: {
        properties: {
          title: {
            type: 'text',
            analyzer: 'course_analyzer',
            search_analyzer: 'search_analyzer',
            fields: {
              keyword: {
                type: 'keyword',
                ignore_above: 256
              },
              stemmed: {
                type: 'text',
                analyzer: 'english_analyzer'
              },
              fuzzy: {
                type: 'text',
                analyzer: 'standard'
              }
            }
          },
          description: {
            type: 'text',
            analyzer: 'course_analyzer',
            search_analyzer: 'search_analyzer',
            fields: {
              stemmed: {
                type: 'text',
                analyzer: 'english_analyzer'
              },
              fuzzy: {
                type: 'text',
                analyzer: 'standard'
              }
            }
          },
          instructorId: { type: 'keyword' },
          level: { type: 'keyword' },
          rating: { type: 'float' },
          createdAt: { type: 'date' }
        }
      }
    }
  });

  console.log(`✅ Index '${COURSE_INDEX}' created successfully with autocomplete + fuzzy support.`);
}
