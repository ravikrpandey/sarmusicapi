const playListController = require("../Playlist/playlistController");

module.exports = app => {
    app.post("/api/createPlaylist", playListController.createPlaylist);
    app.get("/api/getAllPlaylist", playListController.getAllPlaylist);
    app.get("/api/getPlaylistById/:playlistId", playListController.getPlaylistById);
    app.put("/api/updatePlylist/:playlistId", playListController.updatePlylist);
    app.delete("/api/deletePlaylist/:playlistId", playListController.deletePlaylist);
    app.get("/api/getAllDashBoardCount", playListController.getAllDashBoardCount);

}