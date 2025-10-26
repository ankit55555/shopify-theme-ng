(function(){
  'use strict';

  function initCarousel(root){
    var track = root && root.querySelector('[data-carousel]');
    if(!track) return;

    // Basic drag/scroll snap for touch devices; arrows optional later
    var isDown = false, startX = 0, scrollLeft = 0;
    track.addEventListener('pointerdown', function(e){
      // Start drag without pointer capture to preserve native click events
      isDown = true;
      startX = e.pageX;
      scrollLeft = track.scrollLeft;
    });
    track.addEventListener('pointermove', function(e){
      if(!isDown) return; var dx = e.pageX - startX; track.scrollLeft = scrollLeft - dx;
    });
    track.addEventListener('pointerup', function(){ isDown = false; });
    track.addEventListener('pointercancel', function(){ isDown = false; });

    // Arrow navigation (may be absent when hidden via settings)
    var prev = root.querySelector('.ng-pr__nav--prev');
    var next = root.querySelector('.ng-pr__nav--next');
    function scrollByCard(dir){
      var card = track.querySelector('.ng-pr__card');
      var cardWidth = card ? card.getBoundingClientRect().width + 16 : 300;
      track.scrollBy({ left: dir * cardWidth, behavior: 'smooth' });
    }
    if(prev){ prev.addEventListener('click', function(){ scrollByCard(-1); }); }
    if(next){ next.addEventListener('click', function(){ scrollByCard(1); }); }

    // Autoplay support (primarily when arrows hidden)
    var viewport = root.querySelector('.ng-pr__viewport');
    var shouldAutoplay = viewport && viewport.getAttribute('data-autoplay') === 'true';
    var intervalMs = viewport ? parseInt(viewport.getAttribute('data-autoplay-interval') || '4000', 10) : 4000;
    var autoplayTimer = null;

    function advanceOrLoop(){
      var maxScrollLeft = track.scrollWidth - track.clientWidth;
      var isAtEnd = Math.abs(track.scrollLeft - maxScrollLeft) < 2;
      if(isAtEnd){
        track.scrollTo({ left: 0, behavior: 'smooth' });
      }else{
        scrollByCard(1);
      }
    }

    function startAutoplay(){
      if(autoplayTimer || !shouldAutoplay) return;
      autoplayTimer = window.setInterval(advanceOrLoop, Math.max(1500, intervalMs));
    }
    function stopAutoplay(){
      if(!autoplayTimer) return;
      window.clearInterval(autoplayTimer);
      autoplayTimer = null;
    }

    if(shouldAutoplay){
      startAutoplay();
      // Pause on interaction/hover for better UX
      ['mouseenter','pointerdown','touchstart','focusin'].forEach(function(ev){
        track.addEventListener(ev, stopAutoplay, { passive: true });
        if(viewport) viewport.addEventListener(ev, stopAutoplay, { passive: true });
      });
      ['mouseleave','pointerup','touchend','focusout'].forEach(function(ev){
        track.addEventListener(ev, startAutoplay, { passive: true });
        if(viewport) viewport.addEventListener(ev, startAutoplay, { passive: true });
      });
    }
  }

  function formatMoney(cents){
    try{ return Shopify.formatMoney ? Shopify.formatMoney(cents) : (cents/100).toFixed(2); }catch(e){ return (cents/100).toFixed(2); }
  }

  function withWidthParam(src, width){
    if(!src) return src;
    var join = src.indexOf('?') >= 0 ? '&' : '?';
    return src + join + 'width=' + (width || 900);
  }

  function initVariants(root){
    root.querySelectorAll('.ng-pr__card').forEach(function(card){
      var dataEl = card.querySelector('.ng-pr__data');
      if(!dataEl) return;
      var product = {};
      try{ product = JSON.parse(dataEl.textContent); }catch(e){ return; }

      var priceEl = card.querySelector('[data-price-current]');
      var compareEl = card.querySelector('[data-price-compare]');
      var imageEl = card.querySelector('.ng-pr__image img');
      var linkImage = card.querySelector('.ng-pr__image');
      var linkTitle = card.querySelector('.ng-pr__link');
      var fallbackUrl = card.getAttribute('data-product-url') || '';

      // In editor, allow links to open in new tab (Shopify blocks navigation inside editor)
      if(window.Shopify && window.Shopify.designMode){
        if(linkImage) linkImage.setAttribute('target','_blank');
        if(linkTitle) linkTitle.setAttribute('target','_blank');
      }
      var currentVariant = (product && product.variants && product.variants.find(function(v){ return v.id === (product.selected_or_first_available_variant && product.selected_or_first_available_variant.id); })) || (product.variants && product.variants[0]);

      function applyVariant(variant){
        if(!variant) return;
        currentVariant = variant;
        if(priceEl) priceEl.textContent = formatMoney(variant.price);
        if(compareEl){
          if(variant.compare_at_price > variant.price){
            compareEl.style.display='inline';
            compareEl.textContent = formatMoney(variant.compare_at_price);
          }else{
            compareEl.style.display='none';
          }
        }
        if(imageEl && variant.featured_image){
          var src = withWidthParam(variant.featured_image.src, 900);
          imageEl.src = src;
          imageEl.alt = variant.featured_image.alt || imageEl.alt || '';
        }

        // Update product links to selected variant
        // Prefer DOM anchor hrefs; the serialized product JSON may not include url
        var baseUrl = (linkTitle && linkTitle.getAttribute('href')) || (linkImage && linkImage.getAttribute('href')) || fallbackUrl;
        if(baseUrl){
          var variantUrl = baseUrl + (baseUrl.indexOf('?')>=0 ? '&' : '?') + 'variant=' + variant.id;
          if(linkImage) linkImage.setAttribute('href', variantUrl);
          if(linkTitle) linkTitle.setAttribute('href', variantUrl);
        }
      }

      // Card click navigates to product page with selected variant
      card.addEventListener('click', function(e){
        var target = e.target;
        if(target.closest('.ng-pr__swatch')) return; // swatch interactions only
        var baseUrl = (linkTitle && linkTitle.getAttribute('href')) || (linkImage && linkImage.getAttribute('href')) || fallbackUrl || (product && product.url) || '';
        if(!baseUrl) return;
        var url = baseUrl;
        if(currentVariant && currentVariant.id){
          url = baseUrl + (baseUrl.indexOf('?')>=0 ? '&' : '?') + 'variant=' + currentVariant.id;
        }
        if(target.closest('a')){ e.preventDefault(); }
        if(window.Shopify && window.Shopify.designMode){
          window.open(url, '_blank');
        }else{
          window.location.href = url;
        }
      });

      card.querySelectorAll('.ng-pr__swatch').forEach(function(btn){
        btn.addEventListener('click', function(){
          card.querySelectorAll('.ng-pr__swatch').forEach(function(b){ b.classList.remove('is-active'); });
          btn.classList.add('is-active');
          var opt1 = btn.getAttribute('data-option1');
          var variant = product.variants && product.variants.find(function(v){ return v.option1 === opt1; });
          applyVariant(variant || product.variants && product.variants[0]);
        });
      });
    });
  }

  document.addEventListener('DOMContentLoaded', function(){
    document.querySelectorAll('.ng-pr').forEach(initCarousel);
    document.querySelectorAll('.ng-pr').forEach(initVariants);
  });

  if(window.Shopify && window.Shopify.designMode){
    document.addEventListener('shopify:section:load', function(e){
      var root = document.getElementById('ng-pr-' + e.detail.sectionId);
      if(root){ initCarousel(root); initVariants(root); }
    });
  }
})();


