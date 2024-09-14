tsx
import React from "react";
import { FaUserAlt } from "react-icons/fa";
import { useRouter } from "next/router";

const Topbar: React.FC = () => {
    const router = useRouter();

    const handleNavigation = (path: string) => {
        router.push(`/${path}`);
    };

    return (
        <div className="bg-white shadow-md fixed w-full z-50">
            <div className="container mx-auto px-4 md:px-8 py-4 flex items-center justify-between">
                {/* Project name or logo */}
                <div className="flex items-center cursor-pointer" onClick={() => handleNavigation("dashboard")}>
                    <h1 className="text-2xl font-bold text-blue-600">GEAR.indigo</h1>
                </div>

                {/* Navigation Links */}
                <div className="hidden md:flex space-x-8">
                    <button 
                        className="text-gray-700 hover:text-blue-600 transition duration-300" 
                        onClick={() => handleNavigation("file-upload")}
                    >
                        ファイルアップロード
                    </button>
                    <button 
                        className="text-gray-700 hover:text-blue-600 transition duration-300" 
                        onClick={() => handleNavigation("document-generation")}
                    >
                        ドキュメント生成
                    </button>
                    <button 
                        className="text-gray-700 hover:text-blue-600 transition duration-300" 
                        onClick={() => handleNavigation("code-generation")}
                    >
                        ソースコード生成
                    </button>
                    <button 
                        className="text-gray-700 hover:text-blue-600 transition duration-300" 
                        onClick={() => handleNavigation("quality-check")}
                    >
                        品質チェック
                    </button>
                    <button 
                        className="text-gray-700 hover:text-blue-600 transition duration-300" 
                        onClick={() => handleNavigation("consistency-check")}
                    >
                        整合性確認
                    </button>
                    <button 
                        className="text-gray-700 hover:text-blue-600 transition duration-300" 
                        onClick={() => handleNavigation("work-estimation")}
                    >
                        工数見積
                    </button>
                    <button 
                        className="text-gray-700 hover:text-blue-600 transition duration-300" 
                        onClick={() => handleNavigation("proposal-creation")}
                    >
                        提案資料作成
                    </button>
                    <button 
                        className="text-gray-700 hover:text-blue-600 transition duration-300" 
                        onClick={() => handleNavigation("progress-report")}
                    >
                        進捗レポート
                    </button>
                </div>

                {/* Profile or login/logout button */}
                <div className="flex items-center space-x-4">
                    <button className="text-gray-700 hover:text-blue-600 transition duration-300">ログイン</button>
                    <div className="cursor-pointer">
                        <FaUserAlt className="text-gray-700 hover:text-blue-600 text-xl transition duration-300" />
                    </div>
                </div>
            </div>

            {/* Responsive Menu */}
            <div className="md:hidden bg-white shadow-md">
                <div className="flex flex-wrap justify-between items-center p-4">
                    <button 
                        className="text-gray-700 hover:text-blue-600 transition duration-300" 
                        onClick={() => handleNavigation("file-upload")}
                    >
                        ファイルアップロード
                    </button>
                    <button 
                        className="text-gray-700 hover:text-blue-600 transition duration-300" 
                        onClick={() => handleNavigation("document-generation")}
                    >
                        ドキュメント生成
                    </button>
                    <button 
                        className="text-gray-700 hover:text-blue-600 transition duration-300" 
                        onClick={() => handleNavigation("code-generation")}
                    >
                        ソースコード生成
                    </button>
                    <button 
                        className="text-gray-700 hover:text-blue-600 transition duration-300" 
                        onClick={() => handleNavigation("quality-check")}
                    >
                        品質チェック
                    </button>
                    <button 
                        className="text-gray-700 hover:text-blue-600 transition duration-300" 
                        onClick={() => handleNavigation("consistency-check")}
                    >
                        整合性確認
                    </button>
                    <button 
                        className="text-gray-700 hover:text-blue-600 transition duration-300" 
                        onClick={() => handleNavigation("work-estimation")}
                    >
                        工数見積
                    </button>
                    <button 
                        className="text-gray-700 hover:text-blue-600 transition duration-300" 
                        onClick={() => handleNavigation("proposal-creation")}
                    >
                        提案資料作成
                    </button>
                    <button 
                        className="text-gray-700 hover:text-blue-600 transition duration-300" 
                        onClick={() => handleNavigation("progress-report")}
                    >
                        進捗レポート
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Topbar;