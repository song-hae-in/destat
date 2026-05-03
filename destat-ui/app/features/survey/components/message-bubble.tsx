import { User2Icon } from "lucide-react";

export default function MessageBubble({ sender }: { sender: boolean }) {
  return (
    <div className="mb-4">
      {sender ? (
        // 왼쪽 정렬 (상대방)
        <div className="flex flex-row gap-2">
          <div className="bg-muted p-2 rounded-full h-fit">
            <User2Icon size={16} />
          </div>
          <div className="flex flex-col gap-1 max-w-[70%]">
            <h1 className="font-extrabold text-[10px] opacity-70">Nickname</h1>
            {/* w-fit */}
            <span className="text-xs bg-primary/30 px-3 py-1.5 rounded-2xl w-fit">
              this is a sample message
            </span>
          </div>
        </div>
      ) : (
        // 오른쪽 정렬 (나)
        <div className="flex flex-row justify-end gap-2">
          <div className="flex flex-col items-end gap-1 max-w-[70%]">
            <h1 className="font-extrabold text-[10px] opacity-70">Nickname</h1>
            <span className="text-xs bg-primary text-primary-foreground px-3 py-1.5 rounded-2xl w-fit">
              wow
            </span>
          </div>
          <div className="bg-primary/20 p-2 rounded-full h-fit">
            <User2Icon size={16} />
          </div>
        </div>
      )}
    </div>
  );
}
