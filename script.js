/* =============================================
   PORTFOLIO JAVASCRIPT - Full Animations
   ============================================= */

// ===== LOADING SCREEN =====
window.addEventListener('load', () => {
  const loader = document.getElementById('loader');
  const bar = document.getElementById('loaderBar');
  const label = loader.querySelector('.loader-label');
  const steps = ['Compiling Java...', 'Injecting Spring Beans...', 'Launching Server...', 'Ready! 🚀'];
  let progress = 0;
  let stepIdx = 0;

  const interval = setInterval(() => {
    progress += Math.random() * 18 + 5;
    if (progress >= 100) { progress = 100; clearInterval(interval); }
    bar.style.width = progress + '%';

    if (progress > (stepIdx + 1) * 25 && stepIdx < steps.length - 1) {
      label.textContent = steps[stepIdx++];
    }

    if (progress === 100) {
      label.textContent = steps[steps.length - 1];
      setTimeout(() => {
        loader.classList.add('hidden');
        initAnimations();
      }, 600);
    }
  }, 80);
});

// ===== CUSTOM CURSOR =====
const cursor = document.getElementById('cursor');
const follower = document.getElementById('cursor-follower');
let mouseX = 0, mouseY = 0, folX = 0, folY = 0;

document.addEventListener('mousemove', e => {
  mouseX = e.clientX;
  mouseY = e.clientY;
  cursor.style.left = mouseX + 'px';
  cursor.style.top = mouseY + 'px';
});

function animateCursor() {
  folX += (mouseX - folX) * 0.12;
  folY += (mouseY - folY) * 0.12;
  follower.style.left = folX + 'px';
  follower.style.top = folY + 'px';
  requestAnimationFrame(animateCursor);
}
animateCursor();

document.querySelectorAll('a, button, .skill-tab, .filter-btn, .project-card').forEach(el => {
  el.addEventListener('mouseenter', () => {
    cursor.classList.add('hover');
    follower.classList.add('hover');
  });
  el.addEventListener('mouseleave', () => {
    cursor.classList.remove('hover');
    follower.classList.remove('hover');
  });
});

// ===== PARTICLES CANVAS =====
const canvas = document.getElementById('particles-canvas');
const ctx = canvas.getContext('2d');
let particles = [];

function resizeCanvas() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
}

resizeCanvas();
window.addEventListener('resize', resizeCanvas);

class Particle {
  constructor() {
    this.reset();
  }
  reset() {
    this.x = Math.random() * canvas.width;
    this.y = Math.random() * canvas.height;
    this.vx = (Math.random() - 0.5) * 0.4;
    this.vy = (Math.random() - 0.5) * 0.4;
    this.size = Math.random() * 2.5 + 0.5;
    this.alpha = Math.random() * 0.6 + 0.1;
    this.color = Math.random() > 0.5 ? '0, 212, 255' : '124, 58, 237';
  }
  update() {
    this.x += this.vx;
    this.y += this.vy;
    if (this.x < 0 || this.x > canvas.width || this.y < 0 || this.y > canvas.height) {
      this.reset();
    }
  }
  draw() {
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
    ctx.fillStyle = `rgba(${this.color}, ${this.alpha})`;
    ctx.fill();
  }
}

function initParticles() {
  particles = [];
  for (let i = 0; i < 100; i++) {
    particles.push(new Particle());
  }
}

function drawConnections() {
  for (let i = 0; i < particles.length; i++) {
    for (let j = i + 1; j < particles.length; j++) {
      const dx = particles[i].x - particles[j].x;
      const dy = particles[i].y - particles[j].y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist < 130) {
        ctx.beginPath();
        ctx.moveTo(particles[i].x, particles[i].y);
        ctx.lineTo(particles[j].x, particles[j].y);
        ctx.strokeStyle = `rgba(0, 212, 255, ${0.07 * (1 - dist / 130)})`;
        ctx.lineWidth = 1;
        ctx.stroke();
      }
    }
  }
}

function animateParticles() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  particles.forEach(p => { p.update(); p.draw(); });
  drawConnections();
  requestAnimationFrame(animateParticles);
}

initParticles();
animateParticles();

// ===== TYPED TEXT ANIMATION =====
const typedText = document.getElementById('typedText');
const roles = [
  'Full Stack Java Developer',
  'Spring Boot Developer',
  'REST API Engineer',
  'Hibernate & JDBC Expert',
  'React.js Developer',
  'MVC Architecture Builder',
];
let roleIdx = 0, charIdx = 0, isDeleting = false;

function type() {
  const current = roles[roleIdx];
  if (isDeleting) {
    typedText.textContent = current.slice(0, charIdx--);
    if (charIdx < 0) {
      isDeleting = false;
      roleIdx = (roleIdx + 1) % roles.length;
      setTimeout(type, 500);
      return;
    }
  } else {
    typedText.textContent = current.slice(0, charIdx++);
    if (charIdx > current.length) {
      isDeleting = true;
      setTimeout(type, 2000);
      return;
    }
  }
  setTimeout(type, isDeleting ? 50 : 90);
}

type();

// ===== NAVBAR SCROLL =====
const navbar = document.getElementById('navbar');
const navLinks = document.querySelectorAll('.nav-link');
const sections = document.querySelectorAll('section[id]');

window.addEventListener('scroll', () => {
  if (window.scrollY > 60) {
    navbar.classList.add('scrolled');
  } else {
    navbar.classList.remove('scrolled');
  }

  // Active nav link
  let current = '';
  sections.forEach(sec => {
    const sectionTop = sec.offsetTop - 100;
    if (window.scrollY >= sectionTop) {
      current = sec.getAttribute('id');
    }
  });

  navLinks.forEach(link => {
    link.classList.toggle('active', link.dataset.nav === current);
  });
});

// ===== HAMBURGER MENU =====
const hamburger = document.getElementById('hamburger');
const navMenu = document.getElementById('navLinks');

hamburger.addEventListener('click', () => {
  navMenu.classList.toggle('open');
  const spans = hamburger.querySelectorAll('span');
  if (navMenu.classList.contains('open')) {
    spans[0].style.transform = 'rotate(45deg) translate(5px, 5px)';
    spans[1].style.opacity = '0';
    spans[2].style.transform = 'rotate(-45deg) translate(5px, -5px)';
  } else {
    spans.forEach(s => { s.style.transform = ''; s.style.opacity = ''; });
  }
});

navMenu.querySelectorAll('.nav-link').forEach(l => {
  l.addEventListener('click', () => {
    navMenu.classList.remove('open');
    hamburger.querySelectorAll('span').forEach(s => { s.style.transform = ''; s.style.opacity = ''; });
  });
});

// ===== AOS SCROLL ANIMATION =====
function initAOS() {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const delay = parseInt(entry.target.dataset.aosDelay || 0);
        setTimeout(() => {
          entry.target.classList.add('aos-animate');
        }, delay);
        // Trigger skill bars when skills section is visible
        if (entry.target.closest('#skills')) {
          animateSkillBars();
        }
      }
    });
  }, { threshold: 0.1 });

  document.querySelectorAll('[data-aos]').forEach(el => observer.observe(el));
}

// ===== COUNTER ANIMATION =====
function animateCounters() {
  const counters = document.querySelectorAll('.stat-num');
  counters.forEach(counter => {
    const target = parseInt(counter.dataset.target);
    let current = 0;
    const duration = 2000;
    const step = target / (duration / 16);

    const timer = setInterval(() => {
      current += step;
      if (current >= target) {
        current = target;
        clearInterval(timer);
      }
      counter.textContent = Math.floor(current);
    }, 16);
  });
}

// ===== SKILL BARS ANIMATION =====
function animateSkillBars() {
  const activePanel = document.querySelector('.skill-panel.active');
  if (!activePanel) return;
  activePanel.querySelectorAll('.skill-fill').forEach(bar => {
    const w = bar.dataset.width;
    bar.style.width = w + '%';
  });
}

// ===== SKILLS TABS =====
document.querySelectorAll('.skill-tab').forEach(tab => {
  tab.addEventListener('click', () => {
    document.querySelectorAll('.skill-tab').forEach(t => t.classList.remove('active'));
    document.querySelectorAll('.skill-panel').forEach(p => p.classList.remove('active'));
    tab.classList.add('active');
    const panel = document.getElementById('tab-' + tab.dataset.tab);
    panel.classList.add('active');

    // Animate skill bars after short delay
    setTimeout(() => {
      panel.querySelectorAll('.skill-fill').forEach(bar => {
        bar.style.width = '0%';
        setTimeout(() => { bar.style.width = bar.dataset.width + '%'; }, 50);
      });
    }, 50);
  });
});

// ===== PROJECTS FILTER =====
const filterBtns = document.querySelectorAll('.filter-btn');
const projectCards = document.querySelectorAll('.project-card');

filterBtns.forEach(btn => {
  btn.addEventListener('click', () => {
    filterBtns.forEach(b => b.classList.remove('active'));
    btn.classList.add('active');

    const filter = btn.dataset.filter;
    projectCards.forEach(card => {
      const category = card.dataset.category;
      const show = filter === 'all' || category === filter;
      card.style.transition = 'opacity 0.4s ease, transform 0.4s ease';
      if (show) {
        card.classList.remove('hidden');
        card.style.opacity = '1';
        card.style.transform = '';
      } else {
        card.style.opacity = '0';
        card.style.transform = 'scale(0.9)';
        setTimeout(() => card.classList.add('hidden'), 400);
      }
    });
  });
});

// ===== CONTACT FORM =====
const contactForm = document.getElementById('contactForm');
contactForm.addEventListener('submit', async e => {
  e.preventDefault();
  const btn = document.getElementById('submitBtn');
  const originalText = btn.innerHTML;

  btn.innerHTML = `<span>Sending...</span> <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12,6 12,12 16,14"/></svg>`;
  btn.disabled = true;

  try {
    const res = await fetch('/api/contact', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: document.getElementById('name').value,
        email: document.getElementById('email').value,
        subject: document.getElementById('subject').value,
        message: document.getElementById('message').value
      })
    });

    if (!res.ok) throw new Error();

    btn.innerHTML = `<span>Sent Successfully!</span> ✅`;
    btn.style.background = 'linear-gradient(135deg, #22c55e, #16a34a)';
    showToast('Message saved! I\'ll get back to you soon. 🚀');
    contactForm.reset();
    setTimeout(() => { btn.innerHTML = originalText; btn.style.background = ''; btn.disabled = false; }, 3000);
  } catch {
    showToast('Error sending message. Please try again! ❌');
    btn.innerHTML = originalText;
    btn.disabled = false;
  }
});

// ===== TOAST NOTIFICATION =====
function showToast(msg) {
  let toast = document.querySelector('.toast');
  if (!toast) {
    toast = document.createElement('div');
    toast.className = 'toast';
    document.body.appendChild(toast);
  }
  toast.textContent = msg;
  toast.classList.add('show');
  setTimeout(() => toast.classList.remove('show'), 4000);
}

// ===== CODE WINDOW GLITCH EFFECT =====
function codeGlitch() {
  const lines = document.querySelectorAll('.code-line');
  setInterval(() => {
    const r = Math.floor(Math.random() * lines.length);
    lines[r].style.opacity = '0.3';
    setTimeout(() => { lines[r].style.opacity = '1'; }, 100);
  }, 3000);
}

// ===== PARALLAX HERO =====
window.addEventListener('scroll', () => {
  const scrolled = window.scrollY;
  const heroContent = document.querySelector('.hero-content');
  if (heroContent && scrolled < window.innerHeight) {
    heroContent.style.transform = `translateY(${scrolled * 0.15}px)`;
  }
});

// ===== SMOOTH SCROLL =====
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', e => {
    const target = document.querySelector(anchor.getAttribute('href'));
    if (target) {
      e.preventDefault();
      target.scrollIntoView({ behavior: 'smooth' });
    }
  });
});

// ===== INIT ALL =====
function initAnimations() {
  initAOS();
  animateCounters();
  codeGlitch();
}

// ===== HERO CANVAS GLOW EFFECT =====
(function () {
  const hero = document.querySelector('.hero');
  hero.addEventListener('mousemove', (e) => {
    const rect = hero.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    hero.style.background = `
      radial-gradient(600px at ${x}px ${y}px, rgba(0,212,255,0.04) 0%, transparent 70%)
    `;
  });
  hero.addEventListener('mouseleave', () => {
    hero.style.background = '';
  });
})();

// ===== TYPING CODE ANIMATION GLITCH =====
const codeWindow = document.querySelector('.code-window');
if (codeWindow) {
  codeWindow.addEventListener('mouseenter', () => {
    codeWindow.style.boxShadow = '0 30px 80px rgba(0,0,0,0.5), 0 0 60px rgba(0,212,255,0.4)';
  });
  codeWindow.addEventListener('mouseleave', () => {
    codeWindow.style.boxShadow = '0 30px 80px rgba(0,0,0,0.5), 0 0 40px rgba(0,212,255,0.3)';
  });
}
