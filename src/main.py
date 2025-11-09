from dotenv import load_dotenv
import os
from flask import Flask, request, jsonify
from places_api.places_api import *
import yaml
from google import genai
from google.genai import types

app = Flask(__name__)

load_dotenv()
API_KEY = os.getenv("API_KEY")
GEN_API_KEY = os.getenv("GEN_API_KEY")

if not API_KEY or not GEN_API_KEY:
    exit("An API_KEY was not found in .env")

with open(f"{os.path.dirname(os.getcwd())}/config.yaml", "r") as f:
    config = yaml.safe_load(f)

default_search_fields = ",".join(config["default_search_fields"])
default_nearby_fields = ",".join(config["default_nearby_fields"])
default_places_fields = ",".join(config["default_places_fields"])
gemini_system_instructions = config["gemini_system_instructions"]

genai.configure(api_key=GEN_API_KEY)
model = genai.GenerativeModel('gemini-pro')
chat = model.start_chat(history=[
    {'role': 'user', 'parts': [gemini_system_instructions]},
    {'role': 'model', 'parts': ["Understood. I am ready to answer any questions"]}
])

@app.route("/l_nearby", methods=["GET"])
def handle_large_nearby_search():

    poi = request.args.get("poi")

    search_radius = request.args.get("radius")

    prompt = f"poi: {poi}, search radius: {search_radius}"

    response = chat.send_message(prompt)

    return jsonify(json.loads(response.text))

@app.route("/search", methods=["GET"])
def handle_text_search():

    query = request.args.get("q")

    fields = request.args.get("fields", default_search_fields).split(",")

    result = text_search(API_KEY, query, fields=fields)
    return jsonify(result)


@app.route("/nearby", methods=["GET"])
def handle_nearby_search():

    lat = float(request.args.get("lat"))
    lon = float(request.args.get("lon"))
    radius = int(request.args.get("radius"))

    fields = request.args.get("fields", default_nearby_fields).split(",")
    search_types = request.args.get("types")
    search_types = search_types.split(",") if search_types else None
    num_results = int(request.args.get("limit"))

    result = nearby_search(
        key=API_KEY,
        latitude=lat,
        longitude=lon,
        search_radius=radius,
        fields=fields,
        num_results=num_results,
        search_types=search_types
    )
    return jsonify(result)


@app.route("/details/<string:place_id>", methods=["GET"])
def handle_place_details(place_id):
    fields_str = request.args.get("fields", default_places_fields)
    fields = fields_str.split(",")

    result = place_details(API_KEY, place_id, fields=fields)
    return jsonify(result)


if __name__ == "__main__":
    app.run(debug=True)
    
    
# def main():
#     load_dotenv()
#     api_key = os.getenv("API_KEY")
#
#     data = text_search(api_key, "York",
#                        fields=["displayName", "id", "location"])
#     if len(data) > 1:
#         print("Too Many elements returned")
#
#     place = data["places"][0]
#     print(f"Name: {place.get("displayName", {}).get("text", "N/A")}")
#
#     id = place.get("id", "N/A")
#     print(f" - ID: {id}")
#
#     location = place.get("location", "N/A")
#     latitude = location.get("latitude", "N/A")
#     longitude = location.get("longitude", "N/A")
#     print(f" - Location: {location}")
#     print(f"    - latitude: {latitude}")
#     print(f"    - longitude: {longitude}")
#
#     place_detail = place_details(api_key, id,
#                                  fields=["displayName", "formattedAddress",
#                                          "internationalPhoneNumber", "rating"])
#     print("Details for place with ID:", place_detail)
#     print(
#         f"Name: {place_detail.get("displayName", {}).get("text", "N/A")}")
#     print(f"  Address: {place_detail.get("formattedAddress", "N/A")}")
#     print(
#         f"  Phone: {place_detail.get("internationalPhoneNumber", "N/A")}")
#     print(f"  Rating: {place_detail.get("rating", "N/A")}")
#
#     places = nearby_search(api_key,
#                            latitude,
#                            longitude,
#                            search_radius=2000,
#                            fields=["displayName", "rating"],
#                            num_results=5,
#                            search_types=["locality"])
#     for place in places["places"]:
#         print(f"Name: {place.get("displayName", {}).get("text", "N/A")}")
#         print(f" - Rating: {place.get("rating", "N/A")}\n")
#
#
# if __name__ == "__main__":
#     main()