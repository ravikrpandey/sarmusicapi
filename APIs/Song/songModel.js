module.exports = (sequelize, Sequelize) => {
    const song = sequelize.define('song', {
      songId: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true
      },
      albumId: {
        type: Sequelize.INTEGER
      },
      albumName: {
        type: Sequelize.STRING
      },
      albumCardUrl: {
        type: Sequelize.STRING
      },
      artistId: {
        type: Sequelize.INTEGER
      },
      artistName: {
        type: Sequelize.STRING
      },
      songTitle: {
        type: Sequelize.STRING
      },
      duration: {
        type: Sequelize.STRING
      },
      songUrl: {
        type: Sequelize.TEXT
      },
      youtubeId: {
        type: Sequelize.STRING
      },
      tag: {
        type: Sequelize.TEXT
      },
      songCardUrl: {
        type: Sequelize.STRING,
        defaultValue: ''
      },
      releaseDate: {
        type: Sequelize.STRING
      },
      genre: {
        type: Sequelize.STRING
      },
      isDeleted: {
        type: Sequelize.BOOLEAN,
        defaultValue: false
      }
    });
    return song;
  }