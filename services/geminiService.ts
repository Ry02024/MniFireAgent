import { GoogleGenAI, Type } from "@google/genai";
import { Expense, UserProfile, SideHustle, AiAdvice, MarketInsight, NationalStrategyData, StockDetailData, TimeRange } from "../types";

const getClient = () => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) {
    throw new Error("API Key not found");
  }
  return new GoogleGenAI({ apiKey });
};

// Helper to get current time in JST
const getNowJST = () => {
  const now = new Date();
  return new Date(now.toLocaleString("en-US", { timeZone: "Asia/Tokyo" }));
};

const formatDateJST = (date: Date, format: 'YYYY-MM-DD' | 'MM/DD' | 'YYYY/MM' | 'HH:MM') => {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  const h = String(date.getHours()).padStart(2, '0');
  const min = String(date.getMinutes()).padStart(2, '0');

  switch (format) {
    case 'YYYY-MM-DD': return `${y}-${m}-${d}`;
    case 'MM/DD': return `${m}/${d}`;
    case 'YYYY/MM': return `${y}/${m}`;
    case 'HH:MM': return `${h}:${min}`;
    default: return `${y}-${m}-${d}`;
  }
};

export const getMarketInsights = async (): Promise<MarketInsight[]> => {
  try {
    const ai = getClient();
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: "現在（日本時間）の日経平均、S&P 500、およびオルカン（全世界株式）に関連する最新の株価動向と主要なニュースを調べてください。FIREを目指す投資家向けに、そのニュースが資産形成に与える影響を分析したデータを作成してください。",
      config: {
        tools: [{ googleSearch: {} }],
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              indexName: { type: Type.STRING },
              currentValue: { type: Type.STRING },
              changePercent: { type: Type.STRING },
              sentiment: { type: Type.STRING, enum: ['positive', 'negative', 'neutral'] },
              impactSummary: { type: Type.STRING },
              newsTitle: { type: Type.STRING },
              newsUrl: { type: Type.STRING }
            },
            required: ["indexName", "currentValue", "changePercent", "sentiment", "impactSummary", "newsTitle", "newsUrl"]
          }
        }
      }
    });

    if (response.text) {
      return JSON.parse(response.text) as MarketInsight[];
    }
    throw new Error("Invalid response");
  } catch (error) {
    console.error("Market Insights Error:", error);
    return [
      {
        indexName: "日経平均",
        currentValue: "取得失敗",
        changePercent: "0%",
        sentiment: "neutral",
        impactSummary: "マーケット情報の取得中にエラーが発生しました。",
        newsTitle: "最新ニュースを確認中...",
        newsUrl: "https://www.nikkei.com"
      }
    ];
  }
};

export const getNationalStrategyData = async (): Promise<NationalStrategyData> => {
  try {
    const ai = getClient();
    const prompt = `
      日本の現在の国家戦略（骨太の方針や新しい資本主義など）に基づき、現在特に重要視されている「主要6分野（例：半導体・DX、GX、防衛・宇宙、インバウンド、資産運用、AIなど）」を特定してください。
      
      そして、**各分野ごとに**、投資家が注目すべき「主要銘柄」を5〜10社程度選定してください。
      
      出力は以下のJSON形式でお願いします：
      {
        "sectors": [
          {
            "id": 1,
            "name": "分野名",
            "description": "分野の説明",
            "stocks": [
              { "code": "証券コード", "name": "銘柄名", "reason": "その分野での選定理由" },
              ... (各分野につき5-10銘柄)
            ]
          },
          ... (合計6分野)
        ]
      }
    `;

    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
      config: {
        tools: [{ googleSearch: {} }],
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            sectors: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  id: { type: Type.INTEGER },
                  name: { type: Type.STRING },
                  description: { type: Type.STRING },
                  stocks: {
                    type: Type.ARRAY,
                    items: {
                      type: Type.OBJECT,
                      properties: {
                        code: { type: Type.STRING },
                        name: { type: Type.STRING },
                        reason: { type: Type.STRING }
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }
    });

    if (response.text) {
      const data = JSON.parse(response.text) as NationalStrategyData;
      if (!data.sectors) data.sectors = [];
      return data;
    }
    throw new Error("Empty response for strategy data");
  } catch (error) {
    console.error("Strategy Data Error:", error);
    // Fallback data
    return {
      sectors: [
        { 
          id: 1,
          name: "半導体・DX", 
          description: "デジタル産業基盤の強化",
          stocks: [
            { code: "8035", name: "東京エレクトロン", reason: "製造装置世界シェア上位" },
            { code: "6146", name: "ディスコ", reason: "精密加工装置で高シェア" },
            { code: "4063", name: "信越化学工業", reason: "シリコンウエハ世界首位" }
          ]
        },
        { 
          id: 2,
          name: "GX (脱炭素)", 
          description: "クリーンエネルギー戦略",
          stocks: [
            { code: "7203", name: "トヨタ自動車", reason: "EV/HV全方位戦略" },
            { code: "6501", name: "日立製作所", reason: "送配電・再エネ事業" }
          ]
        },
        { 
          id: 3,
          name: "防衛・宇宙", 
          description: "安全保障と宇宙開発",
          stocks: [
            { code: "7011", name: "三菱重工業", reason: "防衛・H3ロケット主導" },
            { code: "7013", name: "IHI", reason: "航空宇宙エンジン" }
          ]
        },
        { 
          id: 4,
          name: "インバウンド", 
          description: "観光立国の推進",
          stocks: [
             { code: "9020", name: "JR東日本", reason: "鉄道需要回復" },
             { code: "4661", name: "OLC", reason: "ディズニーリゾート運営" }
          ]
        },
        { 
          id: 5,
          name: "AI・ロボティクス", 
          description: "生産性向上と人手不足解消",
          stocks: [
            { code: "9984", name: "ソフトバンクG", reason: "AI投資世界的リーダー" },
            { code: "6301", name: "コマツ", reason: "建機自律運転" }
          ]
        },
        { 
          id: 6,
          name: "金融・資産運用", 
          description: "資産運用立国とPBR改革",
          stocks: [
            { code: "8306", name: "三菱UFJ", reason: "金利上昇メリット" },
            { code: "8316", name: "三井住友FG", reason: "総合金融力" }
          ]
        }
      ]
    };
  }
};

export const getStockDetail = async (code: string, name: string, range: TimeRange = '1Y'): Promise<StockDetailData> => {
  try {
    const ai = getClient();
    const nowJST = getNowJST();
    const todayStr = formatDateJST(nowJST, 'YYYY-MM-DD');

    let rangeInstruction = "";
    let dataCount = "";

    // Reduce data points to improve stability (avoid XHR size limits/timeouts)
    switch (range) {
        case '1D':
            rangeInstruction = `**今日（${todayStr}）**の日本市場における9:00から15:00の間の株価推移。dateは'HH:MM'形式。時間が未来の場合は直近の取引終了時点まで。`;
            dataCount = "6点（9:00, 10:00, 11:00, 12:30, 14:00, 15:00等）";
            break;
        case '1M':
            rangeInstruction = `今日(${todayStr})を終了日とした過去1ヶ月間の主要な日次株価推移。dateは'MM/DD'形式。`;
            dataCount = "10点";
            break;
        case '3M':
            rangeInstruction = `今日(${todayStr})を終了日とした過去3ヶ月間の週次株価推移。dateは'MM/DD'形式。`;
            dataCount = "12点";
            break;
        case '1Y':
        default:
            rangeInstruction = `今日(${todayStr})を終了日とした過去1年間の月次株価推移。dateは'YYYY/MM'形式。`;
            dataCount = "12点";
            break;
    }

    const prompt = `
      日本株「${name} (${code})」について以下の情報を生成してください。
      現在は日本時間の ${nowJST.toLocaleString()} です。
      
      1. 現在の株価（概算）
      2. 企業の簡単な概要（30文字程度）
      3. **${rangeInstruction}**
         - 実際のトレンド（上昇・下降）を反映したリアルな数字を${dataCount}生成してください。
         - **重要**: データの最後のポイントの日付は、必ず**${todayStr}**（または直近の取引日）にしてください。
         - **重要**: 各ポイントの株価変動の要因となった「架空または実際のニュース見出し」と「短い要約」を含めてください。
      
      出力形式:
      {
        "code": "${code}",
        "name": "${name}",
        "currentPrice": 数値,
        "description": "概要",
        "history": [
          { 
            "date": "日付", 
            "price": 数値,
            "newsTitle": "見出し",
            "newsSummary": "要約(20文字以内)",
            "newsUrl": "https://google.com"
          }
        ]
      }
    `;

    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            code: { type: Type.STRING },
            name: { type: Type.STRING },
            currentPrice: { type: Type.NUMBER },
            description: { type: Type.STRING },
            history: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  date: { type: Type.STRING },
                  price: { type: Type.NUMBER },
                  newsTitle: { type: Type.STRING },
                  newsSummary: { type: Type.STRING },
                  newsUrl: { type: Type.STRING }
                }
              }
            }
          }
        }
      }
    });

    if (response.text) {
      const data = JSON.parse(response.text) as StockDetailData;
      if (!data.history) data.history = [];
      return data;
    }
    throw new Error("Empty response for stock detail");
  } catch (error) {
    console.warn("Stock Detail Error (using fallback):", error);
    
    // Fallback logic
    const basePrice = 5000;
    const nowJST = getNowJST();
    const history: StockDetailData['history'] = [];
    
    let count = 12;
    if (range === '1D') count = 6;
    if (range === '1M') count = 10;
    
    for (let i = 0; i < count; i++) {
        let dateStr = "";
        let price = basePrice;

        if (range === '1D') {
            // 9, 10, 11, 12:30, 13:30, 15:00 like logic
            const hours = [9, 10, 11, 12, 13, 15];
            const h = hours[i % hours.length];
            const min = h === 12 ? '30' : '00';
            dateStr = `${h}:${min}`;
            price = basePrice + Math.random() * 100 - 50;
        } else {
            const d = new Date(nowJST);
            if (range === '1M') {
                 d.setDate(nowJST.getDate() - ((count - 1 - i) * 3)); // skip a few days
                 dateStr = formatDateJST(d, 'MM/DD');
            } else if (range === '3M') {
                d.setDate(nowJST.getDate() - (count - 1 - i) * 7);
                dateStr = formatDateJST(d, 'MM/DD');
            } else { // 1Y
                d.setMonth(nowJST.getMonth() - (count - 1 - i));
                dateStr = formatDateJST(d, 'YYYY/MM');
            }
            price = basePrice + Math.random() * 500 - 250;
        }

        history.push({
            date: dateStr,
            price: Math.floor(price),
            newsTitle: "市場動向の影響",
            newsSummary: "セクター全体の動きに連動。",
            newsUrl: `https://www.google.com/search?q=${name}`
        });
    }

    return {
      code,
      name,
      currentPrice: history.length > 0 ? history[history.length - 1].price : basePrice,
      description: "データ取得に失敗しました（フォールバック表示中）。",
      history
    };
  }
};

export const generateFireAdvice = async (
  profile: UserProfile,
  expenses: Expense[],
  currentHustles: SideHustle[]
): Promise<AiAdvice> => {
  try {
    const ai = getClient();
    
    const expenseSummary = expenses.map(e => `${e.category}: ¥${e.amount}`).join(', ');
    const hustleSummary = currentHustles.map(h => `${h.title} (¥${h.hourlyRate}/h)`).join(', ');

    const prompt = `
      あなたは「MiniFIRE Agent」という専門的なFIREコンサルタントです。
      ユーザーは東京在住のデータアナリストで、以下のプロフィールを持っています：
      - 月間手取り収入: ¥${profile.monthlyIncome}
      - 現在の資産: ¥${profile.currentAssets}
      - 目標資産: ¥${profile.targetAssets}
      
      制約事項: 基本給が低め（16万円）ですが、高いスキル（Python/SQL）を持っています。
      
      今月の支出概要: [${expenseSummary}]
      現在の副業状況: [${hustleSummary}]

      以下の4点を日本語で提供してください：
      1. 支出に基づいた具体的なコスト削減策を3つ。
      2. データアナリストに適した具体的な副業の推奨を3つと推定収益。
      3. 市場変動に関連する簡単なリスク警告。
      4. 短く励みになるモチベーションメッセージ。
    `;

    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            savingsTips: { type: Type.ARRAY, items: { type: Type.STRING } },
            hustleRecommendations: { type: Type.ARRAY, items: { type: Type.STRING } },
            riskWarning: { type: Type.STRING },
            motivationalMessage: { type: Type.STRING }
          }
        }
      }
    });

    if (response.text) return JSON.parse(response.text) as AiAdvice;
    throw new Error("Empty response");
  } catch (error) {
    return {
      savingsTips: ["支出分析に失敗しました。"],
      hustleRecommendations: ["副業提案に失敗しました。"],
      riskWarning: "情報の取得に失敗しました。",
      motivationalMessage: "一歩ずつ進みましょう。"
    };
  }
};