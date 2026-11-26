export default function RootNotFound() {
  return (
    <html lang="vi">
      <body style={{ fontFamily: 'system-ui, sans-serif', padding: '4rem 2rem', textAlign: 'center', backgroundColor: '#030712', color: '#f3f4f6' }}>
        <h1 style={{ fontSize: '2.5rem', marginBottom: '1rem', fontWeight: 700 }}>404 - Trang không tồn tại</h1>
        <p style={{ color: '#9ca3af', marginBottom: '2rem' }}>Đường dẫn bạn yêu cầu không tồn tại hoặc đã bị xóa.</p>
        <a href="/vi" style={{ display: 'inline-block', padding: '0.75rem 1.5rem', backgroundColor: '#2563eb', color: '#fff', borderRadius: '0.5rem', textDecoration: 'none', fontWeight: 500 }}>Về Trang Chủ</a>
      </body>
    </html>
  );
}
