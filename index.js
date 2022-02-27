require('dotenv').config();
const download = require('image-downloader');
const path = require('path');
var CronJob = require('cron').CronJob;

var job = new CronJob('*/1 * * * *', async function () {
	await screenDownLoad();
});
job.start();

async function screenDownLoad() {
	try {
		let options = {
			url: process.env.URL,
			dest: `${path.join(__dirname, 'images')}/${new Date().getTime()}.jpg`
		};
		await download.image(options)
			.catch((error) => console.log(error))
	} catch (error) {
		console.log(error);
	}
}