(function(){
  'use strict';
  function initSection(root){
    if(!root) return;
    var features = root.querySelectorAll('.ngwe-feature');
    var slides = root.querySelectorAll('.ngwe-slide');
    if(!features.length || !slides.length) return;

    function activate(index){
      for(var i=0;i<features.length;i++){
        var isActive = i === index;
        features[i].classList.toggle('is-active', isActive);
        features[i].setAttribute('aria-selected', isActive ? 'true' : 'false');
        slides[i] && slides[i].classList.toggle('is-active', isActive);
      }
    }

    features.forEach(function(btn, i){
      btn.addEventListener('click', function(){ activate(i); });
      btn.addEventListener('keydown', function(e){
        // Keyboard support: Up/Down to navigate
        if(e.key === 'ArrowDown' || e.key === 'ArrowRight'){
          e.preventDefault(); activate((i+1)%features.length); features[(i+1)%features.length].focus();
        } else if(e.key === 'ArrowUp' || e.key === 'ArrowLeft'){
          e.preventDefault(); activate((i-1+features.length)%features.length); features[(i-1+features.length)%features.length].focus();
        }
      });
    });
  }

  function onDOMContentLoaded(){
    document.querySelectorAll('.ng-why-earsafe').forEach(initSection);
  }

  if(document.readyState === 'loading'){
    document.addEventListener('DOMContentLoaded', onDOMContentLoaded);
  } else {
    onDOMContentLoaded();
  }
})();


