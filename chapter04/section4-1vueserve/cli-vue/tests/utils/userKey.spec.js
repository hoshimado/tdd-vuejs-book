/**
 * [userKey.spec.js]
 * encodeing=utf8
 */

import sinon from 'sinon';
import { assert, expect } from 'chai';
import userKey from '../../src/utils/userKey';

describe('userKey.js', () => {
    describe('create()', ()=>{
        it('return creating key from userName.', () => {
            const NAME  = 'hoshimado';
            const NAME2 = 'johndoe';
            let result = userKey.create(NAME);

            expect(result.length).to.be.equal(32);
            expect(result.substring(2, 2 + NAME.length)).to.be.equal(NAME);

            result = userKey.create(NAME2);
            expect(result.substring(2, 2 + NAME2.length)).to.be.equal(NAME2);
        });
    });
    describe('extractName()', ()=>{
        it('returns just name.', ()=>{
            const KEY  = '09hoshimado6d0lnnm02z701e7b286wc';
            const KEY2 = '07johndoe__701e7b286wc6d0lnnm02z';
            let result = userKey.extractName(KEY);

            expect(result).to.be.equal('hoshimado');

            result = userKey.extractName(KEY2);
            expect(result).to.be.equal('johndoe');
        });
    });
});


