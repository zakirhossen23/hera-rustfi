import React from "react";
import Head from "next/head";
import { Button } from "@heathmont/moon-core-tw";
import Form from "react-bootstrap/Form";
import { Header } from "../../components/layout/Header";
import UseFormInput from "../../components/components/UseFormInput";
export default function Add5DaysFORM() {
  const [eventid, EventidInput] = UseFormInput({
    type: "text",
    placeholder: "Enter Event ID",
  });
  async function Adding5Days() {
    const valueAll = JSON.parse(await window.nearcontract.event_uri({event_id:Number(eventid)})) //Getting event URI from smart contract       
    const value = valueAll[1];
    if (value) {
      const object = JSON.parse(value);
      var c = new Date(object.properties.Date.description);
      c.setDate(c.getDate() - 5);
      object.properties.Date.description = c.toISOString();

      await window.nearcontract.set_event({ "_event_id": Number(eventid), "_event_wallet": valueAll[0], "_event_uri": JSON.stringify(object) }, "60000000000000")

    }
  }

  function Add5DaysBTN() {
    return (
      <>
        <Button
          style={{ margin: "17px 0 0px 0px", width: "100%" }}
          onClick={Adding5Days}
        >
          Add 5 days
        </Button>
      </>
    );
  }

  return (
    <>
      <Head>
        <title>Add 5 days from now to Event</title>
        <meta name="description" content="Add 5 days from now to Event" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <Header></Header>

      <div className="row" style={{ height: "100vh", paddingTop: 140 }}>
        <div className="createevents col">
          <div
            style={{
              background: "transparent",
              padding: "19px",
              borderRadius: "4px",
              height: "100%",
              border: "white solid",
            }}
          >
            <Form.Group controlId="formGroupName">
              <div className="mb-2">Event id</div>
              {EventidInput}
            </Form.Group>
            <Add5DaysBTN />
          </div>
        </div>
      </div>
    </>
  );
}
