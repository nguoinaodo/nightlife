'use strict';

var Places = require('../models/places.js');
var Users = require('../models/users.js');
var https = require('https');
var bl = require('bl');

function Controller() {
    this.search = function(req, res) {
        var textSearch = req.params.textSearch.split(' ').join('+');
        var apiUrl = 'https://maps.googleapis.com/maps/api/place/textsearch/json?query=' + textSearch +'&type=bar&key=' + process.env.KEY;
        var auth = req.isAuthenticated();
        
        console.log('hi');
        https.get(apiUrl, function(response) {
            response.pipe(bl(function(err, buffer) {
                if (err) throw err;
                
                var data = JSON.parse(buffer);
                console.log(data);
                var results = [];
                
                data.results.forEach(function(place) {
                    results.push({
                        placeId: place.place_id,
                        address: place.formatted_address,
                        name: place.name,
                        openNow: place.opening_hours !== undefined? place.opening_hours.open_now: false,
                        photoReference: place.photos !== undefined? place.photos[0].photo_reference: ''
                    }); 
                });
                
                if (auth) {
                    console.log('lastSearch');
                    Users
                        .findOne({'github.id': req.user.github.id}, function(err, doc) {
                            if (err) throw err;
                            
                            doc.lastSearch = results;
                            /*
                            results.forEach(function(item) {
                                doc.lastSearch.push(item); 
                            });
                            */
                            doc.save(function(err) {
                                if (err) throw err;
                                
                                console.log('save');
                                res.json(results);
                            });
                        });
                } else {
                    console.log('nothing');
                    res.json(results);
                }
            }));
        });
    };
    
    this.getGoing = function(req, res) {
        var placeId = req.params.placeId;
        
        Places
            .findOne({placeId: placeId}, function(err, doc) {
                if (err) throw err;
                
                var auth = req.isAuthenticated();
                
                if (!auth) {
                    if (doc)
                        res.json({
                            count: doc.userIds.length
                        });
                    else 
                        res.json({
                            count: 0
                        });    
                } else {
                    var userId = req.user.github.id;
                    
                    if (doc)
                        res.json({
                            count: doc.userIds.length,
                            going: doc.userIds.indexOf(userId) === -1? false: true
                        });
                    else 
                        res.json({
                            count: 0,
                            going: false
                        });
                }
                    
                
            });
    };
    
    this.go = function(req, res) {
        var placeId = req.params.placeId;
        
        Places
            .findOne({placeId: placeId}, function(err, doc) {
                if (err) throw err;
                
                if (doc) {
                    doc.userIds.push(req.user.github.id);
                    doc.save(function(err, result) {
                        if (err) throw err;
                        
                        res.json({
                            count: result.userIds.length,
                            going: true
                        });
                    });
                } else {
                    var newDoc = new Places();
                    
                    newDoc.placeId = placeId;
                    newDoc.userIds = [];
                    newDoc.userIds.push(req.user.github.id);
                    newDoc.save(function(err, result) {
                        if (err) throw err;
                        
                        res.json({
                            count: 1,
                            going: true
                        });
                    });
                }
            });
    };
    
    this.ungo = function(req, res) {
        var placeId = req.params.placeId;
        
        Places
            .findOne({placeId: placeId}, function(err, doc) {
                if (err) throw err;
                
                var userIds = doc.userIds,
                    userId = req.user.github.id;
                
                doc.userIds = [];
                userIds.forEach(function(id) {
                    if (id !== userId)
                        doc.userIds.push(id);    
                });
                
                if (doc.userIds.length > 0) {
                    doc.save(function(err, result) {
                        if (err) throw err;
                        
                        res.json({
                            count: result.userIds.length,
                            going: false
                        });
                    });
                } else {
                    doc.remove(function(err) {
                        if (err) throw err;
                        
                        res.json({
                            count: 0,
                            going: false
                        }); 
                    });
                }
            });
    };
    
    this.getImage = function(req, res) {
        var reference = req.params.reference;
        var imageApiUrl = 'https://maps.googleapis.com/maps/api/place/photo?maxwidth=400&photoreference='
                + reference + '&key=' + process.env.KEY;
        
        https.get(imageApiUrl, function(response) {
            response.pipe(bl(function(err, buffer) {
                if (err) throw err;
                
                var arr = buffer.toString().match(/HREF="\S+"/);
                var href = arr? arr[0]: null;
                
                res.json({imageUrl: (href? href.substr(6, href.length - 7): '')});
            })); 
        });
    };
    
    this.lastSearch = function(req, res) {
        var auth = req.isAuthenticated();
        
        if (auth) {
            Users
                .findOne({'github.id': req.user.github.id}, function(err, doc) {
                    if (err) throw err;
                    
                    res.json(doc.lastSearch);
                });
        } else {
            res.json([]);
        }
    };  
}

module.exports = Controller;
