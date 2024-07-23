import supabase from "../supabase/supabaseClient"

async function getSessionAndRefreshIfNeeded() {
	try {
		let { data: sessionData, error: sessionError } =
			await supabase.auth.getSession()
		if (sessionError) {
			console.error("Error retrieving session:", sessionError)
			return null
		}

		const currentTime = Math.floor(Date.now() / 1000)
		const { expires_at, refresh_token } = sessionData.session

		if (expires_at - currentTime < 300) {
			console.log("Session is about to expire or expired, refreshing...")
			let { data: refreshedData, error: refreshError } =
				await supabase.auth.refreshSession({ refresh_token })
			if (refreshError) {
				console.error("Error refreshing session:", refreshError)
				return null
			}
			return refreshedData.session
		} else {
			return sessionData.session
		}
	} catch (error) {
		console.error("Unexpected error:", error)
		return null
	}
}


export default getSessionAndRefreshIfNeeded