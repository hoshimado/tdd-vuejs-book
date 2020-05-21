/**
 * [crud_items.spec.js]
 */
var chai = require('chai');
var expect = chai.expect;
var sinon = require('sinon');
var shouldFulfilled = require('promise-test-helper').shouldFulfilled;
var shouldRejected  = require("promise-test-helper").shouldRejected;

var sqlite3 = require('sqlite3');

var crudItems = require('../../src/api_v1/crud_items');



describe('crud_items.spec.js', () => {
    var TESTING_USER = '対象のユーザー名';
    var EXIST_ITEM1 = {
        "id": 1,
        "text": "既存テキスト１",
        "create": "100",
        "update": "100"
    };
    var EXIST_ITEM2 = {
        "id": 2,
        "text": "既存テキスト２",
        "create": "200",
        "update": "200"
    };

    var _memoryDb = null;
    var _numberOfAlreadyExist = 0;
    var _all = (db, query, params)=>{
        return new Promise((resolve,reject)=>{
            db.all(
                query,
                params,
                (err,rows)=>{
                    if(!err){
                        resolve(rows);
                    }else{
                        reject(err);
                    }
                }
            );
        })
    };
    var _createTestingTable = (db)=>{
        return _all(db, crudItems.QUERY_CREATE_TABLE, [] )
        .then(()=>{
            _numberOfAlreadyExist++;
            return _all(
                db, 
                crudItems.QUERY_INSERT_ITEM, 
                [
                    TESTING_USER, 
                    EXIST_ITEM1.create, 
                    EXIST_ITEM1.update, 
                    EXIST_ITEM1.text
                ]
            );
        }).then(()=>{
            _numberOfAlreadyExist++;
            return _all(
                db, 
                crudItems.QUERY_INSERT_ITEM, 
                [
                    TESTING_USER, 
                    EXIST_ITEM2.create, 
                    EXIST_ITEM2.update, 
                    EXIST_ITEM2.text
                ]
            );
        }).catch((err)=>{
            console.log("[ERROR at create]");
            console.log(err);
        });
    };
    var _createFakeMemoryDb = function (option) {
        return new Promise(function(resolve,reject){
            var sqlite = sqlite3.verbose();
            var db = new sqlite.Database( ':memory:', (err)=>{
                if( !err ){
                    if(option.isTableCreate){
                        _createTestingTable(db).then(()=>{
                            resolve( db );
                        });
                    }else{
                        resolve( db ); // 空のメモリDBを返却する
                    }
                }else{
                    reject(err);
                }
            });
        });
    };
    var _destoryFakeMemoryDb = function (db) {
        return new Promise((resolve,reject)=>{
            db.close(function (err) {
                if(!err){
                    db = null;
                    resolve();
                }else{
                    reject(err);
                }
            });
        });
    };
    var stubOpenSqlite3WithMemoryDb = function ( /* データベース名の引数は無視する */ ) {
        return Promise.resolve(_memoryDb);
    };
    var stubCloseSqlite3WithMemoryDb = function (db) {
        return Promise.resolve(); // 閉じない。閉じちゃうと、メモリーDBが揮発しちゃうので。
    };


    
    describe('deleteItemAtUserName()', ()=>{
        beforeEach(()=>{
            _numberOfAlreadyExist = 0;
            crudItems.openSqlite3.setStub(stubOpenSqlite3WithMemoryDb);
            crudItems.closeSqlite3.setStub(stubCloseSqlite3WithMemoryDb);

            return _createFakeMemoryDb({'isTableCreate': true}).then((db)=>{
                _memoryDb = db;
            });
        });
        afterEach(()=>{
            crudItems.openSqlite3.restoreOriginal();
            crudItems.closeSqlite3.restoreOriginal();

            return _destoryFakeMemoryDb(_memoryDb);
        });

        it('delete a exist item and success wiht status=200.', ()=>{
            var id = 2;
            var deleteItemAtUserName = crudItems.deleteItemAtUserName;

            return shouldFulfilled(
                deleteItemAtUserName(TESTING_USER, id)
                .then((result)=>{
                    return _all(
                        _memoryDb,
                        'SELECT * FROM itemstorage WHERE [id] = "2"',
                        []
                    ).then((rows)=>{
                        return Promise.resolve({
                            funcResult : result,
                            selectedRows : rows
                        });
                    });
                })
            ).then((resultComplex)=>{
                var result = resultComplex.funcResult;
                var rows = resultComplex.selectedRows;
                expect(rows.length).to.be.equals(0);

                expect(result).to.have.property('status', 200);
                expect(result).to.have.property('jsonData').to.deep.equal({
                    items: [],
                    user: TESTING_USER
                });
            });
        });
        it('delete a exist item with invalid username and failed wiht status=404.', ()=>{
            var id = 2;
            var INVALID_USERNAME = TESTING_USER + "ではない不適切なユーザー名";
            var deleteItemAtUserName = crudItems.deleteItemAtUserName;

            return shouldFulfilled(
                deleteItemAtUserName(INVALID_USERNAME, id)
                .then((result)=>{
                    return _all(
                        _memoryDb,
                        'SELECT * FROM itemstorage WHERE [id] = "2"',
                        []
                    ).then((rows)=>{
                        return Promise.resolve({
                            funcResult : result,
                            selectedRows : rows
                        });
                    });
                })
            ).then((resultComplex)=>{
                var result = resultComplex.funcResult;
                var rows = resultComplex.selectedRows;
                expect(rows.length).to.be.equals(1); // 残っている事。

                expect(result).to.have.property('status', 404);
                expect(result).to.have.property('jsonData').to.deep.equal({
                    message: 'the item is not found.',
                    items: [],
                    user: INVALID_USERNAME
                });
            });
        });
    });


    describe('updateItemAtUserName()', ()=>{
        beforeEach(()=>{
            _numberOfAlreadyExist = 0;
            crudItems.openSqlite3.setStub(stubOpenSqlite3WithMemoryDb);
            crudItems.closeSqlite3.setStub(stubCloseSqlite3WithMemoryDb);

            return _createFakeMemoryDb({'isTableCreate': true}).then((db)=>{
                _memoryDb = db;
            });
        });
        afterEach(()=>{
            crudItems.openSqlite3.restoreOriginal();
            crudItems.closeSqlite3.restoreOriginal();

            return _destoryFakeMemoryDb(_memoryDb);
        });

        it('update a exist item and success wiht status=200.', ()=>{
            var INPUT_OBJECT = {
                text : '既存テキスト２更新してみる',
                create : '1000',
                update : '7000'
            };
            var id = 2;
            var updateItemAtUserName = crudItems.updateItemAtUserName;

            return shouldFulfilled(
                updateItemAtUserName(TESTING_USER, INPUT_OBJECT, id)
                .then((result)=>{
                    return _all(
                        _memoryDb,
                        'SELECT * FROM itemstorage WHERE [id] = "2"',
                        []
                    ).then((rows)=>{
                        return Promise.resolve({
                            funcResult : result,
                            selectedRows : rows
                        });
                    });
                })
            ).then((resultComplex)=>{
                var result = resultComplex.funcResult;
                var rows = resultComplex.selectedRows;
                expect(rows.length).to.be.equals(1);

                expect(result).to.have.property('status', 200);
                expect(result).to.have.property('jsonData').to.deep.equal({
                    items: [{ 
                        id : 2,
                        text : INPUT_OBJECT.text,
                        create : INPUT_OBJECT.create,
                        update : INPUT_OBJECT.update
                    }],
                    user: TESTING_USER
                });
            });
        });
    });


    describe('enumerateItemsByUserName()', ()=>{
        beforeEach(()=>{
            _numberOfAlreadyExist = 0;
            crudItems.openSqlite3.setStub(stubOpenSqlite3WithMemoryDb);
            crudItems.closeSqlite3.setStub(stubCloseSqlite3WithMemoryDb);

            return _createFakeMemoryDb({'isTableCreate': true}).then((db)=>{
                _memoryDb = db;
            });
        });
        afterEach(()=>{
            crudItems.openSqlite3.restoreOriginal();
            crudItems.closeSqlite3.restoreOriginal();

            return _destoryFakeMemoryDb(_memoryDb);
        });

        it('list exist items and success wiht status=200.', ()=>{
            var enumerateItemsByUserName = crudItems.enumerateItemsByUserName;

            return shouldFulfilled(
                enumerateItemsByUserName(TESTING_USER)
            ).then((result)=>{
                expect(result).to.have.property('status', 200);
                expect(result).to.have.property('jsonData').to.deep.equal({
                    items: [
                        EXIST_ITEM1,
                        EXIST_ITEM2
                    ],
                    user: TESTING_USER
                });
            });
        });
    });
    describe('enumerateItemsByUserName() - no items.', ()=>{
        it('no items and success with status=200', ()=>{
            var enumerateItemsByUserName = crudItems.enumerateItemsByUserName;

            // beforeEach相当
            _numberOfAlreadyExist = 0;
            crudItems.openSqlite3.setStub(stubOpenSqlite3WithMemoryDb);
            crudItems.closeSqlite3.setStub(stubCloseSqlite3WithMemoryDb);

            return _createFakeMemoryDb({'isTableCreate': false}).then((db)=>{
                _memoryDb = db;
            }).then(()=>{
                return shouldFulfilled(
                    enumerateItemsByUserName(TESTING_USER)
                ).then(result => {
                    expect(result).status(200);
                    expect(result).to.have.property('jsonData').to.have.property('items').to.deep.equal([]);
                    expect(result.jsonData).to.have.property('user').to.equal(TESTING_USER);
                });
            }).finally(()=>{
                // afterEach相当
                crudItems.openSqlite3.restoreOriginal();
                crudItems.closeSqlite3.restoreOriginal();
    
                return _destoryFakeMemoryDb(_memoryDb);
            });
        });
        it('unknow error and failed with status=500', ()=>{
            var enumerateItemsByUserName = crudItems.enumerateItemsByUserName;

            // beforeEach相当
            _numberOfAlreadyExist = 0;
            crudItems.openSqlite3.setStub(stubOpenSqlite3WithMemoryDb);
            crudItems.closeSqlite3.setStub(stubCloseSqlite3WithMemoryDb);
            _memoryDb = null; // これで、意図しないエラーを引き起こす

            return Promise.resolve()
            .then(()=>{
                return shouldFulfilled(
                    enumerateItemsByUserName(TESTING_USER)
                ).then(result => {
                    expect(result).status(500);
                });
            }).finally(()=>{
                // afterEach相当
                crudItems.openSqlite3.restoreOriginal();
                crudItems.closeSqlite3.restoreOriginal();
            });
            // finallyの動作は以下の解説を参照。
            // http://js-next.hatenablog.com/entry/2018/09/05/204052
            // https://developer.mozilla.org/ja/docs/Web/JavaScript/Reference/Global_Objects/Promise/finally
        });
    });


    describe('createItemAtUserName()', ()=>{
        beforeEach(()=>{
            _numberOfAlreadyExist = 0;
            crudItems.openSqlite3.setStub(stubOpenSqlite3WithMemoryDb);
            crudItems.closeSqlite3.setStub(stubCloseSqlite3WithMemoryDb);

            return _createFakeMemoryDb({'isTableCreate': true}).then((db)=>{
                _memoryDb = db;
            });
        });
        afterEach(()=>{
            crudItems.openSqlite3.restoreOriginal();
            crudItems.closeSqlite3.restoreOriginal();

            return _destoryFakeMemoryDb(_memoryDb);
        });


        it('creats a new item, get the id of item, and success with Status=201.', ()=>{
            var INPUT_OBJECT = {
                text : '新しいテキスト',
                create : '1000',
                update : '7000'
            };
            var createItemAtUserName = crudItems.createItemAtUserName;

            return shouldFulfilled(
                createItemAtUserName(TESTING_USER,INPUT_OBJECT)
                .then((result)=>{
                    return _all(
                        _memoryDb,
                        'SELECT * FROM itemstorage WHERE [rawtext] = "新しいテキスト"',
                        []
                    ).then((rows)=>{
                        return Promise.resolve({
                            funcResult : result,
                            selectedRows : rows
                        });
                    });
                })
            ).then((resultComplex)=>{
                var result = resultComplex.funcResult;
                var rows = resultComplex.selectedRows;
                expect(rows.length).to.be.equals(1);
                expect(rows[0]).to.deep.equal({ 
                    id: _numberOfAlreadyExist +1,
                    user: TESTING_USER,
                    created_at: '1000',
                    updated_at: '7000',
                    rawtext: '新しいテキスト' 
                });

                expect(result).to.have.property('status', 201);
                expect(result).to.have.property('jsonData').to.deep.equal({
                    items: [{ 
                        id: _numberOfAlreadyExist +1, // ※ここが一致するのは偶々。
                        text: '新しいテキスト', 
                        create: '1000', 
                        update: '7000' 
                    }],
                    user: TESTING_USER,
                    number_of_items: _numberOfAlreadyExist +1
                });
            });
        });

        it('creats a exist item and faild wiht status=409.', ()=>{
            var INPUT_OBJECT = {
                text : '既存テキスト１',
                create : '1000',
                update : '7000'
            };
            var createItemAtUserName = crudItems.createItemAtUserName;

            return shouldFulfilled(
                createItemAtUserName(TESTING_USER,INPUT_OBJECT)
                .then((result)=>{
                    return _all(
                        _memoryDb,
                        'SELECT * FROM itemstorage WHERE [rawtext] = "既存テキスト１"',
                        []
                    ).then((rows)=>{
                        return Promise.resolve({
                            funcResult : result,
                            selectedRows : rows
                        });
                    });
                })
            ).then((resultComplex)=>{
                var result = resultComplex.funcResult;
                var rows = resultComplex.selectedRows;
                expect(rows.length).to.be.equals(1); // 「２」に、ならないこと。

                expect(result).to.have.property('status', 409);
                expect(result).to.have.property('jsonData').to.deep.equal({
                    message: 'the item is already exist. if you want to edit, you should update command with the target id.',
                    items: [{ 
                        id : rows[0].id,
                        text : rows[0].rawtext,
                        create : rows[0].create_at,
                        update : rows[0].updated_at
                    }],
                    user: TESTING_USER,
                    number_of_items: _numberOfAlreadyExist
                });
            });
        });
    });    
});



