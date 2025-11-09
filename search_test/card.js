// Skeleton loading functions
function showSkeleton() {
    document.getElementById('places-drawer-skeleton').style.display = 'block';
    document.getElementById('drawer-content').style.display = 'none';
}

function hideSkeleton() {
    document.getElementById('places-drawer-skeleton').style.display = 'none';
    document.getElementById('drawer-content').style.display = 'block';
}

// Function to fetch and display place details
async function loadAndShowPlaceDetails(placeId) {
    showSkeleton();
    try {
        const response = await fetch(`https://timefactories.com/cgi-bin/guh/places.cgi/details/${placeId}`);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        populateCard(data);
    } catch (error) {
        console.error('Error fetching place details:', error);
        // Optionally, you could show an error message in the drawer
    } finally {
        hideSkeleton();
    }
}

// Function to populate the card with place details
function populateCard(data) {
    // Name
    document.getElementById('place-name').textContent = data.displayName?.text || 'Name not available';

    // Rating
    const ratingElement = document.getElementById('place-rating');
    if (data.rating) {
        ratingElement.textContent = data.rating;
        ratingElement.parentElement.style.display = 'flex';
    } else {
        ratingElement.parentElement.style.display = 'none';
    }

    const ratingCountElement = document.getElementById('place-rating-count');
    if (data.userRatingCount) {
        ratingCountElement.textContent = `(${data.userRatingCount} reviews)`;
        ratingCountElement.style.display = 'inline';
    } else {
        ratingCountElement.style.display = 'none';
    }

    // Open Status
    const openStatusElement = document.getElementById('place-open-status');
    if (data.currentOpeningHours?.openNow !== undefined) {
        openStatusElement.textContent = data.currentOpeningHours.openNow ? 'Open' : 'Closed';
        openStatusElement.classList.toggle('bg-green-100', data.currentOpeningHours.openNow);
        openStatusElement.classList.toggle('text-green-800', data.currentOpeningHours.openNow);
        openStatusElement.classList.toggle('dark:bg-green-900', data.currentOpeningHours.openNow);
        openStatusElement.classList.toggle('dark:text-green-300', data.currentOpeningHours.openNow);
        openStatusElement.classList.toggle('bg-red-100', !data.currentOpeningHours.openNow);
        openStatusElement.classList.toggle('text-red-800', !data.currentOpeningHours.openNow);
        openStatusElement.classList.toggle('dark:bg-red-900', !data.currentOpeningHours.openNow);
        openStatusElement.classList.toggle('dark:text-red-300', !data.currentOpeningHours.openNow);
        openStatusElement.style.display = 'inline-flex';
    } else {
        openStatusElement.style.display = 'none';
    }

    // Address
    document.getElementById('place-address').textContent = data.formattedAddress || '';
    document.getElementById('place-full-address').textContent = data.formattedAddress || 'Address not available';

    // Phone Number
    const phoneNumberContainer = document.getElementById('phone-number-container');
    const phoneNumberElement = document.getElementById('place-phone-number');
    const callButton = document.getElementById('call-button');

    if (data.internationalPhoneNumber) {
        const telUri = `tel:${data.internationalPhoneNumber.replace(/\s/g, '')}`;
        phoneNumberElement.textContent = data.internationalPhoneNumber;
        phoneNumberElement.href = telUri;
        phoneNumberContainer.style.display = 'flex';
        
        callButton.href = telUri;
        callButton.style.display = 'flex';
    } else {
        phoneNumberContainer.style.display = 'none';
        callButton.style.display = 'none';
    }

    // Google Maps Link
    const directionsButton = document.getElementById('directions-button');
    const getDirectionsMain = document.getElementById('get-directions-main');
    if (data.googleMapsUri) {
        directionsButton.href = data.googleMapsUri;
        getDirectionsMain.href = data.googleMapsUri;
        directionsButton.style.display = 'flex';
        getDirectionsMain.style.display = 'flex';
    } else {
        directionsButton.style.display = 'none';
        getDirectionsMain.style.display = 'none';
    }

    // Photos Carousel
    const carouselContainer = document.getElementById('photos-carousel');
    carouselContainer.innerHTML = '';
    if (data.photos && data.photos.length > 0) {
        const photo = data.photos[0];
        const img = document.createElement('img');
        img.src = `https://places.googleapis.com/v1/${photo.name}/media?maxHeightPx=400&key=AIzaSyBaZeS-EruwVhK5IF8Nr-QTgAiUziFXFMQ`;
        img.alt = `Photo by ${photo.authorAttributions?.[0]?.displayName || 'anonymous'}`;
        img.className = 'w-full h-full object-cover';
        carouselContainer.appendChild(img);
    } else {
        get_image_url(data.displayName?.text, data.formattedAddress).then(imageData => {
            const img = document.createElement('img');
            if (imageData.results && imageData.results.length > 0) {
                const targetRatio = 16 / 9;
                let bestImage = imageData.results[0];
                let minDiff = Infinity;

                imageData.results.forEach(result => {
                    if (result.thumbnail && result.thumbnail.width && result.thumbnail.height) {
                        const ratio = result.thumbnail.width / result.thumbnail.height;
                        const diff = Math.abs(ratio - targetRatio);
                        if (diff < minDiff) {
                            minDiff = diff;
                            bestImage = result;
                        }
                    }
                });
                img.src = bestImage.thumbnail.src;
                img.alt = bestImage.title;
            } else {
                img.src = 'https://images.unsplash.com/photo-1566073771259-6a8506099945?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80';
                img.alt = 'Default place image';
            }
            img.className = 'w-full h-full object-cover';
            carouselContainer.appendChild(img);
        });
    }

    // Business Hours
    const hoursList = document.getElementById('hours-list');
    hoursList.innerHTML = '';
    if (data.currentOpeningHours?.weekdayDescriptions) {
        data.currentOpeningHours.weekdayDescriptions.forEach(desc => {
            const [day, ...time] = desc.split(': ');
            const hourItem = document.createElement('div');
            hourItem.className = 'flex justify-between';
            hourItem.innerHTML = `
                <span class="text-gray-600 dark:text-gray-400">${day}</span>
                <span class="text-gray-900 dark:text-white">${time.join(': ')}</span>
            `;
            hoursList.appendChild(hourItem);
        });
        document.getElementById('business-hours').style.display = 'block';
    } else {
        document.getElementById('business-hours').style.display = 'none';
    }

    // Hide reviews section as there's no data for it
    document.getElementById('reviews-section').style.display = 'none';
}

// Add event listener for DOM ready
document.addEventListener('DOMContentLoaded', () => {
    // The drawer is now initialized and shown via messages from the parent window
});

async function get_image_url(name, address) {
    const query = `Image ${name} ${address}`;
    const params = new URLSearchParams({
        q: query
    });
    const response = await fetch(`https://timefactories.com/cgi-bin/guh/places.cgi/image?${params}`, {
        method: 'get',
        headers: {
            'Accept': 'application/json'
        },
    });
    const body = await response.json();
    return body;
}