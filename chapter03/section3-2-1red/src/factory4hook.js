/*
    [factory4require.js]

	encoding=utf-8
*/

var NODE_ENV_TEST_KEYWORD = 'test';

/**
 * @description 定数オブジェクトのFactory
 */
var Factory4Hook = function( staticInstance ){
    this.instance = staticInstance;
    this.originalInstance = this.instance;
};
Factory4Hook.prototype.getInstance = function(){
    return this.instance;
};
if( process.env.NODE_ENV == NODE_ENV_TEST_KEYWORD ){
    Factory4Hook.prototype.setStub = function( value ){
        this.instance = value;
    };
    Factory4Hook.prototype.restoreOriginal = function(){
        this.instance = this.originalInstance;
    };
}
exports.Factory4Hook = Factory4Hook;


