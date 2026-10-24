import { useEffect, useRef, useState, useCallback } from 'react';
import { io } from 'socket.io-client';

// Helper to extract JWT token from cookies (same logic as backend)
function getCookieToken() {
  const cookieHeader = document.cookie || '';
  for (const part of cookieHeader.split(';')) {
    const separator = part.indexOf('=');
    if (separator < 0) continue;
    const name = part.slice(0, separator).trim();
    if (name !== 'token') continue;
    try {
      return decodeURIComponent(part.slice(separator + 1).trim());
    } catch {
      return '';
    }
  }
  return '';
}

/**
 * useSocket – a React hook managing a Socket.IO client connection.
 * It handles authentication, connection lifecycle, and provides convenient
 * methods for community‑room interactions required by the frontend.
 */
export default function useSocket({ onMessage, onMessageUpdated, onMessageDeleted, onReactionUpdated, onRoomUsers, onUserOnline, onUserOffline, onUserTyping, onUserStoppedTyping, onError }) {
  const [connectionStatus, setConnectionStatus] = useState(() => (
    getCookieToken() ? 'Connecting…' : 'No auth token'
  ));
  const socketRef = useRef(null);
  const typingTimers = useRef(new Map()); // maps roomId → timeoutId for stop‑typing debounce
  const handlersRef = useRef({});

  useEffect(() => {
    handlersRef.current = {
      onMessage,
      onMessageUpdated,
      onMessageDeleted,
      onReactionUpdated,
      onRoomUsers,
      onUserOnline,
      onUserOffline,
      onUserTyping,
      onUserStoppedTyping,
      onError,
    };
  }, [onMessage, onMessageUpdated, onMessageDeleted, onReactionUpdated, onRoomUsers, onUserOnline, onUserOffline, onUserTyping, onUserStoppedTyping, onError]);

  // Initialise socket once on mount
  useEffect(() => {
    const timers = typingTimers.current;
    const token = getCookieToken();
    if (!token) return undefined;
    const socket = io({
      auth: { token },
      path: '/socket.io', // default path used by backend Server
    });
    socketRef.current = socket;

    socket.on('connect', () => {
      setConnectionStatus('Connected');
    });
    socket.on('connect_error', (err) => {
      console.error('Socket connection error', err);
      setConnectionStatus('Connection error');
      handlersRef.current.onError?.(err);
    });
    socket.on('disconnect', (reason) => {
      console.warn('Socket disconnected', reason);
      setConnectionStatus('Disconnected');
    });
    socket.on('reconnect_attempt', () => {
      setConnectionStatus('Reconnecting…');
    });

    // Core events emitted by backend
    socket.on('newMessage', (msg) => {
      handlersRef.current.onMessage?.(msg);
    });
    socket.on('messageUpdated', (msg) => {
      handlersRef.current.onMessageUpdated?.(msg);
    });
    socket.on('messageDeleted', (payload) => {
      handlersRef.current.onMessageDeleted?.(payload);
    });
    socket.on('messageReactionUpdated', (payload) => {
      handlersRef.current.onReactionUpdated?.(payload);
    });
    socket.on('roomUsers', (payload) => {
      handlersRef.current.onRoomUsers?.(payload);
    });
    socket.on('userOnline', (payload) => {
      handlersRef.current.onUserOnline?.(payload);
    });
    socket.on('userOffline', (payload) => {
      handlersRef.current.onUserOffline?.(payload);
    });
    socket.on('userTyping', (payload) => {
      handlersRef.current.onUserTyping?.(payload);
    });
    socket.on('userStoppedTyping', (payload) => {
      handlersRef.current.onUserStoppedTyping?.(payload);
    });
    socket.on('socketError', (err) => {
      console.error('Socket error event', err);
      handlersRef.current.onError?.(err);
    });

    // Cleanup on unmount
    return () => {
      socket.disconnect();
      socketRef.current = null;
      for (const timerId of timers.values()) clearTimeout(timerId);
      timers.clear();
    };
  }, []);

  // Helper to emit with guard (the backend already rate‑limits)
  const emit = useCallback((event, payload) => {
    if (socketRef.current && socketRef.current.connected) {
      socketRef.current.emit(event, payload);
    }
  }, []);

  // Public API
  const joinRoom = useCallback((roomId) => {
    emit('joinRoom', { roomId });
  }, [emit]);

  const leaveRoom = useCallback((roomId) => {
    emit('leaveRoom', { roomId });
  }, [emit]);

  const sendMessage = useCallback((roomId, details) => {
    emit('sendMessage', { roomId, ...details });
  }, [emit]);

  const startTyping = useCallback((roomId) => {
    emit('typing', { roomId });
    // Reset the stop‑typing timer if user continues typing
    const timerId = typingTimers.current.get(roomId);
    if (timerId) clearTimeout(timerId);
    // Ensure a stop‑typing is sent after a short idle period
    const timeout = setTimeout(() => {
      emit('stopTyping', { roomId });
      typingTimers.current.delete(roomId);
    }, 3000);
    typingTimers.current.set(roomId, timeout);
  }, [emit]);

  const stopTyping = useCallback((roomId) => {
    emit('stopTyping', { roomId });
    const timerId = typingTimers.current.get(roomId);
    if (timerId) clearTimeout(timerId);
    typingTimers.current.delete(roomId);
  }, [emit]);

  const requestRoomUsers = useCallback((roomId) => {
    emit('getRoomUsers', { roomId });
  }, [emit]);

  return {
    connectionStatus,
    joinRoom,
    leaveRoom,
    sendMessage,
    startTyping,
    stopTyping,
    requestRoomUsers,
  };
}
