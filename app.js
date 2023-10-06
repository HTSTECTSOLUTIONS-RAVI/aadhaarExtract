const express = require('express')
const bodyParser = require('body-parser')
const app = express()

const ExtractImage = require('./routes/extractImage')

const port = 3000


app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true }))

// app.use(upload.array())
app.use('/uploads', express.static('uploads'))


app.use('/extract-image', ExtractImage)


app.post('/extract', (req, res) => {

    const { imageUrl } = req.body
    console.log(imageUrl)

    T.recognize(imageUrl, 'eng', { logger: e => { } })
        .then((out) => {

            const aadharPattern = /\d{4}?\s?\d{4}\s?\d{4}/;
            const aadharMatches = out.data.text.match(aadharPattern)

            if (aadharMatches) {
                const aadharNumber = aadharMatches[0].replace(/\s/g, '');
                res.send({ aadharNumber, imageUrl })
            } else {
                console.log('Aadhar number not found in the text.');
            }
        })
        .catch((err) => {
            console.log(err)
        })
})


app.listen(port, () => {
    console.log(`${port}`)
})