/** Optional progressive enhancement. Core lessons and SVG work without CDNs. */
let cleanup = () => {};
export function stopVisuals() { cleanup(); cleanup = () => {}; }
export async function enableVisuals(host, motion = true) {
  stopVisuals();
  if (!host?.isConnected) return;
  const THREE_URL = 'https://cdn.jsdelivr.net/npm/three@0.185.0/build/three.module.js';
  const ANIME_URL = 'https://cdn.jsdelivr.net/npm/animejs@4.1.3/lib/anime.esm.min.js';
  let THREE;
  try { THREE = await import(THREE_URL); }
  catch { throw new Error('3D could not load from the CDN. The accessible 2D diagram remains available.'); }
  if (!host.isConnected) return;
  const reduced = !motion || matchMedia('(prefers-reduced-motion: reduce)').matches;
  let renderer;
  try { renderer = new THREE.WebGLRenderer({antialias:true,alpha:true}); }
  catch { throw new Error('WebGL is unavailable. Use the equivalent 2D diagram.'); }
  renderer.setPixelRatio(Math.min(devicePixelRatio, 1.5));
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(35, 1, 0.1, 100);
  camera.position.set(7,7,11); camera.lookAt(0,0,0);
  scene.add(new THREE.AmbientLight(0xffffff, 2));
  const light = new THREE.DirectionalLight(0xe8ffd4, 4); light.position.set(4,7,5); scene.add(light);
  const group = new THREE.Group(); scene.add(group);
  const positions = [[-2,0,0],[0,0,0],[2,0,0],[0,1.8,0],[0,-1.8,0]];
  const resources = [];
  const cubes = positions.map((p,i)=>{
    const geometry = new THREE.BoxGeometry(1.04,1.04,1.04);
    const material = new THREE.MeshStandardMaterial({color:i===1?0xcefc72:i===3?0xb8a0ea:0x609789,metalness:0.22,roughness:0.37});
    const mesh = new THREE.Mesh(geometry,material); mesh.position.set(...p); group.add(mesh);
    const edges = new THREE.EdgesGeometry(geometry);
    const lineMaterial = new THREE.LineBasicMaterial({color:0xdff1cf,transparent:true,opacity:.6});
    mesh.add(new THREE.LineSegments(edges,lineMaterial)); resources.push(geometry,material,edges,lineMaterial); return mesh;
  });
  for (const i of [0,2,3,4]) {
    const geometry = new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(...positions[1]),new THREE.Vector3(...positions[i])]);
    const material = new THREE.LineBasicMaterial({color:0x799d70}); group.add(new THREE.Line(geometry,material)); resources.push(geometry,material);
  }
  host.querySelector('canvas')?.remove();
  renderer.domElement.setAttribute('aria-hidden','true'); host.append(renderer.domElement); host.classList.add('three-active');
  const resize = () => { const width=host.clientWidth,height=host.clientHeight; renderer.setSize(width,height,false); camera.aspect=width/Math.max(height,1);camera.updateProjectionMatrix();renderer.render(scene,camera); };
  const observer=new ResizeObserver(resize);observer.observe(host);resize();
  let frame=0,paused=false;
  const visibility=()=>{paused=document.hidden;}; document.addEventListener('visibilitychange',visibility);
  const render=t=>{if(!paused){group.rotation.y=Math.sin(t*.00018)*.18; cubes.forEach((c,i)=>{c.position.y=positions[i][1]+Math.sin(t*.001+i)*.065;});renderer.render(scene,camera);}frame=requestAnimationFrame(render);};
  if(!reduced)frame=requestAnimationFrame(render);
  let animation;
  import(ANIME_URL).then(({animate,stagger})=>{
    if(!host.isConnected||reduced)return;
    animation=animate(host.closest('.hero')?.querySelectorAll('.animate-in')??[],{opacity:[.6,1],translateY:[8,0],duration:600,delay:stagger(70),ease:'outQuad'});
  }).catch(()=>{/* Motion is enhancement only; CSS and state transitions still work. */});
  cleanup=()=>{cancelAnimationFrame(frame);observer.disconnect();document.removeEventListener('visibilitychange',visibility);animation?.revert?.();resources.forEach(r=>r.dispose());renderer.dispose();renderer.domElement.remove();host.classList.remove('three-active');};
}
