//currently unused
document.addEventListener("DOMContentLoaded", async () => {
    try {
        const response = await fetch("nav.html");

        if (!response.ok) {
            throw new Error("Failed to load navigation");
        }

        const navHtml = await response.text();

        document.getElementById("nav-container").innerHTML = navHtml;

    } catch (error) {
        console.error("Failed to load navigation:", error);
    }
});