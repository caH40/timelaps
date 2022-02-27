require('dotenv').config();
const download = require('image-downloader');
const path = require('path');
var CronJob = require('cron').CronJob;
var index = 0;
var job = new CronJob('*/3 * * * *', async function () {
	index++
	await screenDownLoad(index, 'images/web1', process.env.URL_WEB1);
	await screenDownLoad(index, 'images/web5', process.env.URL_WEB5);
});
job.start();

async function screenDownLoad(index, dir, url) {
	try {
		let options = {
			url: url,
			dest: `${path.join(__dirname, dir)}/${index}.jpg`
		};
		await download.image(options)
			.catch((error) => console.log(error))
	} catch (error) {
		console.log(error);
	}
}