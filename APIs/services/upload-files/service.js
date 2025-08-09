const path = require('path');
const fs = require('fs');
const {processFile} = require('../upload-files/index')
const baseDirectory = path.join(__dirname, 'uploaded-local-files');
const getFileUri = async (req, res) => {
    const fileName = req.params.fileName;
    if (!fileName || fileName === 'undefined') {
        const filePath = path.join(__dirname, '/uploaded-local-files', 'logo512.png');
        if (fs.existsSync(filePath)) {
            // Serve the file
            return res.sendFile(filePath);
        } else {
            return res.status(404).json({ success: false, message: 'File not found' });
        }
    };

    const filePath = path.join(__dirname, '/uploaded-local-files', fileName);

    try {
        // Check if the file exists
        if (fs.existsSync(filePath)) {
            // Serve the file
            return res.sendFile(filePath);
        } else {
            return res.status(404).json({ success: false, message: 'File not found' });
        }
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error?.message || 'Internal server error',
        });
    }
}



const saveFileAndGetName = async (req, res, next) => {
    try {
        const fileName = req.file.filename;
        res.json({ success: true, data: { fileName } })
    } catch (error) {
        return res.json({ success: false, message: error?.message || "Something went wrong, Try again later!" })
    }
}
const saveFileAndGetNameByBase64 = async (file, songTitle, res) => {
    try {
        return await processFile(file, songTitle, res);
    } catch (error) {
        return res.json({ success: false, message: error?.message || "Something went wrong, Try again later!" })
    }
}



module.exports = {
    saveFileAndGetName,
    getFileUri,
    saveFileAndGetNameByBase64
}