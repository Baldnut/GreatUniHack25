from src.places_api import *
from dotenv import load_dotenv
import os

def main():
    load_dotenv()
    api_key = os.getenv("API_KEY")

    data = text_search(api_key, "York",
                       fields=["displayName", "id", "location"])
    if len(data) > 1:
        print("Too Many elements returned")

    place = data["places"][0]
    print(f"Name: {place.get("displayName", {}).get("text", "N/A")}")

    id = place.get("id", "N/A")
    print(f" - ID: {id}")

    location = place.get("location", "N/A")
    latitude = location.get("latitude", "N/A")
    longitude = location.get("longitude", "N/A")
    print(f" - Location: {location}")
    print(f"    - latitude: {latitude}")
    print(f"    - longitude: {longitude}")

    place_detail = place_details(api_key, id,
                                 fields=["displayName", "formattedAddress",
                                         "internationalPhoneNumber", "rating"])
    print("Details for place with ID:", place_detail)
    print(
        f"Name: {place_detail.get("displayName", {}).get("text", "N/A")}")
    print(f"  Address: {place_detail.get("formattedAddress", "N/A")}")
    print(
        f"  Phone: {place_detail.get("internationalPhoneNumber", "N/A")}")
    print(f"  Rating: {place_detail.get("rating", "N/A")}")

    places = nearby_search(api_key,
                           latitude,
                           longitude,
                           search_radius=2000,
                           fields=["displayName", "rating"],
                           num_results=5,
                           search_types=["locality"])
    for place in places["places"]:
        print(f"Name: {place.get("displayName", {}).get("text", "N/A")}")
        print(f" - Rating: {place.get("rating", "N/A")}\n")


if __name__ == "__main__":
    main()