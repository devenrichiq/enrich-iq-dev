import { useState, useEffect } from "react"
import supabase from "../supabase/supabaseClient"
import { toast } from "react-toastify"
import "react-toastify/dist/ReactToastify.css"

const UpdatePassword = () => {
	const [password, setPassword] = useState("")
	const [isPasswordRecovery, setIsPasswordRecovery] = useState(false)

	useEffect(() => {
		const { data: authListener } = supabase.auth.onAuthStateChange(
			(event) => {
				if (event === "PASSWORD_RECOVERY") {
					setIsPasswordRecovery(true)
					toast.info("Please set your new password.")
				}
			}
		)

		return () => {
			authListener?.subscription.unsubscribe()
		}
	}, [])

	const handleUpdatePassword = async () => {
	

		const { error } = await supabase.auth.updateUser({ password })
		if (error) {
			toast.error(error.message)
		} else {
			toast.success("Password updated successfully")
			setTimeout(() => {
				window.location.href = "/settings"
			}, 1000)
		}
	}
	if(isPasswordRecovery)
	return (
		<div className="flex justify-center items-center h-screen">
			<div className="max-w-md w-full border-[#343434] border rounded-lg shadow sm:p-6 bg-[#272727]">
				<p className="text-lg text-white mb-4">Enter your new password</p>
				<input
					autoComplete="off"
					className="min-w-[120px] bg-gray-50 border border-gray-300 rounded-md block w-full p-2.5 dark:bg-[#232323] text-md dark:border-[#343434] text-white dark:placeholder-gray-400 dark:text-white"
					name="password"
					type="password"
					required
					value={password}
					onChange={(e) => setPassword(e.target.value)}
					placeholder="New Password"
				/>
				<button
					className="bg-[#37996B] w-full border-[0.4px] border-[#68b591] border-solid text-white font-medium text-sm rounded-md px-3 py-2 mt-8 h-fit"
					onClick={handleUpdatePassword}>
					Update Password
				</button>
			</div>
		</div>
	)
}

export default UpdatePassword
