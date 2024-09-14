import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import supabase from '@/supabase';
import Topbar from '@/components/Topbar';
import { AiOutlineLoading3Quarters } from 'react-icons/ai';
import { format } from 'date-fns';
import Link from 'next/link';

export default function ProgressReport() {
    const router = useRouter();
    const [projects, setProjects] = useState([]);
    const [selectedProject, setSelectedProject] = useState<string | null>(null);
    const [reportPeriod, setReportPeriod] = useState({ from: '', to: '' });
    const [isLoading, setLoading] = useState(false);
    const [progress, setProgress] = useState<number>(0);

    useEffect(() => {
        const fetchProjects = async () => {
            const { data, error } = await supabase.from('projects').select('*');
            if (error) {
                console.error(error);
            } else {
                setProjects(data);
            }
        };
        fetchProjects();
    }, []);

    const startReportGeneration = async () => {
        if (!selectedProject || !reportPeriod.from || !reportPeriod.to) {
            alert('全ての情報を入力してください');
            return;
        }
        setLoading(true);
        setProgress(0);

        try {
            const response = await axios.post('/api/progress-report.ts', {
                project_id: selectedProject,
                period_from: reportPeriod.from,
                period_to: reportPeriod.to,
            });
            
            let interval = setInterval(() => {
                setProgress((prevProgress) => {
                    if (prevProgress >= 100) {
                        clearInterval(interval);
                        setLoading(false);
                        router.push('/progress-report-display');
                    }
                    return prevProgress + 10;
                });
            }, 1000);
        } catch (error) {
            console.error('レポート生成エラー:', error);
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen h-full bg-[#F8F8F8]">
            <Topbar />
            <div className="max-w-7xl mx-auto py-8 px-4">
                <h1 className="text-3xl font-bold text-[#333]">進捗レポート生成</h1>

                {/* プロジェクト選択 */}
                <div className="mt-8">
                    <label className="block text-lg font-medium text-[#333]">対象プロジェクト</label>
                    <select value={selectedProject || ''} onChange={(e) => setSelectedProject(e.target.value)} className="mt-2 block w-full p-2 border rounded">
                        <option value="">プロジェクトを選択してください</option>
                        {projects.length > 0 ? (
                            projects.map((project) => (
                                <option key={project.id} value={project.id}>
                                    {project.name}
                                </option>
                            ))
                        ) : (
                            <option>データがありません</option>
                        )}
                    </select>
                </div>

                {/* 期間選択 */}
                <div className="mt-8">
                    <label className="block text-lg font-medium text-[#333]">レポート期間</label>
                    <div className="flex space-x-4 mt-2">
                        <input
                            type="date"
                            value={reportPeriod.from}
                            onChange={(e) => setReportPeriod({ ...reportPeriod, from: e.target.value })}
                            className="p-2 border rounded w-full"
                        />
                        <span>〜</span>
                        <input
                            type="date"
                            value={reportPeriod.to}
                            onChange={(e) => setReportPeriod({ ...reportPeriod, to: e.target.value })}
                            className="p-2 border rounded w-full"
                        />
                    </div>
                </div>

                {/* ボタン */}
                <div className="mt-8">
                    <button
                        onClick={startReportGeneration}
                        className="bg-[#4A90E2] text-white py-2 px-4 rounded-md hover:bg-opacity-90 transition"
                    >
                        生成開始
                    </button>
                </div>

                {/* 進捗表示 */}
                {isLoading && (
                    <div className="mt-8 flex items-center space-x-4">
                        <AiOutlineLoading3Quarters className="animate-spin text-3xl text-[#4A90E2]" />
                        <p className="text-lg font-medium text-[#333]">生成進捗: {progress}%</p>
                    </div>
                )}
            </div>
        </div>
    );
}