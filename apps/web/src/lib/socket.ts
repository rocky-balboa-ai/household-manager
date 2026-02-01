import { io, Socket } from 'socket.io-client';

const SOCKET_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

class SocketClient {
  private socket: Socket | null = null;

  connect(userId: string, userName: string) {
    if (this.socket?.connected) return;

    this.socket = io(SOCKET_URL, {
      transports: ['websocket'],
      autoConnect: true,
    });

    this.socket.on('connect', () => {
      console.log('Socket connected');
      this.socket?.emit('join', { userId, userName });
    });

    this.socket.on('disconnect', () => {
      console.log('Socket disconnected');
    });
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }

  on(event: string, callback: (data: any) => void) {
    this.socket?.on(event, callback);
  }

  off(event: string, callback?: (data: any) => void) {
    this.socket?.off(event, callback);
  }
}

export const socketClient = new SocketClient();
