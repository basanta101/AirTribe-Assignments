const express = require('express');
const bodyParser = require('body-parser');
const { run, client } = require('./config/db')
const { cacheData, formatCacheKey } = require('./middlewares/cache')
const Redis = require("ioredis");
const redisClient = new Redis()

const app = express();

const ObjectId = require('mongodb').ObjectId;



const db = client.db("book_my_show");
const theatres = db.collection("cinema_hall");
const movies = db.collection("movies");
const commentsAndRatings = db.collection('comments_and_ratings')

app.use(bodyParser.json());


app.post('/comments-and-review', (req, res) => {

    const { name = 'movie', comment = '', rating = '' } = req.body;
    const MOVIE = { name, rating, comment }
    try {
        commentsAndRatings.insertOne(MOVIE)
        redisClient.set(`${name}`, JSON.stringify(MOVIE))
        res.status(201).send({ movie: MOVIE })

    } catch (err) {
        res.status(500).send({ message: 'Error while adding Movie to DB' })
    }
})

app.get('/comments-and-review',
    // formatCacheKey, cacheData,
    async (req, res) => {
        debugger
        const { name } = req.query;
        // here security check to be done
        try {
            const reviews = await commentsAndRatings.find({ name: { $in: [name] } }).toArray((error, result) => {
                if (error) {
                    throw error;
                };
                return response.json(result);
            })

            res.send({ reviews });
        } catch (err) {
            res.status(500).send({ message: 'Error while fetching Reviews' })
        }

    })

app.post('/movie', (req, res) => {

    const { movie_name = 'movie', genre = 'action', cast = '', crew = '', movie_plot = '' } = req.body;
    const MOVIE = { name: movie_name, genre, cast, crew, moviePlot: movie_plot }
    try {
        movies.insertOne(MOVIE)
        // redisClient.set(`${movie_name}`, JSON.stringify(MOVIE))
        res.status(201).send({ movie: MOVIE })

    } catch (err) {
        res.status(500).send({ message: 'Error while adding Movie to DB' })
    }
})

app.get('/movie',
    // formatCacheKey, cacheData,
    async (req, res) => {
        debugger
        const { name } = req.query;
        // here security check to be done
        try {
            const movie = await movies.find({ name }).toArray()
            res.status(200).send({ movie });
        } catch (err) {
            res.status(500).send({ message: 'Error while fetching Movie details from db DB' })
        }

    })

// API to get list of all the theatres
app.get('/theatres', async (req, res) => {
    try {
        const listOfTheatres = await theatres.find().toArray((error, result) => {
            if (error) {
                throw error;
            };
            return response.json(result);
        })
        res.send({ theatres: listOfTheatres });
    } catch (error) {
        console.log('error:', error)
        res.status(500).send({ msg: 'error hai re baba' });
    }
});

//API to fetch the data from theatres collection, with the date variable
app.get('/theatres/:theatreId',
    formatCacheKey,
    cacheData,
    async (req, res) => {
        const id = req.params.theatreId;
        const o_id = new ObjectId(id);
        const date = `${req.query.date}`;
        try {
            const [theatreData] = await theatres.find({
                _id: o_id,
            }).toArray((error, result) => {
                if (error) {
                    throw error;
                };
                return response.json(result);
            })
            if (!theatreData) {
                return res.status(404).json({ message: 'Theatre not found.' });
            }

            const moviesForDate = theatreData[date];
            redisClient.set(`${req.params.key}`, JSON.stringify(moviesForDate))
            res.json({ movies: moviesForDate });
        } catch (error) {
            console.error('Error:', error);
            res.status(500).json({ message: 'Internal Server Error' });
        }
        // TODO: check if this API query can be optimized even further
    });

// NOTE: the below implementation seems to be very slower, because  findOne return the exact document and find returns the cursor
// Read more here: https://stackoverflow.com/questions/33156703/whats-faster-find-limit1-or-findone-in-mongodb-mongoose#:~:text=find()%20returns%20a%20cursor,you%20iterate%20through%20the%20cursor.

// app.get('/theatres/:theatreId', async (req, res) => {
//     // const theatreId = req.params.theatreId;
//     var id = req.params.theatreId;
//     var o_id = new ObjectId(id);
//     const date = `${req.query.date}`;
//     try {
//         const theatreData = await theatres.findOne({
//             _id: o_id,
//          })
//         if (!theatreData) {
//             return res.status(404).json({ message: 'Theatre not found.' });
//         }

//         const moviesForDate = theatreData[date];
//         res.json({ movies: moviesForDate });
//     } catch (error) {
//         console.error('Error:', error);
//         res.status(500).json({ message: 'Internal Server Error' });
//     }
//     //CHAT GPT:  write a query to fetch the data from theatres collection, with the date variable
// });

// API to give all the movies in that theatre on that given date

app.listen(3000, () => {
    console.log('listening on port 3000')
});

run().catch(console.dir);


//TODO:use the cacheData to implement caching in redis

// https://dev.to/lennythedev/rest-api-with-mongodb-atlas-cloud-node-and-express-in-10-minutes-2ii1
