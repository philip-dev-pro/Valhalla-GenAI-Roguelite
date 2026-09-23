# Aethelgard: Valhalla Trials
### 3D Generative AI Roguelite | Version 2.0 (Tactical Update)

🎮 **[LIVE DEMO HERE](http://ec2-13-61-14-240.eu-north-1.compute.amazonaws.com/)**

![Engine](https://img.shields.io/badge/Engine-Three.js-blueviolet) 
![AI](https://img.shields.io/badge/AI-Google_Gemini-blue) 
![DevOps](https://img.shields.io/badge/Infrastructure-AWS_Level_3-orange)

## ⚔️ Project Overview
**Aethelgard: Valhalla Trials** is a technical demonstration of a 3D action roguelite built with Three.js and integrated with the Google Gemini AI engine. This project showcases the intersection of **Infrastructure as Code (AWS/Terraform)** and **Modern Web Development**.

---

## 📑 Phase 1: Research Phase (Pre-Study)

### Information Gathering
We researched the **Three.js** documentation for 3D rendering and the **Web Audio API** for procedural sound generation. For the AI component, we explored **Google Gemini 1.5 Flash** for its low-latency response times, which is ideal for generating live game lore and procedural realm data.

### Tools & Technologies
- **Frontend:** Three.js (WebGL), Vanilla JavaScript (ES6+), CSS3 Animations.
- **AI Engine:** Google Gemini API (Generative AI Oracle).
- **Audio:** Web Audio Oscillator Engine for synthesized SFX.
- **Infrastructure:** AWS (EC2, S3), Terraform, Ansible (Level 3 Architecture).

### Research Problems & Solutions
*   **Problem:** High latency when calling the AI API during active gameplay.
*   **Solution:** Implemented an asynchronous "Fate Weaving" sequence at the start of a run to pre-generate all realm lore and modifiers without freezing the main rendering thread.

---

## 🛠 Phase 2: Implementation (Development)

### Project Structure
The project development was divided into three main sprints: core **Physics & Rendering**, the **Player Rigging System**, and finally the **AI Integration Layer**.

### Key Features Developed
1.  **Dual-Wield Rigging:** Independent arm groups for the Rune Sword and Crossbow with custom bobbing animations.
2.  **Tactical Dash System:** Added a high-burst movement mechanic triggered by `SHIFT` or `Q`, including "I-Frames" (Invincibility Frames) for skilled dodging.
3.  **Split-Damage Volleys:** Upgraded the crossbow to shoot triple volleys (at Tier 3) with balanced damage distribution (100% center, 40% sides).
4.  **Prologue Cutscene:** A scripted cinematic intro sequence to establish the narrative before the player awakens in the Sanctuary.
5.  **Particle Engine:** A custom BufferGeometry system for ambient "Rune Dust" effects.

### Implementation Problems & Solutions
*   **Problem:** Code design became cluttered with global variables as complexity increased.
*   **Solution:** Refactored the game logic into a centralized `state` object and moved combat mechanics into modular functions.

---

## ✅ Phase 3: Finalization & Improvement

### Testing & Optimization
- **Performance:** Replaced standard meshes with `PointsMaterial` for the particle system to ensure high FPS on mobile and low-end devices.
- **UX Polish:** Added a "Low HP Heartbeat" and "Red Pulse Vignette" to provide critical visual and auditory feedback during combat.
- **Balancing:** Increased enemy movement speed by 30% to make melee encounters more challenging and force the player to use the Dash mechanic.

### Finalization Problems & Solutions
*   **Problem:** The 3rd-person camera would flip 360 degrees when the player aimed straight up.
*   **Solution:** Implemented a strict `cameraPitch` clamp between -0.10 and 0.85 radians to maintain a stable perspective.

---

## ⚠️ Phase 4: Summary of Problems & Solutions (Compilation)

| Problem | Solution |
| :--- | :--- |
| **S3 Bucket Name Conflicts** | Implemented dynamic naming using the `MY_USER` environment variable in the Terraform script. |
| **Crossbow Spamming** | Added a dynamic cooldown timer that scales with the player's weapon tier to prevent combat trivialization. |
| **Static State Backends** | Developed a Bash script (`setup.terraform.backend.sh`) that automatically generates a unique `backend.tf` for each developer. |

---

## 📜 Conclusion
Through this project, we have successfully bridged the gap between creative game development and automated DevOps practices. We learned how to manage **Remote State** in Terraform, automate web deployments with **Ansible**, and utilize **Generative AI** to enhance player immersion. The final result is a scalable, cloud-deployed, and engaging 3D experience.

---

## 🎮 Controls
- **W A S D**: Move & Strafe
- **SHIFT / Q**: Tactical Dash (I-Frames)
- **SPACE**: High Jump (Dodge Shockwaves)
- **LEFT CLICK**: Melee Sword Attack
- **RIGHT CLICK**: Ranged Crossbow Shot (Volley)
- **E**: Interact with Altar or Portal

---

## 📦 Deployment (AWS Level 3 Architecture)
The game is deployed using a fully automated pipeline:
1. Run `./setup.terraform.backend.sh` to refresh the dynamic configuration.
2. Run `terraform init` and `terraform apply -auto-approve`.
3. The AWS EC2 instance will automatically install **Nginx** and **Ansible** to pull the latest code and go live.

**Developers:** Raul Velasquez & Philip  
**Deployment Date:** September 2026
