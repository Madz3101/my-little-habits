
/* MY LITTLE HABITS - JAVASCRIPT */

// Find all habit buttons
const habitButtons = document.querySelectorAll(".habit-button");


/* GET TODAY'S HABIT DATE */

// Our day resets at 4 am instead of midnight
function getToday() {

    const today = new Date();

    // Move the clock back 4 hours
    today.setHours(today.getHours() - 4);

    const year = today.getFullYear();

    const month = String(
        today.getMonth() + 1
    ).padStart(2, "0");

    const day = String(
        today.getDate()
    ).padStart(2, "0");

    return `${year}-${month}-${day}`;
}

// Load previously saved habit history
let habitHistory = JSON.parse(
    localStorage.getItem("habitHistory") || "{}"
);

// Today's date
const today = getToday();

// Make sure today has an entry
if (!habitHistory[today]) {
    habitHistory[today] = {};
}

// Display saved habits
habitButtons.forEach(function(button) {

    const habit = button.dataset.habit;

    // Restore saved completion
    if (habitHistory[today][habit] === true) {
        button.classList.add("completed");
    }

    // Handle button clicks
    button.addEventListener("click", function() {

        const completed = button.classList.toggle("completed");

        // Update today's history
        habitHistory[today][habit] = completed;

        // Save everything
        localStorage.setItem(
            "habitHistory",
            JSON.stringify(habitHistory)
        );

    });

});


/* DAILY PROGRESS */

// Find progress elements
const progressCount = document.getElementById("progress-count");
const progressFill = document.getElementById("progress-fill");

// Calculate and display progress
function updateProgress() {

    const total = habitButtons.length;

    const completed = document.querySelectorAll(
        ".habit-button.completed"
    ).length;

    // Update text
    progressCount.textContent = `${completed} / ${total}`;

    // Update progress bar
    const percentage = total > 0
        ? (completed / total) * 100
        : 0;

    progressFill.style.width = percentage + "%";
}

// Display progress when page loads
updateProgress();

// Update progress whenever a habit is clicked
habitButtons.forEach(function(button) {

    button.addEventListener("click", updateProgress);

});

/* INDIVIDUAL HABIT STREAKS */

// Move backwards by one calendar day
function previousDate(dateString) {

    const date = new Date(dateString + "T12:00:00");

    date.setDate(date.getDate() - 1);

    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");

    return `${year}-${month}-${day}`;
}

// Calculate a habit's current streak
function calculateStreak(habit) {

    let streak = 0;
    let date = getToday();

    // If today isn't completed, check yesterday
    if (habitHistory[date]?.[habit] !== true) {
        date = previousDate(date);
    }

    // Count consecutive completed days
    while (habitHistory[date]?.[habit] === true) {

        streak++;

        date = previousDate(date);
    }

    return streak;
}

// Display all streaks
function updateStreaks() {

    document.querySelectorAll(".habit-streak").forEach(
        function(element) {

            const habit = element.dataset.streak;
            const streak = calculateStreak(habit);

            element.textContent =
                `🔥 ${streak} day${streak === 1 ? "" : "s"} streak`;
        }
    );
}

// Calculate streaks when the page loads
updateStreaks();

// Recalculate whenever a habit is clicked
habitButtons.forEach(function(button) {

    button.addEventListener("click", updateStreaks);

});

