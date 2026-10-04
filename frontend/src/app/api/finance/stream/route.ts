export async function GET(request: Request) {
  let lastClose = 65000;
  
  const stream = new ReadableStream({
    async start(controller) {
      // Send headers for SSE
      const encoder = new TextEncoder();
      
      const sendTick = () => {
        const time = Math.floor(Date.now() / 1000);
        const open = lastClose;
        const high = open + Math.random() * 50;
        const low = open - Math.random() * 50;
        const close = open + (Math.random() - 0.5) * 100;
        
        lastClose = close;
        
        const data = JSON.stringify({ time, open, high, low, close });
        controller.enqueue(encoder.encode(`data: ${data}\n\n`));
      };

      // Initial tick
      sendTick();

      // Loop every 1 second (mix of tick and ping for heartbeat)
      let count = 0;
      const intervalId = setInterval(() => {
        count++;
        if (count % 3 === 0) {
          controller.enqueue(encoder.encode(`data: ${JSON.stringify({ type: 'ping' })}\n\n`));
        } else {
          sendTick();
        }
      }, 1000);

      // Clean up when connection closes
      request.signal.addEventListener('abort', () => {
        clearInterval(intervalId);
        controller.close();
      });
    },
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
    },
  });
}
