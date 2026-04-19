function buildWheel(){
  const wheel=document.getElementById('wheel');
  const cx=240,cy=240,r=205;
  signs.forEach((s,i)=>{
    const angle=(i/12)*Math.PI*2-Math.PI/2;
    const x=cx+r*Math.cos(angle);
    const y=cy+r*Math.sin(angle);
    const node=document.createElement('div');
    node.className='sign-node';
    node.style.left=x+'px';
    node.style.top=y+'px';
    node.innerHTML=`<span class="sign-symbol">${s.symbol}</span><span class="sign-label">${s.name}</span>`;
    node.addEventListener('click',()=>selectSign(i,node));
    wheel.appendChild(node);
  });
}

function selectSign(idx,nodeEl){
  const s=signs[idx];
  document.querySelectorAll('.sign-node').forEach(n=>n.classList.remove('active'));
  nodeEl.classList.add('active');
  document.getElementById('vs-symbol').textContent=s.symbol;
  document.getElementById('vs-name').textContent=s.name+' \u2014 Today\'s Reading';
  document.getElementById('vs-dates').textContent=s.dates;
  document.getElementById('video-header').style.display='flex';
  document.getElementById('detail-row').innerHTML=`
    <div class="detail-card"><div class="detail-label">Element</div><div class="detail-value">${s.element}</div></div>
    <div class="detail-card"><div class="detail-label">Ruler</div><div class="detail-value">${s.ruler}</div></div>
    <div class="detail-card"><div class="detail-label">Nature</div><div class="detail-value">${s.trait}</div></div>
  `;
  document.getElementById('sign-desc').textContent=s.desc;
  document.getElementById('sign-details').style.display='block';
  const frame=document.getElementById('video-frame');
  const vid=ytIds[s.name];
  if(vid){
    frame.innerHTML=`<iframe src="https://www.youtube.com/embed/${vid}?autoplay=1" allow="autoplay;encrypted-media" allowfullscreen></iframe>`;
  } else {
    frame.innerHTML=`<div class="video-placeholder"><div class="ph-symbol">${s.symbol}</div><p style="font-size:.85rem;text-align:center;line-height:1.7">${s.name}<br><span style="font-size:.75rem;opacity:.6">Today's reading</span></p></div>`;
  }
  document.getElementById('video-section').scrollIntoView({behavior:'smooth',block:'nearest'});
}

function scaleWheel(){
  const wheel=document.getElementById('wheel');
  const outer=wheel.parentElement;
  const available=outer.clientWidth;
  const scale=Math.min(1,available/480);
  wheel.style.transform=`scale(${scale})`;
  outer.style.height=(480*scale)+'px';
}

function setDate(){
  const d=new Date();
  document.getElementById('date-bar').textContent=
    d.toLocaleDateString('en-US',{weekday:'long',year:'numeric',month:'long',day:'numeric'}).toUpperCase();
}

buildWheel();
setDate();
scaleWheel();
window.addEventListener('resize',scaleWheel);
