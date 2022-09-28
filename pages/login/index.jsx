import React, { useState, useEffect } from "react";
import LoginModal from "../../components/components/modals/LoginModal";

import { Header } from "../../components/layout/Header";
import Head from "next/head";
import Card from "../../components/components/Card/Card";
import styles from "./Login.module.css";
import { Button } from "@heathmont/moon-core-tw";
import isServer from "../../components/isServer";
import {
  GenericCheckRounded,
  GenericClose,
  GenericUser,
} from "@heathmont/moon-icons-tw";
import Link from "next/link";
let redirecting = "";
export default function Login() {
  const [AuroraConnected, setAuroraConnected] = useState(false);
  const [ConnectStatus, setConnectStatus] = useState(true);

  if (!isServer()){
    const regex = /\[(.*)\]/g;
    const str = decodeURIComponent(window.location.search);
    let m;
    
    while ((m = regex.exec(str)) !== null) {
      // This is necessary to avoid infinite loops with zero-width matches
      if (m.index === regex.lastIndex) {
        regex.lastIndex++;
      }
      redirecting = m[1];
    }
  }

  async function onClickContinue() {
    window.location.href = redirecting;
  }

  const fetchDataStatus = async () => {
    if (
      window.walletConnection?.isSignedIn() == true
    ) {
      setConnectStatus(true);
    } else {
      setConnectStatus(false);
    }
  };
  useEffect(() => {
    if (!isServer()) {
      setInterval(() => {
        if (window.ethereum._state.accounts.length ==0){
          setAuroraConnected(false);
        }else{
          setAuroraConnected(true);
        }
        fetchDataStatus();
      }, 1000);
    }
  }, []);
  if (isServer()) return null;
 

  function NearWallet() {
    if (window.walletConnection?.isSignedIn() == false) {
      return (
        <>
          <div className="flex gap-6 flex w-full items-center">
            <div
              style={{ height: 80, width: 80, border: "1px solid #EBEBEB" }}
              className="p-4 rounded-xl"
            >
              <img src="https://i.postimg.cc/nzQMgnnJ/Near.png" />
            </div>
            <div className="flex flex-1 flex-col">
              <span className="font-bold">NEAR wallet</span>
              <span
                className="flex items-center gap-1"
                style={{ color: "#FF4E64" }}
              >
                <GenericClose
                  className="text-moon-32"
                  color="#FF4E64"
                ></GenericClose>
                Disconnected
              </span>
            </div>
            <Button onClick={onClickConnectNear} style={{ width: 112 }}>
              Connect
            </Button>
          </div>
        </>
      );
    }
    if (window.walletConnection?.isSignedIn() == true) {
      return (
        <>
          <div className="flex gap-6 flex-1 w-full items-center">
            <div
              style={{ height: 80, width: 80, border: "1px solid #EBEBEB" }}
              className="p-4 rounded-xl"
            >
              <img src="https://i.postimg.cc/nzQMgnnJ/Near.png" />
            </div>
            <div className="flex flex-1 flex-col">
              <span className="font-bold">NEAR wallet</span>
              <span
                className="flex items-center gap-1"
                style={{ color: "#40A69F" }}
              >
                <GenericCheckRounded
                  className="text-moon-32"
                  color="#40A69F"
                ></GenericCheckRounded>
                Connected
              </span>
            </div>
            <Button
              onClick={onClickDisConnectNEAR}
              variant="secondary"
              style={{ width: 112 }}
            >
              Disconnect
            </Button>
          </div>
        </>
      );
    }
  }
  async function onClickConnectNear() {
    // 'hera-near.testnet',
    window.walletConnection.requestSignIn(
      'hera-near.testnet',
      'Hera'
  );
  }
  async function onClickDisConnectNEAR() {
    await window.walletConnection.signOut();
  }

 
  return (
    <>
      <Head>
        <title>Login</title>
        <meta name="description" content="Hera - Login" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <Header></Header>
      <div className={`${styles.container} flex items-center flex-col gap-8`}>
        <div className={`${styles.title} gap-8 flex flex-col`}>
          <h1 className="text-moon-32 font-bold">Login to your account</h1>
          <p className="text-trunks">Please connect to NEAR wallet in order to login.</p>
        </div>
        <div className={styles.divider}></div>
        <div className={`${styles.title} flex flex-col items-center gap-8`}>
          <NearWallet />
          <div className="bg-beerus w-full" style={{ height: 1 }}></div>
      
        </div>
        <div className={styles.divider}></div>
        {ConnectStatus ? (
            <>
              <Button onClick={onClickContinue} style={{ width: "150px" }}>
                Continue
              </Button>
            </>
          ) : (
            <>
              <Button disabled style={{ width: "150px" }}>
                Continue
              </Button>
            </>
          )}
      </div>
    </>
  );
}
