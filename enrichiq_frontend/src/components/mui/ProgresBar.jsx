import { useState, useEffect } from "react"
import LinearProgress from "@mui/material/LinearProgress"

// eslint-disable-next-line react/prop-types
const ProgressBar = ({ duration }) => {
	const [progress, setProgress] = useState(0)

	useEffect(() => {
		const interval = setInterval(() => {
			setProgress((prevProgress) => {
				const newProgress = prevProgress + 1
				return newProgress >= 80 ? 80 : newProgress
			})
		}, duration / 80)

		return () => clearInterval(interval)
	}, [duration])

	return (
		<LinearProgress
			variant="determinate"
			value={progress}
		/>
	)
}

export default ProgressBar
