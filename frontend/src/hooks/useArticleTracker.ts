'use client';

import { useEffect, useState } from 'react';

interface UserProfile {
  categoryScores: Record<string, number>;
  history: string[]; // slug history
}

const PROFILE_KEY = 'news_studio_user_profile';

export function useArticleTracker(currentCategory?: string, currentSlug?: string) {
  const [profile, setProfile] = useState<UserProfile | null>(null);

  useEffect(() => {
    // 1. Lấy profile cũ từ LocalStorage
    const stored = localStorage.getItem(PROFILE_KEY);
    let currentProfile: UserProfile = stored ? JSON.parse(stored) : { categoryScores: {}, history: [] };

    // 2. Nếu đang đọc 1 bài cụ thể, cập nhật Profile
    if (currentCategory && currentSlug && !currentProfile.history.includes(currentSlug)) {
      // Tăng điểm cho chuyên mục này
      currentProfile.categoryScores[currentCategory] = (currentProfile.categoryScores[currentCategory] || 0) + 1;
      
      // Lưu vào lịch sử (giữ tối đa 50 bài gần nhất để khỏi nặng máy)
      currentProfile.history.push(currentSlug);
      if (currentProfile.history.length > 50) {
        currentProfile.history.shift();
      }

      localStorage.setItem(PROFILE_KEY, JSON.stringify(currentProfile));
    }

    setProfile(currentProfile);

    // Đếm view thật: đọc >10s mới tính, 1 slug/24h, bỏ qua nếu đã đếm
    if (currentSlug) {
      const key = `viewed:${currentSlug}`;
      const last = parseInt(localStorage.getItem(key) || '0', 10);
      if (Date.now() - last > 24 * 3600 * 1000) {
        const t = setTimeout(() => {
          fetch('/api/views', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ slug: currentSlug }),
          }).then(() => localStorage.setItem(key, String(Date.now()))).catch(() => {});
        }, 10000);
        return () => clearTimeout(t);
      }
    }
  }, [currentCategory, currentSlug]);

  return profile;
}
