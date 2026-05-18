    (function () {
      "use strict";

      const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

      // ----------------------------------------------------------
      // Preloader
      // ----------------------------------------------------------
      const preloader = document.getElementById("preloader");
      window.addEventListener("load", function () {
        setTimeout(function () { preloader.classList.add("is-hidden"); }, 320);
      });
      // safety: ensure it always hides
      setTimeout(function () { preloader.classList.add("is-hidden"); }, 2400);

      // ----------------------------------------------------------
      // Scroll progress bar
      // ----------------------------------------------------------
      const scrollProgress = document.getElementById("scrollProgress");
      function updateScrollProgress() {
        const h = document.documentElement;
        const scrolled = h.scrollTop || document.body.scrollTop;
        const height = h.scrollHeight - h.clientHeight;
        const pct = height > 0 ? (scrolled / height) * 100 : 0;
        scrollProgress.style.width = pct + "%";
      }
      document.addEventListener("scroll", updateScrollProgress, { passive: true });
      updateScrollProgress();

      // ----------------------------------------------------------
      // Navbar shrink on scroll
      // ----------------------------------------------------------
      const nav = document.getElementById("nav");
      function updateNav() {
        if (window.scrollY > 30) nav.classList.add("is-shrunk");
        else nav.classList.remove("is-shrunk");
      }
      document.addEventListener("scroll", updateNav, { passive: true });
      updateNav();

      // ----------------------------------------------------------
      // Mobile nav toggle
      // ----------------------------------------------------------
      const navToggle = document.getElementById("navToggle");
      const navLinks  = document.getElementById("navLinks");
      navToggle.addEventListener("click", function () {
        const open = nav.classList.toggle("is-open");
        navToggle.setAttribute("aria-expanded", String(open));
      });
      navLinks.addEventListener("click", function (e) {
        if (e.target.matches("a")) {
          nav.classList.remove("is-open");
          navToggle.setAttribute("aria-expanded", "false");
        }
      });

      // ----------------------------------------------------------
      // Active link highlight via IntersectionObserver
      // ----------------------------------------------------------
      const sectionIds = ["home", "about", "interests", "minecraft", "sports", "road", "kitchen", "journey", "connect"];
      const linkMap = {};
      sectionIds.forEach(function (id) {
        const link = document.querySelector('.nav-links a[href="#' + id + '"]');
        if (link) linkMap[id] = link;
      });
      const sectionEls = sectionIds.map(function (id) { return document.getElementById(id); }).filter(Boolean);

      const navObserver = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting && entry.intersectionRatio > 0.4) {
            Object.keys(linkMap).forEach(function (k) { linkMap[k].classList.remove("is-active"); });
            const id = entry.target.id;
            if (linkMap[id]) linkMap[id].classList.add("is-active");
          }
        });
      }, { threshold: [0.4, 0.6] });
      sectionEls.forEach(function (el) { navObserver.observe(el); });

      // ----------------------------------------------------------
      // Reveal-on-scroll
      // ----------------------------------------------------------
      const reveals = document.querySelectorAll(".reveal, .interest");
      const revealObserver = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            revealObserver.unobserve(entry.target);
          }
        });
      }, { threshold: 0.12 });
      reveals.forEach(function (el) { revealObserver.observe(el); });

      // ----------------------------------------------------------
      // Counters
      // ----------------------------------------------------------
      function animateCounter(el) {
        const target = parseInt(el.getAttribute("data-target"), 10) || 0;
        const duration = 1400;
        const start = performance.now();
        function tick(now) {
          const t = Math.min(1, (now - start) / duration);
          // easeOutCubic
          const eased = 1 - Math.pow(1 - t, 3);
          el.textContent = Math.round(target * eased).toLocaleString();
          if (t < 1) requestAnimationFrame(tick);
        }
        requestAnimationFrame(tick);
      }
      const counters = document.querySelectorAll("[data-counter]");
      const counterObserver = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            animateCounter(entry.target);
            counterObserver.unobserve(entry.target);
          }
        });
      }, { threshold: 0.6 });
      counters.forEach(function (el) { counterObserver.observe(el); });

      // ----------------------------------------------------------
      // Typing animation in hero
      // ----------------------------------------------------------
      const typedEl = document.getElementById("typed");
      const phrases = [
        "Gamer. Sports kid. Road kid.",
        "Mahindra Invader · Tata Hexa · Honda Unicorn.",
        "Minecraft for life. Cricket forever.",
        "Ghee rice = mohabbat.",
        "Respect-first — always."
      ];
      let phraseIndex = 0;
      let charIndex = 0;
      let typing = true;
      function typeStep() {
        if (!typedEl) return;
        const current = phrases[phraseIndex];
        if (typing) {
          charIndex++;
          typedEl.textContent = current.slice(0, charIndex);
          if (charIndex >= current.length) { typing = false; setTimeout(typeStep, 1600); return; }
          setTimeout(typeStep, 38);
        } else {
          charIndex--;
          typedEl.textContent = current.slice(0, charIndex);
          if (charIndex <= 0) {
            typing = true;
            phraseIndex = (phraseIndex + 1) % phrases.length;
            setTimeout(typeStep, 200);
            return;
          }
          setTimeout(typeStep, 22);
        }
      }
      if (!prefersReduced) typeStep();
      else if (typedEl) typedEl.textContent = phrases[0];

      // ----------------------------------------------------------
      // Hero particles canvas
      // ----------------------------------------------------------
      const canvas = document.getElementById("heroCanvas");
      if (canvas && !prefersReduced) {
        const ctx = canvas.getContext("2d");
        let particles = [];
        let raf = 0;
        function resize() {
          const dpr = Math.min(2, window.devicePixelRatio || 1);
          const rect = canvas.getBoundingClientRect();
          canvas.width  = Math.max(1, Math.floor(rect.width  * dpr));
          canvas.height = Math.max(1, Math.floor(rect.height * dpr));
          ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
        }
        function init() {
          resize();
          const rect = canvas.getBoundingClientRect();
          const count = Math.max(28, Math.min(70, Math.floor(rect.width * rect.height / 22000)));
          particles = [];
          for (let i = 0; i < count; i++) {
            particles.push({
              x: Math.random() * rect.width,
              y: Math.random() * rect.height,
              r: 0.6 + Math.random() * 1.6,
              vx: (Math.random() - 0.5) * 0.25,
              vy: (Math.random() - 0.5) * 0.25,
              c: Math.random() < 0.5 ? "108, 99, 255" : "255, 122, 89",
              a: 0.18 + Math.random() * 0.32
            });
          }
        }
        function draw() {
          const rect = canvas.getBoundingClientRect();
          ctx.clearRect(0, 0, rect.width, rect.height);
          // links
          for (let i = 0; i < particles.length; i++) {
            for (let j = i + 1; j < particles.length; j++) {
              const a = particles[i], b = particles[j];
              const dx = a.x - b.x, dy = a.y - b.y;
              const d2 = dx*dx + dy*dy;
              if (d2 < 120 * 120) {
                ctx.strokeStyle = "rgba(108, 99, 255, " + (0.10 * (1 - Math.sqrt(d2)/120)) + ")";
                ctx.lineWidth = 1;
                ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y); ctx.stroke();
              }
            }
          }
          // dots
          particles.forEach(function (p) {
            p.x += p.vx; p.y += p.vy;
            if (p.x < -10) p.x = rect.width + 10;
            if (p.x > rect.width + 10) p.x = -10;
            if (p.y < -10) p.y = rect.height + 10;
            if (p.y > rect.height + 10) p.y = -10;
            ctx.fillStyle = "rgba(" + p.c + "," + p.a + ")";
            ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2); ctx.fill();
          });
          raf = requestAnimationFrame(draw);
        }
        init();
        draw();
        window.addEventListener("resize", function () {
          cancelAnimationFrame(raf);
          init(); draw();
        });
      }

      // ----------------------------------------------------------
      // Hero card 3D tilt
      // ----------------------------------------------------------
      const heroCard = document.getElementById("heroCard");
      if (heroCard && window.matchMedia("(hover: hover)").matches && !prefersReduced) {
        heroCard.addEventListener("mousemove", function (e) {
          const r = heroCard.getBoundingClientRect();
          const px = (e.clientX - r.left) / r.width;
          const py = (e.clientY - r.top)  / r.height;
          const rx = (py - 0.5) * -8;
          const ry = (px - 0.5) *  8;
          heroCard.style.transform = "perspective(1100px) rotateX(" + rx + "deg) rotateY(" + ry + "deg)";
        });
        heroCard.addEventListener("mouseleave", function () {
          heroCard.style.transform = "";
        });
      }

      // ----------------------------------------------------------
      // Card spotlight (mouse position vars)
      // ----------------------------------------------------------
      document.querySelectorAll(".card, .interest, .social, .now-card, .stat-card, .dish, .mc-card").forEach(function (card) {
        card.addEventListener("mousemove", function (e) {
          const r = card.getBoundingClientRect();
          card.style.setProperty("--mx", ((e.clientX - r.left) / r.width  * 100) + "%");
          card.style.setProperty("--my", ((e.clientY - r.top)  / r.height * 100) + "%");
        });
      });

      // ----------------------------------------------------------
      // Custom cursor
      // ----------------------------------------------------------
      const dot = document.getElementById("cursorDot");
      const ring = document.getElementById("cursorRing");
      if (window.matchMedia("(hover: hover)").matches) {
        let rx = 0, ry = 0, tx = 0, ty = 0;
        document.addEventListener("mousemove", function (e) {
          tx = e.clientX; ty = e.clientY;
          dot.style.left = tx + "px"; dot.style.top = ty + "px";
        });
        function follow() {
          rx += (tx - rx) * 0.16;
          ry += (ty - ry) * 0.16;
          ring.style.left = rx + "px"; ring.style.top = ry + "px";
          requestAnimationFrame(follow);
        }
        follow();
        document.querySelectorAll("a, button, .card, .interest, .social, .dish, .mc-card").forEach(function (el) {
          el.addEventListener("mouseenter", function () { ring.classList.add("is-active"); });
          el.addEventListener("mouseleave", function () { ring.classList.remove("is-active"); });
        });
      } else {
        dot.style.display = "none";
        ring.style.display = "none";
      }

      // ----------------------------------------------------------
      // Testimonials carousel
      // ----------------------------------------------------------
      const quotes = document.querySelectorAll("#quotes .quote");
      const dots = document.querySelectorAll("#quoteControls button");
      let qi = 0;
      let qTimer = 0;
      function showQuote(i) {
        quotes.forEach(function (q, k) { q.classList.toggle("is-active", k === i); });
        dots.forEach(function (d, k) { d.classList.toggle("is-active", k === i); });
        qi = i;
      }
      function nextQuote() { showQuote((qi + 1) % quotes.length); }
      function startQTimer() { stopQTimer(); qTimer = setInterval(nextQuote, 6000); }
      function stopQTimer() { if (qTimer) clearInterval(qTimer); }
      dots.forEach(function (d, k) {
        d.addEventListener("click", function () { showQuote(k); startQTimer(); });
      });
      const quoteWrap = document.getElementById("quotes");
      if (quoteWrap) {
        quoteWrap.addEventListener("mouseenter", stopQTimer);
        quoteWrap.addEventListener("mouseleave", startQTimer);
      }
      if (quotes.length) startQTimer();

      // ----------------------------------------------------------
      // Back to top
      // ----------------------------------------------------------
      const toTop = document.getElementById("toTop");
      function updateToTop() {
        if (window.scrollY > 600) toTop.classList.add("is-visible");
        else toTop.classList.remove("is-visible");
      }
      document.addEventListener("scroll", updateToTop, { passive: true });
      toTop.addEventListener("click", function () {
        window.scrollTo({ top: 0, behavior: prefersReduced ? "auto" : "smooth" });
      });
      updateToTop();

      // ----------------------------------------------------------
      // Footer year
      // ----------------------------------------------------------
      const yEl = document.getElementById("footYear");
      if (yEl) yEl.textContent = String(new Date().getFullYear());

    })();
