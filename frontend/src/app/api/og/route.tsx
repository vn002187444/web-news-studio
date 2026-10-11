import { ImageResponse } from 'next/og';

export const runtime = 'edge';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const title = (searchParams.get('title') || 'News Studio - Kỷ Nguyên Báo Chí Tương Lai').slice(0, 140);
    const category = (searchParams.get('category') || 'TIN TỨC').slice(0, 30);

    return new ImageResponse(
      (
        <div
          style={{
            height: '100%',
            width: '100%',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'flex-start',
            justifyContent: 'center',
            backgroundColor: '#050505',
            padding: '80px',
            backgroundImage: 'radial-gradient(circle at 25px 25px, #333 2%, transparent 0%), radial-gradient(circle at 75px 75px, #333 2%, transparent 0%)',
            backgroundSize: '100px 100px',
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: '#ff0000',
              color: 'white',
              padding: '10px 30px',
              borderRadius: '50px',
              fontSize: 24,
              fontWeight: 700,
              letterSpacing: '0.1em',
              textTransform: 'uppercase',
              marginBottom: '40px',
            }}
          >
            {category}
          </div>
          <div
            style={{
              display: 'flex',
              fontSize: 70,
              fontFamily: 'serif',
              fontWeight: 900,
              color: 'white',
              lineHeight: 1.1,
              letterSpacing: '-0.02em',
              maxWidth: '900px',
            }}
          >
            {title}
          </div>
          <div
            style={{
              display: 'flex',
              position: 'absolute',
              bottom: '80px',
              left: '80px',
              fontSize: 30,
              color: '#888',
              letterSpacing: '0.05em',
            }}
          >
            NEWS<span style={{ fontWeight: 300, color: 'white' }}>STUDIO</span>
          </div>
        </div>
      ),
      {
        width: 1200,
        height: 630,
      }
    );
  } catch (e: any) {
    console.error(`Failed to generate OG image: ${e.message}`);
    return new Response('Failed to generate image', { status: 500 });
  }
}
