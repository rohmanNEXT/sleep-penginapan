'use client';

import { useState } from 'react';
import api from '@/lib/api';
import { toast } from 'sonner';
import type { Content } from '../type';
import { FaStar } from 'react-icons/fa';

interface ReviewsSectionProps {
  item: Content;
  reviewsList: any[];
  userHasBooked: boolean;
  userId?: string;
  onReviewsUpdate: (reviews: any[]) => void;
  onRatingUpdate: (rating: number, count: number) => void;
}

export const ReviewsSection: React.FC<ReviewsSectionProps> = ({
  item,
  reviewsList,
  userHasBooked,
  userId,
  onReviewsUpdate,
  onRatingUpdate,
}) => {
  const [newReviewText, setNewReviewText] = useState('');
  const [newReviewRating, setNewReviewRating] = useState(0);
  const [editingReviewId, setEditingReviewId] = useState<string | null>(null);
  const [editingReviewText, setEditingReviewText] = useState('');
  const [editingReviewRating, setEditingReviewRating] = useState(5);

  const refreshReviews = async () => {
    const { data: revData } = await api.get(`/reviews/penginapan/${item.id}`);
    onReviewsUpdate(revData);
    const { data: detailData } = await api.get(`/penginapan/${item.id}`);
    onRatingUpdate(
      detailData.ratingRataRata || 0,
      detailData.reviews?.length || 0,
    );
  };

  const handlePostReview = async () => {
    if (newReviewRating === 0) {
      toast.error('Silakan pilih rating terlebih dahulu.');
      return;
    }
    if (!newReviewText.trim()) {
      toast.error('Review tidak boleh kosong.');
      return;
    }
    try {
      await api.post('/reviews', {
        userId,
        penginapanId: item.id,
        rating: newReviewRating,
        comment: newReviewText,
      });
      toast.success('Review berhasil dikirim!');
      setNewReviewText('');
      setNewReviewRating(0);
      await refreshReviews();
    } catch (e: any) {
      toast.error(e?.response?.data?.message || 'Gagal mengirim review');
    }
  };

  const handleUpdateReview = async (revId: string) => {
    if (!editingReviewText.trim()) {
      toast.error('Review tidak boleh kosong.');
      return;
    }
    try {
      await api.put(`/reviews/${revId}`, {
        userId,
        rating: editingReviewRating,
        comment: editingReviewText,
      });
      toast.success('Review diperbarui!');
      setEditingReviewId(null);
      await refreshReviews();
    } catch (e: any) {
      toast.error(e?.response?.data?.message || 'Gagal memperbarui review');
    }
  };

  const handleDeleteReview = async (revId: string) => {
    if (!confirm('Hapus review ini?')) return;
    try {
      await api.delete(`/reviews/${revId}`, { data: { userId } });
      toast.success('Review dihapus!');
      await refreshReviews();
    } catch (e: any) {
      toast.error(e?.response?.data?.message || 'Gagal menghapus review');
    }
  };

  if (reviewsList.length === 0 && !userHasBooked) return null;

  return (
    <section className="bg-white border-[3px] border-black p-8 rounded-3xl shadow-[8px_8px_0px_0px_black] space-y-6">
      <div className="flex justify-between items-center border-b-[3px] border-black pb-4">
        <div>
          <h3 className="text-xl font-black uppercase">Reviews</h3>
          <div className="flex items-center gap-1.5 mt-1">
            <FaStar className="cursor-pointer text-[#ffcc00] text-sm" />
            <span className="text-xs font-black">{item.rating || 0}</span>
            <span className="text-stone-400 text-[10px] font-bold">
              ({reviewsList.length} reviews)
            </span>
          </div>
        </div>
      </div>

      {/* Write Review */}
      {userId && userHasBooked && !editingReviewId && (
        <div className="bg-[#f5f0e8]/50 border-2 border-black p-6 rounded-2xl space-y-4">
          <h4 className="font-black uppercase text-xs">Write a Review</h4>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-black uppercase opacity-60">
              Rating:
            </span>
            <div className="flex gap-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  onClick={() => setNewReviewRating(star)}
                  className="focus:outline-none"
                >
                  <FaStar
                    className={`cursor-pointer text-lg ${star <= newReviewRating ? 'text-[#ffcc00]' : 'text-stone-300'}`}
                  />
                </button>
              ))}
            </div>
          </div>
          <textarea
            placeholder="Share your experience..."
            value={newReviewText}
            onChange={(e) => setNewReviewText(e.target.value)}
            rows={3}
            className="w-full bg-white border-2 border-black p-3 rounded-xl font-bold text-xs outline-none resize-none"
          />
          <button
            onClick={handlePostReview}
            className="bg-black text-white px-5 py-2.5 font-black uppercase text-[10px] border-2 border-black rounded-xl shadow-[3px_3px_0px_0px_black] hover:bg-[#ffcc00] hover:text-black transition-all cursor-pointer"
          >
            Post Review
          </button>
        </div>
      )}

      {/* Reviews List */}
      <div className="space-y-4 max-h-100 overflow-y-auto pr-2 divide-y-2 divide-stone-100">
        {reviewsList.length === 0 ? (
          <p className="text-stone-400 font-bold uppercase text-[10px] py-4">
            No reviews yet.
          </p>
        ) : (
          reviewsList.map((rev) => (
            <div key={rev.id} className="pt-4 first:pt-0 space-y-2">
              <div className="flex justify-between items-start">
                <div>
                  <span className="block font-black text-xs uppercase">
                    {rev.user?.nama || rev.user?.username || 'Guest'}
                  </span>
                  <div className="flex gap-1 mt-0.5">
                    {[1, 2, 3, 4, 5].map((s) => (
                      <FaStar
                        key={s}
                        className={`cursor-pointer text-[12px] ${s <= rev.rating ? 'text-[#ffcc00]' : 'text-stone-200'}`}
                      />
                    ))}
                  </div>
                </div>
                {userId === rev.userId && (
                  <div className="flex gap-2">
                    <button
                      onClick={() => {
                        setEditingReviewId(rev.id);
                        setEditingReviewText(rev.comment);
                        setEditingReviewRating(rev.rating);
                      }}
                      className="cursor-pointer text-[9px] font-black uppercase border border-black px-2 py-1 bg-white hover:bg-stone-50 rounded shadow-[1.5px_1.5px_0px_0px_black]"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDeleteReview(rev.id)}
                      className="cursor-pointer text-[9px] font-black uppercase border border-red-600 px-2 py-1 bg-white text-red-600 hover:bg-red-50 rounded"
                    >
                      Delete
                    </button>
                  </div>
                )}
              </div>

              {editingReviewId === rev.id ? (
                <div className="bg-[#f5f0e8]/50 border-2 border-black p-4 rounded-xl space-y-3 mt-2">
                  <div className="flex items-center gap-2">
                    <span className="text-[9px] font-black uppercase opacity-60">
                      Rating:
                    </span>
                    <div className="flex gap-1">
                      {[1, 2, 3, 4, 5].map((s) => (
                        <button
                          key={s}
                          onClick={() => setEditingReviewRating(s)}
                          className="focus:outline-none"
                        >
                          <FaStar
                            className={`cursor-pointer text-sm ${s <= editingReviewRating ? 'text-[#ffcc00]' : 'text-stone-300'}`}
                          />
                        </button>
                      ))}
                    </div>
                  </div>
                  <textarea
                    value={editingReviewText}
                    onChange={(e) => setEditingReviewText(e.target.value)}
                    rows={2}
                    className="w-full bg-white border-2 border-black p-2.5 rounded-lg font-bold text-xs outline-none resize-none"
                  />
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleUpdateReview(rev.id)}
                      className="cursor-pointer bg-black text-white px-3 py-1.5 font-black uppercase text-[9px] border border-black rounded shadow-[2px_2px_0px_0px_black]"
                    >
                      Save
                    </button>
                    <button
                      onClick={() => setEditingReviewId(null)}
                      className="cursor-pointer bg-white border border-stone-300 px-3 py-1.5 font-black uppercase text-[9px] rounded hover:bg-stone-50"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <p className="text-stone-600 text-xs font-medium leading-relaxed italic">
                  {rev.comment}
                </p>
              )}
            </div>
          ))
        )}
      </div>
    </section>
  );
};
