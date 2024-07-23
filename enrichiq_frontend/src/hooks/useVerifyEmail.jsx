import { useCallback, useEffect, useState } from "react"
import supabase from "../supabase/supabaseClient"
import { toast } from "react-toastify"
import { server_end_point } from "../utils/endpoint"
import getSessionAndRefreshIfNeeded from "../services/getSessionRefreshIfNeeded"
import axios from "axios"
import "react-toastify/dist/ReactToastify.css"

const useVerifyEmail = () => {
    const [emailVerified, setEmailVerified] = useState(false)
    
	const verifyEmail = useCallback(async () => {
		const session = await getSessionAndRefreshIfNeeded()
		const { data } = await supabase.auth.getUser()
		const { id: userId, email:new_email } = data.user
		const { data: getDetails } = await supabase
			.from("users")
			.select("*")
			.eq("id", userId)
		const prev_email = getDetails[0].email 
		if (new_email !== prev_email && !emailVerified) {

			
			// if the email differs for both user table and auth table
			try{
			const url = `${server_end_point}/subscription-id?email=${prev_email}`

			const response = await fetch(url, {
				method: "GET",
				headers: {
					Authorization: "Bearer " + session.access_token,
					"Content-Type": "application/json",
				},
			})

			if (!response.ok) {
				console.error("Stripe Customer not found!", response)
			}

			console.log("Stripe Email Updated")
			const data = await response.json()

			if (data?.customer_id && new_email) {
				if (handleStripeEmailChange(data.customer_id, new_email, session)) {
					// update the email with stripe
					const { error } = await supabase
						.from("users")
						.update({
							email: new_email,
							updated_at: new Date().toISOString(),
						})
						.eq("id", userId)

					if (!error) {
						setEmailVerified(true)
					}
				}
			}
			}
			catch(err){
				console.error(err.message)
			}
			
		}else{
            setEmailVerified(true)
        }
	}, [emailVerified])

	const handleStripeEmailChange = async (customer_id, email, session) => {
		if (customer_id) {
			const response = await axios.post(
				`${server_end_point}/change-email`,
				{
					customerId: customer_id,
					newEmail: email,
				},
				{
					headers: {
						Authorization: "Bearer " + session.access_token,
					},
				}
			)

			if (response.status !== 200) {
				toast.error("Failed to change stripe email")
				return false
			}

			return true
		}
	}

	useEffect(() => {
		verifyEmail()
	}, [verifyEmail])

    return { emailVerified }
}

export default useVerifyEmail
