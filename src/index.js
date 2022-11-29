// Load dotenv package
require('dotenv').config();

// Load required module
const fs = require('fs');
const path = require('path');
const url = require('url');
const Jimp = require('jimp');


const express = require('express');
const app = express();

// Use cors middleware to allow/disallow 
const cors = require('cors');
const corsOptions = {
	origin: process.env.APP_ORIGIN && process.env.APP_ORIGIN != '*' ? process.env.APP_ORIGIN.split(',') : '*',
	optionsSuccessStatus: 200
};
app.use(cors(corsOptions));

// error handler
app.use(function (err, req, res, next) {
	filePath = path.join(__dirname, process.env.DEFAULT_IMAGE);
	// Display default image if there is error
	res.sendFile(filePath);
});


app.get('/resize', (req, res) => {

    const outputFile = `public/thumb/default.png`;

    const height = parseInt(req.query.height) || 0; // Get height from query string
	const width = parseInt(req.query.width) || 0; // Get width from query string
	const quality = parseInt(req.query.quality) < 100 ? parseInt(req.query.quality) : 99; // Get quality from query string

    Jimp.read(path.resolve(`public/images/default.png`))
		.then(lenna => {

			lenna.resize(width, height); // resize
			if(req.query.quality) lenna.quality(req.query.quality); // set JPEG quality

			lenna.write(path.resolve(outputFile), () => {
				fs.createReadStream(path.resolve(outputFile));//.pipe(res);
			}); // save and display
            res.sendFile(path.resolve(outputFile));
		})
		.catch((err) => {
            console.log(err);
			// res.sendFile(path.resolve(`public/images/${file}`));
            res.send('error');
		});
});

app.get('/assets/:path', async function (req, res) {

	// Remove headers info
	res.removeHeader('Transfer-Encoding');
	res.removeHeader('X-Powered-By');

	const query = url.parse(req.url, true).query;
	let file = url.parse(req.url).pathname;
	let filePath = path.join(__dirname, '../', `public/images/${file}`);

	if (!fs.existsSync(filePath)) {
		file = process.env.DEFAULT_IMAGE;
		filePath = path.join(__dirname, '../', `public/images/${file}`);
	}

	const height = parseInt(query.h) || 0; // Get height from query string
	const width = parseInt(query.w) || 0; // Get width from query string
	const quality = parseInt(query.q) < 100 ? parseInt(query.q) : 99; // Get quality from query string

	const folder = `q${quality}_h${height}_w${width}`;
	const out_file = `public/thumb/${folder}/${file}`;
	if (fs.existsSync(path.resolve(out_file))) {
		res.sendFile(path.resolve(out_file));
		return;
	}

	// If no height or no width display original image
	if (!height || !width) {
		res.sendFile(path.resolve(`public/images/${file}`));
		return;
	}

	// Use jimp to resize image
	Jimp.read(path.resolve(`public/images/${file}`))
		.then((response) => {

			response.resize(width, height); // resize
			response.quality(quality); // set JPEG quality

			response.write(path.resolve(out_file), () => {
				fs.createReadStream(path.resolve(out_file)).pipe(res);
			}); // save and display
		})
		.catch(err => {
			res.sendFile(path.resolve(`public/images/${file}`));
		});

});



app.listen(process.env.PORT || 3000);