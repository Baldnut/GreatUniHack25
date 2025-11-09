from flask import *
from time_distance_calc import travel_time_distance
app = Flask(__name__)

@app.route("/time-distance", methods={"GET"})
def handle_time_distance_between_cities():

    origin = request.args.get("o")

    dest = request.args.get("d")

    result = travel_time_distance(origin, dest)

    if result == None:
        return None
    
    output = {
        'time' : result[0],
        'distance' : result[1]
    }
    
    return output
