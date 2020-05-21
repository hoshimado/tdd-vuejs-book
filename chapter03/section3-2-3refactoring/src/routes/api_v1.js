/**
 * [api_v1.js]
 * encoding=UTF-8
 */

var express = require('express');
var router = express.Router();

var Factory4Hook = require('../factory4hook.js').Factory4Hook;

var itemsSingleton = new Factory4Hook(require('../api_v1/crud_items'));
// var items = require('../api_v1/items');

if( process.env.NODE_ENV == 'test' ){
	// routerの場合は、module.exports がそのまま
    // routerで置き換えらえる仕様なので、
	// 個別では無くて、 routerに対してプロパティを足すことで対応する。
	router['itemsSingleton'] = itemsSingleton;
}

router.use('/', function (req, res, next) {
	var headers = req.headers;

	// 共通処理はここで実施
	res.header({
        "Access-Control-Allow-Origin" : "*", // JSONはクロスドメインがデフォルトNG。
		"Pragma" : "no-cacha", 
		"Cache-Control" : "no-cache",
		"Content-Type" : "application/json; charset=utf-8"
	});

	// 次の定義ルーターへ処理を継続する。
	next();
});

var _sendResponseAferPromise = function (targetPromise, res) {
	return targetPromise.then(function (result) {
		res.status(result.status).send(result.jsonData);
		res.end();
	}).catch((err)=>{
		res.status(500).send(err);
		res.end();
	});
};

// `/api/v1` continuing...
// router.get('/users/USER-NAME/items', function (req, res) {
router.get('/users/:userId/items', function (req, res) {
	var enumerateItemsByUserName 
    = itemsSingleton.getInstance().enumerateItemsByUserName;

	var userName = req.params.userId;
	var query = req.query;
	var promise = enumerateItemsByUserName( userName, query );

	_sendResponseAferPromise(promise, res);
});

module.exports = router;
