# This Day in History 📜

A simple and beautiful web app that shows notable historical events for any chosen date. It uses the Gemini API with FastAPI on the backend and a lightweight frontend to make the experience interactive.

This project is a great beginner-friendly way to learn:
- how to call the Gemini API from Python
- how to build a small REST API with FastAPI
- how to connect a frontend to a backend
- how to work with environment variables and API keys safely

## What You’ll Learn

If you are new to AI and APIs, this project helps you understand:
- how to set up a Gemini API key
- how to send prompts to Gemini
- how to parse AI responses into structured JSON
- how to use FastAPI routes to return data to a web app

## Features

- Select any month and day
- Get 8 historical events for that date
- Display results in a clean web interface
- Use Gemini AI to generate meaningful historical content

## Project Structure

```text
api/
├── backend/
│   ├── main.py              # FastAPI backend
│   ├── requirements.txt     # Python dependencies
│   ├── .env                 # Your API key (local only)
│   └── .env.example         # Example environment file
├── frontend/
│   ├── index.html           # Main page
│   ├── style.css            # Styling
│   └── app.js               # Frontend logic
└── README.md
```

## Prerequisites

Before you begin, make sure you have:
- Python 3.10 or newer
- pip installed
- a Gemini API key from Google AI Studio

## Setup

### 1. Install dependencies

Open a terminal and run:

```bash
cd backend
pip install -r requirements.txt
```

### 2. Create your environment file

Inside the backend folder, create a file named `.env` and add your Gemini API key:

```env
GEMINI_API_KEY=your_api_key_here
```

If you are using a newer model name in the code, you can also add:

```env
GEMINI_MODEL=gemini-3.6-flash
```

### 3. Run the app

```bash
cd backend
python -m uvicorn main:app --reload --host 127.0.0.1 --port 8000
```

Then open:

```text
http://127.0.0.1:8000
```

## API Endpoint

The backend exposes this route:

```text
GET /api/events?month=7&day=18
```

It returns a JSON response with historical events for the chosen date.

## Beginner Tips for Using Gemini API

If you are learning AI development, here is a good beginner path:

1. Start with a simple prompt
2. Test the response in Python first
3. Ask Gemini for structured JSON
4. Parse that JSON in your code
5. Display it in your frontend

A small example idea:

```python
from google import generativeai as genai

genai.configure(api_key="your_api_key_here")
model = genai.GenerativeModel("gemini-3.6-flash")
response = model.generate_content("Say hello in one sentence")
print(response.text)
```

## Troubleshooting

- If the app does not start, check that your dependencies are installed
- If Gemini returns an error, verify that your API key is correct
- If you see a model error, make sure the model name in the code is supported

## Next Steps

Once you understand this project, you can try:
- adding a date picker
- improving the prompt quality
- showing event images or sources
- deploying the app online

Happy learning with Gemini API!
