import React, { useState } from "react";
import Head from "next/head";
import UseFormInput from "../../components/components/UseFormInput";
import UseFormTextArea from "../../components/components/UseFormTextArea";
import useContract from "../../services/useContract";
import { Header } from "../../components/layout/Header";
import NavLink from "next/link";
import isServer from "../../components/isServer";
import { NFTStorage, File } from "nft.storage";
import Web3 from "web3";
import styles from "./CreateEvents.module.css";
import { Button } from "@heathmont/moon-core-tw";
import { GenericPicture, ControlsPlus } from "@heathmont/moon-icons-tw";
import { Checkbox } from "@heathmont/moon-core-tw";

export default function CreateEvents() {
  const { contract, signerAddress } = useContract("ERC721");
  const [EventImage, setEventImage] = useState([]);
  if (isServer()) return null;

  //Storage API for images and videos
  const NFT_STORAGE_TOKEN =
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJkaWQ6ZXRocjoweDJDMDBFOGEzZEEwNzA5ZkI5MUQ1MDVmNDVGNUUwY0Q4YUYyRTMwN0MiLCJpc3MiOiJuZnQtc3RvcmFnZSIsImlhdCI6MTY1NDQ3MTgxOTY2NSwibmFtZSI6IlplbmNvbiJ9.6znEiSkiLKZX-a9q-CKvr4x7HS675EDdaXP622VmYs8";
  const client = new NFTStorage({ token: NFT_STORAGE_TOKEN });

  //Input fields
  const [EventTitle, EventTitleInput] = UseFormInput({
    defaultValue: "",
    type: "text",
    placeholder: "Add name",
    id: "",
  });

  const [EventDescription, EventDescriptionInput] = UseFormTextArea({
    defaultValue: "",
    placeholder: "Add Description",
    id: "",
    rows: 4,
  });

  const [EventDate, EventDateInput] = UseFormInput({
    defaultValue: "",
    type: "datetime-local",
    placeholder: "Select date",
    id: "enddate",
  });

  const [EventGoal, EventGoalInput] = UseFormInput({
    defaultValue: "",
    type: "text",
    placeholder: "Add amount",
    id: "goal",
  });

  //Downloading plugin function
  function downloadURI(uri, name) {
    var link = document.createElement("a");
    link.download = name;
    link.href = uri;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  //Creating plugin function
  async function CreatePlugin(src) {
    const output = `<html><head></head><body><iframe src="${src}" style="width: 100%;height: 100%;" /></body></html>`;
    // Download it
    const blob = new Blob([output]);
    const fileDownloadUrl = URL.createObjectURL(blob);
    downloadURI(fileDownloadUrl, "Generated Plugin.html");
    console.log(output);
  }

  //Function after clicking Create Event Button
  async function createEvent() {
    var CreateEVENTBTN = document.getElementById("CreateEVENTBTN");
    CreateEVENTBTN.disabled = true;
    let allFiles = [];
    for (let index = 0; index < EventImage.length; index++) {
      //Gathering all files link
      const element = EventImage[index];
      const metadata = await client.storeBlob(element);
      const urlImageEvent = {
        url: "https://" + metadata + ".ipfs.nftstorage.link",
        type: element.type,
      };
      allFiles.push(urlImageEvent);
    }

    //Creating an object of all information to store in EVM
    const createdObject = {
      title: "Asset Metadata",
      type: "object",
      properties: {
        Title: {
          type: "string",
          description: EventTitle,
        },
        Description: {
          type: "string",
          description: EventDescription,
        },
        Date: {
          type: "string",
          description: EventDate,
        },
        Goal: {
          type: "string",
          description: EventGoal,
        },
        logo: {
          type: "string",
          description: allFiles[0],
        },
        wallet: {
          type: "string",
          description: window.walletConnection.getAccountId(),
        },
        typeimg: {
          type: "string",
          description: "Event",
        },
        allFiles,
      },
    };
    console.log("======================>Creating Event");
    try {
      // Creating Event in Rust Smart contract
      window.nearcontract.create_event({"_event_wallet":window.walletConnection.getAccountId(),"_event_uri":JSON.stringify(createdObject)}, "60000000000000")
  

      // //Getting the event id of new one
      // let eventid = await contract.totalEvent();
      // if (document.getElementById("plugin").checked) {
      //   await CreatePlugin(
      //     `http://${window.location.host}/donation/auction?[${eventid}]`
      //   );
      // }
    } catch (error) {
      console.error(error);
      window.location.href = "/login?[/]"; //If found any error then it will let the user to login page
    }
    // window.location.href = "/donation"; //If it created sucessfully then it will redirect to donation
    // CreateEVENTBTN.disabled = false;
  }

  function CreateEventBTN() {
    return (
      <>
        <div className="flex gap-4 justify-end">
          <NavLink href="/donations">
            <Button variant="secondary">Cancel</Button>
          </NavLink>
          <Button id="CreateEVENTBTN" onClick={createEvent}>
            <ControlsPlus className="text-moon-24" />
            Create auction
          </Button>
        </div>
      </>
    );
  }
  function FilehandleChange(event) {
    // If user uploaded images/videos
    var allNames = [];
    for (let index = 0; index < event.target.files.length; index++) {
      const element = event.target.files[index].name;
      allNames.push(element);
    }
    for (let index2 = 0; index2 < event.target.files.length; index2++) {
      setEventImage((pre) => [...pre, event.target.files[index2]]);
    }
  }

  function AddBTNClick(event) {
    //Clicking on +(Add) Function
    var EventImagePic = document.getElementById("EventImage");
    EventImagePic.click();
  }

  function DeleteSelectedImages(event) {
    //Deleting the selected image
    var DeleteBTN = event.currentTarget;
    var idImage = Number(DeleteBTN.getAttribute("id"));
    var newImages = [];
    var allUploadedImages = document.getElementsByName("deleteBTN");
    for (let index = 0; index < EventImage.length; index++) {
      if (index != idImage) {
        const elementDeleteBTN = allUploadedImages[index];
        elementDeleteBTN.setAttribute("id", newImages.length.toString());
        const element = EventImage[index];
        newImages.push(element);
      }
    }
    setEventImage(newImages);
  }

  return (
    <>
      <Head>
        <title>Create Event</title>
        <meta name="description" content="Create Event" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <Header></Header>
      <div
        className={`${styles.container} flex items-center justify-center flex-col gap-8`}
      >
        <div className={`${styles.title} gap-8 flex flex-col`}>
          <h1 className="text-moon-32 font-bold">Create auction</h1>
          <p className="text-trunks">
            An auction will have its own page where people can donate NFT’s and
            bid on them.
          </p>
        </div>
        <div className={styles.divider}></div>
        <div className={`${styles.form} flex flex-col gap-8`}>
          <div>
            <h6>Auction name</h6>
            {EventTitleInput}
          </div>

          <div>
            <h6>Description</h6>
            {EventDescriptionInput}
          </div>
          <div className="flex gap-8 w-full">
            <div className="flex-1">
              <h6>Goal amount</h6>
              {EventGoalInput}
            </div>

            <div className="flex-1">
              <h6>End Date</h6>
              {EventDateInput}
            </div>
          </div>
          <div className="flex flex-col gap-2">
            <h6>Images</h6>
            <div className="flex gap-4">
              <input
                className="file-input"
                hidden
                onChange={FilehandleChange}
                id="EventImage"
                name="EventImage"
                type="file"
                multiple="multiple"
              />
              <div className="flex gap-4">
                {EventImage.map((item, i) => {
                  return (
                    <>
                      <div key={i} className="flex gap-4">
                        <button
                          onClick={DeleteSelectedImages}
                          name="deleteBTN"
                          id={i}
                        >
                          {item.type.includes("image") ? (
                            <img
                              className={styles.image}
                              src={URL.createObjectURL(item)}
                            />
                          ) : (
                            <>
                              <div className="Event-Uploaded-File-Container">
                               
                                <span className="Event-Uploaded-File-name">
                                  {item.name.substring(0, 10)}...
                                </span>
                              </div>
                            </>
                          )}
                        </button>
                      </div>
                    </>
                  );
                })}
                <div className="Event-ImageAdd">
                  <Button
                    id="Add-Image"
                    onClick={AddBTNClick}
                    variant="secondary"
                    style={{ height: 80, padding: "1.5rem" }}
                    iconLeft
                    size="lg"
                  >
                    <GenericPicture className="text-moon-24" />
                    Add image
                  </Button>
                </div>
              </div>
            </div>
          </div>

          <div>
            <Checkbox label="Generate Plugin" id="plugin" />
          </div>
          <CreateEventBTN />
        </div>
        <div className={styles.divider}></div>
      </div>
    </>
  );
}
