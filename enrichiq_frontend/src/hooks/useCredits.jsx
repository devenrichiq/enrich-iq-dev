import { useState, useEffect, useCallback } from "react"
import supabase from "../supabase/supabaseClient"
import { GetCredits } from "../supabase/supabase"
const useCredits = () => {
	const [credits, setCredits] = useState(null)
	const [loading, setLoading] = useState(true)
	const [error, setError] = useState(null)
	const fetchCredits = useCallback(async () => {
		try {
			const userResponse = await supabase.auth.getUser()
			if (userResponse.error) {
				throw new Error(userResponse.error.message)
			}

			const userId = userResponse.data.user.id
			const creditsResponse = await GetCredits(userId)
			setCredits(creditsResponse.credits)
			console.log(creditsResponse.credits)
		} catch (err) {
			setError(err.message)
		} finally {
			setLoading(false)
		}
	}, [])
	useEffect(() => {
		fetchCredits()
	}, [fetchCredits, credits,])

	return { credits, loading, error, setCredits, fetchCredits }
}

export default useCredits
