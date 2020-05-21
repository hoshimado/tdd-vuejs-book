/**
 * [itemStorage.js] encoding=utf8
 * 
 */
import createNoteItem from "./noteItem";
const API_URL = '/api/v1/users/';


var ItemStorage = function (axiosInstance, userName) {
    this.userName = userName;
    this.axiosClient = axiosInstance;
    this.targetUrl = API_URL + this.userName + '/items'
};
ItemStorage.prototype.fetch = function(){
    return this.axiosClient.get(
        this.targetUrl,
        {/*
            "crossdomain" : true,
            "params" : {
                "query" : "key"
            }
        */}
    ).then((result)=>{
        var responsedata = result.data;
        var items = responsedata.items;
        var todo_list = [];

        items.forEach(function (item) {
            todo_list.push(
                createNoteItem(item.text, item.id, item.create)
            );
        });
        return Promise.resolve(todo_list);
    });
};


export { ItemStorage as default };
