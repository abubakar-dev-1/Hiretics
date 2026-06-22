import { io, Socket } from "socket.io-client";
import { getToken } from "./auth";

let socket: Socket | null = null;

/**
 * Singleton Socket.io client, authenticated with the user's JWT. The server
 * joins it to its company room, so it receives live "candidate.scored" events.
 * Returns null on the server or when not logged in.
 */
export function getSocket(): Socket | null {
  if (typeof window === "undefined") return null;
  const token = getToken();
  if (!token) return null;
  if (!socket) {
    socket = io(process.env.NEXT_PUBLIC_SOCKET_URL || "http://localhost:4000", {
      auth: { token },
      transports: ["websocket", "polling"],
    });
  }
  return socket;
}

/** Subscribe to live "candidate scored" events. Returns an unsubscribe fn. */
export function onCandidateScored(handler: (payload: any) => void): () => void {
  const s = getSocket();
  if (!s) return () => {};
  s.on("candidate.scored", handler);
  return () => {
    s.off("candidate.scored", handler);
  };
}
