// Summon env variables
require('dotenv').config()

const restify = require("restify")
const fs      = require("fs")

// Import Route Handler
const catchAllHandler = require("./handlers/endpointModules/catchall").default,
      botInstance     = require("./handlers/endpointModules/botInitializer").default;

// Initialize restify
const server = new restify.createServer({
  name: 'Telegram Bot API / Client-side endpoint service',
  version: '0.1.0'
});

// Initialize restify server with request parser
server.use(restify.plugins.queryParser({
    mapParams: true
}));
server.use(restify.plugins.bodyParser({
    mapParams: true
}));

// Dump that motherfucker in debug mode
if(process.env.NODE_DEBUG == "true")
  server.use((req, res, next) => {
    console.log(`[*] BODY: ${JSON.stringify(req.body)}`)
    next()
  })

// Bot handler
server.use((req, res, next) => {
  if(req.method === 'POST' && req.url === '/botService'){
    res.status(200)
    botInstance.handleUpdate(req.body, res)
  } else {
    next()
  }

  if(process.env.NODE_DEBUG == "true")
    console.log(`[*] RESP: ${JSON.stringify(res.body)}`)
})

// Final catch-all handler
server.get('*', catchAllHandler);
server.post('*', catchAllHandler);

// Set the server to listen on something
if(process.env.NODE_ENV != "production"){
  let devport = process.env.dev_port || 3000
  server.listen(devport)
  console.log(`[*] Development server now listening on port ${devport}...\n[+] API server is now up...`)
} else {
  fs.existsSync(process.env.socket_path) && fs.unlinkSync(process.env.socket_path)

  server.listen(process.env.socket_path, ()=>{
    fs.chmodSync(process.env.socket_path, '777');
    console.log(`[*] Booting up at ${new Date()}\n[+] API server is now up...`);
  })
}
