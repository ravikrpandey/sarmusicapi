module.exports = (sequelize, Sequelize) => {
  const tbl_loginUser = sequelize.define('user', {
    userId: {
      type: Sequelize.INTEGER,
      autoIncrement: true,
      primaryKey: true
    },
    mobileNumber: {
      type: Sequelize.STRING,
      unique: true
    },
    userName: {
      type: Sequelize.STRING
    },
    otp: {
      type: Sequelize.STRING
    },
    lastLogin: {
      type: Sequelize.STRING
    },
    type: {
      type: Sequelize.STRING
    },
    email: {
      type: Sequelize.STRING
    },
    isDeleted: {
      type: Sequelize.BOOLEAN,
      defaultValue: false
    }
  });
  return tbl_loginUser
}