const db = require("../../IndexFiles/modelsIndex");
const tbl_playlist = db.playlist
const tbl_loginUser = db.user;

exports.createPlaylist = async (req, res) => {
    try {
        const { playlistName, userId, description } = req.body
        const data = await tbl_playlist.create({ playlistName, userId, description });
        return res.status(200).send({ code: 200, message: 'PlayList Created Successfully', data: data })
    } catch (error) {
        return res.status(500).send({ code: 500, message: error.message || "Internal server error" });
    }
}

//============= getall playlist ============//

exports.getAllPlaylist = async (req, res) => {
    try {
        const data = await tbl_playlist.findAll({
            where: {
                isDeleted: false
            },
            include: {
                model: tbl_loginUser,
                attributes: [
                    "mobileNumber"
                ] // Exclude attributes from tbl_loginUser if needed
            }
        });
        return res.status(200).send({ code: 200, message: "Playlist fetched successfully", data: data });
    } catch (error) {
        return res.status(500).send({ code: 500, message: error.message || "Internal server error" });
    }
}


//============ getbyid playlist ===========//

exports.getPlaylistById = async (req, res) => {
    try {
        const { playlistId } = req.params;
        const data = await tbl_playlist.findOne({
            where: {
                playlistId: playlistId
            }
        })
        return res.status(200).send({ code: 200, message: "playlist fetched suceesfully", data: data });
    } catch (error) {
        return res.stastus(500).send({ code: 500, message: error.message || "Internal server error" });
    }
}

//========= update playlist ==========//

exports.updatePlylist = async (req, res) => {
    try {
        const { playlistId } = req.params;
        const { playlistName, userId } = req.body;

        const editData = await tbl_playlist.findOne({
            where: {
                playlistId: playlistId
            }
        });
        if (editData) {
            const updateData = await tbl_playlist.update({
                playlistName, userId
            },
                {
                    where: {
                        playlistId: playlistId
                    }
                })
            return res.status(200).send({ code: 200, message: "playlist updated succesfully", data: updateData });
        } else {
            return res.status(422).send({ code: 422, message: "Invalid Data" });
        }
    } catch (error) {
        return res.status(500).send({ code: 500, message: error.message || "Internal server error" });
    }
}

//========== delete playlist ========//

exports.deletePlaylist = async (req, res) => {
    try {
        const { playlistId } = req.params;
        const editData = await tbl_playlist.findOne({
            where: {
                playlistId: playlistId
            }
        });
        if (editData) {
            const updateData = await tbl_playlist.update({
                isDeleted: true
            },
                {
                    where: {
                        playlistId: playlistId
                    }
                })
            return res.status(200).send({ code: 200, message: "playlist deleted succesfully", data: updateData });
        } else {
            return res.status(422).send({ code: 422, message: "Invalid Data" });
        }
    } catch (error) {
        return res.status(500).send({ code: 500, message: error.message || "Internal server error" });
    }
}

//================= getAllDashboardcount ================//

exports.getAllDashBoardCount = async (req, res) => {
    try {
        const TotalArtist = await db.artist.count({
            where: {
                isDeleted: false,
            },
        });
        const TotalAlbums = await db.album.count({
            where: {
                isDeleted: false,
            }
        });
        const TotalSongs = await db.song.count({
            where: {
                isDeleted: false,
            }
        });
        const TotalPlaylist = await db.playlist.count({
            where: {
                isDeleted: false,
            }
        });
        const TotalActiveUser = await db.user.count({
            where: {
                isDeleted: false,
            }
        });


        let totalEventCount = {
            "TotalArtist": TotalArtist,
            "TotalAlbums": TotalAlbums,
            "TotalSongs": TotalSongs,
            "TotalPlaylist": TotalPlaylist,
            "TotalActiveUser": TotalActiveUser,
        }

        return res
            .status(200)
            .send({
                code: 200,
                message: "dashboar count is fetched is fetched succesfully",
                data: totalEventCount

            });
    } catch (error) {
        return res
            .status(500)
            .send({ code: 500, message: error.message || "Internal server error" });
    }
};