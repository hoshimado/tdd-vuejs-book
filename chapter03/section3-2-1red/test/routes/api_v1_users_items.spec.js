/**
 * [api_v1_users_items.spec.js]
 */
var chai = require('chai');
var chaiHttp = require('chai-http');
var expect = chai.expect;
var sinon = require('sinon');

var crudItems = require('../../src/api_v1/crud_items');
var apiV1 = require('../../src/routes/api_v1');

var app = require('../../src/app');


chai.use(chaiHttp);
describe('FT: call src/routes/api_v1.js over /src/app.js', () => {
    describe('/api/v1/users/USER-NAME/items - get', ()=>{
        it('returns list of items.', () => {
            var EXPECT_ITME1 = {
                text : "テキスト１", create : "0", update : "500"
            };
            var EXPECT_ITME2 = {
                text : "テキスト２stub", create : "1000", update : "2000"
            };
            var EXPECT_ITMES_LIST = [ EXPECT_ITME1, EXPECT_ITME2 ];

            var stubEnumerateItemsByUserName 
            = sinon.stub(crudItems,'enumerateItemsByUserName');
            stubEnumerateItemsByUserName.onCall(0).returns(Promise.resolve({
                'status' : 200,
                'jsonData' : {
                    items : EXPECT_ITMES_LIST
                }
            }));
            apiV1.itemsSingleton.setStub(crudItems);

            return chai.request(app)
            .get('/api/v1/users/USER-NAME/items?user=hogehoge')
            .then(function (res) {
                var spiedArgs; 

                expect(stubEnumerateItemsByUserName.callCount)
                .to.be.equal(1, "stubEnumerateItemsByUserName()を１度呼ぶ");
                spiedArgs = stubEnumerateItemsByUserName.getCall(0).args;
                apiV1.itemsSingleton.restoreOriginal();
                stubEnumerateItemsByUserName.restore();

                expect(spiedArgs[0]).to.be.equal('USER-NAME');

                expect(res).header('access-control-allow-origin', '*'); 
                //クロスドメインを許可
                
                expect(res).header('pragma','no-cacha');
                // ↑は↓と書くのと等価。ショートハンド。
                expect(res.headers).to.have.property('content-type')
                .to.equal('application/json; charset=utf-8')              

                expect(res).status(200); // `.to.have.status(200)`と書いても良い
                expect(res).to.have.property('body');
                expect(res.body).to.have.property('items');
                expect(res.body.items).to.deep.equal(EXPECT_ITMES_LIST)
            });
        });
    })
});
