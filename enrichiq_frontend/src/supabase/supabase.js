import supabase from "./supabaseClient"

export async function GetCredits(user_id){
    try{
    const { data, error } = await supabase
                .from("users")
                .select("credits")
                .eq("id", user_id)
                .maybeSingle()

            if (error) {
                throw error
            } else {
                return data
            }
    }
    catch(err){
        console.log("Error in getting the credits:", err)
    }
}

export async function updateUserCredits(email, credits) {
	try {
		const { data, error } = await supabase
			.from("users")
			.update({ credits: credits })
			.eq("email", email)
		if (error) {
			throw error
		}
		console.log("Credits updated successfully")
		return data
	} catch (error) {
		console.error("Error getting user details:", error.message)
		return null
	}
}