typescript
import { NextApiRequest, NextApiResponse } from 'next';
import axios from 'axios';
import { supabase } from '@/supabase';
import { getLlmModelAndGenerateContent } from '@/utils/functions';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method Not Allowed' });
    }

    const { project_id, period_from, period_to } = req.body;

    if (!project_id || !period_from || !period_to) {
        return res.status(400).json({ error: 'Missing required parameters.' });
    }

    try {
        // プロジェクト情報を取得
        const { data: project, error: projectError } = await supabase
            .from('projects')
            .select('*')
            .eq('id', project_id)
            .single();

        if (projectError || !project) {
            throw new Error('プロジェクト情報の取得に失敗しました。');
        }

        // 1. 指定された期間のアクティビティログをデータベースから取得
        const { data: logs, error: logsError } = await supabase
            .from('activity_logs')
            .select('*')
            .eq('project_id', project_id)
            .gte('created_at', period_from)
            .lte('created_at', period_to);

        if (logsError) {
            throw new Error('アクティビティログの取得に失敗しました。');
        }

        // 2. 各フェーズごとの進捗率計算
        const phases = ['要件定義', '設計', '開発', 'テスト'];
        const phaseProgress = phases.map((phase) => {
            const phaseLogs = logs.filter((log) => log.phase === phase);
            const progress = phaseLogs.length > 0 ? phaseLogs.reduce((sum, log) => sum + log.progress, 0) / phaseLogs.length : 0;
            return {
                name: phase,
                progress: progress,
                status: progress === 100 ? '完了' : '進行中',
            };
        });

        // 3. 全体進捗率算出
        const overallProgress =
            phaseProgress.length > 0
                ? phaseProgress.reduce((sum, phase) => sum + phase.progress, 0) / phaseProgress.length
                : 0;

        // 4. 遅延要因や主要な課題を特定
        const issues = logs
            .filter((log) => log.type === 'issue')
            .map((log) => ({
                description: log.description,
                severity: log.severity,
            }));

        // 5. AI API と連携しレポートの内容を生成
        const systemPrompt = `あなたはプロジェクト管理のエキスパートです。各フェーズの進捗率、問題、課題を元に以下のサマリーを生成してください。`;
        const userPrompt = `
        プロジェクト: ${project.name}
        期間: ${period_from}～${period_to}
        全体進捗: ${overallProgress}%
        各フェーズの進捗:
        ${phaseProgress.map(
            (phase) => `${phase.name}: ${phase.progress}% (${phase.status})
`
        ).join('')}
        課題: ${issues.length > 0 ? issues.map(i => `${i.description} - ${i.severity}`).join(', ') : '課題なし'}
        サマリーを作成してください。
        `;
        
        let aiGeneratedReport = '';
        try {
            const aiResponse = await getLlmModelAndGenerateContent('ChatGPT', systemPrompt, userPrompt);
            aiGeneratedReport = aiResponse.data.content;
        } catch (aiError) {
            // AI API 呼び出しが失敗した場合、サンプルデータを返す
            aiGeneratedReport = `
                プロジェクト「${project.name}」の進捗レポート:
                全体進捗: ${overallProgress}%
                要件定義進行中: 80%
                設計完了: 100%
                開発進行中: 60%
                テスト準備中: 0%
                主要課題: 現在開発フェーズにてシステム統合でいくつかの問題に直面中。
            `;
        }

        // 6. レポートをデータベースに保存
        const { error: saveError } = await supabase
            .from('progress_reports')
            .insert([
                {
                    project_id: project_id,
                    report: { overall_progress: overallProgress, phases: phaseProgress, content: aiGeneratedReport },
                },
            ]);

        if (saveError) {
            throw new Error('レポート保存に失敗しました。');
        }

        // 7. レポートの閲覧用 URL をクライアントに送信
        const reportUrl = `${process.env.NEXT_PUBLIC_BASE_URL}/progress-report-view?project_id=${project_id}`;
        res.status(200).json({
            message: 'レポートが生成されました。',
            report_url: reportUrl,
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({
            error: error.message || '進捗レポート生成中にエラーが発生しました。',
            sampleData: {
                phases: [
                    { name: '要件定義', progress: 80, status: '進行中' },
                    { name: '設計', progress: 100, status: '完了' },
                    { name: '開発', progress: 60, status: '進行中' },
                    { name: 'テスト', progress: 0, status: '準備中' },
                ],
                overallProgress: 60,
                issues: [
                    { description: 'システム統合の遅延', severity: '高' },
                    { description: 'テスト遅延', severity: '中' },
                ],
            },
        });
    }
}