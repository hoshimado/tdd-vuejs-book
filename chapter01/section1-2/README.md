# １章：Vue.jsのCDN版からVue-CLI版へ移行

※本節のVue-CLIの利用においてExpressの導入は必須ではありませんが、フォルダ配置の都合でExpress側のpackage.jsonにVue.jsを記録したいので、Expressを含んだフォルダ構成とします。

## §２：Vue-CLI 環境を導⼊

本サンプルは、本文の次のところまでを**完了**したものとなります。

> 「`Installing CLI plugins. This might take a while...}`」と表示されるので、
> Vue CLIプラグインのインストール完了を待ちます。

ライブラリモジュールは含んでおりませんので、初回はコマンドラインから本フォルダ上にて次のコマンドを実行してください（必要モジュールがインストールされます）。

```bat
npm install
cd cli-vue
npm install
```

インストール完了後に、本文中の次のコマンドから動作確認を続けてください。

```bat
npm run serve
```

