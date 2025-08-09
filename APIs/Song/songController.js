const db = require("../../IndexFiles/modelsIndex")
const tbl_song = db.song;
const tbl_album = db.album
// const ytdl = require('ytdl-core');
const youtubedl = require('youtube-dl-exec');
// const ytdl = require('ytdl-core');
const https = require('https');
const { exec } = require('child_process');
const { where } = require("sequelize");
const {saveFileAndGetNameByBase64} = require('../services/upload-files/service')
const { Sequelize } = require('sequelize'); // Ensure Sequelize is imported
//=============== create song  ======//

// exports.createSong = async (req, res) => {
//     try {
//         const createdSongs = [];
//         for (let songData of req.body) {
//             let { albumId, albumName, artistId, artistName, songTitle, duration, songUrl, songFile, releaseDate, genre, albumCardUrl, songCardUrl, youtubeUrl, tag } = songData;

//             let filePath = songUrl;
//             let youtubeId = null;
//             let youtubeInfo = null;

//             // If youtubeUrl is provided, extract details from YouTube
//             if (youtubeUrl) {
//                 try {
//                     // Extract YouTube video ID from the URL
//                     const youtubeIdMatch = youtubeUrl.match(/(?:v=|\/)([0-9A-Za-z_-]{11})(?:\?|&|$)/);
//                     if (youtubeIdMatch && youtubeIdMatch[1]) {
//                         youtubeId = youtubeIdMatch[1];
//                     } else {
//                         // fallback: try to match just 11-char id
//                         const fallbackId = youtubeUrl.match(/([0-9A-Za-z_-]{11})/);
//                         if (fallbackId && fallbackId[1]) {
//                             youtubeId = fallbackId[1];
//                         }
//                     }

//                     if (!youtubeId) {
//                         return res.status(400).send({ code: 400, message: "Invalid YouTube URL, could not extract video ID" });
//                     }

//                     const url = `https://www.youtube.com/watch?v=${youtubeId}`;

//                     youtubeInfo = await youtubedl(url, {
//                         dumpSingleJson: true,
//                         preferFreeFormats: true,
//                         noCheckCertificates: true,
//                         noWarnings: true,
//                     });

//                     // Extract title, duration, etc. if not provided
//                     if (!songTitle && youtubeInfo.title) songTitle = youtubeInfo.title;
//                     if (!duration && youtubeInfo.duration) duration = youtubeInfo.duration_string.toString();
//                     if (!songCardUrl && youtubeInfo.thumbnail) songCardUrl = youtubeInfo.thumbnail;
//                     if (!artistName && youtubeInfo.uploader) artistName = youtubeInfo.uploader;
//                     if (!releaseDate && youtubeInfo.upload_date) releaseDate = youtubeInfo.upload_date;
//                     if (!tag && youtubeInfo.tags) tag = JSON.stringify(youtubeInfo.tags);

//                     // Set songUrl to best audio format url
//                     const audio = youtubeInfo.formats && youtubeInfo.formats.find(
//                         f => f.asr && f.acodec !== 'none' && f.vcodec === 'none'
//                     );
//                     if (audio && audio.url) filePath = audio.url;
//                 } catch (err) {
//                     return res.status(400).send({ code: 400, message: "Failed to extract YouTube details", error: err.message });
//                 }
//             }

//             if (songFile) {
//                 filePath = await saveFileAndGetNameByBase64(songFile, songTitle);
//             }

//             // Save song data to the database
//             const createdSong = await tbl_song.create({
//                 albumId,
//                 albumName,
//                 artistId,
//                 artistName,
//                 songTitle,
//                 duration,
//                 songUrl: filePath,
//                 releaseDate,
//                 genre,
//                 albumCardUrl,
//                 songCardUrl,
//                 youtubeId,
//                 tag
//             });
//             createdSongs.push(createdSong);
//         }

//         return res.status(200).send({ code: 200, message: 'Songs Created Successfully', data: createdSongs });
//     } catch (error) {
//         return res.status(500).send({ code: 500, message: error.message || "Internal server error" });
//     }
// };

exports.createSong = async (req, res) => {
    try {
        const songsData = req.body;

        const createdSongs = await Promise.all(
            songsData.map(async (songData) => {
                let { albumId, albumName, artistId, artistName, songTitle, duration, songUrl, songFile, releaseDate, genre, albumCardUrl, songCardUrl, youtubeUrl, tag } = songData;

                let filePath = songUrl;
                let youtubeId = null;
                let youtubeInfo = null;

                // If YouTube URL is provided, only fetch metadata
                if (youtubeUrl) {
                    try {
                        // Extract YouTube video ID
                        const youtubeIdMatch = youtubeUrl.match(/(?:v=|\/)([0-9A-Za-z_-]{11})(?:\?|&|$)/);
                        if (youtubeIdMatch && youtubeIdMatch[1]) {
                            youtubeId = youtubeIdMatch[1];
                        } else {
                            const fallbackId = youtubeUrl.match(/([0-9A-Za-z_-]{11})/);
                            if (fallbackId && fallbackId[1]) {
                                youtubeId = fallbackId[1];
                            }
                        }

                        if (!youtubeId) {
                            throw new Error("Invalid YouTube URL, could not extract video ID");
                        }

                        const url = `https://www.youtube.com/watch?v=${youtubeId}`;

                        // Fetch ONLY metadata (no formats)
                        youtubeInfo = await youtubedl(url, {
                            dumpSingleJson: true,
                            skipDownload: true,
                            noPlaylist: true,
                            noCheckCertificates: true,
                            noWarnings: true,
                        });

                        // Fill missing details from YouTube metadata
                        if (!songTitle && youtubeInfo.title) songTitle = youtubeInfo.title;
                        if (!duration && youtubeInfo.duration) duration = youtubeInfo.duration_string?.toString() || youtubeInfo.duration.toString();
                        if (!songCardUrl && youtubeInfo.thumbnail) songCardUrl = youtubeInfo.thumbnail;
                        if (!artistName && youtubeInfo.uploader) artistName = youtubeInfo.uploader;
                        if (!releaseDate && youtubeInfo.upload_date) releaseDate = youtubeInfo.upload_date;
                        if (!tag && youtubeInfo.tags) tag = JSON.stringify(youtubeInfo.tags);

                        // Don't set songUrl — we'll fetch stream URL during playback
                        filePath = null;

                    } catch (err) {
                        console.error(`YouTube metadata fetch failed for ${youtubeUrl}:`, err.message);
                        throw err;
                    }
                }

                // If song file is uploaded, save it
                if (songFile) {
                    filePath = await saveFileAndGetNameByBase64(songFile, songTitle);
                }

                // Save song data to DB
                return await tbl_song.create({
                    albumId,
                    albumName,
                    artistId,
                    artistName,
                    songTitle,
                    duration,
                    songUrl: filePath,
                    releaseDate,
                    genre,
                    albumCardUrl,
                    songCardUrl,
                    youtubeId, // Save only ID for YouTube
                    tag
                });
            })
        );

        return res.status(200).send({
            code: 200,
            message: 'Songs Created Successfully',
            data: createdSongs
        });

    } catch (error) {
        console.error("createSong error:", error);
        return res.status(500).send({
            code: 500,
            message: error.message || "Internal server error"
        });
    }
};


//================ getAll song =============//

exports.getAllSong = async (req, res) => {
    try {
        const allData = await tbl_song.findAll({
            where: {
                isDeleted: false
            }
        })
        return res.status(200).send({ code: 200, message: "all song fetched succesfully", data: allData });
    } catch (error) {
        return res.status(500).send({ code: 500, message: error.message || "internal server error" })
    }
}

//================ get song by id ===============//

exports.getSongById = async (req, res) => {
    try {
        const { id } = req.params;
        const getData = await tbl_song.findOne({
            where: {
                songId: id,
                isDeleted: false
            }
        })
        return res.status(200).send({ code: 200, message: "song fetched succesfully", data: getData })
    } catch (error) {
        return res.status(500).send({ code: 500, message: error.message || "internal server error" })
    }
}

//================= update song ==========//

exports.updateSong = async (req, res) => {
    try {
        const { id } = req.params;
        const { albumId, albumName, artistId, artistName, songTitle, duration, songUrl, songFile, releaseDate, genre , songCardUrl} = req.body;

        const song = await tbl_song.findOne({
            where: {
                songId: id
            }
        });

        if (!song) {
            return res.status(422).send({ code: 422, message: "Invalid data" });
        }

        let filePath = songUrl;

        if (songFile) {
            filePath = await saveFileAndGetNameByBase64(songFile, songTitle);
        }

        const updatedSong = await tbl_song.update(
            {
                albumId,
                albumName,
                artistId,
                artistName,
                songTitle,
                duration,
                songUrl: filePath,
                releaseDate,
                genre,
                songCardUrl
            },
            {
                where: {
                    songId: id
                }
            }
        );

        return res.status(200).send({ code: 200, message: "Song updated successfully", data: updatedSong });
    } catch (error) {
        return res.status(500).send({ code: 500, message: error.message || "Internal server error" });
    }
};


//============ delete ==========//

exports.deleteSong = async (req, res) => {
    try {
        const { id } = req.params;
        const data = await tbl_song.findOne({
            where: {
                songId: id
            }
        })
        if (data) {
            const updateData = await tbl_song.update({
                isDeleted: true
            },
                {
                    where: {
                        songId: id
                    }
                })
                return res.status(200).send({ code: 200, message: "Soft delete completed successfully", data: updateData });
        } else {
            return res.status(422).send({ code: 422, message: "invalid data" });
        }
    } catch (error) {
        return res.status(500).send({ code: 500, message: error.message || "internal server error" });
    }
}

//================ getSonsByAlbumId ===========//



exports.getSongsByAlbumId = async (req, res) => {
    try {
        const { albumId } = req.params;

        const data = await tbl_song.findAll({
            where: {
                albumId: albumId,
                isDeleted: false
            },
            attributes: ['songTitle', 'songId', 'songUrl', 'artistName', 'songCardUrl', 'youtubeId'],
            order: Sequelize.fn('RAND')
        });

        return res.status(200).send({ 
            code: 200, 
            message: "Songs fetched successfully by album ID", 
            data: data 
        });
    } catch (error) {
        return res.status(500).send({ 
            code: 500, 
            message: error.message || "Internal server error" 
        });
    }
};


exports.getSongsByArtistId = async (req, res) => {
    try {
        const { artistId } = req.params;
        const data = await tbl_song.findAll({
            where: {
                artistId: artistId,
                isDeleted: false
            }, attribute: ['songTitle', 'songId', 'songUrl', 'artistName']
        })
        return res.status(200).send({ code: 200, message: "song is fetched successfully", data: data })
    } catch (error) {
        return res.status(500).send({ code: 500, message: error.message || "internal server error" });
    }
};


//============== getSOngUrlByYoutubeLink===============

exports.getSongUrlByYoutubeLink = async (req, res) => {
    try {


        async function getDirectAudioUrl(youtubeUrl) {
            return new Promise((resolve, reject) => {
                const command = `youtube-dl -g -f bestaudio "${youtubeUrl}"`;
                exec(command, (error, stdout, stderr) => {
                    if (error) {
                        reject(error);
                        return;
                    }
                    if (stderr) {
                        reject(new Error(stderr));
                        return;
                    }
                    const audioUrl = stdout.trim();
                    resolve(audioUrl);
                });
            });
        }

        // Example usage
        const youtubeUrl = 'https://www.youtube.com/watch?v=dQw4w9WgXcQ';
        getDirectAudioUrl(youtubeUrl)
            .then(audioUrl => {
                console.log('Direct audio URL:', audioUrl);
            })
            .catch(error => {
                console.error('Error:', error.message);
            });

    } catch (error) {
        console.error('Error:', error.message);
        res.status(500).json({ code: 500, message: 'Failed to get audio URL' });
    }
};

// async function getDirectAudioUrl(youtubeUrl) {
//     return new Promise((resolve, reject) => {
//         const videoId = ytdl.getURLVideoID(youtubeUrl);
//         ytdl.getInfo(videoId, (err, info) => {
//             if (err) {
//                 console.error('Error fetching video info:', err);
//                 reject(err);
//                 return;
//             }

//             const audioFormat = ytdl.chooseFormat(info.formats, { filter: 'audioonly' });
//             if (!audioFormat) {
//                 reject(new Error('No audio stream found'));
//                 return;
//             }

//             resolve(audioFormat.url);
//         });
//     });
// }


exports.masterSearchForSongOrAlbum = async (req, res) => {
    try {
        const searchKey = req.params.searchKey;

        async function searchSongs(searchTerm) {
            const query = `
                SELECT * FROM songs
                WHERE (songTitle LIKE ?
                   OR artistName LIKE ?
                   OR albumName LIKE ?
                   OR tag LIKE ?
                   OR genre LIKE ?)
                   AND (isDeleted IS NULL OR isDeleted = false)`;
            const likeSearchTerm = `%${searchTerm}%`;
            const data = await db.sequelize.query(query, {
                replacements: [likeSearchTerm, likeSearchTerm, likeSearchTerm, likeSearchTerm, likeSearchTerm],
                type: db.sequelize.QueryTypes.SELECT
            });
            return data;
        }

        if (searchKey) {
            const data = await searchSongs(searchKey);
            return res.status(200).send({ code: 200, message: 'Searched result', data });
        } else {
            return res.status(400).json({ code: 400, message: 'No search key provided' });
        }
        
    } catch (error) {
        console.error('Error:', error.message);
        res.status(500).json({ code: 500, message: 'Failed to retrieve search results' });
    }
};




//////////////////////////////////////////////////////

// exports.ytdlUrl = async (req, res) => {
//     const videoId = req.params.searchKey;

//     try {

//         const info = await youtubedl(`https://www.youtube.com/watch?v=${videoId}`, {
//             dumpSingleJson: true,
//             noCheckCertificates: true,
//             noWarnings: true,
//             preferFreeFormats: true,
//             format: 'bestaudio'
//         });

//         const audio = info.formats.find(
//             f => f.asr && f.acodec !== 'none' && f.vcodec === 'none'
//         );

//         if (!audio?.url) {
//             return res.status(404).json({ error: 'Audio stream not found.' });
//         }

//         songUrl = audio.url;


//         // 4️⃣ Stream the audio
//         const options = { headers: {} };
//         if (req.headers.range) {
//             options.headers.Range = req.headers.range;
//         }

//         res.setHeader('Accept-Ranges', 'bytes');
//         res.setHeader('Content-Type', 'audio/mp4');

//         https.get(songUrl, options, (stream) => {
//             if (stream.statusCode === 206) {
//                 res.writeHead(206, stream.headers);
//             }
//             stream.pipe(res);

//             stream.on('error', (err) => {
//                 console.error('Stream error:', err);
//                 if (!res.headersSent) {
//                     res.status(500).json({ error: 'Audio stream failed during transfer.' });
//                 } else {
//                     res.destroy(err);
//                 }
//             });
//         }).on('error', (err) => {
//             console.error('Request error:', err);
//             if (!res.headersSent) {
//                 res.status(500).json({ error: 'Failed to establish audio stream connection.' });
//             } else {
//                 res.destroy(err);
//             }
//         });

//     } catch (error) {
//         console.error('Error in ytdlUrl:', error.message);
//         res.status(500).json({ error: 'Failed to stream audio' });
//     }
// };


////////////////////////



exports.ytdlUrl = async (req, res) => {
    const videoId = req.params.searchKey;

    try {
        // 1️⃣ Check if songUrl exists in DB
        const [existingSong] = await db.sequelize.query(
            `SELECT songUrl FROM songs WHERE youtubeId = :videoId LIMIT 1`,
            { replacements: { videoId } }
        );

        let songUrl = existingSong?.[0]?.songUrl;

        // Function to validate if YouTube URL is still working
        const isUrlValid = (url) => {
            return new Promise((resolve) => {
                https.get(url, (resp) => {
                    resolve(resp.statusCode === 200 || resp.statusCode === 206);
                }).on('error', () => resolve(false));
            });
        };

        // 2️⃣ If URL exists & still valid → use it
        if (songUrl && await isUrlValid(songUrl)) {
            console.log('✅ Using cached songUrl from DB');
        } 
        // 3️⃣ Else → fetch fresh URL from YouTube
        else {
            console.log('♻️ Fetching new songUrl from YouTube...');
            const videoUrl = `https://www.youtube.com/watch?v=${videoId}`;
            const info = await ytdl.getInfo(videoUrl);
            const format = ytdl.chooseFormat(info.formats, {
                quality: 'highestaudio',
                filter: 'audioonly'
            });

            if (!format?.url) {
                return res.status(404).json({ error: 'Audio stream not found.' });
            }

            songUrl = format.url;

            // Update DB with new URL
            await db.sequelize.query(
                `UPDATE songs SET songUrl = :songUrl WHERE youtubeId = :videoId`,
                { replacements: { songUrl, videoId } }
            );
        }

        // 4️⃣ Stream the audio
        const options = {};
        if (req.headers.range) {
            options.headers = { Range: req.headers.range };
        }

        res.setHeader('Accept-Ranges', 'bytes');
        res.setHeader('Content-Type', 'audio/mp4');

        https.get(songUrl, options, (stream) => {
            if (stream.statusCode === 206) {
                res.writeHead(206, stream.headers);
            }
            stream.pipe(res);

            stream.on('error', (err) => {
                console.error('Stream error:', err);
                if (!res.headersSent) {
                    res.status(500).json({ error: 'Audio stream failed during transfer.' });
                } else {
                    res.destroy(err);
                }
            });
        }).on('error', (err) => {
            console.error('Request error:', err);
            if (!res.headersSent) {
                res.status(500).json({ error: 'Failed to establish audio stream connection.' });
            } else {
                res.destroy(err);
            }
        });

    } catch (error) {
        console.error('Error in ytdlUrl:', error.message);
        res.status(500).json({ error: 'Failed to stream audio' });
    }
};





