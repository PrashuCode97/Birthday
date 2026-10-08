(() => {
'use strict';
const config = window.BIRTHDAY_CONFIG;
const $ = id => document.getElementById(id);
let context, stream, analyser, frame, music, slideTimer, revealTimer, celebrationTimer;
let blown = false, generation = 0, currentPhoto = 0;
const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
const trackedEvents = new Set();

function initializeAnalytics() {
 const id = config.analyticsMeasurementId?.trim();
 if (!/^G-[A-Z0-9]+$/i.test(id || '')) return;
 window.dataLayer = window.dataLayer || [];
 window.gtag = function () { window.dataLayer.push(arguments); };
 window.gtag('js', new Date());
 window.gtag('config', id, {
  allow_google_signals: false,
  allow_ad_personalization_signals: false
 });
 const tag = document.createElement('script');
 tag.async = true;
 tag.src = `https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(id)}`;
 document.head.append(tag);
}
function track(eventName, parameters = {}, once = true) {
 if (!window.gtag || (once && trackedEvents.has(eventName))) return;
 if (once) trackedEvents.add(eventName);
 window.gtag('event', eventName, parameters);
}
initializeAnalytics();
$('name').textContent = config.name;
$('message').textContent = config.message;
const photos = config.photos.length ? config.photos : [{src:'assets/photos/01.svg',caption:'A favorite memory'}];
function showPhoto(index) {
 currentPhoto = index;
 $('photo').src = photos[index].src;
 $('photo').alt = photos[index].caption || `Memory ${index + 1}`;
 $('caption').textContent = photos[index].caption || '';
 [...$('dots').children].forEach((dot,i) => {dot.classList.toggle('active',i === index);dot.setAttribute('aria-pressed',String(i === index));});
}
$('photo').onerror = () => { if (!$('photo').src.endsWith('/assets/photos/01.svg')) $('photo').src = 'assets/photos/01.svg'; };
photos.forEach((photo,i) => {
 const dot = document.createElement('button');dot.setAttribute('aria-label',`Show photo ${i+1}`);
 dot.onclick = () => showPhoto(i);$('dots').append(dot);
});
showPhoto(0);
async function unlockAudio() {
 try { context ||= new (window.AudioContext || window.webkitAudioContext)(); await context.resume(); } catch (_) {}
 if (config.musicUrl && !music) {music = new Audio(config.musicUrl);music.preload = 'auto';}
 // Prime the media element inside a user gesture for mobile playback.
 if (music) {music.muted = true;try {await music.play();music.pause();music.currentTime=0;}catch (_) {}music.muted=false;}
}
function stopMic() {
 cancelAnimationFrame(frame);stream?.getTracks().forEach(track=>track.stop());stream=null;
 analyser?.disconnect();analyser=null;
}
$('start').onclick = async () => {
 track('magic_started');
 const request = ++generation;
 $('start').disabled=true;
 $('status').textContent='Preparing your microphone…';
 await unlockAudio();
 if (request !== generation || blown) return;
 if (!navigator.mediaDevices?.getUserMedia) {
  $('status').textContent='Microphone needs HTTPS or localhost. Tap below to blow out the candle.';$('start').disabled=false;return;
 }
 try {
  const incoming = await navigator.mediaDevices.getUserMedia({audio:{echoCancellation:false,noiseSuppression:false,autoGainControl:false}});
  if(request !== generation || blown) {incoming.getTracks().forEach(t=>t.stop());return;}
  stream=incoming;
  if(!context) throw new Error('Audio unavailable');
  analyser=context.createAnalyser();analyser.fftSize=2048;
  context.createMediaStreamSource(stream).connect(analyser);
  const values=new Float32Array(analyser.fftSize);
  const started=performance.now();let baseline=0,samples=0,strongSince=0;
  $('status').textContent='Keep quiet for a second… then make a wish and blow!';
  function listen(now) {
   if(blown || request !== generation) return;
   analyser.getFloatTimeDomainData(values);
   const rms=Math.sqrt(values.reduce((sum,value)=>sum+value*value,0)/values.length);
   if(now-started<1300) {baseline+=rms;samples++;}
   else {
    $('status').textContent='Listening… blow gently towards your microphone. Or tap below.';
    const threshold=Math.max(.035,(baseline/Math.max(samples,1))*3.2);
    if(rms>threshold) {strongSince ||= now;if(now-strongSince>220) {blow('microphone');return;}}
    else strongSince=0;
   }
   frame=requestAnimationFrame(listen);
  }
  frame=requestAnimationFrame(listen);
 } catch (_) {
  stopMic();$('start').disabled=false;$('status').textContent='Microphone unavailable. You can still tap to blow out the candle.';
 }
};
function tune() {
 if(music) {music.currentTime=0;music.play().catch(()=>{});setTimeout(()=>music.pause(),5000);return;}
 if(!context || context.state !== 'running') return;
 const notes=[523.25,659.25,783.99,1046.5,880,783.99,659.25,698.46,783.99,1046.5];
 const start=context.currentTime;
 notes.forEach((frequency,i)=> {
  const osc=context.createOscillator(),gain=context.createGain();osc.type='sine';osc.frequency.value=frequency;
  gain.gain.setValueAtTime(0,start+i*.48);gain.gain.linearRampToValueAtTime(.09,start+i*.48+.025);gain.gain.exponentialRampToValueAtTime(.001,start+i*.48+.43);
  osc.connect(gain);gain.connect(context.destination);osc.start(start+i*.48);osc.stop(start+i*.48+.45);
 });
}
function confetti() {
 if(reduced)return;
 const canvas=$('confetti'),ctx=canvas.getContext('2d');if(!ctx)return;
 const ratio=Math.min(devicePixelRatio,2),w=innerWidth,h=innerHeight;
 canvas.width=w*ratio;canvas.height=h*ratio;ctx.scale(ratio,ratio);
 const pieces=Array.from({length:95},()=>({x:Math.random()*w,y:-Math.random()*h,v:2+Math.random()*3,r:Math.random()*6,color:['#f4d49a','#dc9db2','#a99dd9','#fff4e2'][Math.floor(Math.random()*4)]}));
 const start=performance.now();
 function draw(now) {ctx.clearRect(0,0,w,h);pieces.forEach(p=>{p.y+=p.v;p.x+=Math.sin(p.y/40)*.7;ctx.fillStyle=p.color;ctx.save();ctx.translate(p.x,p.y);ctx.rotate(p.r+p.y/70);ctx.fillRect(-3,-4,6,9);ctx.restore();});if(now-start<6500)requestAnimationFrame(draw);else ctx.clearRect(0,0,w,h);}
 requestAnimationFrame(draw);
}
function blow(method) {
 if(blown)return;blown=true;generation++;stopMic();
 track('candle_blown', {method});
 document.querySelector('.cake-scene').classList.add('out');$('status').textContent='Wish made. Let the magic begin…';
 celebrationTimer=setTimeout(()=> {
  $('wish').hidden=true;$('birthday').hidden=false;showPhoto(0);tune();confetti();
  track('birthday_revealed');
  slideTimer=setInterval(()=>showPhoto((currentPhoto+1)%photos.length),2800);
  revealTimer=setTimeout(()=>{$('watch').hidden=false;$('countdown').textContent='A birthday message, made just for you.';},5000);
 },1100);
}
$('tap').onclick=async()=>{await unlockAudio();blow('tap');};
$('watch').onclick=()=>{
 track('video_opened');
 $('video-dialog').showModal();
 if(config.videoUrl) {$('video-placeholder').hidden=true;$('video').hidden=false;if(!$('video').getAttribute('src'))$('video').src=config.videoUrl;$('video').play().catch(()=>{});}
 else {$('video').hidden=true;$('video-placeholder').hidden=false;}
};
$('video').addEventListener('play',()=>track('video_started'));
$('video').addEventListener('ended',()=>track('journey_completed'));
$('video').onerror=()=>{$('video-error').hidden=false;};
$('close').onclick=()=>$('video-dialog').close();
$('video-dialog').addEventListener('close',()=>$('video').pause());
$('replay').onclick=()=>{
 clearInterval(slideTimer);clearTimeout(revealTimer);clearTimeout(celebrationTimer);music?.pause();stopMic();generation++;blown=false;
 $('birthday').hidden=true;$('wish').hidden=false;$('watch').hidden=true;$('start').disabled=false;
 document.querySelector('.cake-scene').classList.remove('out');$('status').textContent='Microphone is optional. Your audio stays on your device.';
};
window.addEventListener('pagehide',()=>{generation++;stopMic();music?.pause();clearInterval(slideTimer);});
})();
