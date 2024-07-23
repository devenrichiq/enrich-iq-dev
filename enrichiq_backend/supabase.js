// Supabase updations for Stripe (functions)

import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";
dotenv.config();

const supabase = createClient(
	process.env.SUPABASE_URL,
	process.env.SUPABASE_SERVICE_KEY
)


export async function getSubscriptionBySessionID(session_id) {
	try {
		const { data, error } = await supabase
			.from("subscriptions")
			.select("*")
			.eq("session_id", session_id)
			.maybeSingle()
		if (error) {
			throw error
		}
		return data
	} catch (error) {
		console.error("Error getting subscription:", error.message)
		return null
	}
}


export async function getSubscriptionByID(subscription_id){
   try {
		const { data, error } = await supabase
			.from("subscriptions")
			.select("*")
			.eq("subscription_id", subscription_id)
			.maybeSingle()
		if (error) {
			throw error
		}
		return data
	} catch (error) {
		console.error("Error getting subscription:", error.message)
		return null
	}
}


export async function updateSubscriptionBySessionId(session_id, data) {
    try {
        const { data: updatedSubscription, error } = await supabase
            .from('subscriptions')
            .update(data)
            .eq('session_id', session_id)
            .maybeSingle();
        if (error) {
            throw error;
        }
        return updatedSubscription;
    } catch (error) {
        console.error('Error updating subscription by session_id:', error.message);
        return null;
    }
}

export async function updateSubscriptionBySubscriptionId(
	subscription_id,
	data
) {
	try {
		const { data: updatedSubscription, error } = await supabase
			.from("subscriptions")
			.update(data)
			.eq("subscription_id", subscription_id)
			.maybeSingle()
		if (error) {
			throw error
		}
		return updatedSubscription
	} catch (error) {
		console.error(
			"Error updating subscription by subscription_id:",
			error.message
		)
		return null
	}
}


export async function getUserDetails(email) {
	try {
		const { data, error } = await supabase
			.from("users")
			.select("*")
			.eq("email", email)
			.maybeSingle()
		if (error) {
			throw error
		}
		return data
	} catch (error) {
		console.error("Error getting user details:", error.message)
		return null
	}
}

export async function updateUserCredits(email, credits) {
	try {
		const { data, error } = await supabase
			.from("users")
			.update({
				credits: credits,
				updated_at: new Date().toISOString(), 
			})
			.eq("email", email)

		if (error) {
			throw error
		}
		console.log(`Credits updated successfully - ${credits}`)
		return data
	} catch (error) {
		console.error("Error updating user credits:", error.message)
		return null
	}
}


export async function Log(customerId, message){
	try {
		const { data, error } = await supabase
			.from("logs")
			.insert({ customerId: customerId, message: message })
			.maybeSingle()
		if (error) {
			throw error
		}
		return data
	} catch (error) {
		console.error("Error loging user events:", error.message)
		return null
	}
}