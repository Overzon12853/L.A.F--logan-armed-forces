document.addEventListener('DOMContentLoaded', () => {

  // --- Lenis Smooth Scroll ---
  const lenis = new Lenis({
    duration: 1.2,
    easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)), // easeOutExpo
    direction: 'vertical',
    gestureDirection: 'vertical',
    smooth: true,
    mouseMultiplier: 1,
    smoothTouch: false, // Turn off on touch devices for performance
    touchMultiplier: 2,
    infinite: false,
  });

  function raf(time) {
    lenis.raf(time);
    requestAnimationFrame(raf);
  }
  requestAnimationFrame(raf);

  // Integrate Lenis with GSAP ScrollTrigger
  lenis.on('scroll', ScrollTrigger.update);
  gsap.ticker.add((time) => {
    lenis.raf(time * 1000);
  });
  gsap.ticker.lagSmoothing(0);

  // --- Mobile Menu Toggle ---
  const mobileToggle = document.getElementById('mobile-toggle');
  const mobileNav = document.getElementById('mobile-nav');
  const mobileNavLinks = document.querySelectorAll('.mobile-nav-links a');

  const toggleMenu = () => {
    mobileToggle.classList.toggle('active');
    mobileNav.classList.toggle('active');
    
    // Toggle scroll lock on body
    if (mobileNav.classList.contains('active')) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
  };

  mobileToggle.addEventListener('click', toggleMenu);

  mobileNavLinks.forEach(link => {
    link.addEventListener('click', (e) => {
      // Close menu
      mobileToggle.classList.remove('active');
      mobileNav.classList.remove('active');
      document.body.style.overflow = '';
      
      // Handle smooth scroll anchor link
      const targetId = link.getAttribute('href');
      if (targetId.startsWith('#')) {
        e.preventDefault();
        const targetElement = document.querySelector(targetId);
        if (targetElement) {
          lenis.scrollTo(targetElement, { offset: -60 });
        }
      }
    });
  });

  // Handle desktop nav smooth scroll anchor links
  const desktopLinks = document.querySelectorAll('.nav-links a, .nav-logo-link, .hero-buttons a[href^="#"]');
  desktopLinks.forEach(link => {
    link.addEventListener('click', (e) => {
      const targetId = link.getAttribute('href');
      if (targetId && targetId.startsWith('#')) {
        e.preventDefault();
        const targetElement = document.querySelector(targetId);
        if (targetElement) {
          lenis.scrollTo(targetElement, { offset: -80 });
        }
      }
    });
  });

  // --- Navbar Scroll Effect ---
  const navbar = document.getElementById('navbar');
  window.addEventListener('scroll', () => {
    if (window.scrollY > 50) {
      navbar.classList.add('scrolled');
    } else {
      navbar.classList.remove('scrolled');
    }
  });

  // --- Hero Canvas Particles ---
  const canvas = document.getElementById('hero-particles');
  const ctx = canvas.getContext('2d');
  let particlesArray = [];
  let mouse = { x: null, y: null, radius: 100 };

  // Set canvas size
  const resizeCanvas = () => {
    canvas.width = canvas.parentElement.offsetWidth;
    canvas.height = canvas.parentElement.offsetHeight;
  };
  resizeCanvas();
  window.addEventListener('resize', resizeCanvas);

  // Mouse move tracker inside hero
  const heroSection = document.getElementById('home');
  heroSection.addEventListener('mousemove', (e) => {
    const rect = canvas.getBoundingClientRect();
    mouse.x = e.clientX - rect.left;
    mouse.y = e.clientY - rect.top;
  });

  heroSection.addEventListener('mouseleave', () => {
    mouse.x = null;
    mouse.y = null;
  });

  // Particle Blueprint
  class Particle {
    constructor() {
      this.reset();
    }

    reset() {
      this.x = Math.random() * canvas.width;
      this.y = canvas.height + Math.random() * 100;
      this.size = Math.random() * 2.2 + 0.6;
      this.speedY = -(Math.random() * 0.8 + 0.3);
      this.speedX = (Math.random() - 0.5) * 0.4;
      // 80% red particles, 20% metallic white
      this.color = Math.random() > 0.2 ? 'rgba(204, 0, 0, ' + (Math.random() * 0.4 + 0.1) + ')' : 'rgba(245, 245, 247, ' + (Math.random() * 0.25 + 0.05) + ')';
    }

    update() {
      this.y += this.speedY;
      this.x += this.speedX;

      // Mouse interactive push
      if (mouse.x !== null && mouse.y !== null) {
        let dx = this.x - mouse.x;
        let dy = this.y - mouse.y;
        let distance = Math.sqrt(dx * dx + dy * dy);
        if (distance < mouse.radius) {
          let forceDirectionX = dx / distance;
          let forceDirectionY = dy / distance;
          let force = (mouse.radius - distance) / mouse.radius;
          let directionX = forceDirectionX * force * 1.5;
          let directionY = forceDirectionY * force * 1.5;
          
          this.x += directionX;
          this.y += directionY;
        }
      }

      // Recycle if off screen
      if (this.y < 0 || this.x < 0 || this.x > canvas.width) {
        this.reset();
      }
    }

    draw() {
      ctx.fillStyle = this.color;
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  // Populate particles (reduce count on mobile for performance)
  const isMobile = window.innerWidth <= 768;
  const particleCount = isMobile ? 35 : 120;

  const initParticles = () => {
    particlesArray = [];
    for (let i = 0; i < particleCount; i++) {
      particlesArray.push(new Particle());
    }
  };
  initParticles();

  // Animation Loop
  const animateParticles = () => {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    for (let i = 0; i < particlesArray.length; i++) {
      particlesArray[i].update();
      particlesArray[i].draw();
    }
    requestAnimationFrame(animateParticles);
  };
  animateParticles();

  // --- Who Are We Rotating Emblem ---
  // Constant rotation timeline
  gsap.to(".about-logo-rotating", {
    rotation: 360,
    duration: 50,
    repeat: -1,
    ease: "none"
  });

  // 3D Depth Mouse Tilt (Desktop only)
  const logoContainer = document.querySelector('.logo-3d-container');
  if (logoContainer && !isMobile) {
    logoContainer.addEventListener('mousemove', (e) => {
      const rect = logoContainer.getBoundingClientRect();
      const x = e.clientX - rect.left - rect.width / 2;
      const y = e.clientY - rect.top - rect.height / 2;
      
      const tiltX = (y / (rect.height / 2)) * -15; // Max 15 deg tilt
      const tiltY = (x / (rect.width / 2)) * 15;
      
      gsap.to(logoContainer, {
        rotateX: tiltX,
        rotateY: tiltY,
        duration: 0.5,
        ease: "power2.out",
        transformPerspective: 1000
      });
    });

    logoContainer.addEventListener('mouseleave', () => {
      gsap.to(logoContainer, {
        rotateX: 0,
        rotateY: 0,
        duration: 0.8,
        ease: "power2.out"
      });
    });
  }

  // --- GSAP ScrollTrigger Animations ---

  // Register ScrollTrigger Plugin
  gsap.registerPlugin(ScrollTrigger);

  // 1. Hero Entrance Animations (on page load)
  const heroTL = gsap.timeline({ defaults: { ease: "power3.out" } });
  
  heroTL.from(".hero-subtitle", { opacity: 0, y: -20, duration: 0.8, delay: 0.2 })
        .from(".hero-title", { opacity: 0, y: 30, duration: 1, letterSpacing: "1px" }, "-=0.6")
        .from(".hero-tagline", { opacity: 0, y: 20, duration: 0.8 }, "-=0.6")
        .from(".hero-desc-p", { opacity: 0, y: 20, duration: 0.8, stagger: 0.2 }, "-=0.6")
        .from(".hero-highlight", { opacity: 0, y: 15, duration: 0.6 }, "-=0.4")
        .from(".hero-buttons .btn", { opacity: 0, y: 20, duration: 0.8, stagger: 0.15 }, "-=0.5");

  // Hero BG Logo Scroll Parallax / Scale Zoom
  gsap.to(".hero-bg-logo", {
    scale: 1.3,
    y: 100,
    opacity: 0.03,
    scrollTrigger: {
      trigger: "#home",
      start: "top top",
      end: "bottom top",
      scrub: true
    }
  });

  // 2. Who Are We Section Scroll Reveal
  gsap.from(".about-logo-wrapper", {
    opacity: 0,
    scale: 0.8,
    x: -50,
    duration: 1.2,
    scrollTrigger: {
      trigger: "#about",
      start: "top 80%",
      toggleActions: "play none none reverse"
    }
  });

  gsap.from(".about-text-content > *", {
    opacity: 0,
    x: 50,
    duration: 1,
    stagger: 0.2,
    scrollTrigger: {
      trigger: "#about",
      start: "top 80%",
      toggleActions: "play none none reverse"
    }
  });

  // 3. What We Do Staggered Cards
  gsap.from(".activity-card", {
    opacity: 0,
    y: 60,
    scale: 0.95,
    duration: 0.8,
    stagger: 0.15,
    scrollTrigger: {
      trigger: ".activities-grid",
      start: "top 85%",
      toggleActions: "play none none reverse"
    }
  });

  // 4. Why Join Us Staggered Panels
  gsap.from(".join-panel", {
    opacity: 0,
    y: 40,
    duration: 0.8,
    stagger: 0.1,
    scrollTrigger: {
      trigger: ".why-join-grid",
      start: "top 85%",
      toggleActions: "play none none reverse"
    }
  });

  // 5. Our Values Staggered Blocks
  gsap.from(".value-block", {
    opacity: 0,
    scale: 0.9,
    y: 30,
    duration: 0.8,
    stagger: 0.15,
    scrollTrigger: {
      trigger: ".values-grid",
      start: "top 85%",
      toggleActions: "play none none reverse"
    }
  });

  // 6. Military & Diplomacy (Tactical) Split Reveal
  gsap.from(".mil-side", {
    opacity: 0,
    x: -80,
    duration: 1.2,
    ease: "power3.out",
    scrollTrigger: {
      trigger: ".mil-dip-split",
      start: "top 80%",
      toggleActions: "play none none reverse"
    }
  });

  gsap.from(".dip-side", {
    opacity: 0,
    x: 80,
    duration: 1.2,
    ease: "power3.out",
    scrollTrigger: {
      trigger: ".mil-dip-split",
      start: "top 80%",
      toggleActions: "play none none reverse"
    }
  });

  // Standout Slogan Reveal Animation (The Standout Visual Moment)
  const sloganTimeline = gsap.timeline({
    scrollTrigger: {
      trigger: ".standout-slogan-wrapper",
      start: "top 85%",
      toggleActions: "play none none reverse"
    }
  });

  sloganTimeline.from(".tactical-sub", {
    opacity: 0,
    y: 20,
    duration: 0.6,
    letterSpacing: "1px"
  })
  .from(".standout-slogan", {
    opacity: 0,
    scale: 0.9,
    y: 30,
    textShadow: "0 0 0px rgba(204, 0, 0, 0)",
    duration: 1.2,
    ease: "back.out(1.5)"
  }, "-=0.3")
  // Subtle glowing pulsation after entrance
  .to(".standout-slogan", {
    textShadow: "0 0 35px rgba(255, 26, 26, 0.75)",
    repeat: -1,
    yoyo: true,
    duration: 2.5,
    ease: "power1.inOut"
  });

  // 7. Final Join Section Parallax & Reveal
  gsap.to(".join-bg-logo", {
    y: -80,
    scale: 1.15,
    scrollTrigger: {
      trigger: "#join",
      start: "top bottom",
      end: "bottom top",
      scrub: true
    }
  });

  gsap.from(".join-content > *", {
    opacity: 0,
    y: 40,
    duration: 0.8,
    stagger: 0.2,
    scrollTrigger: {
      trigger: "#join",
      start: "top 75%",
      toggleActions: "play none none reverse"
    }
  });

});
