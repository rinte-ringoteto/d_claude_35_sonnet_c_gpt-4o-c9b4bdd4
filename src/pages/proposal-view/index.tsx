tsx
import React, { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { AiOutlineEdit, AiOutlineDownload } from "react-icons/ai";
import Topbar from "@/components/Topbar";
import { supabase } from "@/supabase";
import axios from "axios";

const ProposalView: React.FC = () => {
    const [proposal, setProposal] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const router = useRouter();

    useEffect(() => {
        const fetchProposal = async () => {
            try {
                const { data: session } = await supabase.auth.getSession();
                if (!session?.session) {
                    router.push("/login");
                    return;
                }

                const { data, error } = await supabase
                    .from("documents")
                    .select("*")
                    .eq("type", "提案資料")
                    .limit(1)
                    .single();
                if (error || !data) {
                    setError("提案資料の読み込みに失敗しました。");
                    setProposal({
                        title: "サンプル提案資料",
                        content: { title: "提案サンプル", sections: [{ heading: "サンプル項目", content: "これはサンプルデータです。" }] },
                    });
                } else {
                    setProposal(data);
                }
            } catch (e) {
                setError("データの取得中にエラーが発生しました。");
            } finally {
                setLoading(false);
            }
        };

        fetchProposal();
    }, [router]);

    const handleEditClick = () => {
        console.log("編集ボタンがクリックされました");
        router.push("/proposal-edit");
    };

    const handleExportClick = async () => {
        try {
            console.log("エクスポートボタンがクリックされました");
            // 提案資料のエクスポート処理（仮）
            const response = await axios.get("/api/export", { responseType: "blob" });
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement("a");
            link.href = url;
            link.setAttribute("download", "提案資料.pdf");
            document.body.appendChild(link);
            link.click();
        } catch (e) {
            console.error("エクスポートに失敗しました", e);
        }
    };

    if (loading) return <div className="min-h-screen h-full flex justify-center items-center">Loading...</div>;
    if (error) return <div className="min-h-screen h-full flex justify-center items-center text-red-500">{error}</div>;

    return (
        <div className="min-h-screen h-full bg-[#F8F8F8]">
            <Topbar />
            <div className="container mx-auto py-8 px-4">
                <div className="bg-white p-6 rounded-md shadow-md">
                    <div className="flex justify-between items-center mb-4">
                        <h1 className="text-2xl font-bold text-[#333333]">{proposal.title || "提案資料"}</h1>
                        <div className="flex space-x-4">
                            <button
                                className="flex items-center space-x-2 px-4 py-2 bg-[#E2F3F9] border border-[#4A90E2] rounded-md text-[#4A90E2] hover:bg-[#d1e9f4] transition"
                                onClick={handleEditClick}
                            >
                                <AiOutlineEdit className="text-xl" />
                                <span>編集</span>
                            </button>
                            <button
                                className="flex items-center space-x-2 px-4 py-2 bg-[#F3F9E2] border border-[#50E3C2] rounded-md text-[#50E3C2] hover:bg-[#e1f7d1] transition"
                                onClick={handleExportClick}
                            >
                                <AiOutlineDownload className="text-xl" />
                                <span>エクスポート</span>
                            </button>
                        </div>
                    </div>
                    <div className="border-t border-gray-200 pt-4">
                        {proposal.content?.sections.map((section: any, index: number) => (
                            <div key={index} className="mb-6">
                                <h2 className="text-lg font-semibold text-[#4A90E2]">{section.heading}</h2>
                                <p className="text-[#333333]">{section.content}</p>
                            </div>
                        ))}
                    </div>
                </div>
                <div className="mt-8">
                    <img
                        src="https://placehold.co/600x400.png"
                        alt="Placeholder Image"
                        className="w-full h-auto rounded-md shadow-md"
                    />
                </div>
            </div>
        </div>
    );
};

export default ProposalView;