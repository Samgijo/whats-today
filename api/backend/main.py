import json
import os
from pathlib import Path
from datetime import date
from typing import Optional

from dotenv import load_dotenv

# Load .env from the backend directory
load_dotenv(Path(__file__).parent / ".env")

from fastapi import FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
from pydantic import BaseModel
import google.generativeai as genai

app = FastAPI(title="This Day in History", version="1.0.0")

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


class HistoryEvent(BaseModel):
    year: int
    title: str
    description: str
    category: str  # e.g. "politics", "science", "culture", "sports", "war"


class HistoryResponse(BaseModel):
    date: str
    events: list[HistoryEvent]


def get_gemini_model():
    api_key = os.getenv("GEMINI_API_KEY") or os.getenv("GOOGLE_API_KEY")
    if not api_key or api_key.strip() == "":
        raise HTTPException(
            status_code=500,
            detail="GEMINI_API_KEY or GOOGLE_API_KEY environment variable is not set.",
        )

    try:
        genai.configure(api_key=api_key)
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Failed to configure Gemini client: {str(e)}",
        )

    model_name = os.getenv("GEMINI_MODEL", "gemini-3.6-flash")
    return genai.GenerativeModel(model_name)


@app.get("/api/events", response_model=HistoryResponse)
async def get_events(
    month: int = Query(..., ge=1, le=12, description="Month (1-12)"),
    day: int = Query(..., ge=1, le=31, description="Day (1-31)"),
):
    """Fetch notable historical events for a given month and day using Gemini."""

    # Validate the date
    try:
        date(2000, month, day)  # Use a leap year to allow Feb 29
    except ValueError:
        raise HTTPException(status_code=400, detail=f"Invalid date: {month}/{day}")

    date_str = date(2000, month, day).strftime("%B %d")

    model = get_gemini_model()

    prompt = f"""List 8 notable historical events that happened on {date_str} (any year).

For each event, provide the information in this EXACT JSON format. Return ONLY a JSON array, no other text:

[
  {{
    "year": <integer year>,
    "title": "<short title, max 10 words>",
    "description": "<2-3 sentence description of what happened and its significance>",
    "category": "<one of: politics, science, culture, sports, war, disaster, exploration, technology>"
  }}
]

Choose events that are diverse in category and span different centuries. Order them chronologically from oldest to newest. Ensure accuracy — only include well-documented historical events."""

    try:
        response = model.generate_content(prompt)
        raw_text = response.text.strip()

        # Handle potential markdown code blocks in the response
        if raw_text.startswith("```"):
            raw_text = raw_text.split("\n", 1)[1]  # Remove first line
            raw_text = raw_text.rsplit("```", 1)[0]  # Remove closing ```
            raw_text = raw_text.strip()

        events_data = json.loads(raw_text)
        events = [HistoryEvent(**e) for e in events_data]

        return HistoryResponse(date=date_str, events=events)

    except json.JSONDecodeError as e:
        raise HTTPException(
            status_code=500, detail=f"Failed to parse Gemini response: {str(e)}"
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Gemini API error: {str(e)}")


# Serve frontend static files
FRONTEND_DIR = os.path.join(os.path.dirname(__file__), "..", "frontend")
if os.path.isdir(FRONTEND_DIR):
    app.mount("/static", StaticFiles(directory=FRONTEND_DIR), name="static")

    @app.get("/")
    async def serve_frontend():
        return FileResponse(os.path.join(FRONTEND_DIR, "index.html"))
