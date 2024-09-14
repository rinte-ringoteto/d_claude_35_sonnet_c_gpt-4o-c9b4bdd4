tsx
import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import axios from 'axios';
import { AiOutlineFile, AiOutlineCheckCircle } from 'react-icons/ai';
import { BiLoaderCircle } from 'react-icons/bi';
import Topbar from '@/components/Topbar';
import supabase from '@/supabase';
import Link from 'next/link';

export default function DocumentGeneration() {
    const router = useRouter(); 
    const [documentType, setDocumentType] = useState<string>('要件定義');
    const [generationState, setGenerationState] = useState<'idle' | 'loading' | 'completed'>('idle');
    const [progress, setProgress] = useState<number>(0);
    const [error, setError] = useState<string | null>(null);

    const userAuthenticated = async () => {
        const { data, error } = await supabase.auth.getSession();
        if (!data.session || error) {
            router.push('/login');
        }
    };

    useEffect(() => {
        userAuthenticated();
    }, []);

    const handleGenerateDocument = async () => {
        setGenerationState('loading');
        setProgress(0);

        try {
            const response = await axios.get('/api/document-generation', {
                params: { type: documentType },
                onDownloadProgress: (progressEvent) => {
                    let percent = Math.round((progressEvent.loaded * 100) / progressEvent.total);
                    setProgress(percent);
                },
            });

            if (response.data.success) {
                setGenerationState('completed');
                setTimeout(() => router.push('/document-display'), 2000);
            }
        } catch (error) {
            setError('ドキュメント生成に失敗しました。');
            setGenerationState('idle');
        }
    };

    return (
        <div className="min-h-screen h-full bg-[#F8F8F8] text-[#333333]">
            <Topbar />
            <div className="flex">
                <Sidebar />
                <div className="container mx-auto p-8">
                    <h1 className="text-2xl font-bold text-[#4A90E2] mb-8">ドキュメント生成</h1>
                    <div className="max-w-lg border p-6 rounded-lg bg-white shadow-md">
                        <div className="mb-4">
                            <label className="block text-sm font-semibold">ドキュメントの種類:</label>
                            <select
                                value={documentType}
                                onChange={(e) => setDocumentType(e.target.value)}
                                className="w-full mt-2 p-2 border-b focus:border-[#4A90E2] outline-none"
                            >
                                <option value="要件定義">要件定義</option>
                                <option value="システム設計">システム設計</option>
                                <option value="開発">開発</option>
                                <option value="テスト">テスト</option>
                                <option value="提案資料">提案資料</option>
                            </select>
                        </div>

                        {generationState === 'idle' && (
                            <button
                                onClick={handleGenerateDocument}
                                className="w-full p-3 text-white bg-[#4A90E2] rounded-lg font-medium hover:bg-opacity-90 transition duration-300"
                            >
                                生成開始
                            </button>
                        )}

                        {generationState === 'loading' && (
                            <div className="text-center">
                                <BiLoaderCircle className="animate-spin text-5xl text-[#50E3C2] mx-auto mt-4" />
                                <p className="mt-2">生成中... {progress}%</p>
                            </div>
                        )}

                        {generationState === 'completed' && (
                            <div className="text-center">
                                <AiOutlineCheckCircle className="text-5xl text-[#50E3C2] mx-auto mt-4" />
                                <p className="mt-2">生成完了！ドキュメント表示画面へ自動遷移します。</p>
                            </div>
                        )}

                        {error && <p className="text-red-500 mt-4">{error}</p>}
                    </div>
                </div>
            </div>
        </div>
    );
}

function Sidebar() {
    return (
        <div className="w-64 p-4 bg-white min-h-screen border-r">
            <ul>
                <li className="mb-4">
                    <Link href="/dashboard">
                        <a className="flex items-center p-2 hover:bg-[#F5A623] rounded transition">
                            <AiOutlineFile className="mr-2" /> ダッシュボード
                        </a>
                    </Link>
                </li>
                <li className="mb-4">
                    <Link href="/file-upload">
                        <a className="flex items-center p-2 hover:bg-[#F5A623] rounded transition">
                            <AiOutlineFile className="mr-2" /> ファイルアップロード
                        </a>
                    </Link>
                </li>
                <li className="mb-4">
                    <Link href="/document-generation">
                        <a className="flex items-center p-2 bg-[#4A90E2] text-white rounded transition">
                            <AiOutlineFile className="mr-2" /> ドキュメント生成
                        </a>
                    </Link>
                </li>
                <li className="mb-4">
                    <Link href="/source-code-generation">
                        <a className="flex items-center p-2 hover:bg-[#F5A623] rounded transition">
                            <AiOutlineFile className="mr-2" /> ソースコード生成
                        </a>
                    </Link>
                </li>
                <li className="mb-4">
                    <Link href="/quality-check">
                        <a className="flex items-center p-2 hover:bg-[#F5A623] rounded transition">
                            <AiOutlineFile className="mr-2" /> 品質チェック
                        </a>
                    </Link>
                </li>
            </ul>
        </div>
    );
}