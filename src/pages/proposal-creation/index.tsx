tsx
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import Topbar from '@/components/Topbar';
import { supabase } from '@/supabase';
import { BsFillPlayFill } from 'react-icons/bs';
import { AiOutlineFile } from 'react-icons/ai';
import { CircularProgressbar } from 'react-circular-progressbar';
import 'react-circular-progressbar/dist/styles.css';
import axios from 'axios';

const ProposalCreation = () => {
    const router = useRouter();
    const [projects, setProjects] = useState([]);
    const [templates, setTemplates] = useState([]);
    const [selectedProject, setSelectedProject] = useState<string | null>(null);
    const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null);
    const [progress, setProgress] = useState<number>(0);
    const [isGenerating, setIsGenerating] = useState(false);

    useEffect(() => {
        const fetchProjectsAndTemplates = async () => {
            const projectRes = await supabase.from('projects').select('*').eq('created_by', supabase.auth.user()?.id);
            const templateRes = await axios.get('/api/templates');
            if (projectRes.error || !projectRes.data) {
                setProjects([{ id: 'sample-project', name: 'サンプルプロジェクト' }]); // Fallback on error
            } else {
                setProjects(projectRes.data);
            }
            if (!templateRes.data) {
                setTemplates([{ id: 'sample-template', name: 'サンプルテンプレート' }]); // Fallback on error
            } else {
                setTemplates(templateRes.data);
            }
        };
        fetchProjectsAndTemplates();
    }, []);

    const handleGenerate = async () => {
        setIsGenerating(true);
        setProgress(0); // Reset progress on new task

        try {
            // Simulate progress increase
            const interval = setInterval(() => {
                setProgress(old => {
                    const newProgress = old + 10;
                    if (newProgress >= 100) {
                        clearInterval(interval);
                        router.push('/proposal-display');
                    }
                    return newProgress;
                });
            }, 1000);

            // Backend call to generate the document
            const response = await axios.post('/api/proposal-creation', {
                projectId: selectedProject,
                templateId: selectedTemplate,
            });
            if (response.status !== 200) throw new Error('生成に失敗しました');

            // Placeholder for completion simulation after API response
        } catch (error) {
            console.error('Error generating the document:', error);
        } finally {
            setIsGenerating(false);
        }
    };

    return (
        <div className="min-h-screen h-full bg-gray-100">
            <Topbar />

            <div className="container mx-auto py-8">
                <div className="grid grid-cols-12 gap-8">
                    <div className="col-span-3">
                        <div className="bg-white p-6 rounded-lg shadow-md">
                            <h2 className="text-xl font-bold mb-4">プロジェクト選択</h2>
                            <ul>
                                {projects.map(project => (
                                    <li key={project.id} className="mb-2">
                                        <button
                                            className={`w-full text-left px-4 py-2 rounded-lg ${selectedProject === project.id
                                                ? 'bg-blue-500 text-white'
                                                : 'bg-gray-200 text-gray-700'
                                                }`}
                                            onClick={() => setSelectedProject(project.id)}
                                        >
                                            {project.name}
                                        </button>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>

                    <div className="col-span-3">
                        <div className="bg-white p-6 rounded-lg shadow-md">
                            <h2 className="text-xl font-bold mb-4">テンプレート選択</h2>
                            <ul>
                                {templates.map(template => (
                                    <li key={template.id} className="mb-2">
                                        <button
                                            className={`w-full text-left px-4 py-2 rounded-lg ${selectedTemplate === template.id
                                                ? 'bg-blue-500 text-white'
                                                : 'bg-gray-200 text-gray-700'
                                                }`}
                                            onClick={() => setSelectedTemplate(template.id)}
                                        >
                                            <AiOutlineFile className="inline-block mr-2" />
                                            {template.name}
                                        </button>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>

                    <div className="col-span-6">
                        <div className="bg-white p-6 rounded-lg shadow-md flex flex-col items-center">
                            <h2 className="text-xl font-bold mb-4">作成開始</h2>

                            <div className="relative w-1/4 mb-4">
                                <CircularProgressbar value={progress} text={`${progress}%`} />
                            </div>

                            <button
                                className={`px-8 py-2 mt-4 text-white rounded-lg font-medium ${selectedProject && selectedTemplate
                                    ? 'bg-orange-500'
                                    : 'bg-gray-400 cursor-not-allowed'
                                    }`}
                                disabled={!selectedProject || !selectedTemplate || isGenerating}
                                onClick={handleGenerate}
                            >
                                <BsFillPlayFill className="inline-block align-middle mr-2" />
                                {isGenerating ? '作成中...' : '作成開始'}
                            </button>

                            {progress === 100 && (
                                <p className="text-green-600 mt-4">提案資料が完成しました！</p>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProposalCreation;