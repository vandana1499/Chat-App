const users=[]

const addUser=({id,username,room})=>{

    username=username.trim().toLowerCase()
    room=room.trim().toLowerCase()

    //validate
    if(!username || !room)
    {
        return {
            error:"Username and room are required"
        }
    }

    const existingUser =users.find((user)=>{
        return user.room === room  && user.username === username
    })

    if(existingUser)
    {
        return  {
            error:"Username is in use"
        }
    }


    const user={id,username,room}

    users.push(user)

    return {user}

}

const removeUser=(id)=>{

    const index=users.findIndex((user)=>{
        return user.id===id
    })

    if(index>0)
    {
       
        return users.splice(index,1)[0]
    }

}
    

const getUser=(id)=>{
    const res=users.find((user)=>{
        return user.id==id
    })

   return res
}

const getUsersInRoom =(room)=>{
    
  room=room.trim().toLowerCase()
  const res= users.filter((user)=>{
     
      return user.room===room
      
   })
   return res
}
module.exports={addUser,getUser,getUsersInRoom,removeUser}


