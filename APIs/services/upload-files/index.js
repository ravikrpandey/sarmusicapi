const multer = require('multer')
const Router = require("express").Router();
const path = require('path');
const fs = require('fs');
const { v4: uuidv4 } = require('uuid');
const baseUrl = process.env.BASE_URL;
require('dotenv').config();
const baseDirectory = path.join(__dirname, 'uploaded-local-files');


const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const uploadDir = path.join(__dirname, '/uploaded-local-files');
        // Create the directory if it doesn't exist
        if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir);
        }
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        const uniqueFileName = uuidv4() + path.extname(file.originalname);
        cb(null, uniqueFileName);
    },
});

const upload = multer({
    storage: storage,
    limits: {
        fileSize: 1 * 1024 * 1024, // 1MB file size limit
    },
});

const processFile = (file, songTitle, res) => {
    const matches = file.match(/^data:([a-zA-Z0-9+\/.-]+);base64,([a-zA-Z0-9+/=]+)$/);
    if (!matches || matches.length !== 3) {
        return res.status(400).send({ code: 400, message: "Invalid base64 input string" });
    }

    let mimeType = matches[1];
    let extension = mimeType.split('/')[1].split('+')[0];
    
    if (extension === 'vnd.openxmlformats-officedocument.wordprocessingml.document') {
        extension = 'docx';
    } else if (extension === 'vnd.openxmlformats-officedocument.spreadsheetml.sheet') {
        extension = 'xlsx';
    }

    const fileName = `${Date.now()}-${songTitle.replace(/ /g, "_")}.${extension}`;
    saveBase64File(matches[2], baseDirectory, fileName);

    const finalFilePath = `${baseUrl}/uploaded-local-files/${fileName}`;
    return finalFilePath;
};

// Function to save base64 file
const saveBase64File = (base64Data, directory, fileName) => {
    try {
        if (!fs.existsSync(directory)) {
            fs.mkdirSync(directory, { recursive: true });
        }

        const filePath = path.join(directory, fileName);
        const imageBuffer = Buffer.from(base64Data, 'base64');
        
        fs.writeFileSync(filePath, imageBuffer);
    } catch (error) {
        console.error('Error saving base64 image:', error);
        throw new Error('Failed to save image');
    }
};



module.exports = {
    upload,
    processFile
};