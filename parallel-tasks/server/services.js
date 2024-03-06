const { Worker, workerData } = require('worker_threads');
const resolveWorkerFilePath = require('./workers/config');
class APIServices {
	getHome(){
		return {
			message: 'Home sweet home'
		}
	}
	getBlocking(CPUTimeMs = 1000){
		try {
			const startTime = Date.now();
			/**
			 * Synchronous blocking code - using while
			 * 
			 */
			while( Date.now() - startTime < CPUTimeMs ){}
			return {
				message: '/blocking route',
				data: CPUTimeMs
			}
		} catch( error ) {
			return error
		}
	}

	async getNonBlockingWorker(CPUTimeMs = 1000){
		return new Promise((resolve, reject) => {
			const nonBlockingWorker = new Worker(
				resolveWorkerFilePath('nonBlocking.worker.js'),
				{
					workerData: {
					CPUTimeMs
					}
				}
			)
			nonBlockingWorker.on('message', resolve);
			nonBlockingWorker.on('error', reject);
			nonBlockingWorker.on('exit', (code) => {
			  if (code !== 0) {
				reject(new Error(`Worker stopped with exit code ${code}`));
			  }
			});
		})
		
	}
}




module.exports = APIServices;