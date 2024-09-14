import { NextApiRequest, NextApiResponse } from 'next';
import { supabase } from '@/supabase';
import axios from 'axios';
import { getLlmModelAndGenerateContent } from '@/utils/functions';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const { user_id, project_id, document_type } = req.body;

    // ユーザー認証確認
    const { data: session } = await supabase.auth.getSession();
    if (!session) {
        return res.status(401).json({ error: 'ユーザーが認証されていません' });
    }

    // データベースからプロジェクト情報を取得
    const { data: project, error: projectError } = await supabase
        .from('projects')
        .select('*')
        .eq('id', project_id)
        .single();

    if (!project || projectError) {
        return res.status(404).json({ error: 'プロジェクトが見つかりません' });
    }

    try {
        // ドキュメント生成APIを呼び出し（ここではChatGPTを使用）
        const systemPrompt = `プロジェクト名: ${project.name} の${document_type}ドキュメントを作成してください。`;
        const userPrompt = `プロジェクトの基本情報は以下です。内容を基に適切な開発ドキュメントを生成してください。
プロジェクト名: ${project.name}
説明: ${project.description}`;

        const aiResponse = await getLlmModelAndGenerateContent('ChatGPT', systemPrompt, userPrompt);

        if (!aiResponse || aiResponse === null) {
            throw new Error("AIのドキュメント生成に失敗しました");
        }

        // 生成されたドキュメントオブジェクトを構成
        const generatedDocument = {
            title: `${document_type} - ${project.name}`,
            sections: [
                {
                    heading: "プロジェクト概要",
                    content: project.description || "説明なし"
                },
                {
                    heading: "AI生成コンテンツ",
                    content: aiResponse.content || "生成に失敗しました。"
                }
            ]
        };

        // ドキュメントをデータベースに保存
        const { data: document, error: documentError } = await supabase
            .from('documents')
            .insert({
                project_id: project_id,
                type: document_type,
                content: generatedDocument,
                created_by: user_id
            });

        if (documentError || !document) {
            throw new Error('ドキュメントの保存に失敗しました');
        }

        // 成功応答
        return res.status(200).json({ success: true, document });

    } catch (e) {
        // エラー時のサンプルデータを返す
        const sampleDocument = {
            title: `${document_type} - ${project.name} (サンプル)`,
            sections: [
                {
                    heading: "プロジェクト概要",
                    content: project.description || "説明なし"
                },
                {
                    heading: "AI生成サンプルコンテンツ",
                    content: "これはサンプルデータです。実際のAI生成に失敗しました。"
                }
            ]
        };

        // ドキュメントをサンプルデータとして保存
        await supabase
            .from('documents')
            .insert({
                project_id: project_id,
                type: document_type,
                content: sampleDocument,
                created_by: user_id
            });

        return res.status(500).json({
            error: 'ドキュメント生成に失敗したため、サンプルデータを返します。',
            document: sampleDocument
        });
    }
}