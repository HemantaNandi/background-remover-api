from fastapi import FastAPI, File, UploadFile, Depends, HTTPException, status
from fastapi.security import APIKeyHeader
from fastapi.responses import StreamingResponse
from fastapi.staticfiles import StaticFiles
from fastapi.middleware.cors import CORSMiddleware
import io
import os
from dotenv import load_dotenv
import torch
from torchvision.models.segmentation import deeplabv3_resnet101
from PIL import Image
import torchvision.transforms as T
import numpy as np

app = FastAPI()

# Mount the 'static' directory to serve static files
app.mount("/static", StaticFiles(directory="static"), name="static")

@app.get("/")
async def read_root():
    return {"message": "API is running"}

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

# Load the pre-trained model
model = deeplabv3_resnet101(pretrained=True)
model.eval()

# Define the transformation
transform = T.Compose([
    T.ToTensor(),
    T.Normalize(mean=[0.485, 0.456, 0.406], std=[0.229, 0.224, 0.225]),
])

def remove_background(image_path):
    input_image = Image.open(image_path).convert("RGB")
    input_tensor = transform(input_image)
    input_batch = input_tensor.unsqueeze(0)

    with torch.no_grad():
        output = model(input_batch)['out'][0]
    output_predictions = output.argmax(0)

    # create a binary (black and white) mask of the profile foreground
    mask = output_predictions.byte().cpu().numpy()
    background = np.zeros(mask.shape)
    bin_mask = np.where(mask, 255, background).astype(np.uint8)

    # apply the binary mask to the original image
    # Create a new image with an alpha channel
    output_image = Image.new("RGBA", input_image.size)
    output_image.paste(input_image, (0, 0))

    # Apply the mask to the alpha channel
    alpha = Image.fromarray(bin_mask)
    output_image.putalpha(alpha)

    return output_image

@app.post("/remove-background/")
async def remove_background_api(file: UploadFile = File(...), api_key: str = Depends(get_api_key)):
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