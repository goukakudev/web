export interface GlossaryExample {
  title: string
  body: string
}

export interface GlossaryMistake {
  trap: string
  point: string
}

export interface GlossaryQuestionKeyword {
  text: string
  weight: number
}

export interface GlossaryTermEnrichment {
  examples: GlossaryExample[]
  mistakes: GlossaryMistake[]
  questionKeywords: GlossaryQuestionKeyword[]
}

const ENRICHMENTS: Record<string, GlossaryTermEnrichment> = {
  偽装請負: {
    examples: [
      {
        title: "発注者が作業者へ直接指示しているケース",
        body: "請負契約では、受託側が作業方法や要員への指示を管理します。発注者が受託会社の作業者へ直接作業時間や手順を命じている場合は、形式上は請負でも労働者派遣に近い状態として問われます。",
      },
      {
        title: "成果物責任と指揮命令を分けて読む",
        body: "成果物の仕様や納期を発注者が示すこと自体は通常の請負でもあります。試験では、成果物への要求なのか、作業者個人への指揮命令なのかを切り分けるのが正誤判断の軸になります。",
      },
    ],
    mistakes: [
      {
        trap: "請負契約と書かれていれば常に請負として適法だと判断する。",
        point: "契約名ではなく、実態として誰が作業者へ指揮命令しているかを見る。",
      },
      {
        trap: "発注者が仕様を示すことまで偽装請負とみなす。",
        point: "成果物の仕様提示と、作業者への直接指示は分けて考える。",
      },
    ],
    questionKeywords: [
      { text: "偽装請負", weight: 120 },
      { text: "請負契約", weight: 70 },
      { text: "労働者派遣", weight: 70 },
      { text: "派遣とみなされる", weight: 80 },
      { text: "指揮命令", weight: 55 },
    ],
  },
  機械学習: {
    examples: [
      {
        title: "教師あり学習の例",
        body: "過去の申込データに「承認」「否認」などの正解ラベルを付け、未知の申込を分類するモデルを作る場面です。ITパスポートでは、正解データ、ラベル付け、予測・分類の関係がよく問われます。",
      },
      {
        title: "教師なし学習の例",
        body: "顧客データを似た傾向ごとにクラスタへ分けるように、正解を与えずデータの構造を見つける場面です。教師あり学習と混ぜて出されるため、正解ラベルの有無を最初に確認します。",
      },
    ],
    mistakes: [
      {
        trap: "AI、機械学習、ディープラーニングを同じ範囲の言葉として扱う。",
        point: "AIは広い概念、機械学習はデータから学ぶ手法、ディープラーニングは機械学習の一種として整理する。",
      },
      {
        trap: "教師なし学習にも正解ラベルが必要だと考える。",
        point: "正解ラベルがあるかどうかが、教師あり学習との代表的な違い。",
      },
    ],
    questionKeywords: [
      { text: "機械学習", weight: 120 },
      { text: "教師あり学習", weight: 95 },
      { text: "教師なし学習", weight: 95 },
      { text: "強化学習", weight: 90 },
      { text: "ディープラーニング", weight: 85 },
      { text: "学習データ", weight: 65 },
      { text: "正解データ", weight: 65 },
      { text: "ラベル付け", weight: 65 },
    ],
  },
  RPA: {
    examples: [
      {
        title: "定型的な事務作業の自動化",
        body: "請求書データを転記する、決まった画面操作で帳票を作るなど、人が繰り返していた作業をソフトウェアロボットに実行させる例です。判断が複雑な企画業務より、手順が決まった処理に向きます。",
      },
      {
        title: "AIとの違い",
        body: "RPAは決められた手順の実行が中心で、AIはデータから判断や予測を行う技術として問われます。生成AIやチャットボットと並ぶ選択肢では、目的が自動操作なのか判断支援なのかを見ます。",
      },
    ],
    mistakes: [
      {
        trap: "ロボットという語から、工場の物理ロボットだけを想定する。",
        point: "RPAのロボットは、画面操作や入力作業を代替するソフトウェアロボット。",
      },
      {
        trap: "非定型で判断が多い業務ほどRPAに向くと考える。",
        point: "手順が標準化され、例外が少ない定型業務に向く。",
      },
    ],
    questionKeywords: [
      { text: "RPA", weight: 120 },
      { text: "ソフトウェアロボット", weight: 95 },
      { text: "定型的な事務作業", weight: 90 },
      { text: "自動化や効率化", weight: 75 },
      { text: "ロボティックプロセスオートメーション", weight: 90 },
    ],
  },
  PKI: {
    examples: [
      {
        title: "Webサイトの証明書を確認する場面",
        body: "HTTPS通信では、サーバ証明書を認証局が発行し、利用者側は証明書チェーンや失効状態を確認します。PKIは公開鍵の持ち主を信頼できる形で確認するための基盤として問われます。",
      },
      {
        title: "CRLで失効証明書を確認する場面",
        body: "秘密鍵漏えいなどで証明書を期限前に無効化した場合、失効した証明書の情報をCRLなどで確認します。試験では、CAの役割とCRLの役割がよく組み合わされます。",
      },
    ],
    mistakes: [
      {
        trap: "PKIを暗号方式そのものとして覚える。",
        point: "PKIは公開鍵暗号を使うための証明書、認証局、失効確認などを含む基盤。",
      },
      {
        trap: "CAは暗号化を行うサーバだと考える。",
        point: "CAは公開鍵証明書を発行し、公開鍵の持ち主を確認する第三者機関。",
      },
    ],
    questionKeywords: [
      { text: "PKI", weight: 120 },
      { text: "公開鍵基盤", weight: 110 },
      { text: "認証局", weight: 95 },
      { text: "Certificate Authority", weight: 90 },
      { text: "デジタル証明書", weight: 90 },
      { text: "公開鍵証明書", weight: 90 },
      { text: "CRL", weight: 85 },
    ],
  },
  共通鍵暗号方式: {
    examples: [
      {
        title: "同じ鍵で暗号化と復号を行う",
        body: "送信者と受信者が同じ共通鍵を共有し、その鍵で暗号化と復号を行います。処理は高速ですが、相手へ安全に鍵を渡す方法が課題になります。",
      },
      {
        title: "公開鍵暗号方式との組合せ",
        body: "実運用では、本文の暗号化は高速な共通鍵で行い、その共通鍵を公開鍵暗号で安全に交換する構成がよく使われます。TLSなどの説明では、この役割分担が狙われます。",
      },
    ],
    mistakes: [
      {
        trap: "共通鍵暗号方式は鍵配送問題がないと考える。",
        point: "同じ鍵を共有するため、鍵を安全に渡す方法が課題になる。",
      },
      {
        trap: "公開鍵暗号方式より常に安全性が低いと判断する。",
        point: "方式の優劣ではなく、処理速度、鍵管理、使いどころの違いで比較する。",
      },
    ],
    questionKeywords: [
      { text: "共通鍵暗号方式", weight: 120 },
      { text: "共通鍵暗号", weight: 105 },
      { text: "共通鍵", weight: 80 },
      { text: "同一の鍵", weight: 80 },
      { text: "秘密鍵", weight: 55 },
      { text: "AES", weight: 85 },
    ],
  },
  正規化: {
    examples: [
      {
        title: "受注表を分割する例",
        body: "受注番号、顧客名、商品名、単価を一つの表に詰め込むと、同じ商品名や単価が何度も現れます。正規化では、受注、顧客、商品などに表を分け、重複や更新異常を減らします。",
      },
      {
        title: "導出できる項目を分けて考える",
        body: "生年月日から現在年齢を計算できるように、他の項目から求められる値を持つと不整合の原因になります。試験では、冗長な項目や関数従属を見つける問題が出ます。",
      },
    ],
    mistakes: [
      {
        trap: "正規化は検索速度を必ず上げるための手法だと考える。",
        point: "主目的はデータ重複の削減と更新・挿入・削除異常の防止。",
      },
      {
        trap: "表を細かく分ければ分けるほど常に良いと判断する。",
        point: "設計目的に応じて正規化し、性能要件では結合コストも考える。",
      },
    ],
    questionKeywords: [
      { text: "正規化", weight: 120 },
      { text: "第1正規形", weight: 90 },
      { text: "第2正規形", weight: 90 },
      { text: "第3正規形", weight: 90 },
      { text: "関数従属", weight: 85 },
      { text: "更新異常", weight: 85 },
      { text: "冗長な項目", weight: 75 },
    ],
  },
  SLA: {
    examples: [
      {
        title: "稼働率や応答時間を合意する例",
        body: "サービス提供者と利用者が、利用可能時間、稼働率、問い合わせへの応答時間などを合意します。問題では、SLAとKPI、サービスデスク評価、稼働率計算が近い文脈で出ます。",
      },
      {
        title: "SLMとの違い",
        body: "SLAは合意書や合意内容、SLMは合意したサービス水準を満たすよう管理・改善する活動です。空欄補充ではこの対応関係がよく問われます。",
      },
    ],
    mistakes: [
      {
        trap: "SLAをサービス提供者の内部目標だけと考える。",
        point: "顧客とサービス提供者の間で合意するサービス水準として押さえる。",
      },
      {
        trap: "SLAとSLMを同じ意味で扱う。",
        point: "SLAは合意、SLMは合意した水準を管理する活動。",
      },
    ],
    questionKeywords: [
      { text: "SLA", weight: 120 },
      { text: "サービス水準合意", weight: 110 },
      { text: "サービスレベル合意", weight: 110 },
      { text: "サービス提供者と顧客", weight: 90 },
      { text: "サービス品質に関する合意書", weight: 95 },
      { text: "SLM", weight: 85 },
      { text: "稼働率", weight: 60 },
    ],
  },
  BCP: {
    examples: [
      {
        title: "災害後も重要業務を続ける計画",
        body: "本社が使えなくなった場合でも、代替拠点、バックアップ、連絡手順を用意して重要業務を継続・復旧する計画です。単なるバックアップではなく、事業活動の継続が目的です。",
      },
      {
        title: "RTO/RPOとセットで問われる",
        body: "RTOはいつまでに復旧するか、RPOはどの時点のデータまで戻せればよいかを示します。BCPの問題では、復旧時間と復旧時点を取り違えないことが重要です。",
      },
    ],
    mistakes: [
      {
        trap: "BCPを情報システムのバックアップ手順だけと考える。",
        point: "BCPは重要業務を継続・復旧するための組織全体の計画。",
      },
      {
        trap: "RTOとRPOを同じ復旧目標として扱う。",
        point: "RTOは時間、RPOは復旧するデータ時点を表す。",
      },
    ],
    questionKeywords: [
      { text: "BCP", weight: 120 },
      { text: "事業継続計画", weight: 110 },
      { text: "事業継続", weight: 90 },
      { text: "RTO", weight: 90 },
      { text: "RPO", weight: 90 },
      { text: "目標復旧時間", weight: 85 },
      { text: "業務影響度分析", weight: 80 },
    ],
  },
  SWOT分析: {
    examples: [
      {
        title: "内部環境と外部環境を分ける",
        body: "自社の技術力やブランドは内部環境の強み・弱み、市場成長や法規制の変化は外部環境の機会・脅威として整理します。試験では、どの分類に当たるかを選ぶ問題が中心です。",
      },
      {
        title: "他の戦略分析手法との違い",
        body: "PPMは市場成長率と相対シェア、VRIOは経営資源の価値・希少性などを見ます。SWOTは強み・弱み・機会・脅威の4視点で環境を整理する手法です。",
      },
    ],
    mistakes: [
      {
        trap: "機会と強みを混同する。",
        point: "機会は市場や競合など外部環境、強みは自社が持つ内部資源。",
      },
      {
        trap: "SWOT分析を財務指標の計算手法として扱う。",
        point: "経営環境を4視点で整理する戦略分析手法。",
      },
    ],
    questionKeywords: [
      { text: "SWOT分析", weight: 120 },
      { text: "SWOT", weight: 110 },
      { text: "強み", weight: 60 },
      { text: "弱み", weight: 60 },
      { text: "機会", weight: 55 },
      { text: "脅威", weight: 55 },
      { text: "内部環境", weight: 75 },
      { text: "外部環境", weight: 75 },
    ],
  },
  損益分岐点: {
    examples: [
      {
        title: "固定費と変動費から必要販売数を求める",
        body: "販売単価から1個当たり変動費を引いた限界利益で固定費を回収する考え方です。損益分岐点販売数量は、固定費を1個当たり限界利益で割って求めます。",
      },
      {
        title: "値下げ後の必要販売数",
        body: "販売単価を下げると1個当たり限界利益が小さくなり、赤字を避けるために必要な販売数量が増えます。試験では、値下げや販売数増加を組み合わせた計算が出ます。",
      },
    ],
    mistakes: [
      {
        trap: "売上高だけを見て利益が出るか判断する。",
        point: "固定費と変動費を分け、限界利益で固定費を回収できるかを見る。",
      },
      {
        trap: "販売単価を下げても必要販売数は変わらないと考える。",
        point: "単価や変動費が変わると、1個当たり限界利益が変化する。",
      },
    ],
    questionKeywords: [
      { text: "損益分岐点", weight: 120 },
      { text: "損益分岐", weight: 110 },
      { text: "固定費", weight: 80 },
      { text: "変動費", weight: 80 },
      { text: "限界利益", weight: 90 },
      { text: "販売単価", weight: 65 },
    ],
  },
  ゼロトラスト: {
    examples: [
      {
        title: "社内外を問わず毎回確認する考え方",
        body: "社内ネットワークにいるから安全とみなすのではなく、利用者、端末、アクセス先、状況を継続的に確認してアクセスを許可します。クラウド利用やリモートワークが前提の説明で出やすい用語です。",
      },
      {
        title: "境界型防御との違い",
        body: "従来の境界型防御は、社内と社外の境界で守る考え方です。ゼロトラストは境界の内側も無条件に信頼せず、最小権限や継続的な認証・認可を重視します。",
      },
    ],
    mistakes: [
      {
        trap: "一度ログインすれば以後は信頼してよいという考え方だと判断する。",
        point: "継続的に確認し、必要最小限のアクセスだけを許可する。",
      },
      {
        trap: "社内LANの境界を強化するだけの対策と考える。",
        point: "境界の内外を問わず信頼しない前提でアクセス制御する。",
      },
    ],
    questionKeywords: [
      { text: "ゼロトラスト", weight: 120 },
      { text: "境界型防御", weight: 85 },
      { text: "信頼せず", weight: 85 },
      { text: "継続的に確認", weight: 80 },
      { text: "最小権限", weight: 75 },
      { text: "全てのアクセス", weight: 70 },
    ],
  },
}

export function getGlossaryTermEnrichment(
  term: string,
): GlossaryTermEnrichment | undefined {
  return ENRICHMENTS[term]
}

export function glossaryQuestionKeywords(term: string): GlossaryQuestionKeyword[] {
  const enrichment = getGlossaryTermEnrichment(term)
  if (enrichment) return enrichment.questionKeywords
  return [{ text: term, weight: 120 }]
}

export function scoreGlossaryQuestionText(
  term: string,
  text: string,
): { score: number; matchedKeywords: string[] } {
  const matched: GlossaryQuestionKeyword[] = []
  for (const keyword of glossaryQuestionKeywords(term)) {
    if (text.includes(keyword.text)) matched.push(keyword)
  }
  const unique = new Map<string, GlossaryQuestionKeyword>()
  for (const keyword of matched) {
    const current = unique.get(keyword.text)
    if (!current || keyword.weight > current.weight) unique.set(keyword.text, keyword)
  }
  const values = Array.from(unique.values()).sort((a, b) => b.weight - a.weight)
  const score = values.reduce((sum, keyword) => sum + keyword.weight, 0)
  return {
    score,
    matchedKeywords: values.slice(0, 4).map((keyword) => keyword.text),
  }
}
