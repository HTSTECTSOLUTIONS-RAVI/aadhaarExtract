const express = require('express')
const multer = require('multer')
const router = express.Router()

const T = require('tesseract.js')

const fs = require('fs');
const uploadDirectory = 'uploads/';

if (!fs.existsSync(uploadDirectory)) {
    fs.mkdirSync(uploadDirectory)
}

const storage = multer.diskStorage({
    destination: (req, res, cb) => {
        cb(null, uploadDirectory)
    },
    filename: (req, file, cb) => {
        cb(null, file.originalname)
    }
})

const upload = multer({ storage })

router.post('/upload-file', upload.single('file'), (req, res) => {
    const file = req.file
    const hostname = req.hostname

    let fullPath = ''

    if (hostname == 'localhost') {
        fullPath = `http://${hostname}:3000/${uploadDirectory}${file.filename}`
    } else {
        fullPath = `http://${hostname}/${uploadDirectory}${file.filename}`
    }

    const filePath = `${uploadDirectory}${file.filename}`

    T.recognize(fullPath, 'eng', { logger: e => { } })
        .then((response) => {

            const aadharPattern = /\d{4}?\s?\d{4}\s?\d{4}/;
            const aadharMatches = response.data.text.match(aadharPattern)

            if (aadharMatches) {
                const aadharNumber = aadharMatches[0].replace(/\s/g, '');

                if (fs.existsSync(filePath)) {
                    fs.unlink(filePath, (err) => {
                        if (err) {
                            res.status(500).send('Error deleting file ')
                        }
                        res.status(200).send({ aadharNumber })
                    })
                } else {
                    res.status(404).send('File not found');
                }

            } else {
                if (fs.existsSync(filePath)) {
                    fs.unlink(filePath, (err) => {
                        if (err) {
                            res.status(500).send('Error deleting file ')
                        }
                        res.status(200).send({ error: 'Aadhar number not found in the text.' })
                    })
                } else {
                    res.status(404).send('File not found');
                }
            }
        })
        .catch((err) => {
            console.log(err)
        })


})

module.exports = router

