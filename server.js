const http=require('http');
const express=require('express');
const s=require('socket.io');
const { copyFileSync } = require('fs');
const { Socket } = require('dgram');
const app=express();
const server=http.createServer(app);
server.listen(3000);
const io=new s.Server(server);
const rooms = new Set();
let users={};

app.get('/',function(req,res){
    console.log("server formed");
    res.sendFile(__dirname+'/'+'first.html');
})
app.get('/rooms',function(req,res){
    res.sendFile(__dirname+"/"+'second.html')
})
io.of('/rooms').on('connection',function(so){
so.on('name',function(roomNAme)
{
    console.log("room= "+roomNAme);
    rooms.add(roomNAme);
    so.join(roomNAme);
    io.of('/rooms').emit("room-list",[...rooms]);
})
so.on("click",function(roomname){
    if (so.rooms.has(roomname)) {
        so.emit("joined",roomname);
        console.log('Socket belongs to roomA');
      } else {
        console.log('Socket does not belong to roomA');
        so.emit("alert","Socket does not belong to room")
      }

})
so.on("roommsg",function(data){
        io.of('/rooms').to(data.room_name).emit("getmsg",data);


})
})

io.on('connection',function(socket){
    let curNick;
    let curName;
    console.log("connected via socket io");
    socket.on('user',function(data){
        console.log(data.Name);
        console.log(data.nickName);
//curNick=data.nickName;
     curNick=data.nickName;
     curName=users[data.Name];
        if(data.Name===""&&data.nickName==="")
        {
            socket.emit("err","Name And NickName");
        }
        else if(data.Name==="")
        {
            socket.emit("err","User name");
        }
        else if(data.nickName==="")
        {
            socket.emit("err","Nick Name");
        }
        else
        {
            console.log("No error");
            socket.emit("no-err","User Entered");
            users[data.nickName]={name:data.Name,socket:socket};
            console.log(users);
            io.emit("user-list",Object.keys(users));
        }
        socket.on('nickname',function(fusernickname){
            console.log("fusernickname"+fusernickname);
            socket.emit('username',users[fusernickname].name);
        })
        socket.on('msg',function(a){
           // console
            let s=users[a.frindNickName].socket;
            console.log("msg "+a.message);
            console.log("msg f"+a.frindNickName);
            //console.log("msg "+a.message);
            s.emit('fmsg',{msg:a.message,name:data.Name,nick:data.nickName});
        })
    })

   
   
    
})