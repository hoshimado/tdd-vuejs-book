/**
 * [itemStorage.spec.js]
 * encodeing=utf8
 */

import sinon from 'sinon';
import { assert, expect } from 'chai';
import axios from 'axios';
import ItemStorage from '../../src/utils/itemStorage';
import { shouldFulfilled } from 'promise-test-helper';


describe("itemStorage.js", () => {
    let USERNAME = 'hogehoge';

    describe("fetch()", ()=>{
        it("gets list of items with axios#get().", () => {
            let clock = sinon.useFakeTimers();
            let stubGetMethod = sinon.stub(axios, 'get');
            let EXPECTED_ITEMS = [
                { id : 1, text : "fuga1", create : "1000" },
                { id : 2, text : "fuga22", create : "2000" }
            ];
            let itemStorage = new ItemStorage(axios, USERNAME);

            stubGetMethod.onCall(0).returns(Promise.resolve({
                status : 200,
                data : {
                    items : EXPECTED_ITEMS
                }
            }));

            return shouldFulfilled(
                itemStorage.fetch()
            ).then(result=>{
                clock.restore();
                stubGetMethod.restore();

                expect(stubGetMethod.callCount).to.be.equal(1);
                let stubArgs = stubGetMethod.getCall(0).args;
                expect(stubArgs[0]).to.be.equal('/api/v1/users/' + USERNAME + '/items');
                
                assert(Array.isArray(result));
                // 同一配列ではなく、new NoteItem()に再格納しているので、
                // 1要素ずつ照合する。
                expect(result[0].id).to.be.equal(EXPECTED_ITEMS[0].id);
                expect(result[0].text).to.be.equal(EXPECTED_ITEMS[0].text);
                expect(result[0].create).to.be.equal(EXPECTED_ITEMS[0].create);
                expect(result[1].id).to.be.equal(EXPECTED_ITEMS[1].id);
                expect(result[1].text).to.be.equal(EXPECTED_ITEMS[1].text);
                expect(result[1].create).to.be.equal(EXPECTED_ITEMS[1].create);
            });
        });
    });
});
