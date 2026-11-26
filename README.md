# 24 Days of Happiness

全新獨立專案。需要 Node.js 20.9 或以上。

```bash
npm install
npm run dev
```

開啟 http://localhost:3000。

## 圖片
public/scenes/：snow、umbrella、letter、box、home。前三個已提供的是 snow、umbrella、home 的舊版圖片，可自行替換。
public/gifts/：day01 至 day24。支援 webp、png、jpg（優先順序如此）。缺圖會顯示暫用禮盒。請放入自己整理好的圖片，不要只更改副檔名。

## 文字
data/letter.ts：最新信件。data/gifts.ts：24 天暫用文案。

目前所有日期均可開啟，方便測試。已拆紀錄保存在瀏覽器。
私人信件與圖片若部署到公開網站，並不具備存取保護。
