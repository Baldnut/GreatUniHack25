async function handleSearch(event) {
    event.preventDefault();
    
    const search_input = document.getElementById('search_box').value;
    if (!search_input.trim()) return;

    document.getElementById('search_box_result').value = search_input;

    document.getElementById('homepage').style.display = 'none';
    document.getElementById('results').style.display = 'flex';

    try {
        const API_KEY = 'AIzaSyBST-U6u64VTqVrcP0rYgw7TUXWEl1zjtk';
        const response = await fetch(`https://generativelanguage.googleapis.com/v1/models/gemini-2.5-flash-lite:generateContent?key=${API_KEY}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                contents: [{
                    parts: [{
                        text: `Given the search query "${search_input}" for travel destinations, provide a JSON response with 5 relevant cities or countries. For each destination, include:
                        1. name: The city or country name
                        2. emoji: A single relevant emoji that represents this destination, but avoid national flags
                        3. rating: A rating from 1-5 based on how well it matches the query
                        
                        Respond ONLY with the JSON array, no additional text. Format:
                        [{"name": "...", "emoji": "...", "rating": X}, ...]`
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
        li.innerHTML = `
            <a href="#" style="border: 1px solid #eee;" class="flex items-center p-3 text-base font-semibold text-gray-900 rounded-lg hover:bg-gray-100 group hover:shadow dark:bg-gray-600 dark:hover:bg-gray-500 dark:text-white">
                <span style="font-size: 34px;">${dest.emoji}</span>
                <span class="flex-1 ms-3 whitespace-nowrap">${dest.name}</span>
                <span class="ms-3">${'⭐'.repeat(dest.rating)}</span>
            </a>
        `;
        resultsContainer.appendChild(li);
    });
    
    // Show results section
    document.getElementById('homepage').style.display = 'none';
    document.getElementById('results').style.display = 'flex';
}
