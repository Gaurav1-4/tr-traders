// === SEARCH TOGGLE ===
const searchToggle = document.getElementById('search-toggle');
const searchOverlay = document.getElementById('search-overlay');
const searchClose = document.getElementById('search-close');
const searchInput = document.getElementById('search-input');

searchToggle.addEventListener('click', () => {
  searchOverlay.classList.add('active');
  setTimeout(() => searchInput.focus(), 300);
});
searchClose.addEventListener('click', () => searchOverlay.classList.remove('active'));
searchOverlay.addEventListener('click', (e) => {
  if (e.target === searchOverlay) searchOverlay.classList.remove('active');
});
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') searchOverlay.classList.remove('active');
});

// === FILTER ACCORDION ===
document.querySelectorAll('.filter-title').forEach(btn => {
  btn.addEventListener('click', () => {
    const options = btn.nextElementSibling;
    const svg = btn.querySelector('svg');
    options.classList.toggle('open');
    svg.style.transform = options.classList.contains('open') ? 'rotate(180deg)' : 'rotate(0deg)';
  });
});

// === COLOR SWATCH FILTER ===
document.querySelectorAll('.color-swatch-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.color-swatch-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
  });
});

// === SIZE PILLS ===
document.querySelectorAll('.size-pill').forEach(pill => {
  pill.addEventListener('click', () => pill.classList.toggle('active'));
});

// === WISHLIST TOGGLE ===
document.querySelectorAll('.wishlist-btn').forEach(btn => {
  btn.addEventListener('click', (e) => {
    e.stopPropagation();
    btn.classList.toggle('liked');
  });
});

// === ENQUIRY MODAL ===
const modal = document.getElementById('enquiry-modal');
const modalClose = document.getElementById('modal-close');
const modalProductName = document.getElementById('modal-product-name');
const modalProductPrice = document.getElementById('modal-product-price');
const whatsappLink = document.getElementById('whatsapp-link');

function openEnquiry(name, price) {
  modalProductName.textContent = name;
  modalProductPrice.textContent = price;
  const waMsg = encodeURIComponent(`Hi! I'm interested in the "${name}" (${price}). Could you share more details?`);
  whatsappLink.href = `https://wa.me/919876543210?text=${waMsg}`;
  modal.classList.add('active');
  document.body.style.overflow = 'hidden';
}

modalClose.addEventListener('click', () => {
  modal.classList.remove('active');
  document.body.style.overflow = '';
});
modal.addEventListener('click', (e) => {
  if (e.target === modal) {
    modal.classList.remove('active');
    document.body.style.overflow = '';
  }
});

// === FORM SUBMIT ===
document.getElementById('enquiry-form').addEventListener('submit', (e) => {
  e.preventDefault();
  const btn = e.target.querySelector('.btn-submit-enquiry');
  btn.innerHTML = `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 6L9 17l-5-5"/></svg> Sent!`;
  btn.style.background = '#22c55e';
  setTimeout(() => {
    modal.classList.remove('active');
    document.body.style.overflow = '';
    btn.innerHTML = `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 2 11 13M22 2l-7 20-4-9-9-4 20-7z"/></svg> Send Enquiry`;
    btn.style.background = '';
    e.target.reset();
  }, 1500);
});

// === SCROLL ANIMATIONS ===
const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.style.animationPlayState = 'running';
    }
  });
}, { threshold: 0.1 });

document.querySelectorAll('.product-card').forEach(card => {
  card.style.animationPlayState = 'paused';
  observer.observe(card);
});

// === HEADER SCROLL ===
let lastScroll = 0;
const header = document.getElementById('main-header');
window.addEventListener('scroll', () => {
  const current = window.scrollY;
  if (current > 100) {
    header.style.boxShadow = '0 2px 20px rgba(44,36,32,0.06)';
  } else {
    header.style.boxShadow = 'none';
  }
  lastScroll = current;
});
