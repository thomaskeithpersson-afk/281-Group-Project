'use strict';

// ===== DATA LAYER =====
const STORAGE_KEY = 'bookexchange_listings';

function getListings() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
  } catch {
    return [];
  }
}

function saveListings(listings) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(listings));
}

function addListing(listing) {
  const listings = getListings();
  listings.unshift(listing);
  saveListings(listings);
}

function updateListing(id, changes) {
  const listings = getListings();
  const idx = listings.findIndex(l => l.id === id);
  if (idx === -1) return false;
  listings[idx] = { ...listings[idx], ...changes };
  saveListings(listings);
  return true;
}

function removeListing(id) {
  saveListings(getListings().filter(l => l.id !== id));
}

function getListingById(id) {
  return getListings().find(l => l.id === id) || null;
}

// ===== UTILITIES =====
function escapeHtml(str) {
  if (str == null) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function formatDate(isoString) {
  return new Date(isoString).toLocaleDateString('en-CA', {
    year: 'numeric', month: 'short', day: 'numeric'
  });
}

function conditionBadgeClass(condition) {
  const map = {
    'New': 'badge-new',
    'Like New': 'badge-like-new',
    'Good': 'badge-good',
    'Fair': 'badge-fair',
    'Poor': 'badge-poor'
  };
  return map[condition] || 'badge-good';
}

function conditionBadge(condition) {
  return `<span class="badge ${conditionBadgeClass(condition)}">${escapeHtml(condition)}</span>`;
}

function showToast(message, type = '') {
  let toast = document.getElementById('toast');
  if (!toast) {
    toast = document.createElement('div');
    toast.id = 'toast';
    toast.className = 'toast';
    document.body.appendChild(toast);
  }
  toast.textContent = message;
  toast.className = `toast ${type}`;
  void toast.offsetWidth;
  toast.classList.add('show');
  clearTimeout(toast._hideTimer);
  toast._hideTimer = setTimeout(() => toast.classList.remove('show'), 3000);
}

// ===== COVER COLORS =====
const COVER_COLORS = [
  '#006633', '#003366', '#8B1A1A', '#4A235A',
  '#1A5276', '#145A32', '#784212', '#1B2631',
  '#2E4053', '#0E6655', '#6E2F0E', '#283747'
];

function coverColor(courseCode) {
  let hash = 0;
  for (let i = 0; i < courseCode.length; i++) {
    hash = courseCode.charCodeAt(i) + ((hash << 5) - hash);
  }
  return COVER_COLORS[Math.abs(hash) % COVER_COLORS.length];
}

function coverInitials(courseCode) {
  const parts = courseCode.trim().toUpperCase().split(/\s+/);
  if (parts.length >= 2) return parts[0].slice(0, 4) + '\n' + parts[1].slice(0, 3);
  return parts[0].slice(0, 5);
}

// ===== INDEX PAGE =====
function initIndex() {
  if (!document.getElementById('carousel-track')) return;
  initCarousel();
}

// ===== CAROUSEL =====
function initCarousel() {
  const track = document.getElementById('carousel-track');
  const empty = document.getElementById('carousel-empty');
  if (!track) return;

  const listings = getListings().filter(l => !l.sold).slice(0, 12);

  if (listings.length === 0) {
    track.style.display = 'none';
    if (empty) empty.style.display = 'block';
    const btns = document.querySelectorAll('.carousel-btn');
    btns.forEach(b => b.style.display = 'none');
    return;
  }

  track.innerHTML = listings.map(l => {
    const bg = coverColor(l.courseCode);
    const initials = coverInitials(l.courseCode).replace('\n', '<br>');
    return `
      <a class="carousel-item" href="details.html?id=${escapeHtml(l.id)}">
        <div class="carousel-cover" style="background:${bg}">${initials}</div>
        <div class="carousel-price">$${parseFloat(l.price).toFixed(2)}</div>
        <div class="carousel-course">${escapeHtml(l.courseCode)}</div>
      </a>`;
  }).join('');
}

function scrollCarousel(direction) {
  const track = document.getElementById('carousel-track');
  if (!track) return;
  const itemWidth = 166; // 150px item + 16px gap
  track.scrollLeft += direction * itemWidth * 3;
}

// ===== HERO SEARCH =====
function heroSearch(e) {
  e.preventDefault();
  const q = document.getElementById('hero-search-input').value.trim();
  location.href = 'browse.html' + (q ? '?q=' + encodeURIComponent(q) : '');
}

// ===== BROWSE PAGE =====
function initBrowse() {
  const grid = document.getElementById('listings-grid');
  if (!grid) return;

  // Pre-fill search from URL ?q=
  const urlQ = new URLSearchParams(location.search).get('q');
  const courseInput = document.getElementById('course-number-input');
  if (urlQ && courseInput) courseInput.value = urlQ;

  // Populate department options
  populateDeptOptions();

  // Attach listeners
  const deptSelect   = document.getElementById('dept-select');
  const priceRange   = document.getElementById('price-max-range');

  if (courseInput) courseInput.addEventListener('input', renderBrowse);
  if (deptSelect)  deptSelect.addEventListener('change', renderBrowse);
  if (priceRange) {
    priceRange.addEventListener('input', () => {
      const label = document.getElementById('price-max-label');
      if (label) label.textContent = '$' + priceRange.value;
      renderBrowse();
    });
  }

  document.querySelectorAll('input[name="condition"]').forEach(cb => {
    cb.addEventListener('change', renderBrowse);
  });

  renderBrowse();
}

function populateDeptOptions() {
  const deptSelect = document.getElementById('dept-select');
  if (!deptSelect) return;
  const depts = [...new Set(
    getListings()
      .map(l => l.department || (l.courseCode ? l.courseCode.split(/\s+/)[0].toUpperCase() : ''))
      .filter(Boolean)
  )].sort();

  depts.forEach(d => {
    const opt = document.createElement('option');
    opt.value = d;
    opt.textContent = d;
    deptSelect.appendChild(opt);
  });
}

function renderBrowse() {
  const courseInput  = document.getElementById('course-number-input');
  const deptSelect   = document.getElementById('dept-select');
  const priceRange   = document.getElementById('price-max-range');
  const checkedConds = [...document.querySelectorAll('input[name="condition"]:checked')].map(cb => cb.value);

  const query     = courseInput ? courseInput.value.trim().toLowerCase() : '';
  const dept      = deptSelect  ? deptSelect.value : 'all';
  const maxPrice  = priceRange  ? parseFloat(priceRange.value) : Infinity;

  let listings = getListings();

  if (query) {
    listings = listings.filter(l =>
      l.title.toLowerCase().includes(query) ||
      l.courseCode.toLowerCase().includes(query)
    );
  }

  if (dept !== 'all') {
    listings = listings.filter(l => {
      const lDept = l.department || l.courseCode.split(/\s+/)[0].toUpperCase();
      return lDept === dept;
    });
  }

  if (checkedConds.length > 0) {
    listings = listings.filter(l => checkedConds.includes(l.condition));
  }

  listings = listings.filter(l => parseFloat(l.price) <= maxPrice);

  renderListings(listings);
}

function clearBrowseFilters() {
  const courseInput = document.getElementById('course-number-input');
  const deptSelect  = document.getElementById('dept-select');
  const priceRange  = document.getElementById('price-max-range');
  const priceLabel  = document.getElementById('price-max-label');

  if (courseInput) courseInput.value = '';
  if (deptSelect)  deptSelect.value = 'all';
  if (priceRange)  { priceRange.value = priceRange.max; }
  if (priceLabel)  priceLabel.textContent = '$' + (priceRange ? priceRange.max : '500');
  document.querySelectorAll('input[name="condition"]').forEach(cb => cb.checked = false);
  renderBrowse();
}

function renderListings(listings) {
  const grid  = document.getElementById('listings-grid');
  const count = document.getElementById('results-count');
  if (!grid) return;

  if (count) {
    count.textContent = `${listings.length} listing${listings.length !== 1 ? 's' : ''} found`;
  }

  if (listings.length === 0) {
    grid.innerHTML = `
      <div class="empty-state">
        <div class="empty-icon">&#128218;</div>
        <h3>No listings found</h3>
        <p>Try adjusting your filters, or <a href="post.html">post a book</a>.</p>
      </div>`;
    return;
  }

  grid.innerHTML = listings.map(l => {
    const bg = coverColor(l.courseCode);
    const initials = coverInitials(l.courseCode).replace('\n', '<br>');
    return `
    <div class="book-card${l.sold ? ' sold' : ''}" onclick="location.href='details.html?id=${escapeHtml(l.id)}'">
      ${l.sold ? '<span class="sold-ribbon">Sold</span>' : ''}
      <div class="card-cover" style="background:${bg}">${initials}</div>
      <div class="card-body">
        <div class="card-course">${escapeHtml(l.courseCode)}</div>
        <div class="card-title">${escapeHtml(l.title)}</div>
        <div class="card-meta">
          ${conditionBadge(l.condition)}
          <span style="color:var(--text-muted);font-size:0.8rem">${formatDate(l.datePosted)}</span>
        </div>
      </div>
      <div class="card-footer">
        <span class="card-price">$${parseFloat(l.price).toFixed(2)}</span>
        <span class="badge badge-fair-value">Fair Value</span>
      </div>
    </div>`;
  }).join('');
}

// ===== POST PAGE =====
function initPost() {
  const form = document.getElementById('post-form');
  if (!form) return;

  form.addEventListener('submit', function (e) {
    e.preventDefault();

    const price = parseFloat(form.price.value);
    if (isNaN(price) || price < 0) {
      showToast('Please enter a valid price.', 'error');
      return;
    }

    const listing = {
      id:           Date.now().toString(),
      title:        form.elements.namedItem('title').value.trim(),
      courseCode:   form.courseCode.value.trim().toUpperCase(),
      department:   form.department.value,
      condition:    form.condition.value,
      price:        price,
      sellerName:   form.sellerName.value.trim(),
      contactDetail: form.contactDetail.value.trim(),
      description:  form.description.value.trim(),
      datePosted:   new Date().toISOString(),
      sold:         false
    };

    addListing(listing);
    showToast('Listing posted!', 'success');
    setTimeout(() => {
      location.href = `details.html?id=${listing.id}`;
    }, 900);
  });
}

// ===== DETAILS PAGE =====
function initDetails() {
  const container = document.getElementById('details-container');
  if (!container) return;

  const id = new URLSearchParams(location.search).get('id');

  if (!id) {
    container.innerHTML = '<div class="alert alert-danger">No listing specified.</div>';
    return;
  }

  const listing = getListingById(id);

  if (!listing) {
    container.innerHTML = `
      <div class="alert alert-danger">
        Listing not found. It may have been deleted.
        <a href="browse.html">Browse all listings</a>.
      </div>`;
    return;
  }

  renderDetails(listing, container);
}

function renderDetails(l, container) {
  // Support old listings (sellerEmail/sellerPhone) and new (contactDetail)
  let contactHtml = '';
  if (l.contactDetail) {
    contactHtml = `
      <div class="contact-item">
        <span class="contact-label">Contact</span>
        <span>${escapeHtml(l.contactDetail)}</span>
      </div>`;
  } else {
    if (l.sellerEmail) {
      contactHtml += `
        <div class="contact-item">
          <span class="contact-label">Email</span>
          <a href="mailto:${escapeHtml(l.sellerEmail)}">${escapeHtml(l.sellerEmail)}</a>
        </div>`;
    }
    if (l.sellerPhone) {
      contactHtml += `
        <div class="contact-item">
          <span class="contact-label">Phone</span>
          <a href="tel:${escapeHtml(l.sellerPhone)}">${escapeHtml(l.sellerPhone)}</a>
        </div>`;
    }
  }

  const soldToggle = l.sold
    ? `<button class="btn btn-secondary btn-block" onclick="markAvailable('${escapeHtml(l.id)}')">Mark as Available</button>`
    : `<button class="btn btn-success btn-block" onclick="markSold('${escapeHtml(l.id)}')">Mark as Sold</button>`;

  const bg       = coverColor(l.courseCode);
  const initials = coverInitials(l.courseCode).replace('\n', '<br>');

  container.innerHTML = `
    <a href="browse.html" class="back-link">&#8592; Back to Search</a>
    <div class="details-layout">
      <div class="details-main">
        ${l.sold ? '<div class="alert alert-warning">This listing has been marked as <strong>sold</strong>.</div>' : ''}
        <div class="details-cover-row">
          <div class="details-cover" style="background:${bg}">${initials}</div>
          <div class="details-cover-info">
            <div class="details-course">${escapeHtml(l.courseCode)}${l.department ? ' &mdash; ' + escapeHtml(l.department) : ''}</div>
            <div class="details-title">${escapeHtml(l.title)}</div>
            <div class="details-price">$${parseFloat(l.price).toFixed(2)}</div>
            <div class="details-meta">
              ${conditionBadge(l.condition)}
              ${l.sold ? '<span class="badge badge-sold">Sold</span>' : '<span class="badge badge-fair-value">Fair Value</span>'}
              <span style="color:var(--text-muted);font-size:0.85rem">Posted ${formatDate(l.datePosted)}</span>
            </div>
          </div>
        </div>
        <hr class="details-divider">
        <div class="details-section-label">Description</div>
        <div class="details-description">
          ${l.description
            ? escapeHtml(l.description)
            : '<span style="color:var(--text-muted)">No additional description provided.</span>'}
        </div>
      </div>

      <div class="details-sidebar">
        <div class="details-section-label">Campus Connection</div>
        <div class="seller-name">${escapeHtml(l.sellerName)}</div>
        ${contactHtml}

        <div class="alert alert-warning" style="margin-top:1.25rem;font-size:0.87rem">
          Arrange an in-person exchange on campus. Never send payment before meeting.
        </div>

        <div class="sidebar-actions">
          <button class="btn btn-primary btn-block chat-open-btn" onclick="openChat('${escapeHtml(l.id)}', '${escapeHtml(l.title)}')">&#128172; Message Seller</button>
          ${soldToggle}
          <button class="btn btn-danger btn-block" onclick="confirmDelete('${escapeHtml(l.id)}')">Delete Listing</button>
        </div>
      </div>
    </div>
  `;
}

function markSold(id) {
  updateListing(id, { sold: true });
  showToast('Marked as sold.', 'success');
  setTimeout(() => location.reload(), 800);
}

function markAvailable(id) {
  updateListing(id, { sold: false });
  showToast('Marked as available.', 'success');
  setTimeout(() => location.reload(), 800);
}

function confirmDelete(id) {
  if (!confirm('Delete this listing? This cannot be undone.')) return;
  removeListing(id);
  showToast('Listing deleted.');
  setTimeout(() => { location.href = 'browse.html'; }, 900);
}

// ===== MESSAGING =====
const MSG_KEY = 'bookexchange_messages';

function getMessages(listingId) {
  try {
    const all = JSON.parse(localStorage.getItem(MSG_KEY)) || {};
    return all[listingId] || [];
  } catch { return []; }
}

function saveMessage(listingId, msg) {
  try {
    const all = JSON.parse(localStorage.getItem(MSG_KEY)) || {};
    if (!all[listingId]) all[listingId] = [];
    all[listingId].push(msg);
    localStorage.setItem(MSG_KEY, JSON.stringify(all));
  } catch {}
}

function openChat(listingId, bookTitle) {
  // Remove existing chat if any
  const existing = document.getElementById('chat-modal');
  if (existing) { existing.remove(); return; }

  const modal = document.createElement('div');
  modal.id = 'chat-modal';
  modal.className = 'chat-modal';
  modal.innerHTML = `
    <div class="chat-header">
      <div class="chat-header-info">
        <div class="chat-title">&#128172; Messages</div>
        <div class="chat-subtitle">${escapeHtml(bookTitle)}</div>
      </div>
      <button class="chat-close" onclick="document.getElementById('chat-modal').remove()" aria-label="Close">&times;</button>
    </div>
    <div class="chat-messages" id="chat-messages"></div>
    <div class="chat-input-area">
      <input type="text" id="chat-name" placeholder="Your name" maxlength="60" autocomplete="off">
      <textarea id="chat-text" placeholder="Write a message..." maxlength="500" rows="2"></textarea>
      <button class="btn btn-primary btn-sm chat-send-btn" onclick="sendChatMessage('${escapeHtml(listingId)}')">Send</button>
    </div>
  `;
  document.body.appendChild(modal);
  renderChatMessages(listingId);

  // Allow Enter (without shift) to send
  modal.querySelector('#chat-text').addEventListener('keydown', function(e) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendChatMessage(listingId);
    }
  });
}

function renderChatMessages(listingId) {
  const container = document.getElementById('chat-messages');
  if (!container) return;
  const msgs = getMessages(listingId);

  if (msgs.length === 0) {
    container.innerHTML = '<div class="chat-empty">No messages yet. Be the first to reach out!</div>';
    return;
  }

  container.innerHTML = msgs.map(m => `
    <div class="chat-bubble">
      <div class="chat-bubble-name">${escapeHtml(m.name)}</div>
      <div class="chat-bubble-text">${escapeHtml(m.text)}</div>
      <div class="chat-bubble-time">${formatDate(m.timestamp)}</div>
    </div>
  `).join('');

  container.scrollTop = container.scrollHeight;
}

function sendChatMessage(listingId) {
  const nameEl = document.getElementById('chat-name');
  const textEl = document.getElementById('chat-text');
  if (!nameEl || !textEl) return;

  const name = nameEl.value.trim();
  const text = textEl.value.trim();

  if (!name) { nameEl.focus(); showToast('Please enter your name.', 'error'); return; }
  if (!text) { textEl.focus(); showToast('Please write a message.', 'error'); return; }

  saveMessage(listingId, { name, text, timestamp: new Date().toISOString() });
  textEl.value = '';
  renderChatMessages(listingId);
  showToast('Message sent!', 'success');
}

// ===== MY LISTINGS PAGE =====
function initMyListings() {
  const title = document.querySelector('title');
  if (!title || !title.textContent.includes('My Listings')) return;
  const grid = document.getElementById('listings-grid');
  if (!grid) return;
  renderListings(getListings());
}

// ===== BOOT =====
document.addEventListener('DOMContentLoaded', () => {
  initIndex();
  initBrowse();
  initPost();
  initDetails();
  initMyListings();
});
