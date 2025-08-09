const songPlayListController = require("../PlaylistSong/playlistSongsController");

module.exports = app => {
    app.post("/api/createsongPlayList", songPlayListController.createsongPlayList );
    app.get("/api/getAllPlaylistData",songPlayListController.getSonPlayList);
    app.get("/api/getSongPlaylistById/:playlistSongId", songPlayListController.getSongPlaylistById );
    app.put("/api/updateSonPlaylist/:playlistSongId", songPlayListController.updateSonPlaylist);
    app.delete("/api/deleteSongPlayList/:playlistSongId", songPlayListController.deleteSongPlayList);
    app.get("/api/updateSongPlayedCount/:songId/:mobileNumber", songPlayListController.updateSongPlayedCount);
    app.get("/api/getUsersPlaylist/:mobileNumber", songPlayListController.getUsersPlaylist);
    app.get("/api/getLikedSongByUser/:mobileNumber", songPlayListController.getLikedSongByUser);


}