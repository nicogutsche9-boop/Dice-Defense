const http = require('http');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const WebSocket = require('ws');

const PORT = process.env.PORT || 8080;
const rooms = new Map();

function code(){
  return crypto.randomBytes(3).toString('hex').toUpperCase().match(/.{1,3}/g).join('-');
}
function snapshot(room){
  return {
    room: room.code,
    wave: room.wave,
    lives: room.lives,
    running: room.running,
    players: [...room.players.values()].map(p=>({id:p.id,name:p.name,ready:p.ready}))
  };
}
function broadcast(room, msg){
  const raw=JSON.stringify(msg);
  for(const p of room.players.values()) if(p.ws.readyState===WebSocket.OPEN) p.ws.send(raw);
}
function getRoom(code){return rooms.get(code);}
function newRoom(){
  let c;
  do c=code(); while(rooms.has(c));
  const room={code:c,wave:1,lives:20,running:false,players:new Map(),timer:null};
  rooms.set(c,room);
  return room;
}
function join(room, ws, name){
  if(room.players.size>=4) throw new Error('Raum ist voll.');
  const id=crypto.randomUUID();
  room.players.set(id,{id,ws,name:name||'Player',ready:false});
  ws.room=room.code; ws.clientId=id;
  return id;
}
function start(room){
  if(room.running)return;
  room.running=true; room.wave=1; room.lives=20;
  clearInterval(room.timer);
  room.timer=setInterval(()=>{
    if(!room.running)return;
    room.wave++;
    if(room.wave>=50){room.running=false;clearInterval(room.timer);}
    broadcast(room,{type:'state',state:snapshot(room)});
  },6500);
  broadcast(room,{type:'game_started',state:snapshot(room)});
}

const server=http.createServer((req,res)=>{
  let reqPath=req.url.split('?')[0];
  if(reqPath==='/')reqPath='/index.html';
  const file=path.join(__dirname,'public',reqPath);
  if(!file.startsWith(path.join(__dirname,'public'))) return res.writeHead(403).end();
  fs.readFile(file,(err,data)=>{
    if(err)return res.writeHead(404).end('Not found');
    const ext=path.extname(file);
    const types={'.html':'text/html; charset=utf-8','.js':'text/javascript','.css':'text/css'};
    res.writeHead(200,{'Content-Type':types[ext]||'application/octet-stream'});
    res.end(data);
  });
});

const wss=new WebSocket.Server({server});
wss.on('connection',ws=>{
  ws.on('message',raw=>{
    let m; try{m=JSON.parse(raw)}catch{return}
    try{
      if(m.type==='create_room'){
        const room=newRoom(); join(room,ws,m.name);
        ws.send(JSON.stringify({type:'welcome',clientId:ws.clientId}));
        ws.send(JSON.stringify({type:'room_created',room:room.code,state:snapshot(room)}));
      } else if(m.type==='join_room'){
        const room=getRoom((m.room||'').toUpperCase());
        if(!room)throw new Error('Raum nicht gefunden.');
        join(room,ws,m.name);
        ws.send(JSON.stringify({type:'welcome',clientId:ws.clientId}));
        broadcast(room,{type:'room_joined',room:room.code,state:snapshot(room)});
      } else if(m.type==='start_game'){
        const room=getRoom(m.room||ws.room);
        if(!room)throw new Error('Keine Lobby.');
        start(room);
      } else if(m.type==='ready'){
        const room=getRoom(ws.room); if(!room)return;
        const p=room.players.get(ws.clientId); if(p)p.ready=!!m.value;
        broadcast(room,{type:'state',state:snapshot(room)});
      }
    }catch(e){ws.send(JSON.stringify({type:'error',message:e.message}))}
  });
  ws.on('close',()=>{
    const room=getRoom(ws.room);
    if(!room)return;
    room.players.delete(ws.clientId);
    if(room.players.size===0){clearInterval(room.timer);rooms.delete(room.code)}
    else broadcast(room,{type:'state',state:snapshot(room)});
  });
});

server.listen(PORT,()=>console.log(`Dice Defense V6 server running on http://localhost:${PORT}`));
