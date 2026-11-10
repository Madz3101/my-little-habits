
/* MY LITTLE HABITS - SETTINGS */

// Find our backup button
const exportButton = document.getElementById("export-backup");

exportButton.addEventListener("click", function() {

    // Read our saved habit history
    const history = JSON.parse(
        localStorage.getItem("habitHistory") || "{}"
    );

    // Prepare the backup file
    const backup = {
        app: "My Little Habits",
        version: 1,
        exportedAt: new Date().toISOString(),
        habitHistory: history
    };

    // Convert the backup to JSON text
    const json = JSON.stringify(backup, null, 2);

    // Create a downloadable file
    const blob = new Blob(
        [json],
        { type: "application/json" }
    );

    const url = URL.createObjectURL(blob);

    const link = document.createElement("a");
    link.href = url;

    const date = new Date().toISOString().slice(0, 10);

    link.download = `my-little-habits-${date}.json`;

    // Download the backup
    document.body.appendChild(link);
    link.click();
    link.remove();

    URL.revokeObjectURL(url);

    // Show confirmation
    document.getElementById("backup-message").textContent =
        "💜 Your backup has been prepared!";
});


/* RESTORE BACKUP - FILE SELECTION */

const restoreButton = document.getElementById("restore-backup");
const backupFileInput = document.getElementById("backup-file");

restoreButton.addEventListener("click", function() {

    backupFileInput.click();

});


/* RESTORE BACKUP - IMPORT DATA */

backupFileInput.addEventListener("change", async function() {

    const file = backupFileInput.files[0];

    if (!file) {
        return;
    }

    try {

        // Read the selected backup file
        const text = await file.text();

        // Convert the file into JavaScript data
        const backup = JSON.parse(text);

        // Check that this is a valid backup
        if (
            backup.app !== "My Little Habits" ||
            backup.version !== 1 ||
            !backup.habitHistory ||
            typeof backup.habitHistory !== "object" ||
            Array.isArray(backup.habitHistory)
        ) {
            throw new Error("Invalid backup file");
        }

        // Check each saved date and habit
        for (const [date, habits] of Object.entries(backup.habitHistory)) {

            const validDate =
                /^\d{4}-\d{2}-\d{2}$/.test(date) &&
                !Number.isNaN(Date.parse(date));

            if (
                !validDate ||
                !habits ||
                typeof habits !== "object" ||
                Array.isArray(habits)
            ) {
                throw new Error("Invalid habit history");
            }

            for (const [habit, completed] of Object.entries(habits)) {

                if (
                    !["morning", "night", "fruit"].includes(habit) ||
                    typeof completed !== "boolean"
                ) {
                    throw new Error("Invalid habit data");
                }
            }
        }

        // Ask before replacing existing history
        const confirmed = confirm(
            "Restore this backup?\n\n" +
            "This will REPLACE the habit history on this device. " +
            "Your current history will be overwritten."
        );

        if (!confirmed) {
            return;
        }

        // Save restored history
        localStorage.setItem(
            "habitHistory",
            JSON.stringify(backup.habitHistory)
        );

        document.getElementById("backup-message").textContent =
            "💜 Backup restored successfully!";

    } catch (error) {

        document.getElementById("backup-message").textContent =
            "⚠️ Could not restore backup. Please check the file.";

        console.error(error);

    } finally {

        // Allow the same file to be selected again
        backupFileInput.value = "";

    }
});
