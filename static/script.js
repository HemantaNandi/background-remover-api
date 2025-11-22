document.addEventListener('DOMContentLoaded', () => {
    const imageUpload = document.getElementById('image-upload');
    const uploadBtn = document.getElementById('upload-btn');
    const removeBgBtn = document.getElementById('remove-bg-btn');
    const originalImage = document.getElementById('original-image');
    const resultImage = document.getElementById('result-image');
    const downloadBtn = document.getElementById('download-btn');
    
    let uploadedFile = null;

    uploadBtn.addEventListener('click', () => {
        imageUpload.click();
    });

    imageUpload.addEventListener('change', (event) => {
        uploadedFile = event.target.files[0];
        if (uploadedFile) {
            const reader = new FileReader();
            reader.onload = (e) => {
                originalImage.src = e.target.result;
                originalImage.style.display = 'block';
                resultImage.style.display = 'none';
                downloadBtn.style.display = 'none';
            };
            reader.readAsDataURL(uploadedFile);
        }
    });

    removeBgBtn.addEventListener('click', async () => {
        if (!uploadedFile) {
            alert('Please upload an image first.');
            return;
        }

        let apiKey = '';
        try {
            const response = await fetch('/api-key');
            if (response.ok) {
                const data = await response.json();
                apiKey = data.api_key;
            } else {
                console.error('Failed to fetch API key');
                alert('Error: Could not fetch API key.');
                return;
            }
        } catch (error) {
            console.error('An error occurred while fetching the API key:', error);
            alert('An error occurred while fetching the API key.');
            return;
        }

        const formData = new FormData();
        formData.append('file', uploadedFile);

        try {
            const response = await fetch('/remove-background/', {
                method: 'POST',
                headers: {
                    'X-API-Key': apiKey,
                },
                body: formData,
            });

            if (response.ok) {
                const blob = await response.blob();
                const url = URL.createObjectURL(blob);
                resultImage.src = url;
                resultImage.style.display = 'block';
                originalImage.style.display = 'none';
                downloadBtn.href = url;
                downloadBtn.style.display = 'block';
            } else {
                const error = await response.json();
                alert(`Error: ${error.detail}`);
            }
        } catch (error) {
            console.error('An error occurred:', error);
            alert('An error occurred while removing the background.');
        }
    });
});