const username = 'prodanceshop@mail.ru';
const password = '25120301Exs';
const authKey = 'ztTK^T94m3-JX6Xh';
const storeId = '26744';

const authorizationAddr = 'https://secure.telr.com/merchant/index.html';
const createQlAddr = 'https://secure.telr.com/gateway/api_quicklink.json';

// Data for authorization
let authFormData = new FormData();
authFormData.append('brand', 'telr');
authFormData.append('lang', 'en');
authFormData.append('username', username);
authFormData.append('password', password);
authFormData.append('email_id', '');

// Data for create QuickLink (for https://secure.telr.com/gateway/api_quicklink.json)
const quickLinksData = {
	"QuickLinkRequest": {
		"StoreID": storeId,
		"AuthKey": authKey,
		"Details": {
			"Desc": "",
			"Cart": "",
			"Currency": "AED",
			"Amount": "",
			"MinQuantity": "1",
			"MaxQuantity": "1",
			"FullName": "",
			"Addr1": "",
			"City": "",
			"Country": "RU",
			"Email": "",
			"Phone": ""
		},
		"VariableValueMode": {
			"Status": "",
			"SectionTitle": ""
		},
		"RepeatBilling": {
			"Status": "",
			"Amount": "",
			"Period": "",
			"Interval": "",
			"Start": "",
			"Term": "",
			"Final": ""
		},
		"Availability": {
			"NotValidBefore": {
				"Day": "",
				"Month": "",
				"Year": ""
			},
			"NotValidAfter": {
				"Day": "",
				"Month": "",
				"Year": ""
			},
			"StockControl": "1",
			"StockCount": "5"
		}
	}
}

// Http reqest headers
const headers = {
	'Access-Control-Allow-Origin': '*',
	'Host': 'secure.telr.com',
	'Accept': '*/*',
	'Connection': 'keep-alive',
	'WithCredintails': 'true',
}

module.exports = Object.freeze({
    // Telegram settings
    botToken: '5731903913:AAFJ6eM0_GJjeMzCHAdM6mRGdxaN1DjSgr8',
    groupId: '-888346737',

    // Express server parameters
    port: '8080',

    // Telr auth data
    username: username,
    password: password,
    authFormData,
    headers,
    storeId,
    authKey,

		// QuickLinks
    quickLinksData,
		createQlAddr,
});