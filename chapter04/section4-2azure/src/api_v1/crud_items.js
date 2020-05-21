/**
 * [crud_items.js]
 * encoding=UTF-8
 */
var Factory4Hook = require('../factory4hook.js').Factory4Hook;

var QUERY_CREATE_TABLE = 'CREATE TABLE itemstorage([id] [INTEGER] PRIMARY KEY AUTOINCREMENT NOT NULL, [user] [TEXT] NOT NULL, [created_at] [TEXT] NOT NULL, [updated_at] [TEXT] NOT NULL, [rawtext] [TEXT] NOT NULL )';
var QUERY_INSERT_ITEM = 'INSERT INTO itemstorage(user, created_at, updated_at, rawtext) VALUES( ?, ?, ?, ? )';
var QUERY_UPDATE_ITEM = 'UPDATE itemstorage SET rawtext=?, updated_at=? WHERE [id] = ?';
var QUERY_ENUMERATE_ITEMS_BY_ID = 'SELECT id, user, created_at, updated_at, rawtext FROM itemstorage WHERE [id] = ?';
var QUERY_ENUMERATE_ITEMS_ON_USER = 'SELECT id, user, created_at, updated_at, rawtext FROM itemstorage WHERE [user] = ?';
var QUERY_ENUMERATE_ITEMS_ON_USER_AND_TEXT = 'SELECT id, user, created_at, updated_at, rawtext FROM itemstorage WHERE [user] = ? AND [rawtext] = ?';
var QUERY_DELETE_ITEM_BY_ID = 'DELETE FROM itemstorage WHERE [id] = ?';
var SQLITE_DATABASENAME = './db/mydb.sqlite3'; // node.exe server.jsの位置からの相対パスで指定。
exports.QUERY_CREATE_TABLE = QUERY_CREATE_TABLE;
exports.QUERY_INSERT_ITEM = QUERY_INSERT_ITEM;


var sqlite3 = new Factory4Hook(require('sqlite3'));


var _openSqlite3 = function ( databaseName ) {
    return new Promise(function(resolve,reject){
        var sqlite = sqlite3.getInstance().verbose();
        var db = new sqlite.Database( databaseName, (err)=>{
            if( !err ){
                resolve( db );
            }else{
                reject(err);
            }
        });
    });
};
var _closeSqlite3 = function (db) {
    return new Promise(function(resolve,reject){
		db.close((err)=>{
			if(!err){
				resolve();
			}else{
				reject(err);
			}
		});
    });
};
var openSqlite3 = new Factory4Hook(_openSqlite3);
var closeSqlite3 = new Factory4Hook(_closeSqlite3);
if( process.env.NODE_ENV == 'test' ){
    exports.openSqlite3 = openSqlite3;
    exports.closeSqlite3 = closeSqlite3;
}
var _querySqlite3 = function (db, queryText, params) {
    return new Promise(function (resolve,reject) {
        db.all(
            queryText, 
            params, 
            function (err, rows){
                if(!err){
                    resolve({
                        'db' : db,
                        'rows' : rows
                    });
                }else{
                    reject({
                        'db' : db,
                        'err' : err
                    });
                }
            }
        );
    });
};


var _countExistItems = function (db, userName) {
    return _querySqlite3(
            db,
            'SELECT count(*) FROM itemstorage WHERE [user] = ?',
            [userName]
    ).catch((result)=>{
        var db = result.db;
        var err = result.err;
        var errMessage = err.message;

        if( -1 < errMessage.indexOf("no such table") ){
            return _querySqlite3(
                db,
                QUERY_CREATE_TABLE,
                []
            );
        }else{
            return Promise.reject(result);
        }
    }).then((result)=>{
        var numberOfExistItems = (result.rows.length==1) ? result.rows[0]['count(*)'] : 0;
        result['numberOfExistItems'] = numberOfExistItems;
        return Promise.resolve(result);
    });
};


var _insertItemAndGetId = function (db, userName, create, update, text) {
    return _querySqlite3(
        db,
        QUERY_INSERT_ITEM,
        [userName, create, update, text]
    ).then(()=>{
        return _querySqlite3(
            db,
            QUERY_ENUMERATE_ITEMS_ON_USER_AND_TEXT,
            [userName, text]
        );
    });
};
var _insertOrNoteiceExist = function (db, userName, create, update, text, existedRows, numberOfExistItems) {
    var closeDb = closeSqlite3.getInstance();

    if(existedRows.length == 0){
        return _insertItemAndGetId(
            db, userName, create, update, text
        ).then((result)=>{
            var rows = result.rows;
            return closeDb(db)
            .then(()=>{
                return Promise.resolve({
                    'status' : 201,
                    'jsonData' : {
                        items : [{
                            'id' : rows[0].id,
                            'text' : text,
                            'create' : create,
                            'update' : update
                        }],
                        user : userName,
                        number_of_items : numberOfExistItems + 1
                    }
                });
            });
        });
    }else{
        // existedRows.length > 0
        return Promise.resolve({
            'status' : 409,
            'jsonData' : {
                message: 'the item is already exist. if you want to edit, you should update command with the target id.',
                items : [{
                    'id' : existedRows[0].id,
                    'text' : existedRows[0].rawtext,
                    'create' : existedRows[0].create_at,
                    'update' : existedRows[0].updated_at
                }],
                user : userName,
                number_of_items : numberOfExistItems
            }
        });
    }    
};

var createItemAtUserName = function (userName, dataObj) {
    var openDb = openSqlite3.getInstance();
    var closeDb = closeSqlite3.getInstance();
    var text = dataObj.text;
    var create = dataObj.create;
    var update = dataObj.update;

    // console.log('create item [' + text + '] at ' + userName);

    var promise = openDb(SQLITE_DATABASENAME);
    promise = promise.then((db)=>{
        return _countExistItems(db, userName);
    }).then((result)=>{
        var db = result.db;
        var numberOfExistItems = result.numberOfExistItems;
        
        // ToDo：データ数の上限、に対する応答。

        return _querySqlite3(
            db,
            QUERY_ENUMERATE_ITEMS_ON_USER_AND_TEXT,
            [userName, text]
        ).then((result2)=>{
            var rows = result2.rows;
            return _insertOrNoteiceExist(
                db, 
                userName, create, update, text, 
                rows, numberOfExistItems
            );
        });
    }).catch((err)=>{
        if( err.db ){
            closeDb(err.db);
            err = err.err; // 中身を取り出す
        }
        return Promise.resolve({
            'status' : 500,
            'jsonData' : {
                err : err
            }
        });
    });
    return promise;
}
exports.createItemAtUserName = createItemAtUserName;


var enumerateItemsByUserName = function ( userName ) {
    var openDb = openSqlite3.getInstance();
    var closeDb = closeSqlite3.getInstance();

    // console.log("enumerate items by :id = " + userName );
    var promise = openDb(SQLITE_DATABASENAME);
    promise = promise.then((db)=>{
        return _querySqlite3(
            db,
            QUERY_ENUMERATE_ITEMS_ON_USER,
            [userName]
        );
    }).catch(err => {
        var db = err.db;
        var errorObject = err.err;
        var errMessage = errorObject.message;

        if( -1 < errMessage.indexOf("no such table") ){
            return Promise.resolve({
                'db' : db,
                'rows' : []
            });
        }else{
            return Promise.reject(err);
        }
    }).then((result)=>{
        var db = result.db;
        var rows = result.rows;
        var i=0, length = rows.length;
        var list = [];
        var item;

        while(i<length){ //順序を変更しない。
            item = rows[i];
            list.push({
                id : item.id,
                text : item.rawtext,
                create : item.created_at,
                update : item.updated_at
            });
            i++;
        }

        return closeDb(db).then(()=>{
            return Promise.resolve({
                'status' : 200,
                'jsonData' : {
                    items : list,
                    user : userName
                }
            });
        });
    }).catch((err)=>{
        if( err.db ){
            closeDb(err.db); // 終了タイミングは無視してよい。
            err = err.err; // 中身を取り出す
        }
        return Promise.resolve({
            'status' : 500,
            'jsonData' : {
                err : err
            }
        });
    });
    return promise;
};
exports.enumerateItemsByUserName = enumerateItemsByUserName;



var updateItemAtUserName = function (userName, dataObj, itemId) {
    var openDb = openSqlite3.getInstance();
    var closeDb = closeSqlite3.getInstance();

    var text = dataObj.text;
    var create = dataObj.create;
    var update = dataObj.update;

    var promise = openDb(SQLITE_DATABASENAME);
    promise = promise.then((db)=>{
        return _querySqlite3(
            db,
            QUERY_ENUMERATE_ITEMS_BY_ID,
            [ itemId ]
        );
    }).then((result)=>{
        var db = result.db;
        return _querySqlite3(
            db,
            QUERY_UPDATE_ITEM,
            [ text, update, itemId ]
        );
    }).then((result)=>{
        var db = result.db;
        return closeDb(db)
        .then(()=>{
            return Promise.resolve({
                'status' : 200,
                'jsonData' : {
                    items : [{
                        'id' : itemId,
                        'text' : text,
                        'create' : create,
                        'update' : update
                    }],
                    user : userName
                }
            });
        });
    });

    return promise;
};
exports.updateItemAtUserName = updateItemAtUserName;


var deleteItemAtUserName = function (userName, itemId) {
    var openDb = openSqlite3.getInstance();
    var closeDb = closeSqlite3.getInstance();

    var promise = openDb(SQLITE_DATABASENAME);
    promise = promise.then((db)=>{
        return _querySqlite3(
            db,
            QUERY_ENUMERATE_ITEMS_BY_ID,
            [ itemId ]
        );
    }).then((result)=>{
        var db = result.db;
        var rows = result.rows;

        if(rows.length != 1 || rows[0].user != userName){
            return closeDb(db)
            .then(()=>{
                return Promise.resolve({
                    'status' : 404,
                    'jsonData' : {
                        message: 'the item is not found.',
                        items: [],
                        user: userName
                    }
                });
            });
        }

        return _querySqlite3(
            db,
            QUERY_DELETE_ITEM_BY_ID,
            [ itemId ]
        ).then(()=>{
            return closeDb(db)
            .then(()=>{
                return Promise.resolve({
                    'status' : 200,
                    'jsonData' : {
                        items : [],
                        user : userName
                    }
                });
            });
        });
    });

    return promise;

};
exports.deleteItemAtUserName = deleteItemAtUserName;


