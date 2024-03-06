const express 	= require('express');
const app 		= express();
const appRouter = require('./router');
const {logResponseMiddleware} = require('./middlewares')




const PORT = 8080;

app.use(logResponseMiddleware);
app.use('/', appRouter);


app.listen(PORT, () => {
	console.info(`App listening on port ${PORT}`)
})