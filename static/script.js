let apiKey = '';

document.addEventListener('DOMContentLoaded', async () => {
    try {
        const response = await fetch('http://127.0.0.1:8000/api-key');
        const data = await response.json();
        apiKey = data.api_key;
    } catch (error) {
        console.error('Error fetching API key:', error);
        alert('Could not fetch API key. Please check the server.');
    }
});

async function removeBackground() {
    const imageInput = document.getElementById('imageInput');
    const resultImage = document.getElementById('resultImage');

    if (imageInput.files.length === 0) {
        alert('Please select an image file.');
        return;
    }

    if (!apiKey) {
        alert('API key not loaded yet. Please try again in a moment.');
        return;
    }

    const formData = new FormData();
    formData.append('file', imageInput.files[0]);

    try {
        const response = await fetch('http://127.0.0.1:8000/remove-background/', {
            method: 'POST',
            headers: {
                'X-API-Key': apiKey,
            },
            body: formData,
        });

        if (response.ok) {
            const blob = await response.blob();
            const imageUrl = URL.createObjectURL(blob);
            resultImage.src = imageUrl;
        } else {
            alert('Error removing background: ' + response.statusText);
        }
    } catch (error) {
        console.error('Error:', error);
        alert('An error occurred while processing the request.');
    }
}