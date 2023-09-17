module.exports = () => (req, res, next) => {
    req.query.limit = '3'
    req.query.sort = '-ratingAverage,price',
    req.query.fields = 'name,price,duration,difficulty,ratingAverage'
    next();
}