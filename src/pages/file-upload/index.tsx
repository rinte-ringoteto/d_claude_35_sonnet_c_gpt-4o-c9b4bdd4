tsx
import { useState } from 'react';
import { useRouter } from 'next/router';
import { AiOutlineCloudUpload, AiOutlineFileText } from 'react-icons/ai';
import { useSupabaseClient, useSession } from '@supabase/auth-helpers-react';
import axios from 'axios';
import Topbar from '@/components/Topbar';

export default function FileUploadScreen() {
    const [file, setFile] = useState<File | null>(null);
    const [uploading, setUploading] = useState(false);
    const router = useRouter();
    const supabase = useSupabaseClient();
    const session = useSession();

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        if (event.target.files && event.target.files[0]) {
            setFile(event.target.files[0]);
        }
    };

    const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
        event.preventDefault();
    };

    const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
        event.preventDefault();
        const droppedFile = event.dataTransfer.files[0];
        setFile(droppedFile);
    };

    const handleFileUpload = async () => {
        if (!file) return;
        setUploading(true);

        try {
            // Upload file via axios to the backend API
            const formData = new FormData();
            formData.append('file', file);
            const { data } = await axios.post('/api/file-upload.ts', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });

            // After file upload success, redirect to document generation page
            router.push('/document-generation');
        } catch (error) {
            console.error('File upload failed', error);
            alert('ファイルアップロードに失敗しました。');
        } finally {
            setUploading(false);
        }
    };

    return (
        <div className="min-h-screen h-full bg-gray-100">
            <Topbar />
            <div className="container mx-auto p-8">
                <h1 className="text-2xl font-bold mb-6 text-gray-800">ファイルアップロード</h1>

                <div
                    className="w-full p-6 border-2 border-dashed border-gray-400 bg-white flex justify-center items-center mb-4"
                    onDragOver={handleDragOver}
                    onDrop={handleDrop}
                >
                    <AiOutlineFileText className="text-gray-400 text-6xl" />
                    <input type="file" className="hidden" id="file-upload" onChange={handleFileChange} />
                    <label htmlFor="file-upload" className="cursor-pointer text-blue-500">
                        ここにファイルをドラッグ&ドロップするか、クリックして選択してください。
                    </label>
                </div>

                {file && (
                    <div className="text-gray-800 mb-4">
                        <p>
                            選択されたファイル: <span className="font-semibold">{file.name}</span>
                        </p>
                    </div>
                )}

                <button
                    className={`w-full bg-blue-500 text-white py-3 rounded-md flex justify-center items-center ${uploading ? 'opacity-50' : ''
                        }`}
                    onClick={handleFileUpload}
                    disabled={uploading}
                >
                    <AiOutlineCloudUpload className="mr-2" />
                    {uploading ? 'アップロード中...' : 'ファイルをアップロード'}
                </button>
            </div>
        </div>
    );
}