  // ---- Nav (real multi-page navigation) ----
  const PAGE_URLS = {
    'page-home': 'index.html',
    'page-donate': 'donate.html',
    'page-programs': 'programs.html',
    'page-impact': 'impact.html',
    'page-about': 'about.html',
    'page-contact': 'contact.html',
  };
  function showPage(id){ window.location.href = PAGE_URLS[id] || 'index.html'; }
  function goHome(){ window.location.href = 'index.html'; }
  function goDonate(){ window.location.href = 'donate.html'; }
  function goDonateWithProgram(p){ window.location.href = 'donate.html?program=' + encodeURIComponent(p); }
  function scrollToSection(id){
    const el = document.getElementById(id);
    if(el) el.scrollIntoView({behavior:'smooth'});
  }
  function toggleMobileNav(){
    document.getElementById('mobileNav').classList.toggle('open');
    document.getElementById('hamburgerBtn').classList.toggle('open');
  }
  function mobileGo(target){
    document.getElementById('mobileNav').classList.remove('open');
    document.getElementById('hamburgerBtn').classList.remove('open');
    if(target === 'goHome') return goHome();
    if(target === 'goDonate') return goDonate();
    showPage(target);
  }

  // ---- Ledger ticker (themed) — home page only ----
  if (document.getElementById('ledger-track')) {
    const donors = ["J. Wanjiru","Diaspora — London","A. Otieno","M-Pesa Anonymous","S. Achieng","Kilimo SACCO","P. Mwangi","Anonymous","D. Njoroge","C. Wambui","Diaspora — Boston","F. Kamau"];
    const programSet = [
      {label:'Stationery Fund', cls:'stationery', usd:[5,8,12,15,25]},
      {label:"Widows' Nutrition", cls:'nutrition', usd:[5,8,10,20]},
      {label:'Boychild Recovery', cls:'boychild', usd:[10,20,40,75]},
    ];
    const entries = [];
    for(let i=0;i<18;i++){
      const p = programSet[Math.floor(Math.random()*programSet.length)];
      const n = donors[Math.floor(Math.random()*donors.length)];
      const amt = p.usd[Math.floor(Math.random()*p.usd.length)];
      entries.push(`<div class="ledger-entry"><span class="dot ${p.cls}"></span>${n} — ${p.label} <span class="amt ${p.cls}">$${amt.toLocaleString()}</span></div>`);
    }
    document.getElementById('ledger-track').innerHTML = entries.join('') + entries.join('');
  }

  // ---- Reveal on scroll ----
  const revealEls = document.querySelectorAll('.reveal');
  function animateFillsWithin(target){
    const fills = target.querySelectorAll('[data-width], [data-height]');
    fills.forEach((f,i)=>{
      setTimeout(()=>{
        if(f.dataset.width) f.style.width = f.dataset.width;
        if(f.dataset.height) f.style.height = f.dataset.height;
      }, i*90);
    });
  }
  const io = new IntersectionObserver((items)=>{
    items.forEach(item=>{
      if(item.isIntersecting){
        item.target.classList.add('in');
        animateFillsWithin(item.target);
        io.unobserve(item.target);
      }
    });
  }, {threshold:.15});
  revealEls.forEach(el=>io.observe(el));
  // manual re-check for elements already in view the moment a page becomes active
  // (IntersectionObserver won't fire for display:none elements until they're shown)
  function checkReveals(){
    document.querySelectorAll('.reveal:not(.in)').forEach(el=>{
      const r = el.getBoundingClientRect();
      if(r.top < window.innerHeight && r.bottom > 0){
        el.classList.add('in');
        animateFillsWithin(el);
        io.unobserve(el);
      }
    });
  }

  // ---- Count-up stats ----
  const countEls = document.querySelectorAll('.stat .n');
  const countIo = new IntersectionObserver((items)=>{
    items.forEach(item=>{
      if(item.isIntersecting){
        animateCount(item.target);
        countIo.unobserve(item.target);
      }
    });
  }, {threshold:.5});
  countEls.forEach(el=>countIo.observe(el));

  function animateCount(el){
    const target = parseFloat(el.dataset.count);
    const decimals = parseInt(el.dataset.decimals || '0');
    const prefix = el.dataset.prefix || '';
    const suffix = el.dataset.suffix || '';
    const dur = 1400;
    const start = performance.now();
    function tick(now){
      const p = Math.min((now-start)/dur, 1);
      const eased = 1 - Math.pow(1-p, 3);
      const val = target * eased;
      const formatted = decimals > 0 ? val.toFixed(decimals) : Math.round(val).toLocaleString();
      el.textContent = prefix + formatted + suffix;
      if(p < 1) requestAnimationFrame(tick);
    }
    requestAnimationFrame(tick);
  }

  // ---- Slider — home page only ----
  if (document.getElementById('sliderTrack')) {
    let slideIndex = 0;
    const totalSlides = 3;
    const track = document.getElementById('sliderTrack');
    const dotsWrap = document.getElementById('sliderDots');
    for(let i=0;i<totalSlides;i++){
      const d = document.createElement('div');
      if(i===0) d.classList.add('active');
      d.addEventListener('click', ()=>{ slideIndex = i; renderSlide(); });
      dotsWrap.appendChild(d);
    }
    function renderSlide(){
      track.style.transform = `translateX(-${slideIndex*100}%)`;
      [...dotsWrap.children].forEach((d,i)=>d.classList.toggle('active', i===slideIndex));
    }
    window.slideMove = function(dir){
      slideIndex = (slideIndex + dir + totalSlides) % totalSlides;
      renderSlide();
      restartAutoplay();
    };
    let autoplayTimer;
    function restartAutoplay(){
      clearInterval(autoplayTimer);
      autoplayTimer = setInterval(()=>{ window.slideMove(1); }, 5500);
    }
    restartAutoplay();
    document.getElementById('slider').addEventListener('mouseenter', ()=>clearInterval(autoplayTimer));
    document.getElementById('slider').addEventListener('mouseleave', restartAutoplay);
  }

  function handleUpload(index, input){
    const file = input.files[0];
    if(!file) return;
    const reader = new FileReader();
    reader.onload = (e)=>{
      const mediaEl = document.getElementById('media-'+index);
      const art = document.getElementById('art-'+index);
      if(art) art.remove();
      let img = mediaEl.querySelector('img');
      if(!img){
        img = document.createElement('img');
        mediaEl.insertBefore(img, mediaEl.firstChild);
      }
      img.src = e.target.result;
    };
    reader.readAsDataURL(file);
  }

  // Generic uploader used by Programs / Impact / About photo grids
  function handleGridUpload(mediaId, artId, input){
    const file = input.files[0];
    if(!file) return;
    const reader = new FileReader();
    reader.onload = (e)=>{
      const mediaEl = document.getElementById(mediaId);
      const art = document.getElementById(artId);
      if(art) art.remove();
      let img = mediaEl.querySelector('img');
      if(!img){
        img = document.createElement('img');
        mediaEl.insertBefore(img, mediaEl.firstChild);
      }
      img.src = e.target.result;
    };
    reader.readAsDataURL(file);
  }

  // ---- Contact form ----
  function submitContact(){
    const name = document.getElementById('cName').value.trim();
    const email = document.getElementById('cEmail').value.trim();
    if(!email){
      document.getElementById('cEmail').style.borderColor = 'var(--rust)';
      return;
    }
    document.getElementById('ccName').textContent = name || 'there';
    document.getElementById('ccEmail').textContent = email;
    document.getElementById('contactForm').style.display = 'none';
    document.getElementById('contactSuccess').classList.add('active');
  }
  function resetContact(){
    document.getElementById('cName').value = '';
    document.getElementById('cEmail').value = '';
    document.getElementById('cEmail').style.borderColor = 'var(--line)';
    document.getElementById('cMessage').value = '';
    document.getElementById('contactSuccess').classList.remove('active');
    document.getElementById('contactForm').style.display = 'block';
  }

  // ---- Donate state — donate page only ----
  if (document.getElementById('customAmt')) {
    let state = { amount: 15, freq: 'once', method: 'mpesa', program: 'general', programLabel: 'General Fund' };
    const EXCHANGE_RATE_USD_TO_KES = 129; // illustrative rate — replace with a live FX feed in production

    document.querySelectorAll('.amt-btn').forEach(btn=>{
      btn.addEventListener('click', ()=>{
        document.querySelectorAll('.amt-btn').forEach(b=>b.classList.remove('selected'));
        btn.classList.add('selected');
        document.getElementById('customAmt').value = '';
        state.amount = parseInt(btn.dataset.amt);
        updateSummary();
      });
    });
    document.getElementById('customAmt').addEventListener('input', (e)=>{
      if(e.target.value){
        document.querySelectorAll('.amt-btn').forEach(b=>b.classList.remove('selected'));
        state.amount = parseInt(e.target.value)||0;
        updateSummary();
      }
    });
    document.querySelectorAll('#freq div').forEach(el=>{
      el.addEventListener('click', ()=>{
        document.querySelectorAll('#freq div').forEach(d=>d.classList.remove('selected'));
        el.classList.add('selected');
        state.freq = el.dataset.f;
        updateSummary();
      });
    });
    document.querySelectorAll('.chip').forEach(chip=>{
      chip.addEventListener('click', ()=> selectProgram(chip.dataset.p));
    });

    window.selectProgram = function(p){
      state.program = p;
      document.querySelectorAll('.chip').forEach(c=>c.classList.toggle('selected', c.dataset.p===p));
      const labels = {general:'General Fund', stationery:'Stationery & Uniforms', nutrition:"Widows' Nutrition", boychild:'Boychild Recovery'};
      state.programLabel = labels[p];
      updateSummary();
    };

    window.selectMethod = function(m){
      state.method = m;
      document.querySelectorAll('.method-btn').forEach(b=>b.classList.remove('selected'));
      document.querySelector(`.method-btn.${m}`).classList.add('selected');
      document.querySelectorAll('.stk-state').forEach(s=>s.classList.remove('active'));
      document.getElementById(m+'-entry').classList.add('active');
      updateSummary();
    };

    function updateSummary(){
      const amt = state.amount || 0;
      const methodLabels = {mpesa:'M-Pesa', paypal:'PayPal', apple:'Apple Pay', google:'Google Pay'};
      document.getElementById('sumProgram').textContent = state.programLabel;
      document.getElementById('sumAmt').textContent = '$' + amt.toLocaleString();
      document.getElementById('sumFreq').textContent = state.freq === 'once' ? 'One-time' : 'Monthly, cancel anytime';
      document.getElementById('sumMethod').textContent = methodLabels[state.method] || state.method;
      document.getElementById('sumTotal').textContent = '$' + amt.toLocaleString() + (state.freq==='monthly' ? ' / mo' : '');
      const noteEl = document.getElementById('mpesaConversionNote');
      if(noteEl){
        const kshAmt = Math.round(amt * EXCHANGE_RATE_USD_TO_KES / 5) * 5;
        noteEl.textContent = `M-Pesa settles in Kenyan Shillings — this gift charges as roughly KSh ${kshAmt.toLocaleString()} at today's rate.`;
      }
    }
    updateSummary();

    document.getElementById('phoneInput').addEventListener('input', (e)=>{
      let v = e.target.value.replace(/\D/g,'').slice(0,10);
      let out = v;
      if(v.length > 3) out = v.slice(0,3)+' '+v.slice(3);
      if(v.length > 6) out = v.slice(0,3)+' '+v.slice(3,6)+' '+v.slice(6);
      e.target.value = out;
    });

    window.startSTK = function(){
      const phone = document.getElementById('phoneInput').value;
      if(!phone || phone.replace(/\D/g,'').length < 9){
        document.getElementById('phoneInput').style.borderColor = '#B4552F';
        return;
      }
      document.getElementById('waitPhone').textContent = '07' + phone.replace(/\D/g,'').slice(1);
      swapState('mpesa-entry','mpesa-waiting');

      const dots = document.querySelectorAll('#pinDots div');
      dots.forEach(d=>d.classList.remove('filled'));
      let i=0;
      const pinTimer = setInterval(()=>{
        if(i < dots.length){ dots[i].classList.add('filled'); i++; }
        else clearInterval(pinTimer);
      }, 480);

      setTimeout(()=>{
        const ref = 'S' + Math.random().toString(36).substring(2,7).toUpperCase() + Math.floor(Math.random()*99);
        const usdAmt = state.amount || 0;
        const kshAmt = Math.round(usdAmt * EXCHANGE_RATE_USD_TO_KES / 5) * 5;
        document.getElementById('rcMpesaRef').textContent = ref;
        document.getElementById('rcMpesaAmt').textContent = `Ksh${kshAmt.toLocaleString()}.00 (≈$${usdAmt.toLocaleString()})`;
        document.getElementById('rcMpesaProgram').textContent = state.programLabel;
        swapState('mpesa-waiting','mpesa-done');
      }, 2600);
    };

    window.startPaypal = function(){
      swapState('paypal-entry','paypal-waiting');
      setTimeout(()=>{ swapState('paypal-waiting','paypal-done'); }, 2000);
    };

    window.startApple = function(){
      swapState('apple-entry','apple-waiting');
      setTimeout(()=>{ swapState('apple-waiting','apple-done'); }, 1600);
    };

    window.startGoogle = function(){
      swapState('google-entry','google-waiting');
      setTimeout(()=>{ swapState('google-waiting','google-done'); }, 1900);
    };

    function swapState(fromId, toId){
      document.getElementById(fromId).classList.remove('active');
      document.getElementById(toId).classList.add('active');
    }

    window.resetDonate = function(){
      document.querySelectorAll('.stk-state').forEach(s=>s.classList.remove('active'));
      document.getElementById(state.method+'-entry').classList.add('active');
      document.getElementById('phoneInput').value='';
      document.getElementById('phoneInput').style.borderColor = 'var(--line)';
    };

    // Pre-select a program via ?program=stationery etc.
    (function applyProgramFromQuery(){
      const params = new URLSearchParams(window.location.search);
      const program = params.get('program');
      if (program && document.querySelector(`.chip[data-p="${program}"]`)) {
        window.selectProgram(program);
      }
    })();
  }

  // Run once per page load to catch any above-the-fold reveal elements
  if (typeof checkReveals === 'function') {
    window.addEventListener('load', checkReveals);
  }
