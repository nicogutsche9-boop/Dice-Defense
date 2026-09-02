const http = require('http');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const WebSocket = require('ws');

const PORT = process.env.PORT || 8080;
const rooms = new Map();

const DICE = {
  bolt:{damage:32,rate:900},
  frost:{damage:18,rate:700},
  venom:{damage:24,rate:1000},
  cannon:{damage:55,rate:1500},
  laser:{damage:42,rate:1100},
  chrono:{damage:12,rate:600}
};
const ENEMIES = {
  grunt:{hp:120,speed:1.0,reward:8},
  runner:{hp:70,speed:1.65,reward:10},
  tank:{hp:520,speed:.55,reward:22},
  shield:{hp:260,speed:.8,reward:18},
  boss:{hp:9000,speed:.38,reward:250}
};

function roomCode(){
  let c;
  do c=crypto.randomBytes(3).toString('hex').toUpperCase().match(/.{1,3}/g).join('-'); while(rooms.has(c));
  return c;
}
function snapshot(r){
  return {
    room:r.code, tick:r.tick, wave:r.wave, lives:r.lives, gold:r.gold,
    energy:r.energy, running:r.running, boss:r.boss,
    players:[...r.players.values()].map(p=>({id:p.id,name:p.name,ready:p.ready,score:p.score})),
    enemies:[...r.enemies.values()].map(e=>({...e})),
    towers:[...r.towers.values()].map(t=>({...t}))
  };
}
function send(ws,type,data={}){if(ws.readyState===WebSocket.OPEN)ws.send(JSON.stringify({type,...data}));}
function broadcast(r,type,data={}){const msg={type,...data};for(const p of r.players.values())send(p.ws,type,data);}
function makeEnemy(r,type){
  const base=ENEMIES[type];
  const scale=1+(r.wave-1)*.085;
  const id=crypto.randomUUID();
  r.enemies.set(id,{id,type,hp:Math.round(base.hp*scale),maxHp:Math.round(base.hp*scale),x:0,y:0,progress:0,speed:base.speed,reward:base.reward});
}
function spawnWave(r){
  const count=Math.min(8+Math.floor(r.wave*1.5),38);
  for(let i=0;i<count;i++){
    const roll=Math.random();
    const type=r.wave%5===0 && i===count-1?'boss':roll<.2?'runner':roll<.35?'tank':roll<.5?'shield':'grunt';
    makeEnemy(r,type);
  }
  r.boss=r.wave%5===0;
}
function damageEnemy(r,id,amount,playerId){
  const e=r.enemies.get(id); if(!e)return;
  e.hp-=Math.max(1,amount);
  const p=r.players.get(playerId); if(p)p.score+=Math.round(amount);
  if(e.hp<=0){
    r.gold+=e.reward; r.energy=Math.min(200,r.energy+8);
    r.enemies.delete(id);
  }
}
function gameTick(r){
  if(!r.running)return;
  r.tick++;
  // Server-authoritative enemy movement.
  for(const e of r.enemies.values()){
    e.progress += e.speed*.0017;
    e.x=Math.min(100,e.progress*100); e.y=35+Math.sin(e.progress*6)*12;
    if(e.progress>=1){r.enemies.delete(e.id);r.lives-=e.type==='boss'?5:1;}
  }
  // Server-authoritative tower targeting and damage.
  for(const t of r.towers.values()){
    t.cooldown=Math.max(0,(t.cooldown||0)-50);
    if(t.cooldown>0)continue;
    const targets=[...r.enemies.values()].filter(e=>e.progress>=t.rangeStart&&e.progress<=t.rangeEnd);
    targets.sort((a,b)=>b.progress-a.progress);
    if(targets[0]){
      damageEnemy(r,targets[0].id,t.damage,t.owner);
      t.cooldown=t.rate;
    }
  }
  if(r.enemies.size===0){
    if(r.lives>0){r.wave++; if(r.wave>50){r.running=false;r.result='VICTORY'}else spawnWave(r);}
  }
  if(r.lives<=0){r.lives=0;r.running=false;r.result='DEFEAT'}
  if(r.tick%2===0)broadcast(r,'state',{state:snapshot(r)});
}
function createRoom(){
  const r={code:roomCode(),players:new Map(),towers:new Map(),enemies:new Map(),tick:0,wave:0,lives:20,gold:500,energy:100,running:false,boss:false,result:null,timer:null};
  rooms.set(r.code,r);return r;
}
function addPlayer(r,ws,name){
  if(r.players.size>=4)throw new Error('Raum ist voll.');
  const id=crypto.randomUUID();
  r.players.set(id,{id,ws,name:name||'Player',ready:false,score:0});
  ws.room=r.code;ws.clientId=id;return id;
}
function startGame(r){
  if(r.running)return;
  r.running=true;r.result=null;r.wave=1;r.lives=20;r.gold=500;r.energy=100;r.tick=0;r.enemies.clear();spawnWave(r);
  clearInterval(r.timer);r.timer=setInterval(()=>gameTick(r),50);
  broadcast(r,'game_started',{state:snapshot(r)});
}
const server=http.createServer((req,res)=>{
  let u=req.url.split('?')[0];if(u==='/')u='/index.html';
  const base=path.join(__dirname,'public'),file=path.join(base,u);
  if(!file.startsWith(base))return res.writeHead(403).end();
  fs.readFile(file,(err,data)=>{if(err)return res.writeHead(404).end('Not found');const ext=path.extname(file);const types={'.html':'text/html; charset=utf-8','.js':'text/javascript','.css':'text/css'};res.writeHead(200,{'Content-Type':types[ext]||'application/octet-stream'});res.end(data);});
});
const wss=new WebSocket.Server({server});
wss.on('connection',ws=>{
  ws.on('message',raw=>{
    let m;try{m=JSON.parse(raw)}catch{return}
    try{
      if(m.type==='create_room'){const r=createRoom();addPlayer(r,ws,m.name);send(ws,'welcome',{clientId:ws.clientId});send(ws,'room_created',{room:r.code,state:snapshot(r)});}
      else if(m.type==='join_room'){const r=rooms.get((m.room||'').toUpperCase());if(!r)throw new Error('Raum nicht gefunden.');addPlayer(r,ws,m.name);send(ws,'welcome',{clientId:ws.clientId});broadcast(r,'room_joined',{room:r.code,state:snapshot(r)});}
      else if(m.type==='ready'){const r=rooms.get(ws.room);const p=r?.players.get(ws.clientId);if(p)p.ready=!!m.value;if(r)broadcast(r,'state',{state:snapshot(r)});}
      else if(m.type==='start_game'){const r=rooms.get(m.room||ws.room);if(!r)throw new Error('Keine Lobby.');startGame(r);}
      else if(m.type==='place_tower'){
        const r=rooms.get(ws.room);if(!r||!r.running)throw new Error('Kein laufender Run.');
        if(r.towers.size>=32)throw new Error('Tower-Limit erreicht.');
        const kind=DICE[m.kind]?m.kind:'bolt';
        if(r.energy<30)throw new Error('Nicht genug Energie.');
        r.energy-=30;
        const d=DICE[kind],id=crypto.randomUUID();
        r.towers.set(id,{id,kind,owner:ws.clientId,level:1,damage:d.damage,rate:d.rate,cooldown:0,rangeStart:0,rangeEnd:1,x:Number(m.x)||50,y:Number(m.y)||50});
        broadcast(r,'state',{state:snapshot(r)});
      }
      else if(m.type==='fuse'){
        const r=rooms.get(ws.room);if(!r)throw new Error('Keine Lobby.');
        const a=r.towers.get(m.a),b=r.towers.get(m.b);
        if(!a||!b||a.owner!==ws.clientId||b.owner!==ws.clientId)throw new Error('Fusion nicht möglich.');
        a.level++;a.damage=Math.round(a.damage*1.55);a.rate=Math.max(250,Math.round(a.rate*.9));r.towers.delete(b.id);broadcast(r,'state',{state:snapshot(r)});
      }
      else if(m.type==='ability'){
        const r=rooms.get(ws.room);if(!r||!r.running)throw new Error('Kein laufender Run.');
        for(const e of r.enemies.values())e.hp-=120;
        broadcast(r,'ability',{kind:'overcharge',by:ws.clientId});
      }
    }catch(e){send(ws,'error',{message:e.message})}
  });
  ws.on('close',()=>{const r=rooms.get(ws.room);if(!r)return;r.players.delete(ws.clientId);if(!r.players.size){clearInterval(r.timer);rooms.delete(r.code)}else broadcast(r,'state',{state:snapshot(r)})});
});
server.listen(PORT,()=>console.log(`Dice Defense V7 authoritative server on http://localhost:${PORT}`));
