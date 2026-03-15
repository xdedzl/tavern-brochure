const canvas = document.getElementById('starCanvas');
const ctx = canvas.getContext('2d');

let width, height;
let stars = [];

function init() {
    resize();
    createStars();
    animate();
    refreshImageList();
}

function resize() {
    width = canvas.width = window.innerWidth;
    height = canvas.height = window.innerHeight;
}

function createStars() {
    stars = [];
    // Reduce density on mobile or smaller screens for performance
    const density = width < 768 ? 8000 : 4000;
    const count = Math.floor((width * height) / density);
    for (let i = 0; i < count; i++) {
        stars.push({
            x: Math.random() * width,
            y: Math.random() * height,
            size: Math.random() * 2,
            opacity: Math.random(),
            speed: Math.random() * 0.05 + 0.01
        });
    }
}

function animate() {
    ctx.clearRect(0, 0, width, height);
    
    const gradient = ctx.createRadialGradient(width/2, height/2, 0, width/2, height/2, width/1.5);
    gradient.addColorStop(0, 'rgba(138, 43, 226, 0.05)');
    gradient.addColorStop(1, 'transparent');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, width, height);

    stars.forEach(star => {
        ctx.fillStyle = `rgba(255, 255, 255, ${star.opacity})`;
        ctx.beginPath();
        ctx.arc(star.x, star.y, star.size, 0, Math.PI * 2);
        ctx.fill();

        star.opacity += star.speed;
        if (star.opacity > 1 || star.opacity < 0.1) {
            star.speed = -star.speed;
        }
    });

    requestAnimationFrame(animate);
}

window.addEventListener('resize', () => {
    resize();
    createStars();
});

// Gallery & Modal Logic
const modal = document.getElementById("imageModal");
const modalImg = document.getElementById("modalImg");
const captionText = document.getElementById("caption");

let allImages = [];
let currentIndex = 0;

function refreshImageList() {
    // Collect all images in the document that should be part of the gallery
    const imageElements = document.querySelectorAll('.showcase-item img, .gallery-item img');
    allImages = Array.from(imageElements).map(img => ({
        src: img.src,
        caption: getCaption(img)
    }));
    
    imageElements.forEach((img, index) => {
        img.style.cursor = 'zoom-in';
        img.onclick = () => openModal(index);
    });
}

function getCaption(img) {
    if (img.nextElementSibling && img.nextElementSibling.classList.contains('caption')) {
        return img.nextElementSibling.innerHTML;
    } else if (img.parentElement.querySelector('p')) {
        return img.parentElement.querySelector('p').innerHTML;
    } else {
        return img.alt || "";
    }
}

function openModal(index) {
    currentIndex = index;
    modal.style.display = "block";
    updateModalContent();
}

function updateModalContent() {
    const data = allImages[currentIndex];
    modalImg.src = data.src;
    captionText.innerHTML = data.caption;
}

function nextImage() {
    currentIndex = (currentIndex + 1) % allImages.length;
    updateModalContent();
}

function prevImage() {
    currentIndex = (currentIndex - 1 + allImages.length) % allImages.length;
    updateModalContent();
}

// Controls
document.querySelector('.close').onclick = () => modal.style.display = "none";
document.querySelector('.modal-nav.next').onclick = (e) => { e.stopPropagation(); nextImage(); };
document.querySelector('.modal-nav.prev').onclick = (e) => { e.stopPropagation(); prevImage(); };

modal.onclick = (e) => {
    if (e.target === modal || e.target === modalImg) {
        if (e.target === modal) modal.style.display = "none";
    }
};

document.addEventListener('keydown', (e) => {
    if (modal.style.display === "block") {
        if (e.key === "ArrowRight") nextImage();
        if (e.key === "ArrowLeft") prevImage();
        if (e.key === "Escape") modal.style.display = "none";
    }
});

// Swipe support
let touchstartX = 0;
let touchendX = 0;

function handleGesture() {
    if (touchendX < touchstartX - 50) nextImage();
    if (touchendX > touchstartX + 50) prevImage();
}

modal.addEventListener('touchstart', e => {
    touchstartX = e.changedTouches[0].screenX;
}, false);

modal.addEventListener('touchend', e => {
    touchendX = e.changedTouches[0].screenX;
    handleGesture();
}, false);

// Feature Cards Toggle
document.querySelectorAll('.feature-card').forEach(card => {
    card.addEventListener('click', () => {
        const isActive = card.classList.contains('active');
        
        // Close all other cards
        document.querySelectorAll('.feature-card').forEach(c => c.classList.remove('active'));
        
        // If the clicked card wasn't active, open it
        if (!isActive) {
            card.classList.add('active');
            // Scroll to the card so it's centered
            setTimeout(() => {
                card.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
            }, 100);
        }
    });
});

// Generic Drag to scroll function
function enableDragScroll(selector) {
    const slider = document.querySelector(selector);
    if (!slider) return;

    let isDown = false;
    let startX;
    let scrollLeft;

    slider.addEventListener('mousedown', (e) => {
        // Prevent default browser image dragging which causes conflicts
        if (e.target.tagName === 'IMG') {
            e.preventDefault();
        }
        isDown = true;
        slider.classList.add('grabbing');
        startX = e.pageX - slider.offsetLeft;
        scrollLeft = slider.scrollLeft;
    });

    slider.addEventListener('mouseleave', () => {
        isDown = false;
        slider.classList.remove('grabbing');
    });

    slider.addEventListener('mouseup', () => {
        isDown = false;
        slider.classList.remove('grabbing');
    });

    slider.addEventListener('mousemove', (e) => {
        if (!isDown) return;
        e.preventDefault();
        const x = e.pageX - slider.offsetLeft;
        const walk = (x - startX) * 2; 
        slider.scrollLeft = scrollLeft - walk;
    });
}

// Enable drag for all sliders
enableDragScroll('.feature-grid');
enableDragScroll('.gallery');

// Scroll animations
const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('fade-in');
        }
    });
}, { threshold: 0.1 });

document.querySelectorAll('.section').forEach(section => {
    // Check if section is already in view on load
    const rect = section.getBoundingClientRect();
    if (rect.top < window.innerHeight) {
        section.classList.add('fade-in');
    }
    observer.observe(section);
});

init();
