import { Button } from "@heathmont/moon-core-tw";
import { ControlsPlus, TimeClock } from "@heathmont/moon-icons-tw";
import Head from "next/head";
import { useEffect, useState } from "react";
import NavLink from "next/link";
import ChooseProjectModal from '../../../components/components/modals/ChooseProjectModal';
import { GenericLoyalty } from "@heathmont/moon-icons-tw";

import Card from "../../../components/components/Card/Card";
import isServer from "../../../components/isServer";
import { Header } from "../../../components/layout/Header";
import useContract from "../../../services/useContract";
import styles from "../grantspool.module.css";
let EventEnd = "";
let EventWaiting = false;

export default function GrantEvent() {
  //variables
  const { contract, signerAddress } = useContract("ERC721");
  const [eventId, setEventId] = useState(-1);
  const [list, setList] = useState([]);
  const [imageList, setimageList] = useState([]);
  const [title, setTitle] = useState("");
  const [goal, setgoal] = useState("");
  const [isJudger, setisJudger] = useState(false);
  
  const [EventDescription, setEventDescription] = useState("");
  const [EventWallet, setEventWallet] = useState("");
  const [AccountAddress, setAccountAddress] = useState("");
  const [SelectedendDate, setSelectedendDate] = useState("");
  const [date, setdate] = useState("");
  const [dateleftBid, setdateleftBid] = useState("");
  const [selectid, setselectid] = useState("");
  const [selecttitle, setselecttitle] = useState("");
  const [selectedAddress, setselectedAddress] = useState("");
  const [selecttype, setselecttype] = useState("");
  const [selectbid, setselectbid] = useState("");
  const [selectTab, setselectTab] = useState("overview");

  const [modalShow, setModalShow] = useState(false);
  const [ViewmodalShow, setViewModalShow] = useState(false);
  const [ShowChooseProjectModal, setShowChooseProjectModal] = useState(false);

  const formatter = new Intl.NumberFormat("en-US", {
    //Converting number into comma version

    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
  const sleep = (milliseconds) => {
    //Custom Sleep function to wait
    return new Promise((resolve) => setTimeout(resolve, milliseconds));
  };
  let m;
  let id = ""; //Event id from url
  function LeftDate(datetext) {
    //String date to dd/hh/mm/ss format

    var c = new Date(datetext).getTime();
    var n = new Date().getTime();
    var d = c - n;
    var da = Math.floor(d / (1000 * 60 * 60 * 24));
    var h = Math.floor((d % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    var m = Math.floor((d % (1000 * 60 * 60)) / (1000 * 60));
    var s = Math.floor((d % (1000 * 60)) / 1000);
    return (
      da.toString() +
      " Days " +
      h.toString() +
      " hours " +
      m.toString() +
      " minutes " +
      s.toString() +
      " seconds"
    );
  }
  function LeftDateBid(datetext) {
    //String date to d/h/m/s format

    var c = new Date(datetext).getTime();
    var n = new Date().getTime();
    var d = c - n;
    var da = Math.floor(d / (1000 * 60 * 60 * 24));
    var h = Math.floor((d % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    var m = Math.floor((d % (1000 * 60 * 60)) / (1000 * 60));
    var s = Math.floor((d % (1000 * 60)) / 1000);
    if (EventEnd === "Finished" && s.toString().includes("-")) {
      return "Event Ended";
    } else if (
      s.toString().includes("-") &&
      EventWaiting === true &&
      EventEnd !== "Finished"
    ) {
      return "Waiting for release";
    } else {
      return (
        da.toString() +
        "d " +
        h.toString() +
        "h " +
        m.toString() +
        "m " +
        s.toString() +
        "s" + " left"
      );
    }
  }

  useEffect(() => {
    if (!isServer()) {
      fetchContractData();
    }
  }, [id]);
  if (isServer()) return null;
  const regex = /\[(.*)\]/g;
  const str = decodeURIComponent(window.location.search);

  while ((m = regex.exec(str)) !== null) {
    // This is necessary to avoid infinite loops with zero-width matches

    if (m.index === regex.lastIndex) {
      regex.lastIndex++;
    }
    id = m[1];
  }

  async function fetchContractData() {
    try {
      if (window.nearcontract && id) {
        setAccountAddress(window.accountId);
        setEventId(id); //setting Event id
        id = Number(id);
        const valueAll = JSON.parse(await window.nearcontract.event_grant_uri({ event_id: id })) //Getting event URI from smart contract

        const value = valueAll;

        const arr = [];
        const totalProjects = JSON.parse(await window.nearcontract.get_project_search_from_grant_event({ grant_id: id })); //Getting total Projects of that event
        
        for (let i = 0; i < Object.keys(totalProjects).length; i++) {
          //Getting all Projects
          const obj =  await JSON.parse(await totalProjects[i])[1];
          
          let object = {};
          try {
            object = await JSON.parse(obj);
          } catch { }
          if (object.title) {  
            const ProjectId = Number(await window.nearcontract.get_eventid_from_eventuri({ event_uri: obj })); //Getting Project id from Project URI
            const votes = JSON.parse(await window.nearcontract.get_grant_votes_from_grant({ grant_id: id, project_id: ProjectId})); 
            let isvoted  = false;
            for (let index = 0; index < votes.length; index++) {
              const element = votes[index];
              if (element === window.accountId){
                isvoted = true;
              }              
            }

            arr.push({
              Id: ProjectId,
              name: object.properties.Title.description,
              description: object.properties.Description.description,            
              goal: Number(object.properties.Goal.description),
              image: object.properties.logo.description.url,
              votecount: votes.length,
              isVoted: isvoted,
            });
          }
        }
        // console.log(valueAll);
        //Setting these data into variables
        setList(arr);
        if (document.getElementById("Loading"))
          document.getElementById("Loading").style = "display:none";

        const object = JSON.parse(value);
        for (let index = 0; index < object.properties.Judgersdata.length; index++) {
          const element = object.properties.Judgersdata[index];
          if (element.wallet.toLowerCase() == window.accountId.toLowerCase()) {
              setisJudger(true);
          }
      }

        setimageList(object.properties.allFiles);
        setTitle(object.properties.Title.description);
        setselectedAddress(object.properties.wallet.description);
        setgoal(Number(object.properties.Price.description));
        setEventDescription(object.properties.Description.description);
        setEventWallet(object.properties.wallet.description);
        setSelectedendDate(object.properties.Date.description);
        setdate(object.properties.Date.description);
        setdateleftBid(LeftDateBid(object.properties.Date.description));

        console.log(object.properties.wallet.description);

      }
    } catch (error) {
      console.error(error);
    }
  }

  setInterval(function () {
    calculateTimeLeft();
  }, 1000);

  function calculateTimeLeft() {
    //Calculating time left
    try {
      var allDates = document.getElementsByName("dateleft");
      for (let i = 0; i < allDates.length; i++) {
        var date = allDates[i].getAttribute("date");
        allDates[i].innerHTML = LeftDate(date);
      }
      var allDates = document.getElementsByName("date");
      for (let i = 0; i < allDates.length; i++) {
        var date = allDates[i].getAttribute("date");
        if (date !== undefined && date !== "") {
          allDates[i].innerHTML = LeftDateBid(date);
        }
      }
    } catch (error) { }
  }

  function activateViewBidModal(e) {
    //Activating view bid Modal
    setselectid(e.target.getAttribute("tokenid"));
    setselecttitle(e.target.getAttribute("title"));

    setViewModalShow(true);
  }



  function submitProject() {
    setShowChooseProjectModal(true);
  }
  async function VoteProject(projectid) {
    await window.nearcontract.create_grant_vote({"grant_id":Number(eventId), "project_id":Number(projectid), "wallet":window.accountId}, "60000000000000");

  }


  return (
    <>
      <Head>
        <title>{title}</title>
        <meta name="description" content={title} />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <Header></Header>
      <div className={`${styles.container} flex flex-col items-center gap-8`}>
        <div className={`${styles.title} flex flex-col gap-2`}>
          <h1 className="text-moon-32 font-bold pb-2">{title}</h1>
          <div>
            <span className="text-trunks">Address: </span>
            <a className="text-piccolo" href={`/user/` + EventWallet}>
              {EventWallet}
            </a>
          </div>
          <div className="text-hit font-bold" name="date" date={date}>{dateleftBid}</div>

          <p>{EventDescription}</p>
        </div>
        <div className={`${styles.title} flex gap-4 justify-start`}>
          <a
            className={`tab block px-3 cursor-pointer py-2 ${selectTab === "overview" ? "active" : ""
              }`}
            onClick={() => setselectTab("overview")}
          >
            Overview
          </a>
          <a
            className={`tab block cursor-pointer px-3 py-2 ${selectTab === "projects" ? "active" : ""
              }`}
            onClick={() => setselectTab("projects")}
          >
            Projects ({list.length})
          </a>
        </div>
        <div className={styles.divider}></div>
        {selectTab === "overview" ? (
          <>
            <div className={`${styles["slideshow-container"]} flex gap-8`}>
              <div className="flex-1 rounded-xl overflow-hidden flex">
                <img type={imageList[0]?.type} src={imageList[0]?.url} alt="" />
              </div>
              {/* <SlideShow className={styles.slideshow} images={imageList} /> */}
              <Card height={468} width={300}>
                <div className="flex flex-col h-full gap-5">
                  <div className="flex justify-center">
                    <GenericLoyalty className="text-moon-48" color="#40A69F" />
                  </div>
                  <h2 className="text-moon-20 font-bold">
                    Prize: {goal} NEAR
                  </h2>

                  <div className="flex flex-col gap-1">
                    <>
                      {(selectedAddress !== AccountAddress) ? (<>
                        <>
                          <Button
                            data-element-id="btn_donate"
                            data-analytic-event-listener="true"
                          onClick={()=>{submitProject()}}
                          >
                            Submit project
                          </Button>

                        </>
                      </>) : (<></>)}
                    </>
                  </div>
                  <div className="flex flex-col justify-end flex-1 text-moon-14 text-trunks">
                    99.9% of the proceeds go to the winner. Just 0.1% goes to
                    Hera.
                  </div>
                </div>
              </Card>
            </div>
          </>
        ) : (
          <>
            <div
              className="flex gap-8 flex-wrap justify-start"
              style={{ width: 960 }}
            >
              {list.map((listItem, index) => (
                <Card key={index} width={460}>
                  <div className="flex flex-col gap-5 justify-center items-center flex-1">
                    <div className={styles["event-image"]}>
                      <img src={listItem.image} />
                    </div>
                    <div className={`gap-4 flex flex-col flex-1`}>
                      <h6 className="text-moon-20">
                        <span className="font-bold">Project Name </span>
                        {listItem.name}
                      </h6>
                      <p className="text-trunks flex-1">
                        {listItem.description.substring(0, 80)}...
                      </p>
                      <p>
                        Voted{" "}
                        <span className="font-bold">{listItem.votecount}</span>
                      </p>
                      <div className="flex flex-col gap-2 items-center">
                        {isJudger !== false && listItem.isVoted !== true? (<>
                          <Button style={{ width: 240 }} onClick={()=>{VoteProject(listItem.Id)}} >
                            <ControlsPlus className="text-moon-24" />
                            <div className="card BidcontainerCard">
                              <div className="card-body bidbuttonText" >
                                Place Vote
                              </div>
                            </div>
                          </Button>
                        </>) : (<></>)}
                        <NavLink href={`/donation/auction?[${listItem.Id}]`}>
                        <Button variant="secondary" style={{ width: 240 }}>
                           <div className="card BidcontainerCard">
                            <div className="card-body bidbuttonText">
                              Go to project
                            </div>
                          </div>
                        </Button>
                        </NavLink>
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </>
        )}
      </div>

   
      <ChooseProjectModal
        show={ShowChooseProjectModal}
        onHide={() => {
          setShowChooseProjectModal(false);
        }}
        grantId={eventId}
      />

    </>
  );
}
