    module.exports = (sequelize, Sequelize) => {
        const album = sequelize.define('album', {
        albumId: {
            type: Sequelize.INTEGER,
            autoIncrement: true,
            primaryKey: true
        },
        albumName: {
            type: Sequelize.STRING
        },
        artistId: {
            type: Sequelize.INTEGER
        },
        artistName: {
            type: Sequelize.STRING
        },
        releaseDate: {
            type: Sequelize.STRING
        },
        genre: {
            type: Sequelize.STRING
        },
        albumCardUrl: {
            type: Sequelize.STRING,
            defaultValue: 'https://www.shutterstock.com/image-vector/music-display-theme-platform-sample-260nw-2248655619.jpg'
        },
        isDeleted: {
            type: Sequelize.BOOLEAN,
            defaultValue: false
          }
        });
        return album;
    }