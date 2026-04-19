function drawStars(){
  const c=document.getElementById('stars');
  const ctx=c.getContext('2d');
  c.width=window.innerWidth;c.height=window.innerHeight;
  ctx.clearRect(0,0,c.width,c.height);
  for(let i=0;i<220;i++){
    const x=Math.random()*c.width,y=Math.random()*c.height;
    const r=Math.random()*1.1,a=Math.random()*.5+.1;
    ctx.beginPath();ctx.arc(x,y,r,0,Math.PI*2);
    ctx.fillStyle=`rgba(201,168,76,${a})`;ctx.fill();
  }
}

drawStars();
window.addEventListener('resize',drawStars);
