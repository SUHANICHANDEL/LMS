import { Client } from '@elastic/elasticsearch';
import dotenv from 'dotenv';

dotenv.config();

const client = new Client({
  node: process.env.ELASTICSEARCH_NODE || 'http://localhost:9200',
  auth: {
    username: process.env.ELASTIC_USER || 'elastic',
    password: process.env.ELASTIC_PASSWORD || 'changeme',
  },
});

// Ping the cluster to verify connection
client.ping()
  .then(() => console.log('🟢 Connected to Elasticsearch'))
  .catch(err => console.error('🔴 Connection failed:', err));

export default client;  // Using ES module export
