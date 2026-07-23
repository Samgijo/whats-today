// ============================================================
// This Day in History — Frontend Logic
// ============================================================

const API_BASE = '/api';

// DOM elements
const monthSelect = document.getElementById('monthSelect');
const daySelect = document.getElementById('daySelect');
const searchBtn = document.getElementById('searchBtn');
const todayBtn = document.getElementById('todayBtn');
const resultsSection = document.getElementById('resultsSection');
const resultsTitle = document.getElementById('resultsTitle');
const resultsCount = document.getElementById('resultsCount');
const timeline = document.getElementById('timeline');
const errorToast = document.getElementById('errorToast');
const errorMessage = document.getElementById('errorMessage');

// Month day counts (leap year safe for Feb)
const DAYS_IN_MONTH = [31, 29, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];

// ---- Initialise ----
function init() {
    populateDays();
    setTodayDate();
    createBackgroundParticles();

    monthSelect.addEventListener('change', populateDays);
    searchBtn.addEventListener('click', fetchEvents);
    todayBtn.addEventListener('click', () => {
        setTodayDate();
        fetchEvents();
    });

    // Allow Enter key to trigger search
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') fetchEvents();
    });
}

function setTodayDate() {
    const now = new Date();
    monthSelect.value = now.getMonth() + 1;
    populateDays();
    daySelect.value = now.getDate();
}

function populateDays() {
    const month = parseInt(monthSelect.value);
    const maxDay = DAYS_IN_MONTH[month - 1];
    const currentDay = parseInt(daySelect.value) || 1;

    daySelect.innerHTML = '';
    for (let d = 1; d <= maxDay; d++) {
        const opt = document.createElement('option');
        opt.value = d;
        opt.textContent = d;
        daySelect.appendChild(opt);
    }
    daySelect.value = Math.min(currentDay, maxDay);
}

// ---- API Call ----
async function fetchEvents() {
    const month = parseInt(monthSelect.value);
    const day = parseInt(daySelect.value);

    // UI: loading state
    searchBtn.classList.add('loading');
    searchBtn.disabled = true;
    hideError();

    try {
        const res = await fetch(`${API_BASE}/events?month=${month}&day=${day}`);
        if (!res.ok) {
            const err = await res.json().catch(() => ({}));
            throw new Error(err.detail || `Server error (${res.status})`);
        }

        const data = await res.json();
        renderEvents(data);
    } catch (err) {
        showError(err.message || 'Something went wrong. Please try again.');
    } finally {
        searchBtn.classList.remove('loading');
        searchBtn.disabled = false;
    }
}

// ---- Render Events ----
function renderEvents(data) {
    resultsTitle.textContent = data.date;
    resultsCount.textContent = `${data.events.length} historical events found`;
    timeline.innerHTML = '';

    data.events.forEach((event, i) => {
        const card = document.createElement('article');
        card.className = 'event-card';
        card.style.animationDelay = `${i * 0.1}s`;

        card.innerHTML = `
            <span class="event-year">${event.year}</span>
            <h3 class="event-title">${escapeHtml(event.title)}</h3>
            <p class="event-description">${escapeHtml(event.description)}</p>
            <span class="event-category" data-category="${escapeHtml(event.category)}">${escapeHtml(event.category)}</span>
        `;

        timeline.appendChild(card);
    });

    resultsSection.style.display = 'block';

    // Smooth scroll to results
    setTimeout(() => {
        resultsSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 200);
}

// ---- Error Handling ----
function showError(msg) {
    errorMessage.textContent = msg;
    errorToast.style.display = 'flex';
    clearTimeout(window._errorTimer);
    window._errorTimer = setTimeout(hideError, 6000);
}

function hideError() {
    errorToast.style.display = 'none';
}

// ---- Utilities ----
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// ---- Background Particles ----
function createBackgroundParticles() {
    const container = document.getElementById('bgParticles');
    const colors = [
        'rgba(139, 92, 246, 0.15)',
        'rgba(6, 182, 212, 0.12)',
        'rgba(236, 72, 153, 0.10)',
        'rgba(245, 158, 11, 0.08)',
    ];

    for (let i = 0; i < 30; i++) {
        const p = document.createElement('div');
        p.className = 'particle';
        const size = Math.random() * 4 + 2;
        p.style.width = size + 'px';
        p.style.height = size + 'px';
        p.style.left = Math.random() * 100 + '%';
        p.style.background = colors[Math.floor(Math.random() * colors.length)];
        p.style.animationDuration = (Math.random() * 20 + 15) + 's';
        p.style.animationDelay = (Math.random() * 20) + 's';
        container.appendChild(p);
    }
}

// ---- Boot ----
document.addEventListener('DOMContentLoaded', init);
