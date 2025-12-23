import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { auth, db } from '../firebase';
import { Users, Megaphone, Wrench, LogOut, Package, X } from 'lucide-react';
import { collection, addDoc, serverTimestamp, onSnapshot, query, where } from 'firebase/firestore';

export default function AdminDashboard() {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const [showAnnouncementModal, setShowAnnouncementModal] = useState(false);
  const [showPackageModal, setShowPackageModal] = useState(false);
  const [newAnnouncement, setNewAnnouncement] = useState({ title: '', content: '', type: '公告' });
  const [newPackage, setNewPackage] = useState({ recipient: '', type: '一般包裹', location: '管理室' });
  const [stats, setStats] = useState({
    users: 0,
    packages: 0,
    repairs: 0,
    announcements: 0
  });

  useEffect(() => {
    // Real-time stats listeners
    const unsubAnnouncements = onSnapshot(collection(db, "announcements"), (snap) => {
      setStats(prev => ({ ...prev, announcements: snap.size }));
    });
    
    const qPackages = query(collection(db, "packages"), where("status", "==", "pending"));
    const unsubPackages = onSnapshot(qPackages, (snap) => {
      setStats(prev => ({ ...prev, packages: snap.size }));
    });

    return () => {
      unsubAnnouncements();
      unsubPackages();
    };
  }, []);

  const handleLogout = async () => {
    try {
      await auth.signOut();
      navigate('/login');
    } catch (error) {
      console.error("Failed to log out", error);
    }
  };

  const handlePostAnnouncement = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await addDoc(collection(db, "announcements"), {
        ...newAnnouncement,
        date: serverTimestamp(),
        author: currentUser?.email
      });
      setShowAnnouncementModal(false);
      setNewAnnouncement({ title: '', content: '', type: '公告' });
      alert('公告發布成功！');
    } catch (error) {
      console.error("Error adding announcement: ", error);
      alert('發布失敗，請稍後再試');
    }
  };

  const handleRegisterPackage = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await addDoc(collection(db, "packages"), {
        ...newPackage,
        arrivedAt: serverTimestamp(),
        status: 'pending',
        registeredBy: currentUser?.email
      });
      setShowPackageModal(false);
      setNewPackage({ recipient: '', type: '一般包裹', location: '管理室' });
      alert('包裹登記成功！');
    } catch (error) {
      console.error("Error registering package: ", error);
      alert('登記失敗，請稍後再試');
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 relative">
      {/* Admin Header */}
      <header className="bg-white shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <div className="flex items-center">
            <span className="bg-blue-600 text-white px-2 py-1 rounded text-xs font-bold mr-2">管理員</span>
            <h1 className="text-2xl font-bold text-gray-900">社區管理後台</h1>
          </div>
          <div className="flex items-center space-x-4">
             <span className="text-gray-700 text-sm hidden sm:block">{currentUser?.email}</span>
            <button onClick={handleLogout} className="flex items-center text-gray-600 hover:text-red-600">
              <LogOut className="h-5 w-5 mr-1" />
              <span className="hidden sm:inline">登出</span>
            </button>
          </div>
        </div>
      </header>

      {/* Admin Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white p-6 rounded-lg shadow border-l-4 border-blue-500">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-xs font-semibold text-gray-500 uppercase">住戶總數</p>
                <h3 className="text-2xl font-bold text-gray-800">124</h3>
              </div>
              <Users className="h-8 w-8 text-blue-200" />
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow border-l-4 border-green-500">
             <div className="flex justify-between items-start">
              <div>
                <p className="text-xs font-semibold text-gray-500 uppercase">待領包裹</p>
                <h3 className="text-2xl font-bold text-gray-800">{stats.packages}</h3>
              </div>
              <Package className="h-8 w-8 text-green-200" />
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow border-l-4 border-yellow-500">
             <div className="flex justify-between items-start">
              <div>
                <p className="text-xs font-semibold text-gray-500 uppercase">待處理報修</p>
                <h3 className="text-2xl font-bold text-gray-800">5</h3>
              </div>
              <Wrench className="h-8 w-8 text-yellow-200" />
            </div>
          </div>
          
           <div className="bg-white p-6 rounded-lg shadow border-l-4 border-purple-500">
             <div className="flex justify-between items-start">
              <div>
                <p className="text-xs font-semibold text-gray-500 uppercase">公告</p>
                <h3 className="text-2xl font-bold text-gray-800">{stats.announcements}</h3>
              </div>
              <Megaphone className="h-8 w-8 text-purple-200" />
            </div>
          </div>
        </div>

        {/* Management Sections */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Quick Actions */}
          <div className="bg-white rounded-lg shadow overflow-hidden">
             <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
              <h3 className="text-lg font-medium text-gray-900">快速操作</h3>
            </div>
            <div className="p-6 grid grid-cols-2 gap-4">
              <button 
                onClick={() => setShowAnnouncementModal(true)}
                className="flex flex-col items-center justify-center p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-colors"
              >
                <Megaphone className="h-8 w-8 text-blue-500 mb-2" />
                <span className="text-sm font-medium text-gray-700">發布公告</span>
              </button>
              <button 
                onClick={() => setShowPackageModal(true)}
                className="flex flex-col items-center justify-center p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-green-500 hover:bg-green-50 transition-colors"
              >
                 <Package className="h-8 w-8 text-green-500 mb-2" />
                <span className="text-sm font-medium text-gray-700">登記包裹</span>
              </button>
              <button className="flex flex-col items-center justify-center p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-purple-500 hover:bg-purple-50 transition-colors">
                 <Users className="h-8 w-8 text-purple-500 mb-2" />
                <span className="text-sm font-medium text-gray-700">住戶管理</span>
              </button>
               <button className="flex flex-col items-center justify-center p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-yellow-500 hover:bg-yellow-50 transition-colors">
                 <Wrench className="h-8 w-8 text-yellow-500 mb-2" />
                <span className="text-sm font-medium text-gray-700">報修管理</span>
              </button>
            </div>
          </div>

          {/* Recent Logs */}
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
              <h3 className="text-lg font-medium text-gray-900">最近活動紀錄</h3>
            </div>
            <ul className="divide-y divide-gray-200">
               <li className="px-6 py-4">
                <div className="flex space-x-3">
                  <div className="flex-1 space-y-1">
                    <div className="flex items-center justify-between">
                      <h3 className="text-sm font-medium">收到包裹</h3>
                      <p className="text-sm text-gray-500">2 分鐘前</p>
                    </div>
                    <p className="text-sm text-gray-500">收件人：10樓B室 (陳先生)</p>
                  </div>
                </div>
              </li>
               <li className="px-6 py-4">
                <div className="flex space-x-3">
                  <div className="flex-1 space-y-1">
                    <div className="flex items-center justify-between">
                      <h3 className="text-sm font-medium">新報修申請</h3>
                      <p className="text-sm text-gray-500">1 小時前</p>
                    </div>
                    <p className="text-sm text-gray-500">5樓A室：水龍頭漏水</p>
                  </div>
                </div>
              </li>
               <li className="px-6 py-4">
                <div className="flex space-x-3">
                  <div className="flex-1 space-y-1">
                    <div className="flex items-center justify-between">
                      <h3 className="text-sm font-medium">發布公告</h3>
                      <p className="text-sm text-gray-500">3 小時前</p>
                    </div>
                    <p className="text-sm text-gray-500">"停水通知"</p>
                  </div>
                </div>
              </li>
            </ul>
          </div>
        </div>
      </main>

      {/* Announcement Modal */}
      {showAnnouncementModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold">發布新公告</h3>
              <button onClick={() => setShowAnnouncementModal(false)} className="text-gray-500 hover:text-gray-700">
                <X className="h-6 w-6" />
              </button>
            </div>
            <form onSubmit={handlePostAnnouncement}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">標題</label>
                  <input
                    type="text"
                    required
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={newAnnouncement.title}
                    onChange={(e) => setNewAnnouncement({...newAnnouncement, title: e.target.value})}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">類型</label>
                  <select
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={newAnnouncement.type}
                    onChange={(e) => setNewAnnouncement({...newAnnouncement, type: e.target.value})}
                  >
                    <option value="公告">公告</option>
                    <option value="通知">通知</option>
                    <option value="活動">活動</option>
                    <option value="緊急">緊急</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">內容</label>
                  <textarea
                    required
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 h-32"
                    value={newAnnouncement.content}
                    onChange={(e) => setNewAnnouncement({...newAnnouncement, content: e.target.value})}
                  />
                </div>
              </div>
              <div className="mt-6 flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setShowAnnouncementModal(false)}
                  className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                >
                  取消
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                >
                  發布
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Package Modal */}
      {showPackageModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold">登記新包裹</h3>
              <button onClick={() => setShowPackageModal(false)} className="text-gray-500 hover:text-gray-700">
                <X className="h-6 w-6" />
              </button>
            </div>
            <form onSubmit={handleRegisterPackage}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">收件人 (Email)</label>
                  <input
                    type="email"
                    required
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                    value={newPackage.recipient}
                    onChange={(e) => setNewPackage({...newPackage, recipient: e.target.value})}
                    placeholder="例如: resident@example.com"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">包裹類型</label>
                  <select
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                    value={newPackage.type}
                    onChange={(e) => setNewPackage({...newPackage, type: e.target.value})}
                  >
                    <option value="一般包裹">一般包裹</option>
                    <option value="掛號信">掛號信</option>
                    <option value="生鮮冷藏">生鮮冷藏</option>
                    <option value="大型物品">大型物品</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">存放位置</label>
                  <input
                    type="text"
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                    value={newPackage.location}
                    onChange={(e) => setNewPackage({...newPackage, location: e.target.value})}
                  />
                </div>
              </div>
              <div className="mt-6 flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setShowPackageModal(false)}
                  className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                >
                  取消
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
                >
                  確認登記
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
