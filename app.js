const scene=document.querySelector('#scene');
const audio=document.querySelector('#narration');
const status=document.querySelector('#status');
const language=document.querySelector('#language');
const voice=document.querySelector('#voice');
const sound=document.querySelector('#sound');
const wideCylinder=innerWidth/innerHeight>3;
const projection=new URLSearchParams(location.search).get('projection')==='1'||wideCylinder;
document.body.classList.toggle('preview',!projection);
document.body.classList.toggle('cylinder',wideCylinder);
window.atlasLanguage=()=>language.value;
window.narratorAudio=audio;
const colors=['#bbb6ad','#eed2a3','#5fb7ff','#cf7756','#d8b899','#e0d0aa','#a2eef0','#6485ee'];
const sizes=[3.5,5.1,5.4,4.2,7.1,6.4,5.7,5.5];
let catalog=[];let selected=-1;let chosenMoon=null;let narrationOn=true;
const labels={en:{language:'Language',voice:'Voice',on:'Narration on',off:'Narration off',heading:'THE SOLAR EXPEDITION',sub:'You are at the Sun. Select a planet to explore it and its moons.',back:'Overview',diameter:'Diameter',year:'Orbital year',moons:'Catalogue moons',illustrative:'Model sizes, distances and moon orbits are illustrative.',sources:'NASA sources',discovery:'Discovery',moonIntro:'Select a moon to see its NASA record.',previous:'Previous',next:'Next',noMoons:'No natural moons',moon:'Moon',page:'page'},fr:{language:'Langue',voice:'Voix',on:'Narration activée',off:'Narration désactivée',heading:'THE SOLAR EXPEDITION',sub:'Vous êtes au Soleil. Sélectionnez une planète pour découvrir ses lunes.',back:'Vue d’ensemble',diameter:'Diamètre',year:'Année orbitale',moons:'Lunes du catalogue',illustrative:'Tailles, distances et orbites des lunes sont illustratives.',sources:'Sources NASA',discovery:'Découverte',moonIntro:'Sélectionnez une lune pour voir sa fiche NASA.',previous:'Précédent',next:'Suivant',noMoons:'Aucune lune naturelle',moon:'Lune',page:'page'}};
const nasaPlanetFacts='https://nssdc.gsfc.nasa.gov/planetary/factsheet/';
const nasaMoonCatalogue='https://ssd.jpl.nasa.gov/sats/discovery.html';
function sourceLink(label,url){const a=el('a','source-link');a.href=url;a.target='_blank';a.rel='noopener noreferrer';a.append(el('strong','',label),el('small','',url));return a}
function t(key){return labels[language.value][key]}
function nameOf(p){return language.value==='fr'?p.frenchName:p.name}
function el(tag,cls,text){const node=document.createElement(tag);if(cls)node.className=cls;if(text!=null)node.textContent=text;return node}
function globe(p,size){const node=el('span','globe');node.style.setProperty('--texture',`url("assets/${p.name}.jpg")`);node.style.setProperty('--diameter',size);node.style.setProperty('--glow',colors[catalog.indexOf(p)]+'77');if(p.name!=='Saturn'&&p.name!=='Uranus')return node;const system=el('span','ring-system '+p.name.toLowerCase());system.style.setProperty('--diameter',size);system.append(el('span','ring-art ring-back'),node,el('span','ring-art ring-front'));return system}
function moonAsset(m){return typeof assetUrl==='function'?assetUrl(m.image.slice(7)):m.image}
function moonVisual(m){const wrap=el('div','moon-closeup'+(m.image?' has-image':''));if(m.mappedSurface){const globe=el('span','globe moon-mapped-globe');globe.style.setProperty('--diameter','100%');globe.style.setProperty('--texture',`url("${moonAsset(m)}")`);globe.style.setProperty('--glow','#b4c9dd77');wrap.append(globe)}else if(m.image){const img=el('img','moon-portrait');img.src=moonAsset(m);img.alt=(language.value==='fr'?'Image NASA de ':'NASA image of ')+m.name;img.style.maxWidth=`${m.imageWidth}px`;img.style.maxHeight=`${m.imageHeight}px`;wrap.append(img)}else{wrap.append(el('div','moon-neutral'));wrap.setAttribute('aria-label',language.value==='fr'?'Modèle neutre sans image vérifiée':'Neutral model; no verified image')}return wrap}
function stopAudio(){audio.pause();audio.currentTime=0}
function playAudio(){stopAudio();if(!narrationOn||selected<0||chosenMoon)return;const p=catalog[selected];audio.src=`audio/${p.name}_${voice.value}.wav`;audio.play().catch(()=>{status.textContent=language.value==='fr'?'Touchez une planète pour activer le son.':'Select a planet to enable audio.'})}
function updateControls(){const fr=language.value==='fr',previous=voice.value;voice.replaceChildren();for(const item of fr?['estelle']:['anna','charles']){const option=el('option','',item[0].toUpperCase()+item.slice(1));option.value=item;voice.append(option)}if([...voice.options].some(option=>option.value===previous))voice.value=previous;document.querySelector('#languageLabel').textContent=t('language');document.querySelector('#voiceLabel').textContent=t('voice');document.querySelector('#soundLabel').textContent=t(narrationOn?'on':'off');sound.setAttribute('aria-pressed',String(narrationOn));document.documentElement.lang=language.value}
function overview(){const title=el('h1','overview-heading',t('heading'));scene.append(title,el('p','overview-sub',t('sub')));catalog.forEach((p,i)=>{const btn=el('button','world');btn.type='button';btn.style.left=(6.25+i*12.5)+'%';btn.setAttribute('aria-label',nameOf(p));const size=`min(${(sizes[i]*.75).toFixed(2)}vw,${(sizes[i]*5.5).toFixed(2)}vh)`;btn.append(globe(p,size),el('span','world-label',nameOf(p)));btn.onclick=()=>select(i);scene.append(btn)});const astronaut=el('img','astronaut');astronaut.src='assets/astronaut-float.webp';astronaut.alt='Floating astronaut';scene.append(astronaut)}
function select(i){selected=i;chosenMoon=null;status.textContent='';render();playAudio()}
function surroundingWorlds(){
  // The selected world occupies the central viewing sector; its neighbours
  // remain around the rest of the cylinder as quiet, selectable landmarks.
  const cylinderSlots=[70,79,88,97,6,17,28];
  const previewSlots=[10,23,36,49,62,75,88];
  for(let step=1;step<catalog.length;step++){
    const index=(selected+step)%catalog.length;
    const p=catalog[index];
    const button=el('button','ambient-world');
    button.type='button';
    button.style.setProperty('--cylinder-x',cylinderSlots[step-1]+'%');
    button.style.setProperty('--preview-x',previewSlots[step-1]+'%');
    button.setAttribute('aria-label',(language.value==='fr'?'Explorer ':'Explore ')+nameOf(p));
    const size=`min(${(sizes[index]*.36).toFixed(2)}vw,${(sizes[index]*4).toFixed(2)}vh)`;
    button.append(globe(p,size),el('span','ambient-label',nameOf(p)));
    button.onclick=()=>select(index);
    scene.append(button);
  }
}
function detail(){
  const p=catalog[selected];
  surroundingWorlds();
  if(chosenMoon){
    const parent=el('button','parent-world');
    parent.type='button';
    parent.setAttribute('aria-label',(language.value==='fr'?'Retour à ':'Back to ')+nameOf(p));
    parent.append(globe(p,'100%'),el('span','ambient-label',nameOf(p)));
    parent.onclick=()=>{chosenMoon=null;render();playAudio()};
    scene.append(parent);
  }
  const focus=el('div','focus-globe');focus.append(chosenMoon?moonVisual(chosenMoon):globe(p,'100%'));scene.append(focus);
  const panel=el('article','planet-panel '+(chosenMoon?'moon-detail':'planet-detail'));
  if(chosenMoon){
    const m=chosenMoon;
    panel.append(el('div','eyebrow',`${nameOf(p).toUpperCase()} · ${language.value==='fr'?'LUNE':'MOON'}`),el('h1','',m.name));
    panel.append(el('p','planet-summary',m.profile?(language.value==='fr'?m.profile.fr:m.profile.en):(language.value==='fr'?`Satellite naturel de ${nameOf(p)}. La NASA/JPL répertorie sa découverte; aucune description de surface vérifiée n’est présentée ici.`:`Natural satellite of ${nameOf(p)}. NASA/JPL records its discovery; no verified surface description is presented here.`)));
    const stats=el('div','stat-grid moon-stat-grid');for(const [label,value] of [[language.value==='fr'?'ORBITE AUTOUR DE':'ORBITS',nameOf(p)],[t('discovery'),m.year||'—']]){const card=el('div','stat-card');card.append(el('span','stat-label',label),el('strong','stat-value',value));stats.append(card)}panel.append(stats);
    panel.append(el('p','visual-caption',m.mappedSurface?(language.value==='fr'?'Carte lunaire NASA/LRO · globe illustré.':'NASA/LRO lunar map · rendered globe.'):m.image?(language.value==='fr'?'Image NASA · vue observée.':'NASA image · observed view.'):language.value==='fr'?'Aucune image vérifiée · modèle neutre.':'No verified image · neutral model.'));
    const sources=el('details','source-notes');sources.append(el('summary','',t('sources')));if(!(p.name==='Earth'&&m.name==='Moon'))sources.append(sourceLink('NASA/JPL · '+m.name,nasaMoonCatalogue));if(m.profile)sources.append(sourceLink('NASA Science · '+m.name,m.profile.source));if(m.imageSource)sources.append(sourceLink('NASA · image',m.imageSource));panel.append(sources);
  }else{
    panel.append(el('div','eyebrow',language.value==='fr'?'ATLAS PLANÉTAIRE':'PLANETARY ATLAS'),el('h1','',nameOf(p)),el('p','planet-summary',language.value==='fr'?p.french:p.english));
    const stats=el('div','stat-grid');
    for(const [label,value] of [[t('diameter')+(language.value==='fr'?' équatorial':' (equatorial)'),`${p.diameter.toLocaleString(language.value==='fr'?'fr-FR':'en-US')} km`],[t('year'),language.value==='fr'?p.yearFrench:p.year],[t('moons'),String(p.moons.length)]]){const card=el('div','stat-card');card.append(el('span','stat-label',label),el('strong','stat-value',value));stats.append(card)}
    panel.append(stats,el('p','disclaimer',t('illustrative')));
    const sources=el('details','source-notes');sources.append(el('summary','',t('sources')),sourceLink('NASA Science · '+p.name,p.source),sourceLink('NASA · planetary measurements',nasaPlanetFacts));panel.append(sources);
  }
  scene.append(panel);
  const back=el('button','action back',chosenMoon?(language.value==='fr'?'Planète':'Planet'):t('back'));back.type='button';back.onclick=()=>{if(chosenMoon){chosenMoon=null;render();playAudio()}else{selected=-1;stopAudio();render()}};scene.append(back);
  drawMoons(p,panel);
}
function visibleMoons(p){const all=p.moons||[];return chosenMoon?[chosenMoon,...all.filter(m=>m!==chosenMoon)].slice(0,4):all.slice(0,4)}
function drawMoons(p,panel){
  const moons=p.moons||[];
  const field=el('div','moon-field');
  if(!chosenMoon){
  for(const [i,m] of visibleMoons(p).entries()){
    const track=el('span','orbit-track');track.dataset.orbit=String(i);field.append(track);
    const btn=el('button','moon');btn.type='button';btn.dataset.orbit=String(i);btn.style.setProperty('--size',(i===0?1.35:1.05)+'vw');
    const rock=el('span','rock');if(m.image){rock.classList.add('moon-photographed');rock.style.backgroundImage=`url("${moonAsset(m)}")`}
    btn.append(rock,el('span','',m.name));btn.onclick=()=>{chosenMoon=m;stopAudio();render()};field.append(btn);
  }
  scene.append(field)}
  if(!moons.length||(chosenMoon&&moons.length===1))return;
  const library=el('section','moon-library');
  const heading=el('div','moon-library-heading');heading.append(el('h2','',language.value==='fr'?'Explorer les lunes':'Explore moons'),el('span','moon-count',String(moons.length)));library.append(heading);
  const search=el('input','moon-search');search.type='search';search.placeholder=language.value==='fr'?'Rechercher une lune':'Search moons';search.setAttribute('aria-label',search.placeholder);if(moons.length>8)library.append(search);
  const list=el('div','moon-list');
  for(const m of moons){const btn=el('button','moon-entry'+(m===chosenMoon?' selected':''),m.name);btn.type='button';btn.onclick=()=>{chosenMoon=m;stopAudio();render()};list.append(btn)}
  search.oninput=()=>{const query=search.value.trim().toLocaleLowerCase();for(const btn of list.children)btn.hidden=!btn.textContent.toLocaleLowerCase().includes(query)};
  library.append(list);panel.append(library);
}
let orbitGeometry=null;
function render(){orbitGeometry=null;scene.replaceChildren();updateControls();if(selected<0)overview();else detail()}
window.addEventListener('resize',()=>{orbitGeometry=null});
language.onchange=()=>{render();if(selected>=0)playAudio()};voice.onchange=()=>{if(selected>=0)playAudio()};sound.onclick=()=>{narrationOn=!narrationOn;updateControls();if(narrationOn)playAudio();else stopAudio()};document.addEventListener('keydown',e=>{if(e.key==='Escape'&&selected>=0){selected=-1;stopAudio();render()}else if(e.key==='ArrowRight'&&selected>=0){select((selected+1)%catalog.length)}else if(e.key==='ArrowLeft'&&selected>=0){select((selected+catalog.length-1)%catalog.length)}});
function animate(time){
  const seconds=time/1000,astronaut=document.querySelector('.astronaut');
  if(astronaut){const bounds=scene.getBoundingClientRect(),w=astronaut.offsetWidth,h=astronaut.offsetHeight;const x=(.5+.46*Math.sin(seconds*.037))*(bounds.width-w),y=(.5+.43*Math.sin(seconds*.061+1.1))*(bounds.height-h);astronaut.style.transform=`translate3d(${x}px,${y}px,0) rotate(${7*Math.sin(seconds*.047)}deg)`}
  const field=document.querySelector('.moon-field'),focus=document.querySelector('.focus-globe');
  if(field&&focus){
    if(!orbitGeometry||orbitGeometry.field!==field){const area=field.getBoundingClientRect(),body=focus.getBoundingClientRect();orbitGeometry={field,cx:body.left+body.width/2-area.left,cy:body.top+body.height/2-area.top,base:body.width/2+Math.max(30,body.width*.13),gap:Math.max(18,body.width*.07)};for(const track of field.querySelectorAll('.orbit-track')){const i=Number(track.dataset.orbit),radius=orbitGeometry.base+i*orbitGeometry.gap;track.style.left=orbitGeometry.cx+'px';track.style.top=orbitGeometry.cy+'px';track.style.width=2*radius+'px';track.style.height=2*radius+'px'}}
    const {cx,cy,base,gap}=orbitGeometry;
    for(const moon of field.querySelectorAll('.moon')){const i=Number(moon.dataset.orbit),radius=base+i*gap,angle=seconds*(.24/(1+i*.3))+i*Math.PI/2;moon.style.left=(cx+Math.cos(angle)*radius)+'px';moon.style.top=(cy+Math.sin(angle)*radius)+'px'}
  }
  requestAnimationFrame(animate)
}requestAnimationFrame(animate);
if(window.SOLAR_CATALOGUE?.planets){catalog=window.SOLAR_CATALOGUE.planets;render()}else{status.textContent='The planet catalogue is missing. Keep the data folder beside index.html.'}
