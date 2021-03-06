/**
 * [userKey.js] encoding=utf8
 * 
 */

const userKey = {
    'extractName' : function (userKey) {
        const digitStr = userKey.substring(0,2);
        const userNameLength = parseInt(digitStr);
        const userName = userKey.substring(2, 2 + userNameLength)

        return userName;
    },
    /**
     * Get the URL parameter value
     *
     * @param  name {string} パラメータのキー文字列
     * @return  url {url} 対象のURL文字列（任意）
     */
    'getTargetUserFromUrlSearch' : function (name, url) {
        if (!url) {
            url = window.location.href;
        }
        
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
