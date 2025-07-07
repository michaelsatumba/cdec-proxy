// server.js
const express = require('express');
const fetch = require('node-fetch').default;
const cors = require('cors'); // For handling CORS on your proxy server

const app = express();
const PORT = process.env.PORT || 3000; 

// Enable CORS for your frontend
app.use(cors({
    origin: 'http://127.0.0.1:5500' 
    // origin: '*'
}));

// A simple route for your proxy
// Example: frontend will call /api/cdec-data?Stations=CAS&SensorNums=23&dur_code=H&Start=2025-06-29&End=2025-06-30
app.get('/api/cdec-data', async (req, res) => {
    try {
        // Construct the CDEC API URL using query parameters from the client request
        const cdecBaseUrl = 'https://cdec.water.ca.gov/dynamicapp/req/JSONDataServlet';
        const queryParams = new URLSearchParams(req.query).toString(); // Get all query params from client
        const cdecUrl = `${cdecBaseUrl}?${queryParams}`;

        console.log(`Proxying request to: ${cdecUrl}`);

        // Make the request to the actual CDEC API
        const cdecResponse = await fetch(cdecUrl);

        // Check if the CDEC API returned an error
        if (!cdecResponse.ok) {
            console.error(`CDEC API responded with status: ${cdecResponse.status}`);
            // Forward the CDEC API's error status and message
            return res.status(cdecResponse.status).json({
                error: 'Failed to fetch data from CDEC API',
                details: await cdecResponse.text() // Or .json() if applicable
            });
        }

        // Get the data from CDEC API (assuming JSON)
        const data = await cdecResponse.json();

        // Send the data back to your frontend
        // Express automatically sets Content-Type: application/json when you use res.json()
        res.json(data);

    } catch (error) {
        console.error('Error in proxy:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Start the server
app.listen(PORT, () => {
    console.log(`Proxy server listening on port ${PORT}`);
    console.log(`Frontend should make requests to http://localhost:${PORT}/api/cdec-data`);
});