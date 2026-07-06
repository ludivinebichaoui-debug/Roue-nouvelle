let isSpinning = false;
let currentRotation = 0;

const canvas = document.getElementById('wheelCanvas');
const ctx = canvas.getContext('2d');

// Configuration précise des 8 segments mélangés (Alternance Noir & Or)
const prizes = [
    { label: "AVEDA OFFERT", color: "#d4af37", text: "#000000", isWin: true, msg: "Un shampooing de la gamme AVEDA vous est offert ! 🧴" },
    { label: "PAS CETTE FOIS", color: "#1a1a1a", text: "#ffffff", isWin: false, msg: "Pas cette fois ! Toute l'équipe vous remercie pour votre avis." },
    { label: "REMISE -10%", color: "#d4af37", text: "#000000", isWin: true, msg: "Vous bénéficiez de -10% sur votre prochaine prestation ! 💇‍♂️" },
    { label: "PLUS TARD", color: "#2a2a2a", text: "#ffffff", isWin: false, msg: "Presque ! Merci beaucoup pour votre gentillesse et votre soutien." },
    { label: "SOIN PROFOND", color: "#d4af37", text: "#000000", isWin: true, msg: "Un soin profond personnalisé vous est offert ! 💆‍♀️" },
    { label: "ESSAYE ENCORE", color: "#1a1a1a", text: "#ffffff", isWin: false, msg: "Dommage ! Merci d'avoir pris le temps de nous laisser une note." },
    { label: "SCHWARZKOPF", color: "#d4af37", text: "#000000", isWin: true, msg: "Un shampooing de la gamme Américaine Schwarzkopf déposée vous est offert ! ✨" },
    { label: "DOMMAGE", color: "#2a2a2a", text: "#ffffff", isWin: false, msg: "Ce sera pour une prochaine fois ! Merci pour votre précieuse fidélité." }
];

const numSegments = prizes.length;
const segmentAngle = (2 * Math.PI) / numSegments;

// Fonction de dessin de la roue de luxe
function drawWheel() {
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    const radius = centerX - 15;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    for (let i = 0; i < numSegments; i++) {
        const angle = i * segmentAngle;

        // Dessin de la part
        ctx.beginPath();
        ctx.moveTo(centerX, centerY);
        ctx.arc(centerX, centerY, radius, angle, angle + segmentAngle);
        ctx.fillStyle = prizes[i].color;
        ctx.fill();

        // Ligne de séparation dorée fine
        ctx.lineWidth = 2;
        ctx.strokeStyle = "rgba(212, 175, 55, 0.4)";
        ctx.stroke();

        // Placement du texte parfaitement aligné au centre du segment
        ctx.save();
        ctx.translate(centerX, centerY);
        ctx.rotate(angle + segmentAngle / 2);
        ctx.fillStyle = prizes[i].text;
        ctx.font = "bold 15px Montserrat";
        ctx.textAlign = "right";
        
        // Écrit le texte horizontalement le long du rayon de la roue
        ctx.fillText(prizes[i].label, radius - 30, 6);
        ctx.restore();
    }

    // Grand cercle de finition extérieur en laiton/or
    ctx.beginPath();
    ctx.arc(centerX, centerY, radius, 0, 2 * Math.PI);
    ctx.lineWidth = 10;
    ctx.strokeStyle = "#d4af37";
    ctx.stroke();
}

// Lancement de la roue
function spin() {
    if (isSpinning) return;
    isSpinning = true;

    const resultBox = document.getElementById("result-box");
    const resultText = document.getElementById("result-text");

    resultBox.classList.add("hidden");

    // Sélection aléatoire de l'index gagnant (0 à 7)
    const winningIndex = Math.floor(Math.random() * numSegments);

    // Calcul de l'angle pour aligner le segment gagnant SOUS la flèche du haut (à 270°)
    const baseRotations = 2160; // 6 tours complets pour l'effet de vitesse
    const targetAngle = (numSegments - winningIndex) * (360 / numSegments) - 90;
    
    currentRotation += baseRotations + targetAngle - (currentRotation % 360);
    canvas.style.transform = `rotate(${currentRotation}deg)`;

    setTimeout(() => {
        const item = prizes[winningIndex];
        resultText.innerHTML = item.isWin ? `<strong>FÉLICITATIONS !</strong><br>${item.msg}` : item.msg;
        document.querySelector(".result-icon").innerText = item.isWin ? "🎁" : "✨";
        
        resultBox.classList.remove("hidden");
        isSpinning = false;
    }, 6000); // 6 secondes de rotation fluide
}

// Initialisation au chargement de la page
drawWheel();
