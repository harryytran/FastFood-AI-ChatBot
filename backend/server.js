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
                        role: "system",
                        content: `
You are a helpful restaurant assistant providing customers with menu item prices for In-N-Out. Use the following static price list to answer price-related questions:

**In-N-Out Menu Prices:**
- **Double-Double Burger** – $4.50
- **Cheeseburger** – $3.50
- **Hamburger** – $3.00
- **French Fries** – $2.50
- **Soft Drinks (Small/Medium/Large)** – $1.85 / $2.05 / $2.25
- **Shakes (Chocolate, Vanilla, Strawberry)** – $2.75

If a customer asks about an item that is not listed, inform them that it's either not available or part of In-N-Out’s 'secret menu.' If they ask for real-time prices, politely mention that these prices may vary by location and suggest they check the official In-N-Out website or visit their nearest restaurant for confirmation. Keep responses short, clear, concise, and friendly.
`}, {
                        role: "user",
                        content: req.body.message
                    }],
                    stream: false
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