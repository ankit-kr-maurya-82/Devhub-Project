import { useEffect, useRef, useState, useCallback } from 'react';
import { createSocketClient } from '../lib/socketConfig.js';
import { socketOrigin } from '../lib/api.js';

/**
 * useSocket – a React hook managing a Socket.IO client connection.
 * It handles authentication, connection lifecycle, and provides convenient
 * methods for community‑room interactions required by the frontend.
 */
export default function useSocket({ onMessage, onMessageUpdated, onMessageDeleted, onReactionUpdated, onRoomUsers, onUserOnline, onUserOffline, onUserTyping, onUserStoppedTyping, onError }) {
  const [connectionStatus, setConnectionStatus] = useState('Connecting…');
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
    const socket = createSocketClient(socketOrigin);
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

  const emitWithAck = useCallback(async (event, payload, { waitForConnection = false } = {}) => {
    const socket = socketRef.current;
    if (!socket) throw new Error('Socket connection is unavailable.');

    if (!socket.connected && waitForConnection) {
      await new Promise((resolve, reject) => {
        let timeout;
        const onConnect = () => {
          clearTimeout(timeout);
          resolve();
        };
        timeout = setTimeout(() => {
          socket.off('connect', onConnect);
          reject(new Error('Socket did not connect in time. Please try again.'));
        }, 10000);
        socket.once('connect', onConnect);
      });
    }

    if (!socket.connected) {
      throw new Error('Socket is not connected. Please wait for it to reconnect.');
    }

    return new Promise((resolve, reject) => {
      socket.timeout(10000).emit(event, payload, (timeoutError, response) => {
        if (timeoutError) {
          reject(new Error('The server did not confirm the request. Please try again.'));
        } else if (!response?.success) {
          reject(new Error(response?.message || 'The server rejected the request.'));
        } else {
          resolve(response);
        }
      });
    });
  }, []);

  // Public API
  const joinRoom = useCallback((roomId) => {
    return emitWithAck('joinRoom', { roomId }, { waitForConnection: true });
  }, [emitWithAck]);

  const leaveRoom = useCallback((roomId) => {
    emit('leaveRoom', { roomId });
  }, [emit]);

  const sendMessage = useCallback((roomId, details) => {
    return emitWithAck('sendMessage', { roomId, ...details });
  }, [emitWithAck]);

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
