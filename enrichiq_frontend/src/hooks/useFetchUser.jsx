import { useCallback, useEffect, useState } from "react"
import supabase from "../supabase/supabaseClient"
import { useNavigate } from "react-router-dom"

const useFetchUser = () => {
	const navigate = useNavigate()
	const [user, setUser] = useState(null)
	const [customerEmail, setCustomerEmail] = useState(null)
	const fetchUser = useCallback(async () => {
		try {
			const { data, error } = await supabase.auth.getUser()

			if (error) {
				console.error("Error fetching user:", error.message)
				return
			}

			const { error: getDetailError, data: getDetails } = await supabase
				.from("users")
				.select("*")
				.eq("id", data.user.id)

			if (getDetailError) {
				console.error("Error:", getDetailError.message)
			}
			var updatedUserObject = data.user
			updatedUserObject = { ...updatedUserObject, name: getDetails[0].name, payment_type: getDetails[0].payment_type }

			if (data && data.user) {
				setUser(updatedUserObject)
				setCustomerEmail(data.user.email)

				if(data.user.email !==  getDetails[0].email){
					if(window.location.pathname !== '/'){
						navigate("/")
					}
				}
			} else {
				console.error("No user found.")
			}
		} catch (error) {
			console.error("Error fetching user:", error.message)
		}
	}, [navigate])
	useEffect(() => {
		fetchUser()
	}, [fetchUser])

	return { customerEmail, user }
}

export default useFetchUser
