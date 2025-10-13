/* main.js
 *   - Space starfield on canvas (parallax, falling stars + shooting stars)
 *   - Preloader simulation
 *   - Hero letter-by-letter animation with glow
 *   - Smooth scroll, reveal on scroll (IntersectionObserver)
 *   - Modal video player
 *   - Subtle parallax micro-interactions for art
 */

document.addEventListener('DOMContentLoaded', () => {
    /* ---------- PRELOADER ---------- */
    const preloader = document.getElementById('preloader');
    const loaderBar = document.getElementById('loader-bar');
    let pct = 0;
    const tick = setInterval(() => {
        pct += 8 + Math.random() * 14; // random-ish progress
        if (pct >= 100) pct = 100;
        loaderBar.style.width = pct + '%';
        if (pct >= 100) {
            clearInterval(tick);
            setTimeout(() => {
                preloader.classList.add('hide');
                setTimeout(() => preloader.style.display = 'none', 420);
                startHeroReveal(); // start reveals after preloader
            }, 380);
        }
    }, 160);

    /* ---------- STARFIELD ---------- */
    const canvas = document.getElementById('starfield');
    const ctx = canvas.getContext('2d', { alpha: true });
    let W = canvas.width = innerWidth;
    let H = canvas.height = innerHeight;
    const DPR = Math.max(1, window.devicePixelRatio || 1);
    canvas.width = Math.round(innerWidth * DPR);
    canvas.height = Math.round(innerHeight * DPR);
    canvas.style.width = innerWidth + 'px';
    canvas.style.height = innerHeight + 'px';
    ctx.scale(DPR, DPR);

    // particle arrays
    const stars = [];
    const shooting = [];
    const STAR_COUNT = Math.floor(Math.max(80, (W * H) / 80000));

    function rand(min, max){ return Math.random() * (max - min) + min; }

    function setupStars(){
        stars.length = 0;
        for (let i = 0; i < STAR_COUNT; i++){
            stars.push({
                x: Math.random() * W,
                       y: Math.random() * H,
                       r: Math.random() * 1.6 + 0.2,
                       alpha: rand(0.2, 0.95),
                       vx: (Math.random() - 0.5) * 0.08,
                       vy: rand(0.02, 0.28),
                       twinkle: Math.random() * Math.PI * 2
            });
        }
    }
    setupStars();

    // shooting star generator
    let shootTimer = 0;
    function spawnShooting(){
        if (Math.random() > 0.985) {
            const sx = rand(0, W * 0.6);
            const sy = rand(0, H * 0.25);
            shooting.push({
                x: sx, y: sy,
                len: rand(120, 380),
                          angle: rand(Math.PI * 0.05, Math.PI * 0.35),
                          speed: rand(8, 16),
                          life: 0,
                          maxLife: rand(40, 100),
                          hue: Math.random() > 0.5 ? 200 : 280
            });
        }
    }

    function updateAndRenderStars(){
        ctx.clearRect(0,0,W,DPR?H:DPR);
        // background subtle gradient overlay
        const g = ctx.createLinearGradient(0,0,0,H);
        g.addColorStop(0, 'rgba(10,12,18,0.2)');
        g.addColorStop(1, 'rgba(0,0,0,0.22)');
        ctx.fillStyle = g;
        ctx.fillRect(0,0,W,H);

        // move and draw stars
        for (let s of stars){
            s.x += s.vx;
            s.y += s.vy;
            s.twinkle += 0.04;
            const t = Math.abs(Math.sin(s.twinkle));
            const a = Math.max(0.15, Math.min(1, s.alpha * (0.6 + 0.6 * t)));
            ctx.beginPath();
            ctx.fillStyle = `rgba(255,255,255,${a})`;
            ctx.arc(s.x, s.y, s.r + t * 0.6, 0, Math.PI * 2);
            ctx.fill();
            // recycle
            if (s.y > H + 10 || s.x < -20 || s.x > W + 20) {
                s.x = Math.random() * W;
                s.y = -10;
            }
        }

        // shooting stars
        for (let i = shooting.length - 1; i >= 0; i--){
            const sh = shooting[i];
            sh.life++;
            sh.x += Math.cos(sh.angle) * sh.speed;
            sh.y += Math.sin(sh.angle) * sh.speed;
            // trail
            const grad = ctx.createLinearGradient(sh.x, sh.y, sh.x - Math.cos(sh.angle) * sh.len, sh.y - Math.sin(sh.angle) * sh.len);
            grad.addColorStop(0, `hsla(${sh.hue},100%,70%,0.95)`);
            grad.addColorStop(0.6, `hsla(${sh.hue},100%,60%,0.25)`);
            grad.addColorStop(1, 'rgba(255,255,255,0)');
            ctx.strokeStyle = grad;
            ctx.lineWidth = rand(1, 2.6);
            ctx.beginPath();
            ctx.moveTo(sh.x, sh.y);
            ctx.lineTo(sh.x - Math.cos(sh.angle) * sh.len, sh.y - Math.sin(sh.angle) * sh.len);
            ctx.stroke();
            // head glow
            ctx.beginPath();
            ctx.fillStyle = `rgba(255,255,255,${1 - sh.life/sh.maxLife})`;
            ctx.arc(sh.x, sh.y, 2.2, 0, Math.PI * 2);
            ctx.fill();
            if (sh.life > sh.maxLife) shooting.splice(i,1);
        }
        spawnShooting();
    }

    let animFrame;
    function starLoop(){
        updateAndRenderStars();
        animFrame = requestAnimationFrame(starLoop);
    }
    starLoop();

    // responsive
    window.addEventListener('resize', () => {
        W = canvas.width = innerWidth * DPR;
        H = canvas.height = innerHeight * DPR;
        canvas.style.width = innerWidth + 'px';
        canvas.style.height = innerHeight + 'px';
        ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
        // reset stars to match new size
        setupStars();
    });

    /* ---------- HERO LETTERS ---------- */
    const heroTitle = document.getElementById('hero-title');
    function splitLetters(el) {
        const text = el.textContent.trim();
        el.textContent = '';
        for (let i = 0; i < text.length; i++){
            const span = document.createElement('span');
            span.className = 'char';
            span.textContent = text[i] === ' ' ? '\u00A0' : text[i];
            span.style.transition = `transform .62s ${0.04 * i + 0.18}s cubic-bezier(.2,.9,.2,1), opacity .62s ${0.04 * i + 0.18}s linear`;
            el.appendChild(span);
        }
        setTimeout(()=> el.classList.add('glow'), 900);
    }
    splitLetters(heroTitle);

    function startHeroReveal(){
        // reveals for elements with .reveal
        document.querySelectorAll('.reveal').forEach((el) => {
            const delay = parseInt(el.getAttribute('data-reveal-delay') || '0', 10);
            setTimeout(()=> el.classList.add('show'), delay);
        });
        // reveal letters
        const letters = heroTitle.querySelectorAll('.char');
        letters.forEach((sp, idx) => {
            setTimeout(()=> {
                sp.style.opacity = '1';
                sp.style.transform = 'translateY(0) rotateX(0)';
                // subtle color bloom on odd letters
                if (idx % 2 === 0) sp.style.textShadow = '0 8px 36px rgba(0,198,255,0.06)';
            }, 60 * idx + 160);
        });
    }

    /* ---------- SMOOTH SCROLL ---------- */
    function smoothScrollTo(selector){
        const el = document.querySelector(selector);
        if(!el) return;
        const headerOffset = 86;
        const top = el.getBoundingClientRect().top + window.scrollY - headerOffset;
        window.scrollTo({ top, behavior: 'smooth' });
    }
    document.getElementById('hero-see').addEventListener('click', (e)=>{ e.preventDefault(); smoothScrollTo('#videos'); });
    document.getElementById('nav-see-videos').addEventListener('click', (e)=>{ e.preventDefault(); smoothScrollTo('#videos'); });

    /* ---------- REVEAL ON SCROLL ---------- */
    const obs = new IntersectionObserver((items, ob)=> {
        items.forEach(it => {
            if(it.isIntersecting){
                const el = it.target;
                const delay = parseInt(el.getAttribute('data-reveal-delay') || '0', 10);
                setTimeout(()=> el.classList.add('show'), delay);
                ob.unobserve(el);
            }
        });
    }, { threshold: 0.12 });

    document.querySelectorAll('.reveal, .video-card, .hero-left, .hero-art').forEach(el => obs.observe(el));

    /* ---------- ART MICRO PARALLAX ---------- */
    (function artParallax(){
        const stage = document.querySelector('.art-stage');
        if (!stage) return;
        const neon = stage.querySelectorAll('.neon-layer');
        stage.addEventListener('mousemove', (e) => {
            const r = stage.getBoundingClientRect();
            const cx = r.left + r.width/2;
            const cy = r.top + r.height/2;
            const dx = (e.clientX - cx) / r.width;
            const dy = (e.clientY - cy) / r.height;
            neon.forEach((n, i) => {
                const factor = (i+1) * 8;
                n.style.transform = `translate3d(${dx * factor}px, ${dy * factor}px, 0)`;
            });
        });
        stage.addEventListener('mouseleave', ()=> neon.forEach(n => n.style.transform = ''));
    })();

    /* ---------- VIDEO MODAL ---------- */
    const modal = document.getElementById('player-modal');
    const player = document.getElementById('player-video');
    const closeBtn = document.getElementById('close-player');

    function openModal(src){
        if(src){
            player.pause();
            player.src = src;
            player.load();
            player.play().catch(()=>{ /* autoplay possibly blocked */ });
        } else {
            // no src: keep player empty and show friendly console note
            console.info('No video source on this card. Set data-video-src attribute with an MP4 link to play.');
            player.removeAttribute('src');
        }
        modal.classList.add('show');
        modal.setAttribute('aria-hidden','false');
    }
    function closeModal(){
        modal.classList.remove('show');
        modal.setAttribute('aria-hidden','true');
        try{ player.pause(); player.removeAttribute('src'); player.load(); }catch(e){}
    }
    closeBtn.addEventListener('click', closeModal);
    modal.addEventListener('click', (e) => { if (e.target === modal) closeModal(); });
    document.addEventListener('keydown', (e) => { if (e.key === 'Escape') closeModal(); });

    document.querySelectorAll('.video-card').forEach(card => {
        card.addEventListener('click', () => {
            const src = (card.getAttribute('data-video-src') || '').trim();
            openModal(src);
        });
    });

    /* ---------- Accessibility: focus modal ---------- */
    modal.addEventListener('transitionend', () => {
        if (modal.classList.contains('show')) {
            closeBtn.focus();
        }
    });

}); // DOMContentLoaded
/* main.js
 *   - Space starfield on canvas (parallax, falling stars + shooting stars)
 *   - Preloader simulation
 *   - Hero letter-by-letter animation with glow
 *   - Smooth scroll, reveal on scroll (IntersectionObserver)
 *   - Modal video player
 *   - Subtle parallax micro-interactions for art
 */

document.addEventListener('DOMContentLoaded', () => {
    /* ---------- PRELOADER ---------- */
    const preloader = document.getElementById('preloader');
    const loaderBar = document.getElementById('loader-bar');
    let pct = 0;
    const tick = setInterval(() => {
        pct += 8 + Math.random() * 14; // random-ish progress
        if (pct >= 100) pct = 100;
        loaderBar.style.width = pct + '%';
        if (pct >= 100) {
            clearInterval(tick);
            setTimeout(() => {
                preloader.classList.add('hide');
                setTimeout(() => preloader.style.display = 'none', 420);
                startHeroReveal(); // start reveals after preloader
            }, 380);
        }
    }, 160);

    /* ---------- STARFIELD ---------- */
    const canvas = document.getElementById('starfield');
    const ctx = canvas.getContext('2d', { alpha: true });
    let W = canvas.width = innerWidth;
    let H = canvas.height = innerHeight;
    const DPR = Math.max(1, window.devicePixelRatio || 1);
    canvas.width = Math.round(innerWidth * DPR);
    canvas.height = Math.round(innerHeight * DPR);
    canvas.style.width = innerWidth + 'px';
    canvas.style.height = innerHeight + 'px';
    ctx.scale(DPR, DPR);

    // particle arrays
    const stars = [];
    const shooting = [];
    const STAR_COUNT = Math.floor(Math.max(80, (W * H) / 80000));

    function rand(min, max){ return Math.random() * (max - min) + min; }

    function setupStars(){
        stars.length = 0;
        for (let i = 0; i < STAR_COUNT; i++){
            stars.push({
                x: Math.random() * W,
                       y: Math.random() * H,
                       r: Math.random() * 1.6 + 0.2,
                       alpha: rand(0.2, 0.95),
                       vx: (Math.random() - 0.5) * 0.08,
                       vy: rand(0.02, 0.28),
                       twinkle: Math.random() * Math.PI * 2
            });
        }
    }
    setupStars();

    // shooting star generator
    let shootTimer = 0;
    function spawnShooting(){
        if (Math.random() > 0.985) {
            const sx = rand(0, W * 0.6);
            const sy = rand(0, H * 0.25);
            shooting.push({
                x: sx, y: sy,
                len: rand(120, 380),
                          angle: rand(Math.PI * 0.05, Math.PI * 0.35),
                          speed: rand(8, 16),
                          life: 0,
                          maxLife: rand(40, 100),
                          hue: Math.random() > 0.5 ? 200 : 280
            });
        }
    }

    function updateAndRenderStars(){
        ctx.clearRect(0,0,W,DPR?H:DPR);
        // background subtle gradient overlay
        const g = ctx.createLinearGradient(0,0,0,H);
        g.addColorStop(0, 'rgba(10,12,18,0.2)');
        g.addColorStop(1, 'rgba(0,0,0,0.22)');
        ctx.fillStyle = g;
        ctx.fillRect(0,0,W,H);

        // move and draw stars
        for (let s of stars){
            s.x += s.vx;
            s.y += s.vy;
            s.twinkle += 0.04;
            const t = Math.abs(Math.sin(s.twinkle));
            const a = Math.max(0.15, Math.min(1, s.alpha * (0.6 + 0.6 * t)));
            ctx.beginPath();
            ctx.fillStyle = `rgba(255,255,255,${a})`;
            ctx.arc(s.x, s.y, s.r + t * 0.6, 0, Math.PI * 2);
            ctx.fill();
            // recycle
            if (s.y > H + 10 || s.x < -20 || s.x > W + 20) {
                s.x = Math.random() * W;
                s.y = -10;
            }
        }

        // shooting stars
        for (let i = shooting.length - 1; i >= 0; i--){
            const sh = shooting[i];
            sh.life++;
            sh.x += Math.cos(sh.angle) * sh.speed;
            sh.y += Math.sin(sh.angle) * sh.speed;
            // trail
            const grad = ctx.createLinearGradient(sh.x, sh.y, sh.x - Math.cos(sh.angle) * sh.len, sh.y - Math.sin(sh.angle) * sh.len);
            grad.addColorStop(0, `hsla(${sh.hue},100%,70%,0.95)`);
            grad.addColorStop(0.6, `hsla(${sh.hue},100%,60%,0.25)`);
            grad.addColorStop(1, 'rgba(255,255,255,0)');
            ctx.strokeStyle = grad;
            ctx.lineWidth = rand(1, 2.6);
            ctx.beginPath();
            ctx.moveTo(sh.x, sh.y);
            ctx.lineTo(sh.x - Math.cos(sh.angle) * sh.len, sh.y - Math.sin(sh.angle) * sh.len);
            ctx.stroke();
            // head glow
            ctx.beginPath();
            ctx.fillStyle = `rgba(255,255,255,${1 - sh.life/sh.maxLife})`;
            ctx.arc(sh.x, sh.y, 2.2, 0, Math.PI * 2);
            ctx.fill();
            if (sh.life > sh.maxLife) shooting.splice(i,1);
        }
        spawnShooting();
    }

    let animFrame;
    function starLoop(){
        updateAndRenderStars();
        animFrame = requestAnimationFrame(starLoop);
    }
    starLoop();

    // responsive
    window.addEventListener('resize', () => {
        W = canvas.width = innerWidth * DPR;
        H = canvas.height = innerHeight * DPR;
        canvas.style.width = innerWidth + 'px';
        canvas.style.height = innerHeight + 'px';
        ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
        // reset stars to match new size
        setupStars();
    });

    /* ---------- HERO LETTERS ---------- */
    const heroTitle = document.getElementById('hero-title');
    function splitLetters(el) {
        const text = el.textContent.trim();
        el.textContent = '';
        for (let i = 0; i < text.length; i++){
            const span = document.createElement('span');
            span.className = 'char';
            span.textContent = text[i] === ' ' ? '\u00A0' : text[i];
            span.style.transition = `transform .62s ${0.04 * i + 0.18}s cubic-bezier(.2,.9,.2,1), opacity .62s ${0.04 * i + 0.18}s linear`;
            el.appendChild(span);
        }
        setTimeout(()=> el.classList.add('glow'), 900);
    }
    splitLetters(heroTitle);

    function startHeroReveal(){
        // reveals for elements with .reveal
        document.querySelectorAll('.reveal').forEach((el) => {
            const delay = parseInt(el.getAttribute('data-reveal-delay') || '0', 10);
            setTimeout(()=> el.classList.add('show'), delay);
        });
        // reveal letters
        const letters = heroTitle.querySelectorAll('.char');
        letters.forEach((sp, idx) => {
            setTimeout(()=> {
                sp.style.opacity = '1';
                sp.style.transform = 'translateY(0) rotateX(0)';
                // subtle color bloom on odd letters
                if (idx % 2 === 0) sp.style.textShadow = '0 8px 36px rgba(0,198,255,0.06)';
            }, 60 * idx + 160);
        });
    }

    /* ---------- SMOOTH SCROLL ---------- */
    function smoothScrollTo(selector){
        const el = document.querySelector(selector);
        if(!el) return;
        const headerOffset = 86;
        const top = el.getBoundingClientRect().top + window.scrollY - headerOffset;
        window.scrollTo({ top, behavior: 'smooth' });
    }
    document.getElementById('hero-see').addEventListener('click', (e)=>{ e.preventDefault(); smoothScrollTo('#videos'); });
    document.getElementById('nav-see-videos').addEventListener('click', (e)=>{ e.preventDefault(); smoothScrollTo('#videos'); });

    /* ---------- REVEAL ON SCROLL ---------- */
    const obs = new IntersectionObserver((items, ob)=> {
        items.forEach(it => {
            if(it.isIntersecting){
                const el = it.target;
                const delay = parseInt(el.getAttribute('data-reveal-delay') || '0', 10);
                setTimeout(()=> el.classList.add('show'), delay);
                ob.unobserve(el);
            }
        });
    }, { threshold: 0.12 });

    document.querySelectorAll('.reveal, .video-card, .hero-left, .hero-art').forEach(el => obs.observe(el));

    /* ---------- ART MICRO PARALLAX ---------- */
    (function artParallax(){
        const stage = document.querySelector('.art-stage');
        if (!stage) return;
        const neon = stage.querySelectorAll('.neon-layer');
        stage.addEventListener('mousemove', (e) => {
            const r = stage.getBoundingClientRect();
            const cx = r.left + r.width/2;
            const cy = r.top + r.height/2;
            const dx = (e.clientX - cx) / r.width;
            const dy = (e.clientY - cy) / r.height;
            neon.forEach((n, i) => {
                const factor = (i+1) * 8;
                n.style.transform = `translate3d(${dx * factor}px, ${dy * factor}px, 0)`;
            });
        });
        stage.addEventListener('mouseleave', ()=> neon.forEach(n => n.style.transform = ''));
    })();

    /* ---------- VIDEO MODAL ---------- */
    const modal = document.getElementById('player-modal');
    const player = document.getElementById('player-video');
    const closeBtn = document.getElementById('close-player');

    function openModal(src){
        if(src){
            player.pause();
            player.src = src;
            player.load();
            player.play().catch(()=>{ /* autoplay possibly blocked */ });
        } else {
            // no src: keep player empty and show friendly console note
            console.info('No video source on this card. Set data-video-src attribute with an MP4 link to play.');
            player.removeAttribute('src');
        }
        modal.classList.add('show');
        modal.setAttribute('aria-hidden','false');
    }
    function closeModal(){
        modal.classList.remove('show');
        modal.setAttribute('aria-hidden','true');
        try{ player.pause(); player.removeAttribute('src'); player.load(); }catch(e){}
    }
    closeBtn.addEventListener('click', closeModal);
    modal.addEventListener('click', (e) => { if (e.target === modal) closeModal(); });
    document.addEventListener('keydown', (e) => { if (e.key === 'Escape') closeModal(); });

    document.querySelectorAll('.video-card').forEach(card => {
        card.addEventListener('click', () => {
            const src = (card.getAttribute('data-video-src') || '').trim();
            openModal(src);
        });
    });

    /* ---------- Accessibility: focus modal ---------- */
    modal.addEventListener('transitionend', () => {
        if (modal.classList.contains('show')) {
            closeBtn.focus();
        }
    });

}); // DOMContentLoaded
