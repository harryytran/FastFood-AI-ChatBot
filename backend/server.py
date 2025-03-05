from flask import Flask, request, jsonify
from flask_cors import CORS
import requests
import json

app = Flask(__name__)
CORS(app)

SYSTEM_PROMPT = """
You are a helpful restaurant assistant providing customers with menu item prices for In-N-Out. Use the following static price list to answer price-related questions:

**In-N-Out Menu Prices:**
- **Double-Double Burger** : $3.95
- **Cheeseburger** : $2.80
- **Hamburger** : $2.50
- **French Fries** : $1.85
- **Soft Drinks (Small/Medium/Large)** : $1.85 / $2.05 / $2.25
- **Shakes (Chocolate, Vanilla, Strawberry)** : $2.40

If a customer asks about an item that is not listed, inform them that it's either not available or part of In-N-Out's 'secret menu.' If they ask for real-time prices, politely mention that these prices may vary by location and suggest they check the official In-N-Out website or visit their nearest restaurant for confirmation. Keep responses short, clear, concise, and friendly.
"""

@app.route('/api/chat', methods=['POST'])
def chat():
    try:
        payload = {
            "model": "llama2",
            "messages": [
                {
                    "role": "system",
                    "content": SYSTEM_PROMPT
                },
                {
                    "role": "user",
                    "content": request.json['message']
                }
            ],
            "stream": False
        }

        response = requests.post(
            'http://localhost:11434/api/chat',
            headers={'Content-Type': 'application/json'},
            json=payload
        )

        # Log raw response for debugging
        print('Raw response:', response.text)

        try:
            data = response.json()
        except json.JSONDecodeError as e:
            print('JSON Parse Error:', e)
            return jsonify({'error': 'Invalid JSON response from Ollama'}), 500

        if not data.get('message') or 'content' not in data['message']:
            print('Unexpected response structure:', data)
            return jsonify({'error': 'Unexpected response structure from Ollama'}), 500

        return jsonify({'response': data['message']['content']})

    except Exception as e:
        print('Error:', str(e))
        return jsonify({'error': 'Failed to get response from Ollama'}), 500

if __name__ == '__main__':
    app.run(port=3000) 