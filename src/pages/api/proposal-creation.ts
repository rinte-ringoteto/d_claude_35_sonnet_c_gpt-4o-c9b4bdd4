import { createClient } from '@supabase/supabase-js';
import axios from 'axios';
import { NextApiRequest, NextApiResponse } from 'next';
import { getLlmModelAndGenerateContent } from '@/utils/functions';

// Supabase Client Initialization
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!);

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    // Extract Supabase authenticated user, if not authenticated return 401
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();
    if (sessionError || !session) {
        res.status(401).json({ error: '認証が必要です。' });
        return;
    }

    const { method } = req;
    switch (method) {
        case 'POST':
            try {
                const { projectId, templateId } = req.body;
                if (!projectId || !templateId) {
                    res.status(400).json({ error: 'プロジェクトIDおよびテンプレートIDが必要です。' });
                    return;
                }

                // Fetch project information from the database
                const { data: projectData, error: projectError } = await supabase
                    .from('projects')
                    .select('*')
                    .eq('id', projectId)
                    .single();

                if (projectError || !projectData) {
                    res.status(500).json({ error: 'プロジェクト情報の取得に失敗しました。' });
                    return;
                }

                // Fetch related documents from the database
                const { data: documentData, error: documentError } = await supabase
                    .from('documents')
                    .select('*')
                    .eq('project_id', projectId);

                if (documentError || !documentData.length) {
                    res.status(500).json({ error: '関連するドキュメントの取得に失敗しました。' });
                    return;
                }

                // Get template contents from external API
                const { data: templateResponse } = await axios.get(`/api/templates/${templateId}`);
                const template = templateResponse?.content || 'テンプレート情報が見つかりません。';

                // Generate proposal document using AI model
                const userPrompt = `プロジェクト名: ${projectData.name}
プロジェクト概要: ${projectData.description}
関連ドキュメント: ${JSON.stringify(documentData)}

このプロジェクトに基づいて提案資料を作成してください。`;
                const aiResponse = await getLlmModelAndGenerateContent('Gemini', '提案資料生成', userPrompt);

                let proposalContent = aiResponse?.data || 'サンプル提案資料です。';
                
                // Apply template to the proposal content
                proposalContent = template.replace('{{content}}', proposalContent);

                // Save the generated proposal as a document in the database
                const { error: saveError } = await supabase
                    .from('documents')
                    .insert([
                        {
                            project_id: projectId,
                            type: '提案資料',
                            content: { title: `${projectData.name} 提案資料`, sections: [{ heading: '提案', content: proposalContent }] },
                        },
                    ]);

                if (saveError) {
                    res.status(500).json({ error: '提案資料の保存に失敗しました。' });
                    return;
                }

                res.status(200).json({ message: '提案資料が正常に作成されました。' });

            } catch (error) {
                console.error('エラーメッセージ:', error);
                res.status(500).json({ error: '提案資料の生成に失敗しました。' });
            }
            break;

        default:
            res.setHeader('Allow', ['POST']);
            res.status(405).end(`Method ${method} Not Allowed`);
    }
}