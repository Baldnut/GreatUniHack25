#!/usr/bin/python3

# Initialisation on web server

import cgitb
cgitb.enable()
import sys
sys.path.append('/mnt/web305/c1/31/53991431/htdocs/.local/lib/python3.11/site-packages')

# SEARCH APP
from flask import Flask, request, jsonify
import requests
import json
import re
from flask_cors import CORS
from google import genai
from google.genai import types

app = Flask(__name__)
CORS(app)

API_KEY = "AIzaSyDDdy36pvp3zh6kbXNVdr_Z8TmCKu06xSc"
GEN_API_KEY = "AIzaSyA6MYmG27VkeIEpIBuaJ-TIIJrQV_E9Cp0"


gemini_system_instructions = """
     You are a helpful and expert geographer. Your task is to list the most 
     significant and well known towns/cities and near a certain radius (in meters) of a poi.
     
     You can assume your input will have the following format:
         "poi: "poi_name", search radius: "search_radius"m"
     where search radius in measured in meters.
     for example:
        "poi: York, search radius: 10000"
        

     Please adhere to these rules:
     1.  You should only return towns/cities within the radius provided from the given poi
     2.  Do NOT include small suburbs, villages, or administrative parishes that are
         part of the starting city itself. For example, if the city is York, do not list Fulford or Bishopthorpe
     3.  Return the answer only as a single, valid JSON object. Do not include any
         other text, explanation, or markdown formatting before or after the JSON.

     The JSON object should have a single key "places" which is a list of objects.
     Each object in the list should have the following keys:
     - "displayName": The name of the city or town.
     - "lat": The latitude of the city or town.
     - "lon": The longitude of the city or town.
     
     Here is an example for "Cambridge, UK":
     {
       "places": [
         {
           "displayName": "Ely",
           "lat": 52.3989,
           "lon": 0.2625
         },
         {
           "displayName": "Newmarket",
           "lat": 52.2440,
           "lon": 0.4043
         }
       ]
     }
"""


default_search_fields = ",".join([
  "displayName",
  "id",
  "location"
])
default_nearby_fields = ",".join([
  "displayName",
  "id",
  "location"
])
default_places_fields = ",".join([
  "id",
  "displayName",
  "formattedAddress",
  "location",
  "rating",
  "userRatingCount",
  "types",
  "googleMapsUri",
  "currentOpeningHours.openNow",
  "currentOpeningHours.weekdayDescriptions",
  "internationalPhoneNumber"
])



@app.route("/l_nearby", methods=["GET"])
def handle_large_nearby_search():
    poi = request.args.get("poi")
    search_radius = request.args.get("radius")
    user_prompt = f"poi: {poi}, search radius: {search_radius}m"

    client = genai.Client(api_key=GEN_API_KEY)
    
    # Combine system instructions with user prompt
    full_prompt = f"{gemini_system_instructions}\n\n{user_prompt}"
    
    response = client.models.generate_content(
        model='gemini-2.5-flash-lite',
        contents=[
            {
                "role": "user",
                "parts": [{"text": full_prompt}]
            }
        ]
    )

    # Clean the response - remove markdown code blocks
    response_text = response.text.strip()
    
    # Remove ```json and ``` markers
    response_text = re.sub(r'^```json\s*', '', response_text)
    response_text = re.sub(r'^```\s*', '', response_text)
    response_text = re.sub(r'\s*```$', '', response_text)
    response_text = response_text.strip()
    
    # Parse and return as JSON
    try:
        json_data = json.loads(response_text)
        return jsonify(json_data)
    except json.JSONDecodeError:
        return jsonify({"error": "Failed to parse JSON", "raw": response_text}), 500



def text_search(key: str, query: str, fields: list) -> dict:
    """Searches for places based on a text query using the Places API

    Args:
        key (str): Google Maps Platform API key
        query (str): The text string to search for
        fields (list): A list of data fields to return for each place
                       Do not include the "places." prefix (i.e. ["displayName", "id"])

    Returns:
        dict: The JSON response from the API as a dictionary, containing a list
              of found places. Returns an empty dictionary if the request fails
    """
    url = "https://places.googleapis.com/v1/places:searchText"

    fields = [f"places.{field}" for field in fields]

    complete_query = {
        "textQuery": query
    }

    headers = {
        "Content-Type": "application/json",
        "X-Goog-Api-Key": key,
        "X-Goog-FieldMask": ",".join(fields)
    }

    response = requests.post(url, json=complete_query, headers=headers)
    if response.status_code == 200:
        print("Response received successfully.")
        return response.json()

    print(f"Error: {response.status_code}")
    return {}

def nearby_search(key: str,
                  latitude: float,
                  longitude: float,
                  search_radius: int,
                  fields: list,
                  num_results: int,
                  search_types = None) -> dict:
    """Searches for places within a circular area using the Places API

    Args:
        key (str): Google Maps Platform API key
        latitude (float): The latitude of the center of the search circle
        longitude (float): The longitude of the center of the search circle
        search_radius (int): The radius of the search circle in meters
        fields (list): A list of data fields to return for each place
                       Do not include the "places." prefix (e.g., ["displayName", "rating"])
        num_results (int): The maximum number of results to return (up to 20)
        search_types (list, optional): A list of official Place Types to filter by
                                       (i.e. ["cafe", "restaurant"]). Defaults to None,
                                       which returns all place types

    Returns:
        dict: The JSON response from the API as a dictionary, containing a list
              of found places. Returns an empty dictionary if the request fails
    """

    if search_types is None:
        search_types = []

    url = "https://places.googleapis.com/v1/places:searchNearby"

    fields = [f"places.{field}" for field in fields]

    complete_query = {

        "includedTypes": search_types,
        "maxResultCount": num_results,
        "locationRestriction": {
            "circle": {
                "center": {
                    "latitude": latitude,
                    "longitude": longitude
                },
                "radius": search_radius
            }
        }
    }

    headers = {
        "Content-Type": "application/json",
        "X-Goog-Api-Key": key,
        "X-Goog-FieldMask": ",".join(fields)
    }

    response = requests.post(url, json=complete_query, headers=headers)
    if response.status_code == 200:
        return response.json()

    print(f"Error: {response.status_code}")
    return {}

def place_details(key: str, id: str, fields: list) -> dict:
    """Gets detailed information for a single place using its ID

    Args:
        key (str): Google Maps Platform API key
        id (str): The unique identifier for the place
        fields (list): A list of data fields to return for the place
                       Do not include the "places." prefix (i.e. ["displayName", "rating"])

    Returns:
        dict: The JSON response from the API as a dictionary, containing the
              fields for the specified place. Returns an empty
              dictionary if the request fails
    """
    url = f"https://places.googleapis.com/v1/places/{id}"

    headers = {
        "Content-Type": "application/json",
        "X-Goog-Api-Key": key,
        "X-Goog-FieldMask": ",".join(fields)
    }

    response = requests.get(url, headers=headers)
    if response.status_code == 200:
        return response.json()

    print(f"Error: {response.status_code}")
    return {}



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


@app.route('/image')
def image():
    query = request.args.get('q')
    params = {
        "q": f"Image {query}",
        "country": "ALL",
        "count": 5
    }
    headers = {
        "Accept": "application/json",
        "x-subscription-token": "BSAZQUe6SEkMN2ySPMqLrjMxTOvcTMS"
    }
    r = requests.get("https://api.search.brave.com/res/v1/images/search", headers=headers, params=params)
    return jsonify(r.json())


@app.route('/', methods=['GET'])
def status():
    return json.dumps({"status": "running", "message": "Server is up and running"})


if __name__ == "__main__":
    app.run()
