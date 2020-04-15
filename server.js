// Summon env variables
require('dotenv').config()

const restify = require("restify")
const fs      = require("fs")

// Import Route Handler
const catchAllHandler = require("./handlers/endpointModules/catchall").default

// Bot functions -- START
  import Telegraf from "telegraf"
  const instance = new Telegraf(process.env.BOT_TOKEN)
  const serviceMessageFilter = ["new_chat_members", "left_chat_member", "new_chat_title", "new_chat_photo", "delete_chat_photo", "group_chat_created", "migrate_to_chat_id", "supergroup_chat_created", "channel_chat_created", "migrate_from_chat_id", "pinned_message"]


  // Use localtunnel.me when in development envrionment
  if (process.env.NODE_ENV != "production")
    instance.telegram.setWebhook(`https://${process.env.localtunnel_name}.localtunnel.me/botService`)
  else if(process.env.NODE_ENV == "production")
    instance.telegram.setWebhook(`https://bot-${process.env.prod_subdomain}.telegram.hk/botService`, {source: process.env.prod_certpath ? process.env.prod_certpath : ""}, 100, ["message"])

  instance.on(serviceMessageFilter, ctx=>{
    ctx.deleteMessage()
  })

  // Instance Error Catching
  instance.catch((err) => {
    console.log(err) // TODO: Refactor and produce a better error catcher module
  })
// Bot functions -- END

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
server.use(async (req, res, next) => {
  if(req.method === 'POST' && req.url === '/botService'){
    await instance.handleUpdate(req.body, res)
    res.status(200)
  } else {
    next()
  }

  if(process.env.NODE_DEBUG == "true")
    console.log(`[*] RESP: ${JSON.stringify(res.status)}`)
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
