# Grant Insight Perfect - WordPressテーマ

## 概要
助成金・補助金検索システムを備えた高機能WordPressテーマ

## バージョン
- Version: 7.0-complete
- 最終更新: 2025-09-17

## 主な機能
- ✅ 助成金・補助金検索システム
- ✅ レスポンシブデザイン（Tailwind CSS）
- ✅ ACF（Advanced Custom Fields）対応
- ✅ JavaScriptエラー処理済み
- ✅ レガシーコード互換性

## 必要な環境
- WordPress 5.0以上
- PHP 7.4以上
- MySQL 5.6以上

## インストール方法
1. このテーマフォルダを `/wp-content/themes/` にアップロード
2. WordPress管理画面でテーマを有効化
3. Advanced Custom Fields プラグインをインストール（推奨）

## ファイル構成
```
grant-insight-perfect/
├── style.css              # テーマ情報とスタイル
├── functions.php          # テーマ機能
├── index.php             # メインテンプレート
├── front-page.php        # フロントページ
├── header.php            # ヘッダー
├── footer.php            # フッター
├── archive-grant.php     # 助成金アーカイブ
├── single-grant.php      # 助成金詳細
├── page.php              # 固定ページ
├── assets/
│   ├── js/
│   │   ├── grant-database.js      # 助成金データベースシステム
│   │   ├── main.js                # メインJavaScript
│   │   ├── legacy-bridge.js       # レガシー互換性
│   │   ├── unified-search-manager.js  # 統合検索マネージャー
│   │   └── search-config.js       # 検索設定
│   └── css/
│       └── (スタイルファイル)
├── template-parts/       # テンプレートパーツ
└── acf-json/            # ACFフィールド設定
```

## JavaScriptエラーの解決
以下のエラーはすべて解決済みです：
- ✅ Grant Database System の初期化エラー
- ✅ 検索システムの初期化エラー
- ✅ レガシーコードとの互換性問題

## 助成金検索システムの使い方
1. トップページの検索フォームから検索
2. タイプ（助成金/補助金）で絞り込み
3. 地域で絞り込み
4. キーワード検索

## 対応ブラウザ
- Chrome（最新版）
- Firefox（最新版）
- Safari（最新版）
- Edge（最新版）

## 技術スタック
- WordPress
- PHP
- JavaScript（ES6+）
- Tailwind CSS（CDN版）
- ACF（Advanced Custom Fields）

## ライセンス
GPL v2 or later

## サポート
問題が発生した場合は、以下を確認してください：
1. JavaScriptコンソールでエラーがないか
2. functions.phpが正しく読み込まれているか
3. ACFプラグインがインストールされているか

## 更新履歴
- 7.0: JavaScriptエラー完全解決、レガシー互換性追加
- 6.0: 助成金データベースシステム実装
- 5.0: Tailwind CSS統合