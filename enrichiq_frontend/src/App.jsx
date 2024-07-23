import { useState, useEffect } from "react"
import {
	Navigate,
	Routes,
	Route,
} from "react-router-dom"
import Home from "./components/home.jsx"
import Login from "./components/Login.jsx"
import Logout from "./components/logout.jsx"
import { ThemeProvider } from "@mui/material/styles"
import theme from "./theme"
import BuyCredits from "./components/buyCredits.jsx"
import { ToastContainer } from "react-toastify"
import UpdatePassword from "./components/UpdatePassword.jsx"
import getSessionAndRefreshIfNeeded from "./services/getSessionRefreshIfNeeded.jsx"
import { BrowserRouter } from "react-router-dom"

function App() {
	const [session, setSession] = useState(true)
	const [loading, setLoading] = useState(true)

	useEffect(() => {
		const getSession = async () => {
			const currentSession = await getSessionAndRefreshIfNeeded()
			setSession(currentSession)
		}
		getSession()
	}, [])


	const renderProtectedRoute = (Component, props) => {
		return session ? <Component {...props} /> : <Navigate to="/login" />
	}

	return (
		<ThemeProvider theme={theme}>
			<BrowserRouter>
					<Routes>
						<Route
							path="/login"
							element={<Login />}
						/>
						<Route
							path="/logout"
							element={<Logout />}
						/>
						<Route
							path="/update-password"
							element={<UpdatePassword />}
						/>
						<Route
							path="/settings"
							element={renderProtectedRoute(BuyCredits, {
								session: session,
								setLoading: setLoading,
								loading: loading,
							})}
						/>
						<Route
							path="/"
							element={renderProtectedRoute(Home, {
								session: session,
							})}
						/>
					</Routes>
			</BrowserRouter>

			<ToastContainer />
		</ThemeProvider>
	)
}

export default App
