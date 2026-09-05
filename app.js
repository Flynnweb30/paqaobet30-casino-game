const SYMBOLS=[
  {id:"cherry",icon:"🍒",name:"Cherry",mult:5},
  {id:"lemon",icon:"🍋",name:"Lemon",mult:8},
  {id:"bell",icon:"🔔",name:"Bell",mult:12},
  {id:"gem",icon:"💎",name:"Gem",mult:20},
  {id:"seven",icon:"7️⃣",name:"Seven",mult:40}
];
const BETS=[1,2,5,10,20,50,100];
let balance=1000, bet=10, round=0, spinning=false, sound=true, history=[];
const reelsEl=document.querySelector("#reels"), balanceEl=document.querySelector("#balance");
const betEl=document.querySelector("#bet"), lastWinEl=document.querySelector("#lastWin");
const statusEl=document.querySelector("#statusText"), roundEl=document.querySelector("#round");
const spinBtn=document.querySelector("#spinBtn"), winBadge=document.querySelector("#winBadge"), winAmount=document.querySelector("#winAmount");
const audioCtx=()=>window.AudioContext&&new AudioContext();
let ctx;
function money(n){return Number(n).toLocaleString(undefined,{minimumFractionDigits:2,maximumFractionDigits:2})}
function renderPaytable(){
 document.querySelector("#paytable").innerHTML=SYMBOLS.map(s=>`<div class="pay-item"><b>${s.icon}</b><span>${s.name}</span><strong>${s.mult}×</strong></div>`).join("");
}
function symbolById(id){return SYMBOLS.find(s=>s.id===id)||SYMBOLS[0]}
function renderReels(matrix){
 reelsEl.innerHTML="";
 matrix.forEach(col=>{
   const reel=document.createElement("div"); reel.className="reel";
   col.forEach((id,i)=>{const c=document.createElement("div");c.className=`cell ${i===1?"center":"dim"}`;c.textContent=symbolById(id).icon;reel.appendChild(c)});
   reelsEl.appendChild(reel);
 });
}
function randomId(){return SYMBOLS[Math.floor(Math.random()*SYMBOLS.length)].id}
function randomMatrix(){return Array.from({length:5},()=>Array.from({length:3},randomId))}
function updateBalance(){balanceEl.textContent=money(balance);betEl.value=bet.toFixed(2)}
function tone(freq,dur=.07){
 if(!sound)return;
 try{ctx=ctx||audioCtx(); if(!ctx)return; const o=ctx.createOscillator(),g=ctx.createGain();o.frequency.value=freq;o.type="sine";g.gain.setValueAtTime(.035,ctx.currentTime);g.gain.exponentialRampToValueAtTime(.001,ctx.currentTime+dur);o.connect(g);g.connect(ctx.destination);o.start();o.stop(ctx.currentTime+dur)}catch{}
}
function renderHistory(){
 const el=document.querySelector("#history");
 el.innerHTML=history.length?history.map(h=>`<div class="history-row"><span>${h.round}. ${h.symbols.map(symbolById).map(s=>s.icon).join(" ")}</span><span class="result">${h.mult}×</span><span class="${h.win>0?"win":"loss"}">${h.win>0?"+":""}${money(h.win)}</span></div>`).join(""):'<div class="empty">Your demo spins will appear here.</div>';
}
function chooseWeighted(){
 const r=Math.random();
 if(r<.025)return "seven"; if(r<.075)return "gem"; if(r<.16)return "bell"; if(r<.36)return "lemon"; return "cherry";
}
function demoOutcome(){
 // Client-side fallback keeps the game playable even if an API is unavailable.
 const center=Array.from({length:5},chooseWeighted);
 let mult=0;
 for(let i=0;i<3;i++){if(center[i]===center[1]&&center[i]===center[2]) mult=Math.max(mult,symbolById(center[i]).mult)}
 // Small chance of a five-of-a-kind jackpot.
 if(center.every(x=>x===center[0])) mult=symbolById(center[0]).mult*3;
 const matrix=center.map(id=>[randomId(),id,randomId()]);
 return {matrix,mult};
}
async function getOutcome(){
 try{
   const r=await fetch("/api/spin",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({bet})});
   if(!r.ok)throw new Error("API");
   return await r.json();
 }catch{return demoOutcome()}
}
async function spin(){
 if(spinning)return;
 bet=Math.max(1,Math.min(100,Number(betEl.value)||10)); bet=BETS.reduce((a,b)=>Math.abs(b-bet)<Math.abs(a-b)?b:a);
 if(balance<bet){statusEl.textContent="NOT ENOUGH DEMO CREDITS";tone(180,.14);return}
 spinning=true;spinBtn.disabled=true;winBadge.classList.add("hidden");statusEl.textContent="SPINNING…";balance-=bet;updateBalance();tone(280,.06);
 const stop=await getOutcome();
 // animate with random frames
 const timer=setInterval(()=>renderReels(randomMatrix()),90);
 await new Promise(r=>setTimeout(r,850));
 clearInterval(timer);
 renderReels(stop.matrix);
 const win=Number((bet*stop.mult).toFixed(2));
 balance+=win; round++; roundEl.textContent=round; lastWinEl.textContent=money(win);
 if(win>0){winAmount.textContent=money(win);winBadge.classList.remove("hidden");statusEl.textContent=`YOU WON ${money(win)} CREDITS`;tone(720,.1);setTimeout(()=>tone(980,.14),100)}
 else statusEl.textContent="NO WIN — TRY AGAIN";
 history.unshift({round,symbols:stop.matrix.map(c=>c[1]),mult:stop.mult,win});
 history=history.slice(0,12);renderHistory();updateBalance();spinning=false;spinBtn.disabled=false;
}
document.querySelector("#betDown").onclick=()=>{bet=BETS[Math.max(0,BETS.indexOf(bet)-1)];updateBalance();tone(220)};
document.querySelector("#betUp").onclick=()=>{bet=BETS[Math.min(BETS.length-1,BETS.indexOf(bet)+1)];updateBalance();tone(320)};
betEl.addEventListener("change",()=>{bet=Math.max(1,Math.min(100,Number(betEl.value)||10));updateBalance()});
spinBtn.onclick=spin;
document.querySelector("#soundBtn").onclick=e=>{sound=!sound;e.currentTarget.textContent=sound?"🔊":"🔇"};
document.querySelector("#resetBtn").onclick=()=>{balance=1000;bet=10;round=0;history=[];lastWinEl.textContent="0.00";statusEl.textContent="READY TO SPIN";roundEl.textContent="0";winBadge.classList.add("hidden");renderReels(randomMatrix());renderHistory();updateBalance();tone(400)};
document.addEventListener("keydown",e=>{if(e.code==="Space"&&!["INPUT","BUTTON"].includes(document.activeElement.tagName)){e.preventDefault();spin()}});
renderPaytable();renderReels(randomMatrix());renderHistory();updateBalance();document.querySelector("#year").textContent=new Date().getFullYear();
