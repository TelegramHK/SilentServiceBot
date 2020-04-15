// Summon env variables
require('dotenv').config()

import Telegraf from "telegraf"
const instance = new Telegraf(process.env.BOT_TOKEN)
const serviceMessageFilter = ["new_chat_members", "left_chat_member", "new_chat_title", "new_chat_photo", "delete_chat_photo", "group_chat_created", "migrate_to_chat_id", "supergroup_chat_created", "channel_chat_created", "migrate_from_chat_id", "pinned_message"]

instance.on(serviceMessageFilter, ctx=>{
  ctx.deleteMessage()
})

// Instance Error Catching
instance.catch((err) => {
  console.log(err) // TODO: Refactor and produce a better error catcher module
})

instance.launch()