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
        type: Sequelize.STRING,
        defaultValue: 'https://www.shutterstock.com/image-vector/music-display-theme-platform-sample-260nw-2248655619.jpg'
      },
      artistId: {
        type: Sequelize.INTEGER
      },
      artistName: {
        type: Sequelize.STRING,
        defaultValue: 'https://www.shutterstock.com/image-vector/music-display-theme-platform-sample-260nw-2248655619.jpg'
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
        defaultValue: 'https://www.shutterstock.com/image-vector/music-display-theme-platform-sample-260nw-2248655619.jpg'
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