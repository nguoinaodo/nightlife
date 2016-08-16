var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var Place = new Schema({
    placeId: String,
    userIds: [String]
});

module.exports = mongoose.model('Place', Place);