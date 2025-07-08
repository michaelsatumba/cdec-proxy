// api/cdec-data.js
const fetch = require('node-fetch').default;
const cors = require('cors');

const allowCors = (fn) => async (req, res) => {
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', 'http://127.0.0.1:5500'); // Change this for production!
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }
  return await fn(req, res);
};

const handler = async (req, res) => {
  try {
    const cdecBaseUrl = 'https://cdec.water.ca.gov/dynamicapp/req/JSONDataServlet';
    const queryParams = new URLSearchParams(req.query).toString();
    const cdecUrl = `${cdecBaseUrl}?${queryParams}`;

    console.log(`Proxying request to: ${cdecUrl}`);

    const cdecResponse = await fetch(cdecUrl);

    if (!cdecResponse.ok) {
      console.error(`CDEC API responded with status: ${cdecResponse.status}`);
      return res.status(cdecResponse.status).json({
        error: 'Failed to fetch data from CDEC API',
        details: await cdecResponse.text(),
      });
    }

    const data = await cdecResponse.json();
    res.json(data);
  } catch (error) {
    console.error('Error in proxy:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

module.exports = allowCors(handler);