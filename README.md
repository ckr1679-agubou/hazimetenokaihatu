# 為替トレード記録ツール（ChromeOS向けMVP）

## 概要
ブラウザだけで動く、シンプルなFXトレード記録ツールです。

## できること
- 取引の追加/削除
- 損益・勝率の自動集計
- JSONエクスポート/インポート
- ローカル保存（LocalStorage）

## 起動方法
### 1) そのまま開く
`index.html` をChromeで開いてください。

### 2) 開発用サーバーで開く（推奨）
```bash
python -m http.server 8000
```
`http://localhost:8000/index.html` にアクセスします。

## ソース一式を保存する（ZIP化）
このリポジトリ全体をZIPで保存する場合:
```bash
cd /workspace
zip -r fx-trade-recorder-source.zip hazimetenokaihatu -x 'hazimetenokaihatu/.git/*'
```

## 今後の拡張候補
- CSV対応
- フィルタ/検索
- チャート表示
- Service Workerでのオフライン強化
