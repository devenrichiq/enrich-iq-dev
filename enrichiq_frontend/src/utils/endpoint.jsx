import process from "node:process"

const server_end_point =
	process.env.NODE_ENV !== "production"
		? "http://localhost:4000"
		: "https://enrichiq.up.railway.app"

const client_endpoint =
	process.env.NODE_ENV !== "production"
		? "http://localhost:5173"
		: "https://enrich-iq.vercel.app"


export {server_end_point, client_endpoint};