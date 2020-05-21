/**
 * [vue_main.js] encoding=UTF8
 */

var NoteItem = function (rowtext, createDateMiliSec) {
    var now = (createDateMiliSec) ? new Date(createDateMiliSec) : new Date();

    this.text = rowtext;
    this.utcSec = now.getTime();
    this.dateStr = now.toString();
    this.styleStr = "";
};
NoteItem.prototype.toggleTextStyle = function (styleStr) {
    this.styleStr = (this.styleStr.length==0) ? styleStr : "";
};
var createNoteItem = function (rowtext) {
    return new NoteItem( rowtext );
};


var STORAGE_KEY = "todo-sample-vuejs20190623"
var itemStorage = {
    fetch: function () {
        var todo_list = [];
        var saved_list = JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
        if( saved_list.length > 0 ){
            saved_list.forEach(function (item) {
                todo_list.push(
                    createNoteItem(item.text, item.createDateMiliSec)
                )
            });
        }else{
            // 動作検証時、最初からアイテムがあったほうが都合が良いので。
            todo_list.push( createNoteItem("アイテムを動的にリスト表示1") );
            todo_list.push( createNoteItem("アイテムを動的にリスト表示2") );
            todo_list.push( createNoteItem("アイテムを動的にリスト表示3") );
        }
        return todo_list;
    },
    save : function (todo_list) {
        var saving_list = [];
        todo_list.forEach(function (item) {
            saving_list.push({
                "text" : item.text,
                "createDateMiliSec" : item.utcSec
            })
        });
        localStorage.setItem(STORAGE_KEY, JSON.stringify(saving_list));
    }
};


window.onload = function () {
    var app1 = new Vue({
        el : "#id_app1",
        data : {
            input_message : "",
            todo_list : itemStorage.fetch()
        },
        watch : {
            todo_list : {
                handler: function (todo_list) {
                    itemStorage.save(todo_list);
                },
                deep : true
            }
        },
        methods : {
            clickInputButton : function () {
                var new_text = this.input_message;
                if( new_text.length > 0 ){
                    this.todo_list.push( createNoteItem(new_text) );
                    this.input_message = "";
                }
            },
            clickItem : function (index) {
                this.todo_list[index].toggleTextStyle("text-decoration: line-through;");
                // ToDo: クリックでのトグル動作時の扱いを『暫定』としたいので、このような実装にする。
            },
            clickDeleteButton : function (index) {
                this.todo_list.splice(index, 1);
            }
        }
    });
};

