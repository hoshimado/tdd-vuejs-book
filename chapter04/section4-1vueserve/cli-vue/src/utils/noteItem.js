/**
 * [noteItem.js] encoding=utf8
 * 
 */


var NoteItem = function (rowtext, id, createDateMiliSec) {
    var now = new Date();
    if(createDateMiliSec){
        now.setTime(createDateMiliSec);
    }

    this.text = rowtext;
    this.id   = id;
    this.create = now.getTime().toString();
    this.dateStr = now.toString();
    this.styleStr = "";
};
NoteItem.prototype.toggleTextStyle = function (styleStr) {
    this.styleStr = (this.styleStr.length==0) ? styleStr : "";
};
var createNoteItem = function (rowtext, id, createDateMiliSec) {
    return new NoteItem( rowtext, id, createDateMiliSec );
};




export { createNoteItem as default };
