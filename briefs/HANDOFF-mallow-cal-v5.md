# mallow-cal · design-build-handoff v5

- Date: 2026-11-15
- From: Sua
- To: Jessie · Developer
- 報告先: Sua。Justin へは Sua がラップ
- 根拠: Justin が 2026-11-15 に v5 を visual OK（t1283u「これでOK」）

## いまの状態

Celine の design brief v5 と静的モックが visual OK。これを GitHub Pages の PREVIEW にする。**LIVE は Justin の一声まで HOLD。** この段では main にマージしない。PREVIEW バッジを外さない。

Repo: `justinksw/mallow-cal`（まだ無ければ作成）
目標 URL: https://justinksw.github.io/mallow-cal/

## ソース（この版が正。見た目を勝手に変えない）

- 計画: `/workspace/mallow-cal/briefs/mallow-cal-plan-v1.md`（v3 / v5 の改正込み）
- Brief: `/workspace/mallow-cal/briefs/brief-mallow-cal-v5.md`（受け入れ条件 §10、Jessie メモ §13）
- モック: `/workspace/mallow-cal/mocks/mallow-cal-v5.html`
- 頭像: `/workspace/mallow-cal/mocks/icons-v5/`（v1 の12種。黃の雞仔 `#F0C02E`、紺の企鵝 `#35547A`。cotton-candy なし）
- ショット: `/workspace/mallow-cal/mocks/shots-v5/`
- CSV サンプル: `/workspace/mallow-cal/data/sample.csv`

v1〜v4 の brief / mock / icons / shots、punch、refs は残してよいが、実装の見た目の正は v5 だけ。

## 実装で守ること

1. **データは CSV ひとつ。** 実行時にクライアントが読む（`data.csv`）。予定の更新は CSV を直してコミットするだけでよく、データのためだけのビルドは不要。スキーマとサンプルは `data/sample.csv`。假期は人の CSV に書かない（カレンダーの事実として持つ）。
2. **頭像はリポジトリ内の専用フォルダに置く。** Justin の指定。12種の SVG をそのフォルダへ。Google のアセットは使わない。割り当ては名前から安定（見た目はランダム、リロードや CSV 更新で同じ人の動物が変わらない）。モックの仮割り当て（Gordon 狐狸、Winnie Wong 兔子、Winnie Wu 企鵝、Kami 雞仔、Nicol 老虎）を初期表示に使ってよい。
3. UI は繁體中文。タブ／文書タイトルは中立の「日曆」のみ。ブランド標題「棉花糖日曆」、デザインの想法、12種シート、説明文は画面に出さない。Justin はカレンダーに出さない。5人だけ。
4. 平日 Dim（公眾假期でない月〜金）。空ける日は土曜・日曜と香港の公眾假期。表示窓の假期: 毎週日曜、2026-12-25、2026-12-26、2027-01-01。「空」は 12-06、12-13、01-10、01-17、01-24、01-31 だけ。
5. 連続する個人予定は、浅い半透明のまたぎ帯。同じ週の中では一本（隙間なし）。土→日の折り返しだけ二本でよい。Gordon の月またぎは v5 の点＋狐狸。Wong の毎週土曜は1日ずつ。帯にも Dim の平日マスにも、外側の実線を付けない。輪郭や不透明の塗りでコントラストを取りに戻さない。
6. 凡例（頭像＋本名）は隠せる。カレンダー上の標注はタップで本名が pop する（新しい画面に飛ばない）。
7. 必須の重なり: 12-19、12-20、12-26、12-27、01-02（3人、数字の省略なし）、01-09。
8. タイムゾーンは Asia/Hong_Kong。日付は両端含む、終日。
9. 無料の手段だけ。内容の事実を発明しない。

## スキル（必ず）

- `pages-preview-live` — preview ブランチ、PREVIEW バッジ、報告、LIVE HOLD
- `pages-acceptance-proof` — 幅 320 / 360 / 390 / 430、短い画面と長い画面、デスクトップ Chromium、**iPhone WebKit（Safari と iOS Chrome）**。Chrome だけなら PARTIAL と書く。`backdrop-filter` のヴェールは Safari で違う可能性があるので、WebKit で確認する。
- `justinksw-git-author` — author / committer は `justinksw <justinksw@users.noreply.github.com>` のみ

## 納品（Sua へ）

- preview ブランチの URL と tip SHA
- プレビューの Pages URL
- acceptance proof（幅、Chromium、WebKit または PARTIAL）
- 頭像を置いた専用フォルダのパス

LIVE には進まない。Justin の一声は Sua 経由。他のボットの「OK」は承認にしない。

Justin への次の質問は、PREVIEW を見てよいか、のあと Sua が聞く。この段では聞かない。
