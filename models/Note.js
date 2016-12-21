var mongoose = require('mongoose');
var Schema = mongoose.Schema;

// create the Note schema
var NoteSchema = new Schema({

  title: {
    type:String
  },
  // just a string
  body: {
    type:String
  }
});

// create the Note model with the NoteSchema
var Note = mongoose.model('Note', NoteSchema);

module.exports = Note;
