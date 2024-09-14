tsx
import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { AiFillEdit, AiOutlineDownload } from 'react-icons/ai';
import Topbar from '@/components/Topbar';
import { supabase } from '@/supabase';
import Link from 'next/link';

const DocumentView = () => {
    const router = useRouter();
    const [documents, setDocuments] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchDocuments = async () => {
            try {
                const { data, error } = await supabase
                    .from('documents')
                    .select('id, content, updated_at')
                    .order('updated_at', { ascending: false });

                if (error) {
                    throw error;
                }

                setDocuments(data);
            } catch (err) {
                setError('ドキュメントの読み込みに失敗しました。サンプルデータを表示します。');
                setDocuments([
                    {
                        id: 'sample-doc-1',
                        content: { title: 'サンプルドキュメント 1', sections: [{ heading: 'セクション 1', content: 'コンテンツ 1' }] },
                        updated_at: '2023-01-01T12:00:00+09:00',
                    },
                    {
                        id: 'sample-doc-2',
                        content: { title: 'サンプルドキュメント 2', sections: [{ heading: 'セクション 2', content: 'コンテンツ 2' }] },
                        updated_at: '2023-01-02T12:00:00+09:00',
                    },
                ]);
            } finally {
                setLoading(false);
            }
        };

        fetchDocuments();
    }, []);

    const handleDownload = (documentId: string) => {
        // Dummy function, supposed to handle the download logic.
        alert(`${documentId} ドキュメントのダウンロードを開始します。`);
    };

    const handleEdit = (documentId: string) => {
        router.push(`/document-edit/${documentId}`);
    };

    return (
        <div className="min-h-screen h-full bg-[#F8F8F8] text-[#333333]">
            <Topbar />
            <div className="flex">
                <aside className="w-64 h-screen bg-white shadow-md">
                    <nav className="py-6 px-4">
                        <ul className="space-y-4">
                            <li>
                                <Link href="/dashboard">
                                    <a className="text-[#4A90E2] hover:underline">ダッシュボード</a>
                                </Link>
                            </li>
                            <li>
                                <Link href="/document-view">
                                    <a className="text-[#4A90E2] hover:underline">ドキュメント一覧</a>
                                </Link>
                            </li>
                            <li>
                                <Link href="/source-code-view">
                                    <a className="text-[#4A90E2] hover:underline">ソースコード一覧</a>
                                </Link>
                            </li>
                        </ul>
                    </nav>
                </aside>
                <div className="flex-1 p-8">
                    <h1 className="text-3xl font-bold mb-4">ドキュメント表示画面</h1>

                    {loading ? (
                        <p>読み込み中...</p>
                    ) : error ? (
                        <p className="text-red-500">{error}</p>
                    ) : (
                        <div className="grid grid-cols-1 gap-8">
                            {documents.map((doc) => (
                                <div key={doc.id} className="bg-white p-6 rounded-lg shadow-md">
                                    <h2 className="text-xl font-semibold mb-2">
                                        {doc.content.title}
                                    </h2>
                                    {doc.content.sections.map((section: any, index: number) => (
                                        <div key={index} className="mb-4">
                                            <h3 className="text-lg font-medium">{section.heading}</h3>
                                            <p>{section.content}</p>
                                        </div>
                                    ))}
                                    <div className="flex items-center space-x-4">
                                        <button
                                            className="flex items-center px-4 py-2 bg-[#4A90E2] text-white rounded hover:brightness-90"
                                            onClick={() => handleEdit(doc.id)}
                                        >
                                            <AiFillEdit className="mr-2" />
                                            編集
                                        </button>
                                        <button
                                            className="flex items-center px-4 py-2 bg-[#50E3C2] text-white rounded hover:brightness-90"
                                            onClick={() => handleDownload(doc.id)}
                                        >
                                            <AiOutlineDownload className="mr-2" />
                                            ダウンロード
                                        </button>
                                    </div>
                                    <p className="text-sm text-gray-500 mt-2">
                                        最終更新: {new Date(doc.updated_at).toLocaleString('ja-JP')}
                                    </p>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default DocumentView;