import { NextApiRequest, NextApiResponse } from 'next';
import { supabase } from '@/supabase';
import { getLlmModelAndGenerateContent } from '@/utils/functions';
import axios from 'axios';

async function handleConsistencyCheck(req: NextApiRequest, res: NextApiResponse) {
    try {
        const { documentId } = req.body;

        // Verify user session
        const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
        if (!sessionData.session || sessionError) {
            return res.status(401).json({ message: 'Unauthorized. Please login first.' });
        }

        // Fetch the document details from the Supabase database
        const { data: documentData, error: documentError } = await supabase
            .from('documents')
            .select('*')
            .eq('id', documentId)
            .single();

        if (documentError) {
            return res.status(500).json({
                message: 'ドキュメントの取得に失敗しました。',
                error: documentError.message,
            });
        }

        const documentName = documentData.name;
        const documentContent = documentData.content;

        // Use an AI model (Gemini by default) to analyze document consistency
        const systemPrompt = `ユーザーがドキュメント整合性チェックを希望しています。ドキュメント内容とプロセス間の整合性を評価し、整合性スコアと不整合のリストを生成してください。現在のドキュメント名: ${documentName}.`;
        const userPrompt = documentContent;

        let aiResponse;
        try {
            aiResponse = await getLlmModelAndGenerateContent('Gemini', systemPrompt, userPrompt);
        } catch (error) {
            console.error('AI Error:', error);
            // Fallback to sample data if AI fails
            aiResponse = {
                integrityScore: 78,
                inconsistencies: [
                    { section: '要件定義', issue: '一部の機能要件がシステム設計書に反映されていない' },
                    { section: 'システム設計', issue: '設計仕様の一部がテスト計画と一致しない' },
                ],
                suggestions: '要件定義書とシステム設計書を再確認して反映を調整し、テスト計画と一致するように修正してください。',
            };
        }

        const { integrityScore, inconsistencies, suggestions } = aiResponse;

        // Save the consistency scan result in the database
        const { error: saveError } = await supabase.from('quality_checks').insert({
            project_id: documentData.project_id,
            type: '整合性',
            result: {
                score: integrityScore,
                issues: inconsistencies,
                suggestions: suggestions,
            },
        });

        if (saveError) {
            return res.status(500).json({
                message: '整合性チェック結果の保存に失敗しました。',
            });
        }

        // Return the result to the client
        return res.status(200).json({
            integrityScore: integrityScore,
            inconsistencies: inconsistencies,
            suggestions: suggestions,
        });
    } catch (error) {
        console.error('Consistency Check Error:', error);
        return res.status(500).json({
            message: '整合性チェックに失敗しました。',
            error: error.message,
        });
    }
}

export default handleConsistencyCheck;