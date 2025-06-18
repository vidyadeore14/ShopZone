const mongoose = require('mongoose');

const locationSchema = new mongoose.Schema({
  country: String,
  state: String
});

module.exports = mongoose.model('Location', locationSchema);
