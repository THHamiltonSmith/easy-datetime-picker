// date-picker.js

// Get references to shared picker elements
const datePicker = document.getElementById('date-picker');
const dateMonths = document.getElementById('date-picker-months');
const timePicker = document.getElementById('time-picker');
const backdrop = document.getElementById('picker-backdrop');

// Maintain internal state: ISO date string and formatted time string
const pickerState = {};

// Initialise all picker buttons when the DOM is ready
window.addEventListener('DOMContentLoaded', () => {
    const buttons = document.querySelectorAll('.picker-button');
    buttons.forEach(btn => {
        // Initialise from optional data attributes
        pickerState[btn.id] = {
            date: btn.dataset.initialDate || null,
            time: btn.dataset.initialTime || null
        };
        updateButtonLabel(btn);

        btn.addEventListener('click', event => {
            event.preventDefault();
            if (btn.dataset.pickerType === 'date') {
                showDatePicker(btn);
            } else {
                showTimePicker(btn);
            }
        });
    });
});

// Prevent the calendar from scrolling the page
dateMonths.addEventListener('scroll', event => {
    event.stopPropagation();
});

// Close any open picker on backdrop click or Escape key
backdrop.addEventListener('click', hidePicker);
document.addEventListener('keydown', event => {
    if (event.key === 'Escape') {
        hidePicker();
    }
});

// Parse a 'D-M-YY' string back into a JavaScript Date object
function parseStoredDate(value) {
    const [day, month, year] = value.split('-').map(Number);
    return new Date(year, month - 1, day);
}

// Format a JavaScript Date object into 'D-M-YY' string for storage
function formatStoredDate(date) {
    const day = date.getDate();
    const month = date.getMonth() + 1;
    const year = date.getFullYear();
    return `${day}-${month}-${year}`;
}

// Format hours and minutes into 'HHMM' string for storage
function formatStoredTime(hours, minutes) {
    const hh = String(hours).padStart(2, '0');
    const mm = String(minutes).padStart(2, '0');
    return `${hh}${mm}`;
}

// Update the button label to reflect the current state
function updateButtonLabel(btn) {
    const state = pickerState[btn.id];

    if (btn.dataset.pickerType === 'date') {
        if (state.date) {
            const jsDate = new Date(state.date);
            const formatted = jsDate.toLocaleDateString('en-AU', {
                month: 'short', day: 'numeric', year: 'numeric'
            });
            btn.querySelector('.picker-value').textContent = formatted;
        } else {
            btn.querySelector('.picker-value').textContent = 'Select Date';
        }
    } else {
        if (state.time) {
            btn.querySelector('.picker-value').textContent = state.time;
        } else {
            btn.querySelector('.picker-value').textContent = 'Select Time';
        }
    }
}

// Handle date selection: update state, store formatted value and refresh label
function onDateSelected(btn, jsDate) {
    pickerState[btn.id].date = jsDate.toISOString();
    btn.dataset.value = formatStoredDate(jsDate);

    const formattedLabel = jsDate.toLocaleDateString('en-AU', {
        month: 'short', day: 'numeric', year: 'numeric'
    });
    btn.querySelector('.picker-value').textContent = formattedLabel;

    // Check if a time picker is linked
    const timeBtn = document.querySelector(
        `.picker-button[data-linked-to="${btn.id}"]`
    );

    if (timeBtn) {
        const allowPast = timeBtn.dataset.allowPastTimes !== 'false' ? true : false;

        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const selected = new Date(jsDate);
        selected.setHours(0, 0, 0, 0);

        // Refresh only if selected date is today and past times are disallowed
        if (selected.getTime() === today.getTime() && allowPast === false) {
            refreshTimePickerFor(btn.id);
        }
    }
}

// Handle time selection: update state, store formatted value and refresh label
function onTimeSelected(btn, displayText, hours, minutes) {
    const timeKey = btn.id || btn.dataset.linkedTo;

    if (!timeKey) {
        console.warn('No valid key found for pickerState. Ensure the button has either an id or data-linked-to.');
        return;
    }

    // Initialise state entry if it doesn't exist
    if (!pickerState[timeKey]) {
        pickerState[timeKey] = {};
    }

    // Store the display text in state and dataset
    pickerState[timeKey].time = displayText;
    btn.dataset.value = formatStoredTime(hours, minutes);

    // Update visible label
    btn.querySelector('.picker-value').textContent = displayText;

    // Reset linked range if this causes conflict
    refreshTimePickerForRangeConstraint(btn);
}

// Rebuild time slots for a specific date picker button
function refreshTimePickerFor(dateBtnId) {
    const timeBtn = document.querySelector(
        `.picker-button[data-linked-to="${dateBtnId}"]`
    );

    let selectedDate;
    if (pickerState[dateBtnId].date) {
        selectedDate = new Date(pickerState[dateBtnId].date);
    } else {
        selectedDate = new Date();
    }

    // Clear previous time state
    pickerState[dateBtnId].time = null;

    initialiseTimeContainer(timeBtn, selectedDate);

    // Auto-click the first available slot
    const firstSlot = timePicker.querySelector(
        '.time-element:not(.inactive-time)'
    );
    if (firstSlot) {
        firstSlot.click();
    }
}

// Refresh the time picker for a range constraint
function refreshTimePickerForRangeConstraint(changedBtn) {
    const changedId = changedBtn.id || changedBtn.dataset.linkedTo;
    if (!changedId) return;

    const group = changedBtn.dataset.rangeGroup;
    const isEnd = changedBtn.dataset.range === 'end';

    if (!group) return;

    const otherBtn = document.querySelector(
        `.picker-button[data-range-group="${group}"][data-range="${isEnd ? 'start' : 'end'}"]`
    );
    if (!otherBtn) return;

    const changedVal = changedBtn.dataset.value;
    const otherVal = otherBtn.dataset.value;

    if (!changedVal || !otherVal) return;

    const changedMins = parseInt(changedVal.slice(0, 2)) * 60 + parseInt(changedVal.slice(2), 10);
    const otherMins = parseInt(otherVal.slice(0, 2)) * 60 + parseInt(otherVal.slice(2), 10);

    const conflict =
        isEnd ? changedMins <= otherMins : changedMins >= otherMins;

    if (conflict) {
        // Reset the OTHER button’s time to earliest available
        const otherId = otherBtn.id || otherBtn.dataset.linkedTo;
        if (!otherId) return;

        pickerState[otherId].time = null;

        initialiseTimeContainer(otherBtn, new Date());

        const firstSlot = timePicker.querySelector('.time-element:not(.inactive-time)');
        if (firstSlot) {
            firstSlot.click();
        }
    }
}

// Initialise and render the calendar view for a date button
function initialiseDateRange(btn) {
    const now = new Date();
    now.setHours(0, 0, 0, 0);

    const daysBack = parseInt(btn.dataset.daysBack, 10) || 0;
    const daysForward = parseInt(btn.dataset.daysForward, 10) || 0;

    const pastLimit = new Date(now);
    pastLimit.setDate(now.getDate() - daysBack);

    const futureLimit = new Date(now);
    futureLimit.setDate(now.getDate() + daysForward);

    // Determine range-group start/end constraints
    const group = btn.dataset.rangeGroup;
    let startDate = null;
    let endDate = null;
    if (group) {
        const startBtn = document.querySelector(
            `[data-range-group="${group}"][data-range="start"]`
        );
        const endBtn = document.querySelector(
            `[data-range-group="${group}"][data-range="end"]`
        );

        if (startBtn && startBtn.dataset.value) {
            startDate = new Date(parseStoredDate(startBtn.dataset.value));
            startDate.setHours(0, 0, 0, 0);
        }
        if (endBtn && endBtn.dataset.value) {
            endDate = new Date(parseStoredDate(endBtn.dataset.value));
            endDate.setHours(0, 0, 0, 0);
        }
    }

    // Clear existing calendar
    dateMonths.innerHTML = '';

    // Iterate from pastLimit to futureLimit month-by-month
    let iter = new Date(
        pastLimit.getFullYear(),
        pastLimit.getMonth(),
        1
    );

    while (
        iter.getFullYear() < futureLimit.getFullYear() ||
        (
            iter.getFullYear() === futureLimit.getFullYear() &&
            iter.getMonth() <= futureLimit.getMonth()
        )
    ) {
        const year = iter.getFullYear();
        const month = iter.getMonth();

        const monthStart = new Date(year, month, 1);
        const monthEnd = new Date(year, month + 1, 0);

        if (monthEnd < pastLimit || monthStart > futureLimit) {
            iter.setMonth(iter.getMonth() + 1);
            continue;
        }

        const monthEl = document.createElement('div');
        monthEl.className = 'date-picker-month-container';

        const header = document.createElement('span');
        header.className = 'date-picker-month';
        header.textContent = `${iter.toLocaleString('en-AU', { month: 'short' })} ${year}`;
        monthEl.appendChild(header);

        // Render leading blank slots for weekday alignment
        const firstDow = monthStart.getDay();
        let blankCount;
        if (firstDow === 0) {
            blankCount = 6;
        } else {
            blankCount = firstDow - 1;
        }
        for (let i = 0; i < blankCount; i++) {
            monthEl.appendChild(blank());
        }

        // Render each day of the month
        for (let dayNum = 1; dayNum <= monthEnd.getDate(); dayNum++) {
            const dayDate = new Date(year, month, dayNum);
            dayDate.setHours(0, 0, 0, 0);

            const span = document.createElement('span');
            span.className = 'date-picker-date';
            span.textContent = dayNum;

            let isDisabled = false;

            // Out of overall range?
            if (dayDate < pastLimit || dayDate > futureLimit) {
                isDisabled = true;
            }

            // Disable weekends if requested
            if (btn.dataset.disableWeekends === 'true') {
                const dow = dayDate.getDay();
                if (dow === 0 || dow === 6) {
                    isDisabled = true;
                }
            }

            // Disable specific weekdays
            if (btn.dataset.disableWeekdays) {
                const weekdays = btn.dataset.disableWeekdays.split(',').map(Number);
                if (weekdays.includes(dayDate.getDay())) {
                    isDisabled = true;
                }
            }

            // Enforce linked-range logic (exclusive)
            if (group && !isDisabled) {
                if (btn.dataset.range === 'start' && endDate && dayDate.getTime() >= endDate.getTime()) {
                    isDisabled = true;
                }
                if (btn.dataset.range === 'end' && startDate && dayDate.getTime() <= startDate.getTime()) {
                    isDisabled = true;
                }
            }

            // Highlight today and optionally disable it
            if (dayDate.getTime() === now.getTime()) {
                span.classList.add('today-outline');
                if (btn.dataset.allowToday === 'false') {
                    isDisabled = true;
                }
            }

            // Highlight selected range dates
            if (group && startDate && endDate) {
                if (dayDate.getTime() === startDate.getTime()) {
                    span.classList.add('range-end');
                } else if (dayDate.getTime() === endDate.getTime()) {
                    span.classList.add('range-start');
                } else if (dayDate > startDate && dayDate < endDate) {
                    span.classList.add('in-range');
                }
            } else if (pickerState[btn.id].date) {
                // If not in range group, use active-date
                const stored = new Date(pickerState[btn.id].date);
                stored.setHours(0, 0, 0, 0);
                if (dayDate.getTime() === stored.getTime()) {
                    span.classList.add('active-date');
                }
            }

            if (isDisabled) {
                span.classList.add('date-disabled');
            }

            span.addEventListener('click', () => {
                if (span.classList.contains('date-disabled')) {
                    return;
                }

                // Remove previous active marking
                monthEl.querySelectorAll('.active-date').forEach(el => el.classList.remove('active-date'));
                span.classList.add('active-date');

                // Compute JS Date from header and day number
                const [monText, yrText] = header.textContent.split(' ');
                const selected = new Date(`${monText} ${dayNum}, ${yrText}`);

                onDateSelected(btn, selected);

                // Re-render both pickers in range group if applicable
                if (group) {
                    const startBtn = document.querySelector(`[data-range-group="${group}"][data-range="start"]`);
                    const endBtn = document.querySelector(`[data-range-group="${group}"][data-range="end"]`);

                    if (startBtn) initialiseDateRange(startBtn);
                    if (endBtn) initialiseDateRange(endBtn);
                }

                // For range-start, immediately open the end-picker
                if (group && btn.dataset.range === 'start') {
                    hidePicker();
                    const endBtn = document.querySelector(
                        `[data-range-group="${group}"][data-range="end"]`
                    );
                    if (endBtn) {
                        showDatePicker(endBtn);
                    }
                    return;
                }

                hidePicker();
            });

            monthEl.appendChild(span);
        }

        dateMonths.appendChild(monthEl);
        iter.setMonth(iter.getMonth() + 1);
    }

    /**
     * Create a blank date cell for alignment
     */
    function blank() {
        const el = document.createElement('span');
        el.className = 'date-picker-date blank-date date-disabled';
        return el;
    }
}

// Initialise and render time slots for a given date-button
function initialiseTimeContainer(btn, selectedDate) {
    timePicker.innerHTML = '';

    // Parse configuration attributes
    const interval = parseInt(btn.dataset.timeInterval, 10) || 15;
    const use24 = btn.dataset['24hour'] === 'true';
    const disallowPast = btn.dataset.allowPastTimes === 'false';

    // Determine day boundaries in minutes
    const [startH, startM] = btn.dataset.startTime.split(':').map(Number);
    const [endH, endM] = btn.dataset.endTime.split(':').map(Number);
    const startMin = startH * 60 + startM;
    const endMin = endH * 60 + endM;

    // Determine if the selected date is today
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    selectedDate.setHours(0, 0, 0, 0);
    const dateIsToday = (selectedDate.getTime() === today.getTime());

    const now = new Date();
    const nowMin = now.getHours() * 60 + now.getMinutes();

    // Range-group end-time enforcement
    const group = btn.dataset.rangeGroup;
    const isEnd = (btn.dataset.range === 'end');
    let otherValueMin = null;
    if (group && isEnd) {
        const startBtn = document.querySelector(
            `[data-range-group="${group}"][data-range="start"]`
        );
        if (startBtn && startBtn.dataset.value) {
            const txt = startBtn.dataset.value;
            const h = parseInt(txt.slice(0, 2), 10);
            const m = parseInt(txt.slice(2), 10);
            otherValueMin = h * 60 + m;
        }
    }

    let firstAvailable = null;

    // Generate each time slot
    for (let mins = startMin; mins <= endMin; mins += interval) {
        const hour24 = Math.floor(mins / 60);
        const minute = mins % 60;

        // Format display text
        let displayTxt;
        if (use24) {
            displayTxt = `${String(hour24).padStart(2, '0')}:${String(minute).padStart(2, '0')}`;
        } else {
            let hour12 = hour24 % 12;
            if (hour12 === 0) {
                hour12 = 12;
            }
            const suffix = (hour24 < 12) ? ' AM' : ' PM';
            displayTxt = `${hour12}:${String(minute).padStart(2, '0')}${suffix}`;
        }

        const span = document.createElement('span');
        span.className = 'time-element';
        span.textContent = displayTxt;

        let inactive = false;

        // Disable past times if required
        if (disallowPast && dateIsToday && (mins <= nowMin)) {
            inactive = true;
        }

        // Disable slots before the start time in a range-end
        if (isEnd && otherValueMin !== null && mins <= otherValueMin) {
            inactive = true;
        }

        if (inactive) {
            span.classList.add('inactive-time');
        } else if (!firstAvailable) {
            firstAvailable = span;
        }

        span.addEventListener('click', () => {
            if (span.classList.contains('inactive-time')) {
                return;
            }

            // Clear old selection
            timePicker.querySelectorAll('.active-time').forEach(el => el.classList.remove('active-time'));
            span.classList.add('active-time');

            onTimeSelected(btn, displayTxt, hour24, minute);

            hidePicker();
        });

        timePicker.appendChild(span);
    }

    // Restore previously selected time, if available
    const dateBtnId = btn.dataset.linkedTo || btn.id;
    const storedTime = pickerState[dateBtnId]?.time;

    let restored = false;

    if (storedTime) {
        const match = Array.from(timePicker.children).find(el =>
            el.textContent === storedTime && !el.classList.contains('inactive-time')
        );

        if (match) {
            match.classList.add('active-time');
            restored = true;
        }
    }

    // Fallback to selecting the first available time
    if (!restored && firstAvailable) {
        firstAvailable.click();
    }
}

// Show the date picker positioned under the button
function showDatePicker(btn) {
    initialiseDateRange(btn);
    positionPicker(datePicker, btn);
    datePicker.style.display = 'block';
    backdrop.style.display = 'block';
}

// Show the time picker positioned under the button
function showTimePicker(btn) {
    let selDate;

    // If the date button is linked, use its date
    if (pickerState[btn.dataset.linkedTo]?.date) {
        selDate = new Date(pickerState[btn.dataset.linkedTo].date);
    } else {
        selDate = new Date();
    }
    initialiseTimeContainer(btn, selDate);
    positionPicker(timePicker, btn);
    timePicker.style.display = 'block';
    backdrop.style.display = 'block';
}

// Position a picker element relative to its button
function positionPicker(pickerEl, btn) {
    const rect = btn.getBoundingClientRect();

    // Temporarily make the picker visible to measure it
    pickerEl.style.visibility = 'hidden';
    pickerEl.style.display = 'block';
    pickerEl.style.position = 'absolute';

    const pickerHeight = pickerEl.offsetHeight;
    const pickerWidth = pickerEl.offsetWidth;

    const scrollY = window.scrollY || document.documentElement.scrollTop;
    const scrollX = window.scrollX || document.documentElement.scrollLeft;

    const spaceBelow = window.innerHeight - rect.bottom;
    const spaceAbove = rect.top;

    // Place above if not enough room below and enough room above
    const placeAbove = pickerHeight > spaceBelow && pickerHeight < spaceAbove;

    const top = placeAbove
        ? rect.top + scrollY - pickerHeight
        : rect.bottom + scrollY;

    const left = rect.left + scrollX;

    // Apply final styles
    pickerEl.style.top = `${top}px`;
    pickerEl.style.left = `${left}px`;
    pickerEl.style.visibility = 'visible';
}

// Hide both pickers and the backdrop
function hidePicker() {
    datePicker.style.display = 'none';
    timePicker.style.display = 'none';
    backdrop.style.display = 'none';
}
