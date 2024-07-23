function convertTimeStampToDate(timestamp) {
	var date = new Date(timestamp * 1000)

	var year = date.getUTCFullYear()
	var month = date.getUTCMonth() + 1
	var day = date.getUTCDate()

	var formattedDate =
		year +
		"-" +
		(month < 10 ? "0" + month : month) +
		"-" +
		(day < 10 ? "0" + day : day)

	return formattedDate
}


export default convertTimeStampToDate