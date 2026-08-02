"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { io, Socket } from "socket.io-client";
import { PaymentReceivedData } from "./api";

const WS_URL = typeof window !== "undefined" ? window.location.origin : "";

export function useSocket() {
  const socketRef = useRef<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    const socket = io(WS_URL, {
      path: "/ws",
      transports: ["websocket", "polling"],
    });

    socket.on("connect", () => {
      setIsConnected(true);
      socket.emit("join-payments");
    });

    socket.on("disconnect", () => {
      setIsConnected(false);
    });

    socketRef.current = socket;

    return () => {
      socket.disconnect();
    };
  }, []);

  const onPaymentReceived = useCallback((callback: (data: PaymentReceivedData) => void) => {
    socketRef.current?.on("payment:received", callback);
    return () => {
      socketRef.current?.off("payment:received", callback);
    };
  }, []);

  const onVoiceAnnounce = useCallback((callback: (data: { payerName: string; amount: number; message: string }) => void) => {
    socketRef.current?.on("voice:announce", callback);
    return () => {
      socketRef.current?.off("voice:announce", callback);
    };
  }, []);

  return { isConnected, onPaymentReceived, onVoiceAnnounce };
}