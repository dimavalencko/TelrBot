const TelegramApi = require('node-telegram-bot-api');
const express = require('express');
const dotenv = require('dotenv').config().parsed;
const Telr = require('./clients/telr');

const app = express();
const urlencodedParser = express.urlencoded({extended: false}); // Data parser
const bot = new TelegramApi(dotenv.TELEGRAM_BOT_TOKEN, { polling: true });
const telr = new Telr(dotenv.AUTH_KEY, dotenv.STORE_ID, dotenv.CREATE_QUICKLINK_API);

const inputDataRgx = new RegExp("/\d{1,2}\.\d{1,2}\/[+-]?([0-9]*[.,])?[0-9]+\/[A-zА-я]+/",);

// Bot logic
bot.onText(/\/start/, async (msg) => {
    await bot.sendMessage(msg.chat.id, 'Привет! Я Телеграм бот для генерации qr-кода для оплаты услуг и товаров. Пожалуйста, введите данные в формате "дата(дд.мм)/сумма/имя" для создания ссылки на оплату.');
});

bot.onText(/\d{1,2}\.\d{1,2}\/[+-]?([0-9]*[.,])?[0-9]+\/[A-zА-я]+/g, async (msg) => { // For messages with the Date format
    const chatId = msg.chat.id;
    const paymentData = msg.text.split('/');
    let [date, amount, name] = paymentData;
    date += '.' + new Date().getFullYear();
    
    // For a negative payment amount
    if(+amount < 0){ 
        return {error: 'The amount cannot be less than 0!'};
    }
    if(amount.includes(',')){
        return {error: `The amount should be separated by a dot, not a comma (${amount.replace(',', '.')})`};
    }

    const qrLink = await telr.createQuickLink([date, amount, name]);
	await bot.sendPhoto(chatId, qrLink);
});

// Express server logic
app.listen(dotenv.EXPRESS_PORT, async () => console.log(`App listening on port ${dotenv.EXPRESS_PORT}`))

// Endpoints
app.post('/', urlencodedParser, (req, res) => {
    if(!request.body) return response.sendStatus(400);
    res.send(`Some text ${req.body}`)
})

