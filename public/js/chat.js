
const socket = io()
// socket.on('countupdated',(count)=>{
//     console.log("count updated",count)
// })

// document.querySelector("#incr-btn").addEventListener('click',()=>{
//     socket.emit('increment')
// })


const $messageForm = document.querySelector('#message-form')
const $messageFormInput = $messageForm.querySelector('input')
const $messageFormButton = $messageForm.querySelector('button')
const $sendLocation = document.querySelector('#send-location')
const $messages = document.querySelector('#messages')

//templates

const messageTemplate = document.querySelector('#message-template').innerHTML
const locationTemplate = document.querySelector('#location-template').innerHTML
const sidebarTemplate=document.querySelector('#sidebar-template').innerHTML
//querystring
const {username,room}=Qs.parse(location.search,{
    ignoreQueryPrefix:true
})

const autoscroll=()=>{

        //new message element
        const $newMessage=$messages.lastElementChild

        //height of new message
        const newMessageStyles=getComputedStyle($newMessage)
       const newmessagemargin=parseInt(newMessageStyles.marginBottom)
        const newMessageHeight=$newMessage.offsetHeight+newmessagemargin

        //visible height

        const visibleHeight=$messages.offsetHeight
        
        //height of message container

        const containerHeight=$messages.scrollHeight

        //how far have i scrolled

        const scrollOffset=$messages.scrollTop+visibleHeight

        if(containerHeight-newMessageHeight <= scrollOffset)
        {
            $messages.scrollTop=$messages.scrollHeight
        }

      
}
socket.on("message", ({username,text,createdAt}) => {

    const html = Mustache.render(messageTemplate,
        {
            username:username,
            message: text,
            createdAt: moment(createdAt).format('h:mm a')
        })
    $messages.insertAdjacentHTML('beforeend', html)
    autoscroll()
})

socket.on("Location-message", ({username,url,createdAt}) => {
    const html = Mustache.render(locationTemplate, { username,url,
         createdAt: moment(createdAt).format("h:mm a") })
    $messages.insertAdjacentHTML('beforeend', html)
    autoscroll()
})
socket.on("roomData",({room,users})=>{
   const html=Mustache.render(sidebarTemplate,{room,users})
   document.querySelector('#sidebar').innerHTML=html

})



$messageForm.addEventListener('submit', (e) => {
    e.preventDefault()
    $messageFormButton.setAttribute('disabled', "disabled")
    // console.log(e.target.elements.message)
    const message = e.target.elements.message.value
    socket.emit("sendMessage", message, (error) => {

        $messageFormButton.removeAttribute('disabled')
        $messageFormInput.value = ""
        $messageFormInput.focus()
        if (error) {
            return console.log(error)
        }
        console.log("Message delivered")
    })
    e.target.elements.message.value = ""

})

$sendLocation.addEventListener('click', () => {


    if (!navigator.geolocation) {
        alert("Geolocation not supported by your browser")
    }
    else {
        $sendLocation.setAttribute('disabled', 'disabled')
        navigator.geolocation.getCurrentPosition((position) => {


            socket.emit("sendLocation",
                {
                    latitude: position.coords.latitude,
                    longitude: position.coords.longitude
                }, () => {
                    console.log("Location shared!")
                    $sendLocation.removeAttribute('disabled')
                })

        })
    }
})


socket.emit('join',{username,room},(error)=>{

    if(error)
    {
        alert(error)
        location.href="/"
    }

})

