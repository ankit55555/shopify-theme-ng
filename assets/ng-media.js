(function(){
  function clamp(n, min, max){ return Math.max(min, Math.min(max, n)); }

  function init(section){
    var viewport = section.querySelector('.ng-media__viewport');
    var track = section.querySelector('.ng-media__track');
    if(!viewport || !track) return;

    var items = Array.prototype.slice.call(track.querySelectorAll('.ng-media__item'));
    if(items.length === 0) return;

    var opts = {
      autoplay: section.getAttribute('data-autoplay') === 'true',
      interval: parseInt(section.getAttribute('data-interval') || '3500', 10),
      loop: section.getAttribute('data-loop') === 'true',
      direction: section.getAttribute('data-direction') || 'ltr', // ltr or rtl
      showArrows: section.getAttribute('data-show-arrows') === 'true',
      showDots: section.getAttribute('data-show-dots') === 'true'
    };

    var centerIndex = 0;
    var offset = 0; // translateX in px
    var timer = null;

    // layout measurements
    var gap = parseFloat(getComputedStyle(track).columnGap || getComputedStyle(track).gap || '40');

    function itemWidth(i){ return items[i].getBoundingClientRect().width; }

    function totalWidth(){
      return items.reduce(function(sum, el){ return sum + el.getBoundingClientRect().width; }, 0) + gap * (items.length - 1);
    }

    // center-active update
    function setActive(){
      items.forEach(function(el, i){ el.classList.toggle('is-active', i === centerIndex); });
      if(dots.length){ dots.forEach(function(d,i){ d.classList.toggle('is-active', i === centerIndex); }); }
    }

    function translate(x){
      track.style.transform = 'translate3d(' + x + 'px,0,0)';
    }

    function centerTo(index){
      index = clamp(index, 0, items.length - 1);
      // calculate offset so that the chosen item is centered in viewport
      var vp = viewport.getBoundingClientRect().width;
      var x = 0;
      for(var i=0;i<index;i++){ x -= itemWidth(i) + gap; }
      var currentWidth = itemWidth(index);
      x += (vp - currentWidth)/2;
      offset = x;
      centerIndex = index;
      translate(offset);
      setActive();
    }

    function next(){
      var target = centerIndex + 1;
      if(target >= items.length){ target = opts.loop ? 0 : items.length - 1; }
      centerTo(target);
    }

    function prev(){
      var target = centerIndex - 1;
      if(target < 0){ target = opts.loop ? items.length - 1 : 0; }
      centerTo(target);
    }

    // nav
    var prevBtn = section.querySelector('.ng-media__prev');
    var nextBtn = section.querySelector('.ng-media__next');
    if(prevBtn) prevBtn.addEventListener('click', function(){ prev(); restart(); });
    if(nextBtn) nextBtn.addEventListener('click', function(){ next(); restart(); });
    if(!opts.showArrows){ if(prevBtn) prevBtn.style.display='none'; if(nextBtn) nextBtn.style.display='none'; }

    // dots
    var dotsWrap = section.querySelector('.ng-media__dots');
    var dots = [];
    if(opts.showDots && dotsWrap){
      dotsWrap.innerHTML = '';
      items.forEach(function(_,i){
        var b = document.createElement('button');
        b.type = 'button'; b.className = 'ng-media__dot';
        b.addEventListener('click', function(){ centerTo(i); restart(); });
        dotsWrap.appendChild(b); dots.push(b);
      });
    } else if(dotsWrap){ dotsWrap.style.display = 'none'; }

    // autoplay
    function start(){
      if(!opts.autoplay) return;
      stop();
      timer = setInterval(function(){
        if(opts.direction === 'rtl'){ prev(); } else { next(); }
      }, opts.interval);
    }
    function stop(){ if(timer){ clearInterval(timer); timer = null; } }
    function restart(){ stop(); start(); }

    // resize
    var ro = new ResizeObserver(function(){ centerTo(centerIndex); });
    ro.observe(viewport);

    // init
    centerTo(0);
    start();
  }

  document.addEventListener('DOMContentLoaded', function(){
    document.querySelectorAll('.ng-media').forEach(init);
  });
  document.addEventListener('shopify:section:load', function(e){
    var el = e.target && e.target.querySelector('.ng-media');
    if(el) init(el);
  });
})();


