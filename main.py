import os
from fastapi import FastAPI, HTTPException, Request, Response
from fastapi.responses import StreamingResponse, FileResponse
from fastapi.staticfiles import StaticFiles
from fastapi.middleware.cors import CORSMiddleware
import httpx
from dotenv import load_dotenv

# Load env variables from .env
load_dotenv()

LITELLM_BASE_URL = os.getenv("LITELLM_BASE_URL") or os.getenv("VITE_LITELLM_BASE_URL") or "http://13.126.102.204:4000"
LITELLM_API_KEY = os.getenv("LITELLM_API_KEY") or os.getenv("VITE_LITELLM_API_KEY")
TTS_BASE_URL = os.getenv("TTS_BASE_URL") or "http://13.126.102.204:5555/tts"

app = FastAPI(title="AS Portfolio Backend API")

# Enable CORS for local Vite dev server
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Async HTTP Client for httpx
client = httpx.AsyncClient()

@app.on_event("shutdown")
async def shutdown_event():
    await client.aclose()

@app.get("/api/models")
async def get_models():
    if not LITELLM_API_KEY:
        raise HTTPException(status_code=500, detail="LiteLLM API key not configured")
    
    url = f"{LITELLM_BASE_URL.rstrip('/')}/v1/models"
    headers = {"Authorization": f"Bearer {LITELLM_API_KEY}"}
    
    try:
        response = await client.get(url, headers=headers, timeout=10.0)
        response.raise_for_status()
        return response.json()
    except httpx.HTTPStatusError as exc:
        raise HTTPException(status_code=exc.response.status_code, detail=f"LiteLLM error: {exc.response.text}")
    except Exception as exc:
        raise HTTPException(status_code=500, detail=str(exc))

@app.post("/api/chat")
async def chat_completion(request: Request):
    if not LITELLM_API_KEY:
        raise HTTPException(status_code=500, detail="LiteLLM API key not configured")
        
    url = f"{LITELLM_BASE_URL.rstrip('/')}/v1/chat/completions"
    headers = {
        "Authorization": f"Bearer {LITELLM_API_KEY}",
        "Content-Type": "application/json"
    }
    
    try:
        body = await request.json()
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid JSON body")

    # If stream requested, stream it back chunk by chunk
    if body.get("stream", False):
        async def stream_generator():
            try:
                async with client.stream("POST", url, headers=headers, json=body, timeout=60.0) as r:
                    r.raise_for_status()
                    async for chunk in r.aiter_bytes():
                        yield chunk
            except Exception as e:
                yield f"data: {{\"error\": \"{str(e)}\"}}\n\n".encode("utf-8")

        return StreamingResponse(stream_generator(), media_type="text/event-stream")
    else:
        try:
            response = await client.post(url, headers=headers, json=body, timeout=30.0)
            response.raise_for_status()
            return response.json()
        except httpx.HTTPStatusError as exc:
            raise HTTPException(status_code=exc.response.status_code, detail=exc.response.text)
        except Exception as exc:
            raise HTTPException(status_code=500, detail=str(exc))

@app.post("/api/tts")
async def text_to_speech(request: Request):
    try:
        body = await request.json()
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid JSON body")
        
    text = body.get("text")
    if not text:
        raise HTTPException(status_code=400, detail="Text parameter is required")
        
    voice_url = body.get("voice_url")
    
    files = {"text": (None, text)}
    if voice_url:
         files["voice_url"] = (None, voice_url)

    try:
        response = await client.post(TTS_BASE_URL, data=files, timeout=30.0)
        response.raise_for_status()
        return Response(content=response.content, media_type="audio/wav")
    except httpx.HTTPStatusError as exc:
        raise HTTPException(status_code=exc.response.status_code, detail=f"TTS service error: {exc.response.text}")
    except Exception as exc:
        raise HTTPException(status_code=500, detail=str(exc))

# Mount Vite build outputs
dist_dir = os.path.join(os.path.dirname(__file__), "dist")
if os.path.exists(dist_dir):
    app.mount("/", StaticFiles(directory=dist_dir, html=True), name="static")
    
    # Catch-all to support Single Page Applications routing
    @app.exception_handler(404)
    async def custom_404_handler(request, __):
        return FileResponse(os.path.join(dist_dir, "index.html"))
else:
    @app.get("/")
    async def root():
        return {"message": "API Backend is running! Front-end assets not built yet. Run 'npm run build' to serve them here."}
