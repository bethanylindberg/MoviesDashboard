# MoviesDashboard

This project was based on creating a visualization of actors activity/credits. 
 
# Overview of the Data
To limit the scope to be managable within a two week time frame, we chose to use the top 100 list for 
actors and actresses.
Actors - https://www.imdb.com/list/ls022928819/
Actresses - https://www.imdb.com/list/ls022928836/

Actor names and nameids were scraped using Beautifulsoup, the actor id's were used to find 
the actor's page url = f"https://www.imdb.com/{nameid}/", where the movieid and credit type were scraped.

The movieid was used to scrape the movie information from the [OMDB API](http://www.omdbapi.com/). 

All data from the web scraping was converted to a panada dataframes then saved into CSV files.

## Limitations of the Data

The dates available for tv show appearances were the original release dates of the tv shows, and not the date of appearance. This means that anyone who appears on the Today show has a credit from 1952 even if they were not born yet.

Additionallly, some credits needed to be dropped because no matching data was found on the API.

# Methods

The data is stored using SQLite, queried using SQLAlchemy, coverted into JSON for API endpoints, written into a deployable app using flask then rendered with Heroku. Jupyter notebooks, pandas and D3.js is used to examine and visualize the data.

[Heroku app is located here](https://movies-dashboard.herokuapp.com)