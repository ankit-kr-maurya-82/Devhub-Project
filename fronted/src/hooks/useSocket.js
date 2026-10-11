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
  const [connectionStatus, setConnectionStatus] = useState('Connecting…');
  const socketRef = useRef(null);
  const typingTimers = useRef(new Map()); // maps roomId → timeoutId for stop‑typing debounce

  // Initialise socket once on mount
  useEffect(() => {
    const token = getCookieToken();
    if (!token) {
      setConnectionStatus('No auth token');
      return undefined;
    }
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
      if (onError) onError(err);
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
      if (onMessage) onMessage(msg);
    });
    socket.on('messageUpdated', (msg) => {
      if (onMessageUpdated) onMessageUpdated(msg);
    });
    socket.on('messageDeleted', (payload) => {
      if (onMessageDeleted) onMessageDeleted(payload);
    });
    socket.on('messageReactionUpdated', (payload) => {
      if (onReactionUpdated) onReactionUpdated(payload);
    });
    socket.on('roomUsers', (payload) => {
      if (onRoomUsers) onRoomUsers(payload);
    });
    socket.on('userOnline', (payload) => {
      if (onUserOnline) onUserOnline(payload);
    });
    socket.on('userOffline', (payload) => {
      if (onUserOffline) onUserOffline(payload);
    });
    socket.on('userTyping', (payload) => {
      if (onUserTyping) onUserTyping(payload);
    });
    socket.on('userStoppedTyping', (payload) => {
      if (onUserStoppedTyping) onUserStoppedTyping(payload);
    });
    socket.on('socketError', (err) => {
      console.error('Socket error event', err);
      if (onError) onError(err);
    });

    // Cleanup on unmount
    return () => {
      socket.disconnect();
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
    socket: socketRef.current,
    connectionStatus,
    joinRoom,
    leaveRoom,
    sendMessage,
    startTyping,
    stopTyping,
    requestRoomUsers,
  };
}

