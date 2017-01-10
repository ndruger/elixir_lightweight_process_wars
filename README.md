# Elixir Lightweight Process Wars - Let it crash!! -

## 概要

Elixirの軽量プロセスをショット(スペースキー)で倒してくシューティングゲームです。

ステージとかまだ作ってないので、敵のタイプを指定して戦うことしかできません。

## 動作概要

1. Process.list()をProcess.info()した結果がサーバからフロントエンドに送られてくる。その中で敵とみなされたプロセスが画面に表示される。
1. 右下の敵の選択ボタンを押すと、サーバにプロセスの再生要求メッセージが送られて、敵プロセスが生成される。
1. フロントエンドでショットで敵プロセスを倒すと、サーバにプロセス削除のメッセージが送られて、サーバ側でプロセスが殺される。殺された場合、フロントエンドに定的的に送られるProcess.list()から前あったpidのプロセスが消えるため、フロントエンドはそのプロセスが死んだと判定して敵を爆発画像に切り替える。

## ゲームの始め方

  * Install dependencies with `mix deps.get`
  * Install Node.js dependencies with `npm install`
  * Start Phoenix endpoint with `mix phoenix.server`

Now you can visit [`localhost:4000`](http://localhost:4000) from your browser.

## 敵キャラ紹介

[敵キャラの実装コード](./lib/enemy.ex)

### Spawn

Linkされてないプロセス。ショットで倒せば復活しない。

### Supervisor(:simple_one_for_one)

`:simple_one_for_one`の戦略をとるSupervisor。5秒に1つずつlinkされた子供のプロセスが追加される。子供のプロセスはショットで倒せばすぐに復活する。[デフォルト値の仕様](https://hexdocs.pm/elixir/Supervisor.Spec.html#supervise/2-options)の通り、5秒の間に4回倒せば復活しない。

### Supervisor(:one_for_all)

`:simple_one_for_one`の戦略をとるSupervisor。子供のプロセスは4つに固定。どの子供のプロセスを倒しても子供全員が復活する。

### 隠し敵キャラ Dynamic Atom Creator

クエリに何かをつけると現れる。Atom Tableを使い果たそうとする。

### ボス Phoenix

実装中・・・。

## 利用している画像

このゲームは<a href="http://mfstg.web.fc2.com/index.html">http://mfstg.web.fc2.com/index.html"</a>で配布されている素材(`priv/static/vendor/images/mfstg`)を利用しています。
