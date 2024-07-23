/* eslint-disable react/prop-types */
/* eslint-disable react-hooks/exhaustive-deps */
import { useEffect, useState } from "react"
import supabase from "../supabase/supabaseClient"
import { server_end_point, client_endpoint } from "../utils/endpoint"
import { toast } from "react-toastify"
import Sidebar from "./Sidebar"
import SubscriptionButtons from "./SubscriptionButtons"
import useCredits from "../hooks/useCredits"
import { lineSpinner } from "ldrs"
import useFetchUser from "../hooks/useFetchUser"
import validateForm from "../services/formValidator"
import convertTimeStampToDate from "../services/convertTimeStampToDate"
import { planConfiguration } from "../constant/constants.jsx"
import "react-toastify/dist/ReactToastify.css"
import { dotSpinner } from "ldrs"
import IOSSwitch from "./mui/Switch"
import { globalPriceList } from "../constant/constants.jsx"




function BuyCredits({ setLoading, loading, session }) {
	const { customerEmail, user } = useFetchUser()
	const { setCredits } = useCredits()
	const [subscription, setSubscription] = useState(null)
	const [userPriceId, setUserPriceId] = useState(null)
	const [customer_id, setCustomerId] = useState(null)
	const [subscription_id, setSubscription_id] = useState(null)
	const [scheduleId, setScheduleId] = useState(null)
	const [schedule, setSchedule] = useState(null)
	const [cancelAt, setCancelAt] = useState(null)
	const [subscriptionStatus, setSubscriptionStatus] = useState(null)
	const [profileForm, setProfileForm] = useState({
		name: user?.name || "",
		email: user?.email || "",
	})
	const [errors, setErrors] = useState({})
	const [isTimer, setIsTime] = useState(false)
	const [checked, setChecked] = useState(true)


	lineSpinner.register()

	const currentPhase = schedule?.current_phase

	const nextPhase = schedule?.phases.find(
		(phase) => phase.start_date === currentPhase?.end_date
	)

	const nextPlanId = nextPhase?.items[0]?.price

	const nextPlanStartDate = nextPhase
		? new Date(nextPhase.start_date * 1000).toLocaleDateString()
		: null


	useEffect(() => {
		setLoading(true)
		const fetchSubscription = async () => {
			setCredits(null)
			try {
				const url = `${server_end_point}/subscription-id?email=${customerEmail}`

				const response = await fetch(url, {
					method: "GET",
					headers: {
						Authorization: "Bearer " + session.access_token,
						"Content-Type": "application/json",
					},
				})

				if (!response.ok) {
					throw new Error(`HTTP error! Status: ${response.status}`)
				}

				const data = await response.json()
				if (data) {
					setSubscriptionStatus(data.status)
					setSubscription(data.subscription_id)
					setUserPriceId(data.price_id)
					setCustomerId(data.customer_id)
					setSubscription_id(data.subscription_id)
					setScheduleId(data.schedule)
					if (data.cancel_at) {
						setCancelAt(convertTimeStampToDate(data.cancel_at))
					}
				} else {
					console.log("No subscription data received")
				}
				setChecked(checkPriceType(userPriceId))
				setLoading(false)
			} catch (error) {
				console.error("Error fetching user subscription status:", error.message)
				setLoading(false)
			}
		}

		if (customerEmail) {
			fetchSubscription()
		}
	}, [
		customerEmail,
		session.access_token,
		setCredits,
		setLoading,
		subscriptionStatus,
		cancelAt,
		setCancelAt,
	])

	useEffect(() => {
		const fetchSchedule = async () => {
			try {
				if (!customer_id || !scheduleId) {
					console.log("No customer_id or scheduleId available")
					return
				}

				const url = `${server_end_point}/schedule?scheduleId=${scheduleId}`

				const response = await fetch(url, {
					method: "GET",
					headers: {
						Authorization: "Bearer " + session.access_token,
						"Content-Type": "application/json",
					},
				})

				if (!response.ok) {
					throw new Error(`HTTP error! Status: ${response.status}`)
				}

				const data = await response.json()

				if (data) {
					setSchedule(data)
				} else {
					console.log("No subscription schedule data received")
				}
				setLoading(false)
			} catch (error) {
				console.error("Error fetching subscription schedule:", error.message)
				setLoading(false)
			}
		}

		if (subscription) {
			fetchSchedule()
		}
	}, [
		customer_id,
		scheduleId,
		session.access_token,
		setLoading,
		setCredits,
		subscription,
		subscriptionStatus,
	])
	useEffect(() => {
		setProfileForm({
			name: user?.name,
			email: user?.email,
		})
	}, [user])


	const RateLimiter = () => {
		if (!isTimer) {
			setIsTime(true)
			setTimeout(() => {
				setIsTime(false)
			}, [2000])
		}
	}
	const checkPriceType = (price_id) => {
		if (subscriptionStatus === "active") {
			if (globalPriceList.includes(price_id)) {
				return true // Global price
			} else {
				return false // Indian Price
			}
		} else {
			return true
		}
	}


	const handleUpdateProfile = async () => {
		const errors = validateForm(profileForm.email)
		if (errors.email) {
			setErrors(errors)
			return
		} else {
			setErrors({})
		}
		try {
			if (profileForm.email === user.email) {
				toast.warning("No changes were made!")
				return
			}
			if (!profileForm.email) {
				toast.warning("Kindly enter a valid email address")
				return
			}

			const { error: emailError } = await supabase.auth.updateUser({
				email: profileForm.email,
			})

			if (emailError) {
				toast.error(String(emailError.message))
				console.error("Error updating email:", emailError.message)
			} else {
				toast.success(`Confirmation Link send to ${profileForm.email}`)
			}
		} catch (err) {
			toast.error("Error in updating profile details!")
		}
	}
	const handleChangeFormData = (e) => {
		setProfileForm({ ...profileForm, [e.target.name]: e.target.value })
	}
	const handlePasswordReset = async () => {
		const {  error } = await supabase.auth.resetPasswordForEmail(
			customerEmail,
			{
				redirectTo: `${client_endpoint}/update-password`,
			}
		)
		if (error) {
			toast.error(error.message)
		} else {
			toast.success("Password reset email sent successfully!")
		}
	}

	const profile = (
		<div className="w-fit mt-16 p-4 border-[#343434] border rounded-lg shadow sm:p-6 bg-[#272727] ">
			<h5 className="mb-3 text-base border-[#343434]  font-semibold md:text-x text-white">
				Profile
			</h5>
			<ul className="mt-8 mb-2 gap-4 flex ">
				<li>
					<label className="  text-white w-fit ">Email</label>
					<div className="flex justify-center items-center gap-3">
						{" "}
						<input
							className="mt-2 min-w-[220px] text-white  bg-gray-50 border border-[#343434]  text-sm rounded-md block w-full p-2.5 dark:bg-[#232323]"
							autoComplete="false"
							name="email"
							type="email"
							required
							// value=
							onChange={handleChangeFormData}
							placeholder={user?.email}
						/>{" "}
						<button
							onClick={() => {
								if (isTimer === false) {
									RateLimiter()
									handleUpdateProfile()
								}
							}}
							className="mt-1 bg-[#272727] border-[0.4px] border-[#343434] border-solid text-white font-medium text-sm rounded-md px-3 py-2 w-fit h-fit">
							Update
						</button>
					</div>
				</li>
				<li></li>
			</ul>
			{errors.email &&<p className="text-red-400 pl-2">{errors.email}</p>}
			<button
				onClick={() => {
					if (isTimer == false) {
						RateLimiter()
						handlePasswordReset()
					}
				}}
				className="mt-3 bg-[#272727] border-[0.4px] border-[#343434] border-solid text-white font-medium text-sm rounded-md px-3 py-2 w-fit h-fit">
				Reset Password
			</button>
		</div>
	)

	dotSpinner.register()

	const spinner = (
		<div className="w-full h-[100vh] justify-center flex items-center">
			<div className="w-full h-screen flex justify-center items-center ">
				<div className="spinner">
					<div></div>
					<div></div>
					<div></div>
					<div></div>
					<div></div>
					<div></div>
				</div>
			</div>
		</div>
	)

	const content = (
		<div className="flex-col justify-center items-center">
			<div className="flex justify-center items-cente mt-20 gap-8 h-[70vh]  ">
				<div className="flex  ">
					<div>
						<div className=" min-w-[430px] test w-full mt-16  p-4 border text-white border-[#343434] bg-[#272727] rounded-lg shadow sm:p-6 ">
							<div className="flex  justify-between">
								<div className="flex w-full justify-between">
									<h5 className="mb-1 font-medium text-xl text-white">
										Subscriptions
									</h5>
									<div className="flex text-[14px] gap-4">
										USD / INR
										<IOSSwitch
											checked={checked}
											onChange={() => setChecked(!checked)}
										/>
									</div>
								</div>
							</div>
							<div className="box-content w-full">
								<ul className=" my-4 space-y-3 ">
									<li className="">
										<a
											href="#"
											className="min-w-[350px] border text-white border-[#343434] justify-center gap-8 flex items-center p-3 text-base font-medium rounded-lg bg-[#272727] dark:text-white">
											<span className="w-full flex-1  ms-3 whitespace-nowrap">
												<div className="text-lg">
													{" "}
													Basic - {checked ? "100$" : "₹8333"} / MO{" "}
												</div>

												<div className="mt-1 font-normal">25k credits / MO</div>
											</span>

											<SubscriptionButtons
												checkPriceType={checkPriceType}
												session={session}
												setCancelAt={setCancelAt}
												cancelAt={cancelAt}
												subscription={subscription}
												setSubscriptionStatus={setSubscriptionStatus}
												subscriptionStatus={subscriptionStatus}
												priceId={
													checked
														? "price_1PT5TySIJMxI4tFFK6hXKXwb"
														: "price_1PT5UlSIJMxI4tFF701TNHj5"
												}
												userPriceId={userPriceId}
												user={user}
												schedule={schedule}
												subscription_id={subscription_id}
												customerId={customer_id}
												email={customerEmail}
												checked={checked}
											/>
										</a>
									</li>

									<li>
										<a
											href="#"
											className="min-w-[350px] border text-white border-[#343434] justify-center gap-8 flex items-center p-3 text-base font-medium rounded-lg bg-[#272727] dark:text-white">
											<span className="flex-1  ms-3 whitespace-nowrap w-[50%]">
												<div className="text-lg">
													{" "}
													Pro - {checked ? "200$" : "₹16,667"} / MO{" "}
												</div>

												<div className="mt-1 font-normal">55k credits / MO</div>
											</span>

											<SubscriptionButtons
												checkPriceType={checkPriceType}
												session={session}
												setCancelAt={setCancelAt}
												cancelAt={cancelAt}
												subscription={subscription}
												setSubscriptionStatus={setSubscriptionStatus}
												subscriptionStatus={subscriptionStatus}
												priceId={
													checked
														? "price_1PT5UzSIJMxI4tFFgTC43kos"
														: "price_1PT5VZSIJMxI4tFFzOxDJkEr"
												}
												userPriceId={userPriceId}
												user={user}
												schedule={schedule}
												customerId={customer_id}
												email={customerEmail}
												subscription_id={subscription_id}
												checked={checked}
											/>
										</a>
									</li>
									<li>
										<a
											href="#"
											className=" min-w-[350px] border text-white border-[#343434] justify-center gap-8 flex items-center p-3 text-base font-medium rounded-lg bg-[#272727] dark:text-white">
											<span className="flex-1  ms-3 whitespace-nowrap w-[50%]">
												<div className="text-lg">
													{" "}
													Premium - {checked ? "300$" : "₹25,001"} / MO{" "}
												</div>

												<div className="mt-1 font-normal">90k credits / MO</div>
											</span>

											<SubscriptionButtons
												checkPriceType={checkPriceType}
												session={session}
												setCancelAt={setCancelAt}
												cancelAt={cancelAt}
												subscription={subscription}
												setSubscriptionStatus={setSubscriptionStatus}
												subscriptionStatus={subscriptionStatus}
												priceId={
													checked
														? "price_1PT5VsSIJMxI4tFFdnnarfss"
														: "price_1PT5VHSIJMxI4tFFubCUjlB1"
												}
												user={user}
												userPriceId={userPriceId}
												schedule={schedule}
												customerId={customer_id}
												email={customerEmail}
												subscription_id={subscription_id}
												checked={checked}
											/>
										</a>
									</li>
								</ul>
								{cancelAt && (
									<p className="mt-6 text-sm">
										* Your Plan Will Be Cancelled On <b>{cancelAt}</b>
									</p>
								)}
								{nextPlanId && (
									<p>
										Switching To {planConfiguration[nextPlanId]} on{" "}
										{nextPlanStartDate}
									</p>
								)}
							</div>
						</div>
					</div>
				</div>
				<div>
					<div className="min-w-2/5">{profile}</div>
				</div>
			</div>

			{/* <button
        onClick={handleManageSubscription}
        className="text-white ml-60 bg-neutral-900 hover:bg-gray-900 focus:outline-none focus:ring-gray-300 font-medium rounded-lg text-sm px-5 py-2.5 mb-2"
      >
        Manage Subscription
      </button> */}
		</div>
	)
	return (
		<>
			<Sidebar bodyContent={loading ? spinner : content}></Sidebar>
		</>
	)
}

export default BuyCredits



  /*
    This Function is not used right now
  */
	// const handleManageSubscription = async () => {
	// 	try {
	// 		if (!customer_id) {
	// 			toast.error("You have no active subscriptions")
	// 			return
	// 		}
	// 		const response = await axios.post(
	// 			`${server_end_point}/create_customer_portal_session`,
	// 			{
	// 				customerId: customer_id,
	// 			},
	// 			{
	// 				headers: {
	// 					Authorization: "Bearer " + session.access_token,
	// 				},
	// 			}
	// 		)

	// 		window.location.href = response.data.session.url
	// 	} catch (error) {
	// 		console.error("Error redirecting to Customer Portal:", error)
	// 		toast.error(
	// 			"Failed to redirect to subscription management. Please try again."
	// 		)
	// 	}
	// }
