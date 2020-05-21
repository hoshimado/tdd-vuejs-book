/**
 * [api_v1.js]
 * encoding=UTF-8
 */

var express = require('express');
var router = express.Router();

var Factory4Hook = require('../factory4hook.js').Factory4Hook;

var itemsSingleton = new Factory4Hook(require('../api_v1/crud_items'));

if( process.env.NODE_ENV == 'test' ){
	// routerの場合は、module.exports がそのままrouterで
    // 置き換えらえる仕様なので、
	// 個別では無くて、 routerに対してプロパティを足すことで対応する。
	router['itemsSingleton'] = itemsSingleton;
}

router.get('/users/:userId/items', function (req, res) {
    return Promise.resolve();
});

module.exports = router;
