'use strict';

var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var User = new Schema({
    github: {
        id: String,
        displayName: String,
        username: String
    },
    lastSearch: [{
        placeId: String,
        address: String,
        name: String,
        openNow: Boolean,
        photoReference: String
    }]
});

module.exports = mongoose.model('User', User);


