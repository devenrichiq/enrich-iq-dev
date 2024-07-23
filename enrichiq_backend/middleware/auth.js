import { createClient } from "@supabase/supabase-js"

const supabase = createClient(
	process.env.SUPABASE_URL,
	process.env.SUPABASE_SERVICE_KEY
)

export default async function (req, res, next) {
	const token = req.headers["authorization"]?.split(" ")[1]
	if (!token) {
		return res.redirect(401, "/login")
	}

	try {
		const {
			data: { user },
			error,
		} = await supabase.auth.getUser(token)
		if (error || !user) {
			return res.redirect(401, "/login")
		}
		req.user = user
		next()
	} catch (error) {
		console.error("Authentication error:", error)
		return res.redirect(401, "/login")
	}
}
