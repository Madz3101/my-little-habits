
/* MY LITTLE HABITS - CALENDAR */

// Our habit day resets at 4 am
function getHabitToday() {

    const date = new Date();

    date.setHours(date.getHours() - 4);

    return date;
}

// Convert a date to YYYY-MM-DD
function formatDate(date) {

    const year = date.getFullYear();

    const month = String(
        date.getMonth() + 1
    ).padStart(2, "0");

    const day = String(
        date.getDate()
    ).padStart(2, "0");

    return `${year}-${month}-${day}`;
}

// Load saved habit history
const calendarHistory = JSON.parse(
    localStorage.getItem("habitHistory") || "{}"
);

// Find calendar elements
const calendarGrid = document.getElementById("calendar-grid");
const calendarMonth = document.getElementById("calendar-month");

// The month we're currently viewing
const habitToday = getHabitToday();

let displayedYear = habitToday.getFullYear();
let displayedMonth = habitToday.getMonth();

// The date currently selected for editing
let selectedDate = null;

// Emojis for our three habits
const habitEmojis = {
    morning: "☀️",
    night: "🌙",
    fruit: "🍓"
};

// Build the calendar
function renderCalendar() {

    calendarGrid.innerHTML = "";

    // Display the month and year
    const monthName = new Date(
        displayedYear,
        displayedMonth,
        1
    ).toLocaleDateString("en-NZ", {
        month: "long",
        year: "numeric"
    });

    calendarMonth.textContent = monthName;

    // Add weekday headings
    const weekdays = ["M", "T", "W", "T", "F", "S", "S"];

    weekdays.forEach(function(day) {

        const heading = document.createElement("div");

        heading.className = "calendar-weekday";
        heading.textContent = day;

        calendarGrid.appendChild(heading);
    });

    // Find which weekday the month starts on
    const firstDay = new Date(
        displayedYear,
        displayedMonth,
        1
    ).getDay();

    // Convert Sunday-first to Monday-first
    const startOffset = (firstDay + 6) % 7;

    // Add empty spaces before the first date
    for (let i = 0; i < startOffset; i++) {

        const empty = document.createElement("div");

        empty.className = "calendar-empty";

        calendarGrid.appendChild(empty);
    }

    // Number of days in this month
    const daysInMonth = new Date(
        displayedYear,
        displayedMonth + 1,
        0
    ).getDate();

    // Create each date
    for (let day = 1; day <= daysInMonth; day++) {

        const date = new Date(
            displayedYear,
            displayedMonth,
            day
        );

        const dateKey = formatDate(date);

        const dayCell = document.createElement("div");

        dayCell.className = "calendar-day";
        
        
// Highlight the selected date
if (dateKey === selectedDate) {
    dayCell.classList.add("selected");
}

// Open this date when clicked
dayCell.addEventListener("click", function() {
    selectedDate = dateKey;

    renderCalendar();
    renderDateEditor();
});


        // Highlight today
        if (dateKey === formatDate(habitToday)) {
            dayCell.classList.add("today");
        }

        // Date number
        const dayNumber = document.createElement("span");

        dayNumber.className = "calendar-number";
        dayNumber.textContent = day;

        dayCell.appendChild(dayNumber);

        // Completed habit emojis
        const emojiRow = document.createElement("div");

        emojiRow.className = "calendar-emojis";

        const savedHabits = calendarHistory[dateKey] || {};

        Object.keys(habitEmojis).forEach(function(habit) {

            if (savedHabits[habit] === true) {

                const emoji = document.createElement("span");

                emoji.textContent = habitEmojis[habit];

                emojiRow.appendChild(emoji);
            }
        });

        dayCell.appendChild(emojiRow);

        calendarGrid.appendChild(dayCell);
    }
}

// Previous month button
document.getElementById("previous-month")
    .addEventListener("click", function() {

        displayedMonth--;

        if (displayedMonth < 0) {
            displayedMonth = 11;
            displayedYear--;
        }

        renderCalendar();
    });

// Next month button
document.getElementById("next-month")
    .addEventListener("click", function() {

        displayedMonth++;

        if (displayedMonth > 11) {
            displayedMonth = 0;
            displayedYear++;
        }

        renderCalendar();
    });

// Show the calendar when the page opens
renderCalendar();


/* SELECTED DATE EDITOR */

function renderDateEditor() {

    const title = document.getElementById(
        "selected-date-title"
    );

    const container = document.getElementById(
        "date-habits"
    );

    // Clear the previous buttons
    container.innerHTML = "";

    if (!selectedDate) {
        return;
    }

    // Format the selected date for display
    const date = new Date(selectedDate + "T12:00:00");

    title.textContent = date.toLocaleDateString(
        "en-NZ",
        {
            weekday: "long",
            day: "numeric",
            month: "long",
            year: "numeric"
        }
    );

    // Make sure this date exists in history
    if (!calendarHistory[selectedDate]) {
        calendarHistory[selectedDate] = {};
    }

    const habits = [
        { id: "morning", name: "Morning Brushing", emoji: "☀️" },
        { id: "night", name: "Night Brushing", emoji: "🌙" },
        { id: "fruit", name: "Fruit Today?", emoji: "🍓" }
    ];

    habits.forEach(function(habit) {

        const button = document.createElement("button");

        button.className = "date-habit-button";

        const completed =
            calendarHistory[selectedDate][habit.id] === true;

        button.textContent =
            `${habit.emoji} ${habit.name} ${completed ? "✓" : "○"}`;

        if (completed) {
            button.classList.add("completed");
        }

        // Prevent editing future dates
        if (selectedDate > formatDate(habitToday)) {
            button.disabled = true;
        }

        button.addEventListener("click", function() {

            const newValue =
                calendarHistory[selectedDate][habit.id] !== true;

            calendarHistory[selectedDate][habit.id] = newValue;

            // Save updated history
            localStorage.setItem(
                "habitHistory",
                JSON.stringify(calendarHistory)
            );

            // Refresh calendar and editor
            renderCalendar();
            renderDateEditor();
        });

        container.appendChild(button);
    });
}

