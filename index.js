const TelegramApi = require('node-telegram-bot-api');
const express = require('express');
const dotenv = require('dotenv').config().parsed;
const Telr = require('./clients/telr');
const moment = require('moment');

const app = express();
const urlencodedParser = express.urlencoded({extended: false});
const xmlparser = require('express-xml-bodyparser'); // Для API GetTransaction https://secure.telr.com/tools/api/xml/transaction/030029586658
app.use(xmlparser());

const bot = new TelegramApi(dotenv.TELEGRAM_BOT_TOKEN, { polling: true });
const telr = new Telr(dotenv.AUTH_KEY, dotenv.STORE_ID, dotenv.CREATE_QUICKLINK_API);
const botName = dotenv.TELEGRAM_BOT_NAME;

// Bot logic
bot.onText(/\/start/, async (msg) => {
  await bot.sendMessage(msg.chat.id, 'Привет! Я Телеграм бот для генерации qr-кода для оплаты услуг и товаров. Пожалуйста, введите данные в формате "дата(дд.мм)/сумма/имя" для создания ссылки на оплату.');
});

bot.onText(RegExp(/\b\s\d{1,2}\.\d{1,2}\/[+-]?([0-9]*[.,])?[0-9]+\/[A-zА-я]+/g), async (msg) => { // For messages with the Date format
  const chatId = msg.chat.id;
  const data = msg.text.split(' ');

  if(data[0] !== botName) return;

  const paymentData = data[1].split('/');
  let [date, amount, name] = paymentData;
  date += '.' + new Date().getFullYear();
  
  if(!moment(date, 'DD.MM.YYYY', true).isValid()){
    console.log('The entered date is not valid', date);
    return await bot.sendMessage(chatId, `Ведённая дата (${date}) не существует. Проверьте правильность даты и повторите попытку снова!`);
  }
  
  // For a negative payment amount
  if(+amount < 0){ 
    return await bot.sendMessage(chatId, 'Сумма платежа не может быть меньше 0!');
  }
  if(amount.includes(',')){
    return await bot.sendMessage(chatId, `Указанная сумма должна быть разделена точкой, а не запятой (${amount.replace(',', '.')})`);
  }

  let qlData = await telr.createQuickLink([date, amount, name]);
  let opts = {'caption': qlData.url.replace('_', '\\_'), 'parse_mode': 'markdown'}; // The '_' character must be escaped, otherwise there will be an error
  await bot.sendPhoto(chatId, qlData.qrCode, opts);
});

// Endpoints
app.get('/', (request, response) => {
  if(!request.body) return response.sendStatus(400);
  console.log('Get request: ', request.body);
  response.send(`Body - ${request.body}`)
})

app.post('/', urlencodedParser, (request, response) => {
  if(!request.body) return response.sendStatus(400);
  console.log('Post request: ', request.body);
  response.send(`Body - ${request.body}`)
})

// Express server logic
app.listen(dotenv.EXPRESS_PORT, async () => console.log(`App listening on port ${dotenv.EXPRESS_PORT}`))
