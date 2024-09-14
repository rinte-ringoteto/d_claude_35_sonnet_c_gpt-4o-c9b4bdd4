tsx
import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { supabase } from '@/supabase';
import Topbar from '@/components/Topbar';
import { AiOutlineLoading3Quarters } from 'react-icons/ai';

const WorkEstimation = () => {
    const router = useRouter();
    const [projects, setProjects] = useState<any[]>([]);
    const [selectedProject, setSelectedProject] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [progress, setProgress] = useState<number>(0);
    const [estimateResult, setEstimateResult] = useState<any | null>(null);

    useEffect(() => {
        const fetchProjects = async () => {
            const user = supabase.auth.user();
            if (!user) {
                router.push('/login');
                return;
            }

            try {
                const { data, error } = await supabase
                    .from('projects')
                    .select('*')
                    .eq('created_by', user.id);

                if (error) throw error;
                setProjects(data || []);
            } catch (err) {
                setProjects([
                    // サンプルデータ
                    { id: 'sample-1', name: 'サンプルプロジェクト1' },
                    { id: 'sample-2', name: 'サンプルプロジェクト2' },
                ]);
            }
        };

        fetchProjects();
    }, []);

    const handleStartEstimate = async () => {
        if (!selectedProject) return;
        setIsLoading(true);
        setProgress(0);

        try {
            // Progress simulation
            const progressInterval = setInterval(() => {
                setProgress((prev) => (prev < 100 ? prev + 10 : 100));
            }, 1000);

            // Backend API呼び出しフロー (見積リクエスト)
            const { data, error } = await supabase
                .from('work_estimates')
                .select('*')
                .eq('project_id', selectedProject);

            if (error) throw error;

            setTimeout(() => {
                clearInterval(progressInterval);
                setIsLoading(false);
                setEstimateResult(data);
                router.push('/work-estimation-result');
            }, 10000); // Mock estimation process delay

        } catch (err) {
            setIsLoading(false);
            // サンプルデータを反映
            setEstimateResult({
                total_hours: 200,
                breakdown: [
                    { phase: '要件定義', hours: 40 },
                    { phase: '設計', hours: 60 },
                    { phase: '開発', hours: 80 },
                    { phase: 'テスト', hours: 20 },
                ],
            });
            router.push('/work-estimation-result');
        }
    };

    return (
        <div className="min-h-screen h-full bg-[#F8F8F8]">
            <Topbar />
            <div className="flex">
                <div className="w-64 h-screen bg-[#4A90E2] flex flex-col text-white">
                    <h2 className="text-2xl font-bold p-4">メニュー</h2>
                    <ul className="flex flex-col px-4">
                        <li className="mb-4">
                            <a href="/dashboard" className="hover:underline">ダッシュボード</a>
                        </li>
                        <li className="mb-4">
                            <a href="/file-upload" className="hover:underline">ファイルアップロード</a>
                        </li>
                        <li className="mb-4">
                            <a href="/document-generation" className="hover:underline">ドキュメント生成</a>
                        </li>
                        <li className="mb-4">
                            <a href="/source-code-generation" className="hover:underline">ソースコード生成</a>
                        </li>
                        <li className="mb-4">
                            <a href="/work-estimation" className="hover:underline font-bold">工数見積</a>
                        </li>
                    </ul>
                </div>

                <div className="flex-1 p-8">
                    <h1 className="text-3xl font-bold mb-8">工数見積画面</h1>
                    <p className="text-lg mb-6">プロジェクトを選択し、工数見積を開始してください。</p>

                    <label className="block mb-4 text-lg">見積対象プロジェクト</label>
                    <select
                        className="p-2 rounded border-2 border-gray-300 mb-8"
                        value={selectedProject || ""}
                        onChange={(e) => setSelectedProject(e.target.value)}
                    >
                        <option value="" disabled>プロジェクトを選択してください</option>
                        {projects.map((project) => (
                            <option key={project.id} value={project.id}>
                                {project.name}
                            </option>
                        ))}
                    </select>

                    <button
                        className="bg-[#4A90E2] text-white text-lg px-6 py-2 rounded hover:bg-blue-600 disabled:bg-gray-400"
                        onClick={handleStartEstimate}
                        disabled={!selectedProject || isLoading}
                    >
                        {isLoading ? "見積中..." : "見積開始"}
                    </button>

                    {isLoading && (
                        <div className="mt-8 flex items-center">
                            <AiOutlineLoading3Quarters className="animate-spin text-3xl mr-2 text-[#F5A623]" />
                            <p>{progress}% 完了</p>
                        </div>
                    )}

                    {estimateResult && (
                        <div className="mt-8">
                            <h2 className="text-2xl font-bold">見積結果</h2>
                            <p className="mt-2 text-lg">総工数: {estimateResult.total_hours} 時間</p>
                            <ul className="mt-4">
                                {estimateResult.breakdown.map((item: any, index: number) => (
                                    <li key={index} className="mt-2">
                                        {item.phase}: {item.hours} 時間
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default WorkEstimation;