document.addEventListener('DOMContentLoaded', () => {
    const mainContent = document.querySelector('.main-content');
    if (!mainContent) return;

    const imageUrl = mainContent.getAttribute('data-bg-img');
    if (!imageUrl) return;

    // Apply clear background to main-content
    mainContent.style.backgroundImage = `url(${imageUrl})`;
    mainContent.style.backgroundSize = 'cover';
    mainContent.style.backgroundPosition = 'center';
    mainContent.style.backgroundRepeat = 'no-repeat';
    mainContent.style.position = 'relative';

    // Create Canvas for the frosted overlay
    const canvas = document.createElement('canvas');
    canvas.style.position = 'absolute';
    canvas.style.top = '0';
    canvas.style.left = '0';
    canvas.style.width = '100%';
    canvas.style.height = '100%';
    canvas.style.zIndex = '0'; 
    canvas.style.pointerEvents = 'none'; // Allow interactions with cards
    canvas.style.transition = 'opacity 0.5s ease';
    
    // Make sure the main page content sits above the canvas
    const pageSection = mainContent.querySelector('.page');
    if (pageSection) {
        pageSection.style.position = 'relative';
        pageSection.style.zIndex = '1';
    }

    mainContent.insertBefore(canvas, mainContent.firstChild);

    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    let img = new Image();
    img.crossOrigin = "Anonymous";
    
    function drawFrostedGlass(alpha = 1.0) {
        if (!img.complete || img.naturalWidth === 0) return;
        
        const ratio = Math.max(canvas.width / img.width, canvas.height / img.height);
        const w = img.width * ratio;
        const h = img.height * ratio;
        const x = (canvas.width - w) / 2;
        const y = (canvas.height - h) / 2;
        
        ctx.globalCompositeOperation = 'source-over';
        ctx.globalAlpha = alpha;
        
        // Draw the image
        ctx.filter = 'blur(12px) brightness(0.85) contrast(1.1)';
        ctx.drawImage(img, x, y, w, h);
        
        // Add a "water droplet/condensation" texture tint
        ctx.fillStyle = 'rgba(230, 240, 255, 0.35)'; // Frosted whitish/blue tint
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.filter = 'none';
        ctx.globalAlpha = 1.0;
    }

    function resizeCanvas() {
        canvas.width = mainContent.offsetWidth;
        canvas.height = mainContent.offsetHeight;
        drawFrostedGlass();
    }

    img.onload = () => {
        resizeCanvas();
    };
    img.src = imageUrl;

    window.addEventListener('resize', resizeCanvas);

    // Wipe away condensation with cursor (simulate droplet paths)
    let lastMouseX = null;
    let lastMouseY = null;
    let isMouseOver = false;

    mainContent.addEventListener('mousemove', (e) => {
        isMouseOver = true;
        const rect = canvas.getBoundingClientRect();
        const mouseX = e.clientX - rect.left;
        const mouseY = e.clientY - rect.top;

        ctx.globalCompositeOperation = 'destination-out';
        
        const dropRadius = 60; // Size of the water droplet reveal
        
        ctx.fillStyle = 'rgba(0,0,0,1)';
        ctx.beginPath();
        ctx.arc(mouseX, mouseY, dropRadius, 0, Math.PI * 2);
        ctx.fill();

        // If moved fast, connect the dots for a smoother wipe trail
        if (lastMouseX !== null && lastMouseY !== null) {
            ctx.lineWidth = dropRadius * 2;
            ctx.lineCap = 'round';
            ctx.lineJoin = 'round';
            ctx.strokeStyle = 'rgba(0,0,0,1)';
            
            ctx.beginPath();
            ctx.moveTo(lastMouseX, lastMouseY);
            ctx.lineTo(mouseX, mouseY);
            ctx.stroke();
        }

        lastMouseX = mouseX;
        lastMouseY = mouseY;
    });

    mainContent.addEventListener('mouseleave', () => {
        isMouseOver = false;
        lastMouseX = null;
        lastMouseY = null;
    });

    // Slowly restore the frosted glass effect (condensation returning)
    function restoreFrost() {
        if (img.complete && img.naturalWidth !== 0) {
            // Restore slowly so the wiping effect leaves a trail that fades back
            drawFrostedGlass(0.012); 
        }
        requestAnimationFrame(restoreFrost);
    }
    
    // Start restoration loop
    requestAnimationFrame(restoreFrost);
});
