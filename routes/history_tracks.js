var express = require('express');
var fs = require('fs');
var router = express.Router();

router.get('/*', function(req, res, next) {
  console.log(req.url);
  //res.render('index', { title: 'Express' });
  console.log("router history tracks");
  fs.readFile('history_tracks' + req.url, 'utf-8', function(err, data) {
    if (err) {
      console.error(err);
    } else {
      res.send(data);
    }   
  }); 
});

module.exports = router;
