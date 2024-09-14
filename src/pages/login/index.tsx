tsx
import { useState } from 'react';
import { useRouter } from 'next/router';
import { AiOutlineMail, AiOutlineLock } from 'react-icons/ai';
import { supabase } from '@/supabase';
import Topbar from '@/components/Topbar';

const Login = () => {
    const [email, setEmail] = useState<string>('');
    const [password, setPassword] = useState<string>('');
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const router = useRouter();

    const handleLogin = async () => {
        try {
            const { data, error } = await supabase.auth.signInWithPassword({
                email: email,
                password: password,
            });

            if (error) {
                throw new Error(error.message);
            }

            // ログインに成功したらユーザー情報をusersテーブルから取得
            const { data: user, error: userFetchError } = await supabase
                .from('users')
                .select('*')
                .eq('email', email)
                .single();

            if (userFetchError || !user) {
                throw new Error('ユーザー情報の取得に失敗しました。');
            }

            // 認証に成功したらダッシュボードにリダイレクト
            router.push('/dashboard');
        } catch (error: any) {
            setErrorMessage(error.message);
        }
    };

    return (
        <div className="min-h-screen h-full bg-[#F8F8F8]">
            <Topbar />
            <div className="flex flex-col items-center justify-center h-full pt-16">
                <div className="bg-white p-8 shadow-lg rounded-lg max-w-sm w-full">
                    <h2 className="text-[#4A90E2] text-2xl font-bold mb-6 text-center">ログイン</h2>
                    {errorMessage && (
                        <p className="text-red-600 text-center mb-4">{errorMessage}</p>
                    )}
                    
                    <div className="mb-4">
                        <label htmlFor="email" className="text-gray-700">
                            メールアドレス
                        </label>
                        <div className="flex items-center border-b-2 border-gray-300 focus-within:border-[#4A90E2] mt-2">
                            <AiOutlineMail size={24} className="text-gray-500 mr-2" />
                            <input
                                type="email"
                                id="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="flex-1 py-2 focus:outline-none"
                                placeholder="メールアドレスを入力"
                            />
                        </div>
                    </div>

                    <div className="mb-6">
                        <label htmlFor="password" className="text-gray-700">
                            パスワード
                        </label>
                        <div className="flex items-center border-b-2 border-gray-300 focus-within:border-[#4A90E2] mt-2">
                            <AiOutlineLock size={24} className="text-gray-500 mr-2" />
                            <input
                                type="password"
                                id="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="flex-1 py-2 focus:outline-none"
                                placeholder="パスワードを入力"
                            />
                        </div>
                    </div>

                    <button
                        onClick={handleLogin}
                        className="bg-[#4A90E2] text-white py-2 px-4 rounded-md w-full text-center hover:bg-blue-700 transition duration-300"
                    >
                        ログイン
                    </button>

                    <div className="text-center mt-6">
                        <a
                            href="#"
                            className="text-[#4A90E2] hover:underline"
                            onClick={() => router.push('/password-reset')}
                        >
                            パスワードを忘れましたか？
                        </a>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Login;