const { parentPort, workerData } = require('worker_threads');
const APIServicesClass = require('../services');
const APIServices = new APIServicesClass();

async function run (){
	console.info('Worker thread data', workerData, parentPort)
	const result = await APIServices.getBlocking(workerData.CPUTimeMs);

	// pass back to the main thread
	parentPort.postMessage(workerData)
}

run();