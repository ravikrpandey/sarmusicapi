const db = require("../../IndexFiles/modelsIndex");
const tbl_album = db.album;
const {saveFileAndGetNameByBase64} = require('../services/upload-files/service')
const { Sequelize } = require('sequelize'); // Ensure Sequelize is imported
//=========== create Album ================//

exports.createAlbum = async (req , res) => {
    try{
    const {albumName, artistId, artistName, releaseDate, genre, albumCardUrl} = req.body;

    const data = await tbl_album.create({albumName, artistId, artistName, releaseDate, genre, albumCardUrl});
    return res.status(200).send({code: 200, message: 'Album Created Successfully', data: data});
} catch (error) {
    return res.status(500).send({code: 500, message: error.message});
}
}

//============== get Album ======//

exports.getAllAlbum = async (req , res) => {
    try{
        const findAlbum = await tbl_album.findAll({ 
            where: {
                isDeleted: false
            },
            order: Sequelize.fn('RAND')
        })
        return res.status(200).send({code: 200, message: "All Album fetched succesfully" , data: findAlbum});

    }catch (error){
        console.log("Error", error);
        return res.status(500).send({code: 500, message: error.message || "Internal Server Error"})
    }
}

//============== get Artist byid =========//

exports.getAlbumById = async (req, res) => {
    try{
        const {albumId}= req.params;

        const album = await tbl_album.findOne({
            where: {
                albumId: albumId,
                isDeleted: false
            }
        })
        return res.status(200).send({code: 200, message: "All Album fetched succesfully" , data: album});
    }catch (error) {
        console.log("Error", error);
        return res.status(500).send({code: 500, message: error.message || "Internal server error"});
    }
}

//========= update album =======// 

exports.updateAlbum = async (req , res) => {
    try {
        const { albumId } = req.params;
    
        let data = await tbl_album.findOne({ where: { albumId: albumId } });
        if (!data) {
            return res.status(404).send({code: 200, message: "Album not found"})
        }
        const updatedData = await tbl_album.update(req.body, {
          where: { albumId: albumId },
          isDeleted: false,
        });
        return res
          .status(200)
          .send({
            code: 200,
            message: "Album updated succesfully",
            data: updatedData,
          });
      } catch (error) {
        console.log("Error", error);
        return res
          .status(500)
          .send({ code: 500, message: error.message || "internal server error" });
      }
}

//=========== delete album ===============//

exports.deleteAlbum = async (req, res) => {
    try {
        const { albumId } = req.params;
        let data = await tbl_album.findOne({ where: { albumId: albumId } });
        if (!data) {
            return res.status(404).send({code: 200, message: "No album to delete"})
        };
        const deleteData = await tbl_album.update(
          { isDeleted: true },
          { where: { albumId: albumId } }
        );
        return res
          .status(200)
          .send({
            code: 200,
            message: "Album deleted succesfully",
            data: deleteData,
          });
      } catch (error) {
        console.log("Error", error);
        return res
          .status(500)
          .send({ code: 500, message: error.message || "internal server" });
      }
}
