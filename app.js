const express = require("express");
const { open } = require("sqlite");
const sqlite3 = require("sqlite3");
const path = require("path");

const app = express();
app.use(express.json());

const databasePath = path.join(__dirname, "moviesData.db");
let db = null;
const initializeServerAndDatabase = async () => {
  try {
    db = await open({
      filename: databasePath,
      driver: sqlite3.Database,
    });
    app.listen(3000, () => {
      console.log(`Server is running on http://localhost:3000/`);
    });
  } catch (e) {
    console.log(`DB Error: ${e.message}`);
    process.exit(1);
  }
};
initializeServerAndDatabase();

const convertMovieTableDbToRequired = (list) => {
  return {
    movieId: list.movie_id,
    directorId: list.director_id,
    movieName: list.movie_name,
    leadActor: list.lead_actor,
  };
};

const convertDirectorTableDbToRequired = (list) => {
  return {
    directorId: list.director_id,
    directorName: list.director_name,
  };
};

//API-1 (get the details of movie)
app.get("/movies/", async (request, response) => {
  const getMovieNamesQuery = `
    SELECT 
        movie_name 
    FROM 
        movie;`;
  const movieNames = await db.all(getMovieNamesQuery);
  response.send(
    movieNames.map((eachObj) => convertMovieTableDbToRequired(eachObj))
  );
});

//API-2 (create a movie)
app.post("/movies/", async (request, response) => {
  const movieDetails = request.body;
  const { directorId, movieName, leadActor } = movieDetails;
  const postMovieQuery = `
  INSERT INTO 
    movie (director_id,movie_name,lead_actor)
  VALUES(${directorId}, '${movieName}', '${leadActor}');
    `;
  const newMovie = await db.run(postMovieQuery);
  response.send("Movie Successfully Added");
});

//API-3 (get a particular movie)
app.get("/movies/:movieId/", async (request, response) => {
  const { movieId } = request.params;
  const getMovieQuery = `
    SELECT 
      *
    FROM 
      movie 
    WHERE 
      movie_id = ${movieId};`;
  const movie = await db.get(getMovieQuery);
  response.send(convertMovieTableDbToRequired(movie));
});

//API-4 ()
app.put("/movies/:movieId/", async (request, response) => {
  const { movieId } = request.params;
  const movieDetails = request.body;
  const { directorId, movieName, leadActor } = movieDetails;
  const updateQuery = `
  UPDATE 
    movie 
  SET 
    director_id = ${directorId},
    movie_name = '${movieName}',
    lead_actor = '${leadActor}'
  WHERE 
    movie_id = ${movieId};`;
  const updatedMovie = await db.run(updateQuery);
  response.send("Movie Details Updated");
});

//API-5
app.delete("/movies/:movieId/", async (request, response) => {
  const { movieId } = request.params;
  const deleteMovieQuery = `
    DELETE FROM movie
    WHERE 
        movie_id = ${movieId};`;
  await db.run(deleteMovieQuery);
  response.send("Movie Removed");
});

//API-6
app.get("/directors/", async (request, response) => {
  const getDirectors = `
    SELECT * 
    FROM director`;
  const allDirectors = await db.all(getDirectors);
  response.send(
    allDirectors.map((eachObj) => convertDirectorTableDbToRequired(eachObj))
  );
});

//API-7
app.get("/directors/:directorId/movies/", async (request, response) => {
  const { directorId } = request.params;
  const getMovieNameFromDirector = `
    SELECT 
        movie_name 
    FROM 
        movie 
    WHERE 
        director_id = ${directorId};`;
  const movieName = await db.all(getMovieNameFromDirector);
  response.send(
    movieName.map((eachMovie) => ({ movieName: eachMovie.movie_name }))
  );
});

module.exports = app;
