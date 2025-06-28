import React, { useEffect, useState } from 'react';
import { User } from "firebase/auth";
import { db } from '../firebase';
import { collection, query, where, getDocs, orderBy } from "firebase/firestore";

interface TestHistoryItem {
  id: string;
  url: string;
  date: string;
  passed: number;
  failed: number;
  total: number;
}

interface UserProfileProps {
  user: User;
}

const UserProfile: React.FC<UserProfileProps> = ({ user }) => {
  const [history, setHistory] = useState<TestHistoryItem[]>([]);

  useEffect(() => {
    async function fetchHistory() {
      if (!user) return;
      const q = query(
        collection(db, "testHistory"),
        where("userId", "==", user.uid),
        orderBy("date", "desc")
      );
      const querySnapshot = await getDocs(q);
      const data = querySnapshot.docs.map(doc => {
        const d = doc.data();
        return {
          id: doc.id,
          url: d.url,
          date: d.date?.toDate().toISOString().slice(0, 10) ?? '',
          passed: d.passed,
          failed: d.failed,
          total: d.total,
        };
      });
      setHistory(data);
    }
    fetchHistory();
  }, [user]);

  // Calculate stats
  const totalTests = history.reduce((sum, h) => sum + (h.total || 0), 0);
  const totalPassed = history.reduce((sum, h) => sum + (h.passed || 0), 0);
  const totalFailed = history.reduce((sum, h) => sum + (h.failed || 0), 0);

  return (
    <div className="min-h-screen flex flex-col items-center justify-start bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 py-12">
  <div className="bg-white rounded-xl shadow-xl p-8 w-full max-w-2xl relative">
        <h2 className="text-2xl font-bold mb-4 text-center text-gray-800">
          Welcome, {user.displayName || user.email}
        </h2>
        <div className="mb-6 flex flex-col md:flex-row gap-6 justify-center">
          <div className="bg-green-100 rounded-lg p-4 flex-1 text-center">
            <div className="text-3xl font-bold text-green-700">{totalPassed}</div>
            <div className="text-green-700">Total Passed</div>
          </div>
          <div className="bg-red-100 rounded-lg p-4 flex-1 text-center">
            <div className="text-3xl font-bold text-red-700">{totalFailed}</div>
            <div className="text-red-700">Total Failed</div>
          </div>
          <div className="bg-blue-100 rounded-lg p-4 flex-1 text-center">
            <div className="text-3xl font-bold text-blue-700">{totalTests}</div>
            <div className="text-blue-700">Total Executed</div>
          </div>
        </div>
        <div>
          <div className="font-semibold text-gray-700 mb-2">Test History:</div>
          <ul className="space-y-2 max-h-64 overflow-y-auto">
            {history.length === 0 ? (
              <li className="text-gray-500">No history yet.</li>
            ) : (
              history.map(item => (
                <li key={item.id} className="text-gray-700 border-b pb-2">
                  <span className="font-medium">{item.url}</span>
                  <span className="ml-2 text-gray-400 text-xs">{item.date}</span>
                  <span className="ml-4 text-green-600">Passed: {item.passed}</span>
                  <span className="ml-2 text-red-600">Failed: {item.failed}</span>
                  <span className="ml-2 text-blue-600">Total: {item.total}</span>
                </li>
              ))
            )}
          </ul>
        </div>
      </div>
    </div>
  );
};

export default UserProfile;