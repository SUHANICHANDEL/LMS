// server/configs/elasticsearch.js
import { Client } from '@elastic/elasticsearch';

const client = new Client({
  node: process.env.ELASTICSEARCH_NODE, // Elasticsearch node from your .env
});

export default client;
