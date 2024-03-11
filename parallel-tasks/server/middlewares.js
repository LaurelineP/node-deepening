
const logResponseMiddleware = (req, res, next) => {
	const executeOriginalEnd = res.end;
	res.end = function(data, encoding, callback ) {
		const endpointAndStatus = `${req.path} with status ${res.statusCode}`
		const contentString = data.toString('utf8')
		const content = contentString.includes('<')
			? 'Error returned in HTML'
			: JSON.parse(contentString)
		console.info('\n\n\n✨',endpointAndStatus)
		console.info('\t =>', content)
		executeOriginalEnd.call(this, data, encoding, callback )
	}
	next()
}

module.exports = {
	logResponseMiddleware
};
