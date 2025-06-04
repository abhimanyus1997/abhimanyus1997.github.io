const isMobile = window.innerWidth <= 768;

VANTA.GLOBE({
    el: "#vanta-container",
    mouseControls: !isMobile,
    touchControls: true,
    gyroControls: false,
    minHeight: isMobile ? 150 : 200,
    minWidth: isMobile ? 150 : 200,
    scale: 1.00,
    scaleMobile: isMobile ? 0.5 : 1.00,
    backgroundcolor: 0x15162f,
    size: isMobile ? 0.30 : 0.70
});

// Pulsing Grid Animation
function setupPulsingGrid() {
    const container = document.getElementById("pulsing-grid");
    if (!container) return;
    container.innerHTML = "";
    const canvas = document.createElement("canvas");
    canvas.width = 180;
    canvas.height = 180;
    canvas.style.position = "absolute";
    canvas.style.left = "0";
    canvas.style.top = "0";
    container.appendChild(canvas);
    const ctx = canvas.getContext("2d");
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    let time = 0;
    let lastTime = 0;
    // Grid parameters
    const gridSize = 5; // 5x5 grid
    const spacing = 15;
    // Animation parameters
    const breathingSpeed = 0.5; // Speed of expansion/contraction
    const waveSpeed = 1.2; // Speed of wave patterns
    const colorPulseSpeed = 1.0; // Speed of color pulsing
    function animate(timestamp) {
        if (!lastTime) lastTime = timestamp;
        const deltaTime = timestamp - lastTime;
        lastTime = timestamp;
        time += deltaTime * 0.001;
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        // Calculate breathing effect - grid expands and contracts
        const breathingFactor = Math.sin(time * breathingSpeed) * 0.2 + 1.0; // 0.8 to 1.2
        // Draw center dot
        ctx.beginPath();
        ctx.arc(centerX, centerY, 3, 0, Math.PI * 2);
        ctx.fillStyle = "rgba(255, 255, 255, 0.9)";
        ctx.fill();
        // Draw pulsing grid pattern
        for (let row = 0; row < gridSize; row++) {
            for (let col = 0; col < gridSize; col++) {
                // Skip center point
                if (
                    row === Math.floor(gridSize / 2) &&
                    col === Math.floor(gridSize / 2)
                )
                    continue;
                // Calculate base position
                const baseX = (col - (gridSize - 1) / 2) * spacing;
                const baseY = (row - (gridSize - 1) / 2) * spacing;
                // Calculate distance and angle from center for effects
                const distance = Math.sqrt(baseX * baseX + baseY * baseY);
                const maxDistance = (spacing * Math.sqrt(2) * (gridSize - 1)) / 2;
                const normalizedDistance = distance / maxDistance;
                const angle = Math.atan2(baseY, baseX);
                // Apply complex wave effects
                // 1. Radial wave (expands from center)
                const radialPhase = (time - normalizedDistance) % 1;
                const radialWave = Math.sin(radialPhase * Math.PI * 2) * 4;
                // 2. Spiral wave (rotates around center)
                const spiralPhase = (angle / (Math.PI * 2) + time * 0.3) % 1;
                const spiralWave = Math.sin(spiralPhase * Math.PI * 2) * 3;
                // 3. Breathing effect (entire grid expands/contracts)
                const breathingX = baseX * breathingFactor;
                const breathingY = baseY * breathingFactor;
                // Combine all effects
                const waveX = centerX + breathingX + Math.cos(angle) * radialWave;
                const waveY = centerY + breathingY + Math.sin(angle) * radialWave;
                // Dot size varies with distance and time
                const baseSize = 1.5 + (1 - normalizedDistance) * 1.5;
                // Complex pulsing effect
                const pulseFactor =
                    Math.sin(time * 2 + normalizedDistance * 5) * 0.6 + 1;
                const size = baseSize * pulseFactor;
                // Color effects - subtle gradient between white and light blue
                const blueAmount =
                    Math.sin(time * colorPulseSpeed + normalizedDistance * 3) * 0.3 +
                    0.3;
                const whiteness = 1 - blueAmount;
                // Calculate RGB values
                const r = Math.floor(255 * whiteness + 200 * blueAmount);
                const g = Math.floor(255 * whiteness + 220 * blueAmount);
                const b = 255;
                // Calculate opacity with subtle pulse
                const opacity =
                    0.5 +
                    Math.sin(time * 1.5 + angle * 3) * 0.2 +
                    normalizedDistance * 0.3;
                // Draw connecting lines (create a network effect)
                if (row > 0 && col > 0 && row < gridSize - 1 && col < gridSize - 1) {
                    // Connect to adjacent points
                    const neighbors = [
                        {
                            r: row - 1,
                            c: col
                        }, // top
                        {
                            r: row,
                            c: col + 1
                        }, // right
                        {
                            r: row + 1,
                            c: col
                        }, // bottom
                        {
                            r: row,
                            c: col - 1
                        } // left
                    ];
                    for (const neighbor of neighbors) {
                        // Calculate neighbor position
                        const nBaseX = (neighbor.c - (gridSize - 1) / 2) * spacing;
                        const nBaseY = (neighbor.r - (gridSize - 1) / 2) * spacing;
                        // Apply breathing effect
                        const nBreathingX = nBaseX * breathingFactor;
                        const nBreathingY = nBaseY * breathingFactor;
                        // Skip center point
                        if (
                            neighbor.r === Math.floor(gridSize / 2) &&
                            neighbor.c === Math.floor(gridSize / 2)
                        )
                            continue;
                        // Calculate distance for line opacity
                        const lineDistance = Math.sqrt(
                            Math.pow(col - neighbor.c, 2) + Math.pow(row - neighbor.r, 2)
                        );
                        const lineOpacity =
                            0.1 + Math.sin(time * 1.5 + lineDistance * 2) * 0.05;
                        // Draw line
                        ctx.beginPath();
                        ctx.moveTo(waveX, waveY);
                        ctx.lineTo(centerX + nBreathingX, centerY + nBreathingY);
                        ctx.strokeStyle = `rgba(255, 255, 255, ${lineOpacity})`;
                        ctx.lineWidth = 0.5;
                        ctx.stroke();
                    }
                }
                // Draw dot
                ctx.beginPath();
                ctx.arc(waveX, waveY, size, 0, Math.PI * 2);
                ctx.fillStyle = `rgba(${r}, ${g}, ${b}, ${opacity})`;
                ctx.fill();
            }
        }
        requestAnimationFrame(animate);
    }
    requestAnimationFrame(animate);
}


// Typed.js effect
const roles = ["Computer Vision Engineer", "GenAI Specialist", "Data Scientist", "Software Engineer"];
let roleIndex = 0;
let charIndex = 0;
let isDeleting = false;

function typeText() {
    const currentRole = roles[roleIndex];
    const currentText = isDeleting
        ? currentRole.substring(0, charIndex - 1)
        : currentRole.substring(0, charIndex + 1);

    document.getElementById('typed').textContent = currentText;

    if (!isDeleting && charIndex === currentRole.length) {
        setTimeout(() => isDeleting = true, 1500);
    } else if (isDeleting && charIndex === 0) {
        isDeleting = false;
        roleIndex = (roleIndex + 1) % roles.length;
    }

    charIndex = isDeleting ? charIndex - 1 : charIndex + 1;
    setTimeout(typeText, isDeleting ? 50 : 150);
}

// Mobile menu toggle
document.getElementById('menu-toggle').addEventListener('click', function () {
    document.getElementById('mobile-menu').classList.toggle('hidden');
});

// Close mobile menu when clicking on a link
const mobileLinks = document.querySelectorAll('#mobile-menu a');
mobileLinks.forEach(link => {
    link.addEventListener('click', () => {
        document.getElementById('mobile-menu').classList.add('hidden');
    });
});

// Initialize after DOM content loaded
document.addEventListener('DOMContentLoaded', function () {
    typeText();

    // Smooth scrolling for navigation links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            document.querySelector(this.getAttribute('href')).scrollIntoView({
                behavior: 'smooth'
            });
        });
    });
});