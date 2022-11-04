const TelegramApi = require('node-telegram-bot-api');
const express = require('express');
const qrcode = require('qrcode');
const axios = require('axios');
const config = require('./config');

const app = express();
const urlencodedParser = express.urlencoded({extended: false}); // Data parser
const bot = new TelegramApi(config.botToken, { polling: true });

// Bot logic
bot.onText(/\/start/, async (msg) => {
    await bot.sendMessage(msg.chat.id, 'Welcome! I`am telegram bot. Please enter the data in the format "date(dd.mm)/amount/name" for information.');
});

bot.onText(/\d{1,2}\.\d{1,2}\/[+-]?([0-9]*[.,])?[0-9]+\/[A-zА-я]+/g, async (msg) => { // For messages with the Date format
    const chatId = msg.chat.id;
    const paymentData = msg.text.split('/');
    let [date, amount, name] = paymentData;
    date += '.' + new Date().getFullYear();
		
		if(+amount < 0){ // For a negative payment amount
			return await bot.sendMessage(chatId, 'The amount cannot be less than 0!');
		}
		else if(amount.includes(',')){
			return await bot.sendMessage(chatId, `The amount should be separated by a dot, not a comma (${amount.replace(',', '.')})`);
		}
		
		// Copy object from cfg file
		let _qld = JSON.stringify(config.quickLinksData);
		let qlData = JSON.parse(_qld);

    qlData.QuickLinkRequest.Details.Desc = `${date} ${name}`;
    qlData.QuickLinkRequest.Details.Amount = amount;
    qlData.QuickLinkRequest.Details.FullName = name;

		await axios.post(config.createQlAddr, qlData)
		.then(async (response) => {
			let qrUrl = response.data.QuickLinkResponse.URL;

			qrcode.toDataURL(qrUrl, async function (err, url) {
				let base64Url = url.replace(new RegExp(`.*?${','}(.*)`), '$1')
				await bot.sendPhoto(chatId, Buffer.from(base64Url, 'base64'));
			});
		})
		.catch(async (error) => {
			console.log('Error: ', error);
    	await bot.sendMessage(chatId, 'An error occurred when creating a QR code. Please try again.');
		});
    
});

// Express server logic
app.listen(config.port, async () => console.log(`App listening on port ${config.port}`))

// Endpoints
app.post('/', urlencodedParser, (req, res) => {
    if(!request.body) return response.sendStatus(400);
    res.send(`Some text ${req.body}`)
})

