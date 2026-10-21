import {db,doc,setDoc,onSnapshot} from './firebase.js';
const $=s=>document.querySelector(s);
const sha=async s=>[...new Uint8Array(await crypto.subtle.digest('SHA-256',new TextEncoder().encode('chungtien:'+s)))].map(b=>b.toString(16).padStart(2,'0')).join('');
const okRoom=r=>/^[A-Za-z0-9_-]{4,40}$/.test(r);
const fmt=n=>Number(n).toLocaleString('vi-VN')+'đ';
let S=JSON.parse(localStorage.getItem('ct')||'null')||{members:['Mình','Người ấy'],items:[],t:0};
let C=JSON.parse(localStorage.getItem('ctc')||'{}');
$('#date').valueAsDate=new Date();
const roomRef=()=>okRoom(C.room||'')?doc(db,'rooms',C.room):null;
let unsub=null;

async function save(){
 S.t=Date.now();localStorage.setItem('ct',JSON.stringify(S));render();
 const r=roomRef();if(r)try{await setDoc(r,S)}catch{$('#sync').textContent='⚠️ Lỗi đồng bộ'}
}
function clean(r){
 if(!r||typeof r!=='object'||!Array.isArray(r.members))return null;
 const m=r.members.filter(x=>typeof x==='string').map(x=>x.slice(0,30)).slice(0,3);
 if(m.length<2)return null;
 const items=(Array.isArray(r.items)?r.items:[]).filter(i=>i&&typeof i.n==='string'&&typeof i.w==='string'&&typeof i.c==='string'&&typeof i.d==='string'&&/^\d{4}-\d{2}-\d{2}$/.test(i.d)&&Number.isFinite(i.a)&&Number.isFinite(i.id)).map(i=>({id:i.id,n:i.n.slice(0,100),a:i.a,w:i.w,c:i.c,d:i.d}));
 return{members:m,items,t:Number(r.t)||0};
}
function pull(){
 if(unsub){unsub();unsub=null}
 const r=roomRef();if(!r)return;
 unsub=onSnapshot(r,async snap=>{
  if(!snap.exists()){await setDoc(r,S);return}
  const d=snap.data();
  if(d.t>S.t){const c=clean(d);if(c){S=c;localStorage.setItem('ct',JSON.stringify(S));render();}}
  $('#sync').textContent='☁️ Đã đồng bộ • phòng '+C.room;
 },()=>{$('#sync').textContent='⚠️ Mất kết nối / bị từ chối quyền'});
}
const esc=s=>String(s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
function render(){
 S.items=S.items||[];
 $('#who').innerHTML=S.members.map(m=>`<option>${esc(m)}</option>`).join('');
 const ym=new Date().toISOString().slice(0,7);
 const mo=S.items.filter(i=>i.d.startsWith(ym));
 const tot=mo.reduce((a,i)=>a+i.a,0);
 const colors=['#ff4fd8','#3ef2ff','#c6ff3d'];
 const by=m=>mo.filter(i=>i.w===m).reduce((a,i)=>a+i.a,0);
 let h=`<div class="stat" style="background:#ff9d4d">Tổng tháng này<b>${fmt(tot)}</b></div>`;
 S.members.forEach((m,k)=>h+=`<div class="stat" style="background:${colors[k]}">${esc(m)} đã chi<b>${fmt(by(m))}</b></div>`);
 const avg=tot/S.members.length;
 if(S.members.length>1){
  const txt=S.members.map(m=>{const d=by(m)-avg;return d>=0?`${esc(m)} dư ${fmt(Math.round(d))}`:`${esc(m)} thiếu ${fmt(Math.round(-d))}`}).join(' • ');
  h+=`<div class="stat" style="background:#fff;grid-column:1/-1;font-size:.95rem">⚖️ Chia đều: ${txt}</div>`;
 }
 $('#stats').innerHTML=h;
 const cs={};mo.forEach(i=>cs[i.c]=(cs[i.c]||0)+i.a);
 $('#cats').innerHTML=Object.entries(cs).sort((a,b)=>b[1]-a[1]).map(([c,v])=>`<div class="row"><span>${esc(c)}</span><span>${fmt(v)}</span></div><div class="bar"><i style="width:${v/tot*100}%"></i></div>`).join('')||'<p class="muted">Chưa có khoản chi nào 🌱</p>';
 $('#list').innerHTML=[...S.items].sort((a,b)=>b.d.localeCompare(a.d)||b.id-a.id).map(i=>`<div class="item"><div class="em">${esc(i.c.split(' ')[0])}</div><div class="grow">${esc(i.n)}<br><small>${esc(i.w)} • ${i.d}</small></div><span class="amt">${fmt(i.a)}</span><button class="del" data-id="${i.id}" aria-label="Xóa">✕</button></div>`).join('')||'<p class="muted" style="margin-top:8px">Trống trơn 👀</p>';
}
$('#list').onclick=e=>{const b=e.target.closest('.del');if(!b)return;const id=+b.dataset.id;S.items=S.items.filter(i=>i.id!==id);save()};
$('#f').onsubmit=e=>{e.preventDefault();
 S.items.push({id:Date.now(),n:$('#what').value,a:+$('#amt').value,w:$('#who').value,c:$('#cat').value,d:$('#date').value});
 $('#what').value='';$('#amt').value='';save()};
$('#btnMem').onclick=()=>{[1,2,3].forEach(k=>$('#m'+k).value=S.members[k-1]||'');$('#dMem').showModal()};
$('#saveMem').onclick=()=>{const m=[1,2,3].map(k=>$('#m'+k).value.trim()).filter(Boolean);if(m.length>=2){S.members=m;save()}$('#dMem').close()};
$('#btnSync').onclick=()=>{$('#room').value=C.room||'';$('#dSync').showModal()};
$('#saveSync').onclick=()=>{const r=$('#room').value.trim();if(!okRoom(r)){alert('Mã phòng 4-40 ký tự: chữ, số, - hoặc _');return}C={room:r};localStorage.setItem('ctc',JSON.stringify(C));$('#dSync').close();pull()};
$('#offSync').onclick=()=>{if(unsub){unsub();unsub=null}C={};localStorage.setItem('ctc','{}');$('#sync').textContent='Đang dùng chế độ máy này';$('#dSync').close()};
// ===== PIN lock =====
let fails=0,lockedUntil=0;
const dLock=$('#dLock');
dLock.addEventListener('cancel',e=>e.preventDefault());
function needLock(){if(localStorage.getItem('ctpin')&&!dLock.open){$('#pinIn').value='';$('#lockMsg').textContent='';dLock.showModal()}}
$('#unlock').onclick=async()=>{
 if(Date.now()<lockedUntil){$('#lockMsg').textContent='Thử lại sau '+Math.ceil((lockedUntil-Date.now())/1000)+'s';return}
 if(await sha($('#pinIn').value)===localStorage.getItem('ctpin')){fails=0;dLock.close()}
 else{fails++;$('#pinIn').value='';$('#lockMsg').textContent='Sai PIN';if(fails>=3){lockedUntil=Date.now()+30000*fails;$('#lockMsg').textContent='Sai nhiều lần, chờ '+30*fails+'s'}}
};
$('#pinIn').onkeydown=e=>{if(e.key==='Enter')$('#unlock').click()};
$('#btnPin').onclick=()=>{$('#pinNew').value='';$('#dPin').showModal()};
$('#closePin').onclick=()=>$('#dPin').close();
$('#savePin').onclick=async()=>{
 const p=$('#pinNew').value;
 if(!p){localStorage.removeItem('ctpin')}
 else if(/^\d{4,8}$/.test(p)){localStorage.setItem('ctpin',await sha(p))}
 else{alert('PIN gồm 4-8 chữ số');return}
 $('#dPin').close();
};
document.addEventListener('visibilitychange',()=>{if(document.hidden)needLock()});
needLock();
render();pull();
if('serviceWorker' in navigator)navigator.serviceWorker.register('sw.js').catch(()=>{});
