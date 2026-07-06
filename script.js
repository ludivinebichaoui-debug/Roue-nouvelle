let isSpinning = false;
const canvas = document.getElementById('wheelCanvas');
const ctx = canvas.getContext('2d');

// ==========================================
// CONFIGURATION DES PROBABILITÉS STRICTES (TOTAL = 100%)
// ==========================================
// Ajustez ces 4 chiffres pour changer la difficulté du jeu.
const CHANCE_PERDRE         = 55; // 55% de chances de perdre
const CHANCE_SOIN_OFFERT    = 30; // 30% de chances de gagner le soin
const CHANCE_SCHWARZKOPF    = 10; // 10% de chances pour Schwarzkopf/Crew/Depot
const CHANCE_AVEDA          = 5;  // 5% de chances pour Aveda

// Visuel des 8 segments de la roue (Alternance Or et Noir)
const prizes = [
    { label: "AVEDA",         color: "#d4af37", text: "#000000", isWin: true,  msg: "Magnifique ! Un produit de la gamme éco-luxe AVEDA vous est offert ! 🧴" },
    { label: "PAS CETTE FOIS",color: "#1a1a1a", text: "#ffffff", isWin: false, msg: "Pas cette fois ! Toute l'équipe vous remercie pour votre avis." },
    { label: "SOIN OFFERT",   color: "#d4af37", text: "#000000", isWin: true,  msg: "Exceptionnel ! Vous gagnez un soin profond personnalisé offert ! 💆‍♀️" },
    { label: "PLUS TARD",     color: "#2a2a2a", text: "#ffffff", isWin: false, msg: "Presque ! Merci beaucoup pour votre gentillesse et votre soutien." },
    { label: "SCHWARZKOPF+",  color: "#d4af37", text: "#000000", isWin: true,  msg: "Félicitations ! Un produit Schwarzkopf, American Crew ou Depot vous est offert ! ✨" },
    { label: "ESSAYE ENCORE", color: "#1a1a1a", text: "#ffffff", isWin: false, msg: "Dommage ! Merci d'avoir pris le temps de nous laisser une note." },
    { label: "SOIN OFFERT",   color: "#d4af37", text: "#000000", isWin: true,  msg: "Exceptionnel ! Vous gagnez un soin profond personnalisé offert ! 💆‍♀️" },
    { label: "DOMMAGE",       color: "#2a2a2a", text: "#ffffff", isWin: false, msg: "Ce sera pour une prochaine fois ! Merci pour votre précieuse fidélité." }
];

const numSegments = prizes.length;
const segmentAngle = (2 * Math.PI) / numSegments;
let currentRotation = 0;

// Dessin de la roue
function drawWheel() {
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    const radius = centerX - 15;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    for (let i = 0; i < numSegments; i++) {
        const angle = i * segmentAngle;

        ctx.beginPath();
        ctx.moveTo(centerX, centerY);
        ctx.arc(centerX, centerY, radius, angle, angle + segmentAngle);
        ctx.fillStyle = prizes[i].color;
        ctx.fill();

        ctx.lineWidth = 2;
        ctx.strokeStyle = "rgba(212, 175, 55, 0.4)";
        ctx.stroke();

        ctx.save();
        ctx.translate(centerX, centerY);
        ctx.rotate(angle + segmentAngle / 2);
        ctx.fillStyle = prizes[i].text;
        ctx.font = "bold 13px Montserrat";
        ctx.textAlign = "right";
        ctx.fillText(prizes[i].label, radius - 30, 5);
        ctx.restore();
    }

    ctx.beginPath();
    ctx.arc(centerX, centerY, radius, 0, 2 * Math.PI);
    ctx.lineWidth = 10;
    ctx.strokeStyle = "#d4af37";
    ctx.stroke();
}

// Nouvel algorithme mathématique basé sur un tirage de 1 à 100
function getStrictRandomIndex() {
    const tirage = Math.random() * 100; // Génère un nombre entre 0 et 100

    // 1. Cas Aveda : de 0 à 5 (5% de chance) -> Case index 0
    if (tirage < CHANCE_AVEDA) {
        return 0; 
    }
    // 2. Cas Schwarzkopf : de 5 à 15 (10% de chance) -> Case index 4
    else if (tirage < (CHANCE_AVEDA + CHANCE_SCHWARZKOPF)) {
        return 4; 
    }
    // 3. Cas Soin Offert : de 15 à 45 (30% de chance) -> On distribue sur les cases 2 ou 6
    else if (tirage < (CHANCE_AVEDA + CHANCE_SCHWARZKOPF + CHANCE_SOIN_OFFERT)) {
        return Math.random() < 0.5 ? 2 : 6; 
    }
    // 4. Cas Perdre : de 45 à 100 (55% de chance) -> On distribue au hasard sur les cases perdantes (1, 3, 5, 7)
    else {
        const perdantes = [1, 3, 5, 7];
        return perdantes[Math.floor(Math.random() * perdantes.length)];
    }
}

// Lancement de la roue
function spin() {
    if (isSpinning) return;

    const resultBox = document.getElementById("result-box");
    const resultText = document.getElementById("result-text");

    // Sécurité anti-triche : un seul essai par client
    const dejaJoue = localStorage.getItem('roue_salon_deja_joue');
    if (dejaJoue) {
        resultText.innerHTML = `<strong>Rappel de votre participation</strong><br>Votre code privilège a déjà été attribué lors de votre visite.`;
        document.querySelector(".result-icon").innerText = "🔒";
        resultBox.classList.remove("hidden");
        return;
    }

    isSpinning = true;
    resultBox.classList.add("hidden");

    // Sélection de la case selon le tirage sur 100
    const winningIndex = getStrictRandomIndex();

    // Calcul de l'angle parfait pour s'arrêter sous la flèche du haut
    const baseRotations = 2160; 
    const targetAngle = (numSegments - winningIndex) * (360 / numSegments) - 90;
    
    currentRotation += baseRotations + targetAngle - (currentRotation % 360);
    canvas.style.transform = `rotate(${currentRotation}deg)`;

    setTimeout(() => {
        const item = prizes[winningIndex];
        resultText.innerHTML = item.isWin ? `<strong>FÉLICITATIONS !</strong><br>${item.msg}` : item.msg;
        document.querySelector(".result-icon").innerText = item.isWin ? "🎁" : "✨";
        
        resultBox.classList.remove("hidden");
        isSpinning = false;

        // Sauvegarde définitive dans le navigateur
        localStorage.setItem('roue_salon_deja_joue', item.label);

    }, 6000); 
}

window.onload = function() {
    drawWheel();
    const dejaJoue = localStorage.getItem('roue_salon_deja_joue');
    if (dejaJoue) {
        const resultBox = document.getElementById("result-box");
        const resultText = document.getElementById("result-text");
        resultText.innerHTML = `<strong>Merci pour votre fidélité !</strong><br>Votre participation a déjà été validée pour aujourd'hui.`;
        document.querySelector(".result-icon").innerText = "🔒";
        resultBox.classList.remove("hidden");
    }
};
