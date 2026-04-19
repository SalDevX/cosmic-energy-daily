let _solDeg=0;
const _solEl=document.getElementById('sol-svg');
(function animateSol(){
  _solDeg+=0.025;
  _solEl.style.transform=`translate(-50%,-50%) rotate(${_solDeg}deg)`;
  requestAnimationFrame(animateSol);
})();
