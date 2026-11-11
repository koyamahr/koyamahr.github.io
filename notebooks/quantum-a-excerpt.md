# 量子力学 A — 波の確率解釈

出典：`QuantumA.tiff`、原本3ページ目、日付表記 `93.4.21`。
これは手書きノートの一部を読みやすく再編集した清書例です。逐語的な全文翻刻ではありません。
節見出し、説明の接続、積分測度の表記を整理しています。ノート全体の正誤確認は未実施です。

## 1. 干渉と確率振幅

二つのスリット a, b を通る経路に対応する振幅を、それぞれ $\psi_a$, $\psi_b$ とする。
原本に書かれた干渉の式は、次のように整理できる。

$$
|\psi_a+\psi_b|^2
= |\psi_a|^2+|\psi_b|^2+\psi_a^*\psi_b+\psi_a\psi_b^*.
$$

右辺の最後の二項が干渉項である。原本では、電子一つずつはスポットとして観測されるが、
それらを集めると干渉縞が再現されることが記されている。

位置 $\mathbf r$ における確率密度を

$$
\rho(\mathbf r)=|\psi(\mathbf r)|^2
$$

とし、規格化を

$$
\int_{\mathbb R^3}|\psi(\mathbf r)|^2\,d^3\mathbf r=1
$$

と書く。

## 2. 位置表示と運動量表示

原本のフーリエ変換の組は、記号をそろえると次の形になる。

$$
\psi(\mathbf r)
=\frac{1}{(2\pi\hbar)^{3/2}}
\int_{\mathbb R^3} A(\mathbf p)
e^{\frac{i}{\hbar}\mathbf p\cdot\mathbf r}\,d^3\mathbf p,
$$

$$
A(\mathbf p)
=\frac{1}{(2\pi\hbar)^{3/2}}
\int_{\mathbb R^3} \psi(\mathbf r)
e^{-\frac{i}{\hbar}\mathbf p\cdot\mathbf r}\,d^3\mathbf r.
$$

ページ末尾には、位置表示と運動量表示での規格化の対応がまとめられている。

$$
\int |\psi(\mathbf r)|^2\,d^3\mathbf r=1
\quad\Longleftrightarrow\quad
\int |A(\mathbf p)|^2\,d^3\mathbf p=1.
$$

原本4ページ目に、この規格化の関係をデルタ関数を用いて確かめる計算が続く。
