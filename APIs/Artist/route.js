const artistController = require("../Artist/controller");


module.exports = app => {
    app.post('/api/createArtist', artistController.createArtist);
    app.get('/api/getAllArtists', artistController.geAllArtist);
    app.get('/api/getAllPopularArtist', artistController.getAllPopularArtist);
    app.get('/api/getArtistById/:id', artistController.getArtistById);
    app.put('/api/updateArtist/:id', artistController.updateArtist);
    app.delete('/api/deleteArtist/:id', artistController.deleteArtist);
}