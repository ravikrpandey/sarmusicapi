const express = require("express");
const path = require("path");
const cors = require("cors");
const http = require("http");

const dotenv = require("dotenv");
var bodyParser = require("body-parser");

global.__basedir = __dirname;
dotenv.config();

const app = express();
app.use(bodyParser.json({ limit: "1000mb" }));
app.use(bodyParser.urlencoded({ extended: true, limit: "1000mb" }));

app.use(express.json());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use(function (req, res, next) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  res.setHeader("Access-Control-Allow-Credentials", true);
  next();
});

//================= Cors ===================//

const corsOpts = {
  origin: "*",
  methods: ["GET", "PATCH", "POST", "PUT", "DELETE"],
  allowedHeaders: ["Content-Type"],
};
app.use(cors(corsOpts));

app.use("/upload", express.static("./upload"));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.urlencoded({ extended: true }));

// database
const db = require("./IndexFiles/modelsIndex");
const Role = db.role;

//========== DB Sync ==========//

// db.sequelize
//   .sync()
//   .then(() => {
//     console.log("Synced db success...");
//   })
//   .catch((err) => {
//     console.log("Failed to sync db...", err.message);
//   });

//============ Express ===========//

app.get("/", (req, res) => {
  res.json({ message: "Welcome to the SARMUSIC Back-End!" });
});

// Serve static files from the uploaded-local-files directory
app.use('/uploaded-local-files', express.static(path.join(__dirname, '/APIs/services/upload-files/uploaded-local-files')));


//===================== Serve static files ========================//

app.use(express.static("public"));


//================= Router ==================//


require("./APIs/Artist/route")(app);
require("./APIs/Login/route")(app);
require("./APIs/Album/albumRoute")(app);
require("./APIs/Playlist/playlistRoute")(app);
require('./APIs/PlaylistSong/playlistSongRoute')(app);
require("./APIs/Song/songRoute")(app);
require("./APIs/UserActivity/userActivityRoute")(app)



//================== Server ==================//

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}.`);
});
