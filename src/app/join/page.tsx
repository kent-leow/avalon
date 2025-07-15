import { JoinRoomForm } from './JoinRoomForm';

export default function JoinPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0f0f23] via-[#1a1a2e] to-[#252547] flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <JoinRoomForm />
      </div>
    </div>
  );
}
