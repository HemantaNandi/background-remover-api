from fastapi import FastAPI, File, UploadFile, Depends, HTTPException, status
from fastapi.security import APIKeyHeader
from fastapi.responses import StreamingResponse
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
from fastapi.middleware.cors import CORSMiddleware
import io
import os
import logging
from dotenv import load_dotenv
from rembg import remove
from PIL import Image

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI()

@app.middleware("http")
async def log_requests(request, call_next):
    logger.info(f"Incoming request: {request.method} {request.url}")
    logger.info(f"Headers: {request.headers}")
    response = await call_next(request)
    return response

# Get port from environment variable, default to 8000
port = int(os.getenv("PORT", 8000))

# Mount the 'static' directory to serve static files
app.mount("/static", StaticFiles(directory="static"), name="static")
 
@app.get("/")
async def read_root():
    return FileResponse('static/index.html')

@app.get("/api-key")
async def get_api_key_for_frontend():
    return {"api_key": API_KEY}

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allows all origins
    allow_credentials=True,
    allow_methods=["*"],  # Allows all methods
    allow_headers=["*"],  # Allows all headers
)

load_dotenv()
API_KEY = os.getenv("API_KEY")
api_key_header = APIKeyHeader(name="X-API-Key")

async def get_api_key(api_key: str = Depends(api_key_header)):
    if api_key != API_KEY:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid API Key",
        )
    return api_key

def remove_background(image_path):
    with open(image_path, "rb") as f:
        input_image = f.read()
    output_image = remove(input_image)
    return Image.open(io.BytesIO(output_image))

@app.post("/remove-background/")
async def remove_background_api(file: UploadFile = File(...), api_key: str = Depends(get_api_key)):
    try:
        # Save the uploaded file temporarily
        with open("temp_image.jpg", "wb") as buffer:
            buffer.write(await file.read())

        # Remove the background
        result_image = remove_background("temp_image.jpg")

        # Save the result to a byte stream
        img_byte_arr = io.BytesIO()
        result_image.save(img_byte_arr, format='PNG')
        img_byte_arr.seek(0)

        return StreamingResponse(img_byte_arr, media_type="image/png")
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
