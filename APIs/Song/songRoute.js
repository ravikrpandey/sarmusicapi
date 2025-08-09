const songRoute = require("../Song/songController");

module.exports = app => {
app.post("/api/createSong", songRoute.createSong);
app.get("/api/getAllSong", songRoute.getAllSong);
app.get("/api/getSongById/:id", songRoute.getSongById);
app.get("/api/getSongsByAlbumId/:albumId", songRoute.getSongsByAlbumId);
app.get("/api/getSongsByArtistId/:artistId", songRoute.getSongsByArtistId);
app.patch("/api/updateSong/:id", songRoute.updateSong);
app.delete("/api/deleteSong/:id", songRoute.deleteSong);
app.get("/api/getSongUrlByYoutubeLink", songRoute.getSongUrlByYoutubeLink);
app.get("/api/masterSearchForSongOrAlbum/:searchKey", songRoute.masterSearchForSongOrAlbum);
app.get("/api/youtube-stream/:searchKey", songRoute.ytdlUrl);
}