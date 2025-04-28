import { Client } from '@elastic/elasticsearch';

export default new Client({
  node: process.env.ES_URL || 'http://localhost:9200',
  auth: {
    username: process.env.ES_USER || 'elastic',
    password: process.env.ES_PASS || 'changeme'
  },
  // Production optimizations
  maxRetries: 5,
  requestTimeout: 30000,
  sniffOnStart: true
});