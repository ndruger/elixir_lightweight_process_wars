import "phoenix_html"

import {Socket} from "phoenix"

let socket = new Socket("/socket", {params: {token: window.userToken}})

let chatInput         = $("#chat-input")
let messagesContainer = $("#messages")

socket.connect()
let chan = socket.channel("room:game", {})

chatInput.on("keypress", event => {
  if(event.keyCode === 13){
    console.log(event)
    chan.push("new_msg", {body: chatInput.val()})
    // chan.push("kill", {body: chatInput.val()})
    chatInput.val("")
  }
})

chan.on("new_msg", payload => {
  console.log(payload)
  messagesContainer.append(`<br/>${payload.body}`)
})

chan.join().receive("ok", chan => {
  console.log("Welcome to Phoenix Chat!")
})
