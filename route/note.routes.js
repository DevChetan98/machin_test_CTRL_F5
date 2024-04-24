module.exports = app => {
    const express = require('express');
    const router = express.Router();
    const noteController = require('../controller/note.controller');
    const { authJwt } = require("../Middleware/index.js");

  
    // Route for creating a new note
    router.post('/create_notes',[authJwt.verifyToken],noteController.createNote);
  
    // Route for retrieving all notes for the logged-in user
    router.get('/',[authJwt.verifyToken], noteController.getAllNotes);
  
    // Route for retrieving a specific note by ID
    router.get('/:id',[authJwt.verifyToken], noteController.getNoteById);
  
    // Route for updating a specific note by ID
    router.put('/:id',[authJwt.verifyToken],noteController.updateNote);
  
    // Route for deleting a specific note by ID
    router.delete('/:id', noteController.deleteNote);

     // Route for serching
    router.get('/',[authJwt.verifyToken], noteController.searchNotes);

  
    // Mount the router under the '/users/' prefix
    app.use('/notes', router);
  };
  