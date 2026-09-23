Aethelgard: Valhalla Trials

3D Generative AI Roguelite | Version 2.0 (Tactical Update)

Engine AI DevOps

⚔️ Project Overview

Aethelgard: Valhalla Trials is a technical demonstration of a 3D action
roguelite built with Three.js and integrated with the Google Gemini AI engine.
This project showcases the intersection of Infrastructure as Code
(AWS/Terraform) and Modern Web Development.

📑 Phase 1: Research Phase (Pre-Study)

Information Gathering

We researched the Three.js documentation for 3D rendering and the Web Audio API
for procedural sound generation. For the AI component, we explored Google
Gemini 1.5 Flash for its low-latency response times, ideal for generating live
game lore.

Tools & Technologies

  - Frontend: Three.js (WebGL), Vanilla JavaScript (ES6+), CSS3 Animations.
  - AI Integration: Google Gemini API.
  - Audio: Web Audio Oscillator Engine.
  - Infrastructure: AWS (EC2, S3), Terraform, Ansible.

Research Problems & Solutions

  - Problem: High latency when calling the AI during gameplay.
  - Solution: Implemented an asynchronous "Fate Weaving" sequence at the start
    of a run to pre-generate realm data without freezing the main thread.

🛠 Phase 2: Implementation (Development)

Project Structure

The project was built starting with the core Game Loop, followed by the Player
Controller, and finally the Generative AI Bridge.

Key Features Developed

1.  Dual-Wield Rigging: Independent arm groups for the Rune Sword and Crossbow.
2.  Tactical Dash System: Added a high-burst movement mechanic with "I-Frames"
    (Invincibility Frames) for skilled dodging.
3.  Split-Damage Volleys: Upgraded the bow system to shoot triple volleys with
    balanced damage distribution.
4.  Prologue Cutscene: A scripted intro sequence to establish the realm's
    narrative.
5.  Particle Engine: A custom BufferGeometry system for ambient "Rune Dust"
    effects.

Implementation Problems & Solutions

  - Problem: Code design became cluttered with global variables.
  - Solution: Refactored the game logic into a centralized state object and
    modularized combat functions.

✅ Phase 3: Finalization & Improvement

Testing & Optimization

  - Performance: Used PointsMaterial for particles to ensure high FPS on all
    devices.
  - UX Polish: Added a "Low HP Vignette" and "Damage Flash" to provide visual
    feedback during intense combat.
  - Balancing: Adjusted enemy movement speed to be 30% faster for melee units to
    increase the challenge.

Finalization Problems & Solutions

  - Problem: Camera flipping 360 degrees when looking straight up.
  - Solution: Implemented a strict cameraPitch clamp between -0.10 and 0.85
    radians.

⚠️ Phase 4: Summary of Problems & Solutions

| Problem                      | Solution                                                                                     |
| :--------------------------- | :------------------------------------------------------------------------------------------- |
| **S3 Bucket Name Conflicts** | Implemented dynamic naming using the `MY_USER` variable in Terraform.                        |
| **Crossbow Spamming**        | Added a dynamic cooldown that increases as the player unlocks Multi-shot.                    |
| **Static Backends**          | Created a Bash script (`setup.terraform.backend.sh`) to generate dynamic `backend.tf` files. |

📜 Conclusion

Through this project, we have successfully bridged the gap between game
development and DevOps. We learned how to manage Remote State in Terraform,
deploy complex web applications using Ansible, and utilize Generative AI to
enhance player immersion. The final result is a scalable, automated, and
engaging 3D experience.

🎮 Controls

  - W A S D: Move & Strafe
  - SHIFT / Q: Tactical Dash (I-Frames)
  - SPACE: High Jump
  - LEFT CLICK: Sword Attack
  - RIGHT CLICK: Crossbow Shot (Volley)
  - E: Interact with Altar/Portal

📦 Deployment (AWS Level 3)

1.  Run bash setup.terraform.backend.sh to refresh config.
2.  Run terraform init and terraform apply.
3.  The server will automatically install Nginx and Ansible to deploy the game.

Developers: Raul Velasquez & Philip
Deployment Date: September 2026
