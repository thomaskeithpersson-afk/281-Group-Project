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
  // Force reflow so transition fires even if toast is already visible
  void toast.offsetWidth;
  toast.classList.add('show');
  clearTimeout(toast._hideTimer);
  toast._hideTimer = setTimeout(() => toast.classList.remove('show'), 3000);
}

// ===== INDEX PAGE =====
function initIndex() {
  const listings = getListings();
  const set = (id, val) => { const el = document.getElementById(id); if (el) el.textContent = val; };
  set('stat-listings',  listings.length);
  set('stat-available', listings.filter(l => !l.sold).length);
  set('stat-sold',      listings.filter(l => l.sold).length);
}

// ===== BROWSE PAGE =====
function initBrowse() {
  const searchInput    = document.getElementById('search-input');
  const filterSelect   = document.getElementById('filter-select');
  const conditionSelect = document.getElementById('condition-select');
  if (!searchInput) return;

  function render() {
    const query     = searchInput.value.trim().toLowerCase();
    const filter    = filterSelect    ? filterSelect.value    : 'all';
    const condition = conditionSelect ? conditionSelect.value : 'all';

    let listings = getListings();

    if (query) {
      listings = listings.filter(l =>
        l.title.toLowerCase().includes(query) ||
        l.courseCode.toLowerCase().includes(query)
      );
    }
    if (filter === 'available') listings = listings.filter(l => !l.sold);
    if (filter === 'sold')      listings = listings.filter(l =>  l.sold);
    if (condition !== 'all')    listings = listings.filter(l =>  l.condition === condition);

    renderListings(listings);
  }

  searchInput.addEventListener('input', render);
  if (filterSelect)    filterSelect.addEventListener('change', render);
  if (conditionSelect) conditionSelect.addEventListener('change', render);

  render();
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
        <div class="empty-icon">📚</div>
        <h3>No listings found</h3>
        <p>Try adjusting your search or filters, or <a href="post.html">post a book</a>.</p>
      </div>`;
    return;
  }

  grid.innerHTML = listings.map(l => `
    <div class="book-card${l.sold ? ' sold' : ''}" onclick="location.href='details.html?id=${escapeHtml(l.id)}'">
      ${l.sold ? '<span class="sold-ribbon">Sold</span>' : ''}
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
        <span class="card-seller">by ${escapeHtml(l.sellerName)}</span>
      </div>
    </div>
  `).join('');
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
      id:          Date.now().toString(),
      title:       form.elements.namedItem('title').value.trim(),
      courseCode:  form.courseCode.value.trim().toUpperCase(),
      condition:   form.condition.value,
      price:       price,
      sellerName:  form.sellerName.value.trim(),
      sellerEmail: form.sellerEmail.value.trim(),
      sellerPhone: form.sellerPhone.value.trim(),
      description: form.description.value.trim(),
      datePosted:  new Date().toISOString(),
      sold:        false
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
  const phone = l.sellerPhone ? `
    <div class="contact-item">
      <span class="contact-label">Phone</span>
      <a href="tel:${escapeHtml(l.sellerPhone)}">${escapeHtml(l.sellerPhone)}</a>
    </div>` : '';

  const soldToggle = l.sold
    ? `<button class="btn btn-secondary btn-block" onclick="markAvailable('${escapeHtml(l.id)}')">Mark as Available</button>`
    : `<button class="btn btn-success btn-block" onclick="markSold('${escapeHtml(l.id)}')">Mark as Sold</button>`;

  container.innerHTML = `
    <a href="browse.html" class="back-link">&#8592; Back to Browse</a>
    <div class="details-layout">
      <div class="details-main">
        ${l.sold ? '<div class="alert alert-warning">This listing has been marked as <strong>sold</strong>.</div>' : ''}
        <div class="details-course">${escapeHtml(l.courseCode)}</div>
        <div class="details-title">${escapeHtml(l.title)}</div>
        <div class="details-price">$${parseFloat(l.price).toFixed(2)}</div>
        <div class="details-meta">
          ${conditionBadge(l.condition)}
          ${l.sold ? '<span class="badge badge-sold">Sold</span>' : ''}
          <span style="color:var(--text-muted);font-size:0.85rem">Posted ${formatDate(l.datePosted)}</span>
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
        <div class="details-section-label">Seller Contact</div>
        <div class="seller-name">${escapeHtml(l.sellerName)}</div>
        <div class="contact-item">
          <span class="contact-label">Email</span>
          <a href="mailto:${escapeHtml(l.sellerEmail)}">${escapeHtml(l.sellerEmail)}</a>
        </div>
        ${phone}

        <div class="alert alert-warning" style="margin-top:1.25rem;font-size:0.87rem">
          Arrange an in-person exchange on campus. Never send payment before meeting.
        </div>

        <div class="sidebar-actions">
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

// ===== BOOT =====
document.addEventListener('DOMContentLoaded', () => {
  initIndex();
  initBrowse();
  initPost();
  initDetails();
});
