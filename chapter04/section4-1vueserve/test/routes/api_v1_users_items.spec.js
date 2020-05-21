/**
 * [api_v1_users_items.spec.js]
 */
var chai = require('chai');
var chaiHttp = require('chai-http');
var expect = chai.expect;
var sinon = require('sinon');

var sqlite3 = require('sqlite3');

var crudItems = require('../../src/api_v1/crud_items');
var apiV1 = require('../../src/routes/api_v1');

var app = require('../../src/app');


chai.use(chaiHttp);
describe('FT: call src/routes/api_v1.js over /src/app.js', () => {
    describe('execute some API sequentialy.', ()=>{
        var memoryDb = null;
        beforeEach(()=>{
            crudItems.openSqlite3.setStub(function ( /* データベース名の引数は無視する */ ) {
                return new Promise(function(resolve,reject){
                    var sqlite;
                    var db;
                    if(memoryDb){
                        resolve(memoryDb);
                    }else{
                        sqlite = sqlite3.verbose();
                        db = new sqlite.Database( ':memory:', (err)=>{
                            if( !err ){
                                memoryDb = db;
                                resolve( db );
                            }else{
                                reject(err);
                            }
                        });
                    }
                });
            });
            crudItems.closeSqlite3.setStub(function (db) {
                return Promise.resolve(); // 閉じない。閉じちゃうと、メモリーDBが揮発しちゃうので。
            });
        });
        afterEach(()=>{
            crudItems.openSqlite3.restoreOriginal();
            crudItems.closeSqlite3.restoreOriginal();
            memoryDb.close(); // 非同期に閉じるけど無視する。
        });


        it('creates, read, update and delete.', ()=>{
            var today1 = new Date();

            return chai.request(app)
            .post('/api/v1/users/hoshimado/items')
            .set({'x-api-key' : 'foobar'})
            .send({
                'text' : '実際にSQLiteデータベースに書き込むテキスト',
                'create' : today1.getTime().toString(),
                'update' : today1.getTime().toString()
            }).then(function (res) {
                expect(res).status(201);
                expect(res.body.items[0].text).to.be.equal('実際にSQLiteデータベースに書き込むテキスト');
                // console.log(res.body);

                var today2 = new Date();
                return chai.request(app)
                .post('/api/v1/users/richardroe/items')
                .set({'x-api-key' : 'foobar'})
                .send({
                    'text' : '異なるユーザーのテキスト',
                    'create' : today2.getTime().toString(),
                    'update' : today2.getTime().toString()
                });
            }).then(function (res) {
                expect(res).status(201);
                expect(res.body.items[0].text).to.be.equal('異なるユーザーのテキスト');
                // console.log(res.body);

                var today3 = new Date();
                return chai.request(app)
                .post('/api/v1/users/hoshimado/items')
                .set({'x-api-key' : 'foobar'})
                .send({
                    'text' : '２つめのテキスト',
                    'create' : today3.getTime().toString(),
                    'update' : today3.getTime().toString()
                });
            }).then(function (res) {
                expect(res).status(201);
                expect(res.body.items[0].text).to.be.equal('２つめのテキスト');
                // console.log(res.body);

                return chai.request(app)
                .get('/api/v1/users/hoshimado/items')
                .set({'x-api-key' : 'foobar'});
            }).then(function (res) {
                expect(res).status(200);
                expect(res.body.items.length).to.be.equal(2);
                expect(res.body.items[0].text).to.be.equal('実際にSQLiteデータベースに書き込むテキスト');
                expect(res.body.items[1].text).to.be.equal('２つめのテキスト');
                // console.log(res.body);

                var id =   res.body.items[0].id;
                var time = res.body.items[0].create;
                var today4 = new Date();
                return chai.request(app)
                .put('/api/v1/users/hoshimado/items/' + id)
                .set({'x-api-key' : 'foobar'})
                .send({
                    'text' : '１つめのテキスト、を修正済み',
                    'create' : time,
                    'update' : today4.getTime().toString()
                });
            }).then(function (res) {
                expect(res).status(200);
                expect(res.body.items[0].text).to.be.equal('１つめのテキスト、を修正済み');
                // console.log(res.body);

                return chai.request(app)
                .get('/api/v1/users/hoshimado/items')
                .set({'x-api-key' : 'foobar'});
            }).then(function (res) {
                expect(res).status(200);
                expect(res.body.items.length).to.be.equal(2);
                expect(res.body.items[0].text).to.be.equal('１つめのテキスト、を修正済み');
                expect(res.body.items[1].text).to.be.equal('２つめのテキスト');
                // console.log(res.body);

                var id = res.body.items[0].id;
                return chai.request(app)
                .delete('/api/v1/users/hoshimado/items/' + id)
                .set({'x-api-key' : 'foobar'});
            }).then(function (res) {
                expect(res).status(200);
                expect(res.body.items.length).to.be.equal(0);
                
                return chai.request(app)
                .get('/api/v1/users/hoshimado/items')
                .set({'x-api-key' : 'foobar'});
            }).then(function (res) {
                expect(res).status(200);
                expect(res.body.items.length).to.be.equal(1);
                expect(res.body.items[0].text).to.be.equal('２つめのテキスト'); // だけが残る。
                // console.log(res.body);
            });
        });
    });

    describe('/api/v1/users/USER-NAME/items - get', ()=>{
        it('returns list of items.', () => {
            var EXPECT_ITME1 = {
                text : "テキスト１", create : "0", update : "500"
            };
            var EXPECT_ITME2 = {
                text : "テキスト２stub", create : "1000", update : "2000"
            };
            var EXPECT_ITMES_LIST = [ EXPECT_ITME1, EXPECT_ITME2 ];

            // app.jsをchaiHttpしているせいか、itemsという外部ファイルに対してStub化出来る。
            // しかし、通常のstub版（sinon_effectiveフォルダに置いてる）だとダメ。
            // なので、ここでも明確に被テスト側に「フックするポイント」を設けることとする。
            var stubEnumerateItemsByUserName = sinon.stub(crudItems,'enumerateItemsByUserName');
            stubEnumerateItemsByUserName.onCall(0).returns(Promise.resolve({
                'status' : 200,
                'jsonData' : {
                    items : EXPECT_ITMES_LIST
                }
            }));
            apiV1.itemsSingleton.setStub(crudItems);

            return chai.request(app)
            .get('/api/v1/users/USER-NAME/items?option=piyo')
            .set({'x-api-key' : 'foobar'})
            .then(function (res) {
                var spiedArgs = stubEnumerateItemsByUserName.getCall(0).args;
                apiV1.itemsSingleton.restoreOriginal();
                stubEnumerateItemsByUserName.restore();

                expect(spiedArgs[0]).to.be.equal('USER-NAME');

                expect(res).header('access-control-allow-origin', '*'); //クロスドメインを許可
                expect(res).header('pragma','no-cacha');
                // ↑は↓と書くのと等価。ショートハンド。
                expect(res.headers).to.have.property('content-type').to.equal('application/json; charset=utf-8')              

                expect(res).status(200); // `.to.have.status(200)`と書いても良い
                expect(res).to.have.property('body');
                expect(res.body).to.have.property('items');
                expect(res.body.items).to.deep.equal(EXPECT_ITMES_LIST)
            });
        });
    })


    describe('/api/v1/users/USER-NAME/items - post', ()=>{
        it('post a new item for creating.', () => {
            var EXPECT_POSTED_OBJDATA = {
                text : 'NEW TEXT',
                create : 'created time sec',
                update : 'updated time sec'
            };

            var stubCreateItemAtUserName = sinon.stub(crudItems, 'createItemAtUserName');
            stubCreateItemAtUserName.onCall(0).returns(Promise.resolve({
                'status' : 200,
                'jsonData' : {}
            }));
            apiV1.itemsSingleton.setStub(crudItems);

            return chai.request(app)
            .post('/api/v1/users/USER-NAME/items')
            .set({'x-api-key' : 'foobar'})
            .send({
                'text' : EXPECT_POSTED_OBJDATA.text,
                'create' : EXPECT_POSTED_OBJDATA.create,
                'update' : EXPECT_POSTED_OBJDATA.update
            })
            .then(function (res) {
                var spiedArgs;
                apiV1.itemsSingleton.restoreOriginal();
                stubCreateItemAtUserName.restore();

                // 期待した引数で、create用のメソッドが呼び出されることを検証
                expect(stubCreateItemAtUserName.callCount).to.be.equal(1);
                spiedArgs = stubCreateItemAtUserName.getCall(0).args;
                expect(spiedArgs[0]).to.be.equal('USER-NAME');
                expect(spiedArgs[1]).to.deep.equal(EXPECT_POSTED_OBJDATA);

                // 返却値を検証
                expect(res).header('access-control-allow-origin', '*'); //クロスドメインを許可
                expect(res).header('pragma','no-cacha');
                expect(res).header('content-type', 'application/json; charset=utf-8');

                expect(res).status(200);
                // expect(res).to.have.property('body');
                // expect(res.body).to.have.property('items');
                // expect(res.body.items).to.deep.equal(EXPECT_ITMES_LIST)
            });
        });
    });

    
    describe('/api/v1/users/USER-NAME/items/7 - put', ()=>{
        it('update a exist item with id of items.', () => {
            var EXPECT_POSTED_OBJDATA = {
                text : 'NEW TEXT',
                create : 'created time sec',
                update : 'updated time sec',
            };

            var stubUpdateItemAtUserName = sinon.stub(crudItems, 'updateItemAtUserName');
            stubUpdateItemAtUserName.onCall(0).returns(Promise.resolve({
                'status' : 200,
                'jsonData' : {}
            }));
            apiV1.itemsSingleton.setStub(crudItems);

            return chai.request(app)
            .put('/api/v1/users/USER-NAME/items/7')
            .set({'x-api-key' : 'foobar'})
            .send({
                'text' : EXPECT_POSTED_OBJDATA.text,
                'create' : EXPECT_POSTED_OBJDATA.create,
                'update' : EXPECT_POSTED_OBJDATA.update
            })
            .then(function (res) {
                var spiedArgs;
                apiV1.itemsSingleton.restoreOriginal();
                stubUpdateItemAtUserName.restore();

                // 期待した引数で、create用のメソッドが呼び出されることを検証
                expect(stubUpdateItemAtUserName.callCount).to.be.equal(1);
                spiedArgs = stubUpdateItemAtUserName.getCall(0).args;
                expect(spiedArgs[0]).to.be.equal('USER-NAME');
                expect(spiedArgs[1]).to.deep.equal(EXPECT_POSTED_OBJDATA);
                expect(spiedArgs[2]).to.be.equal('7');

                // 返却値を検証
                expect(res).header('access-control-allow-origin', '*'); //クロスドメインを許可
                expect(res).header('pragma','no-cacha');
                expect(res).header('content-type', 'application/json; charset=utf-8');

                expect(res).status(200);
                // expect(res).to.have.property('body');
                // expect(res.body).to.have.property('items');
                // expect(res.body.items).to.deep.equal(EXPECT_ITMES_LIST)
            });
        });
    });


    describe('/api/v1/users/USER-NAME/items/5 - delete', ()=>{
        it('delete a exist item with id of items.', () => {
            var stubDeleteItemAtUserName = sinon.stub(crudItems, 'deleteItemAtUserName');
            stubDeleteItemAtUserName.onCall(0).returns(Promise.resolve({
                'status' : 200,
                'jsonData' : {}
            }));
            apiV1.itemsSingleton.setStub(crudItems);

            return chai.request(app)
            .delete('/api/v1/users/USER-NAME/items/5')
            .set({'x-api-key' : 'foobar'})
            .then(function (res) {
                var spiedArgs;
                apiV1.itemsSingleton.restoreOriginal();
                stubDeleteItemAtUserName.restore();

                // 期待した引数で、delete用のメソッドが呼び出されることを検証
                expect(stubDeleteItemAtUserName.callCount).to.be.equal(1);
                spiedArgs = stubDeleteItemAtUserName.getCall(0).args;
                expect(spiedArgs[0]).to.be.equal('USER-NAME');
                expect(spiedArgs[1]).to.be.equal('5');

                // 返却値を検証
                expect(res).header('access-control-allow-origin', '*'); //クロスドメインを許可
                expect(res).header('pragma','no-cacha');
                expect(res).header('content-type', 'application/json; charset=utf-8');

                expect(res).status(200);
                // expect(res).to.have.property('body');
                // expect(res.body).to.have.property('items');
                // expect(res.body.items).to.deep.equal(EXPECT_ITMES_LIST)
            });
        });
    });
});



