let personImg = null;
let clothingImg = null;
let canvas = document.getElementById('mainCanvas');
let ctx = canvas.getContext('2d');
let webcamStream = null;
let isWebcamActive = false;

// DOM Elements
const personImageInput = document.getElementById('personImage');
const clothingImageInput = document.getElementById('clothingImage');
const personFileName = document.getElementById('personFileName');
const clothingFileName = document.getElementById('clothingFileName');
const startWebcamBtn = document.getElementById('startWebcam');
const capturePhotoBtn = document.getElementById('capturePhoto');
const stopWebcamBtn = document.getElementById('stopWebcam');
const webcamElement = document.getElementById('webcam');
const applyTryonBtn = document.getElementById('applyTryon');
const resetCanvasBtn = document.getElementById('resetCanvas');
const downloadResultBtn = document.getElementById('downloadResult');
const canvasPlaceholder = document.getElementById('canvasPlaceholder');

// Slider Controls
const xPositionSlider = document.getElementById('xPosition');
const yPositionSlider = document.getElementById('yPosition');
const clothingSizeSlider = document.getElementById('clothingSize');
const clothingOpacitySlider = document.getElementById('clothingOpacity');
const xValue = document.getElementById('xValue');
const yValue = document.getElementById('yValue');
const sizeValue = document.getElementById('sizeValue');
const opacityValue = document.getElementById('opacityValue');

// Initialize Canvas
canvas.width = 800;
canvas.height = 600;

// Smooth Scroll for Navigation
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    });
});

// Active Navigation Link
window.addEventListener('scroll', () => {
    const sections = document.querySelectorAll('section');
    const navLinks = document.querySelectorAll('.nav-link');
    
    let current = '';
    sections.forEach(section => {
        const sectionTop = section.offsetTop;
        const sectionHeight = section.clientHeight;
        if (scrollY >= sectionTop - 200) {
            current = section.getAttribute('id');
        }
    });

    navLinks.forEach(link => {
        link.classList.remove('active');
        if (link.getAttribute('href') === `#${current}`) {
            link.classList.add('active');
        }
    });
});

// Person Image Upload
personImageInput.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (file) {
        personFileName.textContent = file.name;
        const reader = new FileReader();
        reader.onload = (event) => {
            personImg = new Image();
            personImg.onload = () => {
                drawCanvas();
            };
            personImg.src = event.target.result;
        };
        reader.readAsDataURL(file);
    }
});

// Clothing Image Upload
clothingImageInput.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (file) {
        clothingFileName.textContent = file.name;
        const reader = new FileReader();
        reader.onload = (event) => {
            clothingImg = new Image();
            clothingImg.onload = () => {
                drawCanvas();
            };
            clothingImg.src = event.target.result;
        };
        reader.readAsDataURL(file);
    }
});

// Webcam Functions
startWebcamBtn.addEventListener('click', async () => {
    try {
        webcamStream = await navigator.mediaDevices.getUserMedia({ 
            video: { width: 800, height: 600 } 
        });
        webcamElement.srcObject = webcamStream;
        webcamElement.style.display = 'block';
        canvas.style.display = 'none';
        canvasPlaceholder.style.display = 'none';
        isWebcamActive = true;
        
        startWebcamBtn.style.display = 'none';
        capturePhotoBtn.style.display = 'block';
        stopWebcamBtn.style.display = 'block';
    } catch (error) {
        alert('Unable to access webcam. Please ensure you have granted camera permissions.');
        console.error('Webcam error:', error);
    }
});

capturePhotoBtn.addEventListener('click', () => {
    // Set canvas dimensions to match video
    canvas.width = webcamElement.videoWidth;
    canvas.height = webcamElement.videoHeight;
    
    // Draw video frame to canvas
    ctx.drawImage(webcamElement, 0, 0, canvas.width, canvas.height);
    
    // Convert canvas to image
    personImg = new Image();
    personImg.onload = () => {
        stopWebcam();
        drawCanvas();
    };
    personImg.src = canvas.toDataURL('image/png');
});

stopWebcamBtn.addEventListener('click', () => {
    stopWebcam();
});

function stopWebcam() {
    if (webcamStream) {
        webcamStream.getTracks().forEach(track => track.stop());
        webcamStream = null;
    }
    webcamElement.style.display = 'none';
    canvas.style.display = 'block';
    isWebcamActive = false;
    
    startWebcamBtn.style.display = 'block';
    capturePhotoBtn.style.display = 'none';
    stopWebcamBtn.style.display = 'none';
}

// Slider Updates
xPositionSlider.addEventListener('input', (e) => {
    xValue.textContent = e.target.value + '%';
    drawCanvas();
});

yPositionSlider.addEventListener('input', (e) => {
    yValue.textContent = e.target.value + '%';
    drawCanvas();
});

clothingSizeSlider.addEventListener('input', (e) => {
    sizeValue.textContent = e.target.value + '%';
    drawCanvas();
});

clothingOpacitySlider.addEventListener('input', (e) => {
    opacityValue.textContent = e.target.value + '%';
    drawCanvas();
});

// Draw Canvas Function
function drawCanvas() {
    if (!personImg) {
        return;
    }

    // Hide placeholder
    canvasPlaceholder.style.display = 'none';
    
    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Calculate aspect ratio for person image
    const scale = Math.min(canvas.width / personImg.width, canvas.height / personImg.height);
    const x = (canvas.width / 2) - (personImg.width / 2) * scale;
    const y = (canvas.height / 2) - (personImg.height / 2) * scale;
    
    // Draw person image
    ctx.drawImage(personImg, x, y, personImg.width * scale, personImg.height * scale);
    
    // Draw clothing overlay if available
    if (clothingImg) {
        const xPos = parseInt(xPositionSlider.value);
        const yPos = parseInt(yPositionSlider.value);
        const size = parseInt(clothingSizeSlider.value);
        const opacity = parseInt(clothingOpacitySlider.value);
        
        // Calculate clothing dimensions
        const clothingWidth = (canvas.width * size) / 100;
        const clothingHeight = (clothingImg.height / clothingImg.width) * clothingWidth;
        
        // Calculate position
        const clothingX = (canvas.width * xPos) / 100 - clothingWidth / 2;
        const clothingY = (canvas.height * yPos) / 100 - clothingHeight / 2;
        
        // Set opacity
        ctx.globalAlpha = opacity / 100;
        
        // Draw clothing
        ctx.drawImage(clothingImg, clothingX, clothingY, clothingWidth, clothingHeight);
        
        // Reset opacity
        ctx.globalAlpha = 1.0;
    }
}

// Apply Try-On Button
applyTryonBtn.addEventListener('click', () => {
    if (!personImg) {
        alert('Please upload a person image or capture from webcam first!');
        return;
    }
    if (!clothingImg) {
        alert('Please upload a clothing image!');
        return;
    }
    drawCanvas();
});

// Reset Canvas
resetCanvasBtn.addEventListener('click', () => {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    personImg = null;
    clothingImg = null;
    canvasPlaceholder.style.display = 'flex';
    personFileName.textContent = 'No file chosen';
    clothingFileName.textContent = 'No file chosen';
    personImageInput.value = '';
    clothingImageInput.value = '';
    
    // Reset sliders
    xPositionSlider.value = 50;
    yPositionSlider.value = 30;
    clothingSizeSlider.value = 70;
    clothingOpacitySlider.value = 90;
    xValue.textContent = '50%';
    yValue.textContent = '30%';
    sizeValue.textContent = '70%';
    opacityValue.textContent = '90%';
    
    if (isWebcamActive) {
        stopWebcam();
    }
});

// Download Result
downloadResultBtn.addEventListener('click', () => {
    if (!personImg) {
        alert('Please create a try-on result first!');
        return;
    }
    
    const link = document.createElement('a');
    link.download = 'tryon-genie-result.png';
    link.href = canvas.toDataURL('image/png');
    link.click();
});

// Add scroll animation observer
const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -100px 0px'
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.style.opacity = '1';
            entry.target.style.transform = 'translateY(0)';
        }
    });
}, observerOptions);

// Observe feature cards
document.querySelectorAll('.feature-card').forEach((card) => {
    card.style.opacity = '0';
    card.style.transform = 'translateY(30px)';
    card.style.transition = 'all 0.6s ease-out';
    observer.observe(card);
});
