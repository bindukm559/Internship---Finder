// ==========================================
// INTERNSHIP FINDER - BACKEND CONNECTED
// ==========================================

const API_BASE = "https://internship-finder-5l57.onrender.com";

// ---------- GET ELEMENTS ----------

const menuToggle = document.getElementById("menu-toggle");
const navigation = document.getElementById("primary-navigation");

const searchForm = document.getElementById("search-form");
const searchInput = document.getElementById("search-input");

const categoryButtons =
    document.querySelectorAll(".category-button");

const durationFilter =
    document.getElementById("duration-filter");

const resetButton =
    document.getElementById("reset-button");

const cards =
    document.querySelectorAll(".internship-card");

const resultCount =
    document.getElementById("result-count");

const emptyState =
    document.getElementById("empty-state");

const savedCount =
    document.getElementById("saved-count");

const savedList =
    document.getElementById("saved-list");


// ---------- CURRENT FILTERS ----------

let currentCategory = "All";
let currentDuration = "All";
let currentSearch = "";


// ---------- INTERNSHIP DATA ----------

let internships = [];


// ==========================================
// MOBILE MENU
// ==========================================

menuToggle.addEventListener("click", function () {

    navigation.classList.toggle("open");

    const isOpen =
        navigation.classList.contains("open");

    menuToggle.setAttribute(
        "aria-expanded",
        isOpen
    );

});


// Close navigation after clicking a link

document.querySelectorAll(".nav-link").forEach(function (link) {

    link.addEventListener("click", function () {

        navigation.classList.remove("open");

        menuToggle.setAttribute(
            "aria-expanded",
            "false"
        );

    });

});


// ==========================================
// LOAD INTERNSHIPS FROM BACKEND
// ==========================================

async function loadInternships() {

    try {

        const response =
            await fetch(`${API_BASE}/internships`);

        const result =
            await response.json();

        if (!response.ok || !result.success) {

            throw new Error(
                result.message || "Unable to load internships"
            );

        }

        internships = result.data || [];

        connectInternshipsToCards();

        applyFilters();

    } catch (error) {

        console.error(
            "Error loading internships:",
            error
        );

        resultCount.textContent =
            "Unable to load internships";

        emptyState.hidden = false;

        emptyState.innerHTML = `
            <p>
                Unable to load internships.
                Please make sure the backend is running.
            </p>
        `;

    }

}


// ==========================================
// CONNECT BACKEND DATA TO EXISTING CARDS
// ==========================================

function connectInternshipsToCards() {

    cards.forEach(function (card, index) {

        const internship =
            internships[index];

        if (!internship) {
            card.style.display = "none";
            return;
        }

        // Store backend ID on the card

        card.setAttribute(
            "data-id",
            internship.id
        );

        card.setAttribute(
            "data-category",
            internship.category || ""
        );

        card.setAttribute(
            "data-duration",
            internship.duration || ""
        );

        // Search information

        const searchText = [

            internship.title,

            internship.company,

            internship.category,

            internship.location,

            internship.mode,

            internship.description,

            ...(internship.skills || [])

        ]
            .filter(Boolean)
            .join(" ");

        card.setAttribute(
            "data-search",
            searchText
        );

        // Update title

        const titleElement =
            card.querySelector("h3");

        if (titleElement) {

            titleElement.textContent =
                internship.title;

        }

        // Update company

        const companyElement =
            card.querySelector(".company");

        if (companyElement) {

            companyElement.textContent =
                internship.company;

        }

    });

}


// ==========================================
// FILTER ALL INTERNSHIPS
// ==========================================

async function applyFilters() {

    if (internships.length === 0) {
        return;
    }

    let filteredInternships =
        internships;


    // ======================================
    // SEARCH - BACKEND
    // ======================================

    if (currentSearch !== "") {

        try {

            const response =
                await fetch(
                    `${API_BASE}/internships?search=${encodeURIComponent(currentSearch)}`
                );

            const result =
                await response.json();

            if (result.success) {

                filteredInternships =
                    result.data || [];

            }

        } catch (error) {

            console.error(
                "Search error:",
                error
            );

        }

    }


    // ======================================
    // CATEGORY - BACKEND
    // ======================================

    if (currentCategory !== "All") {

        try {

            const response =
                await fetch(
                    `${API_BASE}/internships?category=${encodeURIComponent(currentCategory)}`
                );

            const result =
                await response.json();

            if (result.success) {

                const categoryResults =
                    result.data || [];

                const categoryIds =
                    new Set(
                        categoryResults.map(
                            item => item.id
                        )
                    );

                filteredInternships =
                    filteredInternships.filter(
                        item =>
                            categoryIds.has(item.id)
                    );

            }

        } catch (error) {

            console.error(
                "Category filter error:",
                error
            );

        }

    }


    // ======================================
    // DURATION
    // ======================================

    if (currentDuration !== "All") {

        filteredInternships =
            filteredInternships.filter(
                function (internship) {

                    return (
                        internship.duration ===
                        currentDuration
                    );

                }
            );

    }


    // IDs that should be visible

    const visibleIds =
        new Set(
            filteredInternships.map(
                internship => internship.id
            )
        );


    // ======================================
    // SHOW / HIDE EXISTING CARDS
    // ======================================

    let numberOfVisibleCards = 0;

    cards.forEach(function (card) {

        const cardId =
            Number(
                card.getAttribute("data-id")
            );

        if (visibleIds.has(cardId)) {

            card.style.display = "flex";

            numberOfVisibleCards++;

        } else {

            card.style.display = "none";

        }

    });


    // ======================================
    // RESULT COUNT
    // ======================================

    if (numberOfVisibleCards === 1) {

        resultCount.textContent =
            "1 internship";

    } else {

        resultCount.textContent =
            numberOfVisibleCards +
            " internships";

    }


    // ======================================
    // NO RESULTS
    // ======================================

    if (numberOfVisibleCards === 0) {

        emptyState.hidden = false;

    } else {

        emptyState.hidden = true;

    }

}


// ==========================================
// CATEGORY BUTTONS
// ==========================================

categoryButtons.forEach(function (button) {

    button.addEventListener("click", async function () {

        currentCategory =
            button.getAttribute(
                "data-category"
            );


        categoryButtons.forEach(function (item) {

            item.classList.remove("active");

        });


        button.classList.add("active");


        await applyFilters();


        document
            .getElementById("internships")
            .scrollIntoView({
                behavior: "smooth",
                block: "start"
            });

    });

});


// ==========================================
// SEARCH
// ==========================================

searchForm.addEventListener(
    "submit",
    async function (event) {

        event.preventDefault();

        currentSearch =
            searchInput.value.trim();

        await applyFilters();


        document
            .getElementById("internships")
            .scrollIntoView({
                behavior: "smooth",
                block: "start"
            });

    }
);


// Search while typing

searchInput.addEventListener(
    "input",
    async function () {

        currentSearch =
            searchInput.value.trim();

        await applyFilters();

    }
);


// ==========================================
// DURATION FILTER
// ==========================================

durationFilter.addEventListener(
    "change",
    async function () {

        currentDuration =
            durationFilter.value;

        await applyFilters();


        document
            .getElementById("internships")
            .scrollIntoView({
                behavior: "smooth",
                block: "start"
            });

    }
);


// ==========================================
// RESET
// ==========================================

resetButton.addEventListener(
    "click",
    async function () {

        currentCategory = "All";

        currentDuration = "All";

        currentSearch = "";


        searchInput.value = "";

        durationFilter.value = "All";


        categoryButtons.forEach(
            function (button) {

                button.classList.remove(
                    "active"
                );

            }
        );


        const allButton =
            document.querySelector(
                '.category-button[data-category="All"]'
            );


        if (allButton) {

            allButton.classList.add("active");

        }


        await applyFilters();

    }
);


// ==========================================
// GET SAVED FROM BACKEND
// ==========================================

async function getSavedFromBackend() {

    try {

        const response =
            await fetch(
                `${API_BASE}/saved`
            );

        const result =
            await response.json();

        if (!response.ok || !result.success) {

            throw new Error(
                result.message ||
                "Unable to load saved internships"
            );

        }

        return result.data || [];

    } catch (error) {

        console.error(
            "Error loading saved internships:",
            error
        );

        return [];

    }

}


// ==========================================
// SAVE INTERNSHIP
// ==========================================

async function saveInternship(
    internshipId
) {

    try {

        const response =
            await fetch(
                `${API_BASE}/saved`,
                {
                    method: "POST",

                    headers: {
                        "Content-Type":
                            "application/json"
                    },

                    body: JSON.stringify({
                        internship_id:
                            internshipId
                    })

                }
            );


        const result =
            await response.json();


        if (!response.ok) {

            // Already saved

            if (response.status === 409) {

                return false;

            }

            throw new Error(
                result.message ||
                "Unable to save internship"
            );

        }


        return true;

    } catch (error) {

        console.error(
            "Save error:",
            error
        );

        return false;

    }

}


// ==========================================
// REMOVE SAVED INTERNSHIP
// ==========================================

async function removeSavedById(
    internshipId
) {

    try {

        const response =
            await fetch(
                `${API_BASE}/saved/${internshipId}`,
                {
                    method: "DELETE"
                }
            );


        const result =
            await response.json();


        if (!response.ok) {

            throw new Error(
                result.message ||
                "Unable to remove internship"
            );

        }


        return true;

    } catch (error) {

        console.error(
            "Remove saved error:",
            error
        );

        return false;

    }

}


// ==========================================
// ==========================================
// SAVE BUTTONS
// ==========================================

// ==========================================
// SAVE / UNSAVE INTERNSHIP
// ==========================================

document.addEventListener("click", async function (event) {

    const button = event.target.closest(".save-button");

    // If the clicked element is not a save button
    if (!button) {
        return;
    }

    const card = button.closest(".internship-card");

    if (!card) {
        console.error("Internship card not found");
        return;
    }

    // Get internship ID from the card
    const internshipId = Number(
        card.getAttribute("data-id")
    );

    console.log("Clicked internship ID:", internshipId);

    if (!internshipId) {
        console.error("Internship ID not found on card");
        return;
    }

    try {

        // Get currently saved internships from backend
        const saved = await getSavedFromBackend();

        const alreadySaved = saved.some(
            function (internship) {
                return Number(internship.id) === internshipId;
            }
        );

        console.log("Already saved:", alreadySaved);

        // ==========================================
        // UNSAVE
        // ==========================================

        if (alreadySaved) {

            console.log(
                "Removing internship:",
                internshipId
            );

            const removed =
                await removeSavedById(internshipId);

            if (!removed) {
                console.error(
                    "Could not remove internship"
                );
                return;
            }

            // Change heart to empty
            button.textContent = "♡";
            button.setAttribute(
                "aria-pressed",
                "false"
            );

        }

        // ==========================================
        // SAVE
        // ==========================================

        else {

            console.log(
                "Saving internship:",
                internshipId
            );

            const savedSuccessfully =
                await saveInternship(internshipId);

            if (!savedSuccessfully) {
                console.error(
                    "Could not save internship"
                );
                return;
            }

            // Change heart to filled
            button.textContent = "♥";
            button.setAttribute(
                "aria-pressed",
                "true"
            );
        }

        // Refresh saved section
        await updateSaved();

        console.log(
            "Save/Unsave completed successfully"
        );

    } catch (error) {

        console.error(
            "Save/Unsave error:",
            error
        );
    }

});
// ==========================================
// UPDATE SAVED
// ==========================================

async function updateSaved() {

    const saved =
        await getSavedFromBackend();


    savedCount.textContent =
        saved.length;


    // Update heart buttons

    cards.forEach(function (card) {

        const cardId =
            Number(
                card.getAttribute("data-id")
            );


        const button =
            card.querySelector(
                ".save-button"
            );


        if (!button) {
            return;
        }


        const found =
            saved.some(
                internship =>
                    internship.id ===
                    cardId
            );


        if (found) {

            button.textContent = "♥";

            button.setAttribute(
                "aria-pressed",
                "true"
            );

        } else {

            button.textContent = "♡";

            button.setAttribute(
                "aria-pressed",
                "false"
            );

        }

    });


    // Saved list

    if (saved.length === 0) {

        savedList.innerHTML = `
            <p class="saved-empty">
                You have not saved any internships yet.
            </p>
        `;

        return;

    }


    savedList.innerHTML = "";


    saved.forEach(function (item) {

        const savedItem =
            document.createElement("div");


        savedItem.className =
            "saved-item";


        savedItem.innerHTML = `

            <div>

                <strong>
                    ${item.title}
                </strong>

                <span>
                    ${item.company} · ${item.category}
                </span>

            </div>

            <button
                type="button"
                class="remove-saved">

                Remove

            </button>

        `;


        savedItem
            .querySelector(
                ".remove-saved"
            )
            .addEventListener(
                "click",
                async function () {

                    const removed =
                        await removeSavedById(
                            item.id
                        );

                    if (removed) {

                        await updateSaved();

                    }

                }
            );


        savedList.appendChild(
            savedItem
        );

    });

}


// ==========================================
// START APPLICATION
// ==========================================

async function startApplication() {

    await loadInternships();

    await updateSaved();

}


// Start

startApplication();
