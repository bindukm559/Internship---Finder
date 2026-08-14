// ==========================================
// INTERNSHIP FINDER - COMPLETE JAVASCRIPT
// ==========================================


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
// FILTER ALL INTERNSHIPS
// ==========================================

function applyFilters() {

    let numberOfVisibleCards = 0;


    cards.forEach(function (card) {

        // Read card information

        const cardCategory =
            card.getAttribute("data-category");

        const cardDuration =
            card.getAttribute("data-duration");

        const cardSearch =
            card.getAttribute("data-search");


        // -----------------------------
        // CATEGORY
        // -----------------------------

        let categoryMatches = true;

        if (currentCategory !== "All") {

            categoryMatches =
                cardCategory === currentCategory;

        }


        // -----------------------------
        // DURATION
        // -----------------------------

        let durationMatches = true;

        if (currentDuration !== "All") {

            durationMatches =
                cardDuration === currentDuration;

        }


        // -----------------------------
        // SEARCH
        // -----------------------------

        let searchMatches = true;

        if (currentSearch !== "") {

            searchMatches =
                cardSearch
                    .toLowerCase()
                    .includes(
                        currentSearch.toLowerCase()
                    );

        }


        // -----------------------------
        // FINAL RESULT
        // -----------------------------

        const shouldShow =
            categoryMatches &&
            durationMatches &&
            searchMatches;


        // IMPORTANT:
        // Directly change display.

        if (shouldShow) {

            card.style.display = "flex";

            numberOfVisibleCards++;

        } else {

            card.style.display = "none";

        }

    });


    // -----------------------------
    // RESULT COUNT
    // -----------------------------

    if (numberOfVisibleCards === 1) {

        resultCount.textContent =
            "1 internship";

    } else {

        resultCount.textContent =
            numberOfVisibleCards +
            " internships";

    }


    // -----------------------------
    // NO RESULTS
    // -----------------------------

    if (numberOfVisibleCards === 0) {

        emptyState.hidden = false;

    } else {

        emptyState.hidden = true;

    }

}


// ==========================================
// EXPLORE CATEGORY BUTTONS
// ==========================================

categoryButtons.forEach(function (button) {

    button.addEventListener("click", function () {

        // Get category from button

        currentCategory =
            button.getAttribute("data-category");


        // Make clicked button active

        categoryButtons.forEach(function (item) {

            item.classList.remove("active");

        });

        button.classList.add("active");


        // Apply category filter

        applyFilters();


        // Move to internship section

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

searchForm.addEventListener("submit", function (event) {

    event.preventDefault();


    currentSearch =
        searchInput.value.trim();


    applyFilters();


    document
        .getElementById("internships")
        .scrollIntoView({
            behavior: "smooth",
            block: "start"
        });

});


// Search while typing

searchInput.addEventListener("input", function () {

    currentSearch =
        searchInput.value.trim();

    applyFilters();

});


// ==========================================
// DURATION FILTER
// ==========================================

durationFilter.addEventListener("change", function () {

    currentDuration =
        durationFilter.value;


    applyFilters();


    document
        .getElementById("internships")
        .scrollIntoView({
            behavior: "smooth",
            block: "start"
        });

});


// ==========================================
// RESET
// ==========================================

resetButton.addEventListener("click", function () {

    // Reset variables

    currentCategory = "All";
    currentDuration = "All";
    currentSearch = "";


    // Reset search

    searchInput.value = "";


    // Reset duration

    durationFilter.value = "All";


    // Reset category buttons

    categoryButtons.forEach(function (button) {

        button.classList.remove("active");

    });


    const allButton =
        document.querySelector(
            '.category-button[data-category="All"]'
        );


    if (allButton) {

        allButton.classList.add("active");

    }


    // Show everything

    applyFilters();

});


// ==========================================
// SAVED INTERNSHIPS
// ==========================================

function getSaved() {

    const saved =
        localStorage.getItem(
            "internshipFinderSaved"
        );

    if (saved) {

        return JSON.parse(saved);

    }

    return [];

}


function setSaved(saved) {

    localStorage.setItem(
        "internshipFinderSaved",
        JSON.stringify(saved)
    );

}


// ==========================================
// SAVE BUTTON
// ==========================================

document
    .querySelectorAll(".save-button")
    .forEach(function (button) {

        button.addEventListener(
            "click",
            function () {

                const card =
                    button.closest(
                        ".internship-card"
                    );


                const title =
                    card.querySelector(
                        "h3"
                    ).textContent.trim();


                const company =
                    card.querySelector(
                        ".company"
                    ).textContent.trim();


                const category =
                    card.getAttribute(
                        "data-category"
                    );


                let saved =
                    getSaved();


                const existing =
                    saved.findIndex(
                        function (item) {

                            return (
                                item.title ===
                                title
                            );

                        }
                    );


                if (existing >= 0) {

                    saved.splice(
                        existing,
                        1
                    );

                } else {

                    saved.push({

                        title: title,

                        company: company,

                        category: category

                    });

                }


                setSaved(saved);

                updateSaved();

            }
        );

    });


// ==========================================
// UPDATE SAVED
// ==========================================

function updateSaved() {

    const saved =
        getSaved();


    savedCount.textContent =
        saved.length;


    // Update heart buttons

    cards.forEach(function (card) {

        const title =
            card.querySelector(
                "h3"
            ).textContent.trim();


        const button =
            card.querySelector(
                ".save-button"
            );


        const found =
            saved.some(
                function (item) {

                    return item.title === title;

                }
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
            .querySelector(".remove-saved")
            .addEventListener(
                "click",
                function () {

                    removeSaved(item.title);

                }
            );


        savedList.appendChild(
            savedItem
        );

    });

}


// ==========================================
// REMOVE SAVED
// ==========================================

function removeSaved(title) {

    let saved =
        getSaved();


    saved =
        saved.filter(
            function (item) {

                return item.title !== title;

            }
        );


    setSaved(saved);

    updateSaved();

}


// ==========================================
// START
// ==========================================

applyFilters();

updateSaved();