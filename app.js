const Koa = require('koa');

const app = new Koa();

const Router = require('koa-router');
const Body = require('koa-body');
const Logger = require('koa-logger');
const ResponseTime = require('koa-response-time');

// ---------- Connect Middlewares ---------- //
app.use(ResponseTime());
app.use(Logger());
app.use(Body({
  extendTypes: {
    json: ['application/json'], // will parse application/x-javascript type body as a JSON string
  },
  parsedMethods: ['POST', 'PUT', 'PATCH', 'DELETE'],
}));

// ---------- Set Header ------------------- //
app.use(async (ctx, next) => {
  ctx.set('Access-Control-Allow-Origin', '*');
  ctx.set('Access-Control-Allow-Methods', 'GET, POST, DELETE, PUT');
  ctx.set('Access-Control-Allow-Headers', 'Origin, Accept, X-Requested-With, Content-Type, Authorization');

  if (ctx.method === 'OPTIONS') {
    ctx.status = 204;
  } else {
    await next();
  }
});

// ------------ Load Libraries ----------- //
const mongooseConnect = require('./libs/mongoose-connect');

// ------------ Error Handler ------------ //
app.use(async (ctx, next) => {
  try {
    await next();
  } catch (err) {
    console.log('Error handler', err);
    ctx.status = err.statusCode || 500;
    ctx.body = { errors: err.errors, message: err.message };
  }
});

// ---------- Mongoose connect ---------- //
mongooseConnect();

const mainRouter = new Router();

// ------------- Connection Test -------- //
mainRouter.get('/', async (ctx) => {
  ctx.status = 200;
  ctx.body = 'Connected';
});

// ------------ Load Routers ------------ //
const itemRouter = require('./api/routes/item-router');
const userRouter = require('./api/routes/user-router');
const partnerUsersRouter = require('./api-partner/routes/user-router');

// ---------- Connect Routers ---------- //
app.use(mainRouter.routes());
app.use(itemRouter.routes());
app.use(userRouter.routes());
app.use(partnerUsersRouter.routes());

module.exports = app;
