tsx
import { useEffect, useState } from 'react';
import Topbar from '@/components/Topbar';
import { useRouter } from 'next/router';
import { DocumentTextIcon, CodeIcon, PlayIcon } from 'react-icons/hi';
import { CircularProgress } from '@mui/material';
import axios from 'axios';
import { createClient } from '@supabase/supabase-js';
import '@/styles/globals.css';

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!);

const CodeGeneration = () => {
    const router = useRouter();
    
    const [documents, setDocuments] = useState([]);
    const [selectedDocument, setSelectedDocument] = useState('');
    const [selectedLanguage, setSelectedLanguage] = useState('');
    const [progress, setProgress] = useState(0);
    const [isGenerating, setIsGenerating] = useState(false);

    useEffect(() => {
        async function fetchDocuments() {
            const { data, error } = await supabase
                .from('documents')
                .select('*');

            if (error) {
                console.log('Error fetching documents', error);
                setDocuments([
                    { id: 'sample-doc-1', name: '要件定義書' },
                    { id: 'sample-doc-2', name: 'システム設計書' },
                ]);
            } else {
                setDocuments(data);
            }
        }

        fetchDocuments();
    }, []);

    const handleGenerationStart = async () => {
        if (!selectedDocument || !selectedLanguage) {
            alert('生成対象とプログラミング言語を選択してください。');
            return;
        }

        setIsGenerating(true);
        setProgress(0);

        try {
            const response = await axios.post('/api/code-generation', {
                documentId: selectedDocument,
                language: selectedLanguage,
            });

            // Simulating real-time progress update
            let progressInterval = setInterval(() => {
                setProgress(prevProgress => {
                    if (prevProgress >= 100) {
                        clearInterval(progressInterval);
                        router.push('/source-code-view');
                    }
                    return prevProgress + 10;
                });
            }, 500);

        } catch (error) {
            console.error('Error generating code:', error);
            setIsGenerating(false);
        }
    };

    return (
        <div className="min-h-screen h-full bg-gray-50">
            <Topbar />
            <div className="flex flex-col lg:flex-row">
                <Sidebar />
                <main className="flex-1 p-8">
                    <h1 className="text-2xl font-bold text-gray-800 mb-6">ソースコード生成</h1>

                    <div className="mb-4">
                        <label className="block text-gray-700 text-lg mb-2">生成対象のドキュメントを選択</label>
                        <select 
                            value={selectedDocument} 
                            onChange={(e) => setSelectedDocument(e.target.value)} 
                            className="border-b-2 border-gray-400 focus:border-blue-500 pb-1 w-full"
                        >
                            <option value="" disabled>--- ドキュメントを選択してください ---</option>
                            {documents.map(doc => (
                                <option key={doc.id} value={doc.id}>{doc.name}</option>
                            ))}
                        </select>
                    </div>

                    <div className="mb-4">
                        <label className="block text-gray-700 text-lg mb-2">生成するプログラミング言語を選択</label>
                        <select
                            value={selectedLanguage}
                            onChange={(e) => setSelectedLanguage(e.target.value)}
                            className="border-b-2 border-gray-400 focus:border-blue-500 pb-1 w-full"
                        >
                            <option value="" disabled>--- 言語を選択してください ---</option>
                            <option value="typescript">TypeScript</option>
                            <option value="javascript">JavaScript</option>
                            <option value="python">Python</option>
                            <option value="java">Java</option>
                        </select>
                    </div>

                    <button
                        onClick={handleGenerationStart}
                        className={`mt-8 w-full bg-blue-500 text-white font-medium py-2 rounded-md hover:bg-blue-600 transition ${isGenerating ? 'opacity-50 cursor-not-allowed' : ''}`}
                        disabled={isGenerating}
                    >
                        {isGenerating ? (
                            <div className="flex items-center justify-center">
                                <CircularProgress size={20} className="mr-2" />
                                生成中...
                            </div>
                        ) : (
                            <>
                                <PlayIcon className="inline-block mr-2" />
                                生成開始
                            </>
                        )}
                    </button>

                    {isGenerating && (
                        <div className="mt-8">
                            <h2 className="text-lg text-gray-700">生成進捗</h2>
                            <div className="w-full bg-gray-200 rounded-full h-4 mt-2">
                                <div 
                                    className="bg-blue-500 h-4 rounded-full transition-all"
                                    style={{ width: `${progress}%` }}
                                ></div>
                            </div>
                        </div>
                    )}
                </main>
            </div>
        </div>
    );
};

const Sidebar = () => {
    return (
        <div className="w-full lg:w-64 bg-white shadow-md h-full">
            <div className="p-8">
                <ul>
                    <SidebarItem href="/dashboard" label="ダッシュボード" icon={<CodeIcon />} />
                    <SidebarItem href="/document-upload" label="ドキュメント生成" icon={<DocumentTextIcon />} />
                    <SidebarItem href="/quality-check" label="品質チェック" icon={<DocumentTextIcon />} />
                </ul>
            </div>
        </div>
    );
};

const SidebarItem = ({ href, label, icon }: { href: string, label: string, icon: React.ReactNode }) => {
    const router = useRouter();

    return (
        <li 
            className={`flex items-center py-4 px-4 mb-2 rounded hover:bg-gray-100 cursor-pointer ${router.pathname === href ? 'bg-gray-200' : ''}`}
            onClick={() => router.push(href)}
        >
            {icon}
            <span className="ml-4">{label}</span>
        </li>
    );
};

export default CodeGeneration;