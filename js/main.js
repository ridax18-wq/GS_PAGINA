(function () {
  'use strict';

  var header = document.getElementById('site-header');
  var nav = document.getElementById('main-nav');
  var menuBtn = document.querySelector('.menu-btn');
  var toTop = document.querySelector('.to-top');
  var yearEl = document.getElementById('year');

  function onScroll() {
    var y = window.scrollY || window.pageYOffset;
    if (header) header.classList.toggle('scrolled', y > 10);
    if (toTop) toTop.hidden = y < 560;
  }

  var ticking = false;
  window.addEventListener('scroll', function () {
    if (!ticking) {
      ticking = true;
      window.requestAnimationFrame(function () {
        onScroll();
        ticking = false;
      });
    }
  }, { passive: true });
  onScroll();

  if (toTop) {
    toTop.addEventListener('click', function () {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

  function closeMenu() {
    if (!nav || !menuBtn) return;
    nav.classList.remove('open');
    menuBtn.setAttribute('aria-expanded', 'false');
    menuBtn.setAttribute('aria-label', 'Abrir menú');
  }

  if (menuBtn && nav) {
    menuBtn.addEventListener('click', function () {
      var open = nav.classList.toggle('open');
      menuBtn.setAttribute('aria-expanded', String(open));
      menuBtn.setAttribute('aria-label', open ? 'Cerrar menú' : 'Abrir menú');
    });
    nav.querySelectorAll('a').forEach(function (link) {
      link.addEventListener('click', closeMenu);
    });
    window.addEventListener('resize', function () {
      if (window.innerWidth > 1020) closeMenu();
    });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') closeMenu();
    });
  }

  var navLinks = nav ? nav.querySelectorAll('a[href^="#"]:not(.nav-cta)') : [];
  var sectionMap = [];
  navLinks.forEach(function (link) {
    var id = link.getAttribute('href').slice(1);
    var section = document.getElementById(id);
    if (section && id !== 'inicio') sectionMap.push({ link: link, section: section });
  });

  if ('IntersectionObserver' in window && sectionMap.length) {
    var spy = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          navLinks.forEach(function (l) { l.classList.remove('is-active'); });
          sectionMap.forEach(function (item) {
            if (item.section === entry.target) item.link.classList.add('is-active');
          });
        }
      });
    }, { rootMargin: '-35% 0px -55% 0px' });
    sectionMap.forEach(function (item) { spy.observe(item.section); });
  }

  if ('IntersectionObserver' in window) {
    var skipReveal = new URLSearchParams(window.location.search).has('noreveal');
    if (skipReveal) {
      var st = document.createElement('style');
      st.textContent = '*,*::before,*::after{transition:none!important;animation:none!important}';
      document.head.appendChild(st);
    }
    var reveal = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('in');
          reveal.unobserve(entry.target);
        }
      });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.08 });
    document.querySelectorAll('.reveal').forEach(function (el) {
      if (skipReveal) { el.classList.add('in'); } else { reveal.observe(el); }
    });
  } else {
    document.querySelectorAll('.reveal').forEach(function (el) { el.classList.add('in'); });
  }

  var serviceSelect = document.getElementById('f-service');
  document.querySelectorAll('[data-service]').forEach(function (link) {
    link.addEventListener('click', function () {
      if (!serviceSelect) return;
      serviceSelect.value = link.getAttribute('data-service');
    });
  });

  var form = document.getElementById('quote-form');
  var status = document.getElementById('form-status');

  function setStatus(state, html) {
    if (!status) return;
    status.hidden = false;
    status.setAttribute('data-state', state);
    status.innerHTML = html;
  }

  if (form && status) {
    form.addEventListener('submit', function (e) {
      e.preventDefault();

      var hp = form.querySelector('input[name="website"]');
      if (hp && hp.value) return;

      if (!form.checkValidity()) {
        form.reportValidity();
        setStatus('error', 'Revise los campos obligatorios marcados con * antes de continuar.');
        return;
      }

      var data = new FormData(form);
      var canal = (e.submitter && e.submitter.value) === 'correo' ? 'correo' : 'whatsapp';
      var servicio = data.get('servicio') || 'No especificado';

      var message = [
        'Hola, quisiera solicitar una cotización a GS&S SYSTEM.',
        '',
        'Empresa: ' + (data.get('empresa') || ''),
        'Nombre: ' + (data.get('nombre') || ''),
        'Correo: ' + (data.get('correo') || ''),
        'Teléfono: ' + (data.get('telefono') || ''),
        'Servicio requerido: ' + servicio,
        '',
        'Requerimiento:',
        data.get('mensaje') || ''
      ].join('\n');

      var waUrl = 'https://wa.me/51998112095?text=' + encodeURIComponent(message);
      var mailUrl = 'mailto:administracion@gsys.com.pe?subject=' +
        encodeURIComponent('Solicitud de cotización — GS&S SYSTEM') +
        '&body=' + encodeURIComponent(message);

      if (canal === 'whatsapp') {
        window.open(waUrl, '_blank', 'noopener,noreferrer');
        setStatus('ok',
          'Su solicitud está lista en WhatsApp. Si no se abrió automáticamente, ' +
          '<a href="' + waUrl + '" target="_blank" rel="noopener noreferrer">toca aquí para abrirlo</a>.');
      } else {
        window.location.href = mailUrl;
        setStatus('ok',
          'Se abrió su programa de correo con la solicitud lista para enviar a administracion@gsys.com.pe. ' +
          'Si no se abrió, escríbanos por <a href="' + waUrl + '" target="_blank" rel="noopener noreferrer">WhatsApp</a>.');
      }
    });

    form.querySelectorAll('input, select, textarea').forEach(function (field) {
      field.addEventListener('input', function () {
        if (status && !status.hidden && status.getAttribute('data-state') === 'error') {
          status.hidden = true;
        }
      });
    });
  }

  if (yearEl) yearEl.textContent = String(new Date().getFullYear());
})();
