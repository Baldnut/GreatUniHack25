import requests
import googlemaps
from google import genai
from datetime import datetime, timezone, timedelta

current_UTC = datetime.now(timezone.utc)

api_key = 'AIzaSyBST-U6u64VTqVrcP0rYgw7TUXWEl1zjtk'
API_key_google = "AIzaSyCQ7V17qSJfdc30-6rgodCIVXW_CXb_R04"
gmap_client = googlemaps.Client(key = API_key_google)
client = genai.Client(api_key = api_key)

def station_coords(city, country):
    prompt = "what are the coordinates of the main rail station in City: '" + city + "', Country: '" + country + "', give me only the coordinate, formatted as 'latitude, longitude', and no other information. If the city or the country is not provided, or if the input is invalid, return an empty string"
    response = client.models.generate_content(
        model='gemini-2.5-flash',
        contents=prompt
    )
    try:
        coords = response.text.split(',')
        lat = float(coords[0])
        long = float(coords[1])
    except:
        return(None)
    timezone_result = gmap_client.timezone(
        location=(lat, long),
        timestamp=1762641321
    )
    offset = timezone_result.get('dstOffset') + timezone_result.get('rawOffset') / 3600

    return(lat, long, offset)

url = "https://routes.googleapis.com/distanceMatrix/v2:computeRouteMatrix"
headers = {'Content-Type':'application/json',
           'X-Goog-Api-Key':API_key_google,
           'X-Goog-FieldMask':",".join(['duration', 'distanceMeters', 'condition'])}

def travel_time_distance(origin, dest):
    if origin == None or dest == None:
        return None
    
    days_to_add = 7 - current_UTC.weekday()

    if days_to_add == 0:
        days_to_add = 7 # gives us next monday, no matter what day of the week it is
    
    upcoming_monday = current_UTC + timedelta(days = days_to_add)
    date_part = upcoming_monday.strftime('%Y-%m-%d')
    departure_time = f'{date_part}{f'T{str(int(12+origin[2]))}:00:00Z'}' # gives us the local timezone for midday next monday
    print(departure_time)
    test = {
    "origins": [
        {
        "waypoint": {
            "location": {
            "latLng": {
                "latitude": origin[0],
                "longitude": origin[1]
            }
            }
        }
        }
    ],
    "destinations": [
        {
        "waypoint": {
            "location": {
            "latLng": {
                "latitude": dest[0],
                "longitude": dest[1]
            }
            }
        }
        }
    ],
    "travelMode": "TRANSIT",
    "departureTime": departure_time
    }

    response = requests.post(url, headers = headers, json = test)

    print(response.json())
    if response.json()[0].get('condition') == 'ROUTE_NOT_FOUND':
        return None

    return(int(response.json()[0].get('duration')[:-1]), response.json()[0].get('distanceMeters'))

def time_distance_between_cities(origin, dest):
    return travel_time_distance(station_coords(origin), station_coords(dest))