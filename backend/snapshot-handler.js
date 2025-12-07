// backend/snapshot-handler.js
const AWS = require('aws-sdk');

const ddb = new AWS.DynamoDB.DocumentClient();
const TABLE_NAME = process.env.TABLE_NAME;

function buildCorsHeaders() {
  return {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type,x-user-id',
    'Access-Control-Allow-Methods': 'OPTIONS,GET,PUT',
  };
}

exports.handler = async (event) => {
  const headers = buildCorsHeaders();

  try {
    const method =
      (event.requestContext && event.requestContext.http && event.requestContext.http.method) ||
      event.httpMethod ||
      'GET';

    // Handle CORS preflight
    if (method === 'OPTIONS') {
      return {
        statusCode: 200,
        headers,
        body: '',
      };
    }

    if (method === 'GET') {
      const userId =
        (event.queryStringParameters && event.queryStringParameters.userId) ||
        (event.headers && (event.headers['x-user-id'] || event.headers['X-User-Id']));

      if (!userId) {
        return {
          statusCode: 400,
          headers,
          body: JSON.stringify({ error: 'Missing userId' }),
        };
      }

      const params = {
        TableName: TABLE_NAME,
        Key: { userId },
      };

      const result = await ddb.get(params).promise();
      if (!result.Item) {
        return {
          statusCode: 404,
          headers,
          body: JSON.stringify({ error: 'Snapshot not found' }),
        };
      }

      // We store the snapshot object on the item under "snapshot"
      const snapshot = result.Item.snapshot;

      return {
        statusCode: 200,
        headers: {
          ...headers,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(snapshot),
      };
    }

    if (method === 'PUT') {
      const rawBody = event.body || '{}';
      let body;
      try {
        body = JSON.parse(rawBody);
      } catch (e) {
        return {
          statusCode: 400,
          headers,
          body: JSON.stringify({ error: 'Invalid JSON body' }),
        };
      }

      const headerUserId =
        (event.headers && (event.headers['x-user-id'] || event.headers['X-User-Id'])) || null;
      const userId = body.userId || headerUserId;

      if (!userId) {
        return {
          statusCode: 400,
          headers,
          body: JSON.stringify({ error: 'Missing userId' }),
        };
      }

      const snapshot = body.snapshot;
      if (!snapshot || typeof snapshot !== 'object') {
        return {
          statusCode: 400,
          headers,
          body: JSON.stringify({ error: 'Missing or invalid snapshot' }),
        };
      }

      // Ensure updatedAt is set
      const updatedAt = snapshot.updatedAt || new Date().toISOString();
      const item = {
        userId,
        snapshot: {
          ...snapshot,
          updatedAt,
        },
        updatedAt,
      };

      const params = {
        TableName: TABLE_NAME,
        Item: item,
      };

      await ddb.put(params).promise();

      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({ ok: true, updatedAt }),
      };
    }

    // Unsupported method
    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ error: 'Method Not Allowed' }),
    };
  } catch (err) {
    console.error('Snapshot handler error', err);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: 'Internal Server Error' }),
    };
  }
};
