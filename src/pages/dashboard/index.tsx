tsx
import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { AiOutlinePlus, AiOutlineProject, AiOutlineFolder, AiOutlineFileText } from 'react-icons/ai';
import Link from 'next/link';
import axios from 'axios';
import supabase from '@/supabase';
import Topbar from '@/components/Topbar';

interface Project {
    id: string;
    name: string;
    description: string;
}

const Dashboard = () => {
    const [projects, setProjects] = useState<Project[]>([]);
    const [fetchError, setFetchError] = useState(false);
    const router = useRouter();
    
    useEffect(() => {
        const fetchProjects = async () => {
            const { data, error } = await supabase
                .from('projects')
                .select('id, name, description')
                .order('created_at', { ascending: false });

            if (error || !data) {
                setProjects([
                    { id: '1', name: 'Sample Project A', description: 'This is a sample project.' },
                    { id: '2', name: 'Sample Project B', description: 'This is another sample project.' },
                ]);
                setFetchError(true);
            } else {
                setProjects(data);
            }
        };

        fetchProjects();
    }, []);

    const handleCreateProject = async () => {
        router.push('/new-project'); 
    };

    return (
        <div className="min-h-screen h-full bg-[#F8F8F8] flex flex-col">
            <Topbar />
            <div className="flex flex-1">
                {/* Sidebar */}
                <div className="bg-[#4A90E2] text-white w-64 flex flex-col p-4 space-y-4">
                    <Link href="/dashboard" className="text-xl font-bold hover:bg-[#50E3C2] p-2 rounded">
                        ダッシュボード
                    </Link>
                    <Link href="/document-generation" className="hover:bg-[#50E3C2] p-2 rounded">
                        <AiOutlineFileText className="inline mr-2" /> ドキュメント生成
                    </Link>
                    <Link href="/source-code-generation" className="hover:bg-[#50E3C2] p-2 rounded">
                        <AiOutlineFolder className="inline mr-2" /> ソースコード生成
                    </Link>
                    <Link href="/quality-check" className="hover:bg-[#50E3C2] p-2 rounded">
                        <AiOutlineProject className="inline mr-2" /> 品質チェック
                    </Link>
                    <Link href="/work-estimation" className="hover:bg-[#50E3C2] p-2 rounded">
                        <AiOutlineProject className="inline mr-2" /> 工数見積
                    </Link>
                    <Link href="/progress-report" className="hover:bg-[#50E3C2] p-2 rounded">
                        <AiOutlineProject className="inline mr-2" /> 進捗レポート
                    </Link>
                </div>

                {/* Main content */}
                <div className="flex-1 p-8">
                    {/* Header */}
                    <div className="flex justify-between items-center mb-8">
                        <h1 className="text-2xl font-semibold text-[#333333]">プロジェクト一覧</h1>
                        <button
                            onClick={handleCreateProject}
                            className="bg-[#4A90E2] hover:bg-[#357ABD] text-white py-2 px-4 rounded flex items-center"
                        >
                            <AiOutlinePlus className="mr-2" />
                            新規プロジェクト作成
                        </button>
                    </div>

                    {/* Project List */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        {projects.map((project) => (
                            <div
                                key={project.id}
                                className="bg-white p-6 rounded-lg shadow hover:shadow-lg transition cursor-pointer"
                                onClick={() => router.push(`/project/${project.id}`)}
                            >
                                <h2 className="text-xl font-bold text-[#333333]">{project.name}</h2>
                                <p className="text-[#666666] mt-2">{project.description}</p>
                            </div>
                        ))}
                    </div>

                    {/* Fallback in case of error fetching projects */}
                    {fetchError && (
                        <div className="mt-8 text-center text-red-600">
                            プロジェクトの読み込みに失敗しました。サンプルデータを表示します。
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Dashboard;