/* ==========================================================================
   DATOS CURIOSOS DE LA BIBLIA — MOTOR DE NAVEGACIÓN POR DIAPOSITIVAS HORIZONTALES
   ========================================================================== */

(function () {
    let currentSlideIndex = 0;
    let slides = [];
    let totalSlides = 0;
    let progressFill = null;
    let slideCounter = null;

    // 1. Particle Canvas Background Engine
    const canvas = document.getElementById('particles-canvas');
    const ctx = canvas ? canvas.getContext('2d') : null;
    let particles = [];
    let width = 0;
    let height = 0;

    function resizeCanvas() {
        if (!canvas) return;
        width = window.innerWidth;
        height = window.innerHeight;
        canvas.width = width;
        canvas.height = height;
        initParticles();
    }

    function initParticles() {
        particles = [];
        const count = Math.floor(width * 0.08);
        for (let i = 0; i < count; i++) {
            particles.push({
                x: Math.random() * width,
                y: Math.random() * height,
                radius: Math.random() * 1.8 + 0.5,
                color: Math.random() > 0.4 ? 'rgba(212, 175, 55, ' : 'rgba(255, 255, 255, ',
                alpha: Math.random() * 0.6 + 0.2,
                vx: (Math.random() - 0.5) * 0.3,
                vy: (Math.random() - 0.5) * 0.3 - 0.1
            });
        }
    }

    function drawParticles() {
        if (!ctx) return;
        ctx.clearRect(0, 0, width, height);

        particles.forEach(p => {
            p.x += p.vx;
            p.y += p.vy;

            if (p.x < 0) p.x = width;
            if (p.x > width) p.x = 0;
            if (p.y < 0) p.y = height;
            if (p.y > height) p.y = 0;

            ctx.beginPath();
            ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
            ctx.fillStyle = p.color + p.alpha + ')';
            ctx.fill();
        });

        requestAnimationFrame(drawParticles);
    }

    // 2. Horizontal Slide Engine Initialization
    function initPresentation() {
        slides = Array.from(document.querySelectorAll('.slide-scene'));
        totalSlides = slides.length;
        progressFill = document.getElementById('progress-fill');
        slideCounter = document.getElementById('slide-counter');

        window.focus();
        if (document.body) {
            document.body.setAttribute('tabindex', '0');
            document.body.focus();
        }

        updateSlideState();
        bindNavigationEvents();
    }

    function updateSlideState() {
        if (!slides.length) return;

        slides.forEach((slide, idx) => {
            slide.classList.remove('active', 'prev-slide');

            if (idx === currentSlideIndex) {
                slide.classList.add('active');
                triggerSlideAnimations(slide);
            } else if (idx < currentSlideIndex) {
                slide.classList.add('prev-slide');
            }
        });

        // Update Progress Fill Bar
        const progressPercent = ((currentSlideIndex + 1) / totalSlides) * 100;
        if (progressFill) {
            progressFill.style.width = `${progressPercent}%`;
        }

        // Update Slide Counter Badge (e.g., 01 / 11)
        if (slideCounter) {
            const formattedCurrent = String(currentSlideIndex + 1).padStart(2, '0');
            const formattedTotal = String(totalSlides).padStart(2, '0');
            slideCounter.textContent = `${formattedCurrent} / ${formattedTotal}`;
        }
    }

    let isTransitioning = false;

    function nextSlide() {
        if (isTransitioning) return;
        if (currentSlideIndex < totalSlides - 1) {
            isTransitioning = true;
            currentSlideIndex++;
            updateSlideState();
            setTimeout(() => { isTransitioning = false; }, 350);
        }
    }

    function prevSlide() {
        if (isTransitioning) return;
        if (currentSlideIndex > 0) {
            isTransitioning = true;
            currentSlideIndex--;
            updateSlideState();
            setTimeout(() => { isTransitioning = false; }, 350);
        }
    }

    function goToSlide(index) {
        if (isTransitioning) return;
        if (index >= 0 && index < totalSlides && index !== currentSlideIndex) {
            isTransitioning = true;
            currentSlideIndex = index;
            updateSlideState();
            setTimeout(() => { isTransitioning = false; }, 350);
        }
    }

    // 3. Counter Animation on Active Slide
    function triggerSlideAnimations(slide) {
        const counterCards = slide.querySelectorAll('[data-counter]');
        counterCards.forEach(card => {
            const numEl = card.querySelector('.kinetic-number');
            const targetNum = parseInt(card.dataset.counter, 10);
            if (numEl && targetNum && !card.dataset.animated) {
                card.dataset.animated = 'true';
                animateValue(numEl, 0, targetNum, 1800);
            }
        });
    }

    function animateValue(obj, start, end, duration) {
        let startTimestamp = null;
        const step = (timestamp) => {
            if (!startTimestamp) startTimestamp = timestamp;
            const progress = Math.min((timestamp - startTimestamp) / duration, 1);
            const easeProgress = 1 - Math.pow(1 - progress, 3);
            const currentVal = Math.floor(easeProgress * (end - start) + start);
            obj.textContent = currentVal.toLocaleString('es-ES');
            if (progress < 1) {
                window.requestAnimationFrame(step);
            } else {
                obj.textContent = end.toLocaleString('es-ES');
            }
        };
        window.requestAnimationFrame(step);
    }

    // 4. Bind Keyboard & Mouse Events
    function handleKeyDown(e) {
        if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;

        const key = e.key;

        if (key === 'ArrowRight' || key === 'ArrowDown' || key === ' ' || key === 'Enter' || key === 'PageDown' || key === 'n' || key === 'N') {
            e.preventDefault();
            nextSlide();
        } else if (key === 'ArrowLeft' || key === 'ArrowUp' || key === 'PageUp' || key === 'Backspace' || key === 'p' || key === 'P') {
            e.preventDefault();
            prevSlide();
        } else if (key === 'Home') {
            e.preventDefault();
            goToSlide(0);
        } else if (key === 'End') {
            e.preventDefault();
            goToSlide(totalSlides - 1);
        }
    }

    let isEventsBound = false;
    function bindNavigationEvents() {
        if (isEventsBound) return;
        isEventsBound = true;

        window.addEventListener('keydown', handleKeyDown, false);

        // Click on right/left half of screen to navigate
        window.addEventListener('click', (e) => {
            // Ignore if clicked on an interactive link or prompt button
            if (e.target.closest('.nav-prompt-badge')) {
                nextSlide();
                return;
            }

            const screenWidth = window.innerWidth;
            if (e.clientX > screenWidth * 0.5) {
                nextSlide();
            } else {
                prevSlide();
            }
        }, false);

        // Touch Swipe
        let touchStartX = 0;
        let touchStartY = 0;

        window.addEventListener('touchstart', (e) => {
            touchStartX = e.changedTouches[0].screenX;
            touchStartY = e.changedTouches[0].screenY;
        }, false);

        window.addEventListener('touchend', (e) => {
            const touchEndX = e.changedTouches[0].screenX;
            const touchEndY = e.changedTouches[0].screenY;

            const diffX = touchEndX - touchStartX;
            const diffY = touchEndY - touchStartY;

            if (Math.abs(diffX) > Math.abs(diffY) && Math.abs(diffX) > 40) {
                if (diffX < 0) {
                    nextSlide();
                } else {
                    prevSlide();
                }
            }
        }, false);
    }

    // 5. Interactive Parallax Tilt for Arms (Slide 11)
    const roboticArm = document.getElementById('robotic-arm');
    const humanArm = document.getElementById('human-arm');
    if (roboticArm || humanArm) {
        window.addEventListener('mousemove', (e) => {
            const windowWidth = window.innerWidth;
            const mouseX = e.clientX;
            const percent = (mouseX / windowWidth) - 0.5;
            const rotDeg = percent * 8;
            if (roboticArm) {
                roboticArm.style.transform = `rotate(${rotDeg}deg) translateY(-4px)`;
            }
            if (humanArm) {
                humanArm.style.transform = `rotate(${-rotDeg}deg) translateY(-4px)`;
            }
        });
    }

    // Initialize Engine
    window.addEventListener('resize', resizeCanvas);
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => {
            resizeCanvas();
            drawParticles();
            initPresentation();
        });
    } else {
        resizeCanvas();
        drawParticles();
        initPresentation();
    }
})();
