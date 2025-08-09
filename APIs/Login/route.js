const sarMusic = require("../Login/controller");
const {authenticateToken} = require('../../config/jwt-auth');


module.exports = app => {
    app.post("/api/loginUser",sarMusic.loginOrRegisterUser);
    app.get("/api/getLoginUser", authenticateToken, sarMusic.getLoginUser);
}
