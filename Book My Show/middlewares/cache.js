const Redis = require("ioredis");
const redisClient = new Redis()

async function cacheData(req, res, next) {
    const key = req.params.key;
    let results;
    try {
      const cacheResults = await redisClient.get(key);
      if (cacheResults) {
        console.log('Cache Hit')
        results = JSON.parse(cacheResults);
        res.send({
          fromCache: true,
          data: results,
        });
      } else {
        console.log('Cache Miss')
        next();
      }
    } catch (error) {
      console.error(error);
      res.status(404).send({ message: 'error fetching data from redis'});
    }
  }

  async function formatCacheKey(req, res, next){
    debugger
    const id = req.params.theatreId;
    const date = `${req.query.date}`;
    const cacheKey =  `${id}/${date}` // theatreId/date
    req.params.key = cacheKey;
    next()
}

  module.exports = { cacheData, formatCacheKey }