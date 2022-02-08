const NotesRoute = require("express").Router();
const NotesController = require("../controllers/Notes.controller");
const auth = require("../Middlewares/auth");

NotesRoute.post("/getChapters", auth, NotesController.getChapters);
NotesRoute.get("/", auth, NotesController.get);
NotesRoute.post("/", auth, NotesController.create);
NotesRoute.put("/:notesId", auth, NotesController.update);
NotesRoute.delete("/", auth, NotesController.delete);
NotesRoute.get("/file", NotesController.getFiles);

module.exports = NotesRoute;