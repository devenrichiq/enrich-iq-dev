import supabase from "../supabase/supabaseClient"
import { Auth } from "@supabase/auth-ui-react"
import { ThemeSupa } from "@supabase/auth-ui-shared"

function Login() {
	supabase.auth.onAuthStateChange(async (event) => {
		if (event === "SIGNED_IN") {
			window.location.href = "/"
		}
	})

	return (
		<div 
		style={{ backgroundColor: "white" }}
		className=" flex justify-center items-center h-screen">
			<div className="min-w-[25%]">
				<h1 className="text-5xl mb-3">🦄</h1>
				<h1
					style={{
						letterSpacing: "-1px",
					}}
					className="text-4xl mb-5 font-semibold ">
					Enrich IQ
				</h1>
				<Auth
					className="font-sans"
					supabaseClient={supabase}
					providers={[]}
					appearance={{
						theme: ThemeSupa,
						style: {
							button: { background: "#222831", borderColor: "#222831" },
						},
					}}
				/>
			</div>
		</div>
	)
}

export default Login
