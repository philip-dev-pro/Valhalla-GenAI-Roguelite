/* ==========================================================================
   Aethelgard: Valhalla Trials - Ghost-Damage Bugfix & Balanced Low Audio
   ========================================================================== */

function loadSavedProfile() {
  return {
    isGameStarted: false,
    inIntroSequence: false,
    audioEnabled: true,
    maxHp: parseInt(localStorage.getItem('valhalla_max_hp') || '100'),
    hp: parseInt(localStorage.getItem('valhalla_max_hp') || '100'),
    attackDmg: parseInt(localStorage.getItem('valhalla_attack_dmg') || '28'),
    rangedDmg: parseInt(localStorage.getItem('valhalla_ranged_dmg') || '12'),
    defense: parseFloat(localStorage.getItem('valhalla_defense') || '0.0'),
    baseSpeed: 0.09,
    speed: 0.09,
    essence: parseInt(localStorage.getItem('valhalla_essence') || '50'),

    tierHp: parseInt(localStorage.getItem('valhalla_tier_hp') || '0'),
    tierDmg: parseInt(localStorage.getItem('valhalla_tier_dmg') || '0'),
    tierBow: parseInt(localStorage.getItem('valhalla_tier_bow') || '0'),
    tierDef: parseInt(localStorage.getItem('valhalla_tier_def') || '0'),

    currentZone: 'The Sanctuary (Hub)',
    arenaLevel: 0,
    isArenaCleared: false,

    threatLevel: parseInt(localStorage.getItem('valhalla_threat_level') || '1'),
    spawnImmunityTimer: 0.0,

    modifierEnemySpeed: 1.0,
    modifierEnemyDmg: 1.0,

    geminiApiKey: localStorage.getItem('valhalla_gemini_key') || 'AQ.Ab8RN6K7z1K2QL4KSzthgCnXuYb3qMKGhicvAUrTdTas2kyZ3A',
    activeRunLore: null
  };
}

const state = loadSavedProfile();

function autoSaveProfile() {
  localStorage.setItem('valhalla_max_hp', state.maxHp);
  localStorage.setItem('valhalla_attack_dmg', state.attackDmg);
  localStorage.setItem('valhalla_ranged_dmg', state.rangedDmg);
  localStorage.setItem('valhalla_defense', state.defense);
  localStorage.setItem('valhalla_essence', state.essence);
  localStorage.setItem('valhalla_tier_hp', state.tierHp);
  localStorage.setItem('valhalla_tier_dmg', state.tierDmg);
  localStorage.setItem('valhalla_tier_bow', state.tierBow);
  localStorage.setItem('valhalla_tier_def', state.tierDef);
  localStorage.setItem('valhalla_threat_level', state.threatLevel);
}

function resetRunAndStats() {
  state.maxHp = 100;
  state.hp = 100;
  state.attackDmg = 28;
  state.rangedDmg = 12;
  state.defense = 0.0;
  state.essence = 50;
  state.tierHp = 0;
  state.tierDmg = 0;
  state.tierBow = 0;
  state.tierDef = 0;
  state.threatLevel = 1;
  autoSaveProfile();
  updateHUD();
  alert('Stats, essence, and Threat Level reset to baseline Level 1!');
}

function getCostHp() { return 30 + (state.tierHp * 15); }
function getCostDmg() { return 35 + (state.tierDmg * 15); }
function getCostBow() { return 30 + (state.tierBow * 15); }
function getCostDef() { return 40 + (state.tierDef * 20); }

// ==========================================
// AUDIO ENGINE (Lowered to 0.16 volume)
// ==========================================
let audioCtx = null;
function initAudio() {
  if (!audioCtx) {
    audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  }
}

const musicTracks = {
  hub: 'audio/hub.mp3',
  arenas: ['audio/arena1.mp3'],
  boss: 'audio/boss.mp3'
};

let currentTrackPlaying = '';

function playAdaptiveMusic(category) {
  if (!state.audioEnabled) return;
  const audioEl = document.getElementById('bg-music');
  if (!audioEl) return;

  let nextSrc = '';
  if (category === 'hub') nextSrc = musicTracks.hub;
  else if (category === 'arena') {
    const idx = Math.floor(Math.random() * musicTracks.arenas.length);
    nextSrc = musicTracks.arenas[idx];
  } else if (category === 'boss') nextSrc = musicTracks.boss;

  if (currentTrackPlaying !== nextSrc && nextSrc) {
    currentTrackPlaying = nextSrc;
    audioEl.src = nextSrc;
    audioEl.volume = 0.16; // Diskreta 0.16
    audioEl.play().catch(e => console.log("Autoplay blocked", e));
  }
}

function playSound(type) {
  if (!state.audioEnabled || !audioCtx) return;
  try {
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.connect(gain);
    gain.connect(audioCtx.destination);
    const now = audioCtx.currentTime;

    if (type === 'sword') {
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(220, now);
      osc.frequency.exponentialRampToValueAtTime(80, now + 0.15);
      gain.gain.setValueAtTime(0.25, now);
      gain.gain.linearRampToValueAtTime(0.01, now + 0.15);
      osc.start(now);
      osc.stop(now + 0.15);
    } else if (type === 'crossbow') {
      osc.type = 'sine';
      osc.frequency.setValueAtTime(550, now);
      osc.frequency.exponentialRampToValueAtTime(140, now + 0.12);
      gain.gain.setValueAtTime(0.22, now);
      gain.gain.linearRampToValueAtTime(0.01, now + 0.12);
      osc.start(now);
      osc.stop(now + 0.12);
    } else if (type === 'hit') {
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(320, now);
      osc.frequency.exponentialRampToValueAtTime(60, now + 0.1);
      gain.gain.setValueAtTime(0.35, now);
      gain.gain.linearRampToValueAtTime(0.01, now + 0.1);
      osc.start(now);
      osc.stop(now + 0.1);
    } else if (type === 'parry') {
      osc.type = 'sine';
      osc.frequency.setValueAtTime(880, now);
      osc.frequency.exponentialRampToValueAtTime(440, now + 0.08);
      gain.gain.setValueAtTime(0.3, now);
      gain.gain.linearRampToValueAtTime(0.01, now + 0.08);
      osc.start(now);
      osc.stop(now + 0.08);
    } else if (type === 'player_hurt') {
      osc.type = 'square';
      osc.frequency.setValueAtTime(110, now);
      osc.frequency.exponentialRampToValueAtTime(40, now + 0.2);
      gain.gain.setValueAtTime(0.4, now);
      gain.gain.linearRampToValueAtTime(0.01, now + 0.2);
      osc.start(now);
      osc.stop(now + 0.2);
    } else if (type === 'heal') {
      osc.type = 'sine';
      osc.frequency.setValueAtTime(350, now);
      osc.frequency.exponentialRampToValueAtTime(700, now + 0.25);
      gain.gain.setValueAtTime(0.25, now);
      gain.gain.linearRampToValueAtTime(0.01, now + 0.25);
      osc.start(now);
      osc.stop(now + 0.25);
    }
  } catch (e) { console.warn("Audio err", e); }
}

let lastHeartbeatTime = 0;
function checkHeartbeat(now) {
  if (state.hp < state.maxHp * 0.35 && state.hp > 0 && state.audioEnabled && audioCtx) {
    if (now - lastHeartbeatTime > 0.85) {
      lastHeartbeatTime = now;
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(65, audioCtx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(40, audioCtx.currentTime + 0.25);
      gain.gain.setValueAtTime(0.5, audioCtx.currentTime);
      gain.gain.linearRampToValueAtTime(0.01, audioCtx.currentTime + 0.25);
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.start();
      osc.stop(audioCtx.currentTime + 0.25);
    }
  }
}

// --- THREE.JS GLOBALS ---
let scene, camera, renderer, clock;
let playerGroup, swordMesh, rightArmGroup, leftArmGroup;
let leftLegMesh, rightLegMesh;
let enemies = [];
let playerProjectiles = [];
let enemyProjectiles = [];
let healthPickups = [];
let shockwaves = [];
let lightningTelegraphs = [];
let vortexPullActive = false;
let portalGroup, altarMesh;
let groundMesh;
let arenaStructures = [];
let directionalLight, ambientLight;

// Active timeouts pool (Eliminerar spökskador vid död/zonbyte)
let activeBossTimeouts = [];

let particlesMesh;
const PARTICLE_COUNT = 200;

let solidColliders = [];
const MAP_BOUNDARY_RADIUS = 31;

// Camera
let isPointerLocked = false;
let cameraYaw = 0;
let cameraPitch = 0.24;
const cameraDistance = 8.5;
const cameraHeight = 3.0;
let introOrbitAngle = 0;

// Movement & Air Hang-time
const keys = { w: false, a: false, s: false, d: false, shift: false };
let playerVelocityY = 0;
let isGrounded = true;
const GRAVITY = -0.012;
const JUMP_FORCE = 0.42;
let walkCycleTimer = 0;

// Combat
let isAttacking = false;
let attackTimer = 0;
let lastRangedShotTime = 0;
let isDead = false;

let activeInteractionTarget = null;
let aiBannerTimeout = null;

function clearAllBossTimeouts() {
  activeBossTimeouts.forEach(t => clearTimeout(t));
  activeBossTimeouts = [];
  vortexPullActive = false;
}

function init() {
  const container = document.getElementById('canvas-container');
  clock = new THREE.Clock();

  scene = new THREE.Scene();
  scene.background = new THREE.Color(0x0e0c18);
  scene.fog = new THREE.FogExp2(0x0e0c18, 0.018);

  camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 1000);

  renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: "high-performance" });
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.15;
  container.appendChild(renderer.domElement);

  ambientLight = new THREE.AmbientLight(0xffffff, 0.58);
  scene.add(ambientLight);

  directionalLight = new THREE.DirectionalLight(0xffedd5, 1.15);
  directionalLight.position.set(30, 50, 25);
  directionalLight.castShadow = true;
  directionalLight.shadow.mapSize.width = 2048;
  directionalLight.shadow.mapSize.height = 2048;
  const d = 38;
  directionalLight.shadow.camera.left = -d;
  directionalLight.shadow.camera.right = d;
  directionalLight.shadow.camera.top = d;
  directionalLight.shadow.camera.bottom = -d;
  scene.add(directionalLight);

  initFloatingParticles();
  buildSanctuary();
  createDualWieldPlayer();
  setupEvents();
  updateHUD();

  animate();
}

// --- PARTICLES ---
function initFloatingParticles() {
  const geo = new THREE.BufferGeometry();
  const positions = new Float32Array(PARTICLE_COUNT * 3);

  for (let i = 0; i < PARTICLE_COUNT * 3; i += 3) {
    positions[i] = (Math.random() - 0.5) * 55;
    positions[i + 1] = Math.random() * 12;
    positions[i + 2] = (Math.random() - 0.5) * 55;
  }

  geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  const mat = new THREE.PointsMaterial({
    color: 0xffd54f,
    size: 0.18,
    transparent: true,
    opacity: 0.7
  });

  particlesMesh = new THREE.Points(geo, mat);
  scene.add(particlesMesh);
}

function updateParticles(delta) {
  if (!particlesMesh) return;
  const pos = particlesMesh.geometry.attributes.position.array;
  for (let i = 1; i < PARTICLE_COUNT * 3; i += 3) {
    pos[i] += delta * 0.4;
    if (pos[i] > 12) pos[i] = 0.2;
  }
  particlesMesh.geometry.attributes.position.needsUpdate = true;
}

// --- PLAYER RIG ---
function createDualWieldPlayer() {
  playerGroup = new THREE.Group();

  const armorMat = new THREE.MeshStandardMaterial({ color: 0x2e3842, roughness: 0.35, metalness: 0.65 });
  const goldTrimMat = new THREE.MeshStandardMaterial({ color: 0xd4af37, roughness: 0.25, metalness: 0.9 });

  const torsoGeo = new THREE.BoxGeometry(0.9, 1.1, 0.55);
  const torso = new THREE.Mesh(torsoGeo, armorMat);
  torso.position.y = 1.55;
  torso.castShadow = true;
  playerGroup.add(torso);

  const beltGeo = new THREE.BoxGeometry(0.95, 0.2, 0.6);
  const belt = new THREE.Mesh(beltGeo, goldTrimMat);
  belt.position.y = 0.95;
  belt.castShadow = true;
  playerGroup.add(belt);

  const headGeo = new THREE.BoxGeometry(0.5, 0.55, 0.5);
  const head = new THREE.Mesh(headGeo, armorMat);
  head.position.y = 2.35;
  head.castShadow = true;
  playerGroup.add(head);

  const visorGeo = new THREE.BoxGeometry(0.4, 0.12, 0.1);
  const visorMat = new THREE.MeshBasicMaterial({ color: 0x00e5ff });
  const visor = new THREE.Mesh(visorGeo, visorMat);
  visor.position.set(0, 2.35, 0.26);
  playerGroup.add(visor);

  leftArmGroup = new THREE.Group();
  leftArmGroup.position.set(-0.65, 2.0, 0);

  const leftArmGeo = new THREE.BoxGeometry(0.28, 1.0, 0.3);
  const leftArm = new THREE.Mesh(leftArmGeo, armorMat);
  leftArm.position.y = -0.5;
  leftArm.castShadow = true;
  leftArmGroup.add(leftArm);

  const bowGroup = new THREE.Group();
  bowGroup.position.set(0, -0.7, 0.35);
  bowGroup.rotation.x = Math.PI / 2;

  const stockGeo = new THREE.BoxGeometry(0.12, 0.6, 0.12);
  const stockMat = new THREE.MeshStandardMaterial({ color: 0x3e2723 });
  const stock = new THREE.Mesh(stockGeo, stockMat);
  bowGroup.add(stock);

  const prodGeo = new THREE.BoxGeometry(0.75, 0.08, 0.06);
  const prodMat = new THREE.MeshStandardMaterial({ color: 0xd4af37, emissive: 0xffa000, emissiveIntensity: 0.35 });
  const prod = new THREE.Mesh(prodGeo, prodMat);
  prod.position.y = 0.25;
  bowGroup.add(prod);

  leftArmGroup.add(bowGroup);
  playerGroup.add(leftArmGroup);

  rightArmGroup = new THREE.Group();
  rightArmGroup.position.set(0.65, 2.0, 0);

  const rightArmGeo = new THREE.BoxGeometry(0.28, 1.0, 0.3);
  const rightArm = new THREE.Mesh(rightArmGeo, armorMat);
  rightArm.position.y = -0.5;
  rightArm.castShadow = true;
  rightArmGroup.add(rightArm);

  const swordGroup = new THREE.Group();
  swordGroup.position.set(0, -0.9, 0.2);
  swordGroup.rotation.x = Math.PI / 4;

  const handleGeo = new THREE.CylinderGeometry(0.04, 0.04, 0.35, 8);
  const handleMat = new THREE.MeshStandardMaterial({ color: 0x2b1810 });
  const handle = new THREE.Mesh(handleGeo, handleMat);
  swordGroup.add(handle);

  const guardGeo = new THREE.BoxGeometry(0.4, 0.08, 0.1);
  const guard = new THREE.Mesh(guardGeo, goldTrimMat);
  guard.position.y = 0.15;
  swordGroup.add(guard);

  const bladeGeo = new THREE.BoxGeometry(0.1, 1.15, 0.03);
  const bladeMat = new THREE.MeshStandardMaterial({
    color: 0xe0f7fa,
    metalness: 0.9,
    roughness: 0.15,
    emissive: 0x00e5ff,
    emissiveIntensity: 0.45
  });
  const blade = new THREE.Mesh(bladeGeo, bladeMat);
  blade.position.y = 0.75;
  blade.castShadow = true;
  swordGroup.add(blade);

  swordMesh = swordGroup;
  rightArmGroup.add(swordMesh);
  playerGroup.add(rightArmGroup);

  const legGeo = new THREE.BoxGeometry(0.35, 0.95, 0.35);
  leftLegMesh = new THREE.Mesh(legGeo, armorMat);
  leftLegMesh.position.set(-0.24, 0.48, 0);
  leftLegMesh.castShadow = true;
  playerGroup.add(leftLegMesh);

  rightLegMesh = new THREE.Mesh(legGeo, armorMat);
  rightLegMesh.position.set(0.24, 0.48, 0);
  rightLegMesh.castShadow = true;
  playerGroup.add(rightLegMesh);

  playerGroup.position.set(0, 0, 4);
  scene.add(playerGroup);
}

// --- HEALTH DROPS ---
function spawnHealthPickup(pos) {
  const group = new THREE.Group();
  const geo = new THREE.OctahedronGeometry(0.38);
  const mat = new THREE.MeshStandardMaterial({ color: 0x00e676, emissive: 0x00b0ff, metalness: 0.85, roughness: 0.2 });
  const mesh = new THREE.Mesh(geo, mat);
  mesh.position.y = 0.5;
  group.add(mesh);

  group.position.set(pos.x, 0, pos.z);
  scene.add(group);
  healthPickups.push({ group: group, mesh: mesh, life: 25.0 });
}

function updateHealthPickups(delta) {
  for (let i = healthPickups.length - 1; i >= 0; i--) {
    const pickup = healthPickups[i];
    pickup.mesh.rotation.y += 0.03;
    pickup.mesh.position.y = 0.5 + Math.sin(clock.getElapsedTime() * 4) * 0.12;
    pickup.life -= delta;

    if (playerGroup.position.distanceTo(pickup.group.position) < 1.6) {
      state.hp = Math.min(state.maxHp, state.hp + 25);
      playSound('heal');
      updateHUD();
      scene.remove(pickup.group);
      healthPickups.splice(i, 1);
      continue;
    }

    if (pickup.life <= 0) {
      scene.remove(pickup.group);
      healthPickups.splice(i, 1);
    }
  }
}

// --- COMBAT ACTIONS ---
function shootCrossbow() {
  if (isDead || !state.isGameStarted || state.inIntroSequence) return;
  const now = clock.getElapsedTime();
  if (now - lastRangedShotTime < 0.35) return;
  lastRangedShotTime = now;

  playSound('crossbow');
  leftArmGroup.position.z -= 0.12;
  setTimeout(() => { if (leftArmGroup) leftArmGroup.position.z += 0.12; }, 70);

  const spawnPos = new THREE.Vector3(playerGroup.position.x, 1.4, playerGroup.position.z);
  const dir = new THREE.Vector3(Math.sin(cameraYaw), 0, Math.cos(cameraYaw)).normalize();

  const arrowGeo = new THREE.CylinderGeometry(0.08, 0.08, 1.1, 8);
  const arrowMat = new THREE.MeshBasicMaterial({ color: 0xffeb3b });
  const arrow = new THREE.Mesh(arrowGeo, arrowMat);
  arrow.position.copy(spawnPos);
  arrow.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), dir);

  scene.add(arrow);
  playerProjectiles.push({ mesh: arrow, dir: dir, life: 1.6, speed: 0.85 });
}

function updatePlayerProjectiles(delta) {
  for (let i = playerProjectiles.length - 1; i >= 0; i--) {
    const p = playerProjectiles[i];
    p.mesh.position.addScaledVector(p.dir, p.speed);
    p.life -= delta;

    let hit = false;

    for (let k = enemyProjectiles.length - 1; k >= 0; k--) {
      const ep = enemyProjectiles[k];
      if (p.mesh.position.distanceTo(ep.mesh.position) < 0.9) {
        playSound('parry');
        scene.remove(ep.mesh);
        enemyProjectiles.splice(k, 1);
        scene.remove(p.mesh);
        playerProjectiles.splice(i, 1);
        hit = true;
        break;
      }
    }
    if (hit) continue;

    for (let j = enemies.length - 1; j >= 0; j--) {
      const enemy = enemies[j];
      const dx = p.mesh.position.x - enemy.position.x;
      const dz = p.mesh.position.z - enemy.position.z;
      const horizontalDist = Math.hypot(dx, dz);
      const verticalDist = Math.abs(p.mesh.position.y - (enemy.position.y + 0.8));

      if (horizontalDist <= enemy.userData.radius + 0.8 && verticalDist <= 2.2) {
        playSound('hit');
        const damageToApply = enemy.userData.isBoss ? state.rangedDmg * 0.65 : state.rangedDmg;
        enemy.userData.hp -= damageToApply;
        updateEnemyHpSprite(enemy.userData.hpSprite, enemy.userData.hp, enemy.userData.maxHp);

        enemy.userData.bodyMesh.material.emissive.setHex(0xffff55);
        setTimeout(() => {
          if (enemy.userData && enemy.userData.bodyMesh) {
            enemy.userData.bodyMesh.material.emissive.setHex(enemy.userData.isBoss ? 0x7f0000 : enemy.userData.baseEmissive);
          }
        }, 80);

        if (enemy.userData.hp <= 0) {
          state.essence += enemy.userData.isBoss ? 250 : 35;
          if (Math.random() < 0.28) spawnHealthPickup(enemy.position);
          autoSaveProfile();
          scene.remove(enemy);
          enemies.splice(j, 1);
          updateHUD();
        }

        hit = true;
        break;
      }
    }

    if (hit || p.life <= 0) {
      scene.remove(p.mesh);
      playerProjectiles.splice(i, 1);
    }
  }
}

function shootEnemyProjectile(fromPos, targetPos, colorHex = 0xff1744, speed = 0.32, projectileDmg = 20, isHoming = false) {
  const dir = new THREE.Vector3().subVectors(targetPos, fromPos);
  dir.y = 0;
  dir.normalize();

  const geo = isHoming ? new THREE.DodecahedronGeometry(0.4) : new THREE.SphereGeometry(0.3, 8, 8);
  const mat = new THREE.MeshBasicMaterial({ color: colorHex });
  const proj = new THREE.Mesh(geo, mat);
  proj.position.set(fromPos.x, 1.4, fromPos.z);
  proj.userData = { dmg: projectileDmg, isHoming: isHoming };

  scene.add(proj);
  enemyProjectiles.push({ mesh: proj, dir: dir, speed: speed, life: isHoming ? 4.5 : 3.5 });
}

function updateEnemyProjectiles(delta) {
  for (let i = enemyProjectiles.length - 1; i >= 0; i--) {
    const p = enemyProjectiles[i];

    if (p.mesh.userData.isHoming) {
      const targetDir = new THREE.Vector3().subVectors(playerGroup.position, p.mesh.position);
      targetDir.y = 0;
      targetDir.normalize();
      p.dir.lerp(targetDir, 0.04);
    }

    p.mesh.position.addScaledVector(p.dir, p.speed);
    p.life -= delta;

    if (state.spawnImmunityTimer <= 0 && state.currentZone !== 'The Sanctuary (Hub)') {
      const playerChestPos = new THREE.Vector3(playerGroup.position.x, playerGroup.position.y + 1.4, playerGroup.position.z);
      const distToPlayer = p.mesh.position.distanceTo(playerChestPos);

      if (distToPlayer < 1.3) {
        triggerDamageFlash();
        playSound('player_hurt');
        const baseDmg = p.mesh.userData.dmg || 20;
        const dmg = baseDmg * (1.0 - state.defense);
        state.hp -= dmg;
        updateHUD();

        playerGroup.position.y += 0.1;
        scene.remove(p.mesh);
        enemyProjectiles.splice(i, 1);

        if (state.hp <= 0 && !isDead) handleDeath();
        continue;
      }
    }

    if (p.life <= 0) {
      scene.remove(p.mesh);
      enemyProjectiles.splice(i, 1);
    }
  }
}

function triggerDamageFlash() {
  const flash = document.getElementById('damage-flash');
  flash.classList.remove('hidden');
  setTimeout(() => flash.classList.add('hidden'), 120);
}

// FAIR SHOCKWAVE (Must be jumped over with space!)
function triggerBossShockwave(pos, waveDamage = 50) {
  if (state.currentZone === 'The Sanctuary (Hub)') return; // Skydd mot spökskada

  const ringGeo = new THREE.RingGeometry(0.8, 1.4, 32);
  const ringMat = new THREE.MeshBasicMaterial({ color: 0xff1744, side: THREE.DoubleSide, transparent: true, opacity: 0.95 });
  const ring = new THREE.Mesh(ringGeo, ringMat);
  ring.rotation.x = -Math.PI / 2;
  ring.position.set(pos.x, 0.05, pos.z);
  ring.userData = { dmg: waveDamage };

  scene.add(ring);
  shockwaves.push({ mesh: ring, radius: 1.0, maxRadius: 36, growthSpeed: 10.0 });
}

function updateShockwaves(delta) {
  for (let i = shockwaves.length - 1; i >= 0; i--) {
    const sw = shockwaves[i];
    sw.radius += sw.growthSpeed * delta;
    sw.mesh.scale.set(sw.radius, sw.radius, 1);
    sw.mesh.material.opacity = Math.max(0, 1.0 - (sw.radius / sw.maxRadius));

    const distToCenter = Math.hypot(playerGroup.position.x - sw.mesh.position.x, playerGroup.position.z - sw.mesh.position.z);
    
    // SAFE IF IN AIR OR IF IN HUB
    if (Math.abs(distToCenter - sw.radius) < 1.3 && state.spawnImmunityTimer <= 0 && state.currentZone !== 'The Sanctuary (Hub)') {
      if (playerGroup.position.y < 0.18) {
        triggerDamageFlash();
        playSound('player_hurt');
        const rawDmg = sw.mesh.userData.dmg || 50;
        const dmg = rawDmg * (1.0 - state.defense);
        state.hp -= dmg;
        updateHUD();

        playerVelocityY = 0.2;
        const knockDir = new THREE.Vector3().subVectors(playerGroup.position, sw.mesh.position).normalize();
        playerGroup.position.addScaledVector(knockDir, 2.5);

        sw.radius = sw.maxRadius;
        if (state.hp <= 0 && !isDead) handleDeath();
      }
    }

    if (sw.radius >= sw.maxRadius) {
      scene.remove(sw.mesh);
      shockwaves.splice(i, 1);
    }
  }
}

// BOSS ATTACK 2: TRIPLE LIGHTNING STRIKES
function triggerTripleLightning(targetPos, strikeDamage = 45) {
  for (let i = 0; i < 3; i++) {
    const offsetAngle = (i / 3) * Math.PI * 2;
    const strikePos = {
      x: targetPos.x + Math.cos(offsetAngle) * (i === 0 ? 0 : 3.5),
      z: targetPos.z + Math.sin(offsetAngle) * (i === 0 ? 0 : 3.5)
    };

    const circleGeo = new THREE.CircleGeometry(2.2, 32);
    const circleMat = new THREE.MeshBasicMaterial({ color: 0xff1744, transparent: true, opacity: 0.55, side: THREE.DoubleSide });
    const circle = new THREE.Mesh(circleGeo, circleMat);
    circle.rotation.x = -Math.PI / 2;
    circle.position.set(strikePos.x, 0.04, strikePos.z);
    circle.userData = { dmg: strikeDamage };

    scene.add(circle);
    lightningTelegraphs.push({ mesh: circle, x: strikePos.x, z: strikePos.z, timer: 1.4 + (i * 0.2) });
  }
}

function updateLightning(delta) {
  for (let i = lightningTelegraphs.length - 1; i >= 0; i--) {
    const lt = lightningTelegraphs[i];
    lt.timer -= delta;
    lt.mesh.material.opacity = 0.4 + Math.sin(clock.getElapsedTime() * 15) * 0.3;

    if (lt.timer <= 0) {
      const boltGeo = new THREE.CylinderGeometry(0.3, 0.3, 20, 8);
      const boltMat = new THREE.MeshBasicMaterial({ color: 0x00e5ff });
      const bolt = new THREE.Mesh(boltGeo, boltMat);
      bolt.position.set(lt.x, 10, lt.z);
      scene.add(bolt);

      setTimeout(() => scene.remove(bolt), 150);

      const dist = Math.hypot(playerGroup.position.x - lt.x, playerGroup.position.z - lt.z);
      if (dist <= 2.2 && state.spawnImmunityTimer <= 0 && state.currentZone !== 'The Sanctuary (Hub)') {
        triggerDamageFlash();
        playSound('player_hurt');
        const rawDmg = lt.mesh.userData.dmg || 45;
        const dmg = rawDmg * (1.0 - state.defense);
        state.hp -= dmg;
        updateHUD();
        if (state.hp <= 0 && !isDead) handleDeath();
      }

      scene.remove(lt.mesh);
      lightningTelegraphs.splice(i, 1);
    }
  }
}

// BOSS ATTACK 4: VOID VORTEX PULL
function handleVoidVortexPull(bossPos, delta) {
  if (!vortexPullActive || state.spawnImmunityTimer > 0 || state.currentZone === 'The Sanctuary (Hub)') return;
  const toBoss = new THREE.Vector3().subVectors(bossPos, playerGroup.position);
  toBoss.y = 0;
  const dist = toBoss.length();

  if (dist > 2.0 && dist < 24) {
    toBoss.normalize();
    playerGroup.position.addScaledVector(toBoss, 0.07);
  }
}

function createEnemyHpSprite() {
  const canvas = document.createElement('canvas');
  canvas.width = 128;
  canvas.height = 16;
  const ctx = canvas.getContext('2d');
  ctx.fillStyle = '#b71c1c';
  ctx.fillRect(0, 0, 128, 16);
  ctx.fillStyle = '#00e676';
  ctx.fillRect(0, 0, 128, 16);

  const texture = new THREE.CanvasTexture(canvas);
  const spriteMat = new THREE.SpriteMaterial({ map: texture, depthTest: false });
  const sprite = new THREE.Sprite(spriteMat);
  sprite.scale.set(2.0, 0.25, 1.0);
  sprite.userData = { canvas, ctx, texture };
  return sprite;
}

function updateEnemyHpSprite(sprite, currentHp, maxHp) {
  const { canvas, ctx, texture } = sprite.userData;
  const pct = Math.max(0, currentHp / maxHp);
  ctx.fillStyle = '#b71c1c';
  ctx.fillRect(0, 0, 128, 16);
  ctx.fillStyle = '#00e676';
  ctx.fillRect(0, 0, 128 * pct, 16);
  texture.needsUpdate = true;
}

// --- ENEMY SPAWNING ---
function spawnEnemiesForLevel(level) {
  clearEnemies();
  clearProjectiles();
  clearAllBossTimeouts();
  state.isArenaCleared = false;
  vortexPullActive = false;
  document.getElementById('cleared-prompt').classList.add('hidden');

  state.spawnImmunityTimer = 2.0;
  const graceBanner = document.getElementById('grace-banner');
  graceBanner.classList.remove('hidden');

  const isBoss = (level === 5);
  const threatScaleHp = 1.0 + ((state.threatLevel - 1) * 0.40);
  const threatScaleDmg = 1.0 + ((state.threatLevel - 1) * 0.35);

  const count = isBoss ? 1 : Math.max(3, 2 + level + Math.floor(state.threatLevel * 0.5));

  const realmLore = state.activeRunLore || {
    realmType: 'fire',
    bossClass: 'slammer',
    archetype: { colorHex: 0xd84315, emissiveHex: 0xbf360c }
  };

  for (let i = 0; i < count; i++) {
    const group = new THREE.Group();

    let enemyRole = 'brawler';
    if (!isBoss) {
      if (i === 1) enemyRole = 'sniper';
      else if (i === 2 && level >= 2) enemyRole = 'charger';
      else if (i === 3 && level >= 3) enemyRole = 'shaman';
    }

    let scale = isBoss ? 2.8 : 1.0;
    let bodyGeo;
    let bodyMat;

    if (isBoss) {
      bodyGeo = new THREE.BoxGeometry(0.9 * scale, 1.4 * scale, 0.85 * scale);
      bodyMat = new THREE.MeshStandardMaterial({ color: 0xb71c1c, emissive: 0x7f0000, roughness: 0.4 });
    } else if (enemyRole === 'brawler') {
      bodyGeo = new THREE.BoxGeometry(1.1, 1.3, 0.9);
      bodyMat = new THREE.MeshStandardMaterial({ color: realmLore.archetype.colorHex, emissive: realmLore.archetype.emissiveHex, roughness: 0.5 });
    } else if (enemyRole === 'sniper') {
      scale = 0.85;
      bodyGeo = new THREE.CylinderGeometry(0.35, 0.45, 1.6, 8);
      bodyMat = new THREE.MeshStandardMaterial({ color: 0x00838f, emissive: 0x004d40, roughness: 0.3 });
    } else if (enemyRole === 'charger') {
      scale = 1.1;
      bodyGeo = new THREE.BoxGeometry(1.4, 0.8, 1.6);
      bodyMat = new THREE.MeshStandardMaterial({ color: 0xe65100, emissive: 0xbf360c, roughness: 0.6 });
    } else {
      scale = 0.9;
      bodyGeo = new THREE.OctahedronGeometry(0.8);
      bodyMat = new THREE.MeshStandardMaterial({ color: 0x7b1fa2, emissive: 0x4a148c, roughness: 0.2 });
    }

    const body = new THREE.Mesh(bodyGeo, bodyMat);
    body.position.y = (1.35 * scale) / 2;
    body.castShadow = true;
    group.add(body);

    const eyeGeo = new THREE.BoxGeometry(0.16 * scale, 0.09 * scale, 0.1 * scale);
    const eyeColor = isBoss ? 0xffff00 : (enemyRole === 'shaman' ? 0xe040fb : (enemyRole === 'charger' ? 0xff3d00 : 0x00e5ff));
    const eyeMat = new THREE.MeshBasicMaterial({ color: eyeColor });
    const eyeL = new THREE.Mesh(eyeGeo, eyeMat);
    eyeL.position.set(-0.22 * scale, 1.05 * scale, 0.42 * scale);
    const eyeR = new THREE.Mesh(eyeGeo, eyeMat);
    eyeR.position.set(0.22 * scale, 1.05 * scale, 0.42 * scale);
    group.add(eyeL);
    group.add(eyeR);

    const hpSprite = createEnemyHpSprite();
    hpSprite.position.y = (1.4 * scale) + 0.6;
    group.add(hpSprite);

    const angle = Math.random() * Math.PI * 2;
    const dist = isBoss ? 16 : 10 + Math.random() * 11;
    group.position.set(Math.cos(angle) * dist, 0, Math.sin(angle) * dist);

    const baseHp = isBoss ? (750 * threatScaleHp) : ((40 + (level * 16)) * threatScaleHp);
    const baseDmg = (16 + (level * 2.5)) * threatScaleDmg * state.modifierEnemyDmg;

    group.userData = {
      isBoss: isBoss,
      role: enemyRole,
      bossClass: realmLore.bossClass || 'slammer',
      hp: baseHp,
      maxHp: baseHp,
      speed: (isBoss ? 0.034 : (enemyRole === 'charger' ? 0.048 : (enemyRole === 'sniper' ? 0.026 : 0.036))) * state.modifierEnemySpeed,
      damage: Math.round(baseDmg),
      attackCooldown: 1.5,
      specialAttackTimer: 3.5,
      chargeTimer: 3.5,
      jumpState: 'ground',
      isDashing: false,
      bodyMesh: body,
      baseEmissive: bodyMat.emissive.getHex(),
      hpSprite: hpSprite,
      radius: 0.65 * scale
    };

    scene.add(group);
    enemies.push(group);
  }
}

function clearEnemies() {
  enemies.forEach(e => scene.remove(e));
  enemies = [];
}

function clearProjectiles() {
  playerProjectiles.forEach(p => scene.remove(p.mesh));
  playerProjectiles = [];
  enemyProjectiles.forEach(p => scene.remove(p.mesh));
  enemyProjectiles = [];
  shockwaves.forEach(s => scene.remove(s.mesh));
  shockwaves = [];
  lightningTelegraphs.forEach(l => scene.remove(l.mesh));
  lightningTelegraphs = [];
  healthPickups.forEach(h => scene.remove(h.group));
  healthPickups = [];
}

// PURE NATURAL STONE ARENA FLOOR
function createOrganicRunicGround(colorHex = 0x14131c, radius = 34) {
  if (groundMesh) scene.remove(groundMesh);

  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 512;
  const ctx = canvas.getContext('2d');

  const baseCol = new THREE.Color(colorHex);
  ctx.fillStyle = '#' + baseCol.getHexString();
  ctx.fillRect(0, 0, 512, 512);

  ctx.fillStyle = 'rgba(0, 0, 0, 0.15)';
  for (let i = 0; i < 3000; i++) {
    const rx = Math.random() * 512;
    const ry = Math.random() * 512;
    ctx.fillRect(rx, ry, Math.random() * 3 + 1, Math.random() * 3 + 1);
  }

  ctx.fillStyle = 'rgba(255, 255, 255, 0.03)';
  for (let i = 0; i < 1500; i++) {
    const rx = Math.random() * 512;
    const ry = Math.random() * 512;
    ctx.fillRect(rx, ry, Math.random() * 2 + 1, Math.random() * 2 + 1);
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(12, 12);

  const geo = new THREE.CircleGeometry(radius, 64);
  const mat = new THREE.MeshStandardMaterial({
    map: texture,
    roughness: 0.85,
    metalness: 0.1
  });

  groundMesh = new THREE.Mesh(geo, mat);
  groundMesh.rotation.x = -Math.PI / 2;
  groundMesh.receiveShadow = true;
  scene.add(groundMesh);
}

function clearArenaStructures() {
  arenaStructures.forEach(s => scene.remove(s));
  arenaStructures = [];
}

function spawnArenaPerimeterAndPillars(wallRadius = 32, pillarColor = 0x1f1b33) {
  clearArenaStructures();

  const rockGeo = new THREE.DodecahedronGeometry(3.5, 1);
  const rockMat = new THREE.MeshStandardMaterial({ color: 0x141220, roughness: 0.9 });
  const rockCount = 28;

  for (let i = 0; i < rockCount; i++) {
    const angle = (i / rockCount) * Math.PI * 2;
    const x = Math.cos(angle) * wallRadius;
    const z = Math.sin(angle) * wallRadius;

    const rock = new THREE.Mesh(rockGeo, rockMat);
    rock.position.set(x, 2.5, z);
    rock.rotation.set(Math.random() * Math.PI, Math.random() * Math.PI, Math.random() * Math.PI);
    rock.scale.set(1 + Math.random() * 0.5, 2 + Math.random() * 1.5, 1 + Math.random() * 0.5);
    rock.castShadow = true;
    rock.receiveShadow = true;
    scene.add(rock);
    arenaStructures.push(rock);

    solidColliders.push({ x: x, z: z, radius: 2.8 });
  }

  const pillarGeo = new THREE.CylinderGeometry(1.4, 1.6, 9, 10);
  const pillarMat = new THREE.MeshStandardMaterial({ color: pillarColor, roughness: 0.7, metalness: 0.3 });
  const innerRadius = wallRadius * 0.78;
  const pillarCount = 8;

  for (let i = 0; i < pillarCount; i++) {
    const angle = (i / pillarCount) * Math.PI * 2;
    const x = Math.cos(angle) * innerRadius;
    const z = Math.sin(angle) * innerRadius;

    const pillar = new THREE.Mesh(pillarGeo, pillarMat);
    pillar.position.set(x, 4.5, z);
    pillar.castShadow = true;
    pillar.receiveShadow = true;
    scene.add(pillar);
    arenaStructures.push(pillar);

    const torchGeo = new THREE.SphereGeometry(0.35, 8, 8);
    const torchMat = new THREE.MeshBasicMaterial({ color: 0xffb300 });
    const torch = new THREE.Mesh(torchGeo, torchMat);
    torch.position.set(x * 0.92, 7.5, z * 0.92);
    scene.add(torch);
    arenaStructures.push(torch);

    solidColliders.push({ x: x, z: z, radius: 1.8 });
  }
}

function buildSanctuary() {
  clearAllBossTimeouts(); // Rensar alla timers så ingen spökskada kan ske!
  clearProjectiles();

  playAdaptiveMusic('hub');
  state.currentZone = 'The Sanctuary (Hub)';
  state.arenaLevel = 0;
  state.hp = state.maxHp;
  state.isArenaCleared = false;
  state.spawnImmunityTimer = 0;
  vortexPullActive = false;
  isDead = false;

  clearEnemies();
  solidColliders = [];

  document.getElementById('boss-banner').classList.add('hidden');
  document.getElementById('ai-banner').classList.add('hidden');
  document.getElementById('interaction-prompt').classList.add('hidden');
  document.getElementById('cleared-prompt').classList.add('hidden');
  document.getElementById('grace-banner').classList.add('hidden');
  document.getElementById('death-screen').classList.add('hidden');
  document.getElementById('victory-screen').classList.add('hidden');
  document.getElementById('low-hp-vignette').classList.add('hidden');

  scene.background = new THREE.Color(0x100d20);
  scene.fog.color = new THREE.Color(0x100d20);
  directionalLight.color = new THREE.Color(0xd7c4f2);

  createOrganicRunicGround(0x18142a, 32);
  spawnArenaPerimeterAndPillars(30, 0x272042);

  if (!altarMesh) {
    const altarGroup = new THREE.Group();
    const baseGeo = new THREE.CylinderGeometry(2.0, 2.3, 1.2, 8);
    const baseMat = new THREE.MeshStandardMaterial({ color: 0x392b58, roughness: 0.6 });
    const base = new THREE.Mesh(baseGeo, baseMat);
    base.position.y = 0.6;
    base.castShadow = true;
    base.receiveShadow = true;
    altarGroup.add(base);

    const crystalGeo = new THREE.OctahedronGeometry(0.7);
    const crystalMat = new THREE.MeshStandardMaterial({ color: 0xba68c8, emissive: 0x7b1fa2, metalness: 0.8 });
    const crystal = new THREE.Mesh(crystalGeo, crystalMat);
    crystal.position.y = 2.2;
    crystal.name = 'altarCrystal';
    altarGroup.add(crystal);

    altarMesh = altarGroup;
    altarMesh.position.set(-10, 0, 0);
    scene.add(altarMesh);
  }
  altarMesh.visible = true;
  solidColliders.push({ x: -10, z: 0, radius: 2.2 });

  if (!portalGroup) {
    portalGroup = new THREE.Group();
    const frameGeo = new THREE.TorusGeometry(3.0, 0.4, 16, 64);
    const frameMat = new THREE.MeshStandardMaterial({ color: 0xd4af37, metalness: 0.9, roughness: 0.15 });
    const frame = new THREE.Mesh(frameGeo, frameMat);
    frame.position.y = 3.2;
    frame.castShadow = true;
    portalGroup.add(frame);

    const vortexGeo = new THREE.CircleGeometry(2.8, 32);
    const vortexMat = new THREE.MeshBasicMaterial({ color: 0x00e5ff, side: THREE.DoubleSide, transparent: true, opacity: 0.75 });
    const vortex = new THREE.Mesh(vortexGeo, vortexMat);
    vortex.position.y = 3.2;
    portalGroup.add(vortex);

    portalGroup.position.set(14, 0, 0);
    portalGroup.rotation.y = -Math.PI / 2;
    scene.add(portalGroup);
  }
  portalGroup.visible = true;
  portalGroup.position.set(14, 0, 0);
  solidColliders.push({ x: 14, z: 0, radius: 1.2 });

  if (playerGroup) {
    playerGroup.position.set(0, 0, 4);
    playerVelocityY = 0;
  }
  updateHUD();
}

function buildArenaForCurrentZone() {
  clearAllBossTimeouts();

  if (state.arenaLevel === 5) playAdaptiveMusic('boss');
  else playAdaptiveMusic('arena');

  if (altarMesh) altarMesh.visible = false;
  if (portalGroup) portalGroup.visible = false;
  document.getElementById('interaction-prompt').classList.add('hidden');
  document.getElementById('cleared-prompt').classList.add('hidden');

  solidColliders = [];

  const lore = state.activeRunLore;
  const baseColor = parseInt(lore.realmColorHex.replace('#', '0x'));
  const lightColor = parseInt(lore.lightColorHex.replace('#', '0x'));

  const zoneTint = (state.arenaLevel - 1) * 0x040404;
  const adjustedColor = Math.max(0x161622, baseColor - zoneTint);

  scene.background = new THREE.Color(adjustedColor);
  scene.fog.color = new THREE.Color(adjustedColor);
  directionalLight.color = new THREE.Color(lightColor);

  createOrganicRunicGround(adjustedColor, 34);
  spawnArenaPerimeterAndPillars(32, adjustedColor);

  playerGroup.position.set(0, 0, 18);
  playerVelocityY = 0;

  if (lore && lore.zoneNames && lore.zoneNames[state.arenaLevel - 1]) {
    const chamberTitle = lore.zoneNames[state.arenaLevel - 1];
    document.getElementById('ai-realm-title').innerText = `${lore.realmName} — ${chamberTitle}`;
    document.getElementById('ai-banner').classList.remove('hidden');
    document.getElementById('ai-banner').style.opacity = '1';
    if (aiBannerTimeout) clearTimeout(aiBannerTimeout);
    aiBannerTimeout = setTimeout(() => {
      document.getElementById('ai-banner').style.opacity = '0';
      setTimeout(() => document.getElementById('ai-banner').classList.add('hidden'), 1000);
    }, 5000);
  }

  spawnEnemiesForLevel(state.arenaLevel);
}

// --- GENERATIVE AI ---
async function triggerGenAIRun() {
  document.getElementById('interaction-prompt').classList.add('hidden');
  const banner = document.getElementById('ai-banner');
  banner.style.opacity = '1';
  banner.classList.remove('hidden');

  document.getElementById('ai-realm-title').innerText = "Weaving Realm Fate...";
  document.getElementById('ai-realm-lore').innerText = "Consulting the Generative AI Oracle...";

  if (aiBannerTimeout) clearTimeout(aiBannerTimeout);

  const prompt = `You are a Norse mythology fate weaver for a Valhalla roguelite dungeon. Randomly choose one realm archetype (fire, ice, shadow, or light), generate 5 unique chamber titles, and randomly choose one boss class from ["slammer", "lightning", "archer", "vortex"]. Return ONLY valid JSON:
  {
    "realmName": "Unique title",
    "realmType": "fire or ice or shadow or light",
    "realmColorHex": "#351408",
    "lightColorHex": "#ff7043",
    "zoneNames": ["Chamber 1", "Chamber 2", "Chamber 3", "Chamber 4", "Boss Chamber"],
    "modifierText": "+20% Enemy Aggression",
    "speedMult": 1.05,
    "dmgMult": 1.1,
    "lore": "One dramatic sentence of realm lore.",
    "archetype": {
      "colorHex": 14423040,
      "emissiveHex": 9830400
    },
    "bossName": "Epic Boss Title",
    "bossClass": "slammer or lightning or archer or vortex",
    "bossTaunt": "One fierce taunting sentence."
  }`;

  if (state.geminiApiKey) {
    try {
      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${state.geminiApiKey}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] })
      });
      const data = await response.json();
      let rawText = data.candidates[0].content.parts[0].text;
      rawText = rawText.replace(/```json/g, '').replace(/```/g, '').trim();
      const parsed = JSON.parse(rawText);
      applyAITheme(parsed);
      return;
    } catch (err) {
      console.warn("Gemini API error, activating procedural fallback.", err);
    }
  }

  // 4 Balanced Distinct Realms (25% Probability Each) & 4 Bosses
  setTimeout(() => {
    const proceduralRealms = [
      {
        realmName: "Muspelheim: Core of Embers",
        realmType: "fire",
        realmColorHex: "#351408",
        lightColorHex: "#ff7043",
        zoneNames: ["The Magma Gates", "Obsidian Crucible", "Pyroclastic Rift", "Infernal Threshold", "Surtr's Throne Room"],
        modifierText: "+15% Fiery Slam Power",
        speedMult: 1.05,
        dmgMult: 1.15,
        lore: "Primordial magma cracks the stone, fueling the rage of Surtr's spawn.",
        archetype: { colorHex: 0xd84315, emissiveHex: 0xbf360c },
        bossName: "Surtr's Infernal Executioner",
        bossClass: "slammer",
        bossTaunt: "Bask in the inferno, mortal. Your bones will forge my next hammer!"
      },
      {
        realmName: "Niflheim: The Shivering Abyss",
        realmType: "ice",
        realmColorHex: "#0c2838",
        lightColorHex: "#40c4ff",
        zoneNames: ["Frozen Threshold", "Glacial Catacombs", "Mist of Tears", "Howling Chasm", "Ymir's Frigid Summit"],
        modifierText: "+20% Swift Frost Snipers",
        speedMult: 1.15,
        dmgMult: 1.0,
        lore: "Piercing frost numbs your flesh, wrapping your soul in eternal winter.",
        archetype: { colorHex: 0x00838f, emissiveHex: 0x006064 },
        bossName: "Ymir's Storm Sovereign",
        bossClass: "lightning",
        bossTaunt: "The heavens obey my call. Suffer the wrath of the freezing thunder!"
      },
      {
        realmName: "Helheim: Catacombs of Oblivion",
        realmType: "shadow",
        realmColorHex: "#142614",
        lightColorHex: "#81c784",
        zoneNames: ["Gravekeeper's Gate", "The Weeping Crypts", "Hall of Dishonored Souls", "Catacombs of Despair", "The Obsidian Throne"],
        modifierText: "+15% Spectral Projectiles",
        speedMult: 1.08,
        dmgMult: 1.12,
        lore: "The dishonored dead grasp from beneath the stone, craving the warmth of life.",
        archetype: { colorHex: 0x2e7d32, emissiveHex: 0x1b5e20 },
        bossName: "Nidhoggr's Phantom Archer",
        bossClass: "archer",
        bossTaunt: "No soul can outrun my black arrows into the void!"
      },
      {
        realmName: "Alfheim: The Gilded Sun Temple",
        realmType: "light",
        realmColorHex: "#2b2608",
        lightColorHex: "#ffd54f",
        zoneNames: ["Sunlit Threshold", "Sanctum of the Elves", "Luminous Gallery", "Hall of the Solaris", "Chamber of the Void Beast"],
        modifierText: "+18% Gravitational Fury",
        speedMult: 1.1,
        dmgMult: 1.1,
        lore: "Ancient light reflects off divine gold, hiding primordial gravitational beasts.",
        archetype: { colorHex: 0xfbc02d, emissiveHex: 0xf57f17 },
        bossName: "Fenrir's Void Colossus",
        bossClass: "vortex",
        bossTaunt: "The sun will be devoured, and you shall be pulled into my gaping maw!"
      }
    ];

    const picked = proceduralRealms[Math.floor(Math.random() * proceduralRealms.length)];
    applyAITheme(picked);
  }, 400);
}

function applyAITheme(theme) {
  state.activeRunLore = theme;
  state.modifierEnemySpeed = theme.speedMult || 1.05;
  state.modifierEnemyDmg = theme.dmgMult || 1.1;

  document.getElementById('ai-realm-title').innerText = theme.realmName;
  document.getElementById('ai-realm-lore').innerText = `"${theme.lore}"`;
  document.getElementById('ai-realm-modifier').innerText = `Active Modifier: ${theme.modifierText}`;

  const banner = document.getElementById('ai-banner');
  banner.style.opacity = '1';
  aiBannerTimeout = setTimeout(() => {
    banner.style.opacity = '0';
    setTimeout(() => banner.classList.add('hidden'), 1000);
  }, 6000);

  state.arenaLevel = 1;
  state.currentZone = `Trial: Arena 1/5`;
  buildArenaForCurrentZone();
  updateHUD();
}

// --- MAIN LOOP ---
function animate() {
  requestAnimationFrame(animate);
  const delta = clock.getDelta();
  const now = clock.getElapsedTime();

  checkHeartbeat(now);
  updateParticles(delta);

  if (state.inIntroSequence) {
    introOrbitAngle += delta * 0.35;
    camera.position.x = Math.sin(introOrbitAngle) * 16;
    camera.position.y = 8 + Math.sin(introOrbitAngle * 0.5) * 2;
    camera.position.z = Math.cos(introOrbitAngle) * 16;
    camera.lookAt(0, 2, 0);
    renderer.render(scene, camera);
    return;
  }

  if (state.spawnImmunityTimer > 0) {
    state.spawnImmunityTimer -= delta;
    if (state.spawnImmunityTimer <= 0) {
      document.getElementById('grace-banner').classList.add('hidden');
    }
  }

  if (!isDead && state.isGameStarted) {
    updatePlayerPhysics();
    updatePlayerMovement(delta);
    updatePlayerProjectiles(delta);
    updateEnemyProjectiles(delta);
    updateHealthPickups(delta);
    updateShockwaves(delta);
    updateLightning(delta);
    updateEnemies(delta);
    updateInteractions();
  }
  updateCameraAndPlayerAim();

  if (altarMesh && state.currentZone === 'The Sanctuary (Hub)') {
    const crystal = altarMesh.getObjectByName('altarCrystal');
    if (crystal) {
      crystal.rotation.y += 0.02;
      crystal.position.y = 2.2 + Math.sin(now * 2) * 0.12;
    }
  }

  if (isAttacking) {
    attackTimer += delta * 12;
    rightArmGroup.rotation.x = -0.8 + Math.sin(attackTimer) * 2.2;
    rightArmGroup.rotation.z = -Math.sin(attackTimer) * 0.4;

    if (attackTimer >= Math.PI) {
      isAttacking = false;
      attackTimer = 0;
      rightArmGroup.rotation.x = 0;
      rightArmGroup.rotation.z = 0;
    }
  }

  renderer.render(scene, camera);
}

// --- CAMERA ---
function updateCameraAndPlayerAim() {
  if (!playerGroup) return;

  playerGroup.rotation.y = cameraYaw;

  const horizontalDistance = cameraDistance * Math.cos(cameraPitch);
  const verticalDistance = cameraDistance * Math.sin(cameraPitch);

  const targetX = playerGroup.position.x - (horizontalDistance * Math.sin(cameraYaw));
  const targetY = playerGroup.position.y + cameraHeight + verticalDistance;
  const targetZ = playerGroup.position.z - (horizontalDistance * Math.cos(cameraYaw));

  camera.position.set(targetX, targetY, targetZ);
  camera.lookAt(playerGroup.position.x, playerGroup.position.y + 1.6, playerGroup.position.z);
}

// --- MOVEMENT & COLLISION ---
function updatePlayerPhysics() {
  if (!playerGroup) return;

  playerVelocityY += GRAVITY;
  playerGroup.position.y += playerVelocityY;

  if (playerGroup.position.y <= 0) {
    playerGroup.position.y = 0;
    playerVelocityY = 0;
    isGrounded = true;
  } else {
    isGrounded = false;
  }
}

function updatePlayerMovement(delta) {
  if (!playerGroup) return;

  state.speed = keys.shift ? state.baseSpeed * 1.45 : state.baseSpeed;

  const forwardX = Math.sin(cameraYaw);
  const forwardZ = Math.cos(cameraYaw);
  const rightX = Math.sin(cameraYaw + Math.PI / 2);
  const rightZ = Math.cos(cameraYaw + Math.PI / 2);

  let moveX = 0;
  let moveZ = 0;

  if (keys.w) { moveX += forwardX; moveZ += forwardZ; }
  if (keys.s) { moveX -= forwardX; moveZ -= forwardZ; }
  if (keys.d) { moveX -= rightX;   moveZ -= rightZ; }
  if (keys.a) { moveX += rightX;   moveZ += rightZ; }

  const len = Math.hypot(moveX, moveZ);
  if (len > 0) {
    walkCycleTimer += delta * (keys.shift ? 15 : 10);
    leftLegMesh.rotation.x = Math.sin(walkCycleTimer) * 0.5;
    rightLegMesh.rotation.x = -Math.sin(walkCycleTimer) * 0.5;

    moveX = (moveX / len) * state.speed;
    moveZ = (moveZ / len) * state.speed;

    const nextX = playerGroup.position.x + moveX;
    const nextZ = playerGroup.position.z + moveZ;

    let blocked = false;
    const playerRadius = 0.6;
    for (let c of solidColliders) {
      if (Math.hypot(nextX - c.x, nextZ - c.z) < c.radius + playerRadius) {
        blocked = true;
        break;
      }
    }
    if (!blocked) {
      playerGroup.position.x = nextX;
      playerGroup.position.z = nextZ;
    }
  } else {
    leftLegMesh.rotation.x = 0;
    rightLegMesh.rotation.x = 0;
  }
}

// --- MELEE COMBAT ---
function triggerMeleeAttack() {
  if (isAttacking || isDead || !state.isGameStarted || state.inIntroSequence) return;
  isAttacking = true;
  attackTimer = 0;
  playSound('sword');

  const hitRange = 3.6;
  const attackArc = Math.PI * 0.75;

  for (let i = enemies.length - 1; i >= 0; i--) {
    const enemy = enemies[i];
    const dist = playerGroup.position.distanceTo(enemy.position);

    if (dist <= hitRange) {
      const toEnemy = new THREE.Vector3().subVectors(enemy.position, playerGroup.position).normalize();
      const playerForward = new THREE.Vector3(Math.sin(playerGroup.rotation.y), 0, Math.cos(playerGroup.rotation.y));
      const angle = playerForward.angleTo(toEnemy);

      if (angle <= attackArc / 2) {
        playSound('hit');
        enemy.userData.hp -= state.attackDmg;
        updateEnemyHpSprite(enemy.userData.hpSprite, enemy.userData.hp, enemy.userData.maxHp);

        enemy.userData.bodyMesh.material.emissive.setHex(0xffffff);
        setTimeout(() => {
          if (enemy.userData && enemy.userData.bodyMesh) {
            enemy.userData.bodyMesh.material.emissive.setHex(enemy.userData.isBoss ? 0x7f0000 : enemy.userData.baseEmissive);
          }
        }, 100);

        if (enemy.userData.hp <= 0) {
          state.essence += enemy.userData.isBoss ? 250 : 35;
          if (Math.random() < 0.28) spawnHealthPickup(enemy.position);
          autoSaveProfile();
          scene.remove(enemy);
          enemies.splice(i, 1);
          updateHUD();
        }
      }
    }
  }
}

// --- ENEMY AI ---
function updateEnemies(delta) {
  if (state.currentZone === 'The Sanctuary (Hub)') return;

  const threatScaleDmg = 1.0 + ((state.threatLevel - 1) * 0.35);

  for (let i = 0; i < enemies.length; i++) {
    const enemy = enemies[i];

    if (enemy.userData.attackCooldown > 0) {
      enemy.userData.attackCooldown -= delta;
    }

    // BOSS AI
    if (enemy.userData.isBoss) {
      enemy.userData.specialAttackTimer -= delta;

      // 1. SLAMMER BOSS
      if (enemy.userData.bossClass === 'slammer') {
        if (enemy.userData.specialAttackTimer <= 0 && enemy.userData.jumpState === 'ground') {
          enemy.userData.jumpState = 'jumping';
          enemy.userData.jumpVelocity = 0.36;
        }

        if (enemy.userData.jumpState === 'jumping') {
          enemy.position.y += enemy.userData.jumpVelocity;
          enemy.userData.jumpVelocity -= 0.015;

          if (enemy.position.y <= 0) {
            enemy.position.y = 0;
            enemy.userData.jumpState = 'ground';
            enemy.userData.specialAttackTimer = 5.0;
            triggerBossShockwave(enemy.position, Math.round(50 * threatScaleDmg));
          }
        }
      }
      // 2. LIGHTNING BOSS
      else if (enemy.userData.bossClass === 'lightning') {
        if (enemy.userData.specialAttackTimer <= 0) {
          enemy.userData.specialAttackTimer = 4.0;
          triggerTripleLightning(playerGroup.position, Math.round(45 * threatScaleDmg));
        }
      }
      // 3. ARCHER BOSS
      else if (enemy.userData.bossClass === 'archer') {
        if (enemy.userData.specialAttackTimer <= 0 && state.spawnImmunityTimer <= 0) {
          enemy.userData.specialAttackTimer = 3.2;
          const projDmg = Math.round(22 * threatScaleDmg);
          const forward = new THREE.Vector3().subVectors(playerGroup.position, enemy.position).normalize();
          shootEnemyProjectile(enemy.position, playerGroup.position, 0x69f0ae, 0.36, projDmg);

          const leftSpread = forward.clone().applyAxisAngle(new THREE.Vector3(0, 1, 0), 0.28);
          const rightSpread = forward.clone().applyAxisAngle(new THREE.Vector3(0, 1, 0), -0.28);
          shootEnemyProjectile(enemy.position, enemy.position.clone().add(leftSpread.multiplyScalar(10)), 0x69f0ae, 0.36, projDmg);
          shootEnemyProjectile(enemy.position, enemy.position.clone().add(rightSpread.multiplyScalar(10)), 0x69f0ae, 0.36, projDmg);
        }
      }
      // 4. BALANCED VORTEX BOSS (With clear 1.2s wind-up)
      else if (enemy.userData.bossClass === 'vortex') {
        if (enemy.userData.specialAttackTimer <= 0 && !vortexPullActive) {
          enemy.userData.specialAttackTimer = 6.0;
          vortexPullActive = true;
          enemy.userData.bodyMesh.material.emissive.setHex(0xffeb3b);

          const t1 = setTimeout(() => {
            vortexPullActive = false;

            if (enemy.userData && enemy.userData.bodyMesh) {
              enemy.userData.bodyMesh.material.emissive.setHex(0xff1744);
            }

            const t2 = setTimeout(() => {
              if (enemy.userData && enemy.userData.bodyMesh) {
                enemy.userData.bodyMesh.material.emissive.setHex(0x7f0000);
              }
              triggerBossShockwave(enemy.position, Math.round(40 * threatScaleDmg));
            }, 1200);

            activeBossTimeouts.push(t2);

          }, 2000);

          activeBossTimeouts.push(t1);
        }

        if (vortexPullActive) {
          handleVoidVortexPull(enemy.position, delta);
        }
      }
    }

    if (enemy.userData.role === 'sniper') {
      const toPlayer = new THREE.Vector3().subVectors(playerGroup.position, enemy.position);
      const dist = toPlayer.length();

      if (dist < 9) {
        toPlayer.normalize();
        enemy.position.addScaledVector(toPlayer, -enemy.userData.speed);
      } else if (dist > 16) {
        toPlayer.normalize();
        enemy.position.addScaledVector(toPlayer, enemy.userData.speed);
      }
      enemy.lookAt(playerGroup.position.x, enemy.position.y, playerGroup.position.z);

      if (enemy.userData.attackCooldown <= 0 && dist < 24 && state.spawnImmunityTimer <= 0) {
        shootEnemyProjectile(enemy.position, playerGroup.position, 0xff1744, 0.32, enemy.userData.damage);
        enemy.userData.attackCooldown = 2.4;
      }
      continue;
    }

    if (enemy.userData.role === 'shaman') {
      const toPlayer = new THREE.Vector3().subVectors(playerGroup.position, enemy.position);
      const dist = toPlayer.length();
      enemy.lookAt(playerGroup.position.x, enemy.position.y, playerGroup.position.z);

      if (enemy.userData.attackCooldown <= 0 && state.spawnImmunityTimer <= 0) {
        shootEnemyProjectile(enemy.position, playerGroup.position, 0xba68c8, 0.18, Math.round(enemy.userData.damage * 1.2), true);
        enemy.userData.attackCooldown = 3.2;

        if (dist < 6) {
          const randAngle = Math.random() * Math.PI * 2;
          enemy.position.set(Math.cos(randAngle) * 14, enemy.position.y, Math.sin(randAngle) * 14);
        }
      }
      continue;
    }

    if (enemy.userData.role === 'charger') {
      enemy.userData.chargeTimer -= delta;
      const toPlayer = new THREE.Vector3().subVectors(playerGroup.position, enemy.position);
      toPlayer.y = 0;
      const distToPlayer = toPlayer.length();

      if (enemy.userData.chargeTimer <= 0 && distToPlayer < 14) {
        enemy.userData.isDashing = true;
        enemy.userData.chargeTimer = 4.0;
        enemy.userData.dashDirection = toPlayer.clone().normalize();
      }

      if (enemy.userData.isDashing) {
        enemy.position.addScaledVector(enemy.userData.dashDirection, 0.14);
        enemy.userData.chargeTimer += delta * 0.5;
        if (distToPlayer < 1.6 || enemy.userData.chargeTimer > 3.8) {
          enemy.userData.isDashing = false;
        }
      } else {
        toPlayer.normalize();
        enemy.position.addScaledVector(toPlayer, enemy.userData.speed);
      }
      enemy.lookAt(playerGroup.position.x, enemy.position.y, playerGroup.position.z);

      if (distToPlayer <= 1.6 && enemy.userData.attackCooldown <= 0 && state.spawnImmunityTimer <= 0) {
        triggerDamageFlash();
        playSound('player_hurt');
        const effectiveDamage = enemy.userData.damage * (1.0 - state.defense);
        state.hp -= effectiveDamage;
        enemy.userData.attackCooldown = 1.2;
        updateHUD();
        playerGroup.position.y += 0.1;
        if (state.hp <= 0 && !isDead) { handleDeath(); return; }
      }
      continue;
    }

    const toPlayer = new THREE.Vector3().subVectors(playerGroup.position, enemy.position);
    toPlayer.y = 0;
    const distToPlayer = toPlayer.length();

    if (distToPlayer > 1.6) {
      toPlayer.normalize();
      enemy.position.addScaledVector(toPlayer, enemy.userData.speed);
      enemy.lookAt(playerGroup.position.x, enemy.position.y, playerGroup.position.z);
    } else {
      if (enemy.userData.attackCooldown <= 0 && state.spawnImmunityTimer <= 0) {
        triggerDamageFlash();
        playSound('player_hurt');
        const effectiveDamage = enemy.userData.damage * (1.0 - state.defense);
        state.hp -= effectiveDamage;
        enemy.userData.attackCooldown = 1.2;
        updateHUD();

        playerGroup.position.y += 0.1;

        if (state.hp <= 0 && !isDead) {
          handleDeath();
          return;
        }
      }
    }
  }

  if (enemies.length === 0 && state.arenaLevel > 0 && !state.isArenaCleared) {
    onZoneCleared();
  }
}

function onZoneCleared() {
  state.isArenaCleared = true;
  vortexPullActive = false;
  clearAllBossTimeouts();

  if (state.arenaLevel === 5) {
    document.getElementById('victory-screen').classList.remove('hidden');
    state.threatLevel++;
    autoSaveProfile();

    setTimeout(() => {
      document.getElementById('victory-screen').classList.add('hidden');
      buildSanctuary();
    }, 3500);
    return;
  }

  document.getElementById('cleared-prompt').classList.remove('hidden');
  portalGroup.position.set(0, 0, 0);
  portalGroup.visible = true;
}

function advanceToNextZone() {
  state.arenaLevel++;
  state.currentZone = (state.arenaLevel === 5) ? `Boss Arena: Confrontation` : `Trial: Arena ${state.arenaLevel}/5`;
  updateHUD();

  buildArenaForCurrentZone();

  if (state.arenaLevel === 5) {
    const banner = document.getElementById('boss-banner');
    banner.classList.remove('hidden');
    if (state.activeRunLore) {
      document.getElementById('boss-name').innerText = state.activeRunLore.bossName;
      document.getElementById('boss-dialogue').innerText = `"${state.activeRunLore.bossTaunt}"`;

      const warn = document.getElementById('boss-warning');
      if (state.activeRunLore.bossClass === 'slammer') {
        warn.innerText = "⚠️ JUMP [SPACE] high over the shockwave rings!";
      } else if (state.activeRunLore.bossClass === 'lightning') {
        warn.innerText = "⚠️ DODGE out of the triple red circles before lightning strikes!";
      } else if (state.activeRunLore.bossClass === 'vortex') {
        warn.innerText = "⚠️ RESIST the Gravity Vortex, then JUMP or SPRINT away before the shockwave!";
      } else {
        warn.innerText = "⚠️ DUCK/STRAFE between the boss's 3-way crossbow volleys!";
      }
    }
  }
}

function handleDeath() {
  isDead = true;
  state.hp = 0;
  clearAllBossTimeouts(); // Stoppar alla pågående attacker direkt
  updateHUD();

  const deathOverlay = document.getElementById('death-screen');
  deathOverlay.classList.remove('hidden');

  setTimeout(() => {
    deathOverlay.classList.add('hidden');
    buildSanctuary();
  }, 2200);
}

// --- INTERACTION SYSTEM (E) ---
function updateInteractions() {
  const prompt = document.getElementById('interaction-prompt');

  if (state.currentZone === 'The Sanctuary (Hub)') {
    const distPortal = playerGroup.position.distanceTo(portalGroup.position);
    const distAltar = playerGroup.position.distanceTo(altarMesh.position);

    if (distPortal < 4.5) {
      prompt.innerHTML = `Press <span class="key-badge">E</span> to Enter Trial Portal`;
      prompt.classList.remove('hidden');
      activeInteractionTarget = 'hub_portal';
    } else if (distAltar < 4.5) {
      prompt.innerHTML = `Press <span class="key-badge">E</span> to Commune with Altar`;
      prompt.classList.remove('hidden');
      activeInteractionTarget = 'altar';
    } else {
      prompt.classList.add('hidden');
      activeInteractionTarget = null;
    }
    return;
  }

  if (state.isArenaCleared && portalGroup.visible) {
    const distPortal = playerGroup.position.distanceTo(portalGroup.position);
    if (distPortal < 4.5) {
      prompt.innerHTML = `Press <span class="key-badge">E</span> to Advance to Next Zone`;
      prompt.classList.remove('hidden');
      activeInteractionTarget = 'arena_portal';
    } else {
      prompt.classList.add('hidden');
      activeInteractionTarget = null;
    }
  } else {
    prompt.classList.add('hidden');
    activeInteractionTarget = null;
  }
}

function interact() {
  if (activeInteractionTarget === 'hub_portal') {
    triggerGenAIRun();
  } else if (activeInteractionTarget === 'arena_portal') {
    advanceToNextZone();
  } else if (activeInteractionTarget === 'altar') {
    document.exitPointerLock();
    document.getElementById('altar-modal').classList.remove('hidden');
  }
}

// --- HUD & STATS ---
function updateHUD() {
  const hpPercent = Math.max(0, (state.hp / state.maxHp) * 100);
  document.getElementById('hp-bar').style.width = `${hpPercent}%`;
  document.getElementById('hp-text').innerText = `${Math.ceil(state.hp)}/${state.maxHp}`;
  document.getElementById('def-stat-hud').innerText = `${Math.round(state.defense * 100)}%`;
  document.getElementById('essence-count').innerText = state.essence;
  document.getElementById('zone-text').innerText = state.currentZone;
  document.getElementById('threat-level-hud').innerText = `Level ${state.threatLevel}`;

  const vignette = document.getElementById('low-hp-vignette');
  if (state.hp < state.maxHp * 0.35 && state.hp > 0) {
    vignette.classList.remove('hidden');
  } else {
    vignette.classList.add('hidden');
  }

  document.getElementById('stat-maxhp').innerText = state.maxHp;
  document.getElementById('stat-dmg').innerText = state.attackDmg;
  document.getElementById('stat-bow').innerText = state.rangedDmg;
  document.getElementById('stat-def').innerText = `${Math.round(state.defense * 100)}%`;

  document.getElementById('cost-hp').innerText = getCostHp();
  document.getElementById('cost-dmg').innerText = getCostDmg();
  document.getElementById('cost-bow').innerText = getCostBow();
  document.getElementById('cost-def').innerText = getCostDef();
}

// --- PROLOGUE CUTSCENE ---
function startIntroCutscene() {
  state.inIntroSequence = true;
  document.getElementById('main-menu').classList.add('hidden');
  document.getElementById('intro-screen').classList.remove('hidden');
  currentTrackPlaying = '';
  playAdaptiveMusic('hub');
}

function endIntroCutscene() {
  if (!state.inIntroSequence) return;
  state.inIntroSequence = false;
  state.isGameStarted = true;
  document.getElementById('intro-screen').classList.add('hidden');
  document.getElementById('ui-layer').classList.remove('hidden');
  document.getElementById('canvas-container').requestPointerLock();
}

// --- EVENT LISTENERS ---
function setupEvents() {
  const container = document.getElementById('canvas-container');

  document.getElementById('btn-start-game').onclick = () => {
    initAudio();
    startIntroCutscene();
  };

  document.getElementById('intro-screen').onclick = endIntroCutscene;

  document.getElementById('btn-open-controls').onclick = () => {
    document.getElementById('controls-modal').classList.remove('hidden');
  };

  document.getElementById('hud-btn-controls').onclick = () => {
    document.exitPointerLock();
    document.getElementById('controls-modal').classList.remove('hidden');
  };

  document.getElementById('btn-close-controls').onclick = () => {
    document.getElementById('controls-modal').classList.add('hidden');
    if (state.isGameStarted && !state.inIntroSequence) container.requestPointerLock();
  };

  document.getElementById('btn-toggle-audio').onclick = () => {
    state.audioEnabled = !state.audioEnabled;
    const bgMusic = document.getElementById('bg-music');
    if (bgMusic) {
      if (state.audioEnabled) bgMusic.play();
      else bgMusic.pause();
    }
    document.getElementById('btn-toggle-audio').innerText = state.audioEnabled ? "🔊 SOUND & MUSIC: ON" : "🔇 SOUND & MUSIC: OFF";
  };

  document.getElementById('btn-reset-run').onclick = () => {
    resetRunAndStats();
  };

  document.getElementById('btn-open-api').onclick = () => {
    document.getElementById('input-api-key').value = state.geminiApiKey;
    document.getElementById('key-modal').classList.remove('hidden');
  };

  document.getElementById('btn-api-key').onclick = () => {
    document.exitPointerLock();
    document.getElementById('input-api-key').value = state.geminiApiKey;
    document.getElementById('key-modal').classList.remove('hidden');
  };

  document.getElementById('save-key').onclick = () => {
    const key = document.getElementById('input-api-key').value.trim();
    if (key) {
      state.geminiApiKey = key;
      localStorage.setItem('valhalla_gemini_key', key);
      alert('Gemini API Key saved and permanently remembered!');
    }
    document.getElementById('key-modal').classList.add('hidden');
    if (state.isGameStarted && !state.inIntroSequence) container.requestPointerLock();
  };

  document.getElementById('close-key').onclick = () => {
    document.getElementById('key-modal').classList.add('hidden');
    if (state.isGameStarted && !state.inIntroSequence) container.requestPointerLock();
  };

  container.addEventListener('click', () => {
    if (state.isGameStarted && !state.inIntroSequence) container.requestPointerLock();
  });

  document.addEventListener('pointerlockchange', () => {
    isPointerLocked = (document.pointerLockElement === container);
  });

  window.addEventListener('mousemove', (e) => {
    if (!isPointerLocked || isDead || !state.isGameStarted || state.inIntroSequence) return;

    const sensitivity = 0.0022;
    cameraYaw -= e.movementX * sensitivity;
    cameraPitch += e.movementY * sensitivity;
    cameraPitch = Math.max(-0.10, Math.min(0.85, cameraPitch));
  });

  window.addEventListener('mousedown', (e) => {
    if (!isPointerLocked || isDead || !state.isGameStarted || state.inIntroSequence) return;

    if (e.button === 0) triggerMeleeAttack();
    else if (e.button === 2) shootCrossbow();
  });

  window.addEventListener('contextmenu', (e) => e.preventDefault());

  window.addEventListener('keydown', (e) => {
    if (state.inIntroSequence) {
      if (e.code === 'Space' || e.code === 'Enter') endIntroCutscene();
      return;
    }

    if (!state.isGameStarted) return;

    if (e.code === 'KeyW') keys.w = true;
    if (e.code === 'KeyS') keys.s = true;
    if (e.code === 'KeyA') keys.a = true;
    if (e.code === 'KeyD') keys.d = true;
    if (e.code === 'ShiftLeft' || e.code === 'ShiftRight') keys.shift = true;

    // High jump leap with floaty hang-time
    if (e.code === 'Space') {
      if (isGrounded && !isDead) {
        playerVelocityY = JUMP_FORCE;
        isGrounded = false;
      }
    }

    if (e.code === 'KeyE') interact();
  });

  window.addEventListener('keyup', (e) => {
    if (e.code === 'KeyW') keys.w = false;
    if (e.code === 'KeyS') keys.s = false;
    if (e.code === 'KeyA') keys.a = false;
    if (e.code === 'KeyD') keys.d = false;
    if (e.code === 'ShiftLeft' || e.code === 'ShiftRight') keys.shift = false;
  });

  window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
  });

  // Altar upgrades
  document.getElementById('buy-hp').onclick = () => {
    const cost = getCostHp();
    if (state.essence >= cost) {
      state.essence -= cost;
      state.tierHp++;
      state.maxHp += 20;
      state.hp += 20;
      autoSaveProfile();
      updateHUD();
    }
  };
  document.getElementById('buy-dmg').onclick = () => {
    const cost = getCostDmg();
    if (state.essence >= cost) {
      state.essence -= cost;
      state.tierDmg++;
      state.attackDmg += 8;
      autoSaveProfile();
      updateHUD();
    }
  };
  document.getElementById('buy-bow').onclick = () => {
    const cost = getCostBow();
    if (state.essence >= cost) {
      state.essence -= cost;
      state.tierBow++;
      state.rangedDmg += 4;
      autoSaveProfile();
      updateHUD();
    }
  };
  document.getElementById('buy-def').onclick = () => {
    const cost = getCostDef();
    if (state.essence >= cost && state.defense < 0.60) {
      state.essence -= cost;
      state.tierDef++;
      state.defense += 0.05;
      autoSaveProfile();
      updateHUD();
    }
  };
  document.getElementById('close-altar').onclick = () => {
    document.getElementById('altar-modal').classList.add('hidden');
    container.requestPointerLock();
  };
}

window.onload = init;