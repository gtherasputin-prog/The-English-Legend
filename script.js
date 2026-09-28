const $=s=>document.querySelector(s);
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
if(typeof firebaseConfig==='undefined'||/ضع|YOUR/.test(firebaseConfig.apiKey+firebaseConfig.projectId)){
 $('#login').innerHTML='<div class="lgc"><h1>⚙️ لسه محتاجين نربط فاير بيز</h1><p class="sub">افتح ملف firebase-config.js وحط بيانات مشروعك.</p></div>';throw new Error('no firebase config')}
firebase.initializeApp(firebaseConfig);const auth=firebase.auth(),db=firebase.firestore();
const L=['A','B','C','D'],SK=['قواعد','مفردات','قراءة'],ALLB=['أول اختبار 🎯','نجم القواعد ⭐','الدرجة النهائية 🏆','٧ أيام متتالية 🔥'];
let me=null,Q=null,timer=null,ch=null,draft=null,sel=null,STC=[];
const get=async(c,f)=>{let r=db.collection(c);if(f)r=f(r);return(await r.get()).docs.map(d=>({id:d.id,...d.data()}))};
const avg=a=>a.length?Math.round(a.reduce((x,y)=>x+y,0)/a.length):0;
const lvl=()=>Math.floor((me.xp||0)/250)+1,pct=()=>Math.round((me.xp||0)%250/250*100);
const fmt=s=>String(Math.floor(s/60)).padStart(2,'0')+':'+String(s%60).padStart(2,'0');
const dt=t=>new Date(t).toLocaleDateString('ar-EG',{day:'numeric',month:'short'});
function toast(m){const t=$('#toast');t.textContent=m;t.classList.add('on');setTimeout(()=>t.classList.remove('on'),2800)}
async function login(){const u=$('#lu').value.trim().toLowerCase(),em=u.includes('@')?u:u+'@legend.app';$('#le').textContent='';
 try{await auth.signInWithEmailAndPassword(em,$('#lp').value)}catch(e){$('#le').textContent='اسم المستخدم أو كلمة السر غلط، جرّب تاني'}return false}
auth.onAuthStateChanged(async u=>{
 if(!u){me=null;$('#app').hidden=true;$('#login').hidden=false;return}
 const d=await db.collection('users').doc(u.uid).get();
 if(!d.exists){await auth.signOut();$('#le').textContent='الحساب ده مش متسجل عند المدرس';return}
 me={uid:u.uid,...d.data()};$('#login').hidden=true;$('#app').hidden=false;$('#menu').classList.remove('open');
 $('#avt').textContent=(me.name||'?')[0];$('#bell').hidden=me.role=='teacher';go(me.role=='teacher'?'overview':'home')});
const NAVS={student:[['home','🏠','الرئيسية'],['lessons','📚','حصصي'],['progress','📊','تقدمي'],['profile','👤','أنا']],
 teacher:[['overview','📋','نظرة عامة'],['lessons','📚','المنهج'],['quizzes','📝','الاختبارات'],['students','🎓','الطلاب']]};
const NK={create:'quizzes',student:'students'};
async function go(v){clearInterval(timer);const R=V[me.role+'_'+v]||V[v];
 $('#nav').innerHTML=NAVS[me.role].map(n=>`<button class="${n[0]==(NK[v]||v)?'on':''}" onclick="go('${n[0]}')"><span>${n[1]}</span>${n[2]}</button>`).join('');
 $('#nav').style.display=(v=='quiz'||v=='result')?'none':'';
 let r=R();if(r instanceof Promise){$('#main').innerHTML='<p class="sub">⏳ لحظة واحدة...</p>';try{r=await r}catch(e){console.error(e);r='<div class="card"><h2>حصلت مشكلة 😕</h2><p>اتأكد من النت ومن قواعد الأمان في فاير بيز.</p></div>'}}
 $('#main').innerHTML=r;scrollTo(0,0);if(v=='quiz'){tick();timer=setInterval(tick,1000)}if(v=='progress')chart()}
/* ---------- بيانات الطالب ---------- */
async function mine(){const[ls,at]=await Promise.all([get('lessons'),get('attempts',r=>r.where('uid','==',me.uid))]);
 ls.sort((a,b)=>a.no-b.no);at.sort((a,b)=>a.t-b.t);return[ls,at]}
function status(l,at){const d=at.filter(a=>a.lessonId==l.id);
 return{d,k:d.length>=(l.tries||1)?'done':(l.open&&l.quizId)?'open':(d.length?'done':'lock')}}
function lcard(l,at){const s=status(l,at),b=s.d.length?Math.max(...s.d.map(a=>a.p)):null;
 return `<div class="card lesson ${s.k}"><div class="no">${l.no}</div><div class="lb"><h3>${esc(l.title)}</h3><div class="meta">${esc(l.unit||'')}${b!=null?` · أحسن درجة ${b}%`:''}</div>
 ${s.k=='lock'?'<span class="pill m">🔒 الاختبار لسه ما اتفتحش</span>':s.k=='open'?'<span class="pill">📝 الاختبار متاح</span>':'<span class="pill">✅ خلّصت الاختبار</span>'}</div>
 ${s.k=='open'?`<button class="btn" onclick="start('${l.id}')">${s.d.length?'حاول تاني':'ابدأ الاختبار'} 🚀</button>`:''}</div>`}
const stat=(e,t,v)=>`<div class="card stat"><div class="e">${e}</div><b>${v}</b><span>${t}</span></div>`;
function skl(at){return[['📚','مفردات'],['✏️','قواعد'],['📖','قراءة']].map(s=>{const a=at.filter(x=>x.sk==s[1]).map(x=>x.p);
 return `<div class="skill"><span style="font-size:28px">${s[0]}</span><span style="width:80px;font-weight:800">${s[1]}</span><div class="bar"><i style="width:${avg(a)}%"></i></div><b>${a.length?avg(a)+'%':'—'}</b></div>`}).join('')}
const best=at=>at.length?Math.max(...at.map(a=>a.p)):0;
const tbl=(h,rows)=>`<div style="overflow-x:auto"><table><tr>${h.map(x=>`<th>${x}</th>`).join('')}</tr>${rows.map(r=>`<tr>${r.map(x=>`<td>${x}</td>`).join('')}</tr>`).join('')||`<tr><td colspan="${h.length}">لسه مفيش حاجة هنا</td></tr>`}</table></div>`;
async function notify(){const[ls,at]=await mine();const n=ls.filter(l=>status(l,at).k=='open').length;toast(n?`📬 عندك ${n} اختبار متاح دلوقتي!`:'مفيش اختبارات جديدة دلوقتي 🌟')}
const V={
async home(){const[ls,at]=await mine(),nx=ls.find(l=>status(l,at).k=='open'),rk=l=>({open:0,done:1,lock:2})[status(l,at).k];
 return `<h1>أهلاً يا ${esc(me.name)}! 👋</h1><p class="sub">جاهز لتحدي الإنجليزي النهاردة؟</p>
 <div class="journey"><div class="lv"><div>المستوى<b>${lvl()}</b></div></div><div class="mid"><h2>رحلتك مع الإنجليزي</h2><div class="bar"><i style="width:${pct()}%"></i></div><p style="margin-top:8px;opacity:.85">برافو عليك! فاضل ${250-(me.xp||0)%250} نقطة على المستوى ${lvl()+1}</p></div>
 <div style="max-width:250px">${nx?`<p style="opacity:.85;font-weight:700">اختبار حصة ${nx.no}: ${esc(nx.title)}</p><button class="btn" onclick="start('${nx.id}')">ابدأ الاختبار 🚀</button>`:'<p style="font-weight:700">مفيش اختبار متاح دلوقتي 🎉<br>هيظهر لما المدرس يفتح الحصة الجاية</p>'}</div></div>
 <h2>أنا عامل إيه</h2><div class="grid">${stat('📝','اختبارات خلّصتها',at.length)}${stat('🏆','أحسن درجة',best(at)+'%')}${stat('⭐','نقاطي',me.xp||0)}${stat('🔥','أيام متتالية',me.streak||0)}</div>
 <h2>حصصي</h2>${ls.length?[...ls].sort((a,b)=>rk(a)-rk(b)).slice(0,4).map(l=>lcard(l,at)).join(''):'<div class="card">المدرس لسه ما ضافش حصص 📚</div>'}
 <button class="btn ghost sm" onclick="go('lessons')">كل الحصص</button>`},
async student_lessons(){const[ls,at]=await mine();let u='',o='';
 ls.forEach(l=>{if((l.unit||'')!=u){u=l.unit||'';o+=`<h2>${esc(u||'الحصص')}</h2>`}o+=lcard(l,at)});
 return `<h1>حصصي 📚</h1><p class="sub">كل حصة ليها اختبار بيتفتح بعد ما نخلّص الحصة.</p>${o||'<div class="card">لسه مفيش حصص</div>'}`},
async progress(){const[,at]=await mine();
 return `<h1>تقدمي 📈</h1><p class="sub">كمّل وهتتحسن كل يوم!</p>${at.length?`<div class="card"><h3 style="color:var(--navy)">درجاتي</h3><canvas id="c" height="120"></canvas></div><h2>أحسن درجة: ${best(at)}% 🏆</h2>`:'<div class="card stat"><div class="e">📈</div><p>أول اختبار هتعمله هيظهر هنا</p></div>'}<h2>مهاراتي</h2><div class="card light">${skl(at)}</div>`},
profile(){const has=n=>(me.badges||[]).includes(n);
 return `<h1>${esc(me.name)} 👤</h1><p class="sub">${esc(me.grade||'')} · المستوى ${lvl()} · ⭐ ${me.xp||0} · 🔥 ${me.streak||0}</p><h2>شاراتي</h2><div class="badges">${ALLB.map(b=>`<div class="card badge ${has(b)?'':'lock'}"><div class="e">${b.split(' ').pop()}</div><b>${b.replace(/ \S+$/,'')}</b></div>`).join('')}</div><p class="sub" style="margin-top:14px">الشارات المقفولة مستنياك تكسبها!</p><button class="btn ghost" onclick="auth.signOut()">تسجيل الخروج</button>`},
quiz(){const x=Q.x,c=x.q[Q.i],last=Q.i==x.q.length-1;
 return `<div class="qhead"><span>${esc(Q.l.title)}</span><span>سؤال ${Q.i+1} من ${x.q.length}</span><span class="timer" id="tm">⏱ --:--</span></div>
 <div class="qbox"><div class="bar"><i style="width:${(Q.i+1)/x.q.length*100}%"></i></div></div>
 <div class="card"><div class="q"><small>اختار الإجابة الصح:</small><span dir="auto">${esc(c.t)}</span></div>${c.a.map((a,k)=>`<button class="ans ${Q.a[Q.i]===k?'sel':''}" onclick="pick(${k})"><i>${L[k]}</i><span dir="auto">${esc(a)}</span></button>`).join('')}
 <div class="cheer">${Q.a[Q.i]!=null?['اختيار حلو! 🌟','كمّل، انت شاطر! 💪','أنت بتعمل شغل ممتاز!'][Q.i%3]:''}</div>
 <div class="nav2"><button class="btn ghost" ${Q.i?'':'disabled style="opacity:.4"'} onclick="mv(-1)">→ السابق</button><button class="btn ${last?'':'blue'}" onclick="${last?'finish()':'mv(1)'}">${last?'إنهاء الاختبار 🏆':'التالي ←'}</button></div></div>`},
result(){const r=Q.r;return `<div class="card res"><h1>🎉 ${r.p>=80?'برافو عليك':'محاولة حلوة'} يا ${esc(me.name)}!</h1><p class="sub">درجتك:</p><div class="big">${r.c} / ${r.n}</div><div class="pc">${r.p}%</div><div class="xp">⭐ +${r.p} نقطة</div>
 <div class="grid" style="margin-top:14px"><div class="stat"><b>${r.c}</b><span>إجابات صح</span></div><div class="stat"><b>${r.n-r.c}</b><span>محتاجة مراجعة</span></div><div class="stat"><b>${r.t}</b><span>الوقت</span></div></div>
 <p style="margin-top:18px;font-weight:700">${r.p>=80?'شغل ممتاز! بتتحسن كل مرة.':'كل محاولة بتخليك أحسن. كمّل!'}</p>
 ${r.nb.map(b=>`<div class="unlock">🏆 شارة جديدة!<br><b style="font-size:22px">${b}</b></div>`).join('')}
 <div class="row">${Q.x.showAnswers?'<button class="btn blue" onclick="review()">راجع إجاباتك</button>':''}<button class="btn" onclick="go(\'home\')">الرئيسية</button></div></div><div id="rv"></div>`},
/* ---------- المدرس ---------- */
async overview(){const[st,ls,qz,at]=await Promise.all([get('users',r=>r.where('role','==','student')),get('lessons'),get('quizzes'),get('attempts')]);at.sort((a,b)=>b.t-a.t);
 return `<h1>نظرة عامة</h1><p class="sub">أحوال طلابك في لمحة.</p><div class="grid">${[['عدد الطلاب',st.length],['الحصص',ls.length],['الاختبارات',qz.length],['المحاولات',at.length],['متوسط الدرجات',avg(at.map(a=>a.p))+'%']].map(s=>`<div class="card stat"><b>${s[1]}</b><span>${s[0]}</span></div>`).join('')}</div>
 <h2>آخر النتائج</h2><div class="card">${tbl(['الطالب','الاختبار','الدرجة','التاريخ'],at.slice(0,10).map(a=>[esc(a.name),esc(a.qt),`<b>${a.p}%</b>`,dt(a.t)]))}</div>`},
async teacher_lessons(){const[ls,qz]=await Promise.all([get('lessons'),get('quizzes')]);ls.sort((a,b)=>a.no-b.no);const pq=qz.filter(x=>x.published);
 return `<h1>المنهج والحصص 📚</h1><p class="sub">اربط كل حصة باختبار، وافتحه للطالب بعد الحصة.</p>
 <div class="card"><div class="f"><div><label>رقم الحصة</label><input id="ln" type="number" value="${ls.length+1}"></div><div style="grid-column:span 2"><label>اسم الحصة</label><input id="lt" dir="auto"></div><div><label>الوحدة</label><input id="lw" dir="auto" placeholder="الوحدة 1"></div></div><button class="btn blue sm" onclick="addLesson()">+ ضيف حصة</button>${!ls.length&&!qz.length?' <button class="btn ghost sm" onclick="sample()">جرّب بمنهج تجريبي</button>':''}</div>
 <h2>الحصص</h2>${ls.map(l=>`<div class="card lesson ${l.open?'open':'lock'}"><div class="no">${l.no}</div><div class="lb"><h3>${esc(l.title)}</h3><div class="meta">${esc(l.unit||'')}</div>
 <div class="f" style="margin:8px 0 0"><select onchange="setL('${l.id}',{quizId:this.value})"><option value="">— اختار الاختبار —</option>${pq.map(x=>`<option value="${x.id}" ${x.id==l.quizId?'selected':''}>${esc(x.title)}</option>`).join('')}</select>
 <select onchange="setL('${l.id}',{tries:+this.value})">${[1,2,3].map(n=>`<option value="${n}" ${n==(l.tries||1)?'selected':''}>عدد المحاولات: ${n}</option>`).join('')}</select></div></div>
 <div><button class="btn ${l.open?'ghost':''} sm" onclick="tog('${l.id}',${!l.open},${!!l.quizId})">${l.open?'🔒 اقفل الاختبار':'🔓 افتح الاختبار'}</button> <button class="btn ghost sm" onclick="delDoc('lessons','${l.id}')">🗑</button></div></div>`).join('')||'<div class="card">ضيف أول حصة من فوق ☝️</div>'}`},
async quizzes(){const qz=await get('quizzes');
 return `<h1>الاختبارات 📝</h1><p class="sub">اعمل اختبار، وبعدين اربطه بحصة من صفحة المنهج.</p><button class="btn" onclick="draft=null;go('create')">+ اختبار جديد</button><h2>اختباراتي</h2>${qz.map(x=>`<div class="card lesson"><div class="lb"><h3>${esc(x.title)}</h3><div class="meta">${x.q.length} أسئلة · ${x.mins} دقيقة · ${esc(x.sk)} · ${x.published?'✅ منشور':'📝 مسودة'}</div></div><button class="btn ghost sm" onclick="editQ('${x.id}')">تعديل</button> <button class="btn ghost sm" onclick="delDoc('quizzes','${x.id}')">🗑</button></div>`).join('')||'<div class="card">لسه مفيش اختبارات</div>'}`},
create(){const d=draft||(draft={title:'',mins:15,diff:'سهل',sk:'قواعد',showAnswers:false,qs:[nq()]}),op=(a,v)=>a.map(g=>`<option ${g==v?'selected':''}>${g}</option>`).join('');
 return `<h1>${d.id?'تعديل الاختبار':'اختبار جديد'} ✍️</h1><div class="card"><div class="f"><div style="grid-column:span 2"><label>اسم الاختبار</label><input dir="auto" value="${esc(d.title)}" oninput="draft.title=this.value"></div><div><label>المهارة</label><select onchange="draft.sk=this.value">${op(SK,d.sk)}</select></div><div><label>الصعوبة</label><select onchange="draft.diff=this.value">${op(['سهل','متوسط','صعب'],d.diff)}</select></div><div><label>المدة (دقيقة)</label><input type="number" min="1" value="${d.mins}" oninput="draft.mins=+this.value"></div></div>
 <label style="display:flex;gap:10px;align-items:center"><input type="checkbox" style="width:24px" ${d.showAnswers?'checked':''} onchange="draft.showAnswers=this.checked"> اسمح للطالب يراجع الإجابات الصح بعد الاختبار</label></div>
 <h2>الأسئلة</h2>${d.qs.map((q,i)=>`<div class="card qe"><div class="f"><div style="grid-column:span 2"><label>سؤال ${i+1}</label><input dir="auto" value="${esc(q.t)}" oninput="draft.qs[${i}].t=this.value"></div><div><label>النوع</label><select onchange="setType(${i},this.value)"><option ${q.tf?'':'selected'}>اختيار من متعدد</option><option ${q.tf?'selected':''}>صح / غلط</option></select></div><div><label>الدرجة</label><input type="number" min="1" value="${q.p}" oninput="draft.qs[${i}].p=+this.value"></div></div>
 ${q.a.slice(0,q.tf?2:4).map((a,k)=>`<div class="ansrow"><input type="radio" name="r${i}" ${q.c==k?'checked':''} onchange="draft.qs[${i}].c=${k}"><input dir="auto" ${q.tf?'readonly':''} value="${esc(a)}" placeholder="الإجابة ${L[k]}" oninput="draft.qs[${i}].a[${k}]=this.value"></div>`).join('')}
 <p class="meta" style="margin:6px 0">اضغط على الدايرة جنب الإجابة الصح.</p><div class="row" style="justify-content:flex-start;margin:0"><button class="btn ghost sm" onclick="mq(${i},-1)">↑</button><button class="btn ghost sm" onclick="mq(${i},1)">↓</button><button class="btn ghost sm" onclick="dq(${i})">🗑 احذف</button></div></div>`).join('')}
 <div class="row" style="justify-content:flex-start"><button class="btn blue" onclick="draft.qs.push(nq());go('create')">+ ضيف سؤال</button><button class="btn ghost" onclick="saveQ(false)">حفظ كمسودة</button><button class="btn" onclick="saveQ(true)">نشر الاختبار</button></div>`},
async students(){STC=await get('users',r=>r.where('role','==','student'));
 return `<h1>الطلاب 🎓</h1><div class="card"><div class="f"><div><label>الاسم</label><input id="sn" dir="auto"></div><div><label>اسم المستخدم (إنجليزي)</label><input id="su" dir="ltr" placeholder="ahmed2015"></div><div><label>كلمة السر (٦ حروف+)</label><input id="sp" dir="ltr"></div><div><label>الصف</label><input id="sg" value="الصف الرابع الابتدائي"></div></div><button class="btn blue sm" onclick="addStudent()">+ ضيف طالب</button></div>
 <h2>طلابي</h2><div class="grid">${STC.map(s=>`<div class="card qc"><h3>${esc(s.name)}</h3><div class="meta">${esc(s.grade||'')} · ${esc(s.username||'')}</div><button class="btn sm" onclick="sel='${s.id}';go('student')">شوف التفاصيل</button></div>`).join('')||'<div class="card">ضيف أول طالب ☝️</div>'}</div>`},
async student(){const s=STC.find(x=>x.id==sel),at=await get('attempts',r=>r.where('uid','==',sel));at.sort((a,b)=>b.t-a.t);
 const w=SK.map(k=>[k,at.filter(a=>a.sk==k)]).filter(x=>x[1].length).sort((a,b)=>avg(a[1].map(z=>z.p))-avg(b[1].map(z=>z.p)))[0];
 return `<button class="btn ghost sm" onclick="go('students')">→ رجوع</button><h1 style="margin-top:12px">${esc(s.name)}</h1><p class="sub">${esc(s.grade||'')}</p>
 <div class="grid">${[['متوسط الدرجات',avg(at.map(a=>a.p))+'%'],['اختبارات خلّصها',at.length],['أحسن درجة',best(at)+'%'],['أيام متتالية',s.streak||0]].map(x=>`<div class="card stat"><b>${x[1]}</b><span>${x[0]}</span></div>`).join('')}</div>
 ${w?`<div class="tip">💡 <b>راجع مع ${esc(s.name)}:</b> أضعف مهارة عنده هي ${w[0]} (${avg(w[1].map(z=>z.p))}%). ركّز عليها في الحصة الجاية.</div>`:''}
 <h2>المهارات</h2><div class="card light">${skl(at)}</div><h2>آخر الاختبارات</h2><div class="card">${tbl(['الاختبار','الدرجة','التاريخ'],at.slice(0,10).map(a=>[esc(a.qt),`<b>${a.p}%</b>`,dt(a.t)]))}</div>`}};
V.lessons=()=>me.role=='teacher'?V.teacher_lessons():V.student_lessons();
/* ---------- الاختبار ---------- */
async function start(id){const l=(await db.collection('lessons').doc(id).get()).data();l.id=id;const x=(await db.collection('quizzes').doc(l.quizId).get()).data();
 if(!x||!x.q||!x.q.length)return toast('الاختبار ده لسه مش جاهز');Q={l,x,i:0,a:[],t0:Date.now()};go('quiz')}
function tick(){const e=$('#tm');if(!e)return;const l=Q.x.mins*60-Math.floor((Date.now()-Q.t0)/1000);if(l<=0){finish();return}e.textContent='⏱ '+fmt(l)}
function pick(k){Q.a[Q.i]=k;$('#main').innerHTML=V.quiz()}
function mv(d){Q.i+=d;go('quiz')}
async function finish(){clearInterval(timer);const x=Q.x,tp=x.q.reduce((s,q)=>s+q.p,0),ep=x.q.reduce((s,q,i)=>s+(Q.a[i]===q.c?q.p:0),0),c=x.q.filter((q,i)=>Q.a[i]===q.c).length,p=Math.round(ep/tp*100),sec=Math.min(x.mins*60,Math.floor((Date.now()-Q.t0)/1000));
 const B=new Set(me.badges||[]),had=B.size,nb=[],add=b=>{if(!B.has(b)){B.add(b);nb.push(b)}};
 const today=new Date().toLocaleDateString('en-CA'),y=new Date(Date.now()-864e5).toLocaleDateString('en-CA');let st=me.streak||0;if(me.lastDay!=today)st=me.lastDay==y?st+1:1;
 add(ALLB[0]);if(p>=90&&x.sk=='قواعد')add(ALLB[1]);if(p==100)add(ALLB[2]);if(st>=7)add(ALLB[3]);
 const up={xp:(me.xp||0)+p,streak:st,lastDay:today,badges:[...B]};
 try{await db.collection('attempts').add({uid:me.uid,name:me.name,quizId:Q.l.quizId,lessonId:Q.l.id,qt:Q.l.title,sk:x.sk,c,n:x.q.length,p,sec,a:Q.a.map(v=>v??-1),t:Date.now()});await db.collection('users').doc(me.uid).update(up);Object.assign(me,up)}catch(e){toast('النتيجة ما اتسجلتش، اتأكد من النت')}
 Q.r={c,n:x.q.length,p,nb:had?nb:[ALLB[0],...nb.filter(b=>b!=ALLB[0])],t:fmt(sec)};go('result')}
function review(){$('#rv').innerHTML='<h2>راجع إجاباتك</h2>'+Q.x.q.map((q,i)=>`<div class="card" style="margin-bottom:14px"><div class="q" style="font-size:22px">${i+1}. ${esc(q.t)}</div>${q.a.map((a,k)=>`<div class="ans ${k==q.c?'ok':Q.a[i]==k?'no':''}" style="font-size:18px;padding:12px;margin-bottom:8px"><i>${L[k]}</i><span dir="auto">${esc(a)}${k==q.c?' ✓':''}</span></div>`).join('')}</div>`).join('');$('#rv').scrollIntoView({behavior:'smooth'})}
function chart(){const el=$('#c');if(!el)return;mine().then(([,at])=>{ch&&ch.destroy();ch=new Chart(el,{type:'line',data:{labels:at.map(a=>dt(a.t)),datasets:[{data:at.map(a=>a.p),borderColor:'#2563EB',backgroundColor:'#38BDF833',fill:true,tension:.35,pointBackgroundColor:'#F59E0B',pointRadius:5}]},options:{plugins:{legend:{display:false}},scales:{y:{min:0,max:100}}}})})}
/* ---------- إدارة المدرس ---------- */
const nq=()=>({t:'',a:['','','',''],c:0,p:1,tf:false});
function setType(i,v){const q=draft.qs[i];q.tf=v!='اختيار من متعدد';q.a=q.tf?['صح','غلط','','']:['','','',''];q.c=0;go('create')}
function mq(i,d){const a=draft.qs,j=i+d;if(j<0||j>=a.length)return;[a[i],a[j]]=[a[j],a[i]];go('create')}
function dq(i){draft.qs.splice(i,1);if(!draft.qs.length)draft.qs.push(nq());go('create')}
async function saveQ(pub){const d=draft;if(!d.title.trim())return toast('اكتب اسم الاختبار الأول');
 if(pub&&d.qs.some(q=>!q.t.trim()||q.a.slice(0,q.tf?2:4).some(a=>!a.trim())))return toast('كمّل كل الأسئلة والإجابات قبل النشر');
 const doc={title:d.title.trim(),mins:d.mins||15,diff:d.diff,sk:d.sk,showAnswers:!!d.showAnswers,published:pub,q:d.qs.map(q=>({t:q.t.trim(),a:q.a.slice(0,q.tf?2:4).map(a=>a.trim()),c:q.c,p:q.p||1}))};
 try{d.id?await db.collection('quizzes').doc(d.id).set(doc):await db.collection('quizzes').add(doc);toast(pub?'تم النشر ✅':'تم حفظ المسودة ✅');draft=null;go('quizzes')}catch(e){toast('حصلت مشكلة في الحفظ')}}
async function editQ(id){const x=(await db.collection('quizzes').doc(id).get()).data();draft={id,title:x.title,mins:x.mins,diff:x.diff,sk:x.sk,showAnswers:x.showAnswers,qs:x.q.map(q=>({t:q.t,a:[...q.a,'',''].slice(0,4),c:q.c,p:q.p,tf:q.a.length==2}))};go('create')}
async function addLesson(){const t=$('#lt').value.trim();if(!t)return toast('اكتب اسم الحصة');await db.collection('lessons').add({no:+$('#ln').value||1,title:t,unit:$('#lw').value.trim(),quizId:'',open:false,tries:1});go('lessons')}
async function setL(id,o){await db.collection('lessons').doc(id).update(o);go('lessons')}
function tog(id,open,has){if(open&&!has)return toast('اختار اختبار للحصة الأول');setL(id,{open});toast(open?'الاختبار اتفتح للطلاب 🔓':'الاختبار اتقفل 🔒')}
async function delDoc(c,id){if(!confirm('متأكد إنك عايز تحذف؟'))return;await db.collection(c).doc(id).delete();go(c=='lessons'?'lessons':'quizzes')}
async function addStudent(){const n=$('#sn').value.trim(),u=$('#su').value.trim().toLowerCase().replace(/\s/g,''),p=$('#sp').value;
 if(!n||!/^[a-z0-9._-]+$/.test(u)||p.length<6)return toast('اكتب الاسم، واسم مستخدم إنجليزي، وكلمة سر ٦ حروف على الأقل');
 try{const app=firebase.apps.find(a=>a.name=='aux')||firebase.initializeApp(firebaseConfig,'aux');const c=await app.auth().createUserWithEmailAndPassword(u+'@legend.app',p);await app.auth().signOut();
 await db.collection('users').doc(c.user.uid).set({role:'student',name:n,username:u,grade:$('#sg').value.trim(),xp:0,streak:0,lastDay:'',badges:[]});toast('تمت إضافة '+n+' ✅');go('students')}
 catch(e){toast(e.code=='auth/email-already-in-use'?'اسم المستخدم ده مستخدم قبل كده':'حصلت مشكلة، جرّب تاني')}}
async function sample(){const Z=[['Present Simple','قواعد',[['She ___ to school every day.',['go','goes','going','went'],1],['We ___ English on Sundays.',['study','studies','studying','studied'],0],['Does he ___ tea?',['likes','like','liking','liked'],1]]],
 ['Animals','مفردات',[['Which animal can fly?',['cow','eagle','horse','dog'],1],['A baby cat is called a ...',['puppy','kitten','calf','cub'],1],['Which is the biggest?',['ant','cat','elephant','bird'],2]]],
 ['Past Simple','قواعد',[['Yesterday I ___ to the park.',['go','goes','went','going'],2],['She ___ a cake last night.',['bake','baked','bakes','baking'],1],['Past of "see" is ...',['seed','saw','seen','sees'],1]]]];
 for(let i=0;i<Z.length;i++){const z=Z[i],r=await db.collection('quizzes').add({title:'اختبار '+z[0],mins:10,diff:'سهل',sk:z[1],showAnswers:true,published:true,q:z[2].map(q=>({t:q[0],a:q[1],c:q[2],p:1}))});
  await db.collection('lessons').add({no:i+1,title:z[0],unit:'الوحدة 1',quizId:r.id,open:i==0,tries:1})}toast('تم إضافة منهج تجريبي ✅');go('lessons')}
/* ---------- تثبيت كتطبيق ---------- */
let dip=null;
if('serviceWorker' in navigator)addEventListener('load',()=>navigator.serviceWorker.register('sw.js').catch(()=>{}));
addEventListener('beforeinstallprompt',e=>{e.preventDefault();dip=e;$('#inst').hidden=false;if(!localStorage.instAsked){localStorage.instAsked=1;setTimeout(()=>toast('📲 تقدر تثبّت التطبيق من قائمة حسابك'),3500)}});
addEventListener('appinstalled',()=>{dip=null;$('#inst').hidden=true;toast('اتثبّت! هتلاقيه على شاشتك 🎉')});
async function install(){if(!dip)return;dip.prompt();await dip.userChoice;dip=null;$('#inst').hidden=true;$('#menu').classList.remove('open')}
if(/iphone|ipad/i.test(navigator.userAgent)&&!navigator.standalone)addEventListener('load',()=>{if(!localStorage.iosAsked){localStorage.iosAsked=1;setTimeout(()=>toast('على الآيفون: اضغط زرار المشاركة ثم "إضافة إلى الشاشة الرئيسية" 📲'),4000)}});
