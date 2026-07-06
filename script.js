let isSpinning = false;
const canvas = document.getElementById('wheelCanvas');
const ctx = canvas.getContext('2d');

// ==========================================
// CONFIGURATION STRICTE DES POURCENTAGES (Total = 100%)
// ==========================================
const prizes = [
    { label: "AVEDA",         color: "#d4af37", text: "#000000", isWin: true,  poids: 5,     msg: "Magnifique ! Un produit de la gamme éco-luxe AVEDA vous est offert ! 🧴" },
    { label: "PAS CETTE FOIS",color: "#1a1a1a", text: "#ffffff", isWin: false, poids: 13.75, msg: "Pas cette fois ! Toute l'équipe vous remercie pour votre avis." },
    { label: "SOIN OFFERT",   color: "#d4af37", text: "#000000", isWin: true,  poids: 30,    msg: "Exceptionnel ! Vous gagnez un soin profond personnalisé offert ! 💆‍♀️" },
    { label: "PLUS TARD",     color: "#2a2a2a", text: "#ffffff", isWin: false, poids: 13.75, msg: "Presque ! Merci beaucoup pour votre gentillesse et votre soutien." },
    { label: "SCHWARZKOPF+",  color: "#d4af37", text: "#000000", isWin: true,  poids: 10,    msg: "Félicitations ! Un produit Schwarzkopf, American Crew ou Depot vous est offert ! ✨" },
    { label: "ESSAYE ENCORE", color: "#1a1a1a", text: "#ffffff", isWin: false, poids: 13.75, msg: "Dommage ! Merci d'avoir pris le temps de nous laisser une note." },
    { label: "SOIN OFFERT",   color: "#d4af37", text: "#000000", isWin: true,  poids: 0,     msg: "" }, // Laissé à 0 pour garder l'alternance visuelle parfaite de la roue
    { label: "DOMMAGE",       color: "#2a2a2a", text: "#ffffff", isWin: false, poids: 13.75, msg: "Ce sera pour une prochaine fois ! Merci pour votre précieuse fidélité." }
];

// Note mathématique : Les 4 cases perdantes cumulées font exactement 55% (13.75 x 4).
// La case 3 (SOIN OFFERT) porte les 30% de chance à elle seule pour ce lot.

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
        
        // Ajustement de la police pour l'iPad
        ctx.font = "bold 13px Montserrat";
        ctx.textAlign = "right";
        
        // Si c'est la case vide esthétique, on écrit quand même un lot visuel
        let visualLabel = prizes[i].label;
        if (i === 6) visualLabel = "PRODUIT BG"; 
        
        ctx.fillText(visualLabel, radius - 30, 5);
        ctx.restore();
    }

    ctx.beginPath();
    ctx.arc(centerX, centerY, radius, 0, 2 * Math.PI);
    ctx.lineWidth = 10;
    ctx.strokeStyle = "#d4af37";
    ctx.stroke();
}

// Algorithme de tirage au sort pondéré
function getWeightedRandomIndex() {
    let totalPoids = 0;
    prizes.forEach(p => totalPoids += p.poids);

    let random = Math.random() * totalPoids;
    for (let i = 0; i < prizes.length; i++) {
        if (random < prizes[i].poids) {
            return i;
        }
        random -= prizes[i].poids;
    }
    return 0;
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

    // Sélection selon vos pourcentages exacts
    const winningIndex = getWeightedRandomIndex();

    // Calcul de l'angle pour que la case sélectionnée s'arrête pile sous la flèche du haut
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

        // Sauvegarde définitive dans le navigateur du client
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
