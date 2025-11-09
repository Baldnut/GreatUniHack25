const GEMINI_API_KEY = 'AIzaSyA6MYmG27VkeIEpIBuaJ-TIIJrQV_E9Cp0';
const ELEVENLABS_API_KEY = "sk_2fa75eedf7674225add2b05aae2d7996de9c461b0a1cc51e"; // replace with your API key
const ELEVENLABS_VOICE_ID = "JBFqnCBsd6RMkjVDRZzb"; // you can get this from ElevenLabs dashboard

let isSpeaking = false;
let currentAudio = null;

async function speakPlaceSummary() {
    if (isSpeaking) {
        if (currentAudio) {
            currentAudio.pause();
        }
        isSpeaking = false;
        document.getElementById('speak-bars').classList.remove('active');
        return;
    }

    const placeName = document.getElementById('place-name').textContent;
    const placeAddress = document.getElementById('place-address').textContent;
    const placeRating = document.getElementById('place-rating').textContent;
    const placeOpenStatus = document.getElementById('place-open-status').textContent;

    const prompt = `Generate a very short, one-sentence summary for a place with the following details:
Name: ${placeName}
Address: ${placeAddress}
Rating: ${placeRating} stars
Status: ${placeOpenStatus}

Respond with only the summary sentence.`;

    document.getElementById('speak-bars').classList.add('active');
    isSpeaking = true;

    try {
        // Generate summary with Gemini
        const geminiResponse = await fetch(`https://generativelanguage.googleapis.com/v1/models/gemini-2.5-flash-lite:generateContent?key=${GEMINI_API_KEY}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                contents: [{
                    parts: [{
                        text: prompt
                    }]
                }]
            })
        });

        const geminiData = await geminiResponse.json();
        if (!geminiData.candidates || !geminiData.candidates[0].content.parts[0].text) {
            throw new Error('Failed to generate summary.');
        }
        const summaryText = geminiData.candidates[0].content.parts[0].text.trim();

        // Generate audio with ElevenLabs
        const elevenLabsResponse = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${ELEVENLABS_VOICE_ID}`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "xi-api-key": ELEVENLABS_API_KEY
            },
            body: JSON.stringify({
                text: summaryText,
                voice_settings: {
                    stability: 0.5,
                    similarity_boost: 0.5
                }
            })
        });

        if (!elevenLabsResponse.ok) throw new Error("TTS request failed");

        const blob = await elevenLabsResponse.blob();
        const audioUrl = URL.createObjectURL(blob);

        currentAudio = new Audio(audioUrl);
        currentAudio.play();

        currentAudio.onended = () => {
            isSpeaking = false;
            document.getElementById('speak-bars').classList.remove('active');
            currentAudio = null;
        };

    } catch (err) {
        console.error(err);
        isSpeaking = false;
        document.getElementById('speak-bars').classList.remove('active');
    }
}

document.getElementById("speak-btn").addEventListener("click", speakPlaceSummary);
