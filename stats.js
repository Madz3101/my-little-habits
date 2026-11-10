
/* MY LITTLE HABITS - STATISTICS */

// Load saved habit history
const statsHistory = JSON.parse(
    localStorage.getItem("habitHistory") || "{}"
);

// Our day resets at 4 am
function getStatsToday() {

    const date = new Date();
    date.setHours(date.getHours() - 4);

    return formatStatsDate(date);
}

// Convert date to YYYY-MM-DD
function formatStatsDate(date) {

    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");

    return `${year}-${month}-${day}`;
}

// Move back one calendar day
function previousStatsDate(dateString) {

    const date = new Date(dateString + "T12:00:00");

    date.setDate(date.getDate() - 1);

    return formatStatsDate(date);
}

// Calculate current streak
function getCurrentStreak(habit) {

    let date = getStatsToday();
    let streak = 0;

    // Allow today to be unfinished
    if (statsHistory[date]?.[habit] !== true) {
        date = previousStatsDate(date);
    }

    while (statsHistory[date]?.[habit] === true) {

        streak++;
        date = previousStatsDate(date);
    }

    return streak;
}

// Calculate personal best streak
function getBestStreak(habit) {

    const dates = Object.keys(statsHistory)
        .filter(function(date) {
            return statsHistory[date][habit] === true;
        })
        .sort();

    let best = 0;
    let current = 0;
    let previous = null;

    dates.forEach(function(date) {

        if (previous && previousStatsDate(date) === previous) {
            current++;
        } else {
            current = 1;
        }

        best = Math.max(best, current);
        previous = date;
    });

    return best;
}

// Count total completed days
function getTotalDays(habit) {

    return Object.values(statsHistory)
        .filter(function(day) {
            return day[habit] === true;
        })
        .length;
}

// Our three habits
const statsHabits = [
    { id: "morning", name: "Morning Brushing", emoji: "☀️" },
    { id: "night", name: "Night Brushing", emoji: "🌙" },
    { id: "fruit", name: "Fruit Today?", emoji: "🍓" }
];

// Build statistics cards
function renderStats() {

    const container = document.getElementById(
        "stats-container"
    );

    container.innerHTML = "";

    statsHabits.forEach(function(habit) {

        const current = getCurrentStreak(habit.id);
        const best = getBestStreak(habit.id);
        const total = getTotalDays(habit.id);
        const isRecord = current > 0 && current === best;

        const card = document.createElement("div");
        card.className = "stats-card";

        card.innerHTML = `
            <h3>${habit.emoji} ${habit.name}</h3>

            <div class="stats-numbers">

                <div>
                    <strong>${current}</strong>
                    <span>Current Streak</span>
                </div>

                <div>
                    <strong>${best}</strong>
                    <span>Personal Best</span>
                </div>

                <div>
                    <strong>${total}</strong>
                    <span>Total Days</span>
                </div>

            </div>
        `;

        container.appendChild(card);
    });
}

// Display statistics
renderStats();


/* MONTHLY PROGRESS GRAPH */


// Remember which month we're viewing
const graphToday = new Date();
graphToday.setHours(graphToday.getHours() - 4);

let graphYear = graphToday.getFullYear();
let graphMonth = graphToday.getMonth();


function renderMonthlyGraph() {

    const container = document.getElementById("habit-graph");

    container.innerHTML = "";


    // Use the month selected by our arrows
    const year = graphYear;
    const month = graphMonth;


    // First day of the month
    const monthStart = new Date(year, month, 1);

    
    // Count days in the selected month
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    // Current month counts only days through today
    const isCurrentMonth =
       year === graphToday.getFullYear() &&
       month === graphToday.getMonth();

    const daysSoFar = isCurrentMonth
        ? graphToday.getDate()
        : daysInMonth;


    const monthTitle = document.createElement("p");
    monthTitle.className = "graph-month";

    monthTitle.textContent = monthStart.toLocaleDateString(
        "en-NZ",
        { month: "long", year: "numeric" }
    );

    
// Show selected month between the arrows
document.getElementById("graph-month-title").textContent =
    monthTitle.textContent;


    statsHabits.forEach(function(habit) {

        let completedDays = 0;

        // Count completed dates this month
        for (let day = 1; day <= daysSoFar; day++) {

            const date = new Date(year, month, day);
            const dateKey = formatStatsDate(date);

            if (statsHistory[dateKey]?.[habit.id] === true) {
                completedDays++;
            }
        }

        const percentage = Math.round(
            (completedDays / daysSoFar) * 100
        );

        const row = document.createElement("div");
        row.className = "graph-row";

        row.innerHTML = `
            <div class="graph-label">
                <span>${habit.emoji} ${habit.name}</span>
                <span>${completedDays}/${daysSoFar} days</span>
            </div>

            <div class="graph-track">
                <div class="graph-fill"
                     style="width: ${percentage}%">
                </div>
            </div>

            <p class="graph-percentage">
                ${percentage}% completed
            </p>
        `;

        container.appendChild(row);
    });
}


// Previous month arrow
document.getElementById("graph-previous")
    .addEventListener("click", function() {

        graphMonth--;

        if (graphMonth < 0) {
            graphMonth = 11;
            graphYear--;
        }

        renderMonthlyGraph();
    });

// Next month arrow
document.getElementById("graph-next")
    .addEventListener("click", function() {

        graphMonth++;

        if (graphMonth > 11) {
            graphMonth = 0;
            graphYear++;
        }

        renderMonthlyGraph();
    });


// Display monthly graph
renderMonthlyGraph();

