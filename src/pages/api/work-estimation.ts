import { createClient } from '@supabase/supabase-js';
import { NextApiRequest, NextApiResponse } from 'next';
import axios from 'axios';

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!);

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'POST') {
    const { project_id } = req.body;

    // Define a sample user prompt based on inputs if available
    let userPrompt = `プロジェクトID: ${project_id}に基づき、開発工数を見積もってください。各工程の工数内訳を含めてください。`;
    let systemPrompt = "開発プロセスの各フェーズ（要件定義、設計、開発、テスト）の見積工数を出してください。";

    const llmResult = await getLlmModelAndGenerateContent(
      'ChatGPT',
      systemPrompt,
      userPrompt
    );

    try {
      // Simulated successful API request
      if (llmResult) {
        const estimate = JSON.parse(llmResult);

        const { data, error } = await supabase
          .from('work_estimates')
          .insert({
            project_id: project_id,
            estimate: {
              total_hours: estimate.total_hours,
              breakdown: estimate.breakdown
            }
          })
          .single();

        if (error) throw error;

        res.status(200).json({ success: true, estimate: data });
      } else {
        throw new Error('No response from AI.');
      }
    } catch (error) {
      res.status(500).json({
        success: false,
        message: '見積作成中にエラーが発生しました。サンプルデータを返します。',
        estimate: {
          total_hours: 200,
          breakdown: [
            { phase: '要件定義', hours: 40 },
            { phase: '設計', hours: 60 },
            { phase: '開発', hours: 80 },
            { phase: 'テスト', hours: 20 }
          ]
        }
      });
    }
  } else {
    res.status(405).json({ message: 'POSTメソッドのみが許可されています。' });
  }
}