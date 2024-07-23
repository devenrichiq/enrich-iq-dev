/* eslint-disable react-hooks/exhaustive-deps */
import { useEffect } from "react"
import supabase from "../supabase/supabaseClient"
import { useNavigate } from "react-router-dom"

function Logout() {
	const navigate = useNavigate()

	const handleSignOut = async () => {

		
		const { error } = await supabase.auth.signOut()
		if (error) {
			console.log("Error during sign out:", error.message)
		} else {
			navigate("/login")
		}
	}

	useEffect(() => {
		handleSignOut()
	}, [])
	return null
}

export default Logout
