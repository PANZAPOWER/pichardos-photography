/* Pichardo's Photography — Main JS */

// Header scroll behavior + dark hero detection
(function() {
  const header = document.getElementById('site-header');
  if (!header) return;

  // If homepage dark hero is present, make nav transparent over it
  if (document.querySelector('.hero')) {
    header.classList.add('on-dark-hero');
  }

  const onScroll = () => {
    header.classList.toggle('scrolled', window.scrollY > 80);
  };
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();
})();

// Mobile nav
(function() {
  const hamburger = document.getElementById('hamburger');
  const navLinks = document.getElementById('nav-links');
  const navClose = document.getElementById('nav-close');
  if (!hamburger || !navLinks) return;

  const openNav = () => {
    navLinks.classList.add('open');
    hamburger.setAttribute('aria-expanded', 'true');
    document.body.style.overflow = 'hidden';
  };
  const closeNav = () => {
    navLinks.classList.remove('open');
    hamburger.setAttribute('aria-expanded', 'false');
    document.body.style.overflow = '';
  };

  hamburger.addEventListener('click', openNav);
  if (navClose) navClose.addEventListener('click', closeNav);

  // Close on link click
  navLinks.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', closeNav);
  });

  // Close on backdrop click
  document.addEventListener('click', (e) => {
    if (navLinks.classList.contains('open') && !navLinks.contains(e.target) && !hamburger.contains(e.target)) {
      closeNav();
    }
  });
})();

// Active nav links
(function() {
  const path = window.location.pathname;
  document.querySelectorAll('.nav-link').forEach(link => {
    const href = link.getAttribute('href');
    if (href === '/' ? path === '/' : path.startsWith(href)) {
      link.classList.add('active');
    }
  });
})();

// Reveal on scroll — progressive enhancement.
// Content is visible by default (CSS); we ARM it here, then reveal on intersect.
// If anything goes wrong, a safety timer guarantees everything becomes visible.
(function() {
  const els = document.querySelectorAll('.reveal, .reveal-left, .reveal-right');
  if (!els.length) return;

  const showAll = () => els.forEach(el => el.classList.add('visible'));

  // No observer support, or reduced motion → leave everything visible, do nothing.
  if (!('IntersectionObserver' in window) ||
      window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    return;
  }

  // Arm: hide + prime the transition.
  els.forEach(el => el.classList.add('armed'));

  const obs = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        e.target.classList.add('visible');
        obs.unobserve(e.target);
      }
    });
  }, { threshold: 0.08, rootMargin: '0px 0px -4% 0px' });
  els.forEach(el => obs.observe(el));

  // Safety net: never let content stay hidden. Reveal anything still armed.
  setTimeout(showAll, 2500);
})();

// Lightbox
(function() {
  const lightbox = document.getElementById('lightbox');
  const lbImg = document.getElementById('lightbox-img');
  const lbClose = document.getElementById('lightbox-close');
  const lbPrev = document.getElementById('lightbox-prev');
  const lbNext = document.getElementById('lightbox-next');
  if (!lightbox) return;

  let images = [];
  let current = 0;

  function openLightbox(src, alt, allImgs, idx) {
    images = allImgs || [{ src, alt }];
    current = idx || 0;
    lbImg.src = images[current].src;
    lbImg.alt = images[current].alt || '';
    lightbox.classList.add('active');
    document.body.style.overflow = 'hidden';
    lbImg.focus();
  }

  function closeLightbox() {
    lightbox.classList.remove('active');
    document.body.style.overflow = '';
  }

  function showPrev() {
    current = (current - 1 + images.length) % images.length;
    lbImg.src = images[current].src;
    lbImg.alt = images[current].alt || '';
  }

  function showNext() {
    current = (current + 1) % images.length;
    lbImg.src = images[current].src;
    lbImg.alt = images[current].alt || '';
  }

  lbClose.addEventListener('click', closeLightbox);
  lbPrev.addEventListener('click', showPrev);
  lbNext.addEventListener('click', showNext);

  lightbox.addEventListener('click', (e) => {
    if (e.target === lightbox) closeLightbox();
  });

  document.addEventListener('keydown', (e) => {
    if (!lightbox.classList.contains('active')) return;
    if (e.key === 'Escape') closeLightbox();
    if (e.key === 'ArrowLeft') showPrev();
    if (e.key === 'ArrowRight') showNext();
  });

  // Wire up gallery items
  document.querySelectorAll('[data-lightbox]').forEach((img, i) => {
    img.style.cursor = 'pointer';
    img.addEventListener('click', function() {
      const gallery = document.querySelectorAll('[data-lightbox]');
      const allImgs = Array.from(gallery).map(el => ({
        src: el.dataset.lightbox || el.src,
        alt: el.alt
      }));
      openLightbox(this.dataset.lightbox || this.src, this.alt, allImgs, i);
    });
  });
})();

// Hero image carousel
(function() {
  const heroImg = document.querySelector('.hero-bg-img');
  if (!heroImg || !heroImg.dataset.images) return;

  let imgs;
  try { imgs = JSON.parse(heroImg.dataset.images); } catch(e) { return; }
  if (imgs.length < 2) return;

  let idx = 0;
  setInterval(() => {
    heroImg.style.opacity = '0';
    setTimeout(() => {
      idx = (idx + 1) % imgs.length;
      heroImg.src = imgs[idx];
      heroImg.style.opacity = '0.45';
    }, 800);
  }, 5000);
})();

// Counter animation
(function() {
  const counters = document.querySelectorAll('[data-count]');
  if (!counters.length) return;
  const obs = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      const el = entry.target;
      const target = parseInt(el.dataset.count);
      const suffix = el.dataset.suffix || '';
      let start = 0;
      const duration = 1800;
      const step = (timestamp) => {
        if (!start) start = timestamp;
        const progress = Math.min((timestamp - start) / duration, 1);
        const eased = 1 - Math.pow(1 - progress, 3);
        el.textContent = Math.floor(eased * target) + (progress === 1 ? suffix : suffix);
        if (progress < 1) requestAnimationFrame(step);
      };
      requestAnimationFrame(step);
      obs.unobserve(el);
    });
  }, { threshold: 0.5 });
  counters.forEach(el => obs.observe(el));
})();

// Lazy load images
(function() {
  if ('loading' in HTMLImageElement.prototype) return;
  const imgs = document.querySelectorAll('img[loading="lazy"]');
  const obs = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (e.isIntersecting && e.target.dataset.src) {
        e.target.src = e.target.dataset.src;
        obs.unobserve(e.target);
      }
    });
  });
  imgs.forEach(img => obs.observe(img));
})();

// Horizontal drag-scroll gallery
(function() {
  document.querySelectorAll('.h-gallery-track').forEach(track => {
    let isDown = false, startX = 0, scrollLeft = 0;
    track.addEventListener('mousedown', e => {
      isDown = true;
      track.style.scrollSnapType = 'none';
      startX = e.pageX - track.offsetLeft;
      scrollLeft = track.scrollLeft;
    });
    ['mouseup','mouseleave'].forEach(ev => track.addEventListener(ev, () => { isDown = false; }));
    track.addEventListener('mousemove', e => {
      if (!isDown) return;
      e.preventDefault();
      const x = e.pageX - track.offsetLeft;
      const walk = (x - startX) * 1.4;
      track.scrollLeft = scrollLeft - walk;
    });
  });
})();

// Gallery filter
function filterGallery(cat) {
  const items = document.querySelectorAll('#gallery-grid .gal-item');
  items.forEach(item => {
    const show = cat === 'all' || item.dataset.cat === cat;
    item.style.display = show ? '' : 'none';
  });
  document.querySelectorAll('.gf-btn').forEach(btn => {
    btn.classList.toggle('active', btn.getAttribute('onclick') === "filterGallery('" + cat + "')");
  });
}

// Parallax hero background
(function() {
  const heroImg = document.querySelector('.hero-bg-img');
  if (!heroImg) return;
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  window.addEventListener('scroll', () => {
    const y = window.scrollY;
    if (y < window.innerHeight) {
      heroImg.style.transform = 'translateY(' + (y * 0.3) + 'px) scale(1.05)';
    }
  }, { passive: true });
})();
