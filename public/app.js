const $=s=>document.querySelector(s),$$=s=>[...document.querySelectorAll(s)];
let cfg={prov:'',model:'',char:'steve',vol:.7,music:true,chaos:false,sys:'',temp:1,maxt:2048,reas:'medium',dim:'nether',stream:true,json:false,bsearch:false,cint:false},screen='boot',msgs=[],busy=false,abortC,xp=0,srv={providers:{},models:{}};
try{Object.assign(cfg,JSON.parse(localStorage.getItem('mind')||'{}'))}catch(e){} delete cfg.key;
const save=()=>{try{localStorage.setItem('mind',JSON.stringify(cfg))}catch(e){}};
// ---- audio (all synthesized live) ----
let AC,MG;const ac=()=>{if(!AC){AC=new(window.AudioContext||window.webkitAudioContext)();MG=AC.createGain();MG.gain.value=cfg.vol;MG.connect(AC.destination)}if(AC.state==='suspended')AC.resume();return AC};
function tone(f,d=.12,ty='square',v=.1,to=f,dl=0){if(!cfg.vol)return;const a=ac(),t=a.currentTime+dl,o=a.createOscillator(),g=a.createGain();o.type=ty;o.frequency.setValueAtTime(f,t);o.frequency.exponentialRampToValueAtTime(Math.max(20,to),t+d);g.gain.setValueAtTime(v,t);g.gain.exponentialRampToValueAtTime(.001,t+d);o.connect(g).connect(MG);o.start(t);o.stop(t+d+.05)}
function noise(d=.3,v=.2,f0=2000,f1=200,ty='lowpass',dl=0){if(!cfg.vol)return;const a=ac(),t=a.currentTime+dl,n=a.sampleRate*d|0,b=a.createBuffer(1,n,a.sampleRate),x=b.getChannelData(0);for(let i=0;i<n;i++)x[i]=Math.random()*2-1;const s=a.createBufferSource(),fl=a.createBiquadFilter(),g=a.createGain();s.buffer=b;fl.type=ty;fl.frequency.setValueAtTime(f0,t);fl.frequency.exponentialRampToValueAtTime(f1,t+d);g.gain.setValueAtTime(v,t);g.gain.exponentialRampToValueAtTime(.001,t+d);s.connect(fl).connect(g).connect(MG);s.start(t)}
const S={click:()=>{noise(.05,.3,1800,300);tone(150,.06,'square',.08,90)},tick:()=>tone(300+Math.random()*100,.02,'square',.02),
mine:()=>{noise(.09,.35,2600,500);tone(190+Math.random()*60,.08,'triangle',.25,95)},brk:()=>{noise(.35,.5,3200,200);tone(120,.25,'sawtooth',.14,55)},
hmm:()=>{tone(190,.35,'sawtooth',.09,150);tone(230,.3,'sawtooth',.08,170,.16)},cluck:()=>{tone(720,.05,'square',.07,500);tone(620,.06,'square',.07,450,.09)},
orb:()=>tone(1100+Math.random()*500,.12,'sine',.1,1900),up:()=>[523,659,784,1047].forEach((f,i)=>tone(f,.28,'square',.07,f,i*.1)),
chest:()=>{tone(160,.5,'sawtooth',.06,320);noise(.2,.15,900,300,'lowpass',.4)},ender:()=>{tone(1000,.5,'sine',.1,260);tone(500,.4,'triangle',.06,900,.1)},
portal:()=>{noise(2.6,.45,180,1700);tone(70,2.6,'sine',.4,220);for(let i=0;i<6;i++)tone(300+i*90,.5,'sine',.05,150+i*60,i*.35)}};
setInterval(()=>{if(!AC||!cfg.music||!cfg.vol||screen==='boot')return;if(screen==='chat'&&cfg.dim!=='over'){const n=[55,65,73,82][Math.random()*4|0];tone(n,4,'sine',.12);if(Math.random()<.5)noise(.5,.08,300,80)}else{const n=[262,294,330,392,440,523][Math.random()*6|0];tone(n,3.5,'triangle',.06);tone(n*2,2.5,'sine',.02,n*2,.02)}},2600);
// ---- sprites ----
function spr(rows,pal){const c=document.createElement('canvas');c.width=rows[0].length;c.height=rows.length;const x=c.getContext('2d');rows.forEach((r,y)=>[...r].forEach((k,i)=>{if(pal[k]){x.fillStyle=pal[k];x.fillRect(i,y,1,1)}}));c.className='sp';return c}
const ST=['BBBBBBBB','BBBBBBBB','BssssssB','swussuws','ssssssss','sssmmsss','sccccccs','sccccccs','sccccccs','sccccccs','sccccccs','ppppPPPP','ppppPPPP','ppppPPPP','ppppPPPP','kkkkkkkk'],SP={B:'#4a2e18',s:'#c68a5e',w:'#fff',u:'#3a4ad8',m:'#8a5a3a',c:'#2aa9b8',p:'#3a3aa0',P:'#2a2a7a',k:'#555'};
const EN=['kkkkkkkk','kkkkkkkk','kkkkkkkk','kMMkkMMk','kkkkkkkk','kkkkkkkk','kkkkkkkk','kkkkkkkk','..kkkk..','k.kkkk.k','k.kkkk.k','k.kkkk.k','k.kkkk.k','k.kkkk.k','k.kkkk.k','..kkkk..','..k..k..','..k..k..','..k..k..','..k..k..','..k..k..','..k..k..','..k..k..','..K..K..'],EP={k:'#171717',K:'#0b0b0b',M:'#e070ff'};
const body=k=>k==='steve'?spr(ST,SP):spr(EN,EP),head=k=>k==='steve'?spr(ST.slice(0,8),SP):spr(EN.slice(0,8),EP);
function setChar(){$('#stage').innerHTML='<div class="tag px">'+(cfg.char==='steve'?'STEVE':'ENDERMAN')+'</div><span class="pk">⛏</span>';$('#stage').append(body(cfg.char));$$('.cb').forEach(b=>b.classList.toggle('sel',b.dataset.c===cfg.char))}
// ---- backgrounds ----
const rn=n=>{const x=Math.sin(n*127.1)*43758.5453;return x-Math.floor(x)},ns=(x,s)=>Math.sin(x*.07+s)*.5+Math.sin(x*.13+s*2.3)*.3+Math.sin(x*.31+s*4.1)*.2;
const pc=$('#pan'),px=pc.getContext('2d'),nc=$('#neth'),nx=nc.getContext('2d');pc.width=nc.width=192;pc.height=nc.height=108;let cam=0;
const em=[...Array(50)].map((_,i)=>({x:rn(i)*192,y:rn(i+7)*108,s:.1+rn(i+3)*.4}));
function loop(t){cam+=.15;
 if(screen==='title'||screen==='warp'||screen==='boot'){const g=px.createLinearGradient(0,0,0,108);g.addColorStop(0,'#c9b8e8');g.addColorStop(.5,'#f0b5c8');g.addColorStop(1,'#d98aa0');px.fillStyle=g;px.fillRect(0,0,192,108);
  [['#8a6aa0',.5,22,.1,1],['#7a4a5a',.58,18,.25,2],['#a03a30',.7,14,.5,3]].forEach(([c,b,a,s,z])=>{px.fillStyle=c;for(let x=0;x<192;x++){const y=108*b-(ns(x+cam*s*8,z)*a+a*.6)|0;px.fillRect(x,y,1,108-y)}})}
 else if(screen==='chat'&&cfg.dim==='over'){const g=nx.createLinearGradient(0,0,0,108);g.addColorStop(0,'#5aa9ff');g.addColorStop(1,'#bfe6ff');nx.fillStyle=g;nx.fillRect(0,0,192,108);
  nx.fillStyle='rgba(255,226,122,.3)';nx.fillRect(146,8,18,18);nx.fillStyle='#ffe27a';nx.fillRect(150,12,10,10);
  nx.fillStyle='rgba(255,255,255,.92)';for(let i=0;i<5;i++){const x=((rn(i)*230+cam*.4*(1+i%2*.5))%230)-20,y=10+rn(i+9)*30;nx.fillRect(x,y,26,5);nx.fillRect(x+5,y-3,15,3)}
  [['#7fb4d0',.55,18,.1,1],['#4f9a3a',.68,12,.3,2]].forEach(([c,b,a,s,z])=>{nx.fillStyle=c;for(let x=0;x<192;x++){const y=108*b-(ns(x+cam*s*8,z)*a+a*.6)|0;nx.fillRect(x,y,1,108-y)}});
  const c0=Math.floor(cam*.5/16);for(let c=c0;c<c0+16;c++){if(rn(c+50)<.55)continue;const x=c*16-cam*.5;nx.fillStyle='#5a3a1c';nx.fillRect(x,80,3,8);nx.fillStyle='#2f7a2a';nx.fillRect(x-4,71,11,10);nx.fillRect(x-2,67,7,5)}
  nx.fillStyle='#5da13a';nx.fillRect(0,88,192,6);nx.fillStyle='#79553a';nx.fillRect(0,94,192,14);nx.fillStyle='rgba(0,0,0,.12)';for(let x=0;x<192;x+=8)nx.fillRect(x,94,1,14);
  em.forEach(e=>{e.y-=e.s*.3;if(e.y<0)e.y=88;nx.fillStyle='rgba(255,255,200,.8)';nx.fillRect(e.x+Math.sin(t*.002+e.x)*3,e.y,1,1)})}
 else if(screen==='chat'){const g=nx.createLinearGradient(0,0,0,108);g.addColorStop(0,'#1a0404');g.addColorStop(1,'#7a1a08');nx.fillStyle=g;nx.fillRect(0,0,192,108);
  for(let x=0;x<192;x++){const h=(ns(x+cam*.3,4)*.5+.5)*30+6|0;nx.fillStyle='#5a1818';nx.fillRect(x,0,1,h);nx.fillStyle='#7a2a20';nx.fillRect(x,h-2,1,2)}
  for(let x=0;x<192;x++){const y=88+ns(x+cam*.2,2)*4|0;nx.fillStyle='#6a2020';nx.fillRect(x,y,1,108-y)}
  nx.fillStyle='#ff7a1a';nx.fillRect(0,97,192,11);for(let i=0;i<20;i++){nx.fillStyle=i%2?'#ffd24a':'#ff4a10';nx.fillRect((rn(i)*192+t*.01*(1+i%3))%192,97+rn(i+5)*10,5,1)}
  em.forEach(e=>{e.y-=e.s;if(e.y<0)e.y=108;nx.fillStyle=`rgba(255,${150+rn(e.x)*80|0},40,.8)`;nx.fillRect(e.x+Math.sin(t*.002+e.x)*3,e.y,1,1)})}
 requestAnimationFrame(loop)}requestAnimationFrame(loop);
// ---- boot + title + portal ----
let bs=false;$('#boot').onclick=()=>{if(bs)return;bs=true;ac();$('#boot').classList.add('red');$('#b1').hidden=true;$('#b2').hidden=false;let p=0;const iv=setInterval(()=>{p+=3+Math.random()*5;if(Math.random()<.3)S.orb();$('#bf').style.width=Math.min(100,p)+'%';if(p>=100){clearInterval(iv);setTimeout(()=>{screen='title';S.chest();$('#boot').style.opacity=0;setTimeout(()=>$('#boot').remove(),1000)},500)}},90)};
function toChat(){if(screen!=='title')return;screen='warp';S.portal();$('#title').classList.add('warp');$('#portal').classList.add('on');
 setTimeout(()=>{$('#title').style.display='none';$('#chat').classList.add('on');screen='chat';setChar();if(!$('#msgs').children.length)welcome();$('#in').focus()},2200);setTimeout(()=>$('#portal').classList.remove('on'),2400)}
function toTitle(){if(screen!=='chat')return;abortC?.abort();$('#chat').classList.remove('on');$('#title').style.display='';$('#title').classList.remove('warp');screen='title'}
$$('.mb[data-a]').forEach(b=>b.onclick=()=>{S.click();({single:toChat,multi:()=>openSet('shr'),mods:()=>openSet('char'),opts:()=>openSet('brain'),quit:()=>$('#quit').classList.add('on')})[b.dataset.a]()});
// ---- settings ----

const tab=t=>{$$('.tab').forEach(e=>e.hidden=e.id!=='t-'+t);$$('.tabs button').forEach(b=>b.classList.toggle('sel',b.dataset.t===t))};
function openSet(t){$('#set').classList.add('on');tab(t)}
$$('.tabs button').forEach(b=>b.onclick=()=>{S.click();tab(b.dataset.t)});$('#sc').onclick=()=>{S.click();$('#set').classList.remove('on')};
function fillModels(){const ms=srv.models[cfg.prov]||[];$('#model').innerHTML=ms.map(m=>'<option>'+m+'</option>').join('');if(!ms.includes(cfg.model))cfg.model=ms[0]||'';$('#model').value=cfg.model}
async function initSrv(){try{srv=await(await fetch('/api/status')).json()}catch(e){}
 const ps=Object.keys(srv.providers||{}).filter(p=>srv.providers[p]);
 $('#prov').innerHTML=ps.length?ps.map(p=>'<option value="'+p+'">'+({groq:'Groq',openai:'OpenAI',gemini:'Google Gemini'}[p]||p)+'</option>').join(''):'<option value="">Demo (no AI configured)</option>';
 if(!ps.includes(cfg.prov))cfg.prov=ps[0]||'';$('#prov').value=cfg.prov;fillModels();save();$('#stat').textContent=ps.length?'Connected: '+ps.join(' + ')+'.':'Demo mode: no AI keys on the server yet.'}
const bind=(id,k,t)=>{const el=$('#'+id);if(t==='c')el.checked=cfg[k];else el.value=cfg[k];el.oninput=el.onchange=()=>{cfg[k]=t==='c'?el.checked:t==='n'?+el.value:el.value;if(id==='temp')$('#tv').textContent=cfg.temp;save()}};
$('#prov').onchange=e=>{cfg.prov=e.target.value;fillModels();save()};$('#model').onchange=e=>{cfg.model=e.target.value;save()};
bind('sys','sys');bind('temp','temp','n');bind('maxt','maxt','n');bind('reas','reas');bind('stream','stream','c');bind('json','json','c');bind('bsearch','bsearch','c');bind('cint','cint','c');bind('chaos','chaos','c');bind('mus','music','c');
$('#tv').textContent=cfg.temp;$('#vol').value=cfg.vol;initSrv();

$('#chaos').onchange=e=>{cfg.chaos=e.target.checked;save()};$('#mus').onchange=e=>{cfg.music=e.target.checked;save()};$('#vol').oninput=e=>{cfg.vol=+e.target.value;if(MG)MG.gain.value=cfg.vol;save()};
$$('.cb').forEach(b=>b.onclick=()=>{cfg.char=b.dataset.c;save();setChar();S.click();if(cfg.char==='ender')S.ender()});
const tx=()=>msgs.map(m=>(m.role==='user'?'Player: ':'Mindcraft: ')+m.text).join('\n\n');
const copy=(t,m)=>{navigator.clipboard?.writeText(t);toast('Copied!',m||'Saved to clipboard');S.orb()};
$('#shCopy').onclick=()=>copy(tx(),'Chat copied');
$('#shDl').onclick=()=>{const a=document.createElement('a');a.href=URL.createObjectURL(new Blob([tx()||'Empty world.'],{type:'text/plain'}));a.download='mindcraft-chat.txt';a.click();S.chest()};
$('#bShare').onclick=()=>{S.click();openSet('shr')};$('#bSet').onclick=()=>{S.click();openSet('brain')};$('#bBack').onclick=()=>{S.click();toTitle()};
addEventListener('keydown',e=>{if(e.key==='Escape'){if($('#set').classList.contains('on'))$('#set').classList.remove('on');else toTitle()}});
function toast(a,b){const t=$('#toast');t.querySelector('b').textContent=a;t.querySelector('span').textContent=b;t.classList.add('on');setTimeout(()=>t.classList.remove('on'),2800)}
function gain(n){const l=xp/25|0;xp+=n;$('#lvl').textContent=xp/25|0;$('#xpb').style.width=(xp%25)*4+'%';if((xp/25|0)>l){S.up();toast('Level up!','You reached level '+(xp/25|0))}}
let dimBusy=false;
function applyDim(){document.body.dataset.dim=cfg.dim;$('#bDim').textContent=cfg.dim==='over'?'🔥 Nether':'🌳 Overworld'}
function setDim(){if(dimBusy||screen!=='chat')return;dimBusy=true;const p=$('#portal');S.click();noise(1.3,.35,200,1600);tone(90,1.3,'sine',.3,220);[420,520,640].forEach((f,i)=>tone(f,.4,'sine',.05,f*.6,i*.25));
 p.classList.add('fast','on');setTimeout(()=>{cfg.dim=cfg.dim==='over'?'nether':'over';save();applyDim();toast(cfg.dim==='over'?'The Overworld':'The Nether','Dimension changed')},650);
 setTimeout(()=>p.classList.remove('on'),800);setTimeout(()=>{p.classList.remove('fast');dimBusy=false},1500)}
$('#bDim').onclick=setDim;if(cfg.dim!=='over')cfg.dim='nether';applyDim();
// ---- chat ----
const M=$('#msgs'),THINK=['Steve is consulting the crafting table…','Mining for the right answer…','Searching 64 stacks of knowledge…','Villagers are discussing your question…','Enchanting your response…','Creeper-proofing this explanation…','A chicken interrupted the calculation…','Checking the Nether for better answers…'];
const esc=s=>s.replace(/&/g,'&amp;').replace(/</g,'&lt;');
const fmt=s=>esc(s).replace(/```\w*\n?([\s\S]*?)(```|$)/g,'<pre><code>$1</code></pre>').replace(/`([^`\n]+)`/g,'<code>$1</code>').replace(/\*\*([^*]+)\*\*/g,'<b>$1</b>').replace(/\n/g,'<br>').replace(/<pre><code>[\s\S]*?<\/code><\/pre>/g,m=>m.replace(/<br>/g,'\n'));
function add(cls,html){const d=document.createElement('div');d.className='m '+cls;if(cls==='b'){const a=document.createElement('div');a.className='av';a.append(head(cfg.char));d.append(a)}const b=document.createElement('div');b.className='bd';b.innerHTML=html;d.append(b);M.append(d);M.scrollTop=1e9;return{box:d,bd:b}}
function welcome(){add('b',cfg.char==='ender'?'…I have been watching you. Ask me something. I promise not to teleport away. <b>Probably.</b>':'Hey there, Player! I’m <b>Mindcraft</b>, curated by Arin. Ask me anything, from code to crafting recipes. ⛏️')}
function mining(el){const c=el.querySelector('canvas'),x=c.getContext('2d');c.width=c.height=16;const sp=Math.random()<.5?'#3dffe6':'#fcd34d',base=[...Array(256)].map(Math.random),ord=[...Array(256).keys()].sort(()=>Math.random()-.5);let st=0,n=0;
 const draw=()=>{for(let i=0;i<256;i++){x.fillStyle=base[i]>.9?sp:base[i]>.45?'#7d7d7d':'#6a6a6a';x.fillRect(i%16,i/16|0,1,1)}x.fillStyle='rgba(0,0,0,.65)';for(let i=0;i<st*24;i++)x.fillRect(ord[i]%16,ord[i]/16|0,1,1)};draw();
 const bar=el.querySelector('.bar i'),mt=el.querySelector('.mt'),iv=setInterval(()=>{S.mine();st++;if(st>10){S.brk();st=0;for(let i=0;i<256;i++)base[i]=Math.random()}draw();bar.style.width=st*10+'%';if(++n%5===0){mt.textContent=THINK[n/5%THINK.length|0];Math.random()<.5?S.hmm():Math.random()<.5&&S.cluck()}},380);return()=>clearInterval(iv)}
const sysP=()=>'You are Mindcraft, a fun, genuinely helpful AI assistant inside a Minecraft-themed app curated by Arin. Give accurate, clear answers, using Markdown and code blocks where useful, with light Minecraft references. '+(cfg.char==='ender'?'Speak like a calm, slightly cryptic Enderman, but stay helpful.':'Speak like a friendly, upbeat Steve.')+(cfg.chaos?' Chaos mode: be extra playful with jokes and puns.':'')+(cfg.sys?'\nUser instructions: '+cfg.sys:'');
async function sse(r,fn){if(!r.ok)throw new Error('API error '+r.status+': '+(await r.text()).slice(0,200));const rd=r.body.getReader(),d=new TextDecoder();let b='';for(;;){const{done,value}=await rd.read();if(done)break;b+=d.decode(value,{stream:true});const p=b.split('\n');b=p.pop();for(const l of p){if(!l.startsWith('data:'))continue;const s=l.slice(5).trim();if(s==='[DONE]')return;try{fn(JSON.parse(s))}catch(e){}}}}
async function llm(h,tok,signal){const body={provider:cfg.prov,model:cfg.model,messages:h,system:sysP(),temperature:cfg.temp,max_tokens:cfg.maxt,reasoning:cfg.reas,stream:cfg.stream,json:cfg.json,tools:{search:cfg.bsearch,code:cfg.cint}};
 const r=await fetch('/api/chat',{method:'POST',signal,headers:{'Content-Type':'application/json'},body:JSON.stringify(body)});
 if(!r.ok){let m='Server error '+r.status;try{m=(await r.json()).error||m}catch(e){}throw new Error(m)}
 if(!cfg.stream){const j=await r.json();for(const w of(j.text||'').split(/(?<=\s)/)){if(signal.aborted)throw new DOMException('x','AbortError');tok(w);await new Promise(r=>setTimeout(r,12))}return}
 let er='';await sse(r,j=>{if(j.t)tok(j.t);if(j.error)er=j.error});if(er)throw new Error(er)}

async function demo(tok,sig){await new Promise(r=>setTimeout(r,2800));const q=msgs.at(-1).text.slice(0,60);const t='⛏ **Demo mode.** I heard “'+q+'”. No AI provider is configured on the server yet. The owner can add a GROQ_API_KEY to enable real answers.\n```js\n// every world begins with a single block\nconsole.log("Mindcraft online");\n```';for(const w of t.split(/(?<= )/)){if(sig.aborted)throw new DOMException('x','AbortError');tok(w);await new Promise(r=>setTimeout(r,40))}}
async function run(){busy=true;$('#send').textContent='■ Stop';$('#stage').classList.add('work');$$('.act .rg').forEach(e=>e.remove());
 const b=add('b','<div class="mine"><canvas class="blk"></canvas><div><div class="mt">'+THINK[0]+'</div><div class="bar"><i></i></div></div></div>');const stopM=mining(b.bd);if(cfg.char==='ender')S.ender();
 let first=true,out='';const end=()=>{if(first){first=false;stopM();b.bd.innerHTML='';S.brk()}};abortC=new AbortController();
 const tok=t=>{if(first){end();S.orb()}out+=t;b.bd.innerHTML=fmt(out);M.scrollTop=1e9;S.tick()};let fail=0;
 try{!cfg.prov||!srv.providers[cfg.prov]?await demo(tok,abortC.signal):await llm(msgs,tok,abortC.signal)}catch(e){end();if(e.name!=='AbortError'){fail=1;b.bd.innerHTML+='<div class="err">⚠ '+esc(e.message.includes('Failed to fetch')?'Can’t reach the server. Please try again in a moment.':e.message)+'</div>';S.hmm()}}
 end();if(out){msgs.push({role:'model',text:out});gain(3)}
 const a=document.createElement('div');a.className='act';if(out)a.innerHTML='<button class="cp">Copy</button>';a.innerHTML+='<button class="rg">'+(fail?'Retry':'Regenerate')+'</button>';b.bd.append(a);
 a.querySelector('.cp')?.addEventListener('click',()=>copy(out,'Reply copied'));a.querySelector('.rg').onclick=()=>{if(busy)return;S.click();if(msgs.at(-1)?.role==='model')msgs.pop();b.box.remove();run()};
 busy=false;$('#send').textContent='Send';$('#stage').classList.remove('work');M.scrollTop=1e9}
function send(){const t=$('#in').value.trim();if(!t||busy)return;$('#in').value='';$('#in').style.height='auto';S.click();msgs.push({role:'user',text:t});add('u',esc(t));gain(5);if(msgs.length===1)toast('Advancement Made!','Time to Mine');run()}
$('#send').onclick=()=>busy?abortC.abort():send();
$('#in').onkeydown=e=>{if(e.key==='Enter'&&!e.shiftKey){e.preventDefault();send()}};$('#in').oninput=e=>{e.target.style.height='auto';e.target.style.height=Math.min(e.target.scrollHeight,140)+'px'};
