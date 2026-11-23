const scene=document.querySelector('#scene');
const ambient=document.querySelector('#ambient');
const audio=document.querySelector('#narration');
const status=document.querySelector('#status');
const language=document.querySelector('#language');
const voice=document.querySelector('#voice');
const sound=document.querySelector('#sound');
const replay=document.querySelector('#replay');
function shouldUseCylinderLayout(url,width,height){
  const params=new URLSearchParams(url.search);
  const hosted=url.protocol.startsWith('http')&&url.pathname.toLowerCase().includes('/the-cylinder-solar-expedition/');
  return params.get('preview')!=='1'&&(params.get('projection')==='1'||width/height>3||hosted);
}
const projection=shouldUseCylinderLayout(location,innerWidth,innerHeight);
document.body.classList.toggle('preview',!projection);
document.body.classList.toggle('cylinder',projection);
function updateProjectionScale(){document.documentElement.style.setProperty('--projection-x',String(projection?Math.min(1,(innerWidth/innerHeight)/(10876/999)):1))}
updateProjectionScale();
window.atlasLanguage=()=>language.value;
window.narratorAudio=audio;
const colors=['#bbb6ad','#eed2a3','#5fb7ff','#cf7756','#d8b899','#e0d0aa','#a2eef0','#6485ee'];
const sizes=[3.5,5.1,5.4,4.2,7.1,6.4,5.7,5.5];
let catalog=[];let selected=-1;let chosenMoon=null;let narrationOn=true;let learningAudio=null;let craftTopic=null;let craftSection=null;
const discoveries={
  Mercury:{en:['A cratered world','Mercury’s rocky surface preserves many impact craters.'],fr:['Un monde cratérisé','La surface rocheuse de Mercure conserve de nombreux cratères d’impact.']},
  Venus:{en:['A hidden surface','Thick clouds conceal Venus’s surface, while its dense atmosphere traps heat.'],fr:['Une surface cachée','Des nuages épais cachent la surface de Vénus, et son atmosphère dense piège la chaleur.']},
  Earth:{en:['Water and life','Liquid water covers most of Earth’s surface. Its atmosphere helps regulate temperature and supports life.'],fr:['Eau et vie','L’eau liquide couvre la majeure partie de la surface terrestre. Son atmosphère aide à réguler la température et rend la vie possible.']},
  Mars:{en:['The red planet','Iron-rich dust gives Mars its reddish appearance.'],fr:['La planète rouge','La poussière riche en fer donne à Mars sa couleur rougeâtre.']},
  Jupiter:{en:['A giant storm','Jupiter’s Great Red Spot is a vast storm in its atmosphere.'],fr:['Une tempête géante','La Grande Tache rouge de Jupiter est une vaste tempête dans son atmosphère.']},
  Saturn:{en:['The rings','Saturn’s rings are made mostly of countless pieces of ice, with some rock and dust.'],fr:['Les anneaux','Les anneaux de Saturne sont surtout formés d’innombrables morceaux de glace, ainsi que de roche et de poussière.']},
  Uranus:{en:['A planet on its side','Uranus rotates with an extreme tilt, so its axis is nearly in the plane of its orbit.'],fr:['Une planète couchée','Uranus tourne avec une inclinaison extrême : son axe est presque dans le plan de son orbite.']},
  Neptune:{en:['Distant winds','Neptune’s atmosphere has powerful winds and changing storms.'],fr:['Des vents lointains','L’atmosphère de Neptune connaît des vents puissants et des tempêtes changeantes.']}
};
const labels={en:{language:'Language',voice:'Voice',on:'Narration on',off:'Narration off',heading:'THE SOLAR EXPEDITION',sub:'You are at the Sun. Select a planet to explore it and its moons.',back:'Overview',diameter:'Diameter',year:'Orbital year',moons:'Catalogue moons',illustrative:'Model sizes, distances and moon orbits are illustrative.',sources:'NASA sources',discovery:'Discovery',moonIntro:'Select a moon to see its NASA record.',previous:'Previous',next:'Next',noMoons:'No natural moons',moon:'Moon',page:'page'},fr:{language:'Langue',voice:'Voix',on:'Narration activée',off:'Narration désactivée',heading:'THE SOLAR EXPEDITION',sub:'Vous êtes au Soleil. Sélectionnez une planète pour découvrir ses lunes.',back:'Vue d’ensemble',diameter:'Diamètre',year:'Année orbitale',moons:'Lunes du catalogue',illustrative:'Tailles, distances et orbites des lunes sont illustratives.',sources:'Sources NASA',discovery:'Découverte',moonIntro:'Sélectionnez une lune pour voir sa fiche NASA.',previous:'Précédent',next:'Suivant',noMoons:'Aucune lune naturelle',moon:'Lune',page:'page'}};
const nasaPlanetFacts='https://nssdc.gsfc.nasa.gov/planetary/factsheet/';
const nasaMoonCatalogue='https://ssd.jpl.nasa.gov/sats/discovery.html';
function sourceLink(label,url){const a=el('a','source-link');a.href=url;a.target='_blank';a.rel='noopener noreferrer';a.append(el('strong','',label),el('small','',url));return a}
function t(key){return labels[language.value][key]}
function nameOf(p){return language.value==='fr'?p.frenchName:p.name}
function el(tag,cls,text){const node=document.createElement(tag);if(cls)node.className=cls;if(text!=null)node.textContent=text;return node}
function globe(p,size){const node=el('span','globe');node.style.setProperty('--texture',`url("assets/display/${p.name}.jpg")`);node.style.setProperty('--diameter',size);node.style.setProperty('--glow',colors[catalog.indexOf(p)]+'77');if(p.name!=='Saturn'&&p.name!=='Uranus')return node;const system=el('span','ring-system '+p.name.toLowerCase());system.style.setProperty('--diameter',size);system.append(el('span','ring-art ring-back'),node,el('span','ring-art ring-front'));return system}
function moonAsset(m){return typeof assetUrl==='function'?assetUrl(m.image.slice(7)):m.image}
function moonVisual(m){const wrap=el('div','moon-closeup'+(m.image?' has-image':''));if(m.mappedSurface){const globe=el('span','globe moon-mapped-globe');globe.style.setProperty('--diameter','100%');globe.style.setProperty('--texture',`url("${moonAsset(m)}")`);globe.style.setProperty('--glow','#b4c9dd77');wrap.append(globe)}else if(m.image){const img=el('img','moon-portrait');img.src=moonAsset(m);img.alt=(language.value==='fr'?'Image NASA de ':'NASA image of ')+m.name;img.style.maxWidth=`${m.imageWidth}px`;img.style.maxHeight=`${m.imageHeight}px`;wrap.append(img)}else{wrap.append(el('div','moon-neutral'));wrap.setAttribute('aria-label',language.value==='fr'?'Modèle neutre sans image vérifiée':'Neutral model; no verified image')}return wrap}
let audioQueue=[];
function stopAudio(){audioQueue=[];audio.pause();audio.currentTime=0;audio.removeAttribute('src');audio.load()}
function narrationSource(key){return typeof NARRATION_AUDIO==='object'?NARRATION_AUDIO[key]:`audio/narration/${key}.mp3`}
function nextAudio(){const key=audioQueue.shift();if(!key)return;audio.src=narrationSource(key);audio.play().catch(()=>{status.textContent=language.value==='fr'?'Touchez un élément pour activer le son.':'Select an item to enable audio.'})}
audio.onended=nextAudio;
audio.onerror=()=>{if(audio.getAttribute('src'))status.textContent=language.value==='fr'?'Enregistrement introuvable pour cette sélection.':'Recording unavailable for this selection.'};
function playAudio(){stopAudio();if(!narrationOn)return;const who=voice.value;if(learningAudio)audioQueue.push(`${learningAudio}-${who}`);else if(selected<0)audioQueue.push(`overview-${who}`);else{const p=catalog[selected];audioQueue.push(chosenMoon?`moon-${p.name}-${p.moons.indexOf(chosenMoon)}-${who}`:`planet-${p.name}-${who}`)}nextAudio()}
function updateControls(){const fr=language.value==='fr',previous=voice.value;voice.replaceChildren();for(const item of fr?['estelle']:['anna','charles']){const option=el('option','',item[0].toUpperCase()+item.slice(1));option.value=item;voice.append(option)}if([...voice.options].some(option=>option.value===previous))voice.value=previous;document.querySelector('#languageLabel').textContent=t('language');document.querySelector('#voiceLabel').textContent=t('voice');document.querySelector('#soundLabel').textContent=t(narrationOn?'on':'off');sound.setAttribute('aria-pressed',String(narrationOn));replay.setAttribute('aria-label',fr?'Réécouter la narration':'Replay narration');replay.title=replay.getAttribute('aria-label');document.documentElement.lang=language.value}
function overview(){const title=el('h1','overview-heading',t('heading'));scene.append(title,el('p','overview-sub',t('sub')));catalog.forEach((p,i)=>{const btn=el('button','world');btn.type='button';btn.style.left=(6.25+i*12.5)+'%';btn.setAttribute('aria-label',nameOf(p));const size=`min(${(sizes[i]*.75).toFixed(2)}vw,${(sizes[i]*5.5).toFixed(2)}vh)`;btn.append(globe(p,size),el('span','world-label',nameOf(p)));btn.onclick=()=>select(i);scene.append(btn)})}
function addAmbientCraft(){
  for(const [id,cls,source] of [['rocket','spacecraft rocket','assets/rocket-cutout.png'],['station','spacecraft space-station','assets/station-cutout.png'],['astronaut','astronaut','assets/astronaut-float.webp']]){
    const button=el('button',cls+' craft-hotspot');button.type='button';button.dataset.craft=id;
    const image=el('img','craft-image');image.src=source;image.alt='';image.draggable=false;
    button.append(image);button.onclick=()=>openCraft(id);ambient.append(button)
  }
  updateCraftLabels();
}
function updateCraftLabels(){for(const button of ambient.querySelectorAll('.craft-hotspot')){const guide=window.CRAFT_GUIDES?.[button.dataset.craft]?.[language.value];if(guide){button.setAttribute('aria-label',`${language.value==='fr'?'Explorer':'Explore'} : ${guide.title}`);button.title=button.getAttribute('aria-label')}}}
function openCraft(id){craftTopic=id;craftSection=null;learningAudio=`craft-intro-${id}`;status.textContent='';render();playAudio()}
function closeCraft(){craftTopic=null;craftSection=null;learningAudio=null;render();playAudio()}
function select(i){craftTopic=null;selected=i;chosenMoon=null;learningAudio=null;status.textContent='';render();playAudio()}
function hotspotFact(p,m){
  if(!m){const fact=discoveries[p.name][language.value];return {title:fact[0],text:fact[1],url:p.source,audioKey:`planet-${p.name}`}}
  const fr=language.value==='fr';
  const text=m.mappedSurface?(fr?'Ce globe utilise une carte de la Lune publiée par la NASA. Sa rotation est une animation illustrative.':'This globe uses a NASA lunar map. Its rotation is an illustrative animation.'):m.image?(fr?'Cette photographie de mission montre une vue observée de la lune, et non une carte complète de sa surface.':'This mission photograph shows one observed view of the moon, rather than a complete surface map.'):(fr?'La NASA et le JPL répertorient cette lune. Aucune image de surface vérifiée n’est montrée ici.':'NASA and JPL catalogue this moon. No verified surface image is shown here.');
  return {title:fr?'Ce que montre cette image':'What this image shows',text,url:m.imageSource||nasaMoonCatalogue,audioKey:`hotspot-moon-${m.mappedSurface?'mapped':m.image?'image':'neutral'}`}
}
function addHotspot(panel,focus,p,m){
  const fact=hotspotFact(p,m),fr=language.value==='fr';
  const pin=el('button','hotspot-pin','?');pin.type='button';pin.setAttribute('aria-label',fr?'Que voit-on ici ?':'What am I seeing?');pin.title=pin.getAttribute('aria-label');
  const card=el('section','hotspot-card');card.hidden=true;
  card.append(el('span','hotspot-kicker',fr?'QUE VOIT-ON ICI ?':'WHAT AM I SEEING?'),el('h2','',fact.title),el('p','',fact.text),sourceLink('NASA · '+(m?m.name:p.name),fact.url));
  pin.onclick=()=>{card.hidden=!card.hidden;pin.setAttribute('aria-expanded',String(!card.hidden));learningAudio=card.hidden?null:fact.audioKey;if(!card.hidden){panel.scrollTop=0;playAudio()}else stopAudio()};
  pin.setAttribute('aria-expanded','false');focus.append(pin);panel.insertBefore(card,panel.querySelector('.planet-summary'))
}
function addScaleMoment(panel,p){
  const fr=language.value==='fr',earth=catalog.find(item=>item.name==='Earth'),ratio=p.diameter/earth.diameter;
  const button=el('button','learning-button',fr?'◉ Moment d’échelle':'◉ Scale moment');button.type='button';button.setAttribute('aria-expanded','false');
  const card=el('section','scale-card');card.hidden=true;
  card.append(el('span','hotspot-kicker',fr?'TAILLES RÉELLES COMPARÉES':'REAL SIZE COMPARISON'),el('h2','',`${nameOf(p)} / ${fr?'Terre':'Earth'}`));
  const stage=el('div','scale-stage');
  for(const [planet,label,diameter] of [[earth,fr?'Terre':'Earth',earth.diameter],[p,nameOf(p),p.diameter]]){
    const item=el('div','scale-item');const circle=el('span','scale-circle');circle.style.setProperty('--scale-size',`${Math.max(3,Math.round(140*diameter/Math.max(p.diameter,earth.diameter)))}px`);circle.style.setProperty('--scale-color',colors[catalog.indexOf(planet)]);item.append(circle,el('strong','',label));stage.append(item)
  }
  card.append(stage,el('p','',fr?`${nameOf(p)} mesure environ ${ratio.toLocaleString('fr-FR',{maximumFractionDigits:2})} fois le diamètre de la Terre. Les deux disques ci-dessus sont dessinés à la même échelle; les distances orbitales ne le sont pas.`:`${nameOf(p)} is about ${ratio.toLocaleString('en-US',{maximumFractionDigits:2})} times Earth's diameter. Both discs above use the same scale; orbital distances do not.`),sourceLink('NASA · planetary measurements',nasaPlanetFacts));
  button.onclick=()=>{card.hidden=!card.hidden;button.setAttribute('aria-expanded',String(!card.hidden));learningAudio=card.hidden?null:`scale-${p.name}`;if(!card.hidden)playAudio();else stopAudio()};
  panel.append(button,card)
}
function surroundingWorlds(){
  // Keep the other planets at their overview longitudes during close-ups.
  for(let index=0;index<catalog.length;index++){
    if(index===selected)continue;
    const p=catalog[index];
    const landmark=el('div','ambient-world');
    landmark.style.left=(6.25+index*12.5)+'%';
    landmark.setAttribute('aria-hidden','true');
    const size=`min(${(sizes[index]*.48).toFixed(2)}vw,${(sizes[index]*4).toFixed(2)}vh)`;
    landmark.append(globe(p,size),el('span','ambient-label',nameOf(p)));
    scene.append(landmark);
  }
}
function craftDetail(){
  const guide=window.CRAFT_GUIDES?.[craftTopic]?.[language.value];if(!guide)return;
  surroundingWorlds();
  const original=ambient.querySelector(`.craft-hotspot[data-craft="${craftTopic}"] .craft-image`);
  if(original){const artwork=el('div','craft-focus');const picture=el('img','craft-focus-image');picture.src=original.src;picture.alt='';artwork.append(picture);scene.append(artwork)}
  const panel=el('article','planet-panel craft-panel');
  panel.append(el('div','eyebrow',guide.eyebrow),el('h1','',guide.title),el('p','planet-summary',guide.intro));
  const tabs=el('nav','craft-tabs');tabs.setAttribute('aria-label',language.value==='fr'?'Sujets':'Topics');
  guide.sections.forEach((item,index)=>{const button=el('button','craft-tab'+(index===craftSection?' selected':''),item.title);button.type='button';button.setAttribute('aria-pressed',String(index===craftSection));button.onclick=()=>{craftSection=index;learningAudio=`craft-${craftTopic}-${index}`;render();playAudio()};tabs.append(button)});
  panel.append(tabs);
  if(craftSection!==null){const item=guide.sections[craftSection];panel.append(el('h2','craft-section-title',item.title),el('p','craft-section-text',item.text));
  const visuals=window.CRAFT_VISUALS?.[craftTopic]?.[craftSection]||[];
  if(visuals.length){const gallery=el('div','craft-gallery');for(const visual of visuals){const figure=el('figure','craft-figure');const picture=el('img','craft-photo');picture.src=visual.file;picture.alt=visual[language.value];picture.loading='lazy';const caption=el('figcaption','craft-caption');const credit=el('a','', 'NASA ↗');credit.href=visual.source;credit.target='_blank';credit.rel='noopener noreferrer';credit.setAttribute('aria-label',`${language.value==='fr'?'Source de l’image':'Image source'}: ${visual[language.value]}`);caption.append(el('span','',visual[language.value]),credit);figure.append(picture,caption);gallery.append(figure)}panel.append(gallery)}
  const sources=el('div','craft-sources');for(const [label,url] of item.sources)sources.append(sourceLink(label,url));panel.append(sources)}
  scene.append(panel);
  const back=el('button','action back',language.value==='fr'?'Retour':'Return');back.type='button';back.onclick=closeCraft;scene.append(back)
}
function detail(){
  const p=catalog[selected];
  surroundingWorlds();
  const focus=el('div','focus-globe');focus.append(chosenMoon?moonVisual(chosenMoon):globe(p,'100%'));scene.append(focus);
  const panel=el('article','planet-panel '+(chosenMoon?'moon-detail':'planet-detail'));
  if(chosenMoon){
    const m=chosenMoon;
    panel.append(el('div','eyebrow',`${nameOf(p).toUpperCase()} · ${language.value==='fr'?'LUNE':'MOON'}`),el('h1','',m.name));
    panel.append(el('p','planet-summary',m.profile?(language.value==='fr'?m.profile.fr:m.profile.en):(language.value==='fr'?`Satellite naturel de ${nameOf(p)}. La NASA/JPL répertorie sa découverte; aucune description de surface vérifiée n’est présentée ici.`:`Natural satellite of ${nameOf(p)}. NASA/JPL records its discovery; no verified surface description is presented here.`)));
    const stats=el('div','stat-grid moon-stat-grid');for(const [label,value] of [[language.value==='fr'?'ORBITE AUTOUR DE':'ORBITS',nameOf(p)],[t('discovery'),m.year||'—']]){const card=el('div','stat-card');card.append(el('span','stat-label',label),el('strong','stat-value',value));stats.append(card)}panel.append(stats);
    panel.append(el('p','visual-caption',m.mappedSurface?(language.value==='fr'?'Carte lunaire NASA/LRO · globe illustré.':'NASA/LRO lunar map · rendered globe.'):m.image?(language.value==='fr'?'Image NASA · vue observée.':'NASA image · observed view.'):language.value==='fr'?'Aucune image vérifiée · modèle neutre.':'No verified image · neutral model.'));
    addHotspot(panel,focus,p,m);
    const sources=el('details','source-notes');sources.append(el('summary','',t('sources')));if(!(p.name==='Earth'&&m.name==='Moon'))sources.append(sourceLink('NASA/JPL · '+m.name,nasaMoonCatalogue));if(m.profile)sources.append(sourceLink('NASA Science · '+m.name,m.profile.source));if(m.imageSource)sources.append(sourceLink('NASA · image',m.imageSource));panel.append(sources);
  }else{
    panel.append(el('div','eyebrow',language.value==='fr'?'ATLAS PLANÉTAIRE':'PLANETARY ATLAS'),el('h1','',nameOf(p)),el('p','planet-summary',language.value==='fr'?p.french:p.english));
    const stats=el('div','stat-grid');
    for(const [label,value] of [[t('diameter')+(language.value==='fr'?' équatorial':' (equatorial)'),`${p.diameter.toLocaleString(language.value==='fr'?'fr-FR':'en-US')} km`],[t('year'),language.value==='fr'?p.yearFrench:p.year],[t('moons'),String(p.moons.length)]]){const card=el('div','stat-card');card.append(el('span','stat-label',label),el('strong','stat-value',value));stats.append(card)}
    panel.append(stats,el('p','disclaimer',t('illustrative')));
    addHotspot(panel,focus,p,null);
    addScaleMoment(panel,p);
    const sources=el('details','source-notes');sources.append(el('summary','',t('sources')),sourceLink('NASA Science · '+p.name,p.source),sourceLink('NASA · planetary measurements',nasaPlanetFacts));panel.append(sources);
  }
  scene.append(panel);
  const back=el('button','action back',chosenMoon?(language.value==='fr'?'Planète':'Planet'):t('back'));back.type='button';back.onclick=()=>{learningAudio=null;if(chosenMoon){chosenMoon=null;render();playAudio()}else{selected=-1;stopAudio();render()}};scene.append(back);
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
    btn.append(rock,el('span','',m.name));btn.onclick=()=>{learningAudio=null;chosenMoon=m;render();playAudio()};field.append(btn);
  }
  scene.append(field)}
  if(!moons.length||(chosenMoon&&moons.length===1))return;
  const library=el('section','moon-library');
  const heading=el('div','moon-library-heading');heading.append(el('h2','',language.value==='fr'?'Explorer les lunes':'Explore moons'),el('span','moon-count',String(moons.length)));library.append(heading);
  const search=el('input','moon-search');search.type='search';search.placeholder=language.value==='fr'?'Rechercher une lune':'Search moons';search.setAttribute('aria-label',search.placeholder);if(moons.length>8)library.append(search);
  const list=el('div','moon-list');
  for(const m of moons){const btn=el('button','moon-entry'+(m===chosenMoon?' selected':''),m.name);btn.type='button';btn.onclick=()=>{learningAudio=null;chosenMoon=m;render();playAudio()};list.append(btn)}
  search.oninput=()=>{const query=search.value.trim().toLocaleLowerCase();for(const btn of list.children)btn.hidden=!btn.textContent.toLocaleLowerCase().includes(query)};
  library.append(list);panel.append(library);
}
let orbitGeometry=null;
function render(){orbitGeometry=null;scene.replaceChildren();document.body.classList.toggle('detail-active',selected>=0||craftTopic!==null);if(!ambient.childElementCount)addAmbientCraft();updateControls();updateCraftLabels();if(craftTopic)craftDetail();else if(selected<0)overview();else detail()}
window.addEventListener('resize',()=>{orbitGeometry=null;updateProjectionScale()});
language.onchange=()=>{learningAudio=craftTopic?(craftSection===null?`craft-intro-${craftTopic}`:`craft-${craftTopic}-${craftSection}`):null;render();playAudio()};voice.onchange=playAudio;sound.onclick=()=>{narrationOn=!narrationOn;updateControls();if(narrationOn)playAudio();else stopAudio()};replay.onclick=()=>{if(!narrationOn){narrationOn=true;updateControls()}playAudio()};document.addEventListener('keydown',e=>{if(e.key==='Escape'&&craftTopic){closeCraft()}else if(e.key==='Escape'&&selected>=0){learningAudio=null;selected=-1;stopAudio();render()}else if(e.key==='ArrowRight'&&selected>=0&&!craftTopic){select((selected+1)%catalog.length)}else if(e.key==='ArrowLeft'&&selected>=0&&!craftTopic){select((selected+catalog.length-1)%catalog.length)}});
let astronautX=null,astronautY=null,lastFrameTime=0,astronautLayout=null;
function animate(time){
  const seconds=time/1000,astronaut=ambient.querySelector('.astronaut');
  if(astronaut){
    const detail=selected>=0||craftTopic!==null;
    if(!astronautLayout||astronautLayout.detail!==detail||astronautLayout.width!==ambient.clientWidth||astronautLayout.height!==ambient.clientHeight){astronautLayout={detail,width:ambient.clientWidth,height:ambient.clientHeight,bodyWidth:astronaut.offsetWidth,bodyHeight:astronaut.offsetHeight}}
    const {width,height,bodyWidth,bodyHeight}=astronautLayout;
    const targetX=(detail ? .03+.1*(.5+.5*Math.sin(seconds*.008)) : .5+.46*Math.sin(seconds*.008))*(width-bodyWidth);
    const targetY=(detail ? .72+.07*Math.sin(seconds*.011+1.1) : .5+.43*Math.sin(seconds*.011+1.1))*(height-bodyHeight);
    const delta=Math.min(Math.max((time-lastFrameTime)/1000,0),.1),blend=1-Math.exp(-1.8*delta);
    astronautX=astronautX===null?targetX:astronautX+(targetX-astronautX)*blend;
    astronautY=astronautY===null?targetY:astronautY+(targetY-astronautY)*blend;
    astronaut.style.transform=`translate3d(${astronautX}px,${astronautY}px,0) rotate(${4*Math.sin(seconds*.01)}deg)`;
  }
  lastFrameTime=time;
  const field=document.querySelector('.moon-field'),focus=document.querySelector('.focus-globe');
  if(field&&focus){
    if(!orbitGeometry||orbitGeometry.field!==field){const area=field.getBoundingClientRect(),body=focus.getBoundingClientRect(),xScale=projection?Number.parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--projection-x'))||1:1;orbitGeometry={field,cx:body.left+body.width/2-area.left,cy:body.top+body.height/2-area.top,base:body.height/2+Math.max(30,body.height*.13),gap:Math.max(18,body.height*.07),xScale};for(const track of field.querySelectorAll('.orbit-track')){const i=Number(track.dataset.orbit),radius=orbitGeometry.base+i*orbitGeometry.gap;track.style.left=orbitGeometry.cx+'px';track.style.top=orbitGeometry.cy+'px';track.style.width=2*radius*xScale+'px';track.style.height=2*radius+'px'}}
    const {cx,cy,base,gap,xScale}=orbitGeometry;
    for(const moon of field.querySelectorAll('.moon')){const i=Number(moon.dataset.orbit),radius=base+i*gap,angle=seconds*(.24/(1+i*.3))+i*Math.PI/2,x=cx+Math.cos(angle)*radius*xScale,y=cy+Math.sin(angle)*radius;moon.style.transform=`translate3d(${x}px,${y}px,0) scaleX(${xScale}) translate(-50%,-50%)`}
  }
  requestAnimationFrame(animate)
}requestAnimationFrame(animate);
if(window.SOLAR_CATALOGUE?.planets){catalog=window.SOLAR_CATALOGUE.planets;render()}else{status.textContent='The planet catalogue is missing. Keep the data folder beside index.html.'}
