const express = require('express');
const cors = require('cors');

// Using async IIFE (Immediately Invoked Function Expression) to handle async imports
(async () => {
    const { default: fetch } = await import('node-fetch');
    const app = express();
    const port = 3000;

    app.use(cors());
    app.use(express.json());

    app.post('/api/chat', async (req, res) => {
        try {
            const response = await fetch('http://localhost:11434/api/chat', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    model: "llama2",
                    messages: [{
                        role: "user",
                        content: req.body.message
                    }],
                    stream: false // Add this to prevent streaming response
                })
            });

            // Get the raw text first
            const rawText = await response.text();
            console.log('Raw response:', rawText);

            let data;
            try {
                data = JSON.parse(rawText);
            } catch (parseError) {
                console.error('JSON Parse Error:', parseError);
                return res.status(500).json({ error: 'Invalid JSON response from Ollama' });
            }

            if (!data.message || !data.message.content) {
                console.error('Unexpected response structure:', data);
                return res.status(500).json({ error: 'Unexpected response structure from Ollama' });
            }

            res.json({ response: data.message.content });
        } catch (error) {
            console.error('Error:', error);
            res.status(500).json({ error: 'Failed to get response from Ollama' });
        }
    });

    app.listen(port, () => {
        console.log(`Server running at http://localhost:${port}`);
    });
})(); 