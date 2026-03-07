import { useEffect, useRef, useCallback } from 'react';
import { io } from 'socket.io-client';

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000';

export function useSocket(tripId, handlers = {}) {
  const socketRef = useRef(null);

  useEffect(() => {
    const token = localStorage.getItem('accessToken');
    if (!token || !tripId) return;
    const socket = io(SOCKET_URL, { auth: { token }, transports: ['websocket'] });
    socketRef.current = socket;
    socket.on('connect', () => socket.emit('join_trip', tripId));
    socket.on('connect_error', (err) => console.warn('Socket error:', err.message));
    Object.entries(handlers).forEach(([event, handler]) => socket.on(event, handler));
    return () => { socket.emit('leave_trip', tripId); socket.disconnect(); socketRef.current = null; };
  }, [tripId]);

  const emit = useCallback((event, data) => { if (socketRef.current?.connected) socketRef.current.emit(event, data); }, []);
  return { emit };
}
