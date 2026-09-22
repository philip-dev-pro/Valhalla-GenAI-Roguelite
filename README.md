# Aethelgard: Valhalla Trials
### 3D Generative AI Roguelite | AWS Level 3 Architecture

![Game Preview](https://img.shields.io/badge/Engine-Three.js-blueviolet)
![GenAI](https://img.shields.io/badge/AI-Google_Gemini-blue)
![Infrastructure](https://img.shields.io/badge/Infrastructure-AWS_Level_3-orange)

## ⚔️ Project Overview
**Aethelgard: Valhalla Trials** is a fast-paced 3D roguelite action game that combines high-fidelity browser graphics with real-time Generative AI. Players step into the armor of an Einherjar, battling through procedural realms woven by the **AI Fate Weaver** to prove their worth in Valhalla.

The project demonstrates a modern "Serverless Game Client" approach, designed to be deployed using the **AWS Level 3 Iteration** flow (Terraform + Ansible automation).

## 🚀 Key Features

### 1. Generative AI Fate Weaver
Using the **Google Gemini 1.5 Flash API**, the game procedurally generates:
*   **Realm Lore:** Unique titles and dramatic atmospheric descriptions for every run.
*   **Dynamic Visuals:** AI-driven color palettes and environmental lighting.
*   **Boss Personalities:** Unique boss names, classes (Slammer, Lightning, Archer), and procedurally generated taunts.

### 2. Twin-Weapon Combat System
*   **Rune Sword:** High-damage melee slashes with ray-cast hit detection.
*   **Rune Crossbow:** Precision projectile physics for long-range engagements.
*   **Limb-Rigged Animation:** Custom Three.js walking limb bobbing and weapon swing animations.

### 3. Progressive Roguelite Mechanics
*   **Permanent Meta-Progression:** Collect **Essence** from fallen foes to upgrade Vitality, Blade Mastery, and Rune Armor at the Sanctuary Altar.
*   **Dynamic Threat Levels:** Each successful run increases the global Threat Level, scaling enemy HP and damage for infinite replayability.
*   **Status System:** Includes low-HP heartbeat drones, damage flashes, and pulse vignettes.

### 4. Advanced Sound Engine
*   **Synthesized Web Audio:** Procedural sound effects generated via oscillators (No external assets required for SFX).
*   **Adaptive Music:** Integrated Suno AI music playlist that switches between Hub, Arena, and Boss tracks based on player location.

## 🛠 Technical Stack
*   **Graphics:** [Three.js](https://threejs.org/) (WebGL)
*   **Logic:** Vanilla JavaScript (ES6+)
*   **AI Engine:** Google Gemini API
*   **Audio:** Web Audio API (OscillatorNode / GainNode)
*   **Styling:** CSS3 (Animations & Radial Blurs)
*   **DevOps:** AWS (EC2, S3), Terraform, Ansible (Level 3 Infrastructure)

## 🎮 Controls
| Key | Action |
|-----|--------|
| **W A S D** | Movement & Strafe |
| **SHIFT** | Sprint (45% speed boost) |
| **SPACE** | Jump (Dodge shockwaves) |
| **MOUSE** | 3rd Person Camera / Aiming |
| **LEFT CLICK** | Melee Sword Attack |
| **RIGHT CLICK** | Ranged Crossbow Shot |
| **E** | Interact (Portal / Altar) |

## 📦 Infrastructure & Deployment
This game is designed to be deployed on **AWS EC2** using the **Level 3 DevOps Pipeline**:
1.  **Terraform:** Provisions the EC2 instance, Security Groups (Port 80/22), and S3 Remote State.
2.  **Ansible:** Configures the Nginx web server and clones this repository.
3.  **User Data:** Automatically bootstraps the environment for an instant "Push-to-Live" experience.

## ⚙️ Setup & API Key
To enable the full AI experience:
1.  Obtain a free API Key from [Google AI Studio](https://aistudio.google.com/).
2.  In the game Main Menu, click **GenAI Settings**.
3.  Paste your key. It is saved locally in your browser's `localStorage`.

---
**Developers:** Raul Velasquez & Philip  
**Project:** DevOps/GenAI Integration Course - Task 01
