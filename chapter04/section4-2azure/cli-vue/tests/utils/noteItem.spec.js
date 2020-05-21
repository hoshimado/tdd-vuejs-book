import sinon from 'sinon';
import { assert, expect } from 'chai';
import createNoteItem from '../../src/utils/noteItem';

describe("noteItem.js", () => {
    describe("createNoteItem", ()=>{
        it("exist.", () => {
            let clock = sinon.useFakeTimers();

            let INPUT_TEXT = "hogehoge.";
            let item = createNoteItem( INPUT_TEXT );
    
            clock.restore();
            expect( item ).has.property("text", INPUT_TEXT);
            expect( item ).has.property("create", "0"); // fakeTimersにより「0」が期待値。
            // expect( item ).has.property("create", )
        });
    })
});


/*
var NoteItem = function (rowtext, createDateMiliSec) {
    var now = new Date();
    if(createDateMiliSec){
        now.setTime(createDateMiliSec);
    }

    this.text = rowtext;
    this.utcSec = now.getTime();
    this.dateStr = now.toString();
    this.styleStr = "";
};
*/