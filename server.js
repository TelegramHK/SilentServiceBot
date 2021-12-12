import { Telegraf } from 'telegraf'
const instance = new Telegraf(process.env.BOT_TOKEN)
const serviceMessageFilter = [
  'new_chat_members',
  'left_chat_member',
  'new_chat_title',
  'new_chat_photo',
  'delete_chat_photo',
  'group_chat_created',
  'migrate_to_chat_id',
  'supergroup_chat_created',
  'channel_chat_created',
  'migrate_from_chat_id',
  'pinned_message'
]

instance.on(serviceMessageFilter, ctx => {
  ctx.deleteMessage()
    .catch(e => {
      if (
        e.response.error_code === 400
          && e.response.description === 'Bad Request: message to delete not found'
      ) {
        console.error(`[ERROR] Message not found. (msgid ${e.on.payload.message_id} at chat ${e.on.payload.chat_id})`)
      } else {
        console.error(`[ERROR] Unhandled error occured: `, e)
      }
    })
})

instance.launch({
  polling: {
    allowedUpdates: ['message']
  }
})
