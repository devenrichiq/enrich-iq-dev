import NodeCache from "node-cache";


const cache = new NodeCache({
	stdTTL: 10, 
	checkperiod: 5, 
})
const cacheMiddleware = (req,res, next) => {
    const key = req.originalUrl || req.url
    console.log(key)
    const cacheResponse = cache.get(key);
    if(cacheResponse) {
        console.log(cacheResponse)
        return res.send(cacheResponse)
    }
    res.saveToCache = (data) => {
        cache.set(key, data)
    }
    next();
}


export default cacheMiddleware