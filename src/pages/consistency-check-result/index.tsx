tsx
import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import axios from 'axios';
import { supabase } from "@/supabase";
import Topbar from "@/components/Topbar";
import { FaCheckCircle, FaExclamationCircle } from "react-icons/fa";
import Link from "next/link";

const ConsistencyCheckResult = () => {
    const router = useRouter();
    const [score, setScore] = useState<number | null>(null);
    const [issues, setIssues] = useState<Array<{ type: string; description: string; severity: string }>>([]);
    const [suggestion, setSuggestion] = useState<string>("");
    const [loading, setLoading] = useState(true);
    
    useEffect(() => {
        const fetchData = async () => {
            try {
                // Example API call depending on table definition and Supabase Auth
                const user = supabase.auth.user();
                if (user) {
                    const { data, error } = await supabase
                        .from('quality_checks')
                        .select('result')
                        .eq('type', '整合性')
                        .limit(1);

                    if (error) throw error;
                    if (data && data.length > 0) {
                        const result = data[0].result;
                        setScore(result.score);
                        setIssues(result.issues);
                    }
                } else {
                    router.push('/login'); // redirect to login if user is not authenticated
                }
            } catch (error) {
                setScore(80); // sample fallback data
                setIssues([
                    { type: "ドキュメント", description: "セクション A の記述がありません", severity: "高" },
                    { type: "ソースコード", description: "関数 `getData` の戻り型が異なります", severity: "中" },
                ]);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [router]);

    if (loading) return <div>Loading...</div>;

    return (
        <div className="min-h-screen h-full bg-gray-100">
            <Topbar />
            <div className="container mx-auto py-8">
                <h1 className="text-3xl text-center font-bold text-gray-800 mb-4">整合性確認結果</h1>
                
                <div className="bg-white shadow-md rounded-lg p-6 mb-6">
                    <h2 className="text-xl font-semibold text-gray-700">整合性スコア</h2>
                    <p className={`text-3xl font-bold ${score && score >= 80 ? "text-green-500" : "text-red-500"} mt-2`}>
                        {score ? `${score}%` : "スコアが取得できませんでした"}
                    </p>
                </div>

                <div className="bg-white shadow-md rounded-lg p-6 mb-6">
                    <h2 className="text-xl font-semibold text-gray-700">不整合箇所リスト</h2>
                    <ul className="mt-4">
                        {issues.map((issue, index) => (
                            <li key={index} className="flex items-start pb-4">
                                {issue.severity === "高" ? (
                                    <FaExclamationCircle className="text-red-500 mr-2 mt-1" />
                                ) : (
                                    <FaCheckCircle className="text-orange-500 mr-2 mt-1" />
                                )}
                                <div>
                                    <p className="text-gray-800 font-bold">{issue.type}</p>
                                    <p className="text-gray-600">{issue.description}</p>
                                </div>
                            </li>
                        ))}
                        {issues.length === 0 && (
                            <li className="text-gray-500">不整合箇所はありません。</li>
                        )}
                    </ul>
                </div>

                <div className="bg-white shadow-md rounded-lg p-6 mb-6">
                    <h2 className="text-xl font-semibold text-gray-700">修正提案</h2>
                    <p className="text-gray-600 mt-4">
                        {suggestion || "不整合の修正提案に関する情報が取得できませんでした。"}
                    </p>
                </div>
                
                <div className="text-center mt-8">
                    <Link href="/work-estimate-result" className="bg-blue-500 text-white px-6 py-2 rounded-md hover:bg-blue-600 transition duration-300">
                        工数見積へ進む
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default ConsistencyCheckResult;