import { Dialog } from "@heathmont/moon-components";
import { Header, Footer } from "@heathmont/moon-core";
import { Button } from "@heathmont/moon-core-tw";
import { ControlsClose } from "@heathmont/moon-icons";
import { useState } from "react";
import Form from "react-bootstrap/Form";
import * as nearAPI from "near-api-js"
import UseFormInput from "../UseFormInput";

export default function DirectDonateModal({
  show,
  onHide,
  eventId,
  contract,
  senderAddress,
  EventWallet,
  SelectedTitle,
}) {
  const [Alert, setAlert] = useState("");

  const Web3 = require("web3");

  const sleep = (milliseconds) => {
    //Custom sleep(n) code
    return new Promise((resolve) => setTimeout(resolve, milliseconds));
  };

  const [Amount, AmountInput] = UseFormInput({
    //Input field
    type: "number",
    placeholder: "Amount",
  });

  function activateWarningModal(TextAlert) {
    //Changing Warning Alert box text
    var alertELM = document.getElementById("alert");
    alertELM.style = "contents";
    setAlert(TextAlert);
  }
  function activateWorkingModal(TextAlert) {
    //Changing Success Alert box text
    var alertELM = document.getElementById("workingalert");
    alertELM.style = "contents";
    setAlert(TextAlert);
  }

  async function DonateCoin() {
    //Donate button function

    var DonateBTN = document.getElementById("DonateBTN"); //clicked Donate Button
    DonateBTN.disabled = true;

    try {
      let convertedDefaultAmount = Number(Amount);
      const Raised =
        Number(await contract.getEventRaised(eventId)) +
        Number(convertedDefaultAmount);

      activateWorkingModal("Please confirm Updating Raised...");

      try {
        await contract //Resending updating Raised
          ._setEventRaised(Number(eventId), Raised.toString());
      } catch (error) { }
      activateWorkingModal("Transferring....");

      await window.nearcontract.contribute({}, "60000000000000", nearAPI.utils.format.parseNearAmount(Amount).toString())

      activateWorkingModal("Success!");
      DonateBTN.disabled = false;
      await sleep(5000);
      window.location.reload();
    } catch (e) {
      //Got error
      console.error(e);
      // activateWarningModal(`Error! Please try again!`);
      var alertELM = document.getElementById("workingalert");
      alertELM.style.display = "none";
      return;
    }
  }
  return (
    <Dialog
      isOpen={show}
      onDismiss={onHide}
      maxWidth="480px"
      position="CENTER"
      hideCloseButton
      variant="new"
      heading={
        <Header
          closeButton={
            <ControlsClose
              className="text-moon-24 text-trunks"
              onClick={onHide}
            />
          }
          isDivider={true}
        >
          Donate NEAR to {SelectedTitle}
        </Header>
      }
    >
      <div className="p-6 flex flex-col gap-6">
        <Form className="flex flex-col gap-6">
          <div
            id="alert"
            style={{ display: "none", fontSize: "30px" }}
            className="alert alert-danger"
            role="alert"
          >
            {Alert}
          </div>
          <div
            id="workingalert"
            style={{ display: "none", fontSize: "30px" }}
            className="alert alert-success"
            role="alert"
          >
            {Alert}
          </div>

          <Form.Group controlId="formGroupName">
            <div className="mb-3">Amount</div>
            {AmountInput}
          </Form.Group>
        </Form>
      </div>
      <div className="d-grid"></div>
      <Footer
        primButton={
          <Button id="DonateBTN" onClick={DonateCoin}>
            Donate NEAR
          </Button>
        }
        tertButton={
          <Button variant="ghost" onClick={onHide}>
            Cancel
          </Button>
        }
        isDivider
      />
    </Dialog>
  );
}
