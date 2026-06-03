// 看護師・助産師・保健師 国家試験の出題基準に基づく分野(カテゴリ)定義。
// 各問題の category にこの slug が入る。/kango/category/[slug] で使用。
export interface KangoCategory {
  slug: string
  name: string
  shortName: string
  examType: "看護師" | "助産師" | "保健師"
  description: string
}

export const KANGO_CATEGORIES: KangoCategory[] = [
  // ── 看護師 (11分野) ──
  {
    slug: "anatomy",
    name: "人体の構造と機能",
    shortName: "人体",
    examType: "看護師",
    description:
      "解剖学・生理学・生化学など、人体の正常な構造とはたらきを扱う分野です。各器官系の仕組みやホメオスタシスの理解は、疾病や看護を学ぶ土台になります。",
  },
  {
    slug: "pathology",
    name: "疾病の成り立ちと回復の促進",
    shortName: "疾病",
    examType: "看護師",
    description:
      "病態生理・薬理・微生物・免疫など、疾病がどのように生じ回復するかを扱う分野です。検査・治療・薬剤の知識と結びつけて問われます。",
  },
  {
    slug: "health-support",
    name: "健康支援と社会保障制度",
    shortName: "健康支援",
    examType: "看護師",
    description:
      "医療保険・介護保険・公衆衛生・関係法規など、健康を支える社会のしくみを扱う分野です。制度の対象・給付・手続きが頻出です。",
  },
  {
    slug: "basic-nursing",
    name: "基礎看護学",
    shortName: "基礎看護",
    examType: "看護師",
    description:
      "バイタルサイン測定・清潔・与薬・感染対策・医療安全といった看護の基本技術と、看護過程の基礎を扱う分野です。必修・一般で広く問われます。",
  },
  {
    slug: "adult-nursing",
    name: "成人看護学",
    shortName: "成人",
    examType: "看護師",
    description:
      "成人期の急性期・慢性期・周手術期・終末期の看護を扱う分野です。主要疾患の病態と看護、術後管理、がん看護などが中心です。",
  },
  {
    slug: "gerontological",
    name: "老年看護学",
    shortName: "老年",
    examType: "看護師",
    description:
      "高齢者の加齢変化・認知症・フレイル・施設や在宅でのケアを扱う分野です。高齢者特有の症状や生活支援の視点が問われます。",
  },
  {
    slug: "pediatric",
    name: "小児看護学",
    shortName: "小児",
    examType: "看護師",
    description:
      "小児の成長発達・予防接種・先天性疾患・小児特有の看護を扱う分野です。発達段階に応じた関わりが重視されます。",
  },
  {
    slug: "maternal",
    name: "母性看護学",
    shortName: "母性",
    examType: "看護師",
    description:
      "妊娠・分娩・産褥・新生児とウィメンズヘルスを扱う分野です。正常経過と異常の見分け、母子の健康支援が中心です。",
  },
  {
    slug: "psychiatric",
    name: "精神看護学",
    shortName: "精神",
    examType: "看護師",
    description:
      "精神疾患・精神保健福祉・治療的関わり・精神科での看護を扱う分野です。法制度(精神保健福祉法)や危機介入も問われます。",
  },
  {
    slug: "home-care",
    name: "在宅看護論（地域・在宅看護論）",
    shortName: "在宅",
    examType: "看護師",
    description:
      "在宅療養者と家族の看護、訪問看護、地域包括ケアを扱う分野です。多職種連携や社会資源の活用が問われます。",
  },
  {
    slug: "integration",
    name: "看護の統合と実践",
    shortName: "統合",
    examType: "看護師",
    description:
      "看護管理・医療安全・災害看護・国際看護など、看護を統合的に実践する力を扱う分野です。臨床判断や優先順位の問題が出ます。",
  },
  // ── 助産師 (4分野) ──
  {
    slug: "josan-basic",
    name: "基礎助産学",
    shortName: "基礎助産",
    examType: "助産師",
    description:
      "助産の基盤となるウィメンズヘルス、リプロダクティブヘルス、性と生殖の解剖生理を扱う分野です。",
  },
  {
    slug: "josan-diagnosis",
    name: "助産診断・技術学",
    shortName: "助産診断",
    examType: "助産師",
    description:
      "妊娠・分娩・産褥・新生児の助産診断と援助技術を扱う、助産師国家試験の中核分野です。",
  },
  {
    slug: "josan-community",
    name: "地域母子保健",
    shortName: "地域母子",
    examType: "助産師",
    description: "地域における母子保健活動、母子保健法、健康教育を扱う分野です。",
  },
  {
    slug: "josan-management",
    name: "助産管理",
    shortName: "助産管理",
    examType: "助産師",
    description:
      "助産業務管理・周産期医療体制・関係法規(保健師助産師看護師法等)を扱う分野です。",
  },
  // ── 保健師 (4分野) ──
  {
    slug: "hoken-public",
    name: "公衆衛生看護学",
    shortName: "公衆衛生看護",
    examType: "保健師",
    description:
      "地域・産業・学校における公衆衛生看護活動を扱う、保健師国家試験の中核分野です。",
  },
  {
    slug: "hoken-epidemiology",
    name: "疫学",
    shortName: "疫学",
    examType: "保健師",
    description:
      "疾病の頻度・分布・要因を調べる疫学の方法(研究デザイン、指標、因果推論)を扱う分野です。",
  },
  {
    slug: "hoken-statistics",
    name: "保健統計",
    shortName: "保健統計",
    examType: "保健師",
    description: "人口統計・疾病統計・各種保健指標と統計手法を扱う分野です。",
  },
  {
    slug: "hoken-admin",
    name: "保健医療福祉行政論",
    shortName: "行政論",
    examType: "保健師",
    description: "保健医療福祉の法制度・行政のしくみ・施策を扱う分野です。",
  },
]

export function categoryBySlug(slug: string): KangoCategory | undefined {
  return KANGO_CATEGORIES.find((c) => c.slug === slug)
}

export function categoriesForType(examType: string): KangoCategory[] {
  return KANGO_CATEGORIES.filter((c) => c.examType === examType)
}
