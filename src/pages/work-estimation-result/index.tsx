tsx
import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import axios from 'axios';
import Topbar from '@/components/Topbar';
import { AiOutlineEdit } from 'react-icons/ai';
import { supabase } from '@/supabase';
import Link from 'next/link';

const WorkEstimationResult = () => {
    const [workEstimationData, setWorkEstimationData] = useState<any | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const router = useRouter();

    useEffect(() => {
        const fetchData = async () => {
            try {
                const { data, error } = await supabase
                    .from('work_estimates')
                    .select('estimate')
                    .eq('project_id', router.query.projectId);
                
                if (error) throw error;
                
                if (data && data.length > 0) {
                    setWorkEstimationData(data[0]);
                } else {
                    setWorkEstimationData({
                        estimate: {
                            total_hours: 120,
                            breakdown: [
                                { phase: '企画', hours: 40 },
                                { phase: '開発', hours: 60 },
                                { phase: 'テスト', hours: 20 }
                            ]
                        }
                    });
                }
            } catch (err) {
                console.error('Error fetching data:', err);
                // Fallback sample data
                setWorkEstimationData({
                    estimate: {
                        total_hours: 120,
                        breakdown: [
                            { phase: '企画', hours: 40 },
                            { phase: '開発', hours: 60 },
                            { phase: 'テスト', hours: 20 }
                        ]
                    }
                });
            } finally {
                setIsLoading(false);
            }
        };

        if (router.query.projectId) {
            fetchData();
        }
    }, [router.query.projectId]);

    const handleAdjustment = (phase: string) => {
        // Adjust the estimation logic (could integrate future functionality)
        console.log(`Adjusting phase: ${phase}`);
    };

    if (isLoading) return <p>Loading...</p>;

    return (
        <div className="min-h-screen h-full flex flex-col bg-gray-100">
            <Topbar />
            <div className="px-8 py-6 flex flex-row">
                <Sidebar />
                <div className="flex-1 bg-white rounded-lg shadow-lg p-8">
                    <h1 className="text-2xl font-bold text-gray-800 mb-6">工数見積結果</h1>
                    
                    {/* 総工数表示 */}
                    <p className="text-lg font-medium mb-4">
                        <span className="font-bold">総工数:</span> {workEstimationData?.estimate.total_hours} 時間
                    </p>

                    {/* フェーズ別工数内訳 */}
                    <div className="mb-6">
                        <h2 className="text-xl font-semibold text-gray-700 mb-3">フェーズ別工数内訳</h2>
                        <div className="grid grid-cols-3 gap-4">
                            {workEstimationData?.estimate.breakdown.map((item: any, idx: number) => (
                                <div key={idx} className="flex justify-between items-center bg-gray-50 p-4 rounded-lg shadow-sm">
                                    <span className="text-gray-600 font-medium">{item.phase}</span>
                                    <span className="text-blue-600">{item.hours} 時間</span>
                                    <AiOutlineEdit
                                        className="text-blue-400 hover:text-blue-600 cursor-pointer"
                                        onClick={() => handleAdjustment(item.phase)}
                                    />
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* 工数調整オプション */}
                    <div className="mt-6">
                        <h2 className="text-xl font-semibold text-gray-700 mb-3">工数調整オプション</h2>
                        <button className="bg-orange-500 text-white font-medium px-6 py-2 rounded-md hover:bg-orange-600 transition">
                            見積を調整
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

const Sidebar = () => {
    return (
        <div className="w-64 bg-blue-600 h-full p-4 text-white">
            <ul>
                <li className="mb-4">
                    <Link href="/dashboard">
                        <a className="font-medium text-lg block">ダッシュボード</a>
                    </Link>
                </li>
                <li className="mb-4">
                    <Link href="/work-estimation-result">
                        <a className="font-medium text-lg block">工数見積結果</a>
                    </Link>
                </li>
                <li className="mb-4">
                    <Link href="/source-code-display">
                        <a className="font-medium text-lg block">ソースコード表示</a>
                    </Link>
                </li>
                <li className="mb-4">
                    <Link href="/progress-report">
                        <a className="font-medium text-lg block">進捗レポート</a>
                    </Link>
                </li>
            </ul>
        </div>
    );
};

export default WorkEstimationResult;