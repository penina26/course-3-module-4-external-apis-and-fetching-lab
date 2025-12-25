// index.js
const weatherApi = "https://api.weather.gov/alerts/active?area=";

document.addEventListener("DOMContentLoaded", () => {
    // Grab DOM elements
    const stateInput = document.querySelector("#state-input");
    const fetchBtn = document.querySelector("#fetch-alerts");
    const alertsDisplay = document.querySelector("#alerts-display");
    const errorMessage = document.querySelector("#error-message");
    const spinnerEl = document.querySelector("#loading-spinner");

    // Show/hide loading indicator
    function showSpinner() {
        if (spinnerEl) spinnerEl.classList.remove("hidden");
    }

    function hideSpinner() {
        if (spinnerEl) spinnerEl.classList.add("hidden");
    }

    // Reset alert results area
    function clearAlerts() {
        alertsDisplay.innerHTML = "";
    }

    // Error helpers (use error.message from catch)
    function showError(message) {
        errorMessage.textContent = message;
        errorMessage.classList.remove("hidden");
    }

    function clearError() {
        errorMessage.textContent = "";
        errorMessage.classList.add("hidden");
    }

    // Validate input: must be 2 capital letters (e.g., "NY")
    function validateState(stateAbbr) {
        if (!stateAbbr) throw new Error("State abbreviation is required.");
        if (!/^[A-Z]{2}$/.test(stateAbbr)) {
            throw new Error('Please enter a valid 2-letter state abbreviation (e.g., "NY").');
        }
    }

    // Render summary + list of alert headlines
    function renderAlerts(data) {
        const features = Array.isArray(data.features) ? data.features : [];
        const count = features.length;

        // Summary required by lab: "Current watches... for X: N"
        const summary = document.createElement("p");
        summary.textContent = `${data.title}: ${count}`;
        alertsDisplay.append(summary);

        // Headlines list
        const ul = document.createElement("ul");
        features.forEach((feature) => {
            const li = document.createElement("li");
            li.textContent = feature?.properties?.headline || "No headline available";
            ul.append(li);
        });

        alertsDisplay.append(ul);
    }

    // Fetch alerts from National Weather Service API
    async function fetchAlerts(stateAbbr) {
        const response = await fetch(`${weatherApi}${stateAbbr}`);

        // Convert non-2xx responses into a thrown error
        if (!response.ok) {
            throw new Error(`Request failed: ${response.status} ${response.statusText}`);
        }

        return response.json();
    }

    // Button click handler
    async function handleClick() {
        const stateAbbr = stateInput.value.trim().toUpperCase();

        // input clears when button clicked
        stateInput.value = "";

        //  remove old results before showing new ones
        clearAlerts();

        try {
            clearError();
            validateState(stateAbbr);

            showSpinner();
            const data = await fetchAlerts(stateAbbr);

            renderAlerts(data);

            // hide/clear error after successful request
            clearError();
        } catch (error) {
            showError(error.message);
        } finally {
            hideSpinner();
        }
    }

    // Hook up the button
    fetchBtn.addEventListener("click", handleClick);

    // Initial UI state
    clearError();
    hideSpinner();
});
