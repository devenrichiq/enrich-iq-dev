/* eslint-disable no-unused-vars */
/* eslint-disable react/prop-types */
import React, { useState, useCallback } from "react";
import { toast } from "react-toastify";
import axios from "axios";
import { server_end_point } from "../utils/endpoint"
import { ring2 } from "ldrs";
import { planConfiguration, priceConfiguration } from "../constant/constants";
import AlertDialog from "./mui/AlertDialog";
import useCredits from "../hooks/useCredits";
ring2.register();




const SubscriptionButtons = ({
  checkPriceType,
  session,
  setCancelAt,
  cancelAt,
  setSubscriptionStatus,
  subscriptionStatus,
  priceId,
  userPriceId,
  schedule,
  subscription_id,
  email,
  checked
}) => {

  const [loading, setLoading] = useState(false);
	const [open, setOpen] = React.useState(false)
  const [title, setTitle] = useState("")
  const {fetchCredits: refreshCredits} = useCredits()

  const handleAlert = (cancel) => {
    if (checkPriceType(priceId) !== checkPriceType(userPriceId)) {
      toast.warning(
        "This currency type in invalid for your current subscription."
      )
      return
    }
    if(cancel){
       if (priceConfiguration[priceId] < priceConfiguration[userPriceId]) {
					setTitle("Downgrade")
				} else {
					setTitle("Upgrade")
				}
    }else{
      setTitle("Cancel")
    }
    setOpen(true)
  }
  
  const handleBuy = useCallback(
    async (price_id) => {
      if(!email){
        return
      }
      setLoading(true);
      try {
        const response = await axios.post(
          `${server_end_point}/subscribe`,
          { price_id, email},
          { headers: {
            'Authorization': 'Bearer ' + session.access_token,
            "Content-Type": "application/json" } }
        );

        window.location.href = response.data.url;
        toast.success("Redirecting to payment...");
      } catch (error) {
        console.error("Purchase error:", error);
        toast.error("Failed to initiate purchase. Please try again.");
      } finally {
        setLoading(false);
      }
    },
    [email, session.access_token]
  );

  const handleUpdate = useCallback(
    async (price_id) => {
    
      setLoading(true);

      try {
        const response = await axios.patch(
					`${server_end_point}/update-subscription`,
					{ price_id, subscription_id },
					{
						headers: {
							Authorization: "Bearer " + session.access_token,
							"Content-Type": "application/json",
						},
					}
				)
        if (response?.data?.message) {
          toast.success(response.data.message);
        }
      } catch (error) {
        console.error("Update error:", error);
        toast.error(
          error?.response?.data?.message ||
            "Failed to update subscription. Please try again."
        );
      } finally {
        refreshCredits()
        setLoading(false);
      }

      window.location.reload()

    },
    [refreshCredits, session.access_token, subscription_id]
  );

  const handleCancelPlan = async () => {
    setLoading(true);
    try {
      const response = await axios.patch(
				`${server_end_point}/cancel-subscription`,
				{ email },
				{
					headers: {
						Authorization: "Bearer " + session.access_token,
						"Content-Type": "application/json",
					},
				}
			)
      setSubscriptionStatus(null);
      toast.success(response.data.message);
    } catch (error) {
      console.error("Cancellation error:", error);
      toast.error(
        error?.response?.data?.message ||
          "Failed to cancel subscription. Please try again."
      );
    } finally {
      refreshCredits()
      setLoading(false);
    }
  };

  const renderButton = () => {
    if (loading)
      return (
        <l-ring-2
          size="40"
          stroke="5"
          stroke-length="0.25"
          bg-opacity="0.1"
          speed="0.8"
          color="black"
        ></l-ring-2>
      );

    const currentPhase = schedule?.current_phase;
    const nextPhase = schedule?.phases.find(
      (phase) => phase.start_date === currentPhase?.end_date
    );

    const nextPlanId = nextPhase?.items[0]?.price;
    const nextPlanStartDate = nextPhase
      ? new Date(nextPhase.start_date * 1000).toLocaleDateString()
      : null;

      console.log(priceId, userPriceId, "ids")
    if (subscriptionStatus === "active") {
      if (planConfiguration[priceId] === planConfiguration[userPriceId]) {
        return (
          <div className="flex w-full items-end flex-col">
            <div className="bg-[#37996B] border-[0.4px] border-[#68b591] border-solid text-white font-medium text-sm rounded-md px-3 py-2 w-fit h-fit">
              {cancelAt ? <p>Cancellation Scheduled</p> : <p>Current Plan</p>}
            </div>
            {!cancelAt && (
              <button
                onClick={() => {
                  handleAlert(false, null)
                }}
                className="text-white font-medium text-sm px-3 py-2 w-fit h-fit"
              >
                Cancel?
              </button>
            )}
          </div>
        );
      } else {
        return (
					<div className="w-full">
						{planConfiguration[nextPlanId] === planConfiguration[priceId] ? (
							<button
								disabled={true}
								className="bg-[#37996B] border-[0.4px] border-[#68b591] border-solid text-white font-medium text-sm rounded-md px-3 py-2 w-fit h-fit">
								Switch Scheduled
							</button>
						) : (
							<button
								onClick={() => handleAlert(true, priceId)}
								className={`bg-[#37996B] border-[0.4px] border-[#68b591] border-solid text-white font-medium text-sm rounded-md px-3 py-2 w-fit h-fit ${
									checkPriceType(priceId) !== checkPriceType(userPriceId) &&
									"opacity-50"
								}`}>
								{priceConfiguration[priceId] < priceConfiguration[userPriceId]
									? `Downgrade`
									// : `Upgrade to ${priceId}`}
									: `Upgrade`}
								{planConfiguration[nextPlanId] === planConfiguration[priceId] &&
									` (Switching on ${nextPlanStartDate})`}
							</button>
						)}
					</div>
				)
      }
    } else {
      return (
        <div className="w-full">
          <button
            onClick={() => handleBuy(priceId)}
            className="bg-[#37996B] border-[0.4px] border-[#68b591] border-solid text-white font-medium text-sm rounded-md px-3 py-2 w-fit h-fit"
          >
            Subscribe
          </button>
        </div>
      );
    }
  };

  return <div><AlertDialog title={title} open={open} setOpen={setOpen} handleUpdate={handleUpdate} handleCancelPlan={handleCancelPlan} priceId={priceId} />{renderButton()}</div>;
};

export default SubscriptionButtons;
