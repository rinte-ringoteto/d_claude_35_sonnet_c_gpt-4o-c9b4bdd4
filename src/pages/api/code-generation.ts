import { createClient } from '@supabase/supabase-js';
import axios from 'axios';
import { NextApiRequest, NextApiResponse } from 'next';
import { getLlmModelAndGenerateContent } from '@/utils/functions';

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!);

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method === 'POST') {
        const { documentId, language } = req.body;

        if (!documentId || !language) {
            return res.status(400).json({ message: 'ドキュメントIDとプログラミング言語を指定してください。' });
        }

        try {
            // Step 1: Retrieve the document content from the database
            const { data: documentData, error: documentError } = await supabase
                .from('documents')
                .select('content')
                .eq('id', documentId)
                .single();

            if (documentError || !documentData) {
                return res.status(500).json({
                    message: 'ドキュメントの取得中にエラーが発生しました。',
                    sampleData: { code: '// システムエラー: ドキュメントが取得できませんでした。' }
                });
            }

            const documentContent = documentData?.content;

            // Step 2: Generate source code using AI model
            const aiResponse = await axios
                .post('/api/generate-code', {
                    documentContent,
                    language
                })
                .catch(async (error) => {
                    console.error('AI API Error:', error);
                    return {
                        data: {
                            result: 'ChatGPTのサンプルコード',
                            error: 'AIリクエストが失敗しました。'
                        }
                    };
                });

            const generatedCode = aiResponse.data?.result || "// 生成されたコードを取得できませんでした。";

            // Sample fallback code in case AI request fails
            if (aiResponse.error) {
                return res.status(200).json({
                    code: `// サンプルコード:
function example() {
  console.log("サンプルデータです。");
}`
                });
            }

            // Step 3: Format & Optimize the code if needed (simulated)
            // Step 4: Store generated code in the database
            const { error: saveError } = await supabase
                .from('source_codes')
                .insert([
                    { project_id: documentId, file_name: 'generated_code.' + language, content: generatedCode }
                ]);

            if (saveError) {
                return res.status(500).json({
                    message: '生成コードの保存中にエラーが発生しました。',
                    sampleData: { code: '// 保存エラー: 生成コードに問題があります。' }
                });
            }

            // Step 5: Send a notification (here simply returning success)
            return res.status(200).json({
                message: 'ソースコード生成が完了しました。',
                code: generatedCode
            });

        } catch (error) {
            console.error('Error generating source code:', error);
            return res.status(500).json({
                message: 'ソースコード生成中にエラーが発生しました。',
                sampleData: { code: '// エラーデータ: ソースコードを生成できませんでした。' }
            });
        }
    } else {
        res.setHeader('Allow', ['POST']);
        res.status(405).json({ message: 'メソッドは許可されていません。' });
    }
}