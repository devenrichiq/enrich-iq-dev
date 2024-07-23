import * as React from "react"
import Button from "@mui/material/Button"
import Dialog from "@mui/material/Dialog"
import DialogActions from "@mui/material/DialogActions"
import DialogContent from "@mui/material/DialogContent"
import DialogContentText from "@mui/material/DialogContentText"
import DialogTitle from "@mui/material/DialogTitle"

// eslint-disable-next-line react/prop-types
export default function AlertDialog({ title, open, setOpen, handleUpdate, handleCancelPlan, priceId }) {


	const handleClose = () => {
		setOpen(false)
	}

	return (
		<React.Fragment>
			<Dialog
				open={open}
				onClose={handleClose}
				aria-labelledby="alert-dialog-title"
				aria-describedby="alert-dialog-description">
				<DialogTitle id="alert-dialog-title">
					{`${title} Subscription?`}
				</DialogTitle>
				<DialogContent>
					<DialogContentText id="alert-dialog-description">
						Are you sure you want to {title} your current subscription?
					</DialogContentText>
				</DialogContent>
				<DialogActions>
					<Button onClick={handleClose}>Close</Button>
					<Button
						onClick={() => {
							if (title === "Cancel"){
								handleCancelPlan();
								setOpen(false)
							}
							else{
								handleUpdate(priceId)
								setOpen(false)
							}
						}}
						autoFocus>
						{title}
					</Button>
				</DialogActions>
			</Dialog>
		</React.Fragment>
	)
}
