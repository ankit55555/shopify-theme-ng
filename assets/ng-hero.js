(function(){
  function init(section){
    var wrap = section.querySelector('.ng-hero__slides');
    if(!wrap) return;
    var slides = Array.prototype.slice.call(wrap.querySelectorAll('.ng-hero__slide'));
    if(slides.length === 0) return;
    var showArrows = wrap.getAttribute('data-show-arrows') === 'true';
    var showDots = wrap.getAttribute('data-show-dots') === 'true';
    var indicator = wrap.getAttribute('data-indicator') || 'dots';
    var autoplay = wrap.getAttribute('data-autoplay') === 'true';
    var loop = wrap.getAttribute('data-loop') === 'true';
    var pauseOnHover = wrap.getAttribute('data-pause') === 'true';
    var interval = parseInt(wrap.getAttribute('data-interval') || '5000',10);

    var current = 0; var timer = null;

    function go(index){
      if(index < 0){ index = loop ? slides.length - 1 : 0; }
      if(index >= slides.length){ index = loop ? 0 : slides.length - 1; }
      slides.forEach(function(s,i){ s.classList.toggle('is-active', i === index); });
      if(dots.length){ dots.forEach(function(d,i){ d.classList.toggle('is-active', i === index); }); }
      current = index;
    }

    // nav buttons
    var prev = section.querySelector('.ng-hero__prev');
    var next = section.querySelector('.ng-hero__next');
    if(!showArrows){ if(prev) prev.style.display='none'; if(next) next.style.display='none'; }
    if(prev) prev.addEventListener('click', function(){ go(current-1); restart(); });
    if(next) next.addEventListener('click', function(){ go(current+1); restart(); });

    // indicators
    var dotsWrap = section.querySelector('.ng-hero__dots');
    var counterWrap = section.querySelector('.ng-hero__counter');
    var counterCurrent = section.querySelector('.ng-hero__counter-current');
    var counterTotal = section.querySelector('.ng-hero__counter-total');
    var dots = [];
    if(indicator === 'dots'){
      if(showDots && dotsWrap){
        dotsWrap.innerHTML = '';
        slides.forEach(function(_,i){
          var b = document.createElement('button');
          b.className = 'ng-hero__dot';
          b.type = 'button';
          b.setAttribute('aria-label','Go to slide '+(i+1));
          b.addEventListener('click', function(){ go(i); restart(); });
          dotsWrap.appendChild(b);
          dots.push(b);
        });
        if(counterWrap) counterWrap.style.display = 'none';
      }
    } else if(indicator === 'counter'){
      if(dotsWrap) dotsWrap.style.display = 'none';
      if(counterWrap){
        var total = slides.length;
        if(counterTotal) counterTotal.textContent = String(total).padStart(2,'0');
        function updateCounter(){
          if(counterCurrent) counterCurrent.textContent = String(current+1).padStart(2,'0');
        }
        var _go = go;
        go = function(index){ _go(index); updateCounter(); };
        updateCounter();
      }
    } else {
      if(dotsWrap) dotsWrap.style.display = 'none';
      if(counterWrap) counterWrap.style.display = 'none';
    }

    function start(){ if(autoplay){ timer = setInterval(function(){ go(current+1); }, interval); } }
    function stop(){ if(timer){ clearInterval(timer); timer = null; } }
    function restart(){ stop(); start(); }

    if(pauseOnHover){
      section.addEventListener('mouseenter', stop);
      section.addEventListener('mouseleave', start);
    }

    go(0); start();
  }

  document.addEventListener('DOMContentLoaded', function(){
    document.querySelectorAll('.ng-hero').forEach(init);
  });

  document.addEventListener('shopify:section:load', function(e){
    var el = e.target && e.target.querySelector('.ng-hero');
    if(el) init(el);
  });
})();



