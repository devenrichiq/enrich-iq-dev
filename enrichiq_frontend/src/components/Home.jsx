/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable react/prop-types */
/* eslint-disable no-unused-vars */

import { useEffect, useState, useCallback } from "react";
import Sidebar from "./Sidebar.jsx";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import useFetchUser from "../hooks/useFetchUser";
import axios from "axios";
import useCredits from "../hooks/useCredits";
import CustomAccordion from "./CustomAccordion.jsx";
import { server_end_point } from "../utils/endpoint";
import { useNavigate } from "react-router-dom";
import useVerifyEmail from "../hooks/useVerifyEmail";
import { ring2 } from "ldrs";
import supabase from "../supabase/supabaseClient.jsx";
ring2.register();

function Home({ session }) {


  // Custom hooks for fetching user data, credits, and email verification status
  const { credits, loading: creditsLoading } = useCredits();
  const { customerEmail, user } = useFetchUser();
  const { emailVerified } = useVerifyEmail();

  // State management
  const [showDropdown, setShowDropdown] = useState(false);
  const [isSubscriptionActive, setSubscriptionActive] = useState(true);
  const [formLoading, setFormLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: customerEmail || "",
    apolloLink: "",
    leadCount: null,
    fileName: "",
  });

  const navigate = useNavigate();

  // Fetch subscription status for a given email
  const fetchSubscriptionStatus = useCallback(
    async (email) => {
      try {
        const url = `${server_end_point}/subscription-id?email=${email}`;
        const response = await fetch(url, {
          method: "GET",
          headers: {
            Authorization: `Bearer ${session.access_token}`,
            "Content-Type": "application/json",
          },
        });

        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }

        const data = await response.json();
        return data?.status || null;
      } catch (error) {
        console.error("Error fetching subscription status:", error.message);
        return null;
      }
    },
    [session.access_token]
  );

  useEffect(() => {
    const updateSubscriptionStatus = async () => {
      if (customerEmail) {
        const status = await fetchSubscriptionStatus(customerEmail);
        setSubscriptionActive(status === "active");
      }
    };

    // Call the function to update the subscription status in the background
    updateSubscriptionStatus();
  }, [customerEmail, fetchSubscriptionStatus]);

  // Toggle the lead count dropdown
  const toggleDropdown = useCallback(() => {
    setShowDropdown((prev) => !prev);
  }, []);

  // Validate form inputs
  const validateForm = (data) => {
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const apolloPattern = /^https?:\/\/(www\.)?app.apollo\.io/;

    if (!emailPattern.test(data.email)) {
      toast.error("Invalid email format.");
      return false;
    }

    if (!apolloPattern.test(data.apolloLink)) {
      toast.error("Invalid Apollo link. Only apollo.io domain is allowed.");
      return false;
    }

    if (data.fileName.length < 5) {
      toast.error("File name must be at least 5 characters long.");
      return false;
    }

    if (!data.leadCount || isNaN(data.leadCount)) {
      toast.error("Please select a valid number of leads.");
      return false;
    }

    return true;
  };

  // Handle form input changes
  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Handle lead count selection from dropdown
  const handleLeadSelect = (leadCount) => {
    setFormData({ ...formData, leadCount: Number(leadCount) });
    setShowDropdown(false);
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormLoading(true);

    // Use customer email if form email is not provided or left blank
    if (!formData.email.trim()) {
      formData.email = customerEmail;
    }

    // Check if all form fields are filled
    if (Object.values(formData).some((value) => !value)) {
      toast.warning("Please fill all fields before submitting.");
      setFormLoading(false);
      return;
    }

    // Validate form inputs
    if (!validateForm(formData)) {
      setFormLoading(false);
      return;
    }

    // Check if user is logged in
    if (!user.id || !user.email) {
      toast.error(
        "User information is missing. Please make sure you are logged in."
      );
      setFormLoading(false);
      return;
    }

    // Check if user has enough credits
    if (credits < formData.leadCount) {
      toast.error("You do not have enough credits.");
      setFormLoading(false);
      return;
    }

    // Check if user has an active subscription
    const currentStatus = await fetchSubscriptionStatus(customerEmail);
    if (currentStatus !== "active") {
      toast.error("You do not have an active subscription.");
      setFormLoading(false);
      return;
    }

    const webhookUrl = `https://n8n.cloudron.enrichiq.com/webhook/d4be2e8f-0e7d-4e67-854d-fc5669cf5f9b`;

    try {
      const response = await axios.post(
        webhookUrl,
        { formData },
        {
          headers: {
            "Content-Type": "application/json",
            "X-Client-Key": user.id,
            "Request-Email": user.email,
          },
        }
      );

      if (response.status === 200) {
        toast.success(
          "We have received your request. You will receive an email shortly."
        );

        try {
          const { data, error } = await supabase
            .from("users")
            .update({ credits: credits - formData.leadCount })
            .eq("id", user.id);

          if (error) {
            console.error("Error updating credits:", error.message);
            toast.error("Error updating credits.");
          } else {
            console.log("Credits updated successfully:", data);
          }
        } catch (error) {
          console.error("Error updating credits:", error.message);
          toast.error("Error updating credits.");
        }
      } else {
        toast.error("Unable to submit form now. Please try again.");
      }
    } catch (err) {
      console.error("Error submitting form:", err);
      toast.error(err?.response?.data?.message || err.message);
    }

    setFormLoading(false);
  };

  // Main content for the Home component
  const content = (
    <div className="flex-col">
      {!isSubscriptionActive && (
        <div className=" bg-[#232323] border- transform hover:scale-[101%] duration-200 mt-24 flex justify-center items-center rounded-md mx-4 py-6">
          <div className="flex items-center px-20 w-full justify-between">
            <div className="font-semibold text-white border-white text-xl">
              {"You Don't Have An Active Subscription!"}
            </div>
            <div>
              <button
                onClick={() => navigate("/settings")}
                className="bg-[#37996B] border-[0.4px] border-[#68b591] border-solid text-white font-medium text-sm rounded-md px-3 py-2 w-fit h-fit"
              >
                Subscribe Now
              </button>
            </div>
          </div>
        </div>
      )}

      <div
        className={`flex justify-around h-full ${
          !isSubscriptionActive ? "mt-16" : "mt-36" }`}
      >
        <form className="min-w-[27vw] max-w-sm" onSubmit={handleSubmit}>
          <div className="mb-5">
            <label
              htmlFor="email"
              className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
            >
              Email{" "}
              <span className="text-gray-200">[ Leave Blank For Default ]</span>
            </label>
            <input
              value={formData.email}
              type="email"
              id="email"
              name="email"
              className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-md block w-full p-2.5 dark:bg-[#232323] dark:border-[#343434] dark:placeholder-gray-400 dark:text-white"
              placeholder={customerEmail}
              // required
              onChange={handleInputChange}
            />
          </div>

          <div className="mb-5">
            <label
              htmlFor="apolloLink"
              className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
            >
              Apollo Link
            </label>
            <input
              value={formData.apolloLink}
              type="text"
              id="apolloLink"
              name="apolloLink"
              className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-md block w-full p-2.5 dark:bg-[#232323] dark:border-[#343434] dark:placeholder-gray-400 dark:text-white"
              placeholder="Enter Apollo Link - https://app.apollo.io/{ }"
              required
              onChange={handleInputChange}
            />
          </div>

          <div className="mb-5">
            <label
              htmlFor="leadCount"
              className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
            >
              No Of Leads
            </label>
            <div className="relative">
              <button
                id="dropdownDefaultButton"
                className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-md focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 text-left dark:bg-[#232323] dark:border-[#343434] dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                type="button"
                onClick={toggleDropdown}
              >
                {formData.leadCount || "Select No Of Leads"}
                <svg
                  className="w-2.5 h-2.5 absolute right-2 top-3"
                  aria-hidden="true"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 10 6"
                >
                  <path
                    stroke="currentColor"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="m1 1 4 4 4-4"
                  />
                </svg>
              </button>
              {showDropdown && (
                <div className="absolute z-10 mt-1 bg-white divide-y divide-gray-100 rounded-md shadow w-full dark:bg-gray-700">
                  <ul className="rounded-md custom-scrollbar max-h-64 bg-[#232323] overflow-y-auto overflow-x-hidden py-2 text-sm text-gray-700 dark:text-gray-200">
                    {[
                      "1000",
                      "2000",
                      "3000",
                      "4000",
                      "5000",
                      "6000",
                      "7000",
                      "8000",
                      "9000",
                      "10000",
                      "11000",
                      "12000",
                      "13000",
                      "14000",
                      "15000",
                      "16000",
                      "17000",
                      "18000",
                      "19000",
                      "20000",
                      "21000",
                      "22000",
                      "23000",
                      "24000",
                      "25000",
                      "26000",
                      "27000",
                      "28000",
                      "29000",
                      "30000",
                      "31000",
                      "32000",
                      "33000",
                      "34000",
                      "35000",
                      "36000",
                      "37000",
                      "38000",
                      "39000",
                      "40000",
                      "41000",
                      "42000",
                      "43000",
                      "44000",
                      "45000",
                      "46000",
                      "47000",
                      "48000",
                      "49000",
                      "50000",
                    ].map((leadCount) => (
                      <li key={leadCount}>
                        <a
                          href="#"
                          className="block px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-600 dark:hover:text-white"
                          onClick={() => handleLeadSelect(leadCount)}
                        >
                          {leadCount}
                        </a>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>

          <div className="mb-5">
            <label
              htmlFor="fileName"
              className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
            >
              File Name
            </label>
            <input
              value={formData.fileName}
              type="text"
              id="fileName"
              name="fileName"
              className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-md block w-full p-2.5 dark:bg-[#232323] dark:border-[#343434] dark:placeholder-gray-400 dark:text-white"
              placeholder="Enter File Name"
              required
              onChange={handleInputChange}
            />
          </div>

          <button
            type="submit"
            className="bg-[#37996B] w-full max-w-[200px] border-[0.4px] border-[#68b591] border-solid text-white font-medium text-sm rounded-md px-3 py-2 h-fit"
          >
            {formLoading ? (
              <l-ring-2
                size="20"
                stroke="5"
                stroke-length="0.25"
                bg-opacity="0.1"
                speed="0.8"
                color="black"
              ></l-ring-2>
            ) : (
              "Email Me The Data"
            )}
          </button>
        </form>

        <CustomAccordion />
      </div>
    </div>
  );

  return (
		<>
			{emailVerified ? (
				<Sidebar bodyContent={content} />
			) : (
				<Sidebar
					bodyContent={
						<div className="w-full h-[100vh] justify-center flex items-center">
							<iframe src="https://lottie.host/embed/468630d0-981b-4fd4-9897-105ac4cf2130/VpLuYpdyVG.json"></iframe>
						</div>
					}
				/>
			)}
		</>
	)
}

export default Home;
