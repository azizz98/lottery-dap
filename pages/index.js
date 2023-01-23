import { use, useState, useEffect } from "react";
import Head from "next/head";
import Link from "next/link";
import Web3 from "web3";
import lotteryContract from "../blockchain/Lottery";

export default function Home() {
  const [web3, setWeb3] = useState();
  const [address, setAddress] = useState();
  const [lcContract, setLcContract] = useState();
  const [lotteryPot, setLotteryPot] = useState();
  const [players, setPlayers] = useState([]);
  const [error, setError] = useState(null);
  const [popup, setPopup] = useState(false);

  useEffect(() => {
    if (popup) {
      setTimeout(() => {
        setPopup(false);
      }, 5000);
    }
  }, [popup]);

  useEffect(() => {
    setTimeout(() => {
      setPopup(true);
    }, 5000);
  }, []);

  useEffect(() => {
    if (lcContract) {
      getPot();
      getPlayers();
    }
  }, [lcContract]);

  const getPot = async () => {
    const pot = await lcContract.methods.getBalance().call();
    setLotteryPot(web3.utils.fromWei(pot));
  };

  const getPlayers = async () => {
    const players = await lcContract.methods.getPlayers().call();
    setPlayers(players);
  };

  const enterLotteryHandler = async () => {
    try {
      await lcContract.methods.enter().send({
        from: address,
        value: "13000000000000000",
        gas: 300000,
        gasPrice: null,
      });
    } catch (err) {
      setError(err.message);
      setPopup(true);
    }
  };

  const ConnectWalletHandler = async () => {
    if (
      typeof window !== "undefined" &&
      typeof window.ethereum !== "undefined"
    ) {
      try {
        await window.ethereum.request({ method: "eth_requestAccounts" });
        const web3 = new Web3(window.ethereum);
        setWeb3(web3);
        const accounts = await web3.eth.getAccounts();
        setAddress(accounts[0]);
        const lc = lotteryContract(web3);
        setLcContract(lc);
      } catch (e) {
        setError(e.message);
        setPopup(true);
      }
    } else {
      setError("Wallet not found, Please Install Metamask Wallet !");
      setPopup(true);
    }
  };

  return (
    <div className=" text-[24px] pt-[3rem]">
      {popup == true && (
        <div className="fixed top-1  m-4 p-4 bg-red-400 rounded-md text-white ease-out">
          <p>{error}</p>
        </div>
      )}
      <Head>
        <title>Lottery Dapp</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <div className="flex justify-between px-[14rem] ">
        <div className=" font-bold text-[42px]">Lottery Dapp</div>
        <button
          onClick={ConnectWalletHandler}
          className="bg-blue-500 hover:bg-blue-700 text-white font-lg py-2 px-4 rounded-3xl"
        >
          {address != null ? (
            <div>Connected : {address.substring(0, 9)}...</div>
          ) : (
            <div>Connect Wallet</div>
          )}
        </button>
      </div>
      <div className="mt-[6rem] flex justify-around">
        <div className="">
          <div>Enter the lottery by sending 0.01 Ether</div>
          <button
            onClick={enterLotteryHandler}
            className=" mt-5 bg-emerald-500 hover:bg-emerald-700 text-white font-lg py-2 px-4 rounded-lg"
          >
            Play Now
          </button>
          <div className="mt-[6rem]">
            <div className="flex">
              <div className="font-extrabold mr-1">Admin Only :</div>Pick Winner
              !
            </div>
            <button className=" mt-5 bg-purple-500 hover:bg-purple-700 text-white font-lg py-2 px-4 rounded-lg">
              Play Now
            </button>
          </div>
        </div>

        <div className="">
          <div className=" shadow-lg hover:shadow-xl px-[2rem] py-[2rem]">
            <div className=" text-[42px] font-medium">Lottery History</div>
            <div className="mt-5">Lottery #1 Winner: </div>
            <div className=" text-blue-400">
              0x1B7fb24e70c078f61A08530edDaefCb310758923
            </div>
          </div>

          <div className=" shadow-lg hover:shadow-xl px-[2rem] py-[2rem] mt-10">
            <div className=" text-[42px] font-medium">
              Players {players.length}
            </div>
            {players &&
              players.length > 0 &&
              players.map((player) => {
                return (
                  <div className=" text-blue-400 mt-5">
                    <a
                      href={`https://goerli.etherscan.io/address/${player}`}
                      target="_blank"
                    >
                      {player}
                    </a>
                  </div>
                );
              })}
          </div>

          <div className=" shadow-lg hover:shadow-xl px-[2rem] py-[2rem] mt-10">
            <div className=" text-[42px] font-medium">Pot</div>
            <div className="mt-5">{lotteryPot} ether</div>
          </div>
        </div>
      </div>
    </div>
  );
}
