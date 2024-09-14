typescript
import { NextApiRequest, NextApiResponse } from 'next';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { supabase } from '@/supabase';
import axios from 'axios';
import { getLlmModelAndGenerateContent } from '@/utils/functions';

const JWT_SECRET = process.env.JWT_SECRET || 'your_jwt_secret';

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
    if (req.method === 'POST') {
        const { email, password } = req.body;

        // クライアントから受け取ったメールアドレスとパスワードを検証
        if (!email || !password) {
            return res.status(400).json({ error: 'メールアドレスやパスワードが不足しています。' });
        }

        try {
            // データベースでユーザー情報を確認
            const { data: user, error: userError } = await supabase
                .from('users')
                .select('*')
                .eq('email', email)
                .single();

            if (userError || !user) {
                // 外部APIにリクエストを投げて自動応答生成
                const aiResponse = await getLlmModelAndGenerateContent("Claude", "Provide helpful error messages based on system", `Login Error: No user found with email ${email}`);
                return res.status(404).json({ error: aiResponse || 'ユーザー情報が見つかりませんでした。' });
            }

            // パスワードのハッシュを比較
            const isPasswordValid = await bcrypt.compare(password, user.password_hash);
            if (!isPasswordValid) {
                // 外部APIにリクエストを投げて自動応答生成
                const aiResponse = await getLlmModelAndGenerateContent("ChatGPT", "Provide helpful error messages based on system", "Login Error: Incorrect password");
                return res.status(401).json({ error: aiResponse || 'パスワードが間違っています。' });
            }

            // 認証成功時にJWTトークンを生成
            const token = jwt.sign({ id: user.id, email: user.email }, JWT_SECRET, {
                expiresIn: '1h',
            });

            // 生成したトークンをクライアントに返す
            return res.status(200).json({ token });

        } catch (error) {
            // 外部APIにリクエストを投げてエラーメッセージを自動生成
            const aiResponse = await getLlmModelAndGenerateContent("Gemini", "Handle unexpected error gracefully", `Error: ${error.message}`);
            return res.status(500).json({ error: aiResponse || 'サーバーエラーが発生しました。' });
        }
    } else if (req.method === 'PUT') {
        const { email, password, role } = req.body;

        // クライアントから受け取ったデータの検証
        if (!email || !password) {
            return res.status(400).json({ error: 'メールアドレスやパスワードが不足しています。' });
        }

        try {
            // パスワードをハッシュ化
            const hashedPassword = await bcrypt.hash(password, 10);

            // SupabaseのAuthを使用してユーザーを登録
            const { error: signUpError } = await supabase.auth.signUp({
                email,
                password,
            });

            if (signUpError) {
                // 外部APIにリクエストを投げてエラーメッセージを自動生成
                const aiResponse = await getLlmModelAndGenerateContent("Claude", "Sign-up error handling", `Sign-up Error: ${signUpError.message}`);
                return res.status(500).json({ error: aiResponse || 'ユーザー登録に失敗しました。' });
            }

            // usersテーブルに登録
            const { data: user, error: insertError } = await supabase
                .from('users')
                .insert([
                    { email, password_hash: hashedPassword, role: role || 'user' }
                ])
                .single();

            if (insertError) {
                // 外部APIにリクエストを投げてエラーメッセージを自動生成
                const aiResponse = await getLlmModelAndGenerateContent("ChatGPT", "Database insertion error", `Insertion Error: ${insertError.message}`);
                return res.status(500).json({ error: aiResponse || 'ユーザー登録に失敗しました。' });
            }

            // 認証トークンを生成し返す
            const token = jwt.sign({ id: user.id, email: user.email }, JWT_SECRET, {
                expiresIn: '1h',
            });

            return res.status(201).json({ token });

        } catch (error) {
            // エラーメッセージを生成
            const aiResponse = await getLlmModelAndGenerateContent("Gemini", "Unexpected error", `Error: ${error.message}`);
            return res.status(500).json({ error: aiResponse || 'サーバーエラーが発生しました。' });
        }
    } else {
        res.setHeader('Allow', ['POST', 'PUT']);
        return res.status(405).json({ error: `Method ${req.method} not allowed` });
    }
};

export default handler;