import VideoControls from "@/app/components/VideoControls";
import { CommunicationContextProvider } from "@/app/contexts/CommunicationContext";

const Room = ({ params }: { params: { roomId: string } }) => {
  return (
    <CommunicationContextProvider roomId={params.roomId}>
      <VideoControls />
    </CommunicationContextProvider>
  );
};

export default Room;
