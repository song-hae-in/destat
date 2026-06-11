import { useAccount, useDisconnect } from "wagmi";
import { Button } from "./ui/button";
import { rabbykit } from "~/root";
export default function WalletButton() {
  const { address, isConnected } = useAccount();
  const { disconnect } = useDisconnect();
  return (
    <div>
      {isConnected ? (
        <Button onClick={() => disconnect()}>Disconnect</Button>
      ) : (
        <Button onClick={() => rabbykit.open()}>Connect</Button>
      )}
    </div>
  );
}
