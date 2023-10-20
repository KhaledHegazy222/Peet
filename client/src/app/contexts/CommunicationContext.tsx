"use client";
import axios from "axios";
import Peer from "peerjs";
import React, {
  ReactNode,
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
type ConnectionEntryType = {
  mediaStream: MediaStream | null;
  peerId: string;
  closeConnection?: () => void;
};
type communicationContextType = {
  peer: Peer | null;
  connections: ConnectionEntryType[];
  turnOnCamera: () => void;
  turnOffCamera: () => void;
  turnOnMic: () => void;
  turnOffMic: () => void;
  cameraState: "On" | "Off";
  micState: "On" | "Off";
  myStream: MediaStream | null;
};
const IP = "localhost";
// const IP = "192.168.1.9";
const communicationContext = createContext<communicationContextType | null>(
  null
);

export const CommunicationContextProvider = ({
  children,
  roomId,
}: {
  children: ReactNode;
  roomId: string;
}) => {
  const [peer, setPeer] = useState<Peer | null>(null);
  const [connections, setConnections] = useState<ConnectionEntryType[]>([]);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [cameraState, setCameraState] = useState<"On" | "Off">("Off");
  const [micState, setMicState] = useState<"On" | "Off">("Off");

  async function initCallStream() {
    const constraints: MediaStreamConstraints = {
      video: true,
      audio: true,
    };
    const streamObj = await navigator.mediaDevices.getUserMedia(constraints);
    streamObj.getVideoTracks()[0].enabled = false;
    streamObj.getAudioTracks()[0].enabled = false;
    setStream(streamObj);
  }

  const turnOnCamera = useCallback(() => {
    if (!stream) return;
    stream.getVideoTracks()[0].enabled = true;
    setCameraState("On");
  }, [stream]);

  const turnOffCamera = useCallback(() => {
    if (!stream) return;
    stream.getVideoTracks()[0].enabled = false;
    setCameraState("Off");
  }, [stream]);

  const turnOnMic = useCallback(() => {
    if (!stream) return;
    stream.getAudioTracks()[0].enabled = true;
    setMicState("On");
  }, [stream]);

  const turnOffMic = useCallback(() => {
    if (!stream) return;
    stream.getAudioTracks()[0].enabled = false;
    setMicState("Off");
  }, [stream]);

  function initCall() {
    import("peerjs").then(({ default: Peer }) => {
      const currentPeer = new Peer({
        host: IP,
        port: 3001,
        path: "/peerjs",
        pingInterval: 5000,
      });

      setPeer(currentPeer);
      currentPeer.on("open", async (mineId) => {
        console.log("Mine ", mineId);
        try {
          const response = await axios.post(
            `http://${IP}:3002/${roomId}/addpeer/${mineId}`
          );

          response.data.peers.forEach((peerId: string) => {
            if (peerId === mineId) return;
            const conn = currentPeer.connect(peerId);
            conn.on("open", () => {
              setConnections((prevConn) => [
                ...prevConn,
                {
                  peerId: conn.peer,
                  mediaStream: null,
                },
              ]);
            });
          });
        } catch (error) {
          console.log(error);
        }
      });
      currentPeer.on("connection", (conn) => {
        conn.on("open", () => {
          setConnections((prevConn) => [
            ...prevConn,
            {
              peerId: conn.peer,
              mediaStream: null,
            },
          ]);
        });
        conn.on("close", () => {
          console.log("Closing Connection");
          setConnections((prevConn) =>
            [...prevConn].filter((connection) => connection.peerId != conn.peer)
          );
        });
        conn.on("error", () => {
          console.log("Error");
        });
      });
      currentPeer.on("call", (call) => {
        console.log("Caller ", call.peer);
        call.answer(stream!);
        call.on("stream", (remoteStream) => {
          setConnections((prevConn) => {
            const copyConn = [...prevConn];
            const connIndex = copyConn.findIndex(
              (conn) => conn.peerId === call.peer
            );
            if (connIndex != -1) {
              copyConn[connIndex].mediaStream = remoteStream;
              copyConn[connIndex].closeConnection = () => {
                call.close();
              };
            }
            return copyConn;
          });
        });
        call.on("close", async () => {
          setConnections((prevConn) =>
            [...prevConn].filter((connection) => connection.peerId != call.peer)
          );
        });
        call.on("error", () => {
          console.log("Call Err");
        });
      });
      currentPeer.on("disconnected", () => {
        console.log("Disconnecting From Server");
      });
    });
  }
  function attachStream(stream: MediaStream, peerId: string) {
    peer!.call(peerId, stream);
  }

  useEffect(() => {
    initCallStream().then(() => {
      initCall();
    });
  }, [roomId]);
  useEffect(() => {
    if (!stream) return;
    connections.forEach((conn) => {
      if (!conn.mediaStream) {
        attachStream(stream, conn.peerId);
      }
    });
  }, [stream, connections]);

  const value = useMemo(
    () => ({
      peer,
      connections,
      turnOnCamera,
      turnOffCamera,
      turnOnMic,
      turnOffMic,
      cameraState,
      micState,
      myStream: stream,
    }),
    [
      peer,
      connections,
      turnOnCamera,
      turnOffCamera,
      turnOnMic,
      turnOffMic,
      cameraState,
      micState,
      stream,
    ]
  );
  return (
    <communicationContext.Provider value={value}>
      {children}
    </communicationContext.Provider>
  );
};

export const useCommunicationContext = () => {
  const contextValue = useContext(communicationContext);

  if (contextValue === null) {
    throw new Error("No Context Provider Exists");
  }
  return contextValue;
};
