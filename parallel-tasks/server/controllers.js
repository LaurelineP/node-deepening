const APIServices = require('./services')
const routerServices = new APIServices();

const getHomeController = (req, res) => {
	const response = routerServices.getHome();
	res.json(response);
}

const getBlockingController = (req, res) => {
	const queryCPUTimeMS = req.query.CPUTimeMs; 
	const CPUTimeMs = !queryCPUTimeMS ? null : JSON.parse(queryCPUTimeMS)
	const response = routerServices.getBlocking(CPUTimeMs);
	res.json(response);
}

const getNonBlockingWorkerController = async (req, res) => {
	const queryCPUTimeMS = req.query.CPUTimeMs || 1000;
	const CPUTimeMs = !queryCPUTimeMS ? null : JSON.parse(queryCPUTimeMS)
	const response = await routerServices.getNonBlockingWorker(CPUTimeMs);
	
	res.json(response);
}
module.exports = {
	getHomeController,
	getBlockingController,
	getNonBlockingWorkerController
}