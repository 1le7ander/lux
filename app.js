'use strict';

const CONFIG = {
  firebase:{apiKey:"FIREBASE_API_KEY",authDomain:"PROJECT.firebaseapp.com",projectId:"PROJECT_ID",storageBucket:"PROJECT.appspot.com",messagingSenderId:"SENDER_ID",appId:"APP_ID"},
  emailjs:{serviceId:"service_XXXXXXX",templateId:"template_XXXXXXX",publicKey:"XXXXXXXXXXXXXXX",to:"heamtan126@gmail.com"},
  sheetsWebappUrl:"YOUR_APPS_SCRIPT_WEBAPP_URL",
  driveFolderId:"1viIogXrZm2dpdf3kKO-ohrO_2Ejsgss6",
  whatsappNumber:"213555000000",
  storeName:"LUXE",
  contactEmail:"heamtan126@gmail.com"
};

// SHA-256 precomputed hashes for admin "LUXE" / "Lux999@@009"
const ADMIN_USER_HASH="73072cd87e76698c708271864db4f4786bdb4075913d5fbaee44d32871dfc094";
const ADMIN_PASS_HASH="ba561b12d189920f33cff28606a45fec7e352155fdf9e5bb2c1c64b51f5c91fe";
const SESSION_TTL_MS=30*60*1000;
const LOCKOUT_ATTEMPTS=5;
const LOCKOUT_MS=15*60*1000;

const WILAYAS=[
  [1,'Adrar','أدرار'],[2,'Chlef','الشلف'],[3,'Laghouat','الأغواط'],[4,'Oum El Bouaghi','أم البواقي'],
  [5,'Batna','باتنة'],[6,'Béjaïa','بجاية'],[7,'Biskra','بسكرة'],[8,'Béchar','بشار'],[9,'Blida','البليدة'],
  [10,'Bouira','البويرة'],[11,'Tamanrasset','تمنراست'],[12,'Tébessa','تبسة'],[13,'Tlemcen','تلمسان'],
  [14,'Tiaret','تيارت'],[15,'Tizi Ouzou','تيزي وزو'],[16,'Alger','الجزائر'],[17,'Djelfa','الجلفة'],
  [18,'Jijel','جيجل'],[19,'Sétif','سطيف'],[20,'Saïda','سعيدة'],[21,'Skikda','سكيكدة'],
  [22,'Sidi Bel Abbès','سيدي بلعباس'],[23,'Annaba','عنابة'],[24,'Guelma','قالمة'],[25,'Constantine','قسنطينة'],
  [26,'Médéa','المدية'],[27,'Mostaganem','مستغانم'],[28,"M'Sila",'المسيلة'],[29,'Mascara','معسكر'],
  [30,'Ouargla','ورقلة'],[31,'Oran','وهران'],[32,'El Bayadh','البيض'],[33,'Illizi','إليزي'],
  [34,'Bordj Bou Arréridj','برج بوعريريج'],[35,'Boumerdès','بومرداس'],[36,'El Tarf','الطارف'],
  [37,'Tindouf','تندوف'],[38,'Tissemsilt','تيسمسيلت'],[39,'El Oued','الوادي'],[40,'Khenchela','خنشلة'],
  [41,'Souk Ahras','سوق أهراس'],[42,'Tipaza','تيبازة'],[43,'Mila','ميلة'],[44,'Aïn Defla','عين الدفلى'],
  [45,'Naâma','النعامة'],[46,'Aïn Témouchent','عين تيموشنت'],[47,'Ghardaïa','غرداية'],[48,'Relizane','غليزان'],
  [49,'Timimoun','تيميمون'],[50,'Bordj Badji Mokhtar','برج باجي مختار'],[51,'Ouled Djellal','أولاد جلال'],
  [52,'Béni Abbès','بني عباس'],[53,'In Salah','عين صالح'],[54,'In Guezzam','عين قزام'],[55,'Touggourt','تقرت'],
  [56,'Djanet','جانت'],[57,"El M'Ghair",'المغير'],[58,'El Menia','المنيعة']
];

const SEED_CATEGORIES=[
  {id:'men',nameAr:'ملابس رجالية',nameFr:'Men',icon:'👔',cover:'https://picsum.photos/seed/men/600/400',gradient:'linear-gradient(135deg,#7c3aed,#14002b)'},
  {id:'women',nameAr:'ملابس نسائية',nameFr:'Women',icon:'👗',cover:'https://picsum.photos/seed/women/600/400',gradient:'linear-gradient(135deg,#ec4899,#7c3aed)'},
  {id:'kids',nameAr:'الأطفال',nameFr:'Kids',icon:'🧒',cover:'https://picsum.photos/seed/kids/600/400',gradient:'linear-gradient(135deg,#f59e0b,#ef4444)'},
  {id:'accessories',nameAr:'الإكسسوارات',nameFr:'Accessories',icon:'💍',cover:'https://picsum.photos/seed/acc/600/400',gradient:'linear-gradient(135deg,#fbbf24,#d4af37)'},
  {id:'shoes',nameAr:'الأحذية',nameFr:'Shoes',icon:'👟',cover:'https://picsum.photos/seed/shoes/600/400',gradient:'linear-gradient(135deg,#06b6d4,#3b82f6)'},
  {id:'perfume',nameAr:'العطور',nameFr:'Perfume',icon:'🌹',cover:'https://picsum.photos/seed/perfume/600/400',gradient:'linear-gradient(135deg,#f43f5e,#b91c1c)'}
];

const SEED_PRODUCTS=(()=>{
  const pics=(seed,n=3)=>Array.from({length:n},(_,i)=>'https://picsum.photos/seed/'+seed+i+'/600/800');
  return [
    {id:'p1',name:'قميص رجالي كلاسيكي',category:'men',price:4500,oldPrice:6000,stock:12,trending:true,bestSeller:false,isNew:true,featured:true,placement:'trending',sortOrder:1,description:'قميص رجالي أنيق بخامة قطنية فاخرة، تصميم كلاسيكي يناسب جميع المناسبات.',features:['قطن 100% عالي الجودة','تصميم كلاسيكي يناسب العمل والمناسبات','متوفر بعدة ألوان','قابل للغسل في الغسالة'],images:pics('shirt1'),sizes:['S','M','L','XL'],colors:['#1e293b','#f8fafc','#3730a3']},
    {id:'p2',name:'بدلة رجالية راقية',category:'men',price:15000,oldPrice:18000,stock:5,trending:true,bestSeller:true,isNew:false,featured:true,placement:'featured',sortOrder:2,description:'بدلة رجالية فاخرة من الصوف الإيطالي، مثالية للمناسبات الرسمية.',features:['صوف إيطالي ممتاز','قصّة عصرية وأنيقة','بطانة حريرية داخلية','خياطة يدوية دقيقة'],images:pics('suit1'),sizes:['48','50','52','54'],colors:['#0f172a','#1e1b4b','#450a0a']},
    {id:'p3',name:'فستان سهرة طويل',category:'women',price:12000,stock:8,trending:true,bestSeller:true,isNew:true,featured:true,placement:'trending',sortOrder:3,description:'فستان سهرة طويل بتصميم أنيق يبرز جمالك في جميع المناسبات الراقية.',features:['قماش شيفون راقي','تصميم يمنح إطلالة ملكية','تفاصيل مطرزة يدوياً','متوفر بعدة ألوان'],images:pics('dress1'),sizes:['S','M','L','XL'],colors:['#7c3aed','#be185d','#0f172a']},
    {id:'p4',name:'عباءة مطرزة',category:'women',price:8500,oldPrice:10500,stock:15,trending:false,bestSeller:true,isNew:false,featured:true,placement:'offers',sortOrder:4,description:'عباءة فخمة مطرزة بأيادٍ ماهرة، تجمع بين الأصالة والأناقة العصرية.',features:['قماش كريب فاخر','تطريز يدوي بخيوط ذهبية','تصميم عصري وراقٍ','مناسبة لجميع المناسبات'],images:pics('abaya1'),sizes:['M','L','XL'],colors:['#1e1b4b','#111827','#450a0a']},
    {id:'p5',name:'طقم أطفال صيفي',category:'kids',price:2500,stock:30,trending:false,bestSeller:false,isNew:true,featured:false,placement:'trending',sortOrder:5,description:'طقم أطفال مريح بألوان مبهجة، مصنوع من قماش قطني ناعم.',features:['قطن 100% خفيف وناعم','ألوان زاهية لا تبهت','مقاسات متنوعة من 2 إلى 10 سنوات','تصميم مريح للعب اليومي'],images:pics('kids1'),sizes:['2-4','4-6','6-8','8-10'],colors:['#fbbf24','#ef4444','#3b82f6']},
    {id:'p6',name:'حذاء أطفال رياضي',category:'kids',price:3200,oldPrice:4000,stock:18,trending:true,bestSeller:false,isNew:false,featured:false,placement:'trending',sortOrder:6,description:'حذاء أطفال رياضي مريح وخفيف، مثالي للأنشطة اليومية والرياضية.',features:['نعل مرن مضاد للانزلاق','قماش شبكي يسمح بالتهوية','إغلاق بفيلكرو لسهولة الارتداء','متوفر بألوان متعددة'],images:pics('kidsShoes'),sizes:['28','30','32','34'],colors:['#ef4444','#3b82f6','#10b981']},
    {id:'p7',name:'ساعة فاخرة',category:'accessories',price:13500,oldPrice:16000,stock:4,trending:true,bestSeller:true,isNew:false,featured:true,placement:'featured',sortOrder:7,description:'ساعة فاخرة بتصميم كلاسيكي، سوار من الستانلس ستيل ومقاومة للماء.',features:['حركة يابانية عالية الدقة','مقاومة للماء حتى 50 متر','سوار ستانلس ستيل مصقول','ضمان لمدة سنتين'],images:pics('watch1'),sizes:[],colors:['#d4af37','#94a3b8','#1e293b']},
    {id:'p8',name:'محفظة جلدية فاخرة',category:'accessories',price:6800,stock:20,trending:false,bestSeller:true,isNew:false,featured:true,placement:'featured',sortOrder:8,description:'محفظة من الجلد الطبيعي الفاخر، بتصميم أنيق ومساحة واسعة.',features:['جلد طبيعي 100%','مساحات متعددة للبطاقات والنقود','تصميم أنيق ومتين','ألوان كلاسيكية'],images:pics('wallet1'),sizes:[],colors:['#78350f','#1e293b','#450a0a']},
    {id:'p9',name:'حذاء رياضي راقٍ',category:'shoes',price:7200,oldPrice:8500,stock:14,trending:true,bestSeller:false,isNew:true,featured:true,placement:'trending',sortOrder:9,description:'حذاء رياضي بتصميم عصري يجمع بين الأناقة والراحة.',features:['نعل مبطن لامتصاص الصدمات','جلد صناعي عالي الجودة','تهوية ممتازة للقدم','تصميم يناسب اليومي والرياضة'],images:pics('sneakers'),sizes:['40','41','42','43','44'],colors:['#0f172a','#f8fafc','#7c3aed']},
    {id:'p10',name:'حذاء رسمي جلدي',category:'shoes',price:9800,stock:7,trending:false,bestSeller:true,isNew:false,featured:false,placement:'featured',sortOrder:10,description:'حذاء رسمي من الجلد الطبيعي، يضفي لمسة من الأناقة على إطلالتك.',features:['جلد طبيعي إيطالي','نعل جلدي متين','تصنيع يدوي فاخر','مثالي للمناسبات الرسمية'],images:pics('formalShoes'),sizes:['40','41','42','43','44'],colors:['#1e1b4b','#78350f','#111827']},
    {id:'p11',name:'عطر شرقي فاخر',category:'perfume',price:8500,oldPrice:11000,stock:22,trending:true,bestSeller:true,isNew:true,featured:true,placement:'offers',sortOrder:11,description:'عطر شرقي بمزيج فريد من العود والعنبر والمسك، يترك انطباعاً لا يُنسى.',features:['مزيج شرقي فاخر','ثبات طويل يصل إلى 12 ساعة','زجاجة أنيقة 100 مل','يأتي بعلبة هدية فاخرة'],images:pics('perfume1'),sizes:['50ml','100ml'],colors:[]},
    {id:'p12',name:'عطر نسائي زهري',category:'perfume',price:7200,stock:16,trending:false,bestSeller:false,isNew:true,featured:false,placement:'featured',sortOrder:12,description:'عطر نسائي راقٍ بروائح زهرية ناعمة تمنحك إطلالة أنثوية جذابة.',features:['مزيج زهري ناعم ومميز','ثبات ممتاز طوال اليوم','تصميم زجاجة أنيق','مثالي للاستخدام اليومي'],images:pics('perfume2'),sizes:['50ml','100ml'],colors:[]}
  ];
})();

const SEED_OFFERS=[
  {id:'o1',title:'خصم 30% على الملابس الرجالية',description:'اشترِ الآن ووفر 30% على مجموعتنا الرجالية الكاملة',code:'MEN30',discount:30,endsAt:Date.now()+7*864e5,link:'#category/men',active:true,icon:'👔'},
  {id:'o2',title:'توصيل مجاني لجميع الولايات',description:'احصل على توصيل مجاني لطلبك بدون حد أدنى',code:'FREESHIP',discount:0,endsAt:Date.now()+14*864e5,link:'#home',active:true,icon:'🚚'},
  {id:'o3',title:'الكولكشن الجديدة — خصم الإطلاق',description:'اكتشف الوصول الجديد مع خصم إطلاق حصري 20%',code:'NEW20',discount:20,endsAt:Date.now()+3*864e5,link:'#home',active:true,icon:'✨'}
];

const SEED_SETTINGS={storeName:'LUXE',whatsappNumber:'213555000000',contactEmail:'heamtan126@gmail.com',maintenanceMode:false,deliveryPrices:Object.fromEntries(WILAYAS.map(([n,en])=>[en,n<=20?500:n<=40?700:900]))};

const TESTIMONIALS=[
  {name:'أمينة بن صالح',wilaya:'الجزائر',rating:5,text:'خدمة ممتازة وجودة عالية! الملابس وصلت بسرعة وبتغليف أنيق جداً. سأطلب مرة أخرى بالتأكيد.'},
  {name:'كريم زروالي',wilaya:'وهران',rating:5,text:'أفضل متجر أزياء جربته، الأسعار معقولة والجودة رائعة. الدعم عبر واتساب سريع ومفيد.'},
  {name:'سارة ميموني',wilaya:'قسنطينة',rating:5,text:'فستان رائع وبجودة تفوق التوقعات! التوصيل كان في اليوم التالي. شكراً LUXE!'}
];

const STORE_KEYS={products:'luxe_products',categories:'luxe_categories',offers:'luxe_offers',orders:'luxe_orders',cart:'luxe_cart',settings:'luxe_settings',adminLockout:'luxe_admin_lockout'};
const SESSION_KEYS={token:'luxe_admin_token',tokenExpires:'luxe_admin_expires'};

const state={products:[],categories:[],offers:[],orders:[],cart:[],settings:Object.assign({},SEED_SETTINGS),route:{name:'home',params:{}}};

const $=(s,r)=>(r||document).querySelector(s);
const $$=(s,r)=>Array.from((r||document).querySelectorAll(s));
const esc=(s)=>String(s==null?'':s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'})[c]);
const fmtDZD=(n)=>new Intl.NumberFormat('ar-DZ').format(Math.round(Number(n)||0))+' دج';
const debounce=(fn,ms=300)=>{let t;return (...a)=>{clearTimeout(t);t=setTimeout(()=>fn.apply(null,a),ms)}};
const clone=(o)=>JSON.parse(JSON.stringify(o));

function loadState(){
  for(const k of Object.keys(STORE_KEYS)){
    try{const raw=localStorage.getItem(STORE_KEYS[k]);if(raw)state[k]=JSON.parse(raw)}catch(e){}
  }
  if(!state.products || !state.products.length)state.products=clone(SEED_PRODUCTS);
  if(!state.categories || !state.categories.length)state.categories=clone(SEED_CATEGORIES);
  if(!state.offers || !state.offers.length)state.offers=clone(SEED_OFFERS);
  if(!state.orders)state.orders=[];
  if(!state.cart)state.cart=[];
  if(!state.settings || !state.settings.storeName)state.settings=Object.assign({},SEED_SETTINGS,state.settings||{});
  persistAll();
}
function persist(key){try{localStorage.setItem(STORE_KEYS[key],JSON.stringify(state[key]))}catch(e){}}
function persistAll(){Object.keys(STORE_KEYS).forEach(persist)}

async function sha256(text){
  const data=new TextEncoder().encode(text);
  const buf=await crypto.subtle.digest('SHA-256',data);
  return Array.from(new Uint8Array(buf)).map(b=>b.toString(16).padStart(2,'0')).join('');
}

function toast(msg,type,ttl){
  type=type||'info';ttl=ttl||4000;
  const el=document.createElement('div');
  el.className='toast toast--'+type;
  const icons={success:'✓',error:'✕',info:'i',warning:'!'};
  el.innerHTML='<div class="toast__icon">'+(icons[type]||'i')+'</div><div class="toast__body">'+esc(msg)+'</div>';
  $('#toaster').appendChild(el);
  setTimeout(()=>{el.classList.add('closing');setTimeout(()=>el.remove(),300)},ttl);
}

function confetti(){
  const box=$('#confetti');
  const colors=['#a855f7','#d4af37','#ec4899','#3b82f6','#10b981','#f59e0b'];
  for(let i=0;i<80;i++){
    const p=document.createElement('i');
    p.style.left=(Math.random()*100)+'%';
    p.style.background=colors[i%colors.length];
    p.style.animationDuration=(2+Math.random()*2)+'s';
    p.style.animationDelay=(Math.random()*0.5)+'s';
    p.style.transform='rotate('+Math.random()*360+'deg)';
    box.appendChild(p);
    setTimeout(()=>p.remove(),4500);
  }
}

const routes={home:renderHome,about:renderAbout,contact:renderContact,cart:renderCart,checkout:renderCheckout,orders:renderOrders,category:renderCategory,product:renderProduct,'admin-login':renderAdminLogin,admin:renderAdmin};

function parseHash(){
  const h=(location.hash||'#home').slice(1);
  const parts=h.split('/');
  return {name:parts[0]||'home',params:{id:parts.slice(1).join('/')||null}};
}
async function router(){
  const r=parseHash();
  state.route=r;
  const fn=routes[r.name]||routes.home;
  const app=$('#app');
  app.style.opacity='0';app.style.transform='translateY(-10px)';
  await new Promise(res=>setTimeout(res,180));
  app.innerHTML='<div class="page" id="pageContent"></div>';
  try{await fn(r.params)}catch(e){console.error(e);app.innerHTML='<div class="container section"><h2>حدث خطأ</h2><pre style="color:var(--danger);font-size:12px">'+esc(e.message)+'</pre></div>'}
  app.style.transform='';app.style.opacity='';
  window.scrollTo({top:0,behavior:'instant'});
  setActiveNav(r.name);
  revealInit();
}
window.addEventListener('hashchange',router);
function setActiveNav(name){
  $$('.nav__link').forEach(l=>l.classList.remove('active'));
  const link=document.querySelector('.nav__link[data-route="'+name+'"]');
  if(link)link.classList.add('active');
}
function navigate(hash){location.hash=hash.charAt(0)==='#'?hash:'#'+hash}
window.navigate=navigate;

function revealInit(){
  const io=new IntersectionObserver((entries)=>{
    entries.forEach(e=>{if(e.isIntersecting){e.target.classList.add('in');io.unobserve(e.target)}});
  },{threshold:0.1});
  $$('.reveal').forEach(el=>io.observe(el));
}


/* ═══════════════════════ HOME PAGE ═══════════════════════ */
async function renderHome(){
  const content=$('#pageContent');
  content.innerHTML=`
    <section class="hero">
      <div class="hero__bg"><div class="orb orb--1"></div><div class="orb orb--2"></div><div class="orb orb--3"></div></div>
      <div class="particles" id="particles"></div>
      <div class="hero__content">
        <span class="hero__label reveal">✦ الكولكشن الجديدة 2025</span>
        <h1 class="hero__title reveal">
          <span class="hero__title--1 gold-text">أزياء راقية</span>
          <span class="hero__title--2 purple-text">تعكس شخصيتك</span>
        </h1>
        <p class="hero__sub reveal">اكتشف أحدث صيحات الموضة العالمية بأسعار حصرية لعملاء LUXE في الجزائر</p>
        <div class="countdown reveal" id="heroCountdown"></div>
        <div class="hero__cta reveal">
          <button class="btn btn--primary btn--lg btn-pulse" onclick="navigate('#category/women')">
            <span>تسوّق الآن</span>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>
          </button>
          <button class="btn btn--ghost btn--lg" onclick="document.getElementById('homeCategories').scrollIntoView({behavior:'smooth'})">عرض الكولكشن</button>
        </div>
        <div class="hero__trust reveal">
          <span class="pill">✓ شحن سريع</span>
          <span class="pill">✓ ضمان الجودة</span>
          <span class="pill">✓ إرجاع مجاني</span>
          <span class="pill pill--gold">✓ دعم 24/7</span>
        </div>
      </div>
      <div class="scroll-indicator">تصفّح
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M7 13l5 5 5-5"/><path d="M7 6l5 5 5-5"/></svg>
      </div>
    </section>

    <section class="section container" id="homeCategories">
      <div class="section__head reveal">
        <span class="section__label">Categories</span>
        <h2 class="section__title">تسوق حسب التصنيف</h2>
        <p class="section__subtitle">اكتشف مجموعاتنا المختارة بعناية</p>
      </div>
      <div class="cat-grid" id="catGrid"></div>
    </section>

    <section class="section container">
      <div class="section__head reveal">
        <span class="section__label">Trending Now</span>
        <h2 class="section__title">🔥 الأكثر مبيعاً هذا الأسبوع</h2>
        <p class="section__subtitle">القطع التي يعشقها عملاؤنا</p>
      </div>
      <div class="carousel">
        <button class="carousel__nav carousel__nav--prev" id="carPrev" aria-label="prev">‹</button>
        <div class="carousel__track" id="trendingTrack"></div>
        <button class="carousel__nav carousel__nav--next" id="carNext" aria-label="next">›</button>
        <div class="carousel__dots" id="carDots"></div>
      </div>
    </section>

    <section class="section container" id="offers">
      <div class="section__head reveal">
        <span class="section__label">Exclusive Deals</span>
        <h2 class="section__title gold-text">عروض حصرية</h2>
      </div>
      <div class="offer-slider glass" id="offerSlider"></div>
      <div class="offer-dots" id="offerDots"></div>
    </section>

    <section class="section container">
      <div class="section__head reveal">
        <span class="section__label">Why LUXE</span>
        <h2 class="section__title">لماذا تختار LUXE؟</h2>
      </div>
      <div class="trust-grid">
        ${trustCard('🛡️','جودة مضمونة','جميع منتجاتنا مختارة بعناية من أفضل العلامات التجارية')}
        ${trustCard('🚚','توصيل سريع','توصيل لجميع ولايات الجزائر الـ58 في 24-48 ساعة')}
        ${trustCard('💬','دعم 24/7','فريق دعم متاح دائماً عبر واتساب للإجابة على جميع استفساراتك')}
        ${trustCard('↩️','إرجاع مجاني','ضمان الرضا التام أو استرداد المبلغ خلال 7 أيام')}
      </div>
    </section>

    <section class="section container">
      <div class="section__head reveal">
        <span class="section__label">Happy Customers</span>
        <h2 class="section__title">ماذا يقول عملاؤنا</h2>
      </div>
      <div class="testi-grid">
        ${TESTIMONIALS.map(t=>`
          <div class="testi-card reveal">
            <div class="testi-head">
              <div class="testi-avatar">${esc(t.name[0])}</div>
              <div><div class="testi-name">${esc(t.name)}</div><div class="testi-loc">${esc(t.wilaya)}</div></div>
            </div>
            <div class="testi-stars">${'★'.repeat(t.rating)}</div>
            <p style="color:var(--text-secondary);font-size:14px;line-height:1.7">"${esc(t.text)}"</p>
          </div>`).join('')}
      </div>
    </section>

    <section class="section container">
      <div class="section__head reveal">
        <span class="section__label">@luxe_dz</span>
        <h2 class="section__title">تابعنا على إنستغرام</h2>
      </div>
      <div class="social-grid">
        ${Array.from({length:6},(_,i)=>`
          <a href="https://wa.me/${CONFIG.whatsappNumber}" target="_blank" rel="noopener" class="social-item">
            <img loading="lazy" src="https://picsum.photos/seed/insta${i}/400/400" alt="">
            <div class="social-item__overlay">♥ ${120+i*34} &nbsp; 👁 ${800+i*77}</div>
          </a>`).join('')}
      </div>
    </section>

    ${renderFooter()}
  `;
  spawnParticles();
  renderCatGrid();
  renderTrending();
  renderOffers();
  renderCategoriesDropdown();
  initHeroCountdown();
}

function trustCard(icon,title,desc){
  return '<div class="trust-card reveal"><div class="trust-card__icon">'+icon+'</div><div class="trust-card__title">'+title+'</div><div class="trust-card__desc">'+desc+'</div></div>';
}

function renderFooter(){
  return `
    <footer class="footer">
      <div class="container">
        <div class="footer__grid">
          <div class="footer__brand">
            <div class="brand"><div class="brand__logo">L</div><span class="gold-text">${esc(state.settings.storeName||'LUXE')}</span></div>
            <p>متجر الأزياء الفاخر في الجزائر — أزياء راقية تعكس شخصيتك وتمنحك إطلالة استثنائية.</p>
            <div class="footer__social">
              <a href="https://wa.me/${CONFIG.whatsappNumber}" target="_blank" rel="noopener" aria-label="WhatsApp">W</a>
              <a href="#" aria-label="Instagram">I</a>
              <a href="#" aria-label="Facebook">F</a>
              <a href="mailto:${esc(CONFIG.contactEmail)}" aria-label="Email">E</a>
            </div>
          </div>
          <div class="footer__col">
            <h4>روابط سريعة</h4>
            <a href="#home">الرئيسية</a>
            <a href="#about">من نحن</a>
            <a href="#contact">اتصل بنا</a>
            <a href="#orders">طلباتي</a>
          </div>
          <div class="footer__col">
            <h4>تصنيفات</h4>
            ${state.categories.slice(0,5).map(c=>`<a href="#category/${c.id}">${esc(c.nameAr)}</a>`).join('')}
          </div>
          <div class="footer__col">
            <h4>تواصل معنا</h4>
            <a href="tel:+${CONFIG.whatsappNumber}">📞 +${CONFIG.whatsappNumber}</a>
            <a href="mailto:${esc(CONFIG.contactEmail)}">✉ ${esc(CONFIG.contactEmail)}</a>
            <a href="#">📍 الجزائر العاصمة</a>
          </div>
        </div>
        <div class="footer__bottom">
          <span>© ${new Date().getFullYear()} LUXE — جميع الحقوق محفوظة</span>
          <span><a href="#">سياسة الخصوصية</a> · <a href="#">الشروط والأحكام</a></span>
        </div>
      </div>
    </footer>
  `;
}

function spawnParticles(){
  const box=$('#particles');if(!box)return;
  box.innerHTML='';
  for(let i=0;i<20;i++){
    const p=document.createElement('div');
    p.className='particle';
    p.style.left=(Math.random()*100)+'%';
    p.style.animationDuration=(8+Math.random()*10)+'s';
    p.style.animationDelay=(-Math.random()*10)+'s';
    p.style.opacity=(0.3+Math.random()*0.5);
    box.appendChild(p);
  }
}

function renderCatGrid(){
  const g=$('#catGrid');if(!g)return;
  g.innerHTML=state.categories.map(c=>{
    const count=state.products.filter(p=>p.category===c.id).length;
    return `
      <div class="cat-card" onclick="navigate('#category/${c.id}')" style="background:${c.gradient}">
        <div class="cat-card__bg" style="background-image:url('${c.cover}');opacity:0.7"></div>
        <div class="cat-card__arrow">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>
        </div>
        <div class="cat-card__overlay">
          <div class="cat-card__icon">${c.icon}</div>
          <div class="cat-card__name">${esc(c.nameAr)}</div>
          <div class="cat-card__count">${count} منتج ›</div>
        </div>
      </div>`;
  }).join('');
}

function renderTrending(){
  const track=$('#trendingTrack');const dots=$('#carDots');if(!track)return;
  const list=state.products.filter(p=>p.trending||p.bestSeller).slice(0,10);
  track.innerHTML=list.map(productCard).join('');
  dots.innerHTML='';
  const pages=Math.max(1,Math.ceil(list.length/4));
  for(let i=0;i<pages;i++){
    const d=document.createElement('div');
    d.className='carousel__dot'+(i===0?' active':'');
    d.onclick=()=>{track.scrollTo({left:track.clientWidth*i,behavior:'smooth'})};
    dots.appendChild(d);
  }
  $('#carPrev').onclick=()=>track.scrollBy({left:-track.clientWidth,behavior:'smooth'});
  $('#carNext').onclick=()=>track.scrollBy({left:track.clientWidth,behavior:'smooth'});
  let autoTimer;
  const tick=()=>{const max=track.scrollWidth-track.clientWidth;const next=track.scrollLeft+track.clientWidth;track.scrollTo({left:next>max-10?0:next,behavior:'smooth'})};
  autoTimer=setInterval(tick,4000);
  track.addEventListener('mouseenter',()=>clearInterval(autoTimer));
  track.addEventListener('mouseleave',()=>autoTimer=setInterval(tick,4000));
}

function productCard(p){
  const badges=[];
  if(p.isNew)badges.push('<span class="pill pill--new">جديد</span>');
  if(p.trending)badges.push('<span class="pill pill--fire">🔥 رائج</span>');
  if(p.bestSeller)badges.push('<span class="pill pill--best">⭐ الأكثر مبيعاً</span>');
  if(p.oldPrice&&p.oldPrice>p.price){const pct=Math.round((1-p.price/p.oldPrice)*100);badges.unshift('<span class="pill pill--discount">-'+pct+'%</span>')}
  const cat=state.categories.find(c=>c.id===p.category);
  const img0=p.images&&p.images[0]||'';
  const img1=p.images&&p.images[1]||'';
  return `
    <div class="p-card" onclick="navigate('#product/${p.id}')">
      <div class="p-card__image">
        <img loading="lazy" src="${img0}" alt="${esc(p.name)}">
        ${img1?`<img loading="lazy" src="${img1}" alt="" aria-hidden="true">`:''}
        <div class="p-card__badges">${badges.slice(0,2).join('')}</div>
        <div class="p-card__overlay">
          <button class="btn btn--primary" onclick="event.stopPropagation();openOrderModal('${p.id}')">اطلب الآن</button>
          <a class="btn btn--whatsapp btn--icon" onclick="event.stopPropagation()" href="${waProductLink(p)}" target="_blank" rel="noopener" aria-label="WhatsApp">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M17.5 14.4c-.3-.2-1.7-.9-2-1-.3-.1-.5-.2-.7.2-.2.3-.8 1-1 1.2-.2.2-.4.2-.6.1-.3-.1-1.2-.4-2.3-1.4-.8-.8-1.4-1.7-1.6-2-.2-.3 0-.5.1-.6.1-.1.3-.3.4-.5.1-.2.2-.3.3-.5.1-.2 0-.4 0-.5-.1-.1-.7-1.7-.9-2.3-.2-.6-.5-.5-.7-.5h-.6c-.2 0-.5.1-.7.3-.2.2-.9.9-.9 2.2 0 1.3.9 2.6 1 2.8.1.2 1.8 2.8 4.4 3.9.6.3 1.1.4 1.5.5.6.2 1.2.2 1.7.1.5-.1 1.7-.7 1.9-1.4.2-.7.2-1.3.2-1.4-.1-.2-.3-.2-.6-.4zM12 2C6.5 2 2 6.5 2 12c0 1.8.5 3.5 1.3 5L2 22l5.2-1.4c1.4.8 3.1 1.3 4.8 1.3 5.5 0 10-4.5 10-10S17.5 2 12 2z"/></svg>
          </a>
        </div>
      </div>
      <div class="p-card__body">
        <span class="p-card__cat">${esc(cat?cat.nameAr:p.category)}</span>
        <div class="p-card__name">${esc(p.name)}</div>
        <div class="p-card__price-row">
          <span class="p-card__price">${fmtDZD(p.price)}</span>
          ${p.oldPrice&&p.oldPrice>p.price?'<span class="p-card__old">'+fmtDZD(p.oldPrice)+'</span>':''}
        </div>
      </div>
    </div>
  `;
}

function waProductLink(p){
  const msg='🛍 *استفسار عن منتج*\n\nالمنتج: '+p.name+'\nالسعر: '+fmtDZD(p.price)+'\n\nمرحباً، أريد الاستفسار عن هذا المنتج من موقع LUXE.';
  return 'https://wa.me/'+(state.settings.whatsappNumber||CONFIG.whatsappNumber)+'?text='+encodeURIComponent(msg);
}

function renderOffers(){
  const slider=$('#offerSlider');const dots=$('#offerDots');if(!slider)return;
  const active=state.offers.filter(o=>o.active);
  if(!active.length){slider.innerHTML='<div style="padding:40px;text-align:center;color:var(--text-muted)">لا توجد عروض حالياً</div>';return}
  slider.innerHTML=active.map((o,i)=>`
    <div class="offer-slide ${i===0?'active':''}" data-idx="${i}">
      <div class="offer-slide__text">
        <span class="pill pill--gold">${esc(o.code)}</span>
        <h3 class="offer-slide__title">${esc(o.title)}</h3>
        <p class="offer-slide__desc">${esc(o.description)}</p>
        <div class="offer-slide__code" onclick="navigator.clipboard.writeText('${esc(o.code)}');toast('تم نسخ الكود!','success')">${esc(o.code)} 📋</div>
        <a class="btn btn--gold" href="${esc(o.link)}">اطلب الآن</a>
      </div>
      <div class="offer-slide__visual">${o.icon||'🎁'}</div>
    </div>`).join('');
  dots.innerHTML=active.map((_,i)=>`<div class="carousel__dot ${i===0?'active':''}" data-idx="${i}"></div>`).join('');
  let idx=0;
  const go=(n)=>{
    idx=(n+active.length)%active.length;
    $$('.offer-slide',slider).forEach((el,i)=>el.classList.toggle('active',i===idx));
    $$('.carousel__dot',dots).forEach((el,i)=>el.classList.toggle('active',i===idx));
  };
  $$('.carousel__dot',dots).forEach(d=>d.onclick=()=>go(+d.dataset.idx));
  setInterval(()=>go(idx+1),5000);
}

function renderCategoriesDropdown(){
  const el=$('#categoriesDropdown');if(!el)return;
  el.innerHTML=state.categories.map(c=>{
    const count=state.products.filter(p=>p.category===c.id).length;
    return '<a class="dropdown__item" href="#category/'+c.id+'"><div class="dropdown__icon">'+c.icon+'</div><div><div class="dropdown__name">'+esc(c.nameAr)+'</div><div class="dropdown__count">'+count+' منتج</div></div></a>';
  }).join('');
}

function initHeroCountdown(){
  const box=$('#heroCountdown');if(!box)return;
  const soonest=state.offers.filter(o=>o.active&&o.endsAt>Date.now()).sort((a,b)=>a.endsAt-b.endsAt)[0];
  if(!soonest){box.style.display='none';return}
  const tick=()=>{
    const diff=soonest.endsAt-Date.now();if(diff<0){box.style.display='none';return}
    const d=Math.floor(diff/864e5);const h=Math.floor(diff/36e5)%24;const m=Math.floor(diff/6e4)%60;const s=Math.floor(diff/1e3)%60;
    box.innerHTML=[[d,'يوم'],[h,'ساعة'],[m,'دقيقة'],[s,'ثانية']].map(([v,l])=>'<div class="countdown__box"><div class="countdown__value">'+String(v).padStart(2,'0')+'</div><div class="countdown__label">'+l+'</div></div>').join('');
  };
  tick();clearInterval(window._cdTimer);window._cdTimer=setInterval(tick,1000);
}

/* ═══════════════════════ CATEGORY ═══════════════════════ */
async function renderCategory(params){
  const cat=state.categories.find(c=>c.id===params.id)||{id:params.id,nameAr:'منتجات',icon:''};
  const list=state.products.filter(p=>p.category===cat.id);
  $('#pageContent').innerHTML=`
    <div class="container">
      <div class="cat-hero">
        <div class="breadcrumb" style="justify-content:center"><a href="#home">الرئيسية</a> › <span>${esc(cat.nameAr)}</span></div>
        <h1 class="font-serif">${esc(cat.nameAr)} <span style="font-size:.6em">${cat.icon||''}</span></h1>
        <p style="color:var(--text-secondary)">عرض <b>${list.length}</b> منتج</p>
      </div>
      <div class="filter-bar">
        <select id="sortBy" class="form-select" style="max-width:180px">
          <option value="new">الأحدث</option>
          <option value="sales">الأكثر مبيعاً</option>
          <option value="asc">السعر: تصاعدي</option>
          <option value="desc">السعر: تنازلي</option>
        </select>
        <input id="searchIn" type="search" class="form-input" placeholder="بحث..." style="max-width:220px">
        <span style="color:var(--text-muted);font-size:13px">${list.length} منتج</span>
      </div>
      <div class="product-grid" id="catGrid2"></div>
      ${renderFooter()}
    </div>`;
  const render=()=>{
    let arr=list.slice();
    const q=($('#searchIn').value||'').toLowerCase();
    if(q)arr=arr.filter(p=>p.name.toLowerCase().includes(q));
    const sort=$('#sortBy').value;
    if(sort==='asc')arr.sort((a,b)=>a.price-b.price);
    else if(sort==='desc')arr.sort((a,b)=>b.price-a.price);
    else if(sort==='sales')arr.sort((a,b)=>(b.bestSeller?1:0)-(a.bestSeller?1:0));
    else arr.sort((a,b)=>(b.isNew?1:0)-(a.isNew?1:0));
    $('#catGrid2').innerHTML=arr.length?arr.map(productCard).join('')
      :'<div style="grid-column:1/-1;text-align:center;padding:60px;color:var(--text-muted)"><div style="font-size:80px;opacity:.3;margin-bottom:10px">🛍</div>لا توجد منتجات مطابقة</div>';
  };
  render();
  $('#sortBy').addEventListener('change',render);
  $('#searchIn').addEventListener('input',debounce(render,250));
}

/* ═══════════════════════ PRODUCT DETAIL ═══════════════════════ */
async function renderProduct(params){
  const p=state.products.find(x=>x.id===params.id);
  if(!p){navigate('#home');return}
  const cat=state.categories.find(c=>c.id===p.category);
  const discountPct=p.oldPrice&&p.oldPrice>p.price?Math.round((1-p.price/p.oldPrice)*100):0;
  const stockStatus=p.stock<=0?'out':p.stock<5?'low':'ok';
  const related=state.products.filter(x=>x.category===p.category&&x.id!==p.id).slice(0,4);
  $('#pageContent').innerHTML=`
    <div class="container">
      <div class="breadcrumb">
        <a href="#home">الرئيسية</a> ›
        <a href="#category/${cat?cat.id:''}">${esc(cat?cat.nameAr:'')}</a> ›
        <span>${esc(p.name)}</span>
      </div>
      <div class="pd">
        <div class="pd__gallery">
          <div class="pd__main" id="pdMain">
            <img src="${p.images&&p.images[0]||''}" alt="${esc(p.name)}" id="pdMainImg">
            <div class="pd__counter" id="pdCounter">1 / ${p.images?p.images.length:1}</div>
          </div>
          <div class="pd__thumbs" id="pdThumbs">
            ${(p.images||[]).map((src,i)=>`<div class="pd__thumb ${i===0?'active':''}" data-idx="${i}"><img src="${src}" alt=""></div>`).join('')}
          </div>
        </div>
        <div class="pd__info">
          <div style="display:flex;gap:6px;flex-wrap:wrap;margin-bottom:12px">
            ${p.isNew?'<span class="pill pill--new">جديد</span>':''}
            ${p.trending?'<span class="pill pill--fire">🔥 رائج</span>':''}
            ${p.bestSeller?'<span class="pill pill--best">⭐ الأكثر مبيعاً</span>':''}
            ${discountPct?'<span class="pill pill--discount">-'+discountPct+'%</span>':''}
          </div>
          <h1 class="pd__title">${esc(p.name)}</h1>
          <div class="pd__social">
            <span class="pill">👀 يشاهده الآن <b id="pdViewers" style="margin:0 4px">—</b> شخص</span>
            <span class="pill">✅ ${Math.floor(Math.random()*30)+5} طلب اليوم</span>
            <span class="pill pill--gold">⭐ 4.8 (127 تقييم)</span>
          </div>
          <div class="pd__price-row">
            <span class="pd__price">${fmtDZD(p.price)}</span>
            ${p.oldPrice&&p.oldPrice>p.price?'<span class="pd__old">'+fmtDZD(p.oldPrice)+'</span>':''}
            ${discountPct?'<span class="pill pill--discount">-'+discountPct+'%</span>':''}
          </div>
          <p class="pd__desc">${esc(p.description||'')}</p>
          ${p.features&&p.features.length?'<ul class="pd__features">'+p.features.map(f=>'<li>'+esc(f)+'</li>').join('')+'</ul>':''}
          ${p.sizes&&p.sizes.length?`
            <div class="pd__selector">
              <div class="pd__selector-label">المقاس</div>
              <div class="size-btns" id="sizeBtns">
                ${p.sizes.map((s,i)=>`<button class="size-btn ${i===0?'active':''}" data-size="${esc(s)}">${esc(s)}</button>`).join('')}
              </div>
            </div>`:''}
          ${p.colors&&p.colors.length?`
            <div class="pd__selector">
              <div class="pd__selector-label">اللون</div>
              <div class="color-btns" id="colorBtns">
                ${p.colors.map((c,i)=>`<button class="color-btn ${i===0?'active':''}" data-color="${esc(c)}" style="background:${esc(c)}"></button>`).join('')}
              </div>
            </div>`:''}
          <div class="pd__stock stock-${stockStatus}">
            ${stockStatus==='ok'?'🟢 متوفر في المخزون':stockStatus==='low'?'🟡 آخر '+p.stock+' قطع!':'🔴 نفذ المخزون'}
          </div>
          <div class="pd__urgency">⏰ اطلب الآن ويصلك خلال 24-48 ساعة. 🔥 ${Math.floor(Math.random()*20)+5} شخص أضافه للسلة في آخر ساعة</div>
          <div class="pd__actions">
            <button class="btn btn--primary btn--lg btn-pulse" ${stockStatus==='out'?'disabled':''} onclick="openOrderModal('${p.id}')">🛍 اطلب الآن</button>
            <a class="btn btn--whatsapp btn--lg" href="${waProductLink(p)}" target="_blank" rel="noopener">💬 اطلب عبر واتساب</a>
            <button class="btn btn--ghost btn--sm" onclick="addToCart('${p.id}',1);openCart()">🛒 أضف إلى السلة</button>
          </div>
          <div class="pd__accordion">
            ${accItem('🚚 الشحن والتوصيل','نقوم بالتوصيل إلى جميع ولايات الجزائر الـ58 خلال 24 إلى 48 ساعة. أسعار التوصيل تختلف حسب الولاية: من 500 دج (المركز) إلى 900 دج (الجنوب). توصيل مجاني للطلبات أكثر من 3000 دج.')}
            ${accItem('↩️ سياسة الإرجاع','يمكنك إرجاع أو استبدال المنتج خلال 7 أيام من الاستلام في حالة عدم الرضا. يجب أن يكون المنتج في حالته الأصلية مع التغليف الكامل.')}
            ${accItem('🛡️ ضمان الجودة','جميع منتجاتنا تأتي مع ضمان الجودة. في حالة أي عيب تصنيع، نلتزم بالاستبدال أو استرداد المبلغ بالكامل.')}
          </div>
        </div>
      </div>
      <section class="section">
        <h2 class="font-serif" style="font-size:28px;margin-bottom:24px">منتجات قد تعجبك</h2>
        <div class="product-grid">${related.map(productCard).join('')}</div>
      </section>
      ${renderFooter()}
    </div>
    <div class="pd-sticky">
      <span class="price">${fmtDZD(p.price)}</span>
      <button class="btn btn--primary" ${stockStatus==='out'?'disabled':''} onclick="openOrderModal('${p.id}')">اطلب الآن</button>
      <a class="btn btn--whatsapp btn--icon" href="${waProductLink(p)}" target="_blank" rel="noopener">💬</a>
    </div>
  `;
  const imgs=p.images||[];
  const mainImg=$('#pdMainImg');const counter=$('#pdCounter');
  $$('.pd__thumb',$('#pdThumbs')).forEach(t=>t.onclick=()=>{
    const i=+t.dataset.idx;
    mainImg.style.opacity='0';
    setTimeout(()=>{mainImg.src=imgs[i];mainImg.style.opacity='1';counter.textContent=(i+1)+' / '+imgs.length},200);
    $$('.pd__thumb',$('#pdThumbs')).forEach(el=>el.classList.remove('active'));t.classList.add('active');
  });
  $('#pdMain').onclick=()=>openLightbox(imgs,0);
  const tick=()=>{const v=$('#pdViewers');if(v)v.textContent=Math.floor(Math.random()*17)+8};
  tick();clearInterval(window._viewerTimer);window._viewerTimer=setInterval(tick,20000);
  $$('.size-btn').forEach(b=>b.onclick=()=>{$$('.size-btn').forEach(x=>x.classList.remove('active'));b.classList.add('active')});
  $$('.color-btn').forEach(b=>b.onclick=()=>{$$('.color-btn').forEach(x=>x.classList.remove('active'));b.classList.add('active')});
  $$('.acc-head').forEach(h=>h.onclick=()=>h.parentElement.classList.toggle('open'));
}
function accItem(title,body){return '<div class="acc-item"><div class="acc-head"><span>'+title+'</span><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="6 9 12 15 18 9"/></svg></div><div class="acc-body">'+esc(body)+'</div></div>'}

/* Lightbox */
let LB={imgs:[],i:0};
function openLightbox(imgs,start){
  start=start||0;
  LB={imgs:imgs,i:start};
  $('#lightboxImg').src=imgs[start];
  $('#lightboxStrip').innerHTML=imgs.map((s,i)=>'<img src="'+s+'" data-idx="'+i+'" class="'+(i===start?'active':'')+'">').join('');
  $$('#lightboxStrip img').forEach(t=>t.onclick=()=>lbGo(+t.dataset.idx));
  $('#lightbox').classList.add('open');
}
function lbGo(n){
  LB.i=(n+LB.imgs.length)%LB.imgs.length;
  $('#lightboxImg').src=LB.imgs[LB.i];
  $$('#lightboxStrip img').forEach((el,i)=>el.classList.toggle('active',i===LB.i));
}


/* ═══════════════════════ CART ═══════════════════════ */
function addToCart(productId,qty){
  qty=qty||1;
  const found=state.cart.find(c=>c.productId===productId);
  if(found)found.qty+=qty;else state.cart.push({productId:productId,qty:qty,addedAt:Date.now()});
  persist('cart');updateCartBadge(true);toast('تمت الإضافة إلى السلة','success',2500);
}
function updateCartQty(productId,qty){
  const found=state.cart.find(c=>c.productId===productId);
  if(!found)return;
  if(qty<=0)state.cart=state.cart.filter(c=>c.productId!==productId);
  else found.qty=qty;
  persist('cart');updateCartBadge();renderCartPanel();
}
function removeFromCart(productId){
  state.cart=state.cart.filter(c=>c.productId!==productId);
  persist('cart');updateCartBadge();renderCartPanel();
  if(state.route.name==='cart')renderCart();
}
function cartTotal(){
  return state.cart.reduce((s,c)=>{const p=state.products.find(x=>x.id===c.productId);return s+(p?p.price*c.qty:0)},0);
}
function cartCount(){return state.cart.reduce((s,c)=>s+c.qty,0)}
function updateCartBadge(bump){
  const badge=$('#cartBadge');const n=cartCount();
  badge.textContent=n;badge.style.display=n>0?'flex':'none';
  if(bump){badge.classList.remove('bump');void badge.offsetWidth;badge.classList.add('bump')}
}
function openCart(){$('#cartPanel').classList.add('open');renderCartPanel()}
function closeCart(){$('#cartPanel').classList.remove('open')}
function renderCartPanel(){
  const body=$('#cartItems');const foot=$('#cartFoot');
  if(!state.cart.length){
    body.innerHTML='<div class="cart-empty"><div class="cart-empty__icon">🛒</div><h3>سلتك فارغة</h3><p style="margin-top:8px">أضف منتجات لتظهر هنا</p><button class="btn btn--primary" style="margin-top:16px" onclick="closeCart();navigate(\'#home\')">ابدأ التسوق</button></div>';
    foot.style.display='none';return;
  }
  body.innerHTML=state.cart.map(c=>{
    const p=state.products.find(x=>x.id===c.productId);if(!p)return '';
    return `<div class="cart-item">
      <img src="${p.images&&p.images[0]||''}" alt="">
      <div>
        <div class="cart-item__name">${esc(p.name)}</div>
        <div class="cart-item__price">${fmtDZD(p.price)}</div>
        <div class="cart-item__qty">
          <button class="qty-btn" onclick="updateCartQty('${p.id}',${c.qty-1})">−</button>
          <span>${c.qty}</span>
          <button class="qty-btn" onclick="updateCartQty('${p.id}',${c.qty+1})">+</button>
        </div>
      </div>
      <button class="cart-item__remove" aria-label="حذف" onclick="removeFromCart('${p.id}')">✕</button>
    </div>`;
  }).join('');
  foot.style.display='block';
  $('#cartTotal').textContent=fmtDZD(cartTotal());
}

async function renderCart(){
  if(!state.cart.length){
    $('#pageContent').innerHTML='<div class="container section" style="text-align:center"><div style="font-size:80px;opacity:.3">🛒</div><h1 class="font-serif" style="font-size:32px">سلتك فارغة</h1><p style="color:var(--text-secondary);margin:12px 0 20px">لم تقم بإضافة أي منتج بعد</p><button class="btn btn--primary" onclick="navigate(\'#home\')">ابدأ التسوق</button></div>';return;
  }
  $('#pageContent').innerHTML=`
    <div class="container section">
      <h1 class="page-title">سلة المشتريات</h1>
      <div class="two-col">
        <div>
          ${state.cart.map(c=>{
            const p=state.products.find(x=>x.id===c.productId);if(!p)return '';
            return `<div class="cart-item" style="margin-bottom:14px">
              <img src="${p.images&&p.images[0]||''}" alt="">
              <div>
                <div class="cart-item__name">${esc(p.name)}</div>
                <div class="cart-item__price">${fmtDZD(p.price*c.qty)}</div>
                <div class="cart-item__qty">
                  <button class="qty-btn" onclick="updateCartQty('${p.id}',${c.qty-1})">−</button>
                  <span>${c.qty}</span>
                  <button class="qty-btn" onclick="updateCartQty('${p.id}',${c.qty+1})">+</button>
                </div>
              </div>
              <button class="cart-item__remove" onclick="removeFromCart('${p.id}')">✕</button>
            </div>`;
          }).join('')}
        </div>
        <div class="checkout-summary">
          <h3 class="font-serif" style="margin-bottom:16px">ملخص الطلب</h3>
          <div class="ck-totals"><span>المجموع الفرعي</span><span>${fmtDZD(cartTotal())}</span></div>
          <div class="ck-totals"><span>الشحن</span><span>يحسب عند الدفع</span></div>
          <div class="ck-totals total"><span>الإجمالي</span><span>${fmtDZD(cartTotal())}</span></div>
          <button class="btn btn--primary btn--block" style="margin-top:16px" onclick="navigate('#checkout')">متابعة الدفع</button>
        </div>
      </div>
    </div>
  `;
}

/* ═══════════════════════ CHECKOUT ═══════════════════════ */
async function renderCheckout(){
  if(!state.cart.length){navigate('#cart');return}
  const tot=cartTotal();
  $('#pageContent').innerHTML=`
    <div class="container section">
      <h1 class="page-title">إتمام الطلب</h1>
      <div class="two-col">
        <div class="glass" style="padding:24px">
          <h3 class="font-serif" style="margin-bottom:16px">بيانات التوصيل</h3>
          <div id="coForm"></div>
        </div>
        <div class="checkout-summary">
          <h3 class="font-serif" style="margin-bottom:16px">ملخص الطلب</h3>
          ${state.cart.map(c=>{
            const p=state.products.find(x=>x.id===c.productId);if(!p)return '';
            return '<div class="ck-item"><img src="'+(p.images&&p.images[0]||'')+'"><div style="flex:1"><div style="font-size:13px">'+esc(p.name)+'</div><div style="font-size:12px;color:var(--text-muted)">× '+c.qty+'</div></div><div style="font-weight:700;color:var(--gold-light)">'+fmtDZD(p.price*c.qty)+'</div></div>';
          }).join('')}
          <div class="ck-totals" style="margin-top:14px"><span>المجموع</span><span>${fmtDZD(tot)}</span></div>
          <div class="ck-totals"><span>الشحن</span><span id="coDeliveryPrice">—</span></div>
          <div class="ck-totals total"><span>الإجمالي</span><span id="coGrand">${fmtDZD(tot)}</span></div>
        </div>
      </div>
    </div>
  `;
  renderCheckoutForm();
}
function renderCheckoutForm(){
  $('#coForm').innerHTML=`
    ${fieldInput('name','الاسم الكامل','text')}
    ${fieldInput('phone','رقم الهاتف (05/06/07)','tel')}
    ${wilayaField('wilaya','الولاية')}
    ${fieldInput('commune','البلدية','text')}
    ${fieldInput('address','العنوان التفصيلي (اختياري)','text',false)}
    ${fieldArea('notes','ملاحظات (اختياري)',false)}
    <button type="button" class="btn btn--primary btn--block btn--lg" id="coSubmit">✅ تأكيد الطلب</button>
  `;
  attachValidation();
  initWilayaDropdown('wilaya',(val)=>{
    const price=state.settings.deliveryPrices[val]||700;
    $('#coDeliveryPrice').textContent=fmtDZD(price);
    $('#coGrand').textContent=fmtDZD(cartTotal()+price);
  });
  $('#coSubmit').onclick=async()=>{
    if(!validateAll())return;
    const name=$('#f_name').value.trim();
    const phone=$('#f_phone').value.trim();
    const wilaya=$('#f_wilaya').value;
    const commune=$('#f_commune').value.trim();
    const address=$('#f_address').value.trim();
    const notes=$('#f_notes').value.trim();
    const items=state.cart.map(c=>{const p=state.products.find(x=>x.id===c.productId);return {productId:c.productId,name:p?p.name:'',price:p?p.price:0,qty:c.qty,image:p?p.images[0]:''}});
    const subtotal=cartTotal();
    const delivery=state.settings.deliveryPrices[wilaya]||700;
    const order={id:'ORD-'+Date.now().toString(36).toUpperCase(),customer:{name,phone,wilaya,commune,address},notes,items,subtotal,delivery,total:subtotal+delivery,status:'pending',source:'checkout',createdAt:Date.now()};
    await saveOrder(order);
    state.cart=[];persist('cart');updateCartBadge();
    confetti();
    $('#pageContent').innerHTML=orderSuccessHTML(order);
  };
}

function orderSuccessHTML(order){
  return `<div class="container section"><div class="glass" style="max-width:520px;margin:0 auto;padding:40px;text-align:center">
    <div class="success-check"><svg viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="3"><polyline points="20 6 9 17 4 12"/></svg></div>
    <h2 class="font-serif" style="font-size:28px;margin:6px 0">تم تأكيد طلبك!</h2>
    <p style="color:var(--text-secondary)">شكراً لثقتك بنا. سنتواصل معك قريباً لتأكيد الطلب.</p>
    <div class="success-ref">رقم الطلب: ${order.id}</div>
    <div style="display:flex;gap:10px;justify-content:center;margin-top:20px;flex-wrap:wrap">
      <a class="btn btn--whatsapp" href="https://wa.me/${state.settings.whatsappNumber||CONFIG.whatsappNumber}?text=${encodeURIComponent(whatsappOrderMessage(order))}" target="_blank" rel="noopener">📱 متابعة عبر واتساب</a>
      <button class="btn btn--ghost" onclick="navigate('#orders')">📦 طلباتي</button>
      <button class="btn btn--primary" onclick="navigate('#home')">🏠 الرئيسية</button>
    </div>
  </div></div>`;
}

/* ═══════════════════════ FORM COMPONENTS ═══════════════════════ */
function fieldInput(id,label,type,required){
  if(required===undefined)required=true;
  return `<div class="form-row" data-required="${required}" data-type="${type||'text'}"><input id="f_${id}" class="form-input" type="${type||'text'}" placeholder=" "><label class="form-label" for="f_${id}">${esc(label)}${required?' *':''}</label><div class="form-error" id="e_${id}"></div></div>`;
}
function fieldArea(id,label,required){
  if(required===undefined)required=true;
  return `<div class="form-row" data-required="${required}" data-type="area"><textarea id="f_${id}" class="form-area" placeholder=" "></textarea><label class="form-label" for="f_${id}">${esc(label)}${required?' *':''}</label><div class="form-error" id="e_${id}"></div></div>`;
}
function wilayaField(id,label){
  return `<div class="form-row" data-required="true" data-type="wilaya"><div class="cdd" id="cdd_${id}">
    <button type="button" class="cdd__btn" id="cdd_btn_${id}"><span>اختر الولاية</span><span>▾</span></button>
    <div class="cdd__panel"><input type="search" class="cdd__search" placeholder="بحث..."><ul class="cdd__list">
      ${WILAYAS.map(([n,en,ar])=>`<li class="cdd__item" data-value="${esc(en)}"><span>${esc(ar)} — ${esc(en)}</span><span class="num">${String(n).padStart(2,'0')}</span></li>`).join('')}
    </ul></div></div>
    <input type="hidden" id="f_${id}"><div class="form-error" id="e_${id}"></div></div>`;
}
function initWilayaDropdown(id,onPick){
  const wrap=$('#cdd_'+id);const btn=$('#cdd_btn_'+id);const hidden=$('#f_'+id);
  btn.onclick=()=>wrap.classList.toggle('open');
  document.addEventListener('click',(e)=>{if(!wrap.contains(e.target))wrap.classList.remove('open')});
  const search=$('.cdd__search',wrap);
  search.oninput=()=>{
    const q=search.value.toLowerCase();
    $$('.cdd__item',wrap).forEach(li=>{li.style.display=li.textContent.toLowerCase().includes(q)?'':'none'});
  };
  $$('.cdd__item',wrap).forEach(li=>li.onclick=()=>{
    const v=li.dataset.value;hidden.value=v;
    btn.innerHTML='<span>'+esc(li.firstElementChild.textContent)+'</span><span>▾</span>';
    btn.classList.add('filled');wrap.classList.remove('open');
    hidden.dispatchEvent(new Event('change'));
    if(onPick)onPick(v);
    markValid('f_'+id);
  });
}
function markValid(id){const row=$('#'+id).closest('.form-row');row.classList.remove('error');row.classList.add('valid');$('#e_'+id.slice(2)).textContent=''}
function markError(id,msg){const row=$('#'+id).closest('.form-row');row.classList.remove('valid');row.classList.add('error');$('#e_'+id.slice(2)).textContent='⚠ '+msg}
function validateField(id){
  if(!id)return true;
  const input=$('#'+id);if(!input)return true;
  const row=input.closest('.form-row');
  if(!row)return true;
  const required=row.dataset.required==='true';
  const type=row.dataset.type;
  const val=(input.value||'').trim();
  const baseId=id.slice(2);
  if(required&&!val){markError(id,'هذا الحقل مطلوب');return false}
  if(!val&&!required){row.classList.remove('error');row.classList.remove('valid');$('#e_'+baseId).textContent='';return true}
  if(type==='tel'){if(!/^(05|06|07)\d{8}$/.test(val)){markError(id,'رقم هاتف غير صحيح (يبدأ بـ 05/06/07 ويتكون من 10 أرقام)');return false}}
  if(baseId==='name'||baseId==='commune'){if(val.length<2){markError(id,'يجب أن لا يقل عن حرفين');return false}}
  markValid(id);return true;
}
function attachValidation(){
  $$('.form-row').forEach(row=>{
    const inp=$('input,textarea',row);
    if(!inp||inp.type==='hidden')return;
    const id=inp.id;
    inp.addEventListener('blur',()=>validateField(id));
    inp.addEventListener('input',debounce(()=>validateField(id),300));
  });
  const wh=$('#f_wilaya');if(wh)wh.addEventListener('change',()=>validateField('f_wilaya'));
}
function validateAll(){
  let ok=true;
  $$('.form-row').forEach(row=>{
    const inp=$('input[id],textarea[id]',row);if(!inp)return;
    if(!validateField(inp.id))ok=false;
  });
  if(!ok)toast('يرجى تصحيح الأخطاء في النموذج','error');
  return ok;
}

/* ═══════════════════════ ORDER MODAL ═══════════════════════ */
function openOrderModal(productId){
  const p=state.products.find(x=>x.id===productId);if(!p)return;
  const mr=$('#modalRoot');
  mr.innerHTML=`<div class="modal" id="orderModal">
    <div class="modal__head"><h3 class="modal__title">🛍 طلب المنتج</h3><button class="icon-btn" onclick="closeModal()">✕</button></div>
    <div class="progress-bar"><div class="progress-step active"></div><div class="progress-step"></div></div>
    <div class="modal__body" id="omBody"></div>
    <div class="modal__foot" id="omFoot"></div>
  </div>`;
  mr.classList.add('open');
  renderOrderStep1(p);
}
function closeModal(){$('#modalRoot').classList.remove('open')}

function orderSummaryCard(p,qty){
  qty=qty||1;
  return '<div class="order-summary"><img src="'+(p.images&&p.images[0]||'')+'" alt=""><div style="flex:1"><div class="order-summary__name">'+esc(p.name)+'</div><div style="font-size:12px;color:var(--text-muted)">الكمية: '+qty+'</div><div class="order-summary__price">'+fmtDZD(p.price*qty)+'</div></div></div>';
}

function renderOrderStep1(p){
  $('#omBody').innerHTML=`
    ${orderSummaryCard(p,1)}
    ${fieldInput('name','الاسم الكامل','text')}
    ${fieldInput('phone','رقم الهاتف (05/06/07)','tel')}
    ${wilayaField('wilaya','الولاية')}
    ${fieldInput('commune','البلدية','text')}
    ${fieldInput('address','العنوان التفصيلي (اختياري)','text',false)}
    ${fieldArea('notes','ملاحظات (اختياري)',false)}
  `;
  $('#omFoot').innerHTML=`<button class="btn btn--ghost" onclick="closeModal()">إلغاء</button><button class="btn btn--primary" id="omNext">التالي ›</button>`;
  attachValidation();
  initWilayaDropdown('wilaya');
  $('#omNext').onclick=()=>{
    if(!validateAll())return;
    renderOrderStep2(p);
  };
}
function renderOrderStep2(p){
  $$('.progress-step').forEach((el,i)=>el.classList.toggle('active',i<=1));
  const name=$('#f_name').value.trim();
  const phone=$('#f_phone').value.trim();
  const wilaya=$('#f_wilaya').value;
  const commune=$('#f_commune').value.trim();
  const address=$('#f_address').value.trim();
  const notes=$('#f_notes').value.trim();
  const delivery=state.settings.deliveryPrices[wilaya]||700;
  $('#omBody').innerHTML=`
    <h4 class="font-serif" style="margin-bottom:12px">تأكيد الطلب</h4>
    ${orderSummaryCard(p,1)}
    <div class="glass" style="padding:14px;margin-top:10px">
      <div style="font-size:13px;color:var(--text-muted);margin-bottom:6px">التوصيل إلى</div>
      <div><b>${esc(name)}</b> · ${esc(phone)}</div>
      <div style="font-size:13px;color:var(--text-secondary);margin-top:4px">${esc(wilaya)}، ${esc(commune)}${address?'، '+esc(address):''}</div>
    </div>
    <div style="margin-top:14px">
      <div class="ck-totals"><span>السعر</span><span>${fmtDZD(p.price)}</span></div>
      <div class="ck-totals"><span>الشحن</span><span>${fmtDZD(delivery)}</span></div>
      <div class="ck-totals total"><span>الإجمالي</span><span>${fmtDZD(p.price+delivery)}</span></div>
    </div>
  `;
  $('#omFoot').innerHTML=`<button class="btn btn--ghost" id="omBack">‹ تعديل</button><button class="btn btn--primary" id="omConfirm">✅ تأكيد الطلب</button>`;
  $('#omBack').onclick=()=>{$$('.progress-step').forEach((el,i)=>el.classList.toggle('active',i===0));renderOrderStep1(p)};
  $('#omConfirm').onclick=async()=>{
    const order={id:'ORD-'+Date.now().toString(36).toUpperCase(),customer:{name,phone,wilaya,commune,address},notes,items:[{productId:p.id,name:p.name,price:p.price,qty:1,image:p.images[0]}],subtotal:p.price,delivery:delivery,total:p.price+delivery,status:'pending',source:'modal',createdAt:Date.now()};
    $('#omConfirm').disabled=true;$('#omConfirm').textContent='جاري الإرسال...';
    await saveOrder(order);
    confetti();
    renderOrderSuccessInModal(order);
  };
}
function renderOrderSuccessInModal(order){
  $$('.progress-step').forEach(el=>el.classList.add('active'));
  $('#omBody').innerHTML=`<div class="success-anim">
    <div class="success-check"><svg viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="3"><polyline points="20 6 9 17 4 12"/></svg></div>
    <h3 class="font-serif" style="font-size:24px">تم تأكيد طلبك!</h3>
    <p style="color:var(--text-secondary);margin-top:6px">سنتواصل معك قريباً لتأكيد الطلب</p>
    <div class="success-ref">${order.id}</div>
  </div>`;
  $('#omFoot').innerHTML=`
    <a class="btn btn--whatsapp" href="https://wa.me/${state.settings.whatsappNumber||CONFIG.whatsappNumber}?text=${encodeURIComponent(whatsappOrderMessage(order))}" target="_blank" rel="noopener">📱 متابعة عبر واتساب</a>
    <button class="btn btn--primary" onclick="closeModal()">إغلاق</button>
  `;
}

function whatsappOrderMessage(order){
  const lines=['🛍 *طلب جديد من LUXE*','━━━━━━━━━━━━━━','',
    '📦 *المنتجات:*',
    ...order.items.map(i=>'• '+i.name+' × '+i.qty+' = '+fmtDZD(i.price*i.qty)),
    '','👤 *بيانات العميل:*',
    'الاسم: '+order.customer.name,
    'الهاتف: '+order.customer.phone,
    'الولاية: '+order.customer.wilaya,
    'البلدية: '+order.customer.commune,
    order.customer.address?'العنوان: '+order.customer.address:''];
  if(order.notes)lines.push('','📝 ملاحظات: '+order.notes);
  lines.push('','💰 *الإجمالي: '+fmtDZD(order.total)+'*','رقم الطلب: '+order.id);
  return lines.filter(Boolean).join('\n');
}

async function saveOrder(order){
  state.orders.unshift(order);persist('orders');
  let saved=false;
  try{if(CONFIG.firebase.apiKey&&!CONFIG.firebase.apiKey.startsWith('FIREBASE')){await sendFirestore(order);saved=true}}catch(e){console.warn('firestore fail',e)}
  try{if(CONFIG.emailjs.serviceId&&!CONFIG.emailjs.serviceId.includes('XXXXXXX')){await sendEmailJS(order);saved=true}}catch(e){console.warn('emailjs fail',e)}
  try{if(CONFIG.sheetsWebappUrl&&!CONFIG.sheetsWebappUrl.includes('YOUR_'))await sendSheets(order)}catch(e){console.warn('sheets fail',e)}
  toast(saved?'تم تأكيد طلبك بنجاح!':'تم حفظ الطلب محلياً. سنتواصل معك قريباً.','success',5000);
  return order;
}
async function sendFirestore(order){
  const {initializeApp}=await import('https://www.gstatic.com/firebasejs/10.7.0/firebase-app.js');
  const {getFirestore,collection,addDoc,serverTimestamp}=await import('https://www.gstatic.com/firebasejs/10.7.0/firebase-firestore.js');
  const app=initializeApp(CONFIG.firebase);const db=getFirestore(app);
  await addDoc(collection(db,'orders'),Object.assign({},order,{createdAt:serverTimestamp()}));
}
async function sendEmailJS(order){
  return new Promise((resolve,reject)=>{
    const s=document.createElement('script');s.src='https://cdn.jsdelivr.net/npm/@emailjs/browser@4/dist/email.min.js';
    s.onload=()=>{
      window.emailjs.init(CONFIG.emailjs.publicKey);
      window.emailjs.send(CONFIG.emailjs.serviceId,CONFIG.emailjs.templateId,{
        to_email:CONFIG.emailjs.to,order_id:order.id,name:order.customer.name,phone:order.customer.phone,
        wilaya:order.customer.wilaya,commune:order.customer.commune,address:order.customer.address||'',
        items:order.items.map(i=>i.name+' ×'+i.qty).join(', '),total:fmtDZD(order.total),notes:order.notes||''
      }).then(resolve).catch(reject);
    };s.onerror=reject;document.head.appendChild(s);
  });
}
async function sendSheets(order){
  await fetch(CONFIG.sheetsWebappUrl,{method:'POST',mode:'no-cors',headers:{'Content-Type':'application/json'},body:JSON.stringify(order)});
}

/* ═══════════════════════ ORDERS ═══════════════════════ */
async function renderOrders(){
  const orders=state.orders.slice(0,50);
  if(!orders.length){
    $('#pageContent').innerHTML='<div class="container section" style="text-align:center"><div style="font-size:80px;opacity:.3">📦</div><h1 class="font-serif">لا توجد طلبات</h1><p style="color:var(--text-secondary);margin:12px 0 20px">لم تقم بأي طلب بعد</p><button class="btn btn--primary" onclick="navigate(\'#home\')">ابدأ التسوق</button></div>';
    return;
  }
  $('#pageContent').innerHTML=`<div class="container section">
    <h1 class="page-title">طلباتي</h1>
    ${orders.map(o=>{
      const steps=['pending','confirmed','delivering','delivered'];
      const idx=steps.indexOf(o.status);
      return `<div class="order-track">
        <div class="order-track__head">
          <div><b>${o.id}</b> · <span style="color:var(--text-muted);font-size:13px">${new Date(o.createdAt).toLocaleDateString('ar-DZ')}</span></div>
          <div><span class="status-badge status-${o.status}">${statusLabel(o.status)}</span> · <b class="gold-text">${fmtDZD(o.total)}</b></div>
        </div>
        <div style="color:var(--text-secondary);font-size:13px;margin-top:6px">${o.items.map(i=>esc(i.name)+' ×'+i.qty).join('، ')}</div>
        <div class="order-track__timeline">
          ${['pending','confirmed','delivering','delivered'].map((s,i)=>`<div class="track-node ${i<=idx?'done':''} ${i===idx?'active':''}"><div class="track-node__dot">${i<=idx?'✓':i+1}</div><div style="font-size:11px">${statusLabel(s)}</div></div>`).join('')}
        </div>
      </div>`;
    }).join('')}
  </div>`;
}
function statusLabel(s){return {pending:'قيد الانتظار',confirmed:'تم التأكيد',delivering:'قيد التوصيل',delivered:'تم التسليم',cancelled:'ملغى'}[s]||s}

/* ═══════════════════════ ABOUT / CONTACT ═══════════════════════ */
async function renderAbout(){
  $('#pageContent').innerHTML=`<div class="container section">
    <div class="about-hero">
      <span class="section__label">About LUXE</span>
      <h1 class="font-serif" style="font-size:clamp(36px,6vw,64px);margin:10px 0">قصتنا</h1>
      <p style="max-width:700px;margin:0 auto;color:var(--text-secondary);font-size:18px">LUXE هي الوجهة الأولى لعشاق الأزياء الفاخرة في الجزائر. نقدم مجموعة مختارة بعناية من أفضل الماركات العالمية لنمنحك تجربة تسوق استثنائية.</p>
    </div>
    <section>
      <h2 class="font-serif" style="font-size:32px;text-align:center;margin-bottom:12px">قيمنا</h2>
      <div class="values-grid">
        <div class="trust-card"><div class="trust-card__icon">💎</div><div class="trust-card__title">الجودة أولاً</div><div class="trust-card__desc">اختيار دقيق لأفضل المنتجات</div></div>
        <div class="trust-card"><div class="trust-card__icon">🤝</div><div class="trust-card__title">ثقة العملاء</div><div class="trust-card__desc">نبني علاقات طويلة مع عملائنا</div></div>
        <div class="trust-card"><div class="trust-card__icon">✨</div><div class="trust-card__title">الأناقة الدائمة</div><div class="trust-card__desc">تصاميم عصرية تحترم الأصالة</div></div>
      </div>
    </section>
    <section style="margin-top:48px">
      <h2 class="font-serif" style="font-size:32px;text-align:center;margin-bottom:12px">الفريق</h2>
      <div class="team-grid">
        ${['CEO','Designer','Stylist','Support'].map((r,i)=>`<div class="team-card"><div class="team-avatar">${['A','M','S','K'][i]}</div><div style="font-weight:700;margin-bottom:4px">عضو #${i+1}</div><div style="font-size:13px;color:var(--text-muted)">${r}</div></div>`).join('')}
      </div>
    </section>
    ${renderFooter()}
  </div>`;
}

async function renderContact(){
  $('#pageContent').innerHTML=`<div class="container section">
    <h1 class="page-title">تواصل معنا</h1>
    <div class="two-col">
      <div class="glass" style="padding:28px">
        <h3 class="font-serif" style="margin-bottom:16px">أرسل رسالة</h3>
        <div id="contactForm">
          ${fieldInput('cname','الاسم','text')}
          ${fieldInput('cemail','البريد الإلكتروني','email')}
          ${fieldInput('cphone','الهاتف','tel',false)}
          ${fieldArea('cmessage','رسالتك')}
          <button class="btn btn--primary btn--block" id="sendMsg">إرسال</button>
        </div>
      </div>
      <div>
        <div class="glass" style="padding:24px;margin-bottom:14px">
          <div style="font-size:12px;color:var(--text-muted);letter-spacing:.1em;text-transform:uppercase;margin-bottom:6px">📞 الهاتف</div>
          <a href="tel:+${CONFIG.whatsappNumber}" style="font-size:18px;font-weight:700">+${CONFIG.whatsappNumber}</a>
        </div>
        <div class="glass" style="padding:24px;margin-bottom:14px">
          <div style="font-size:12px;color:var(--text-muted);letter-spacing:.1em;text-transform:uppercase;margin-bottom:6px">✉ البريد</div>
          <a href="mailto:${CONFIG.contactEmail}" style="font-size:18px;font-weight:700">${CONFIG.contactEmail}</a>
        </div>
        <a class="btn btn--whatsapp btn--block btn--lg" href="https://wa.me/${CONFIG.whatsappNumber}" target="_blank" rel="noopener">💬 واتساب مباشر</a>
      </div>
    </div>
    ${renderFooter()}
  </div>`;
  attachValidation();
  $('#sendMsg').onclick=()=>{
    if(!validateAll())return;
    toast('تم إرسال رسالتك! سنتواصل معك قريباً.','success');
    ['cname','cemail','cphone','cmessage'].forEach(k=>{const e=$('#f_'+k);if(e)e.value=''});
  };
}


/* ═══════════════════════ ADMIN AUTH ═══════════════════════ */
function getLockout(){try{return JSON.parse(localStorage.getItem(STORE_KEYS.adminLockout)||'null')}catch(e){return null}}
function setLockout(obj){localStorage.setItem(STORE_KEYS.adminLockout,JSON.stringify(obj||{}))}
function isLockedOut(){const l=getLockout();if(!l||!l.until)return false;if(Date.now()<l.until)return true;setLockout(null);return false}
function isAuthed(){
  const tok=sessionStorage.getItem(SESSION_KEYS.token);
  const exp=+sessionStorage.getItem(SESSION_KEYS.tokenExpires)||0;
  if(!tok||Date.now()>exp){sessionStorage.removeItem(SESSION_KEYS.token);sessionStorage.removeItem(SESSION_KEYS.tokenExpires);return false}
  sessionStorage.setItem(SESSION_KEYS.tokenExpires,String(Date.now()+SESSION_TTL_MS));
  return true;
}
function adminLogout(){sessionStorage.removeItem(SESSION_KEYS.token);sessionStorage.removeItem(SESSION_KEYS.tokenExpires);toast('تم تسجيل الخروج','info');navigate('#home')}
window.adminLogout=adminLogout;

async function renderAdminLogin(){
  const locked=isLockedOut();
  const l=getLockout()||{};
  $('#pageContent').innerHTML=`<div class="admin-login"><div class="admin-login__card">
    <div class="admin-login__logo">L</div>
    <h2 class="admin-login__title">🔐 لوحة التحكم</h2>
    ${locked?'<div class="toast toast--error" style="margin-bottom:14px"><div class="toast__icon">✕</div><div class="toast__body">تم قفل الحساب. حاول بعد '+Math.ceil((l.until-Date.now())/60000)+' دقيقة</div></div>':''}
    ${fieldInput('user','اسم المستخدم','text')}
    ${fieldInput('pass','كلمة المرور','password')}
    <button class="btn btn--primary btn--block btn--lg" id="loginBtn" ${locked?'disabled':''}>تسجيل الدخول</button>
    <div class="admin-login__attempts">${l.attempts?'محاولات فاشلة: '+l.attempts+'/'+LOCKOUT_ATTEMPTS:''}</div>
  </div></div>`;
  attachValidation();
  $('#loginBtn').onclick=async()=>{
    if(isLockedOut()){toast('الحساب مقفل مؤقتاً','error');return}
    const u=$('#f_user').value.trim();const p=$('#f_pass').value;
    if(!u||!p){toast('املأ جميع الحقول','error');return}
    const [uH,pH]=await Promise.all([sha256(u),sha256(p)]);
    if(uH===ADMIN_USER_HASH && pH===ADMIN_PASS_HASH){
      sessionStorage.setItem(SESSION_KEYS.token,(crypto.randomUUID?crypto.randomUUID():String(Date.now()))+'-'+Date.now());
      sessionStorage.setItem(SESSION_KEYS.tokenExpires,String(Date.now()+SESSION_TTL_MS));
      setLockout(null);toast('أهلاً بك!','success');navigate('#admin');
    }else{
      const cur=getLockout()||{attempts:0};
      cur.attempts=(cur.attempts||0)+1;
      if(cur.attempts>=LOCKOUT_ATTEMPTS){cur.until=Date.now()+LOCKOUT_MS;toast('تم قفل الحساب لمدة 15 دقيقة','error')}
      else toast('بيانات خاطئة. محاولة '+cur.attempts+'/'+LOCKOUT_ATTEMPTS,'error');
      setLockout(cur);renderAdminLogin();
    }
  };
}

/* ═══════════════════════ ADMIN DASHBOARD ═══════════════════════ */
let adminTab='stats';
async function renderAdmin(){
  if(!isAuthed()){navigate('#admin-login');return}
  const counts={
    total:state.orders.length,
    pending:state.orders.filter(o=>o.status==='pending').length,
    confirmed:state.orders.filter(o=>o.status==='confirmed').length,
    products:state.products.length
  };
  $('#pageContent').innerHTML=`<div class="admin">
    <aside class="admin__sidebar">
      <h3>الإدارة</h3>
      <nav class="admin-nav" id="adminNav">
        ${[['stats','📊 إحصائيات'],['products','🛍 المنتجات'],['categories','🗂 التصنيفات'],['offers','🎁 العروض'],['orders','📦 الطلبات'],['settings','⚙ الإعدادات']].map(([k,l])=>`<a data-tab="${k}" class="${adminTab===k?'active':''}"><span>${l}</span></a>`).join('')}
        <a onclick="adminLogout()" style="margin-top:auto;color:var(--danger)"><span>🚪 خروج</span></a>
      </nav>
    </aside>
    <div class="admin__main" id="adminMain"></div>
  </div>`;
  $$('#adminNav a[data-tab]').forEach(a=>a.onclick=()=>{adminTab=a.dataset.tab;renderAdmin()});
  const main=$('#adminMain');
  if(adminTab==='stats')renderAdminStats(main,counts);
  else if(adminTab==='products')renderAdminProducts(main);
  else if(adminTab==='categories')renderAdminCategories(main);
  else if(adminTab==='offers')renderAdminOffers(main);
  else if(adminTab==='orders')renderAdminOrders(main);
  else if(adminTab==='settings')renderAdminSettings(main);
}

function renderAdminStats(main,counts){
  const revenue=state.orders.filter(o=>o.status!=='cancelled').reduce((s,o)=>s+o.total,0);
  main.innerHTML=`
    <div class="admin__head"><h1>📊 نظرة عامة</h1><span style="color:var(--text-muted);font-size:13px">${new Date().toLocaleDateString('ar-DZ',{dateStyle:'full'})}</span></div>
    <div class="kpi-grid">
      ${[['إجمالي الطلبات',counts.total,''],['قيد الانتظار',counts.pending,''],['تم التأكيد',counts.confirmed,''],['المنتجات',counts.products,''],['الإيرادات',fmtDZD(revenue),'']].slice(0,4).map(([l,v])=>`<div class="kpi"><div class="kpi__label">${l}</div><div class="kpi__value">${v}</div><div class="kpi__trend">↗ +12%</div></div>`).join('')}
    </div>
    <div class="chart-grid">
      <div class="chart-card"><h3>الطلبات (آخر 7 أيام)</h3><canvas id="chart1"></canvas></div>
      <div class="chart-card"><h3>الطلبات حسب الولاية</h3><canvas id="chart2"></canvas></div>
    </div>
    <div class="chart-card"><h3>أحدث الطلبات</h3>
      <div class="tbl-wrap" style="background:transparent;border:none"><table class="tbl">
        <thead><tr><th>رقم الطلب</th><th>العميل</th><th>الإجمالي</th><th>الحالة</th><th>التاريخ</th></tr></thead>
        <tbody>${state.orders.slice(0,5).map(o=>`<tr><td>${o.id}</td><td>${esc(o.customer.name)}</td><td>${fmtDZD(o.total)}</td><td><span class="status-badge status-${o.status}">${statusLabel(o.status)}</span></td><td>${new Date(o.createdAt).toLocaleDateString('ar-DZ')}</td></tr>`).join('')||'<tr><td colspan="5" style="text-align:center;color:var(--text-muted);padding:30px">لا توجد طلبات بعد</td></tr>'}</tbody>
      </table></div>
    </div>
  `;
  setTimeout(()=>initCharts(),100);
}

function initCharts(){
  if(!window.Chart)return;
  Chart.defaults.color='rgba(196,181,212,0.7)';
  Chart.defaults.borderColor='rgba(168,85,247,0.1)';
  const days=Array.from({length:7},(_,i)=>{const d=new Date();d.setDate(d.getDate()-(6-i));return d});
  const daily=days.map(d=>state.orders.filter(o=>{const od=new Date(o.createdAt);return od.toDateString()===d.toDateString()}).length);
  const c1=$('#chart1');if(c1)new Chart(c1,{type:'line',data:{labels:days.map(d=>d.toLocaleDateString('ar-DZ',{weekday:'short'})),datasets:[{label:'طلبات',data:daily,borderColor:'#a855f7',backgroundColor:'rgba(168,85,247,0.15)',fill:true,tension:0.4,pointRadius:4,pointBackgroundColor:'#d4af37'}]},options:{responsive:true,maintainAspectRatio:false,plugins:{legend:{display:false}}}});
  const wilayaCounts={};state.orders.forEach(o=>{const w=o.customer.wilaya||'غير محدد';wilayaCounts[w]=(wilayaCounts[w]||0)+1});
  const entries=Object.entries(wilayaCounts).slice(0,5);
  const c2=$('#chart2');if(c2)new Chart(c2,{type:'doughnut',data:{labels:entries.map(e=>e[0]),datasets:[{data:entries.map(e=>e[1]),backgroundColor:['#a855f7','#d4af37','#ec4899','#3b82f6','#10b981']}]},options:{responsive:true,maintainAspectRatio:false}});
}

function renderAdminProducts(main){
  main.innerHTML=`
    <div class="admin__head"><h1>🛍 المنتجات</h1>
      <div style="display:flex;gap:8px">
        <input type="search" id="pSearch" class="form-input" placeholder="بحث..." style="max-width:220px">
        <button class="btn btn--primary" onclick="openProductDrawer()">+ إضافة منتج</button>
      </div>
    </div>
    <div class="tbl-wrap"><table class="tbl">
      <thead><tr><th>صورة</th><th>الاسم</th><th>التصنيف</th><th>السعر</th><th>المخزون</th><th>حالة</th><th></th></tr></thead>
      <tbody id="pTbody"></tbody>
    </table></div>
  `;
  const render=(q)=>{
    q=(q||'').toLowerCase();
    const list=state.products.filter(p=>!q||p.name.toLowerCase().includes(q));
    $('#pTbody').innerHTML=list.map(p=>{
      const cat=state.categories.find(c=>c.id===p.category);
      const badges=[];
      if(p.isNew)badges.push('<span class="pill pill--new">جديد</span>');
      if(p.bestSeller)badges.push('<span class="pill pill--best">⭐</span>');
      return `<tr>
        <td><img src="${p.images&&p.images[0]||''}" alt=""></td>
        <td><b>${esc(p.name)}</b></td>
        <td>${esc(cat?cat.nameAr:'')}</td>
        <td><b class="gold-text">${fmtDZD(p.price)}</b>${p.oldPrice?'<br><span style="font-size:11px;text-decoration:line-through;color:var(--text-muted)">'+fmtDZD(p.oldPrice)+'</span>':''}</td>
        <td>${p.stock}</td>
        <td>${badges.join(' ')}</td>
        <td class="tbl-actions"><button onclick="openProductDrawer('${p.id}')" title="تعديل">✏</button><button onclick="deleteProduct('${p.id}')" title="حذف" style="background:rgba(239,68,68,.2)">✕</button></td>
      </tr>`;
    }).join('')||'<tr><td colspan="7" style="text-align:center;padding:30px;color:var(--text-muted)">لا توجد منتجات</td></tr>';
  };
  render();
  $('#pSearch').addEventListener('input',debounce(e=>render(e.target.value),250));
}

window.deleteProduct=function(id){
  if(!confirm('حذف هذا المنتج؟'))return;
  state.products=state.products.filter(p=>p.id!==id);persist('products');toast('تم الحذف','success');renderAdmin();
};

window.openProductDrawer=function(id){
  const p=id?state.products.find(x=>x.id===id):{id:'p'+Date.now(),name:'',category:state.categories[0]?state.categories[0].id:'men',price:0,oldPrice:0,stock:0,description:'',features:[],images:[],sizes:[],colors:[],isNew:false,trending:false,bestSeller:false,featured:false};
  $('#drawerTitle').textContent=id?'تعديل المنتج':'إضافة منتج';
  $('#drawerBody').innerHTML=`
    <div class="form-row"><input id="dp_name" class="form-input" placeholder=" " value="${esc(p.name||'')}"><label class="form-label">اسم المنتج *</label></div>
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px">
      <div class="form-row"><select id="dp_cat" class="form-select">${state.categories.map(c=>'<option value="'+c.id+'" '+(p.category===c.id?'selected':'')+'>'+esc(c.nameAr)+'</option>').join('')}</select><label class="form-label" style="top:-8px;font-size:12px;color:var(--purple-glow)">التصنيف</label></div>
      <div class="form-row"><input id="dp_stock" type="number" class="form-input" placeholder=" " value="${p.stock||0}"><label class="form-label">المخزون</label></div>
    </div>
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px">
      <div class="form-row"><input id="dp_price" type="number" class="form-input" placeholder=" " value="${p.price||0}"><label class="form-label">السعر (دج) *</label></div>
      <div class="form-row"><input id="dp_old" type="number" class="form-input" placeholder=" " value="${p.oldPrice||''}"><label class="form-label">السعر القديم</label></div>
    </div>
    <div class="form-row"><textarea id="dp_desc" class="form-area" placeholder=" ">${esc(p.description||'')}</textarea><label class="form-label">الوصف</label></div>
    <div class="form-row"><textarea id="dp_features" class="form-area" placeholder=" ">${esc((p.features||[]).join('\n'))}</textarea><label class="form-label">المميزات (سطر لكل ميزة)</label></div>
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px">
      <div class="form-row"><input id="dp_sizes" class="form-input" placeholder=" " value="${esc((p.sizes||[]).join(','))}"><label class="form-label">المقاسات (مفصولة بفواصل)</label></div>
      <div class="form-row"><input id="dp_colors" class="form-input" placeholder=" " value="${esc((p.colors||[]).join(','))}"><label class="form-label">الألوان (#hex مفصولة بفواصل)</label></div>
    </div>
    <div style="display:flex;gap:18px;flex-wrap:wrap;margin:12px 0">
      ${[['isNew','جديد'],['trending','رائج'],['bestSeller','الأكثر مبيعاً'],['featured','مميز']].map(([k,l])=>`<label style="display:flex;gap:8px;align-items:center;font-size:14px"><span class="switch"><input type="checkbox" id="dp_${k}" ${p[k]?'checked':''}><span></span></span>${l}</label>`).join('')}
    </div>
    <div style="font-size:13px;color:var(--text-muted);margin-bottom:8px">الصور (URLs، سطر لكل صورة)</div>
    <div class="form-row"><textarea id="dp_images" class="form-area" placeholder="https://..." style="min-height:100px">${esc((p.images||[]).join('\n'))}</textarea></div>
    <div class="dropzone" onclick="document.getElementById('dpImgFile').click()">
      <input type="file" id="dpImgFile" accept="image/*" multiple style="display:none">
      <div style="font-size:28px">📤</div><div>اسحب الصور أو اضغط للرفع (سيتم تحويلها إلى Base64)</div>
    </div>
    <div class="img-grid" id="dpImgPreview"></div>
  `;
  $('#drawerFoot').innerHTML=`<button class="btn btn--ghost" onclick="closeDrawer()">إلغاء</button><button class="btn btn--primary" id="dpSave">حفظ</button>`;
  const preview=()=>{
    const urls=($('#dp_images').value||'').split('\n').map(s=>s.trim()).filter(Boolean);
    $('#dpImgPreview').innerHTML=urls.map((u,i)=>'<div class="img-tile '+(i===0?'primary':'')+'"><img src="'+esc(u)+'"></div>').join('');
  };
  preview();
  $('#dp_images').addEventListener('input',preview);
  $('#dpImgFile').onchange=(e)=>{
    const files=Array.from(e.target.files||[]);
    Promise.all(files.map(f=>new Promise(res=>{const r=new FileReader();r.onload=()=>res(r.result);r.readAsDataURL(f)}))).then(urls=>{
      const ta=$('#dp_images');ta.value=(ta.value?ta.value+'\n':'')+urls.join('\n');preview();
    });
  };
  openDrawer();
  $('#dpSave').onclick=()=>{
    const next=Object.assign({},p,{
      name:$('#dp_name').value.trim(),category:$('#dp_cat').value,price:+$('#dp_price').value||0,oldPrice:+$('#dp_old').value||0,stock:+$('#dp_stock').value||0,
      description:$('#dp_desc').value.trim(),features:$('#dp_features').value.split('\n').map(s=>s.trim()).filter(Boolean),
      images:$('#dp_images').value.split('\n').map(s=>s.trim()).filter(Boolean),
      sizes:$('#dp_sizes').value.split(',').map(s=>s.trim()).filter(Boolean),
      colors:$('#dp_colors').value.split(',').map(s=>s.trim()).filter(Boolean),
      isNew:$('#dp_isNew').checked,trending:$('#dp_trending').checked,bestSeller:$('#dp_bestSeller').checked,featured:$('#dp_featured').checked
    });
    if(!next.name||next.price<=0){toast('أكمل الحقول المطلوبة','error');return}
    if(id){state.products=state.products.map(x=>x.id===id?next:x)}else{state.products.push(next)}
    persist('products');toast('تم الحفظ','success');closeDrawer();renderAdmin();
  };
};
window.openDrawer=function(){$('#drawer').classList.add('open')};
window.closeDrawer=function(){$('#drawer').classList.remove('open')};

function renderAdminCategories(main){
  main.innerHTML=`<div class="admin__head"><h1>🗂 التصنيفات</h1><button class="btn btn--primary" onclick="openCatDrawer()">+ إضافة تصنيف</button></div>
    <div class="tbl-wrap"><table class="tbl">
      <thead><tr><th>الأيقونة</th><th>الاسم</th><th>الكود</th><th>المنتجات</th><th></th></tr></thead>
      <tbody>${state.categories.map(c=>`<tr><td style="font-size:24px">${c.icon||'📁'}</td><td><b>${esc(c.nameAr)}</b> <span style="color:var(--text-muted);font-size:12px">${esc(c.nameFr||'')}</span></td><td><code>${esc(c.id)}</code></td><td>${state.products.filter(p=>p.category===c.id).length}</td><td class="tbl-actions"><button onclick="openCatDrawer('${c.id}')">✏</button><button style="background:rgba(239,68,68,.2)" onclick="deleteCategory('${c.id}')">✕</button></td></tr>`).join('')}</tbody>
    </table></div>`;
}
window.deleteCategory=function(id){if(!confirm('حذف التصنيف؟'))return;state.categories=state.categories.filter(c=>c.id!==id);persist('categories');renderAdmin()};
window.openCatDrawer=function(id){
  const c=id?state.categories.find(x=>x.id===id):{id:'',nameAr:'',nameFr:'',icon:'📁',cover:'',gradient:'linear-gradient(135deg,#7c3aed,#14002b)'};
  $('#drawerTitle').textContent=id?'تعديل التصنيف':'إضافة تصنيف';
  $('#drawerBody').innerHTML=`
    <div class="form-row"><input id="dc_id" class="form-input" placeholder=" " value="${esc(c.id)}" ${id?'disabled':''}><label class="form-label">الكود (slug) *</label></div>
    <div class="form-row"><input id="dc_nameAr" class="form-input" placeholder=" " value="${esc(c.nameAr)}"><label class="form-label">الاسم بالعربية *</label></div>
    <div class="form-row"><input id="dc_nameFr" class="form-input" placeholder=" " value="${esc(c.nameFr)}"><label class="form-label">الاسم بالفرنسية</label></div>
    <div class="form-row"><input id="dc_icon" class="form-input" placeholder=" " value="${esc(c.icon)}"><label class="form-label">الأيقونة (emoji)</label></div>
    <div class="form-row"><input id="dc_cover" class="form-input" placeholder=" " value="${esc(c.cover)}"><label class="form-label">رابط صورة الغلاف</label></div>
  `;
  $('#drawerFoot').innerHTML=`<button class="btn btn--ghost" onclick="closeDrawer()">إلغاء</button><button class="btn btn--primary" id="dcSave">حفظ</button>`;
  openDrawer();
  $('#dcSave').onclick=()=>{
    const next={id:$('#dc_id').value.trim(),nameAr:$('#dc_nameAr').value.trim(),nameFr:$('#dc_nameFr').value.trim(),icon:$('#dc_icon').value.trim()||'📁',cover:$('#dc_cover').value.trim(),gradient:c.gradient};
    if(!next.id||!next.nameAr){toast('أكمل الحقول','error');return}
    if(id){state.categories=state.categories.map(x=>x.id===id?next:x)}else{state.categories.push(next)}
    persist('categories');closeDrawer();toast('تم الحفظ','success');renderAdmin();
  };
};

function renderAdminOffers(main){
  main.innerHTML=`<div class="admin__head"><h1>🎁 العروض</h1><button class="btn btn--primary" onclick="openOfferDrawer()">+ إضافة عرض</button></div>
    <div class="tbl-wrap"><table class="tbl">
      <thead><tr><th>الأيقونة</th><th>العنوان</th><th>الكود</th><th>الخصم</th><th>نشط</th><th>ينتهي</th><th></th></tr></thead>
      <tbody>${state.offers.map(o=>`<tr><td style="font-size:22px">${o.icon||'🎁'}</td><td><b>${esc(o.title)}</b><br><span style="font-size:12px;color:var(--text-muted)">${esc(o.description)}</span></td><td><code>${esc(o.code)}</code></td><td>${o.discount}%</td><td>${o.active?'✅':'❌'}</td><td style="font-size:12px">${new Date(o.endsAt).toLocaleDateString('ar-DZ')}</td><td class="tbl-actions"><button onclick="openOfferDrawer('${o.id}')">✏</button><button style="background:rgba(239,68,68,.2)" onclick="deleteOffer('${o.id}')">✕</button></td></tr>`).join('')}</tbody>
    </table></div>`;
}
window.deleteOffer=function(id){if(!confirm('حذف العرض؟'))return;state.offers=state.offers.filter(o=>o.id!==id);persist('offers');renderAdmin()};
window.openOfferDrawer=function(id){
  const o=id?state.offers.find(x=>x.id===id):{id:'o'+Date.now(),title:'',description:'',code:'',discount:10,endsAt:Date.now()+7*864e5,active:true,icon:'🎁',link:'#home'};
  $('#drawerTitle').textContent=id?'تعديل العرض':'إضافة عرض';
  $('#drawerBody').innerHTML=`
    <div class="form-row"><input id="do_title" class="form-input" placeholder=" " value="${esc(o.title)}"><label class="form-label">العنوان *</label></div>
    <div class="form-row"><textarea id="do_desc" class="form-area" placeholder=" ">${esc(o.description)}</textarea><label class="form-label">الوصف</label></div>
    <div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:10px">
      <div class="form-row"><input id="do_code" class="form-input" placeholder=" " value="${esc(o.code)}"><label class="form-label">الكود</label></div>
      <div class="form-row"><input id="do_discount" type="number" class="form-input" placeholder=" " value="${o.discount}"><label class="form-label">الخصم %</label></div>
      <div class="form-row"><input id="do_icon" class="form-input" placeholder=" " value="${esc(o.icon)}"><label class="form-label">أيقونة</label></div>
    </div>
    <div class="form-row"><input id="do_link" class="form-input" placeholder=" " value="${esc(o.link||'#home')}"><label class="form-label">الرابط</label></div>
    <div class="form-row"><input id="do_ends" type="datetime-local" class="form-input" value="${new Date(o.endsAt).toISOString().slice(0,16)}"><label class="form-label" style="top:-8px;font-size:12px;color:var(--purple-glow)">ينتهي في</label></div>
    <label style="display:flex;gap:8px;align-items:center"><span class="switch"><input type="checkbox" id="do_active" ${o.active?'checked':''}><span></span></span> نشط</label>
  `;
  $('#drawerFoot').innerHTML=`<button class="btn btn--ghost" onclick="closeDrawer()">إلغاء</button><button class="btn btn--primary" id="doSave">حفظ</button>`;
  openDrawer();
  $('#doSave').onclick=()=>{
    const next=Object.assign({},o,{title:$('#do_title').value.trim(),description:$('#do_desc').value.trim(),code:$('#do_code').value.trim().toUpperCase(),discount:+$('#do_discount').value||0,icon:$('#do_icon').value.trim()||'🎁',link:$('#do_link').value.trim()||'#home',endsAt:new Date($('#do_ends').value).getTime(),active:$('#do_active').checked});
    if(!next.title){toast('أكمل الحقول','error');return}
    if(id){state.offers=state.offers.map(x=>x.id===id?next:x)}else{state.offers.push(next)}
    persist('offers');closeDrawer();toast('تم الحفظ','success');renderAdmin();
  };
};

function renderAdminOrders(main){
  main.innerHTML=`<div class="admin__head"><h1>📦 الطلبات (${state.orders.length})</h1>
    <div style="display:flex;gap:8px">
      <select id="oFilter" class="form-select" style="padding:10px 12px">
        <option value="">كل الحالات</option>
        ${['pending','confirmed','delivering','delivered','cancelled'].map(s=>`<option value="${s}">${statusLabel(s)}</option>`).join('')}
      </select>
      <button class="btn btn--ghost" onclick="exportOrdersCSV()">📥 تصدير CSV</button>
    </div>
  </div>
  <div class="tbl-wrap"><table class="tbl">
    <thead><tr><th>رقم</th><th>العميل</th><th>الولاية</th><th>المنتجات</th><th>الإجمالي</th><th>الحالة</th><th>التاريخ</th><th></th></tr></thead>
    <tbody id="oTbody"></tbody>
  </table></div>`;
  const render=()=>{
    const f=$('#oFilter').value;
    const list=state.orders.filter(o=>!f||o.status===f);
    $('#oTbody').innerHTML=list.map(o=>`<tr>
      <td><b>${o.id}</b></td>
      <td>${esc(o.customer.name)}<br><span style="font-size:12px;color:var(--text-muted)">${esc(o.customer.phone)}</span></td>
      <td>${esc(o.customer.wilaya)}</td>
      <td style="font-size:12px">${o.items.map(i=>esc(i.name)+' ×'+i.qty).join('<br>')}</td>
      <td><b class="gold-text">${fmtDZD(o.total)}</b></td>
      <td><select class="form-select" style="padding:6px 10px;font-size:12px" onchange="updateOrderStatus('${o.id}',this.value)">
        ${['pending','confirmed','delivering','delivered','cancelled'].map(s=>`<option value="${s}" ${o.status===s?'selected':''}>${statusLabel(s)}</option>`).join('')}
      </select></td>
      <td style="font-size:12px">${new Date(o.createdAt).toLocaleString('ar-DZ')}</td>
      <td class="tbl-actions">
        <a href="https://wa.me/${(o.customer.phone||'').replace(/^0/,'213')}" target="_blank" rel="noopener" title="واتساب" style="display:flex;align-items:center;justify-content:center;background:rgba(37,211,102,.2)">💬</a>
        <button onclick="deleteOrder('${o.id}')" title="حذف" style="background:rgba(239,68,68,.2)">✕</button>
      </td>
    </tr>`).join('')||'<tr><td colspan="8" style="text-align:center;padding:30px;color:var(--text-muted)">لا توجد طلبات</td></tr>';
  };
  render();
  $('#oFilter').addEventListener('change',render);
}
window.updateOrderStatus=function(id,status){
  const o=state.orders.find(x=>x.id===id);if(!o)return;o.status=status;persist('orders');toast('تم تحديث الحالة','success');
};
window.deleteOrder=function(id){if(!confirm('حذف الطلب؟'))return;state.orders=state.orders.filter(o=>o.id!==id);persist('orders');renderAdmin()};
window.exportOrdersCSV=function(){
  const headers=['ID','Name','Phone','Wilaya','Commune','Items','Total','Status','Date'];
  const rows=state.orders.map(o=>[o.id,o.customer.name,o.customer.phone,o.customer.wilaya,o.customer.commune,o.items.map(i=>i.name+'x'+i.qty).join('|'),o.total,o.status,new Date(o.createdAt).toLocaleString()]);
  const csv=[headers,...rows].map(r=>r.map(c=>'"'+String(c||'').replace(/"/g,'""')+'"').join(',')).join('\n');
  const blob=new Blob(['\uFEFF'+csv],{type:'text/csv;charset=utf-8'});
  const a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download='orders-'+Date.now()+'.csv';a.click();
};

function renderAdminSettings(main){
  const s=state.settings;
  main.innerHTML=`<div class="admin__head"><h1>⚙ الإعدادات</h1></div>
    <div class="glass" style="padding:24px;max-width:720px">
      <div class="settings-field"><label>اسم المتجر</label><input class="form-input" id="s_name" value="${esc(s.storeName)}"></div>
      <div class="settings-field"><label>رقم واتساب (مثال 213555000000)</label><input class="form-input" id="s_wa" value="${esc(s.whatsappNumber)}"></div>
      <div class="settings-field"><label>البريد الإلكتروني</label><input class="form-input" id="s_email" value="${esc(s.contactEmail)}"></div>
      <div class="settings-field"><label><span class="switch"><input type="checkbox" id="s_maint" ${s.maintenanceMode?'checked':''}><span></span></span> وضع الصيانة</label></div>
      <h3 style="margin:20px 0 10px;font-family:var(--font-serif)">أسعار التوصيل</h3>
      <div style="display:grid;grid-template-columns:repeat(2,1fr);gap:8px;max-height:320px;overflow-y:auto">
        ${WILAYAS.map(([n,en,ar])=>`<label style="display:flex;align-items:center;gap:8px;font-size:12px"><span style="min-width:120px">${esc(ar)}</span><input class="form-input" data-wilaya="${esc(en)}" type="number" value="${s.deliveryPrices[en]||700}" style="padding:6px;max-width:100px"></label>`).join('')}
      </div>
      <button class="btn btn--primary" id="sSave" style="margin-top:20px">حفظ الإعدادات</button>
    </div>`;
  $('#sSave').onclick=()=>{
    state.settings.storeName=$('#s_name').value.trim()||'LUXE';
    state.settings.whatsappNumber=$('#s_wa').value.trim();
    state.settings.contactEmail=$('#s_email').value.trim();
    state.settings.maintenanceMode=$('#s_maint').checked;
    $$('[data-wilaya]').forEach(i=>{state.settings.deliveryPrices[i.dataset.wilaya]=+i.value||0});
    persist('settings');toast('تم حفظ الإعدادات','success');
  };
}


/* ═══════════════════════ EVENTS / INIT ═══════════════════════ */
window.addEventListener('scroll',()=>{
  const h=$('#header');if(h)h.classList.toggle('scrolled',window.scrollY>40);
},{passive:true});

$('#cartBtn').onclick=()=>openCart();
$('#closeCartBtn').onclick=closeCart;
$('#checkoutFromCartBtn').onclick=()=>{closeCart();navigate('#checkout')};
$('#menuToggle').onclick=()=>$('#mobileMenu').classList.add('open');
$('#mobileMenuClose').onclick=()=>$('#mobileMenu').classList.remove('open');
$$('#mobileMenu a').forEach(a=>a.addEventListener('click',()=>$('#mobileMenu').classList.remove('open')));

$('#modalRoot').addEventListener('click',e=>{if(e.target===$('#modalRoot'))closeModal()});
document.addEventListener('keydown',(e)=>{
  if(e.key==='Escape'){
    closeModal();
    $('#lightbox').classList.remove('open');
    $('#cartPanel').classList.remove('open');
    $('#drawer').classList.remove('open');
    $('#mobileMenu').classList.remove('open');
  }
  if($('#lightbox').classList.contains('open')){
    if(e.key==='ArrowRight')lbGo(LB.i-1);
    if(e.key==='ArrowLeft')lbGo(LB.i+1);
  }
});
$('#lightboxClose').onclick=()=>$('#lightbox').classList.remove('open');
$('#lightboxPrev').onclick=()=>lbGo(LB.i-1);
$('#lightboxNext').onclick=()=>lbGo(LB.i+1);
$('#drawerClose').onclick=closeDrawer;

$('#searchBtn').onclick=()=>{
  const q=prompt('ابحث عن منتج:');
  if(!q)return;
  const ql=q.toLowerCase();
  const found=state.products.find(p=>p.name.toLowerCase().includes(ql));
  if(found){navigate('#product/'+found.id)}else{toast('لم يتم العثور على منتجات','warning')}
};

// Ripple
document.addEventListener('click',(e)=>{
  const btn=e.target.closest('.btn');if(!btn)return;
  const r=btn.getBoundingClientRect();
  btn.style.setProperty('--rx',(e.clientX-r.left)+'px');
  btn.style.setProperty('--ry',(e.clientY-r.top)+'px');
});

// Init
loadState();
updateCartBadge();
router();
setTimeout(()=>$('#pageLoader').classList.add('hidden'),400);

// Admin inactivity check
setInterval(()=>{
  if(state.route.name==='admin'){
    if(!isAuthed()){toast('انتهت الجلسة','warning');navigate('#admin-login')}
  }
},60000);

