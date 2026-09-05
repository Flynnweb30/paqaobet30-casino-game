const express=require("express");
const path=require("path");
const crypto=require("crypto");
const app=express();
const PORT=process.env.PORT||10000;
app.disable("x-powered-by");
app.use(express.json({limit:"10kb"}));
app.use(express.static(path.join(__dirname,"public"),{extensions:["html"]}));

const symbols=["cherry","lemon","bell","gem","seven"];
const weights=[.60,.20,.11,.065,.025];
const mult={cherry:5,lemon:8,bell:12,gem:20,seven:40};
function randomSymbol(){
 const r=crypto.randomInt(0,1_000_000)/1_000_000;
 let total=0;
 for(let i=0;i<weights.length;i++){total+=weights[i];if(r<total)return symbols[i]}
 return "cherry";
}
app.get("/api/health",(req,res)=>res.json({ok:true,name:"Paqaobet30",mode:"demo"}));
app.post("/api/spin",(req,res)=>{
 const bet=Number(req.body?.bet);
 if(!Number.isFinite(bet)||bet<1||bet>100)return res.status(400).json({error:"Bet must be between 1 and 100 demo credits."});
 const center=Array.from({length:5},randomSymbol);
 let multiplier=0;
 if(center[0]===center[1]&&center[1]===center[2]) multiplier=Math.max(multiplier,mult[center[0]]);
 if(center.every(x=>x===center[0])) multiplier=mult[center[0]]*3;
 const matrix=center.map(id=>[randomSymbol(),id,randomSymbol()]);
 res.json({matrix,mult:multiplier});
});
app.get("*",(req,res)=>res.sendFile(path.join(__dirname,"public","index.html")));
app.listen(PORT,()=>console.log(`Paqaobet30 running on port ${PORT}`));
