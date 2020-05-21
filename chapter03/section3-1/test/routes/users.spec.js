/**
 * [users.spec.js]
 */

var chai = require('chai');
var chaiHttp = require('chai-http');
var expect = chai.expect;

var app = require('../../src/app');

chai.use(chaiHttp);
describe('/src/app.js', () => {
    describe('routes/users.js - get', ()=>{
        it('exist.', () => {
            return chai.request(app).get('/users').then(function (res) {
                expect(res).to.have.status(200);
                expect(res).to.have.property("text", "respond with a resource");
            });
        });
    })
});
