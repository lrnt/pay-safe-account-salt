import {
  populateAccountCreation,
  predictAccountAddress,
} from "@gnosispay/account-kit";
import { ConnectKitButton } from "connectkit";
import { useEffect, useState } from "react";
import { useAccount, useBytecode, useSendTransaction } from "wagmi";

import "./App.css";
import { Address } from "viem";
import { SendTransactionData } from "wagmi/query";

const getPrefix = (chainId: number | undefined) => {
  if (chainId === 137) return "matic";
  if (chainId === 100) return "gno";
  if (chainId === 1) return "eth";
  return null;
};

export default function App() {
  const { address: owner, chain } = useAccount();
  const [payAccount, setPayAccount] = useState<Address | undefined>();
  const { sendTransaction, isPending, isSuccess } = useSendTransaction();
  const { isFetched: isBytecodeFetched, data: payAccountBytecode } =
    useBytecode({
      address: payAccount,
    });

  const isDeployed = !!(isBytecodeFetched && payAccountBytecode);

  useEffect(() => {
    if (!owner) return;
    setPayAccount(predictAccountAddress({ owner }) as Address);
  }, [owner]);

  const handleDeploy = () => {
    const tx = populateAccountCreation({ owner: owner ?? "" });
    sendTransaction({
      to: tx.to as Address,
      data: tx.data as SendTransactionData,
    });
  };

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        height: "100vh",
      }}
    >
      <ConnectKitButton />
      {owner && (
        <>
          <p>Selected Chain: {chain?.name}</p>
          <p>Gnosis Pay Safe Address: {payAccount}</p>
          <p>
            Gnosis Pay Safe deployed on {chain?.name}:{" "}
            {isDeployed ? "Yes" : "No"}
          </p>
          {!isDeployed && chain?.id !== 100 && (
            <button onClick={handleDeploy}>Deploy</button>
          )}
          {(isSuccess || isDeployed) && (
            <p>
              <a
                href={`https://app.safe.global/transactions/history?safe=${getPrefix(
                  chain?.id
                )}:${payAccount}`}
                target="_blank"
              >
                Go to Safe
              </a>
            </p>
          )}
          {isPending && <p>Deploying...</p>}
          {isSuccess && <p>Successfully deployed...</p>}
        </>
      )}
    </div>
  );
}
