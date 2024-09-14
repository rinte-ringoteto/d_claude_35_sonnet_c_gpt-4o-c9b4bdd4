tsx
import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { Bar, Line } from 'react-chartjs-2';
import supabase from '@/supabase';
import Topbar from '@/components/Topbar';
import { FiCheckCircle } from 'react-icons/fi';
import { ImWarning } from 'react-icons/im';
import Link from 'next/link';

const ProgressReportView: React.FC = () => {
    const router = useRouter();
    const [user, setUser] = useState<any>(null);
    const [progressReport, setProgressReport] = useState<any>(null);
    const [issues, setIssues] = useState<any[]>([]);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchData = async () => {
            const { data: userData, error: userError } = await supabase.auth.getUser();
            if (userError) {
                setError('ログイン情報の取得に失敗しました');
                return;
            }
            setUser(userData);

            if (userData) {
                const { data: reportData, error: reportError } = await supabase
                    .from('progress_reports')
                    .select('*')
                    .eq('project_id', 'YOUR_PROJECT_ID') // adjust project ID as necessary!
                    .single();

                if (reportError) {
                    setError('進捗レポートの取得に失敗しました');
                } else {
                    setProgressReport(reportData);
                    setIssues([
                        { title: '課題1', description: 'データベースの最適化が遅れている', type: 'データ遅延' },
                        { title: '課題2', description: 'API呼び出しが予想より遅い', type: 'APIパフォーマンス' },
                    ]);
                }
            }
        };

        fetchData();
    }, []);

    const handleAdjustPlan = () => {
        console.log("プロジェクト計画の調整");
        // プロジェクト計画を調整する処理を実装
    };

    // Placeholder data for entire progress graph
    const overallProgressData = progressReport ? {
        labels: ['現在の進捗'],
        datasets: [
            {
                label: '全体進捗',
                data: [progressReport.report.overall_progress],
                backgroundColor: ['#4A90E2'],
            },
        ],
    } : {
        labels: ['現在の進捗'],
        datasets: [
            {
                label: '全体進捗',
                data: [50], // Replace with backend data if available
                backgroundColor: ['#4A90E2'],
            },
        ],
    };

    // Placeholder data for phase progress details
    const phaseProgressData = progressReport ? {
        labels: progressReport.report.phases.map((phase: any) => phase.name),
        datasets: progressReport.report.phases.map((phase: any) => ({
            label: `${phase.name} 進捗度`,
            data: [phase.progress],
            backgroundColor: phase.progress < 50 ? '#F5A623' : '#50E3C2', // Warning when progress < 50%
        })),
    } : {
        labels: ['設計', '開発', 'テスト'],
        datasets: [
            { label: '設計 進捗度', data: [60], backgroundColor: '#50E3C2' },
            { label: '開発 進捗度', data: [45], backgroundColor: '#F5A623' },
            { label: 'テスト 進捗度', data: [30], backgroundColor: '#F5A623' },
        ],
    };

    return (
        <div className="min-h-screen h-full bg-gray-100">
            <Topbar />
            <div className="flex">
                <aside className="w-64 bg-white p-4 shadow-md">
                    <nav>
                        <ul className="space-y-2">
                            <li>
                                <Link href="/file-upload-view" className="text-blue-500 hover:underline">ファイルアップロード画面</Link>
                            </li>
                            <li>
                                <Link href="/document-view-view" className="text-blue-500 hover:underline">ドキュメント表示画面</Link>
                            </li>
                            <li>
                                <Link href="/source-code-view-view" className="text-blue-500 hover:underline">ソースコード表示画面</Link>
                            </li>
                        </ul>
                    </nav>
                </aside>

                <main className="flex-1 p-8">
                    <h1 className="text-3xl font-bold mb-8">進捗レポート表示画面</h1>

                    {error && (
                        <div className="text-red-500 mb-8">
                            <ImWarning className="inline mr-2" aria-hidden="true" />
                            {error}
                        </div>
                    )}

                    {/* 全体進捗グラフ */}
                    <div className="mb-12">
                        <h2 className="text-2xl font-bold mb-4">全体進捗グラフ</h2>
                        <Line data={overallProgressData} />
                    </div>

                    {/* フェーズ別進捗状況 */}
                    <div className="mb-12">
                        <h2 className="text-2xl font-bold mb-4">フェーズ別進捗状況</h2>
                        <Bar data={phaseProgressData} />
                    </div>

                    {/* 課題リスト */}
                    <div className="mb-12">
                        <h2 className="text-2xl font-bold mb-4">課題リスト</h2>
                        <ul className="space-y-4">
                            {issues.map((issue, index) => (
                                <li key={index} className="p-4 bg-white shadow-md rounded-md">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <h3 className="text-lg font-semibold">{issue.title}</h3>
                                            <p className="text-gray-600">{issue.description}</p>
                                        </div>
                                        <FiCheckCircle className="text-green-500 text-2xl" aria-hidden="true" />
                                    </div>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* プロジェクト計画の調整を検討 */}
                    <div className="text-right">
                        <button
                            className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition"
                            onClick={handleAdjustPlan}
                        >
                            プロジェクト計画の調整を検討
                        </button>
                    </div>
                </main>
            </div>
        </div>
    );
};

export default ProgressReportView;