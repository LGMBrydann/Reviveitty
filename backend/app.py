from fastapi import FastAPI
from pydantic import BaseModel, Field

app = FastAPI(title="Ditty Revival API", version="0.1.0")


class GenerateRequest(BaseModel):
    lyrics: str = Field(min_length=1, max_length=5000)
    song_id: str
    voice_id: str
    caption_animation: str = "pop"


@app.get("/api/health")
def health():
    return {"ok": True, "service": "ditty-revival"}


@app.post("/api/generate")
def generate(request: GenerateRequest):
    # This is intentionally a placeholder.
    # The next backend stage will:
    # 1. Convert lyrics to phonemes/syllables.
    # 2. Map syllables to the selected melody.
    # 3. Generate singing audio.
    # 4. Mix vocals with the instrumental.
    # 5. Render timed captions over the uploaded background.
    # 6. Export an MP4.
    return {
        "status": "queued",
        "message": "Singing renderer not installed yet.",
        "song_id": request.song_id,
        "voice_id": request.voice_id,
    }
