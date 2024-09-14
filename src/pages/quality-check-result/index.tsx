tsx
import { useEffect, useState } from "react";
import { supabase } from "@/supabase";
import Topbar from "@/components/Topbar";
import { FaCheckCircle, FaExclamationCircle, FaLightbulb } from "react-icons/fa";
import Link from "next/link";

const QualityCheckResult = () => {
    const [checkResult, setCheckResult] = useState<any>(null);
    const [user, setUser] = useState<any>(null);

    useEffect(() => {
        // 認証されているユーザーを取得
        const fetchUser = async () => {
            const { data: sessionData } = await supabase.auth.getSession();
            if (sessionData) {
                const { data: userData } = await supabase
                    .from("users")
                    .select("*")
                    .eq("id", sessionData.user.id)
                    .single();

                setUser(userData);
            }
        };

        // 品質チェックの結果を取得
        const fetchCheckResult = async () => {
            const { data, error } = await supabase.from("quality_checks").select("*").eq("project_id", "some_project_id").single();
            if (error) {
                // エラーの場合、サンプルデータを表示
                setCheckResult({
                    result: {
                        score: 75,
                        issues: [
                            { type: "ドキュメント", description: "説明が不足しています", severity: "高" },
                            { type: "ソースコード", description: "変数名が不明瞭です", severity: "中" },
                        ],
                    },
                });
            } else {
                setCheckResult(data);
            }
        };

        fetchUser();
        fetchCheckResult();
    }, []);

    return (
        <div className="min-h-screen h-full bg-gray-100">
            <Topbar />
            <div className="flex">
                <Sidebar />
                <main className="flex-1 px-8 py-8">
                    <h1 className="text-2xl font-bold text-gray-800 mb-8">品質チェック結果</h1>
                    <section>
                        <h2 className="text-xl font-bold text-gray-700 mb-4">サマリー</h2>
                        {checkResult ? (
                            <div className="bg-white shadow-md rounded-lg p-6 mb-8">
                                <div className="flex items-center mb-6">
                                    {checkResult.result.score >= 80 ? (
                                        <FaCheckCircle className="text-green-500 text-xl mr-2" />
                                    ) : (
                                        <FaExclamationCircle className="text-red-500 text-xl mr-2" />
                                    )}
                                    <span className={`text-2xl font-bold ${checkResult.result.score >= 80 ? "text-green-600" : "text-red-600"}`}>
                                        スコア: {checkResult.result.score}%
                                    </span>
                                </div>

                                <h3 className="text-lg font-bold text-gray-700 mb-4">詳細結果リスト</h3>
                                <ul className="space-y-4">
                                    {checkResult.result.issues.map((issue: any, index: number) => (
                                        <li key={index} className="bg-gray-50 p-4 rounded-md flex items-start">
                                            <FaExclamationCircle className="text-orange-500 text-xl mr-4" />
                                            <div>
                                                <h4 className="text-lg font-bold">{issue.type}</h4>
                                                <p className="text-gray-600">{issue.description}</p>
                                                <p className="text-sm text-gray-500">重大度: {issue.severity}</p>
                                            </div>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        ) : (
                            <p>品質チェックデータを取得中...</p>
                        )}
                    </section>

                    <section>
                        <h2 className="text-xl font-bold text-gray-700 mb-4">改善提案</h2>
                        <div className="bg-white shadow-md rounded-lg p-6">
                            <FaLightbulb className="text-yellow-500 text-xl mb-4" />
                            <p className="text-gray-600">
                                改善を行うことで、品質を向上させることができます。特に、ドキュメントの説明不足とソースコードの可読性に注意して修正を行ってください。
                            </p>
                        </div>
                    </section>
                </main>
            </div>
        </div>
    );
};

const Sidebar = () => {
    return (
        <aside className="w-64 bg-blue-700 text-white h-full px-6 py-8">
            <nav className="space-y-4">
                <Link href="/dashboard">
                    <a className="block text-white font-medium">ダッシュボード</a>
                </Link>
                <Link href="/file-upload">
                    <a className="block text-white font-medium">ファイルアップロード</a>
                </Link>
                <Link href="/documents">
                    <a className="block text-white font-medium">ドキュメント表示</a>
                </Link>
                <Link href="/source-code">
                    <a className="block text-white font-medium">ソースコード表示</a>
                </Link>
                <Link href="/quality-check-result">
                    <a className="block text-white font-medium">品質チェック結果表示</a>
                </Link>
                <Link href="/integrity-check">
                    <a className="block text-white font-medium">整合性確認画面</a>
                </Link>
                <Link href="/estimate">
                    <a className="block text-white font-medium">工数見積結果</a>
                </Link>
                <Link href="/proposal">
                    <a className="block text-white font-medium">提案資料表示</a>
                </Link>
                <Link href="/progress-report">
                    <a className="block text-white font-medium">進捗レポート表示</a>
                </Link>
            </nav>
        </aside>
    );
};

export default QualityCheckResult;