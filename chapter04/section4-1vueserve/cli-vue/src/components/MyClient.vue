<template>
<div><!-- 「id="id_app1"」としていたdivタグ配下をココへ配置。属性id自体の定義は不要なので削除 -->
    <div id="id_section_signup" v-if="!isSignUp"><!-- 初回サインアップ用 -->
        【サインアップ】<br><br>
        利用者名を入れてください（※3文字以上、16文字以内の英数字）。：
        <font-awesome-icon icon="check" style="color:#4444ff" v-if="isUserNameValid"></font-awesome-icon>
        <br>
        <input id="id_username" v-model="userNameInput"><br>
        <div>
            <input v-show="isUserNameValid" value="登録" type="button" v-on:click="createAccount">
        </div>
        <br>
    </div>
    <div id="id_section_main" v-if="isSignUp"><!-- サインアップ後のメイン画面 -->
        <div><!-- アコーディオンメニューを後でやる時 -->
            <div id="id_setup_panel" class="cls_toggle_expand_collapse" v-on:click="toggleCtrlPanel">
                {{setuppanel_text}}
            </div>
            <transition name="trans_slide">
                <!-- slideDown() / slideUp() のように上下に開閉するアコーディオンメニューのエリア -->
                <div id="id_setup_transslide" class="menu_slide_accordion" v-if="isPanelShow">
                    ここにオプションのパネルを追加。
                </div>
            </transition>
            <br>
        </div>
        <div id="id_input_area">
            <div id="id_input_textarea">
                <textarea v-model="input_message" placeholder="ここに入力する。複数行可。"></textarea>
            </div>
            <div id="id_input_command">
                <div id="id_input_additional">リストに追加する</div>
                <div id="id_input_button" v-on:click="clickInputButton">
                    <a href="#"><i class="fas fa-pen fa-2x"></i></a>
                    <!-- 
                        <input type="button" value="追加"></input> 
                    -->
                </div>
            </div>
        </div>
        <div id="id_todolist">
            <ul>
                <li v-for="(item,index) in todo_list" v-bind:key="index"> 
                    <!-- (要素、配列番号)で受け取れる仕様 -->
                    <div class="item_text" v-on:click="clickItem(index)"><span v-bind:style="item.styleStr">{{ item.text }}</span></div>
                    <div class="item_date">{{ item.dateStr }}</div>
                    <div v-on:click="clickDeleteButton(index)">
                        <a href="#"><i class="fas fa-trash-alt"></i></a>
                        <!-- 
                            <input type="button" value="削除"></input> 
                        -->
                    </div>
                </li>
            </ul>
        </div>
    </div>
</div>
</template>


<script>


// javascriptファイルをココへ。
import axios from 'axios'
import ItemStorage from '../utils/itemStorage.js';
import userKeyManager from '../utils/userKey.js';

const KEYNAME = 'user';

// 「var app1 = new Vue({})」としていた部分の、「{}」の中だけを「export default {}」の部分は位置する。
// また、「el」キーは削除して、代わりに「name」キーを配置する。値にはファイル名を入れる（とりあえず）。
export default {
    name : "MyClient", // 「el : "#id_app1"」としていた部分。
    props : {
        windowLocationHref : {
            type: String,
            required: false
        }
    },
    data : function () { // オブジェクト{}で定義していた値を、「その値を返却する（無名）関数」に書き換える。
        return {
            setuppanel_text : 'オプションはこちら',
            isPanelShow : false,
            // -----------------------------------
            userNameInput : '',
            // -----------------------------------
            itemStorage : null,
            targetKey : '',
            input_message : '',
            todo_list : []
        }
    },
    computed : {
        isUserNameValid : function(){
            var key = this.userNameInput;
            return (key) && (key.length > 2) && (key.length <= 16);
        },
        isSignUp : function () {
            return (this.targetKey.length > 0);
        },
        justUserName : function () {
            return (this.isSignUp) ? userKeyManager.extractName(this.targetKey) : "未登録";
        }
    },
    created : function () {
        const key = userKeyManager.getTargetUserFromUrlSearch(KEYNAME, this.windowLocationHref);
        if(key){
            this.itemStorage = new ItemStorage(axios, key);
            this.targetKey = key;
            this.setuppanel_text = 'オプション（＠' + this.justUserName + 'さん）';

            this.itemStorage.fetch()
            .then((result)=>{
                this.todo_list = result; // このように「配列ごと変更」はOK、のようだ。
            });
        }
    },
    mounted : function () {
        // this.isPanelShow = true;
    },
    watch : {
        todo_list : {
            handler: function (/* todo_list */) {
                // 何もしない
            },
            deep : true
        }
    },
    methods : {
        toggleCtrlPanel : function () {
            this.isPanelShow = !this.isPanelShow;
        },
        // -----------------------------------
        createAccount : function () {
            this.targetKey = userKeyManager.create(this.userNameInput);
            window.location.href = './index.html?' + KEYNAME + '=' + this.targetKey;
        },
        // ---------------------------------------------
        clickInputButton : function () {
            var new_text = this.input_message;
            if( new_text.length > 0 ){
                this.itemStorage.add(new_text)
                .then((createdItem)=>{
                    this.todo_list.push(createdItem);
                });
                this.input_message = "";
            }
        },
        clickItem : function (index) {
            this.todo_list[index].toggleTextStyle("text-decoration: line-through;");
            // ToDo: クリックでのトグル動作時の扱いを『暫定』としたいので、このような実装にする。
        },
        clickDeleteButton : function (index) {
            var targetId = this.todo_list[index].id;
            this.itemStorage.remove(targetId)
            .then(()=>{
                this.todo_list.splice(index, 1);
            });
        }
    }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
/* Cssファイルはここへ配置する。 */
#id_input_area textarea{
    width : 480px;
    height: 80px;
}

#id_todolist ul li {
    margin: 16px;
    padding: 4px;
    background-color: burlywood;
}

.item_text {
    white-space: pre-wrap;
    cursor: pointer;
}

/*
 * Slide / accordion 設定パネルメニューの装飾
 */ 
.cls_toggle_expand_collapse {
  margin  : 4px;
  padding : 8px;
  cursor  : pointer;
  background-color: aquamarine
}
.menu_slide_accordion {
  background-color: lightgray;
  height: 120px;
  overflow: hidden;
}
/* Vueの方で自動的に付与されるクラス::-enter-xx */
.trans_slide-enter-active, .trans_slide-leave-active {
  transition: all .5s;
}
.trans_slide-enter, .trans_slide-leave-to {
  height: 0;
}
</style>
