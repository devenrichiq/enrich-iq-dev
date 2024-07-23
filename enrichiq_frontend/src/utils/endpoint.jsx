const server_end_point =
	import.meta.env.NODE_ENV !== "production"
		? "http://localhost:4000"
		: "https://enrich-iq-backend.vercel.app"

const client_endpoint =
	import.meta.env.NODE_ENV !== "production"
		? "http://localhost:5173"
		: "https://dev-enrichiq.vercel.app"


export {server_end_point, client_endpoint};