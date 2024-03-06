
const express = require('express');

const {
	getHomeController,
	getBlockingController,
	getNonBlockingWorkerController
} 	= require('./controllers');
const appRouter 	= express.Router();


appRouter
	.get('/', getHomeController)

	.get('/blocking', getBlockingController)

	.get('/non-blocking-worker', getNonBlockingWorkerController)
	
module.exports = appRouter