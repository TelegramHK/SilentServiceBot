const commandHelp = (ctx)=>{
  ctx.deleteMessage()
  if(process.env.NODE_DEBUG == "true")
    console.log(`[*] deleted ${JSON.stringify(ctx)}`)
}

export default commandHelp