# TASKS IN PARALLEL
Needs: asking the server to process multiple things in parallels
	Example:
		- Node main thread / process is to mount a server for a frontend
		- However, when the client need to do any CPU intensive tasks
		( meaning running blocking code synchronously - which have the 
		main node process to focus on that mainly ==> such as processing 
		a while loop )

Solutions: 
	Creating new thread(s) to decouple the main thread from those CPU intensive tasks
		- options ( ordered by resources intensive needs )
			1. workers: worker_thread is native to node, and allows to have a whole new
			thread to build for those intensive tasks for instance
				- needs to be an async function
				- needs to have a promise to resolve
				- once resolve > it returns to the main thread
				which does not block any of the first threads
				Allows to offload work to a separate thread avoiding blocking the maine one.
				Note: communication between thread can be tricky as it may need to be passed
					via messages.
				Worker threads have their own event loops and memory space --> can increase memory usage

			2. child process: also native to node, but much expensive than doing a worker
				A chile process runs separately from the main process and can execute any command
				in a new system process.
				Useful for tasks that require to run a command in a shell or executing different
				program
				Child process can communicate with the main thread via IPC ( Inter-Process Communication)
				More resource-intensive than creating a new thread and IPC can be more complex

			3. pm2: process manager - allows to monitor and manage the load for a given project by
				scaling horizontally creating clusters.
				Clusters here are instance of your app multiplied, this allows pm2 to offload some work
				by distributing request to x instance == it is a load balancer approach

			----------------

			4. offload using services - will not be used here
				- using serverless architecture
				- using microservices architecture 
				- jop queue: processing task in back ground


## Stack involved
	- node native libraries:
		- express to build a server
		- postman to unitary test endpoints
		- worker_thread,
		- process child,
		- pm2 to monitor the work load,
		- artillery to test with amount of workload




# Process
##  Express Server creation
- installed express
- instantiate express: `const app = express()`
- mount the server:
```js
app.listen(8080, () => {
	console.log( 'App listening on port 8080' )}
)
```

## Add a server's router
- created a router file
- create the router to export
```js
const { Router } = require('express')
const router = Router();

router
	.get('/', <controller>)
```

## Add server's services
- Services for the app are created using a class
	- getHome: to return response on '/' request
	- getBlocking: to return response on '/blocking

- Adjusted the router so we instantiate the services
and being able to dispose of its methods.

## Add a middleware to log responses
- created a file `log-returned-response.middleware.js`
- created a function to intercept the response.
Logging:
	- get the path from req
	- gets the buffer data to json 
		`res.end`: is the function express triggers
		- we need to store the original
		- and override it so it is aware of this middleware
```js
		const logReturnedResponse = (req, res, next) => {

		}
		const executeOriginalResEnd = res.end
		res.end = function(data, encoding, callback){
			console.info('\n\n\n', req.path)
			console.info('\t ==>', JSON.parse(data.toString('utf8')))
		}
		next();
```
## Add a blocking endpoint and its logic
- while loop will block the main thread
- we will path a query parameter expressing the delay
- using the while subtract current moment with the delay passed
as CPUTimeMs : until it is done we loop over it

[ see code ](./server/services.js)

<video
	src="https://github.com/LaurelineP/node-deepening/assets/32878345/9db20e63-745d-434c-b7d5-f195a8934c84" alt="Observing a blocking request"
/>


### Scenarios / Project navigation
- `pnpm start`: launch the server
- use postman to test the command
	- create a request for the couple of endpoints
		- `/`: as parallel lightweight ref
		- `/blocking?CPUTimeMs=10000`: as the blocking endpoint - ref for blocking scenario
	- trigger the `/` request - have a ref on how much time it takes
	- trigger the `/blocking` request: request will take the amount of ms you've provide ( here 10sec )
	- as soon as possible, right after triggering the previous 
	request: trigger the `/` request: check the request time response which increased


## Add a non blocking endpoint
Worker threads will allow to delegate a work to another thread
than the main the server is using - preventing the server to 
be blocked by such request

### Objective:
Creating a worker thread that will handle the very same APIServices 
blocking method but within the worker itself;
Expected result: being able
	- to trigger the non-blocking endpoint > which will
	execute the blocking endpoint service === 10sec blocking process
	- meanwhile ( before the 10sec ), triggering the `/` endpoint should
	NOT be blocked and we should get an answer even if the non-blocking endpoint
	did not finish its 10sec

### Creating a worker thread
- create a workers folder
- create a `config.js` [file](./server/workers/config.js): to get the worker file 
```js
/** A dynamic version to get the file from this current directory ( workers )
 * so it remains constant in resolving the path 
 **/
const resolverWorkerFile = file => `${__dirname}/{file}`;
```
- create your worker file: Ex here: [nonBlocking.worker.js](./server/workers/nonBlocking.worker.js)
```js
/**
 * - Worker: will allows to create a worker
 * - workerData: is the worker data ( data we want to receive )
 * - parentPort: a way to communicate back to the original 
 * thread context ( main one here )
 * */
const { Worker, parentPort, workerData } = require('worker_threads');

/**
 * APIServices: class for the services used ( logic )
*/
const APIServicesClass = require('<service-path>');
const APIServices = new APIServicesClass();

async function run(){
	// Gets your logic - here we want the blocking API services
	// Note: it cannot interfere with the endpoint itself
	// Logic could be imported from somewhere else 

	APIServices.getNonBlockingWorker(workerData);

	// returning the result to the main thread
	parentPort.postMessage(workerData);

	// Call next
	next();
}

```

### Defining the worker service
Like mentioned, the worker cannot interact with the network or send HTTP responses.
```js
// APIServices file
APIServices.getNonBlockingWorker = (CPUTimeMs) => {
	new Promise(( resolve, reject ) => {

		const nonBlockingWorker = new Worker( resolveWorkerFile('non-blocking.worker.js'), {
			workerData : {
				CPUTimeMs
			}
		})

		nonBlockingWorker.on('message', resolve);
		nonBlockingWorker.on('error', reject);
		nonBlockingWorker.on('exit', (exitCode) => {
			if( exitCode !== 0 ){
				reject(new Error(`Worker stopped with exit code ${code}`));
			}
		})
	})
}
```
<video
	src="https://github.com/LaurelineP/node-deepening/pull/1/files#diff-8d0f0e450198769d05ed8159f413377d399bd646fbfe60e7e75ae4e05a1f4ed0" alt="Observing a non blocking request using workers"
/>
