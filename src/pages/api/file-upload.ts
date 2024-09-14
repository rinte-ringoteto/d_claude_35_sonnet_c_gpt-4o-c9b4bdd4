import { createClient } from '@supabase/supabase-js';
import { NextApiRequest, NextApiResponse } from 'next';
import multer from 'multer';
import { v4 as uuidv4 } from 'uuid';
import { getLlmModelAndGenerateContent } from '@/utils/functions';
import axios from 'axios';

const supabase = createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_KEY!);

// Set up multer for file handling
const upload = multer({
    limits: { fileSize: 10 * 1024 * 1024 }, // 10MB file size limit
    storage: multer.memoryStorage(),
});

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method === 'POST') {
        upload.single('file')(req as any, res as any, async (err) => {
            if (err) {
                return res.status(500).json({ error: 'ファイルアップロードに失敗しました。' });
            }

            const file = (req as any).file;
            if (!file) return res.status(400).json({ error: 'ファイルがありません。' });

            try {
                // 1. ファイル種類とサイズを確認
                const allowedTypes = ['text/plain', 'application/pdf'];
                if (!allowedTypes.includes(file.mimetype)) {
                    return res.status(400).json({ error: '無効なファイル形式です。' });
                }
                
                const maxFileSize = 10 * 1024 * 1024; // 10MB
                if (file.size > maxFileSize) {
                    return res.status(400).json({ error: 'ファイルサイズが大きすぎます。' });
                }

                // 2. ファイルをSupabaseのStorageへ一時保存
                const storagePath = `uploads/${uuidv4()}_${file.originalname}`;
                const { data: fileUploadResult, error: uploadError } = await supabase.storage
                    .from('uploads')
                    .upload(storagePath, file.buffer, {
                        contentType: file.mimetype,
                    });

                if (uploadError || !fileUploadResult) {
                    throw new Error('ファイルの保存に失敗しました。');
                }

                const fileUrl = `https://YOUR_SUPABASE_URL/storage/v1/object/public/uploads/${fileUploadResult.path}`;

                // 3. データベースにファイルのパスを記録
                const { error: dbError } = await supabase
                    .from('documents')
                    .insert({
                        id: uuidv4(),
                        project_id: 'some-existing-project-id', // 適切なプロジェクトIDを入れる
                        type: '要件定義',
                        content: { title: '', sections: [] },
                        created_at: new Date().toISOString(),
                        updated_at: new Date().toISOString(),
                    });

                if (dbError) {
                    throw new Error('データベースに記録できませんでした。');
                }

                // 4. ファイル処理完了後、AI APIを使ってドキュメント生成リクエストを送信
                try {
                    const aiResponse = await getLlmModelAndGenerateContent('Gemini', 'AIドキュメント生成のシステムプロンプト', `ファイルを基にドキュメントを生成してください。ファイルURL: ${fileUrl}`);
                    // AI処理の結果をクライアントに返す
                    return res.status(200).json({ message: 'ファイルアップロードが完了しました。', doc: aiResponse });
                } catch (aiError) {
                    // AI APIエラー時にはサンプルデータを返す
                    const sampleData = {
                        title: 'サンプルドキュメント',
                        sections: [{ heading: 'はじめに', content: 'ここにサンプルの内容が入ります。' }]
                    };
                    return res.status(200).json({ message: 'AI生成に失敗しました。サンプルデータを返します。', doc: sampleData });
                }
            } catch (error) {
                return res.status(500).json({ error: error.message });
            }
        });
    } else {
        return res.status(405).json({ message: 'POSTメソッドのみ使用できます。' });
    }
}