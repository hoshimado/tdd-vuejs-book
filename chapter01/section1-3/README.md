# １章：Vue.jsのCDN版からVue-CLI版へ移行

※本節のVue-CLIの利用においてExpressの導入は必須ではありませんが、フォルダ配置の都合でExpress側のpackage.jsonにVue.jsを記録したいので、Expressを含んだフォルダ構成とします。

## §３：Vue ファイルにまとめる

本フォルダは、以下の双方を含んでいます。

* リスト1.7: CDN 版から移植したVue ファイル - MyClient.vue
* リスト1.8: MyClient.vue を呼び出すように修正したApp.vue

本文中の「リスト1.9: App.vueを変更し、MyCLient.vueを新規作成」が完了した状態となります。ライブラリモジュールは含んでおりませんので、初回はコマンドラインから本フォルダ上にて次のコマンドを実行してください（必要モジュールがインストールされます）。

```bat
npm install
cd cli-vue
npm install
```

インストール完了後に、本文中の次のコマンドから動作確認を続けてください。

```bat
npm run serve
```

