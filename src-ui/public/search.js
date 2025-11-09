const GEMINI_API_KEY = 'AIzaSyBST-U6u64VTqVrcP0rYgw7TUXWEl1zjtk';
const CITY_IMAGE_BASE_HEIGHT = 112; // px (~7rem)
const MOBILE_BREAKPOINT = 768;
let currentCityData = null;
let countrySummaries = {};
let overviewOriginalParent = null;
let overviewPlaceholder = null;
let overviewModal = null;
let overviewModalContent = null;
let overviewCloseButton = null;
let lastFocusedTrigger = null;

function isMobileView() {
    return window.innerWidth <= MOBILE_BREAKPOINT;
}

async function handleSearch(event) {
    event.preventDefault();
    
    const search_input = document.getElementById('search_box').value.toLowerCase();
    if (!search_input.trim()) return;

    document.getElementById('old_query_text').textContent = ` - ${search_input}`;

    document.getElementById('homepage').style.display = 'none';
    document.getElementById('results').style.display = '';
    try { syncOverviewHeight(); } catch (e) { /* ignore */ }

    try {
        countrySummaries = {};
        currentCityData = null;
        resetCityOverview();

        const response = await fetch(`https://generativelanguage.googleapis.com/v1/models/gemini-2.5-flash-lite:generateContent?key=${GEMINI_API_KEY}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                contents: [{
                    parts: [{
                        text: `Given the search query "${search_input}" for travel destinations, provide a JSON response with 5 relevant cities. For each city, include:
                        1. name: The city name
                        2. emoji: A single relevant emoji that represents this city, but avoid national flags
                        3. country: The country name
                        
                        Respond ONLY with the JSON array, no additional text. Format:
                        [{"name": "...", "emoji": "...", "country": "..."}, ...]`
                    }]
                }]
            })
        });

        const data = await response.json();
        if (data.candidates && data.candidates[0].content.parts[0].text) {
            try {
                let responseText = data.candidates[0].content.parts[0].text;
                
                // Clean the response text
                responseText = responseText.replace(/```json\n?/g, '')  // Remove ```json
                                        .replace(/```\n?/g, '')         // Remove closing ```
                                        .trim();                        // Remove extra whitespace
                
                // Now parse the cleaned JSON
                const destinations = JSON.parse(responseText);
                await prepareCountrySummaries(destinations);
                displayResults(destinations);
            } catch (parseError) {
                console.error('Error parsing JSON:', parseError);
                console.log('Raw response:', data.candidates[0].content.parts[0].text);
            }
        }
        
    } catch (error) {
        console.error('Error:', error);
    }
}

function displayResults(destinations) {
    const resultsContainer = document.querySelector('#results ul');
    resultsContainer.innerHTML = ''; // Clear previous results
    
    destinations.forEach(dest => {
        const li = document.createElement('li');
        const link = document.createElement('a');
        link.href = '#';
        link.dataset.city = dest.name;
        link.dataset.country = dest.country;
        link.style.border = '1px solid #eee';
        link.className = 'flex items-center p-3 text-base font-bold text-gray-900 rounded-lg hover:bg-gray-100 group hover:shadow dark:bg-gray-600 dark:hover:bg-gray-500 dark:text-white transition';
        link.innerHTML = `
            <span style="font-size: 34px;">${dest.emoji}</span>
            <span class="flex-1 ms-3 whitespace-nowrap">${dest.name}</span>
            <span class="inline-flex items-center justify-center px-2 py-0.5 ms-3 text-xs font-medium text-gray-500 bg-gray-200 rounded dark:bg-gray-700 dark:text-gray-400">${dest.country}</span>
        `;
        link.addEventListener('click', event => handleCitySelection(event, dest, link));
        li.appendChild(link);
        resultsContainer.appendChild(li);
    });
    
    // Show results section
    document.getElementById('homepage').style.display = 'none';
    document.getElementById('results').style.display = '';
    handleViewportChange();
    // Sync the overview card height to match the destinations column
    try { syncOverviewHeight(); } catch (e) { /* ignore */ }
}

function resetCityOverview() {
    const overview = document.getElementById('city_overview');
    overviewPlaceholder = overviewPlaceholder || document.getElementById('city_overview_empty');
    const cityImage = document.getElementById('city_image');

    if (overview) {
        if (overviewOriginalParent && overview.parentElement !== overviewOriginalParent) {
            overviewOriginalParent.appendChild(overview);
        }
        overview.classList.remove('in-modal');
        overview.style.display = 'none';
    }

    if (cityImage) {
        cityImage.src = './img/gray.png';
    }

    if (overviewPlaceholder) {
        overviewPlaceholder.style.display = isMobileView() ? 'none' : 'flex';
    }

    closeOverviewModal(true);
    lastFocusedTrigger = null;
}

async function handleCitySelection(event, destination, anchor) {
    event.preventDefault();
    if (!destination?.name) return;

    try {
        lastFocusedTrigger = anchor;
        anchor.blur();
        highlightSelection(anchor);

        const summary = await fetchCitySummary(destination.name);
        const meta = resolveCountryMeta(destination, summary);
        updateCityOverview(destination, summary, meta);
        if (isMobileView()) {
            openOverviewModal();
        }
        syncOverviewHeight();
    } catch (error) {
        console.error('Error loading city data:', error);
    }
}

async function fetchCitySummary(cityName) {
    const encoded = encodeURIComponent(cityName);
    const response = await fetch(`https://en.wikipedia.org/api/rest_v1/page/summary/${encoded}`);
    if (!response.ok) throw new Error(`Wikipedia summary failed for ${cityName}`);
    return response.json();
}

function updateCityOverview(destination, summary, meta) {
    const overview = document.getElementById('city_overview');
    overviewPlaceholder = overviewPlaceholder || document.getElementById('city_overview_empty');
    const inMobile = isMobileView();

    if (overviewPlaceholder) overviewPlaceholder.style.display = 'none';
    if (overview) overview.style.display = inMobile ? 'none' : 'flex';

    const imageEl = document.getElementById('city_image');
    const headingEl = document.getElementById('city_about_heading');
    const descriptionEl = document.getElementById('city_description');
    const wikiBox = document.getElementById('city_wiki_box');
    const mapBox = document.getElementById('city_map_box');
    const countryBox = document.getElementById('city_country_box');
    if (countryBox) {
        countryBox.setAttribute('aria-disabled', 'true');
    }
    const countryBoxLabel = document.getElementById('city_country_box_label');

    // Set placeholder image first
    if (imageEl) imageEl.src = './img/gray.png';

    const photo = summary?.originalimage?.source || summary?.thumbnail?.source || './img/world.jpg';
    const wikiUrl = summary?.content_urls?.desktop?.page || '#';
    const extract = summary?.extract || 'No description available.';
    const { displayCountry } = meta || resolveCountryMeta(destination, summary);
    const coords = summary?.coordinates;
    const coordinates = (coords?.lat != null && coords?.lon != null) ? { lat: coords.lat, lon: coords.lon } : null;
    const mapUrl = coordinates ? `https://www.google.com/maps/search/?api=1&query=${coordinates.lat},${coordinates.lon}` : null;
    const countrySummary = getCountrySummary(meta?.summaryKey) || null;

    if (imageEl) {
        imageEl.src = photo;
        imageEl.style.height = `${CITY_IMAGE_BASE_HEIGHT}px`;
        imageEl.dataset.baseHeight = `${CITY_IMAGE_BASE_HEIGHT}px`;
    }
    if (headingEl) headingEl.textContent = summary?.title || destination.name;
    if (descriptionEl) {
        descriptionEl.textContent = extract;
        descriptionEl.title = extract;
    }
    if (wikiBox) {
        wikiBox.href = wikiUrl;
        wikiBox.title = `Read more about ${destination.name} on Wikipedia`;
    }

    if (mapBox) {
        if (mapUrl) {
            mapBox.href = mapUrl;
            mapBox.classList.remove('pointer-events-none', 'opacity-50');
            mapBox.title = `Open ${destination.name} on Google Maps`;
        } else {
            mapBox.href = '#';
            mapBox.classList.add('pointer-events-none', 'opacity-50');
            mapBox.title = 'Coordinates not available for this city yet';
        }
    }

    if (countryBoxLabel) {
        if (displayCountry && displayCountry !== 'Unknown') {
            countryBoxLabel.textContent = `${displayCountry}`;
            countryBoxLabel.title = `${displayCountry}`;
        } else {
            countryBoxLabel.textContent = 'Country unavailable';
            countryBoxLabel.removeAttribute('title');
        }
    }

    currentCityData = {
        name: destination.name,
        title: summary?.title || destination.name,
        description: extract,
        image: photo,
        wikiUrl,
        mapUrl,
        coordinates,
        country: displayCountry,
        countrySummary
    };

    setupContinueButton();
}

function highlightSelection(anchor) {
    document.querySelectorAll('#results ul a').forEach(link => {
        link.classList.remove('bg-blue-100', 'dark:bg-gray-500');
    });
    anchor.classList.add('bg-blue-100', 'dark:bg-gray-500');
}

function getCountrySummary(country) {
    if (!country) return null;
    const target = country.trim().toLowerCase();
    for (const [key, value] of Object.entries(countrySummaries)) {
        if (typeof key === 'string' && key.trim().toLowerCase() === target) {
            return value;
        }
    }
    return null;
}

function resolveCountryMeta(destination, summary) {
    const countryName = typeof destination?.country === 'string' ? destination.country.trim() : '';
    const fallbackCountry = typeof summary?.description === 'string' ? summary.description.trim() : '';
    const displayCountry = countryName || fallbackCountry || 'Unknown';
    const summaryKey = countryName || fallbackCountry || '';
    return { displayCountry, summaryKey };
}

async function prepareCountrySummaries(destinations) {
    const countries = [...new Set(destinations
        .map(dest => dest.country)
        .filter(Boolean))];
    if (!countries.length) return;

    try {
        const prompt = `Provide a JSON object describing each of the following countries for travelers. Use the country name as the key and a single informative sentence (max 30 words) as the value. Countries: ${countries.join(', ')}.`;

        const response = await fetch(`https://generativelanguage.googleapis.com/v1/models/gemini-2.5-flash-lite:generateContent?key=${GEMINI_API_KEY}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                contents: [{
                    parts: [{ text: prompt }]
                }]
            })
        });

        const data = await response.json();
        const rawText = data?.candidates?.[0]?.content?.parts?.[0]?.text || '{}';
        const cleanText = rawText
            .replace(/```json\n?/g, '')
            .replace(/```\n?/g, '')
            .trim();
        const parsed = JSON.parse(cleanText);
        const normalized = Object.entries(parsed).reduce((acc, [key, value]) => {
            const trimmedKey = typeof key === 'string' ? key.trim() : key;
            acc[trimmedKey] = typeof value === 'string' ? value.trim() : value;
            return acc;
        }, {});
        countrySummaries = { ...countrySummaries, ...normalized };
    } catch (error) {
        console.error('Unable to load country summaries:', error);
    }
}

function setupContinueButton() {
    const button = document.getElementById('continue_button');
    if (!button) return;
    button.onclick = () => {
        if (!currentCityData) {
            console.log('No city selected yet.');
            return;
        }
        const { name, coordinates } = currentCityData;
        if (coordinates?.lat != null && coordinates?.lon != null) {
            console.log(`Selected city: ${name} (lat: ${coordinates.lat}, lon: ${coordinates.lon})`);
        } else {
            console.log(`Selected city: ${name} (coordinates unavailable)`);
        }
    };
}

function openOverviewModal() {
    if (!isMobileView()) return;
    if (!overviewModal || !overviewModalContent) return;
    const overview = document.getElementById('city_overview');
    if (!overview) return;

    if (overviewOriginalParent && overview.parentElement !== overviewModalContent) {
        overviewModalContent.innerHTML = '';
        overviewModalContent.appendChild(overview);
    }

    overview.classList.add('in-modal');
    overviewModal.classList.add('active');
    overviewModal.setAttribute('aria-hidden', 'false');
    document.body.classList.add('modal-open');

    if (overviewCloseButton) {
        overviewCloseButton.focus();
    }
}

function closeOverviewModal(silent = false) {
    if (!overviewModal) return;
    if (!overviewModal.classList.contains('active')) return;

    overviewModal.classList.remove('active');
    overviewModal.setAttribute('aria-hidden', 'true');
    document.body.classList.remove('modal-open');

    const overview = document.getElementById('city_overview');
    if (overview && overviewOriginalParent && overviewModalContent && overview.parentElement === overviewModalContent) {
        overview.classList.remove('in-modal');
        overviewOriginalParent.appendChild(overview);
        overview.style.display = isMobileView() ? 'none' : 'flex';
    }

    if (!silent && lastFocusedTrigger) {
        lastFocusedTrigger.focus();
    }
}

function handleViewportChange() {
    const overview = document.getElementById('city_overview');
    overviewPlaceholder = overviewPlaceholder || document.getElementById('city_overview_empty');

    if (isMobileView()) {
        if (overviewPlaceholder) {
            overviewPlaceholder.style.display = 'none';
            overviewPlaceholder.style.height = '';
        }
        if (overview && overview.parentElement === overviewOriginalParent) {
            overview.style.display = 'none';
            overview.style.height = '';
        }
        return;
    }

    closeOverviewModal(true);

    if (overview && overviewOriginalParent && overview.parentElement !== overviewOriginalParent) {
        overviewOriginalParent.appendChild(overview);
    }

    if (currentCityData) {
        if (overview) overview.style.display = 'flex';
        if (overviewPlaceholder) overviewPlaceholder.style.display = 'none';
    } else if (overviewPlaceholder) {
        overviewPlaceholder.style.display = 'flex';
    }
}

// Keep the right overview height in sync with the left column (destinations)
function syncOverviewHeight() {
    if (isMobileView()) {
        const overview = document.getElementById('city_overview');
        const placeholder = document.getElementById('city_overview_empty');
        if (overview) overview.style.height = '';
        if (placeholder) placeholder.style.height = '';
        return;
    }

    const left = document.getElementById('dest_list');
    if (!left) return;
    // Use offsetHeight (includes padding, border)
    const leftHeight = left.offsetHeight;

    // We support both the real overview and the empty placeholder.
    const realRight = document.getElementById('city_overview');
    const emptyRight = document.getElementById('city_overview_empty');

    // Determine which right-side card is currently visible. Prefer the real overview if shown.
    const right = (realRight && realRight.style.display !== 'none') ? realRight : emptyRight;
    if (!right) return;

    // If we're showing the placeholder, just keep the overall card height in sync and return.
    if (right.id !== 'city_overview') {
        right.style.height = leftHeight + 'px';
        return;
    }

    const info = document.getElementById('city_info');
    const img = document.getElementById('city_image');

    // Fallback: if not found, just set equal height
    if (!info || !img) {
        right.style.height = leftHeight + 'px';
        return;
    }

    // Compute paddings/borders that may affect layout (a bit of breathing room)
    const safetyGap = 8; // px - ensure some space below button/info

    // Info natural height (the block below the image). It is a flex item; use scrollHeight for full content.
    const infoHeight = info.scrollHeight;

    // Desired header height so that header + info <= leftHeight - safetyGap
    let desiredHeader = leftHeight - infoHeight - safetyGap;

    // Clamp desiredHeader to sensible min/max (in px)
    const baseHeight = CITY_IMAGE_BASE_HEIGHT;
    const minHeader = baseHeight; // fixed image height target
    const maxHeader = Math.max(300, minHeader); // ensure max >= min
    if (desiredHeader < minHeader) desiredHeader = minHeader;
    if (desiredHeader > maxHeader) desiredHeader = maxHeader;

    // Apply heights to the real image header
    img.style.height = desiredHeader + 'px';

    // Finally set the right card height equal to leftHeight so borders match exactly
    right.style.height = leftHeight + 'px';
}

// Run on load and when window resizes
window.addEventListener('resize', () => {
    handleViewportChange();
    syncOverviewHeight();
});

document.addEventListener('DOMContentLoaded', () => {
    overviewModal = document.getElementById('overview_modal');
    overviewModalContent = document.getElementById('overview_modal_content');
    overviewCloseButton = document.getElementById('overview_modal_close');

    const overview = document.getElementById('city_overview');
    overviewOriginalParent = overview?.parentElement || null;
    overviewPlaceholder = document.getElementById('city_overview_empty');

    if (overviewCloseButton) {
        overviewCloseButton.addEventListener('click', () => closeOverviewModal());
    }

    if (overviewModal) {
        overviewModal.addEventListener('click', event => {
            if (event.target === overviewModal) {
                closeOverviewModal();
            }
        });
    }

    document.addEventListener('keydown', event => {
        if (event.key === 'Escape') {
            closeOverviewModal();
        }
    });

    setupContinueButton();
    handleViewportChange();
    syncOverviewHeight();
});
