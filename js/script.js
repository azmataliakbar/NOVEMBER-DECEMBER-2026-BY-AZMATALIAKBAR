/**
 * 2026 Neon Calendar - Interactive Script
 * Handles clock, notes, and dynamic indicators
 */

(function() {
  'use strict';

  // ===================================
  // Configuration
  // ===================================
  const STORAGE_KEYS = {
    november: 'calendar2026_november_notes',
    december: 'calendar2026_december_notes'
  };

  // ===================================
  // Clock Module
  // ===================================
  const Clock = {
    element: null,
    timeElement: null,

    init() {
      this.element = document.querySelector('.clock');
      this.timeElement = document.querySelector('.clock-time');

      if (!this.element || !this.timeElement) {
        console.warn('Clock elements not found');
        return;
      }

      this.update();
      setInterval(() => this.update(), 1000);
    },

    update() {
      const now = new Date();
      const hours = String(now.getHours()).padStart(2, '0');
      const minutes = String(now.getMinutes()).padStart(2, '0');
      const seconds = String(now.getSeconds()).padStart(2, '0');
      this.timeElement.textContent = `${hours}:${minutes}:${seconds}`;
    }
  };

  // ===================================
  // Notes Module
  // ===================================
  const Notes = {
    novArea: null,
    decArea: null,
    novInput: null,
    decInput: null,
    novBtn: null,
    decBtn: null,

    novIndicator: null,
    decIndicator: null,

    init() {
      this.cacheElements();
      this.bindEvents();
      this.loadNotes();
      this.updateIndicators();
      this.highlightToday();
    },

    cacheElements() {
      this.novArea = document.getElementById('nov-notes-area');
      this.decArea = document.getElementById('dec-notes-area');
      this.novInput = document.getElementById('nov-notes-input');
      this.decInput = document.getElementById('dec-notes-input');
      this.novBtn = document.getElementById('add-nov-note');
      this.decBtn = document.getElementById('add-dec-note');

      this.novIndicator = document.querySelector('.november-indicator');
      this.decIndicator = document.querySelector('.december-indicator');
    },

    bindEvents() {
      this.novBtn.addEventListener('click', () => this.addNote('november'));
      this.decBtn.addEventListener('click', () => this.addNote('december'));

      this.novInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
          e.preventDefault();
          this.addNote('november');
        }
      });

      this.decInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
          e.preventDefault();
          this.addNote('december');
        }
      });
    },

    loadNotes() {
      this.renderNotes('november');
      this.renderNotes('december');
    },

    getStorageKey(month) {
      return STORAGE_KEYS[month];
    },

    getNotes(month) {
      try {
        const stored = localStorage.getItem(this.getStorageKey(month));
        return stored ? JSON.parse(stored) : [];
      } catch (e) {
        console.error('Error loading notes:', e);
        return [];
      }
    },

    saveNotes(month, notes) {
      try {
        localStorage.setItem(this.getStorageKey(month), JSON.stringify(notes));
      } catch (e) {
        console.error('Error saving notes:', e);
      }
    },

    addNote(month) {
      const input = month === 'november' ? this.novInput : this.decInput;
      const raw = input.value.trim();

      if (!raw) return;

      // Parse optional date prefix: [Nov 15] or [Dec 1] or [Nov 15, 2026]
      // Also accepts lowercase: [nov 15]
      const dateMatch = raw.match(/^\[(nov|dec)\s+(\d{1,2})(?:[,\s]+(\d{4}))?\]\s*(.*)$/i);
      let dateTag = null;
      let text = raw;

      if (dateMatch) {
        const monthShort = dateMatch[1].toLowerCase();
        const day = parseInt(dateMatch[2], 10);
        const year = dateMatch[3] ? parseInt(dateMatch[3], 10) : 2026;
        text = dateMatch[4].trim();

        // Validate day is in valid range and matches the month this note belongs to
        const expectedShort = month === 'november' ? 'nov' : 'dec';
        const maxDay = month === 'november' ? 30 : 31;
        const isValidYear = year === 2026;
        if (monthShort === expectedShort && day >= 1 && day <= maxDay && isValidYear) {
          dateTag = {
            monthShort: monthShort,
            monthLong: monthShort === 'nov' ? 'Nov' : 'Dec',
            day: day,
            year: year
          };
        }
      }

      if (!text) {
        // Date prefix only with no body — treat the date tag text as the body
        text = raw;
        dateTag = null;
      }

      const notes = this.getNotes(month);
      const note = {
        id: Date.now(),
        text: text,
        date: dateTag, // null if no valid date prefix
        createdAt: new Date().toISOString()
      };

      notes.push(note);
      this.saveNotes(month, notes);
      this.renderNotes(month);
      this.updateIndicators();

      input.value = '';
      input.focus();
    },

    deleteNote(month, noteId) {
      let notes = this.getNotes(month);
      notes = notes.filter(note => note.id !== noteId);
      this.saveNotes(month, notes);
      this.renderNotes(month);
      this.updateIndicators();
    },

    renderNotes(month) {
      const area = month === 'november' ? this.novArea : this.decArea;
      const notes = this.getNotes(month);

      if (notes.length === 0) {
        area.innerHTML = '<div class="note-placeholder">No notes yet. Add one below.</div>';
        return;
      }

      area.innerHTML = notes.map(note => {
        const dateTag = note.date
          ? `<span class="note-date-tag">[${this.escapeHtml(note.date.monthLong)} ${note.date.day}]</span>`
          : '';
        return `
        <div class="note-item" data-id="${note.id}">
          <div class="note-content">
            ${dateTag}
            <span class="note-text">${this.escapeHtml(note.text)}</span>
          </div>
          <button class="note-delete" aria-label="Delete note" data-month="${month}" data-id="${note.id}">
            ✕
          </button>
        </div>
      `;
      }).join('');

      // Bind delete buttons
      area.querySelectorAll('.note-delete').forEach(btn => {
        btn.addEventListener('click', (e) => {
          const monthAttr = e.target.dataset.month;
          const id = parseInt(e.target.dataset.id, 10);
          this.deleteNote(monthAttr, id);
        });
      });
    },

    escapeHtml(text) {
      const div = document.createElement('div');
      div.textContent = text;
      return div.innerHTML;
    },

    updateIndicators() {
      const novNotes = this.getNotes('november');
      const decNotes = this.getNotes('december');

      const hasNovNotes = novNotes.length > 0;
      const hasDecNotes = decNotes.length > 0;

      // Calendar indicators
      this.novIndicator.classList.toggle('active', hasNovNotes);
      this.decIndicator.classList.toggle('active', hasDecNotes);

      // Update ARIA labels
      if (this.novIndicator) {
        this.novIndicator.setAttribute('aria-label',
          hasNovNotes ? `November has ${novNotes.length} note(s)` : 'November notes indicator');
      }
      if (this.decIndicator) {
        this.decIndicator.setAttribute('aria-label',
          hasDecNotes ? `December has ${decNotes.length} note(s)` : 'December notes indicator');
      }

      // Per-date dots on calendar cells
      this.updateDateDots('november', novNotes);
      this.updateDateDots('december', decNotes);
    },

    updateDateDots(month, notes) {
      // Find which days have at least one note with a date tag
      const daysWithNotes = new Set();
      notes.forEach(note => {
        if (note.date && typeof note.date.day === 'number') {
          daysWithNotes.add(note.date.day);
        }
      });

      // Apply / remove has-note class on each cell
      const cells = document.querySelectorAll(
        `.calendar-card.${month} .calendar-day.current-month`
      );
      cells.forEach(cell => {
        const dayNum = parseInt(cell.querySelector('span').textContent, 10);
        if (daysWithNotes.has(dayNum)) {
          cell.classList.add('has-note');
          cell.setAttribute('aria-label', `Day ${dayNum} has note(s)`);
        } else {
          cell.classList.remove('has-note');
        }
      });
    },

    highlightToday() {
      const today = new Date();
      const year = today.getFullYear();
      const month = today.getMonth(); // 10 = November, 11 = December
      const day = today.getDate();

      // Only highlight if today is in Nov or Dec 2026
      if (year === 2026 && (month === 10 || month === 11)) {
        const cards = month === 10
          ? document.querySelectorAll('.calendar-card.november .calendar-day.current-month')
          : document.querySelectorAll('.calendar-card.december .calendar-day.current-month');

        cards.forEach(div => {
          const dayNum = parseInt(div.querySelector('span').textContent, 10);
          if (dayNum === day) {
            div.classList.add('today');
            div.setAttribute('aria-current', 'date');
          }
        });
      }
    }
  };

  // ===================================
  // Initialize
  // ===================================
  document.addEventListener('DOMContentLoaded', () => {
    Clock.init();
    Notes.init();
  });

  // Export for debugging (optional)
  window.Calendar2026 = {
    Clock,
    Notes
  };

})();
