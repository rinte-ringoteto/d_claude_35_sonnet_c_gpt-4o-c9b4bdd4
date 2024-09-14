tsx
import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Topbar from '@/components/Topbar';
import { supabase } from '@/supabase';
import axios from 'axios';
import { FiCheck, FiXCircle } from 'react-icons/fi';
import { ProgressBar } from 'react-bootstrap';

export default function QualityCheck() {
  const [documents, setDocuments] = useState([]);
  const [sourceCodes, setSourceCodes] = useState([]);
  const [selectedTarget, setSelectedTarget] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);
  const [isChecking, setIsChecking] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();

  useEffect(() => {
    if (!supabase.auth.user()) {
      router.push('/login');
    } else {
      // Load Available Documents and Source Codes
      fetchQualityData();
    }
  }, []);

  const fetchQualityData = async () => {
    try {
      const { data: docData, error: docError } = await supabase.from('documents').select('*');
      const { data: codeData, error: codeError } = await supabase.from('source_codes').select('*');
      
      if (docError || codeError) throw new Error('Error fetching data');
      setDocuments(docData || []);
      setSourceCodes(codeData || []);
    } catch (e) {
      setError('データの取得に失敗しました。サンプルデータを使用しています。');
      setDocuments([{ id: 'sample-doc-id', type: '要件定義', content: '{}' }]);
      setSourceCodes([{ id: 'sample-code-id', file_name: 'sample.ts', content: '' }]);
    }
  };

  const startQualityCheck = async () => {
    if (!selectedTarget) {
      setError('チェック対象を選択してください。');
      return;
    }

    setIsChecking(true);
    try {
      const { data } = await axios.post('/api/quality-check', { target: selectedTarget });
      let progress = 0;
      const interval = setInterval(() => {
        progress += 10;
        setProgress(progress);
        if (progress >= 100) {
          clearInterval(interval);
          router.push('/quality-check-result');
        }
      }, 500);
    } catch (err) {
      console.error(err);
      setError('チェックプロセス中にエラーが発生しました。');
    }
    setIsChecking(false);
  };

  return (
    <div className="min-h-screen h-full bg-gray-100">
      <Topbar />
      <main className="container mx-auto p-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-8">品質チェック</h1>

        {/* チェック対象の選択 */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-gray-700">チェック対象を選択</h2>
          <div className="flex gap-4 mt-4">
            <div className="flex-1">
              <h3 className="text-lg font-semibold">ドキュメント</h3>
              {documents.length ? docsList : <NoData type="ドキュメント" />}
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-semibold">ソースコード</h3>
              {sourceCodes.length ? codesList : <NoData type="ソースコード" />}
            </div>
          </div>
        </div>

        {/* エラーメッセージ */}
        {error && <p className="text-red-600 mb-8">{error}</p>}

        {/* チェック開始ボタン */}
        <div className="mb-8">
          <button
            className={`${
              isChecking ? 'bg-gray-500' : 'bg-blue-500 hover:bg-blue-600'
            } text-white px-4 py-2 rounded transition duration-300`}
            onClick={startQualityCheck}
            disabled={isChecking}
          >
            {isChecking ? 'チェック中...' : 'チェック開始'}
          </button>
        </div>

        {/* プログレスバー */}
        {isChecking && (
          <div className="mb-8">
            <h3 className="text-md font-semibold text-gray-600 mb-4">チェック進捗確認中</h3>
            <ProgressBar now={progress} label={`${progress}%`} />
          </div>
        )}
      </main>
    </div>
  );
  
  function docsList() {
    return (
      <ul className="bg-white shadow-md rounded p-4">
        {documents.map((doc) => (
          <li
            key={doc.id}
            className={`p-2 cursor-pointer hover:bg-gray-100 rounded ${selectedTarget === doc.id ? 'bg-blue-100' : ''}`}
            onClick={() => setSelectedTarget(doc.id)}
          >
            {doc.type}
          </li>
        ))}
      </ul>
    );
  }

  function codesList() {
    return (
      <ul className="bg-white shadow-md rounded p-4">
        {sourceCodes.map((code) => (
          <li
            key={code.id}
            className={`p-2 cursor-pointer hover:bg-gray-100 rounded ${selectedTarget === code.id ? 'bg-blue-100' : ''}`}
            onClick={() => setSelectedTarget(code.id)}
          >
            {code.file_name}
          </li>
        ))}
      </ul>
    );
  }

  function NoData({ type }: { type: string }) {
    return (
      <div className="flex justify-center items-center p-4 h-full text-gray-500">
        <FiXCircle className="mr-2" /> {type}がありません。
      </div>
    );
  }
}