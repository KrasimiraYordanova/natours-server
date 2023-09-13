const tourController = require('express').Router();

tourController.get('/', (req, res) => {
    console.log(req.user);
    res.json([]);
})

tourController.post('/', (req, res) => {
    console.log(req.body);
    res.status(200).json(req.body);
    // res.end(); 
})

module.exports = tourController;