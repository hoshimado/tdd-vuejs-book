/**
 * [userKey.js] encoding=utf8
 * 
 */


const userKey = {
    'create' : function (inputUserName) {
        const baseName = inputUserName;
        const lengthStr = ( '00' + baseName.length ).slice( -2 );
        const S = "abcdefghijklmnopqrstuvwxyz0123456789"
        const N = 30 - baseName.length;
        const uniqueIdStr = Array.from(Array(N)).map(()=>S[Math.floor(Math.random()*S.length)]).join('');
        // https://qiita.com/fukasawah/items/db7f0405564bdc37820e
        const userKey = lengthStr + baseName + uniqueIdStr;
        return userKey;
    },
    'extractName' : function (userKey) {
        const digitStr = userKey.substring(0,2);
        const userNameLength = parseInt(digitStr);
        const userName = userKey.substring(2, 2 + userNameLength)

        return userName;
    },
    /**
     * Get the URL parameter value
     * ref. https://stackoverflow.com/questions/901115/how-can-i-get-query-string-values-in-javascript
     *
     * @param  name {string} パラメータのキー文字列
     * @return  url {url} 対象のURL文字列（任意）
     */
    'getTargetUserFromUrlSearch' : function (name, url) {
        if (!url) {
            url = window.location.href;
        }
        name = name.replace(/[[\]]/g, "\\$&"); // ToDo:この辺、コピペ。

        const regex = new RegExp("[?&]" + name + "(=([^&#]*)|&|#|$)");
        const results = regex.exec(url);
        if (!results){
            return null;
        }
        if (!results[2]){
            return '';
        }
        return decodeURIComponent(results[2].replace(/\+/g, " "));
    }
};



export { userKey as default };
