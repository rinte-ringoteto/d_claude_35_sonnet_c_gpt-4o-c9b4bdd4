typescript
import { useState, useEffect } from 'react';
import axios from 'axios';
import { ProgressBar } from 'react-bootstrap';
import { useRouter } from 'next/router';
import { FaCheckCircle, FaPlay } from 'react-icons/fa';
import Topbar from '@/components/Topbar';
import supabase from '@/supabase';

type Document = {
    id: string;
    name: string;
    type: string;
};

const ConsistencyCheck = () => {
    const router = useRouter();
    const [documents, setDocuments] = useState<Document[]>([]);
    const [selectedDocumentId, setSelectedDocumentId] = useState<string | null>(null);
    const [progress, setProgress] = useState<number>(0);
    const [checking, setChecking] = useState<boolean>(false);

    // Supabase authentication
    const [user, setUser] = useState<any>(null);
    const checkAuth = async () => {
        const { data, error } = await supabase.auth.getSession();
        if (error || !data.session) {
            router.push('/login');
        } else {
            setUser(data.session.user);
        }
    };

    useEffect(() => {
        const fetchDocuments = async () => {
            const { data, error } = await supabase
                .from('documents')
                .select('*');
            if (error) {
                setDocuments([
                    { id: '1', name: '要件定義書', type: '要件定義' },
                    { id: '2', name: 'システム設計書', type: 'システム設計' }
                ]);
            } else {
                setDocuments(data);
            }
        };

        fetchDocuments();
        checkAuth();
    }, []);

    const startCheck = async () => {
        if (!selectedDocumentId || checking) return;
        setChecking(true);

        try {
            const response = await axios.post('/api/consistency-check', {
                documentId: selectedDocumentId
            });

            if (response.status === 200) {
                let interval = setInterval(() => {
                    setProgress((prev) => {
                        if (prev >= 100) {
                            clearInterval(interval);
                            router.push('/consistency-check-result');
                        }
                        return prev + 10;
                    });
                }, 300);
            }
        } catch (error) {
            alert('チェックに失敗しました。再試行してください。');
            setChecking(false);
        }
    };

    return (
        <div className="min-h-screen h-full bg-gray-100">
            <Topbar />
            <div className="flex">
                <aside className="w-64 bg-white shadow-lg">
                    <ul className="flex flex-col py-4">
                        <li className="text-gray-700 text-lg font-bold px-8 py-4">
                            <FaCheckCircle className="inline mr-2"/> 整合性チェック
                        </li>
                        <li className="px-8 py-2 hover:bg-gray-200">
                            <a href="/document-generation" className="block text-gray-600">ドキュメント生成</a>
                        </li>
                        <li className="px-8 py-2 hover:bg-gray-200">
                            <a href="/source-code-generation" className="block text-gray-600">ソースコード生成</a>
                        </li>
                        <li className="px-8 py-2 hover:bg-gray-200">
                            <a href="/quality-check" className="block text-gray-600">品質チェック</a>
                        </li>
                    </ul>
                </aside>

                <main className="flex-1 p-8">
                    <div className="bg-white p-6 rounded shadow-md">
                        <h1 className="text-2xl font-bold text-gray-800 mb-4">ドキュメント選択</h1>

                        <div className="mb-6">
                            <label className="text-gray-700 font-semibold">ドキュメントを選択してください</label>
                            <select
                                className="block w-full mt-2 p-2 border border-gray-300 rounded"
                                value={selectedDocumentId || ''}
                                onChange={(e) => setSelectedDocumentId(e.target.value)}
                            >
                                <option value="">選択</option>
                                {documents.map((doc) => (
                                    <option key={doc.id} value={doc.id}>
                                        {doc.name} - {doc.type}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div className="flex justify-between items-center">
                            <button
                                className={`px-6 py-2 rounded text-white font-medium ${
                                    checking ? 'bg-gray-400' : 'bg-blue-500 hover:bg-blue-600'
                                }`}
                                onClick={startCheck}
                                disabled={checking || !selectedDocumentId}
                            >
                                <FaPlay className="inline mr-2" />
                                {checking ? 'チェック中...' : 'チェック開始'}
                            </button>

                            {checking && (
                                <div className="w-full ml-4">
                                    <ProgressBar animated striped now={progress} label={`${progress}%`} />
                                </div>
                            )}
                        </div>

                        <div className="mt-6 text-gray-500 text-sm">
                            <img src="https://placehold.co/600x400" alt="placeholder" className="w-full h-auto rounded" />
                            チェック完了後、自動的に結果画面へ遷移します。
                        </div>
                    </div>
                </main>
            </div>
        </div>
    );
};

export default ConsistencyCheck;