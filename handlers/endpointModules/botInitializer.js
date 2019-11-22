import { resolve } from "path"
import fs from "fs"

import Telegraf from "telegraf"
import TelegrafI18n from 'telegraf-i18n'
const instance = new Telegraf(process.env.BOT_TOKEN)
// Import instance modules

// Import instance modules
import cmdHandler_start from "../botModules/commands/start"
import cmdHandler_help from "../botModules/commands/help"
import cmdHandler_stop from "../botModules/commands/stop"
import serviceMessageHandler from "../botModules/serviceMessageHandler"

const serviceMessageFilter = ["new_chat_members", "left_chat_member", "new_chat_title", "new_chat_photo", "delete_chat_photo", "group_chat_created", "migrate_to_chat_id", "supergroup_chat_created", "channel_chat_created", "migrate_from_chat_id", "pinned_message"]

// Initialize i18n module
const i18n = new TelegrafI18n({
  defaultLanguage: 'en',
  allowMissing: false, // Default true
  directory: resolve(__dirname, '../../locales')
})

// Instance Error Catching
instance.catch((err) => {
  console.log(err) // TODO: Refactor and produce a better error catcher module
})

// Register module with corresponding event -- START

  // Register i18n module into response context beofore module registration
  instance.use(i18n.middleware())

  // Default Telegram commands
  instance.command('start', cmdHandler_start)
  instance.command('help', cmdHandler_help)
  instance.command('stop', cmdHandler_stop)

  // Service Message Handler
  instance.on(serviceMessageFilter, serviceMessageHandler)

// Register module with corresponding event -- END

// Use localtunnel.me when in development envrionment
if (process.env.NODE_ENV != "production")
  instance.telegram.setWebhook(`https://${process.env.localtunnel_name}.localtunnel.me/botService`)
else if(process.env.NODE_ENV == "production")
  instance.telegram.setWebhook(`https://bot-${process.env.prod_subdomain}.telegram.hk/botService`, fs.readFileSync(process.env.prod_certpath), 100, ["message"])

// restify handler for bot functionality
const botInstance = (req, res, next)=>{
  // Handover restify request body to Telegraf
  instance.handleUpdate(req.body)

  // Configure response context
  res.status(200)
  res.json({"result": "OK"})
  next()
}

export default botInstance