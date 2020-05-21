/**
 * [itemStorage.js] encoding=utf8
 * 
 */


var ItemStorage = function (axiosInstance, userName) {
    this.userName = userName;
    this.axiosClient = axiosInstance;
};
ItemStorage.prototype.fetch = function(){
    return Promise.resolve();
};


export { ItemStorage as default };
