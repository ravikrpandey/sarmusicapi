const { where } = require("sequelize");
const db = require("../../IndexFiles/modelsIndex");
const tbl_songPlayList = db.playlistSong;
const tbl_playlist = db.playlist
const { Op } = require('sequelize');
const { default: youtubeDl } = require("youtube-dl-exec");


//=========== create songplaylist =========//

exports.createsongPlayList = async (req, res) => {
    try{
        const {playlistName, playlistId, songId, liked, mobileNumber}= req.body;

        let userId = await db.user.findOne({
            where:{
                mobileNumber
            }
        })
        userId = userId.userId
        let checkSongId = await tbl_songPlayList.findOne({where:{
            playlistId,
            playlistName,
            songId,
            userId
        }});

        if (checkSongId && liked === true) {
            await tbl_songPlayList.update({like: 'Liked'}, {where: {
                userId: checkSongId.userId,
                songId: songId
            }})

            return res.status(200).send({code: 200, message: `Added To ${playlistName} Playlist`});

        } else if (checkSongId && liked === false) {
            await tbl_songPlayList.update({like: 'unLiked'}, {where: {
                userId: checkSongId.userId,
                songId: songId
            }})

            return res.status(200).send({code: 200, message: `Removed From ${playlistName} Playlist`});
        }
        
        const data = await tbl_songPlayList.create({
            playlistName, playlistId, songId, userId, like: 'Liked'
        });
        return res.status(200).send({code: 200, message: `Song Added To ${playlistName} Playlist`, data: data});
    }catch (error){
        return res.status(500).send({code: 500, message: error.message || "internal server error"});
    }
}

//========== get songPlaylist ==============//

exports.getSonPlayList = async (req , res)=>{
 try{
    const getData = await tbl_songPlayList.findAll({
        where:{
            isDeleted:false,
            // songPlaylistName: "Sad song"
        },
        // include: [{
        //     model: tbl_playlist,
        //     attributes: {
        //         exclude: ['playlistName']
        //     }
        // }]
    })
return res.status(200).send({code:200,message:"All Song Playlist Fetched Successfully", data:getData })
 }catch(error){
    return res.status(500).send({code: 500, message: error.message || "internal server error"});
 }
}

//=============== get songplaylist by id ========//

exports.getSongPlaylistById = async (req, res) => {
    try{
        const {id}= req.params;
        const data = await tbl_songPlayList.findOne({
            where: {
                playlistSongId: id
            }
        });
        return res.status(200).send({code: 200, message: "song playlist is fetched succesfully", data: data});
    }catch (error){
        return res.status(500).send({code: 500, message: error.message || "internal server error"});
    }
}

//============ update songplaylist ==============//

exports.updateSonPlaylist = async (req, res) => {
    try{
    const {playlistSongId}= req.params;
    const {songPlaylistName, playlistId, userId}= req.body;

    const data = tbl_songPlayList.findOne({
        where: {
            playlistSongId: playlistSongId,
            isDeleted: false
        }
    })
    if(data){
        const updateData = await tbl_songPlayList.update({
            songPlaylistName, playlistId, userId
        },
        {
        where:{
            playlistSongId: playlistSongId
        }
    })
    const updatedData2 = await tbl_songPlayList.findOne({
       where: { 
        playlistSongId: playlistSongId
       }
    });
    return res.status(200).send({code: 200, message: "songplaylist updated succesfully", data: updatedData2});
    }else {
        return res.status(422).send({code: 422, message: "invalid data"});
    }
    }catch (error) {
     return res.status(500).send({code: 500, message: error.message || "Internal server error"});
    }
}

// ===== delete songPlayList === //

exports.deleteSongPlayList= async (req , res) =>{
    try {
        const {playlistSongId}= req.params;

        const data = await tbl_songPlayList.findOne({
            playlistSongId : playlistSongId,
            isDeleted:false
        })
        if(data){
        const deleted= await tbl_songPlayList.update({
            isDeleted:true
        },
        {where:{
            playlistSongId : playlistSongId,
        }
        })
        const showDelteData = await tbl_songPlayList.findOne({
            where: {
                playlistSongId : playlistSongId,
            }
        })
        return res.status(200).send({code:200,message:"Data deleted Successfully", data:showDelteData});
}else{
    return res.status(422).send({code: 422, message: "invalid data"});
}
    } catch (error) {
        return res.status(500).send({code: 500, message: error.message || "internal server error"});
    }
}

//==================== most plyed song =====================//

exports.updateSongPlayedCount = async (req, res) => {
    try {
      let { songId, mobileNumber} = req.params;
      const userId = await db.user.findOne({
        where: { mobileNumber: mobileNumber
         },
         attributes: ["userId"]
      });
      
      const song = await db.playlistSong.findOne({
        where: { songId: songId,
                userId: userId.userId,
                playlistName: 'MostPlayed'
         }
      });

      const currentPlayedCount = song?.playedCount || 0;
      if (song) {
        const updatedSong = await db.playlistSong.update(
          { playedCount: currentPlayedCount + 1 }, 
          { where: { songId: songId, userId: userId.userId, playlistName: 'MostPlayed' } }
        );
        return res.status(200).send({ code: 200, message: "Count updated successfully", data: updatedSong });
      } else {
        await db.playlist.create(
          { playlistName: 'MostPlayed', userId: userId.userId, description:"its a most played playlist"}
        );

        const playlistRecord = await db.playlist.findOne({
          where: {userId: userId.userId,
                  playlistName: 'MostPlayed'
           }
        });

        await db.playlistSong.create(
          { playedCount: currentPlayedCount + 1, playlistName: 'MostPlayed', songId: songId, userId: userId.userId, playlistId:playlistRecord.playlistId}
        );

        return res.status(200).send({ code: 200, message: "Count updated successfully"})
      }
    } catch (error) {
      console.error('Error:', error.message);
      res.status(500).json({ code: 500, message: 'Failed to update data' });
    }
  }
  
  //==================== getUsersPlaylist ==================//
  // Optimized version: batch fetch all playlistSongs and all songs in one go to reduce DB calls

  exports.getUsersPlaylist = async (req, res) => {
    try {
      let { userId, mobileNumber } = req.params;

      // 1. Get userId from mobileNumber
      const userData = await db.user.findOne({
        where: { mobileNumber },
        attributes: ['userId']
      });

      if (!userData) {
        return res.status(404).send({ code: 404, message: "User not found." });
      }

      userId = userData.userId;

      // 2. Get all playlists for the user
      const playlists = await db.playlist.findAll({
        where: { userId }
      });

      if (!playlists.length) {
        return res.status(404).send({ code: 404, message: "No playlists found." });
      }

      // 3. Get all playlistIds
      const playlistIds = playlists.map(p => p.playlistId);

      // 4. Get all playlistSongs for these playlists, with filter
      const allPlaylistSongs = await db.playlistSong.findAll({
        where: {
          playlistId: playlistIds,
          [Op.or]: [
            { playedCount: { [Op.gte]: 3 } },
            { like: 'Liked' }
          ]
        },
        order: [['playedCount', 'DESC']]
      });

      // 5. Remove duplicate songIds per playlistId
      //    Build a map: { playlistId: [playlistSong, ...] }
      const playlistSongMap = {};
      for (const playlist of playlists) {
        playlistSongMap[playlist.playlistId] = [];
      }
      // Use a Set per playlistId to track unique songIds
      const playlistSongIdSet = {};
      for (const playlist of playlists) {
        playlistSongIdSet[playlist.playlistId] = new Set();
      }
      for (const ps of allPlaylistSongs) {
        const pid = ps.playlistId;
        if (!playlistSongIdSet[pid].has(ps.songId)) {
          playlistSongIdSet[pid].add(ps.songId);
          playlistSongMap[pid].push(ps);
        }
      }

      // 6. Collect all unique songIds needed
      const allSongIds = Array.from(
        new Set(
          allPlaylistSongs.map(ps => ps.songId)
        )
      );

      // 7. Batch fetch all songs
      const allSongs = await db.song.findAll({
        where: { songId: allSongIds, isDeleted: false },
        attributes: ['songId', 'songUrl', 'songCardUrl', 'albumCardUrl', 'songTitle', 'artistName', 'youtubeId']
      });

      // Build a map for quick lookup
      const songMap = {};
      for (const song of allSongs) {
        songMap[song.songId] = song;
      }

      // 8. Build songData for each playlist
      const songData = playlists.map(playlist => {
        const playlistSongs = playlistSongMap[playlist.playlistId] || [];
        const songsWithUrls = playlistSongs.map(playlistSong => {
          const song = songMap[playlistSong.songId];
          if (!song) return null;
          let songTitle = song.songTitle?.length > 15 ? song.songTitle.substring(0, 24) : song.songTitle;
          return {
            ...playlistSong.dataValues,
            songUrl: song.songUrl,
            songCardUrl: song.songCardUrl,
            albumCardUrl: song.albumCardUrl,
            songTitle,
            artistName: song.artistName,
            youtubeId: song.youtubeId
          };
        }).filter(Boolean);

        return {
          playlistId: playlist.playlistId,
          playlistName: playlist.playlistName,
          songs: songsWithUrls
        };
      });

      // 9. Filter mostPlayed
      let mostPlayed = songData.filter(item => item.playlistName === 'MostPlayed');

      return res.status(200).send({
        code: 200,
        message: "Playlist and song data fetched successfully",
        data: songData,
        mostPlayed
      });
    } catch (error) {
      console.error("Error:", error.message);
      res.status(500).json({ code: 500, message: "Server error" });
    }
  };
  
  
  
  //======================== api for get all updated played count ================//
  
  exports.getLikedSongByUser = async (req, res) => {
    try {
      const { mobileNumber } = req.params;
  
      // Fetch userId based on mobileNumber
      const user = await db.user.findOne({
        where: { mobileNumber },
        attributes: ['userId']
      });
  
      if (!user) {
        return res.status(404).send({ code: 404, message: "User not found" });
      }
  
      const userId = user.userId;
  
      // Fetch liked songs from the playlist
      const likedSongs = await tbl_songPlayList.findAll({
        where: {
          playlistName: 'Liked Song',
          like: 'Liked',
          userId
        },
        attributes: ['songId']
      });
  
      if (!likedSongs.length) {
        return res.status(200).send({ code: 200, message: "No liked songs found", data: [] });
      }
  
      const songIds = likedSongs.map(song => song.songId);
  
      // Fetch song details for the liked songs
      const songs = await db.song.findAll({
        where: {
          songId: songIds
        },
        attributes: [
          'songId', 
          'albumId', 
          'albumName', 
          'albumCardUrl', 
          'artistId', 
          'artistName', 
          'songTitle', 
          'songUrl', 
          'songCardUrl'
        ]
      });
  
      return res.status(200).send({ 
        code: 200, 
        message: "Liked songs listed successfully", 
        data: songs 
      });
    } catch (error) {
      console.error('Error:', error.message);
      return res.status(500).json({ code: 500, message: 'Server error' });
    }
  };
  




