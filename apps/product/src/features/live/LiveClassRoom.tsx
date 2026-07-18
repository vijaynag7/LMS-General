import * as React from "react";
import { LiveKitRoom, VideoConference } from "@livekit/components-react";
import "@livekit/components-styles";
import { toast } from "sonner";
import { useAuth } from "@/hooks/useAuth";
import {
  useLiveSessionForLesson,
  useJoinLiveRoom,
  useRecordAttendanceJoin,
  useRecordAttendanceLeave,
} from "@/hooks/data/useLiveSession";
import { Button } from "@/components/ui/button";

export default function LiveClassRoom({ lessonId, title }: { lessonId: string; title: string }) {
  const { profile } = useAuth();
  const { data: session, isLoading } = useLiveSessionForLesson(lessonId);
  const joinRoom = useJoinLiveRoom();
  const recordJoin = useRecordAttendanceJoin();
  const recordLeave = useRecordAttendanceLeave();

  const [connection, setConnection] = React.useState<{ token: string; url: string } | null>(null);
  const attendanceRef = React.useRef<{ attendanceId: string; joinedAt: string } | null>(null);
  const isStaff = profile?.role === "institute_admin" || profile?.role === "faculty";

  if (isLoading) return <p className="text-sm text-muted-foreground">Loading…</p>;
  if (!session) return <p className="text-sm text-muted-foreground">This live class hasn't been scheduled yet.</p>;

  if (session.status === "ended" && session.recording_url) {
    return (
      <div className="space-y-3">
        <h3 className="text-lg font-semibold">{title}</h3>
        <video src={session.recording_url} controls className="aspect-video w-full rounded-lg bg-black">
          <track kind="captions" />
        </video>
      </div>
    );
  }

  if (session.status === "ended") {
    return (
      <div className="space-y-3">
        <h3 className="text-lg font-semibold">{title}</h3>
        <p className="text-sm text-muted-foreground">This class has ended — the recording will appear here shortly.</p>
      </div>
    );
  }

  const handleJoin = async () => {
    try {
      const result = await joinRoom.mutateAsync(session.id);
      setConnection({ token: result.token, url: result.url });
      if (!isStaff) {
        attendanceRef.current = await recordJoin.mutateAsync(session.id);
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not join the class — is LiveKit configured?");
    }
  };

  const handleDisconnect = () => {
    if (attendanceRef.current) {
      recordLeave.mutate(attendanceRef.current);
      attendanceRef.current = null;
    }
    setConnection(null);
  };

  if (!connection) {
    return (
      <div className="space-y-3">
        <h3 className="text-lg font-semibold">{title}</h3>
        <p className="text-sm text-muted-foreground">
          {session.status === "live" ? "This class is live now." : `Scheduled for ${new Date(session.scheduled_at).toLocaleString()}`}
        </p>
        <Button variant="brand" onClick={handleJoin} disabled={joinRoom.isPending}>
          {joinRoom.isPending ? "Joining…" : isStaff ? "Start class" : "Join class"}
        </Button>
      </div>
    );
  }

  return (
    <div className="h-[600px] overflow-hidden rounded-lg">
      <LiveKitRoom
        serverUrl={connection.url}
        token={connection.token}
        connect
        video={isStaff}
        audio={isStaff}
        onDisconnected={handleDisconnect}
        data-lk-theme="default"
        style={{ height: "100%" }}
      >
        <VideoConference />
      </LiveKitRoom>
    </div>
  );
}
