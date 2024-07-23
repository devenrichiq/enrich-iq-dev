import React from "react"
import AppBar from "@mui/material/AppBar"
import Box from "@mui/material/Box"
import Toolbar from "@mui/material/Toolbar"
import Typography from "@mui/material/Typography"
import MenuItem from "@mui/material/MenuItem"
import Menu from "@mui/material/Menu"
import { Link } from "react-router-dom"

function Header() {
	const [anchorEl, setAnchorEl] = React.useState(null)

	const handleMenu = (event) => {
		setAnchorEl(event.currentTarget)
	}

	const handleClose = () => {
		setAnchorEl(null)
	}

	return (
		<div>
			<Box sx={{ flexGrow: 1 }}>
				<AppBar
					sx={{
						backgroundColor: "#121214",
						fontFamily: "Helvetica, sans-serif !important",
						padding: "0px 50px",
					}}
					position="static">
					<Toolbar>
						<Typography
							variant="h6"
							component="div"
							sx={{ flexGrow: 1 }}>
							<Link to="/"> Enrich IQ</Link>
						</Typography>
						{ (
							<div>
								<div
									onClick={handleMenu}
									className="outline outline-2 outline-gray-900 text-[18px] rounded-sm bg-slate-50 text-black px-4 py-1 cursor-pointer ">
									Ayush 👋
								</div>

								<Menu
									sx={{ marginTop: "41px" }}
									id="menu-appbar"
									anchorEl={anchorEl}
									anchorOrigin={{
										vertical: "top",
										horizontal: "right",
									}}
									keepMounted
									transformOrigin={{
										vertical: "top",
										horizontal: "right",
									}}
									open={Boolean(anchorEl)}
									onClose={handleClose}>
									<MenuItem onClick={handleClose}>
										<Link to="/">Dashboard</Link>
									</MenuItem>
									<MenuItem onClick={handleClose}>
										<Link to="/BuyCredits">Credits</Link>
									</MenuItem>
									<MenuItem onClick={handleClose}>
										<Link to="logout">Logout</Link>
									</MenuItem>
								</Menu>
							</div>
						)}
					</Toolbar>
				</AppBar>
			</Box>
		</div>
	)
}

export default Header
