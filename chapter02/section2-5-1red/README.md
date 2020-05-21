# ２章：Vue-CLI でテスト駆動開発する（TDD）

※本節のVue-CLIの利用においてExpressの導入は必須ではありませんが、フォルダ配置の都合でExpress側のpackage.jsonにVue.jsを記録したいので、Expressを含んだフォルダ構成とします。


## §５：sinon.jsによるスタブをMochaから利用する（前半）

本フォルダのサンプルコードは、以下のファイル分割と利用ライブラリ設定変更などを適用済みの状態となります。

* リスト2.15: 外部ファイルにしてNewインスタンス化したitemStorage

ライブラリモジュールは含んでおりませんので、初回はコマンドラインから本フォルダ上にて次のコマンドを実行してください（必要モジュールがインストールされます）。

```bat
npm install
cd cli-vue
npm install
```

インストール完了後に、本文中の次のコマンドからテスト実行を行ってください（リスト2.13に相当）。

```bat
npm run test:mocha-no-vue
```

<!--
`npm install axios --save-dev` は、devで良い。最終的には、node_modulesを前提としないブラウザ環境向けにコンパイルされるので。
 -->



