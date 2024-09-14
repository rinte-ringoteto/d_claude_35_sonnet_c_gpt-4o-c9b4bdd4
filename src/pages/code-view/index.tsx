tsx
import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { AiFillEdit, AiOutlineDownload } from 'react-icons/ai';
import Topbar from '@/components/Topbar';
import { createClient } from '@supabase/supabase-js';
import { saveAs } from 'file-saver';

// Supabase設定
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!);

export default function CodeView() {
    const [sourceCode, setSourceCode] = useState('');
    const [fileName, setFileName] = useState('');
    const [loading, setLoading] = useState(false);
    const router = useRouter();
    
    // Supabaseからソースコードを取得
    useEffect(() => {
        const fetchSourceCode = async () => {
            setLoading(true);
            try {
                const { data, error } = await supabase
                    .from('source_codes')
                    .select('content, file_name')
                    .single();
                
                if (error) throw error;

                setSourceCode(data.content ?? 'ソースコードが見つかりません');
                setFileName(data.file_name ?? 'code.tsx');
            } catch (error) {
                setSourceCode('サンプルコード
// エラーが発生しました');
                setFileName('sample_code.tsx');
            } finally {
                setLoading(false);
            }
        };

        fetchSourceCode();
    }, []);

    // ダウンロード処理
    const handleDownload = () => {
        const blob = new Blob([sourceCode], { type: 'text/plain;charset=utf-8' });
        saveAs(blob, fileName);
    };

    // 編集ページへの遷移
    const handleEditClick = () => {
        router.push('/edit-code');
    };

    return (
        <div className="min-h-screen h-full bg-gray-100">
            <Topbar />
            
            <div className="flex">
                {/* サイドバー */}
                <Sidebar />

                {/* メインコンテンツ */}
                <main className="flex-1 p-8">
                    <div className="max-w-4xl mx-auto">
                        <div className="flex justify-between items-center">
                            <h1 className="text-2xl font-bold text-gray-800">ソースコード表示画面</h1>
                            <div>
                                <button
                                    onClick={handleEditClick}
                                    className="bg-blue-500 hover:bg-blue-400 text-white font-medium px-4 py-2 rounded mr-4"
                                >
                                    <AiFillEdit className="inline-block mr-2" />
                                    編集
                                </button>
                                <button
                                    onClick={handleDownload}
                                    className="bg-teal-500 hover:bg-teal-400 text-white font-medium px-4 py-2 rounded"
                                >
                                    <AiOutlineDownload className="inline-block mr-2" />
                                    ダウンロード
                                </button>
                            </div>
                        </div>

                        <div className="mt-6 bg-white p-6 shadow-md rounded">
                            {loading ? (
                                <p>読み込み中...</p>
                            ) : (
                                <pre className="bg-gray-200 p-4 rounded overflow-x-auto">
                                    <code>{sourceCode}</code>
                                </pre>
                            )}
                        </div>
                    </div>
                </main>
            </div>
        </div>
    );
}

// サイドバーコンポーネント
const Sidebar = () => {
    const router = useRouter();

    const menuItems = [
        { name: 'マイページ', path: '/mypage' },
        { name: 'ドキュメント生成', path: '/document-generation' },
        { name: '品質チェック', path: '/quality-check' },
        { name: '進捗レポート', path: '/progress-report' },
    ];

    return (
        <aside className="w-64 bg-gray-800 text-white p-8">
            <h2 className="text-lg font-bold">メニュー</h2>
            <ul className="mt-4">
                {menuItems.map((item) => (
                    <li key={item.name} className="mt-4">
                        <button
                            className="text-left w-full text-white hover:bg-gray-700 px-4 py-2 rounded"
                            onClick={() => router.push(item.path)}
                        >
                            {item.name}
                        </button>
                    </li>
                ))}
            </ul>
        </aside>
    );
};