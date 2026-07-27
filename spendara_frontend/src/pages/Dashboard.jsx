import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  TrendingUp, Wallet,
  ArrowUpRight, ArrowDownLeft,
  BarChart3, AlertCircle, RefreshCcw, Plus, LogOut
} from 'lucide-react';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import AddTransactionModal from '../components/AddTransactionModal';
import CategoryChart from '../components/CategoryChart';
import { GlowCard } from '../components/ui/spotlight-card';
import AnimatedGradientBackground from '../components/ui/animated-gradient-background';
import Spinner from '../components/ui/spinner';

const Dashboard = () => {
  const [transactions, setTransactions] = useState([]);
  const [categorySummary, setCategorySummary] = useState([]);
  const [forecast, setForecast] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [refreshKey, setRefreshKey] = useState(0);
  const [modalOpen, setModalOpen] = useState(false);

  const { username, logout } = useAuth();

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);

      try {
        const [transRes, forecastRes, summaryRes] = await Promise.all([
          api.get('/api/transactions/'),
          api.get('/api/forecast/').catch(() => ({ data: { predicted_spending_next_month: 0 } })),
          api.get('/api/categories/summary/').catch(() => ({ data: [] })),
        ]);

        setTransactions(transRes.data);
        setForecast(forecastRes.data.predicted_spending_next_month || 0);
        setCategorySummary(summaryRes.data);
      } catch {
        setError("Couldn't reach the server. Check that 'python manage.py runserver' is running on port 8000.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [refreshKey]);

  if (loading && refreshKey === 0) {
    return (
      <div className="relative min-h-screen bg-[#020617] flex flex-col items-center justify-center overflow-hidden">
        <AnimatedGradientBackground Breathing gradientColors={[
          '#020617', '#1d4ed8', '#4f46e5', '#0ea5e9', '#22c55e', '#0f172a',
        ]} gradientStops={[35, 50, 60, 70, 80, 100]} animationSpeed={0.02} breathingRange={8} />
        <div className="relative z-10">
          <Spinner size={72} label="Analyzing SQL Data & Training AI..." />
        </div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.6 }}
      className="min-h-screen bg-[#020617] text-slate-100 p-4 md:p-8 font-sans"
    >
      <div className="max-w-6xl mx-auto">

        {/* Header */}
        <header className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-4">
          <div>
            <h1 className="text-3xl font-black tracking-tighter text-white">
              SPEND<span className="text-blue-500">ARA</span>
            </h1>
            <p className="text-slate-500 text-sm font-medium">
              Django + Scikit-Learn Regression
            </p>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-slate-500 text-sm hidden sm:inline">Hi, {username}</span>

            <button
              onClick={() => setModalOpen(true)}
              className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 transition-colors text-white font-bold text-sm px-4 py-2 rounded-xl"
            >
              <Plus size={16} /> Add
            </button>

            <button
              onClick={() => {
                setLoading(true);
                setRefreshKey((prev) => prev + 1);
              }}
              className="p-2 hover:bg-slate-800 rounded-xl transition-colors text-slate-400"
            >
              <RefreshCcw size={20} className={loading ? 'animate-spin' : ''} />
            </button>

            <div className="bg-slate-900 border border-slate-800 p-2 px-4 rounded-2xl flex items-center gap-3">
              <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
              <span className="text-[10px] font-bold text-emerald-500 uppercase tracking-widest">
                SQL Connected
              </span>
            </div>

            <button
              onClick={logout}
              title="Log out"
              className="p-2 hover:bg-slate-800 rounded-xl transition-colors text-slate-400"
            >
              <LogOut size={18} />
            </button>
          </div>
        </header>

        {error && (
          <div className="mb-8 bg-rose-500/10 border border-rose-500/20 p-4 rounded-2xl flex items-center gap-3 text-rose-500 text-sm">
            <AlertCircle size={18} />
            <p>{error}</p>
          </div>
        )}

        {/* Stats Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">

          {/* Forecast Card */}
          <motion.div
            initial={{ y: 40, opacity: 0, scale: 0.95 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            transition={{ duration: 0.6 }}
            className="lg:col-span-2 bg-gradient-to-br from-blue-700 to-indigo-600 rounded-[2.5rem] p-8 shadow-2xl relative overflow-hidden group"
          >
            <div className="absolute -right-20 -bottom-20 w-64 h-64 bg-white/10 rounded-full blur-3xl"></div>

            <div className="relative z-10">
              <p className="text-blue-100 text-sm font-semibold opacity-80">
                Projected Next Month Expenses
              </p>

              <motion.h2
                key={forecast}
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.4 }}
                className="text-7xl font-black text-white mt-2 mb-4 tracking-tighter"
              >
                ₹{Number(forecast).toLocaleString(undefined, { minimumFractionDigits: 2 })}
              </motion.h2>

              <div className="flex items-center gap-2 text-blue-100/70 text-[11px] font-bold uppercase tracking-wider">
                <TrendingUp size={14} />
                <span>Linear Regression Active</span>
              </div>
            </div>
          </motion.div>

          {/* Stats Cards */}
          <div className="grid grid-rows-2 gap-6">

            <motion.div
              initial={{ y: 30, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <GlowCard glowColor="blue" customSize className="w-full h-full p-6 flex items-center gap-5">
                <BarChart3 size={24} className="text-blue-500" />
                <div>
                  <p className="text-slate-500 text-[10px] font-black uppercase tracking-widest">
                    Total Logs
                  </p>
                  <h3 className="text-2xl font-bold text-white">
                    {transactions.length}
                  </h3>
                </div>
              </GlowCard>
            </motion.div>

            <motion.div
              initial={{ y: 30, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.3 }}
            >
              <GlowCard glowColor="green" customSize className="w-full h-full p-6 flex items-center gap-5">
                <Wallet size={24} className="text-emerald-500" />
                <div>
                  <p className="text-slate-500 text-[10px] font-black uppercase tracking-widest">
                    Status
                  </p>
                  <h3 className="text-2xl font-bold text-white italic">
                    Synced
                  </h3>
                </div>
              </GlowCard>
            </motion.div>

          </div>
        </div>

        {/* Chart */}
        <div className="mb-6">
          <CategoryChart data={categorySummary} />
        </div>

        {/* Transactions Table */}
        <div className="bg-slate-900/40 rounded-[2.5rem] border border-slate-800 overflow-hidden backdrop-blur-xl">

          <div className="p-8 border-b border-slate-800">
            <h3 className="text-xl font-bold text-white">
              Recent Transactions
            </h3>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="text-slate-500 text-[10px] uppercase font-black tracking-[0.2em] border-b border-slate-800/50">
                  <th className="px-8 py-5">Title</th>
                  <th className="px-8 py-5">Label</th>
                  <th className="px-8 py-5 text-right">Amount (INR)</th>
                </tr>
              </thead>
              <tbody>
                {transactions.length > 0 ? (
                  transactions.map((t) => (
                    <motion.tr
                      key={t.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3 }}
                      className="hover:bg-white/[0.02] transition-all"
                    >
                      <td className="px-8 py-6">
                        <p className="font-bold text-slate-200">
                          {t.title}
                        </p>
                        <p className="text-[10px] text-slate-600 font-mono mt-0.5">
                          {new Date(t.date).toLocaleDateString()}
                        </p>
                      </td>

                      <td className="px-8 py-6">
                        <span className="bg-slate-800 px-3 py-1 rounded-lg text-[10px] font-bold text-slate-400 uppercase">
                          {t.category_name || 'General'}
                        </span>
                      </td>

                      <td className={`px-8 py-6 text-right font-black text-lg ${t.transaction_type === 'INCOME' ? 'text-emerald-400' : 'text-slate-100'}`}>
                        <div className="flex items-center justify-end gap-1">
                          {t.transaction_type === 'INCOME'
                            ? <ArrowUpRight size={14}/>
                            : <ArrowDownLeft size={14} className="text-slate-500"/>}
                          ₹{parseFloat(t.amount).toLocaleString()}
                        </div>
                      </td>
                    </motion.tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="3" className="px-8 py-20 text-center text-slate-600">
                      No transactions yet — click "Add" to log your first one.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

      </div>

      <AddTransactionModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onCreated={() => setRefreshKey((prev) => prev + 1)}
      />
    </motion.div>
  );
};

export default Dashboard;
