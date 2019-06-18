import numpy as np
import datetime as dt
from sqlalchemy.ext.automap import automap_base
from sqlalchemy.orm import Session
from sqlalchemy import create_engine, func
from flask import Flask, jsonify

#################################################
# Database Setup
#################################################
engine = create_engine("sqlite:///database/omdbdatabase.sqlite", pool_pre_ping=True)

# reflect an existing database into a new model
Base = automap_base()
# reflect the tables
Base.prepare(engine, reflect=True)

# Save references to each table
Actor = Base.classes.actor
Movies = Base.classes.movies
sel = [Actor.gender,Actor.rank,Movies.title,Actor.credit,Movies.plot,Movies.imdb_rating,Movies.box_office,\
        Movies.type,Movies.released,Movies.runtime,Movies.genre,Movies.rt_rating]

# Create our session (link) from Python to the DB
session = Session(engine)

#################################################
# Flask Setup
#################################################
app = Flask(__name__)
#################################################
# Flask Routes
#################################################

@app.route("/home")
def welcome():
    """Home Page."""
    return ("Home Page")

@app.route("/<selection>")
def actor(selection):
    """Return data from the db"""
    # Create our session (link) from Python to the DB
    session = Session(engine)
    selection = str(selection)
    data = session.query(Actor.gender,Actor.rank,Movies.title,Actor.credit,Movies.plot,Movies.imdb_rating,Movies.box_office,\
                        Movies.type,Movies.released,Movies.runtime,Movies.genre,Movies.rt_rating).\
                        filter(Movies.imdb_id == Actor.imdb_id).\
                        filter(Actor.name == selection).all()

    movies = []

    #Append data      
    actordict = {}
    actordictinner = {}

    for this in data:
        moviesdict = {}
        moviesdict["title"] = (this[2])
        moviesdict["released"] = (this[8])
        moviesdict["credit"] = (this[3])
        moviesdict["runtime"] = (this[9])
        moviesdict["genre(s)"] = (this[10])
        moviesdict["plot"] = (this[4])
        moviesdict["imdb_rating"] = (this[5])
        moviesdict["rt_rating"] = (this[11])
        moviesdict["box_office"] = (this[6])
        moviesdict["type"] = (this[7])
        movies.append(moviesdict)    
        
    actordict[selection] = actordictinner
    actordictinner["gender"] = data[0][0]
    actordictinner["rank"] = data[0][1]
    actordictinner["movies"] = movies
 
    return jsonify(actordict)

if __name__ == '__main__':
    app.run(debug=True)