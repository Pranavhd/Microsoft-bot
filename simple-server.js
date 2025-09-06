const express = require('express');
const app = express();
const port = 3000;

// Middleware to parse JSON
app.use(express.json());

// Simple hello world endpoint
app.get('/hello', (req, res) => {
    const response = {
        message: 'Hello World!',
        timestamp: new Date().toISOString(),
        status: 'success',
        data: {
            greeting: 'Welcome to the simple API server',
            version: '1.0.0'
        }
    };
    
    console.log(`API call received at ${response.timestamp}`);
    res.json(response);
});

// Health check endpoint
app.get('/health', (req, res) => {
    res.json({
        status: 'healthy',
        uptime: process.uptime(),
        timestamp: new Date().toISOString()
    });
});

// Root endpoint
app.get('/', (req, res) => {
    res.json({
        message: 'Simple API Server is running!',
        endpoints: [
            'GET /hello - Returns hello world message',
            'GET /health - Returns server health status',
            'GET / - This endpoint'
        ]
    });
});

// Start the server
app.listen(port, () => {
    console.log(`Simple API server running at http://localhost:${port}`);
    console.log(`Try: http://localhost:${port}/hello`);
});
