'use client';

import { useState, useEffect, useCallback } from 'react';
import { useAuthStore } from '@/store/authStore';
import { toast } from 'sonner';
import api from '@/lib/api';

interface TransactionRecord {
  id: string;
  type: string;
  date: string;
  amount: number;
  status: string;
  isWithdraw?: boolean;
}

interface PurchaseRecord {
  id: string;
  hotelName: string;
  date: string;
  price: number;
  status: string;
}

export default function BalancePage() {
  const { user } = useAuthStore();
  const [balance, setBalance] = useState<number>(0);
  const [topupAmount, setTopupAmount] = useState<string>('');
  const [transactions, setTransactions] = useState<TransactionRecord[]>([]);
  const [purchases, setPurchases] = useState<PurchaseRecord[]>([]);
  const [balanceHistoryTab, setBalanceHistoryTab] = useState<
    'balance' | 'hotels'
  >('balance');
  const [txPage, setTxPage] = useState(1);
  const [purchPage, setPurchPage] = useState(1);
  const txsPerPage = 4;

  const fetchBalanceData = useCallback(async () => {
    if (!user?.id) return;
    try {
      const { data: balData } = await api.get(`/balances/${user.id}`);
      setBalance(Number(balData.saldo ?? 0));
    } catch {
      setBalance(0);
    }
    try {
      const { data: txsData } = await api.get(
        `/transaksi-balance/user/${user.id}`,
      );
      setTransactions(
        (txsData || []).map((t: any) => ({
          id: t.id,
          type: t.status === 'WITHDRAW' ? 'Tarik Tunai' : 'Top Up Saldo',
          date: new Date(t.createdAt).toLocaleDateString('id-ID', {
            day: '2-digit',
            month: 'short',
            year: 'numeric',
          }),
          amount: Number(t.nominal),
          status: t.status || 'SUCCESS',
          isWithdraw: t.status === 'WITHDRAW',
        })),
      );
    } catch {
      setTransactions([]);
    }
    try {
      const { data: bookingData } = await api.get(
        `/transaksi-penginapan/user/${user.id}`,
      );
      setPurchases(
        (bookingData || []).map((b: any) => ({
          id: b.id,
          hotelName: b.penginapan?.title || 'Penginapan',
          date: new Date(b.createdAt).toLocaleDateString('id-ID', {
            day: '2-digit',
            month: 'short',
            year: 'numeric',
          }),
          price: Number(b.totalHarga),
          status: 'SUCCESS',
        })),
      );
    } catch {
      setPurchases([]);
    }
  }, [user]);

  useEffect(() => {
    fetchBalanceData();
  }, [fetchBalanceData]);

  const MIN_NOMINAL = 10_000;
  const MAX_NOMINAL = 12_000_000_000;

  const handleBalanceAction = async (e: React.FormEvent) => {
    e.preventDefault();
    const amount = parseFloat(topupAmount);
    if (isNaN(amount) || amount <= 0) {
      toast.error('Mohon masukkan jumlah transaksi yang valid!');
      return;
    }
    if (amount < MIN_NOMINAL) {
      toast.error(
        `Nominal minimum top up adalah Rp ${MIN_NOMINAL.toLocaleString('id-ID')}.`,
      );
      return;
    }
    if (amount > MAX_NOMINAL) {
      toast.error(
        `Nominal maksimum top up adalah Rp ${MAX_NOMINAL.toLocaleString('id-ID')}.`,
      );
      return;
    }
    if (!user) return;

    try {
      await api.post('/transaksi-balance', {
        userId: user.id,
        nominal: amount,
        metodePembayaran: 'Sellepy Pay Wallet',
      });

      toast.success('Top Up Berhasil!', {
        description: `Rp ${amount.toLocaleString('id-ID')} telah ditambahkan ke wallet Anda.`,
      });
      setTopupAmount('');
      fetchBalanceData();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Gagal melakukan top up');
    }
  };

  const handleTarikTunai = async () => {
    const amount = parseFloat(topupAmount);
    if (isNaN(amount) || amount <= 0) {
      toast.error('Mohon masukkan jumlah penarikan yang valid!');
      return;
    }
    if (amount < MIN_NOMINAL) {
      toast.error(
        `Nominal minimum tarik tunai adalah Rp ${MIN_NOMINAL.toLocaleString('id-ID')}.`,
      );
      return;
    }
    if (amount > MAX_NOMINAL) {
      toast.error(
        `Nominal maksimum tarik tunai adalah Rp ${MAX_NOMINAL.toLocaleString('id-ID')}.`,
      );
      return;
    }
    if (!user) return;
    if (amount > balance) {
      toast.error('Saldo tidak mencukupi untuk penarikan ini.');
      return;
    }
    try {
      await api.post('/transaksi-balance/withdraw', {
        userId: user.id,
        nominal: amount,
        metodePembayaran: 'TARIK TUNAI',
      });
      toast.success('Tarik Tunai Berhasil!', {
        description: `Rp ${amount.toLocaleString('id-ID')} telah ditarik dari wallet Anda.`,
      });
      setTopupAmount('');
      fetchBalanceData();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Gagal melakukan penarikan');
    }
  };

  if (!user) return null;

  return (
    <div className="h-[880px] overflow-y-auto space-y-8">
      {/* Balance Card + Form */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-stretch">
        {/* Balance Display Card */}
        <div className="md:col-span-6 bg-black text-white p-7 rounded-2xl border-[3px] border-black shadow-[6px_6px_0px_0px_#ffcc00] flex flex-col justify-between relative overflow-hidden min-h-[220px]">
          <div className="absolute top-[-20px] right-[-20px] w-24 h-24 bg-[#ffcc00]/15 rounded-full pointer-events-none" />
          <div className="absolute bottom-[-30px] right-[60px] w-16 h-16 bg-[#ffcc00]/8 rounded-full pointer-events-none" />
          <div className="flex justify-between items-start z-10">
            <div>
              <p className="text-[9px] font-black uppercase text-[#ffcc00] tracking-widest leading-none">
                Dompet Saya
              </p>
              <h4 className="text-xs font-bold text-white/70 uppercase mt-1">
                Sleeppy Wallet Card
              </h4>
            </div>
          </div>
          <div className="z-10 mt-6">
            <p className="text-[8px] font-black uppercase text-white/50 leading-none">
              Saldo Tersedia
            </p>
            <p className="text-4xl font-black text-white mt-1 leading-none">
              Rp {balance.toLocaleString('id-ID')}
            </p>
          </div>
          <div className="flex justify-between items-center z-10 border-t border-white/10 pt-4 mt-4">
            <span className="font-mono text-[9px] opacity-60">
              **** **** **** {user.id.slice(-4) || '8899'}
            </span>
            <span className="text-[8px] font-black uppercase bg-[#ffcc00] text-black px-2 py-0.5 rounded">
              Active
            </span>
          </div>
        </div>

        {/* Top Up Panel */}
        <div className="md:col-span-6 bg-white border-[3px] border-black p-6 rounded-2xl shadow-[6px_6px_0px_0px_black] flex flex-col justify-between">
          <div>
            <h3 className="font-black text-base uppercase leading-none tracking-tight">
              Kelola Saldo Wallet
            </h3>
            <p className="text-[9px] text-stone-400 font-bold uppercase mt-1">
              Lakukan pengisian saldo atau penarikan tunai secara cepat!
            </p>
          </div>
          <form onSubmit={handleBalanceAction} className="space-y-4 mt-4">
            <div>
              <label className="block text-[8px] font-black uppercase text-stone-500 mb-1.5">
                Jumlah (Rp) — Min: 10.000 / Maks: 12.000.000.000
              </label>
              <input
                required
                type="number"
                min="10000"
                max="12000000000"
                step="any"
                value={topupAmount}
                onChange={(e) => setTopupAmount(e.target.value)}
                placeholder="Contoh: 100000"
                className="w-full bg-stone-50 border-2 border-black p-3 font-black text-xs rounded-xl outline-none focus:bg-white transition-colors"
              />
            </div>
            <div className="flex gap-2 flex-wrap">
              {[50000, 100000, 250000, 500000].map((preset) => (
                <button
                  key={preset}
                  type="button"
                  onClick={() => setTopupAmount(preset.toString())}
                  className="bg-stone-100 hover:bg-[#ffcc00] border border-black px-3 py-1 rounded-lg font-black text-[9px] uppercase transition-all cursor-pointer"
                >
                  +Rp {preset.toLocaleString('id-ID')}
                </button>
              ))}
            </div>
            <div className="flex gap-2 pt-1">
              <button
                type="submit"
                className="flex-1 border-2 border-black py-2.5 font-black uppercase text-[10px] tracking-wider rounded-xl shadow-[3px_3px_0px_0px_black] active:translate-x-0.5 active:translate-y-0.5 active:shadow-none transition-all cursor-pointer text-white bg-[#0055ff] hover:bg-[#3377ff]"
              >
                💰 Top Up
              </button>
              <button
                type="button"
                onClick={handleTarikTunai}
                className="flex-1 border-2 border-black py-2.5 font-black uppercase text-[10px] tracking-wider rounded-xl shadow-[3px_3px_0px_0px_black] active:translate-x-0.5 active:translate-y-0.5 active:shadow-none transition-all cursor-pointer text-white bg-[#e63b2e] hover:bg-[#ff4d4d]"
              >
                🏦 Tarik Tunai
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Transaction History Table */}
      <div className="bg-white border-[3px] border-black rounded-2xl shadow-[6px_6px_0px_0px_black] overflow-hidden">
        <div className="p-5 border-b-[3px] border-black bg-stone-50 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h3 className="font-black text-lg uppercase leading-none">
              Riwayat Transaksi
            </h3>
            <p className="text-[9px] text-stone-400 font-bold uppercase mt-1">
              Daftar mutasi saldo dan pemesanan penginapan Anda
            </p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setBalanceHistoryTab('balance')}
              className={`px-4 py-1.5 font-black uppercase text-[9px] tracking-wider rounded-xl border-2 transition-all cursor-pointer ${balanceHistoryTab === 'balance' ? 'bg-black text-white border-black shadow-[2px_2px_0px_0px_black]' : 'bg-white text-black hover:bg-stone-50 border-black/10'}`}
            >
              💼 Mutasi ({transactions.length})
            </button>
            <button
              onClick={() => setBalanceHistoryTab('hotels')}
              className={`px-4 py-1.5 font-black uppercase text-[9px] tracking-wider rounded-xl border-2 transition-all cursor-pointer ${balanceHistoryTab === 'hotels' ? 'bg-black text-white border-black shadow-[2px_2px_0px_0px_black]' : 'bg-white text-black hover:bg-stone-50 border-black/10'}`}
            >
              🏨 Pemesanan ({purchases.length})
            </button>
          </div>
        </div>

        <div className="overflow-x-auto max-h-[435px] min-h-[435px] overflow-y-auto">
          {balanceHistoryTab === 'balance' ? (
            <table className="w-full border-collapse text-left">
              <thead>
                <tr className="bg-black text-white text-[9px] font-black uppercase tracking-wider border-b-[3px] border-black">
                  <th className="p-4">Transaction ID</th>
                  <th className="p-4">Jenis Transaksi</th>
                  <th className="p-4">Tanggal</th>
                  <th className="p-4">Jumlah</th>
                  <th className="p-4 text-center">Status</th>
                </tr>
              </thead>
              <tbody>
                {transactions
                  .slice((txPage - 1) * txsPerPage, txPage * txsPerPage)
                  .map((tx) => (
                    <tr
                      key={tx.id}
                      className="border-b-2 border-black/10 last:border-0 hover:bg-stone-50/50 transition-colors"
                    >
                      <td className="p-4 font-mono font-black text-[10px]">
                        {tx.id}
                      </td>
                      <td className="p-4 font-black uppercase text-xs">
                        {tx.type}
                      </td>
                      <td className="p-4 text-xs font-bold text-stone-500">
                        {tx.date}
                      </td>
                      <td
                        className={`p-4 font-black text-sm ${tx.isWithdraw ? 'text-red-500' : 'text-green-600'}`}
                      >
                        {tx.isWithdraw ? '-' : '+'}${tx.amount.toFixed(2)}
                      </td>
                      <td className="p-4 text-center">
                        {tx.isWithdraw ? (
                          <span className="bg-red-100 border border-red-400 text-red-600 px-2.5 py-0.5 rounded-full text-[8px] font-black uppercase tracking-wider">
                            WITHDRAW
                          </span>
                        ) : (
                          <span className="bg-[#00d084]/20 border border-[#00d084] text-[#00a86b] px-2.5 py-0.5 rounded-full text-[8px] font-black uppercase tracking-wider">
                            SUCCESS
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          ) : (
            <table className="w-full border-collapse text-left">
              <thead>
                <tr className="bg-black text-white text-[9px] font-black uppercase tracking-wider border-b-[3px] border-black">
                  <th className="p-4">Booking ID</th>
                  <th className="p-4">Penginapan / Hotel</th>
                  <th className="p-4">Tanggal</th>
                  <th className="p-4">Harga</th>
                  <th className="p-4 text-center">Status</th>
                </tr>
              </thead>
              <tbody>
                {purchases
                  .slice((purchPage - 1) * txsPerPage, purchPage * txsPerPage)
                  .map((rec) => (
                    <tr
                      key={rec.id}
                      className="border-b-2 border-black/10 last:border-0 hover:bg-stone-50/50 transition-colors"
                    >
                      <td className="p-4 font-mono font-black text-[10px]">
                        {rec.id}
                      </td>
                      <td className="p-4 font-black uppercase text-xs">
                        {rec.hotelName}
                      </td>
                      <td className="p-4 text-xs font-bold text-stone-500">
                        {rec.date}
                      </td>
                      <td className="p-4 font-black text-sm text-red-500">
                        -Rp {rec.price.toLocaleString('id-ID')}
                      </td>
                      <td className="p-4 text-center">
                        <span className="bg-[#00d084]/20 border border-[#00d084] text-[#00a86b] px-2.5 py-0.5 rounded-full text-[8px] font-black uppercase tracking-wider">
                          {rec.status}
                        </span>
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          )}
        </div>

        <div className="p-4 border-t-[3px] border-black bg-stone-50 flex justify-between items-center">
          {balanceHistoryTab === 'balance' ? (
            <>
              <button
                type="button"
                disabled={txPage === 1}
                onClick={() => setTxPage((p) => Math.max(1, p - 1))}
                className="px-3 py-1.5 border-2 border-black rounded-lg font-black text-[9px] uppercase bg-white disabled:opacity-40 shadow-[1.5px_1.5px_0px_0px_black] active:shadow-none active:translate-x-0.5 active:translate-y-0.5 transition-all cursor-pointer"
              >
                Sebelumnya
              </button>
              <span className="font-black text-[10px] uppercase">
                Halaman {txPage} dari{' '}
                {Math.ceil(transactions.length / txsPerPage) || 1}
              </span>
              <button
                type="button"
                disabled={txPage >= Math.ceil(transactions.length / txsPerPage)}
                onClick={() =>
                  setTxPage((p) =>
                    Math.min(
                      Math.ceil(transactions.length / txsPerPage),
                      p + 1,
                    ),
                  )
                }
                className="px-3 py-1.5 border-2 border-black rounded-lg font-black text-[9px] uppercase bg-white disabled:opacity-40 shadow-[1.5px_1.5px_0px_0px_black] active:shadow-none active:translate-x-0.5 active:translate-y-0.5 transition-all cursor-pointer"
              >
                Selanjutnya
              </button>
            </>
          ) : (
            <>
              <button
                type="button"
                disabled={purchPage === 1}
                onClick={() => setPurchPage((p) => Math.max(1, p - 1))}
                className="px-3 py-1.5 border-2 border-black rounded-lg font-black text-[9px] uppercase bg-white disabled:opacity-40 shadow-[1.5px_1.5px_0px_0px_black] active:shadow-none active:translate-x-0.5 active:translate-y-0.5 transition-all cursor-pointer"
              >
                Sebelumnya
              </button>
              <span className="font-black text-[10px] uppercase">
                Halaman {purchPage} dari{' '}
                {Math.ceil(purchases.length / txsPerPage) || 1}
              </span>
              <button
                type="button"
                disabled={purchPage >= Math.ceil(purchases.length / txsPerPage)}
                onClick={() =>
                  setPurchPage((p) =>
                    Math.min(Math.ceil(purchases.length / txsPerPage), p + 1),
                  )
                }
                className="px-3 py-1.5 border-2 border-black rounded-lg font-black text-[9px] uppercase bg-white disabled:opacity-40 shadow-[1.5px_1.5px_0px_0px_black] active:shadow-none active:translate-x-0.5 active:translate-y-0.5 transition-all cursor-pointer"
              >
                Selanjutnya
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
