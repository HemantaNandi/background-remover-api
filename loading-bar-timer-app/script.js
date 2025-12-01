const startButton = document.getElementById('start-button');
const loadingBar = document.getElementById('loading-bar');
const timeTakenSpan = document.getElementById('time-taken');
const downloadButton = document.getElementById('download-button');
const imageUpload = document.getElementById('image-upload');
const uploadLabel = document.getElementById('upload-label');
const processedImage = document.getElementById('processed-image');
const loadingBarContainer = document.querySelector('.loading-bar-container');
const timeTakenP = document.getElementById('time-taken-p');
const title = document.getElementById('title');

let uploadedImageURL = null;
let originalFile = null;

imageUpload.addEventListener('change', (event) => {
    const file = event.target.files[0];
    if (file) {
        originalFile = file;
        const reader = new FileReader();
        reader.onload = (e) => {
            uploadedImageURL = e.target.result;
            
            uploadLabel.classList.add('hidden');
            processedImage.src = uploadedImageURL;
            processedImage.classList.remove('hidden');

            startButton.disabled = false;
            // Reset state
            downloadButton.style.display = 'none';
            loadingBarContainer.style.display = 'none';
            timeTakenP.style.display = 'none';
            loadingBar.style.width = '0%';
        };
        reader.readAsDataURL(file);
    }
});

startButton.addEventListener('click', () => {
    if (!originalFile) return;

    let progress = 0;
    let timeTaken = 0;
    const startTime = performance.now();

    startButton.disabled = true;
    loadingBarContainer.style.display = 'block';
    timeTakenP.style.display = 'block';
    title.textContent = 'Removing Background...';

    const progressInterval = setInterval(() => {
        progress++;
        if (progress >= 99) {
            clearInterval(progressInterval);
        }
        loadingBar.style.width = progress + '%';
    }, 50);

    // Use the @imgly/background-removal library
    imglyRemoveBackground(originalFile).then((blob) => {
        const endTime = performance.now();
        timeTaken = ((endTime - startTime) / 1000).toFixed(2);
        timeTakenSpan.textContent = timeTaken;

        loadingBar.style.width = '100%';
        title.textContent = 'Background Removed!';

        uploadedImageURL = URL.createObjectURL(blob);
        processedImage.src = uploadedImageURL;

        setTimeout(() => {
            startButton.disabled = false;
            downloadButton.style.display = 'inline-block';
        }, 500);

    }).catch((error) => {
        console.error("Error removing background:", error);
        title.textContent = 'Error! Please try again.';
        // Handle error, e.g., show a message to the user
        clearInterval(progressInterval);
        loadingBar.style.width = '0%';
        startButton.disabled = false;
    });
});

downloadButton.addEventListener('click', () => {
    if (!uploadedImageURL) return;
    const a = document.createElement('a');
    a.href = uploadedImageURL;
    a.download = 'image.png';
    a.click();
});