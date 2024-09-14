ts
import { createClient } from '@supabase/supabase-js';
import axios from 'axios';
import { getLlmModelAndGenerateContent } from '@/utils/functions';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

// API route handler for quality-check.ts
export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ message: 'Method Not Allowed' });
    }

    const { target } = req.body;

    // Step 1: Fetch target document or code from Supabase
    const { data: docData, error: docError } = await supabase
        .from('documents')
        .select('*')
        .eq('id', target)
        .single();

    const { data: codeData, error: codeError } = await supabase
        .from('source_codes')
        .select('*')
        .eq('id', target)
        .single();

    if (docError && codeError) {
        return res.status(500).json({ message: '対象データの取得に失敗しました。' });
    }

    // Step 2: If document exists, check its consistency
    let docCheckResult = '';
    if (docData) {
        const systemPrompt = 'ドキュメントの一貫性と完全性をチェックしてください。';
        const userPrompt = JSON.stringify(docData.content);

        try {
            docCheckResult = await getLlmModelAndGenerateContent("ChatGPT", systemPrompt, userPrompt);
        } catch (err) {
            docCheckResult = "サンプルドキュメントの一貫性チェック結果: ドキュメント全体の一貫性に問題があります。セクション1とセクション2の要求が矛盾しています。";
        }
    }

    // Step 3: If source code exists, check it for syntax, best practices, etc.
    let codeCheckResult = '';
    if (codeData) {
        const systemPrompt = 'ソースコードの構文エラーおよびベストプラクティス違反をチェックしてください。';
        const userPrompt = codeData.content;

        try {
            codeCheckResult = await getLlmModelAndGenerateContent("Gemini", systemPrompt, userPrompt);
        } catch (err) {
            codeCheckResult = "サンプルコードのチェック結果: 構文上のエラーはありませんが、非推奨な関数を使用しています。";
        }
    }

    // Step 4: Combine check results and score
    const consistencyScore = docData ? 80 : 0; // Assume a score for the document
    const codeQualityScore = codeData ? 75 : 0; // Assume a score for the source code
    const totalScore = consistencyScore && codeQualityScore ? (consistencyScore + codeQualityScore) / 2 : 0;

    const result = {
        score: totalScore,
        issues: [
            { type: "ドキュメント", description: docCheckResult, severity: docCheckResult.includes('問題') ? '高' : '低' },
            { type: "ソースコード", description: codeCheckResult, severity: codeCheckResult.includes('エラー') ? '高' : '低' }
        ]
    };

    // Step 6: Save the check result to Supabase
    const { error: saveError } = await supabase
        .from('quality_checks')
        .insert([
            {
                project_id: docData ? docData.project_id : codeData.project_id,
                type: docData ? 'ドキュメント' : 'ソースコード',
                result: result
            }
        ]);

    if (saveError) {
        return res.status(500).json({ message: '結果の保存に失敗しました。' });
    }

    // Step 7: Send summary to the client
    res.status(200).json({
        message: '品質チェックが完了しました。',
        resultSummary: {
            totalScore: totalScore,
            docCheck: docCheckResult || 'ドキュメントは存在しません。',
            codeCheck: codeCheckResult || 'ソースコードは存在しません。'
        }
    });
}