/**
 * [api_v1.js]
 * encoding=UTF-8
 */

var express = require('express');
var router = express.Router();

var Factory4Hook = require('../factory4hook.js').Factory4Hook;

var itemsSingleton = new Factory4Hook(require('../api_v1/crud_items'));

if( process.env.NODE_ENV == 'test' ){
	// routerの場合は、module.exports がそのまま
    // routerで置き換えらえる仕様なので、
	// 個別では無くて、 routerに対してプロパティを足すことで対応する。
	router['itemsSingleton'] = itemsSingleton;
}

router.get('/users/:userId/items', function (req, res) {
	var enumerateItemsByUserName 
    = itemsSingleton.getInstance().enumerateItemsByUserName;

	var userName = req.params.userId;
	var query = req.query;
	var promise = enumerateItemsByUserName( userName, query );

	var headers = req.headers;
	res.header({
        "Access-Control-Allow-Origin" : "*", // JSONはクロスドメインがデフォルトNG。
		"Pragma" : "no-cacha", 
		"Cache-Control" : "no-cache",
		"Content-Type" : "application/json; charset=utf-8"
	});

    promise.then(function (result) {
		res.status(result.status).send(result.jsonData);
		res.end();
	}).catch((err)=>{
		res.status(500).send(err);
		res.end();
	});
});

module.exports = router;
