# Background Remover API

This is a simple API built with FastAPI to remove the background from an image.

## Setup

1.  **Clone the repository or download the files.**

2.  **Navigate to the project directory:**
    ```bash
    cd C:\background-remover-api
    ```

3.  **Create a virtual environment:**
    ```bash
    python -m venv venv
    ```

4.  **Activate the virtual environment:**
    ```bash
    venv\Scripts\activate
    ```

5.  **Install the dependencies:**
    ```bash
    pip install -r requirements.txt
    ```
    *(Note: You will need to create a `requirements.txt` file. You can do this by running `pip freeze > requirements.txt` after installing the dependencies as we did in the previous steps)*

6.  **Create a `.env` file** in the root directory and add your API key:
    ```
    API_KEY=your_secret_api_key_here
    ```

## Running the API

To run the API, use the following command from the project directory:

```bash
uvicorn main:app --reload
```

The API will be available at `http://127.0.0.1:8000`.

## API Endpoint

### Remove Background

*   **URL:** `/remove-background/`
*   **Method:** `POST`
*   **Headers:**
    *   `X-API-Key`: Your secret API key.
*   **Request Body:**
    *   `file`: The image file to process (multipart/form-data).

### Example cURL Request

```bash
curl -X POST "http://127.0.0.1:8000/remove-background/" \
-H "X-API-Key: your_secret_api_key_here" \
-F "file=@/path/to/your/image.jpg" \
--output result.png
```

This will save the resulting image with the background removed as `result.png`.