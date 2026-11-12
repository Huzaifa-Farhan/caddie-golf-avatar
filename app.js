// Caddie: conversation logic, speech input/output, and UI state
const $=s=>document.querySelector(s);
const ORDER=['date','time','players','holes','cart','rentals','name','contact'];
const LABEL={date:'Date',time:'Tee time',players:'Players',holes:'Holes',cart:'Cart',rentals:'Club rentals',name:'Name',contact:'Contact'};
const EDIT={'Date':'date','Tee time':'time','Players':'players','Holes':'holes','Cart':'cart','Club rentals':'rentals','Name':'name','Contact':'contact'};
const SLOTS=['7:30 AM','8:00 AM','9:10 AM','10:20 AM','11:30 AM','12:40 PM','1:50 PM','4:30 PM','5:20 PM'],BOOKED=['8:00 AM'];
const WIN={morning:[0,4],midday:[4,7],twilight:[7,9]};
const DAYS=['sunday','monday','tuesday','wednesday','thursday','friday','saturday'];
let S,hist=[],voiceOn=true,rec=null,fin='',recErr='';
const fresh=()=>({v:{},focus:null,win:null,stage:'ask'});
const SR=window.SpeechRecognition||window.webkitSpeechRecognition;
const step=()=>S.focus||ORDER.find(k=>S.v[k]===undefined)||null;
const avail=w=>(w?SLOTS.slice(...WIN[w]):SLOTS).filter(s=>!BOOKED.includes(s));
const mins=l=>{const m=l.match(/(\d+):(\d+) (AM|PM)/);return (+m[1]%12+(m[3]=='PM'?12:0))*60+ +m[2]};
const nearest=l=>avail().sort((a,b)=>Math.abs(mins(a)-mins(l))-Math.abs(mins(b)-mins(l))).slice(0,3).sort((a,b)=>mins(a)-mins(b));
const fmtD=d=>d.toLocaleDateString('en-CA',{weekday:'short',month:'short',day:'numeric'});
function fv(k){const v=S.v[k];if(k=='players')return v+(v>1?' players':' player');if(k=='holes')return v+' holes';return v}
function setState(s){$('#av').dataset.state=s;$('#status').textContent={idle:'Ready',listening:'Listening… speak now',thinking:'Thinking…',speaking:'Speaking…'}[s];$('#sub').textContent={idle:'Type, tap a choice, or press the mic.',listening:'Tap the mic again to stop.',thinking:'One moment.',speaking:'Captions are shown in the chat.'}[s]}
function addMsg(c,t){const d=document.createElement('div');d.className='msg '+c;if(c!='note'){const w=document.createElement('span');w.className='who';w.textContent=c=='bot'?'Caddie':'You';d.append(w)}d.append(t);$('#log').append(d);$('#log').scrollTop=1e6;return d}
function setChips(a=[]){const c=$('#chips');c.innerHTML='';a.forEach(t=>{const b=document.createElement('button');b.className='chip';b.textContent=t;b.onclick=()=>{if(S.stage=='confirm'&&EDIT[t])return startEdit(EDIT[t]);handle(t)};c.append(b)})}
function speak(t){if(voiceOn&&'speechSynthesis' in window){speechSynthesis.cancel();const u=new SpeechSynthesisUtterance(t);u.lang='en-CA';u.onstart=()=>setState('speaking');u.onend=u.onerror=()=>setState('idle');speechSynthesis.speak(u)}else setState('idle')}
function say(t,chips){addMsg('bot',t);setChips(chips);speak(t);render()}
function render(){const r=$('#rows');r.innerHTML='';let n=0;ORDER.forEach(k=>{const has=S.v[k]!==undefined;if(has)n++;const d=document.createElement('div');d.className='row';d.innerHTML='<span></span><span></span>';d.children[0].textContent=LABEL[k];d.children[1].textContent=has?fv(k):'—';if(has){const b=document.createElement('button');b.textContent='Edit';b.setAttribute('aria-label','Edit '+LABEL[k]);b.onclick=()=>startEdit(k);d.children[1].append(' ',b)}r.append(d)});$('#sumt').textContent=`Your booking: ${n} of 8 details`;$('#back').disabled=!hist.length}
const CH={date:()=>['Tomorrow','This Saturday','This Sunday'],time:()=>S.win?avail(S.win):['Morning','Midday','Twilight'],players:()=>['1 player','2 players','3 players','4 players'],holes:()=>['9 holes','18 holes'],cart:()=>['Riding cart','Walking'],rentals:()=>['Right-handed rentals','Left-handed rentals','No, I have my own'],name:()=>[],contact:()=>[]};
const Q={date:()=>'Which day would you like to play?',time:()=>S.win?`Which ${S.win} tee time works best?`:'What time of day suits you: morning, midday, or twilight?',players:()=>'How many players? I can book up to 4 per tee time.',holes:()=>'Would you like to play 9 holes or 18 holes?',cart:()=>'Would you like a riding cart, or will you walk?',rentals:()=>'Do you need rental clubs?',name:()=>'What name should I put the booking under?',contact:()=>'What phone number or email can the pro shop reach you at? It is only used for this booking.'};
function ask(pre=''){const k=step();if(!k){S.stage='confirm';const v=S.v;say(`${pre}Please confirm: ${v.date} at ${v.time}, ${fv('players')}, ${fv('holes')}, ${v.cart}, ${v.rentals}, under the name ${v.name} (${v.contact}). Is that correct?`,['Yes, book it','Change something']);return}S.stage='ask';say(pre+Q[k](),CH[k]())}
function parseDate(t){const n=new Date();n.setHours(12);let i=-1;if(/\btoday\b/.test(t))return fmtD(n);if(/\btomorrow\b/.test(t)){n.setDate(n.getDate()+1);return fmtD(n)}if(/\bweekend\b/.test(t))i=6;else i=DAYS.findIndex(x=>new RegExp('\\b'+x+'\\b').test(t));if(i<0)return null;n.setDate(n.getDate()+(i-n.getDay()+7)%7);return fmtD(n)}
function parseTime(t){let m=t.match(/\b(\d{1,2})(?::(\d{2}))?\s*([ap])\.?m\b/);if(m)return{exact:`${+m[1]}:${m[2]||'00'} ${m[3]=='a'?'AM':'PM'}`};m=t.match(/\b(\d{1,2}):(\d{2})\b/);if(m){const h=+m[1];return{exact:`${h}:${m[2]} ${h>=7&&h<12?'AM':'PM'}`}}const w=/morning|early/.test(t)?'morning':/midday|noon|afternoon|lunch/.test(t)?'midday':/twilight|evening|sunset|late/.test(t)?'twilight':null;return w?{win:w}:null}
const NUM={one:1,two:2,three:3,four:4,five:5,six:6,seven:7,eight:8};
function parseP(t,cur){if(/\b(just me|myself|solo|alone)\b/.test(t))return 1;if(/twosome/.test(t))return 2;if(/threesome/.test(t))return 3;if(/foursome/.test(t))return 4;if(/hole/.test(t))return null;let m=t.match(/\b(\d+|one|two|three|four|five|six|seven|eight)\s*(players?|people|golfers?|of us|guests?)\b/)||t.match(/party of (\d+)/);if(!m&&cur)m=t.match(/^\D*\b(\d+|one|two|three|four|five|six|seven|eight)\b\D*$/);return m?(isNaN(m[1])?NUM[m[1]]:+m[1]):null}
function apply(raw){const t=raw.toLowerCase().trim(),cur=step(),up=[],er=[];let partial=false;
 const set=(k,v)=>{const was=S.v[k];if(was===v)return;up.push({k,v,changed:was!==undefined});S.v[k]=v;if(S.focus==k)S.focus=null};
 const d=parseDate(t);if(d)set('date',d);
 const tm=parseTime(t);if(tm){if(tm.win){S.win=tm.win;if(S.v.time===undefined)partial=true}else if(SLOTS.includes(tm.exact)&&!BOOKED.includes(tm.exact))set('time',tm.exact);else{const ns=nearest(tm.exact);er.push({msg:(BOOKED.includes(tm.exact)?`Sorry, ${tm.exact} is fully booked.`:`We don't have a tee time at ${tm.exact}.`)+' The closest open times are '+ns.join(', ')+'.',chips:ns})}}
 const p=parseP(t,cur=='players');if(p!==null){if(p<1||p>4)er.push({msg:'I can book 1 to 4 players per tee time. For larger groups, please call the pro shop. How many players should I book?',chips:CH.players()});else set('players',p)}
 const h=t.match(/\b(9|nine|18|eighteen)\b\s*(holes?)?/);if(h&&(h[2]||cur=='holes'))set('holes',/9|nine/.test(h[1])?9:18);
 if(/no cart|without a cart|\bwalk/.test(t))set('cart','Walking');else if(/\b(ride|riding|cart|buggy)\b/.test(t))set('cart','Riding cart');
 if(cur=='rentals'||/rent/.test(t)){if(/\bleft/.test(t))set('rentals','Left-handed rentals');else if(/\bright/.test(t))set('rentals','Right-handed rentals');else if(cur=='rentals'&&/\b(no|nope|own|bring|don't)\b/.test(t))set('rentals','No rentals');else if(cur=='rentals'&&/\b(yes|yeah|yep|sure|rent|please)\b/.test(t))er.push({msg:'Happy to arrange rentals. Are you right-handed or left-handed?',chips:['Right-handed rentals','Left-handed rentals']})}
 if(cur=='name'){const n=raw.replace(/^(my name is|it's|its|it is|i'm|i am|name is|under)\s+/i,'').replace(/[.!]+$/,'').trim();if(/^[a-zA-Z][a-zA-Z' .-]{1,38}$/.test(n)&&n.split(/\s+/).length<=4)set('name',n.replace(/\b\w/g,c=>c.toUpperCase()));else er.push({msg:"I didn't catch a name there. Please tell me the name for the booking, like “Alex Chen”."})}
 if(cur=='contact'){const e=raw.match(/[\w.+-]+@[\w-]+\.[\w.]+/),dg=raw.replace(/\D/g,'');if(e)set('contact',e[0]);else if(dg.length==10||dg.length==11&&dg[0]=='1')set('contact',dg.slice(-10).replace(/(\d{3})(\d{3})(\d{4})/,'$1-$2-$3'));else er.push({msg:"That doesn't look like a valid phone number or email. Try a 10-digit phone number like 416-555-0123, or an email address."})}
 return{up,er,partial}}
function handle(raw){raw=raw.trim();if(!raw)return;speechSynthesis&&speechSynthesis.cancel();$('#heard').classList.remove('on');$('#inp').value='';addMsg('me',raw);hist.push(JSON.stringify(S));render();setState('thinking');setChips([]);setTimeout(()=>respond(raw),450)}
function respond(raw){const t=raw.toLowerCase();
 if(S.stage=='done'){if(/another|again|new|yes/.test(t))return restart();return say('Your tee time is booked. Tap “Book another” to start a new booking.',['Book another'])}
 const r=apply(raw),{up,er,partial}=r;const ch=up.filter(u=>u.changed);
 if(S.stage=='confirm'&&!up.length){
  if(er.length)return say(er[0].msg,er[0].chips);
  if(/\b(yes|yeah|yep|correct|confirm|book it|looks good|right)\b/.test(t))return book();
  if(/\b(no|nope|change|wrong|edit|incorrect)\b/.test(t))return say('No problem. What would you like to change? Tap an option or just tell me, for example “make it 3 players”.',Object.keys(EDIT));
  return say("Sorry, I didn't understand that. Is the booking summary correct?",['Yes, book it','Change something'])}
 if(!up.length&&!partial){if(er.length)return say(er[0].msg,er[0].chips||CH[step()]());return say(`Sorry, I didn't understand “${raw}”. ${Q[step()]()}`,CH[step()]())}
 let pre=ch.length?'No problem, I updated '+ch.map(u=>LABEL[u.k].toLowerCase()+' to '+(u.k=='players'?fv('players'):u.v)).join(' and ')+'. ':'Got it. ';
 if(er.length)pre+=er[0].msg+' ';ask(pre)}
function startEdit(k){hist.push(JSON.stringify(S));delete S.v[k];S.focus=k;if(k=='time')S.win=null;S.stage='ask';ask('Sure. ')}
function book(){const ref='PR-'+Math.random().toString(36).slice(2,6).toUpperCase()+Math.floor(10+Math.random()*90);S.stage='done';const v=S.v;const t=`Your tee time is confirmed! ${v.date} at ${v.time}, ${fv('players')}, ${fv('holes')}, ${v.cart}. Booking reference: ${ref}. The pro shop will contact you at ${v.contact}. Please arrive 20 minutes early. Enjoy your round!`;say(t,['Book another'])}
function restart(){speechSynthesis&&speechSynthesis.cancel();S=fresh();hist=[];$('#log').innerHTML='';$('#heard').classList.remove('on');ask("Hi, I'm Caddie, your virtual caddie at Pine Ridge Golf Club. I can book your tee time in about a minute. You can speak, type, or tap a choice. ")}
function startMic(){if(!SR)return;speechSynthesis&&speechSynthesis.cancel();if(rec){try{rec.stop()}catch(e){}}fin='';recErr='';rec=new SR();rec.lang='en-CA';rec.interimResults=true;
 rec.onstart=()=>{$('#mic').setAttribute('aria-pressed','true');setState('listening');$('#heard').classList.add('on');$('#ht').textContent='…';$('#hs').style.display=$('#hr').style.display='none'};
 rec.onresult=e=>{fin=[...e.results].map(r=>r[0].transcript).join(' ');$('#ht').textContent='“'+fin+'”'};
 rec.onerror=e=>{recErr=e.error};
 rec.onend=()=>{$('#mic').setAttribute('aria-pressed','false');setState('idle');if(fin.trim()){$('#inp').value=fin.trim();$('#hs').style.display=$('#hr').style.display='';$('#ht').textContent='“'+fin.trim()+'”'}else{$('#heard').classList.remove('on');addMsg('note',recErr=='not-allowed'?'Microphone access is blocked. You can still type or tap a choice.':"I didn't hear anything. Tap the mic to try again, or type your answer.")}};
 try{rec.start()}catch(e){}}
$('#mic').onclick=()=>{if($('#mic').getAttribute('aria-pressed')=='true')rec.stop();else startMic()};
$('#hs').onclick=()=>handle($('#inp').value);$('#hr').onclick=startMic;
$('#send').onclick=()=>handle($('#inp').value);$('#inp').onkeydown=e=>{if(e.key=='Enter')handle($('#inp').value)};
$('#voice').onclick=e=>{voiceOn=!voiceOn;e.target.setAttribute('aria-pressed',voiceOn);e.target.textContent=voiceOn?'🔊 Voice on':'🔇 Voice off';if(!voiceOn&&window.speechSynthesis){speechSynthesis.cancel();setState('idle')}};
$('#back').onclick=()=>{if(!hist.length)return;speechSynthesis&&speechSynthesis.cancel();S=JSON.parse(hist.pop());ask('Okay, going back. ')};
$('#restart').onclick=restart;
if(!SR){$('#mic').disabled=true;$('#mic').title='Voice input is not supported in this browser'}
restart();
if(!SR)addMsg('note','Voice input is not supported in this browser, so text and buttons are on. Try Chrome or Safari for voice.');
