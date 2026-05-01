<!-- markdownlint-disable MD033 -->
# quote-clipper

選択した範囲のテキストの行頭に引用符(>)を付けてクリップボードにコピーするChrome拡張です。
想定している使い方はMisskeyの投稿欄での使用ですが、Discordの引用表記にも対応しています。

## How to use

テキストを選択した上で右クリックするとコンテクストメニューに「選択範囲を引用形式でコピー」という欄が追加されるので、それを左クリックで選択するとクリップボードに入ります。
また、WindowsのショートカットキーはCtrl+Q、MacのショートカットキーはControl+Qとなります。

## Files

- `manifest.json`: Chrome拡張の設定
- `js/constants.js`: background/content scriptで共有する定数
- `js/background.js`: コンテクストメニュー、ショートカット、クリップボードコピー処理
- `js/content.js`: ページ上の選択テキスト取得処理
