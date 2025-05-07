// index.js

// This script handles the date and time selection for a form submission.
document.getElementById("submit-datetime-btn").addEventListener("click", () => {
    const dateBtn = document.getElementById("submit-date");
    const timeBtn = document.getElementById("submit-time");

    const dateStored = dateBtn.dataset.value;
    const timeStored = timeBtn.dataset.value;

    if (!dateStored || !timeStored) {
        console.warn("Date or time not selected.");
        return;
    }

    // Parse "D-M-YYYY" → ISO
    const [d, m, y] = dateStored.split('-').map(Number);
    const dateObj = new Date(y, m - 1, d);
    const dateISO = dateObj.toISOString().split("T")[0];

    // Parse "HHMM" → "HH:mm"
    const timeFormatted = timeStored.slice(0, 2) + ":" + timeStored.slice(2);

    const payload = {
        date: dateISO,
        time: timeFormatted
    };

    console.log("Payload:", payload);
    const formattedAU = dateObj.toLocaleDateString('en-AU', {
        day: 'numeric',
        month: 'short',
        year: 'numeric'
    });

    // e.g. "7 May 2025, 12:00"
    console.log("For display:", formattedAU + ", " + timeFormatted);
});
