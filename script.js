
"use strict";

const arena = document.getElementById("arena");
const scoreText = document.getElementById("score");
const livesText = document.getElementById("lives");
const bestText = document.getElementById("best");
const notice = document.getElementById("notice");
const feedback = document.getElementById("feedback");
const startBtn = document.getElementById("start");

const baskets = [...document.querySelectorAll(".basket")];

const words = [
    // 관형사
    { word: "새", base: "새", type: "determiner" },
    { word: "헌", base: "헌", type: "determiner" },
    { word: "모든", base: "모든", type: "determiner" },
    { word: "여러", base: "여러", type: "determiner" },
    { word: "어떤", base: "어떤", type: "determiner" },
    { word: "어느", base: "어느", type: "determiner" },
    { word: "무슨", base: "무슨", type: "determiner" },
    { word: "온갖", base: "온갖", type: "determiner" },
    { word: "각", base: "각", type: "determiner" },
    { word: "온", base: "온", type: "determiner" },
    { word: "웬", base: "웬", type: "determiner" },
    { word: "첫", base: "첫", type: "determiner" },
    { word: "맨", base: "맨", type: "determiner" },
    { word: "이런", base: "이런", type: "determiner" },
    { word: "그런", base: "그런", type: "determiner" },
    { word: "저런", base: "저런", type: "determiner" },

    // 부사
    { word: "매우", base: "매우", type: "adverb" },
    { word: "아주", base: "아주", type: "adverb" },
    { word: "무척", base: "무척", type: "adverb" },
    { word: "꽤", base: "꽤", type: "adverb" },
    { word: "너무", base: "너무", type: "adverb" },
    { word: "몹시", base: "몹시", type: "adverb" },
    { word: "조금", base: "조금", type: "adverb" },
    { word: "훨씬", base: "훨씬", type: "adverb" },
    { word: "빨리", base: "빨리", type: "adverb" },
    { word: "천천히", base: "천천히", type: "adverb" },
    { word: "갑자기", base: "갑자기", type: "adverb" },
    { word: "자주", base: "자주", type: "adverb" },
    { word: "가끔", base: "가끔", type: "adverb" },
    { word: "살짝", base: "살짝", type: "adverb" },
    { word: "꼭", base: "꼭", type: "adverb" },
    { word: "벌써", base: "벌써", type: "adverb" },
    { word: "아직", base: "아직", type: "adverb" },
    { word: "먼저", base: "먼저", type: "adverb" },
    { word: "함께", base: "함께", type: "adverb" },
    { word: "다시", base: "다시", type: "adverb" },
    { word: "곧", base: "곧", type: "adverb" },
    { word: "문득", base: "문득", type: "adverb" },
    { word: "조용히", base: "조용히", type: "adverb" },
    { word: "열심히", base: "열심히", type: "adverb" }
];

let score = 0;
let lives = 3;
let best = Number(localStorage.getItem("modifierBest")) || 0;

let playing = false;
let drag = null;
let startTime = 0;
let lastSpawnTime = 0;
let lastWord = "";
let spawnTimes = [];

let fallTimer = null;
let spawnTimer = null;

bestText.textContent = best;

function updateStats() {
    scoreText.textContent = score;
    livesText.textContent =
        "❤️".repeat(lives) + "🖤".repeat(3 - lives);
}

function clearTimers() {
    clearInterval(fallTimer);
    clearInterval(spawnTimer);
}

function startGame() {
    clearTimers();

    arena.querySelectorAll(".word").forEach(el => el.remove());
    baskets.forEach(b => b.classList.remove("drag-over"));

    score = 0;
    lives = 3;
    playing = true;
    drag = null;
    startTime = Date.now();
    lastSpawnTime = 0;
    lastWord = "";
    spawnTimes = [];

    updateStats();

    notice.style.display = "none";
    feedback.textContent = "단어를 알맞은 상자에 끌어다 놓아 봐!";
    startBtn.disabled = true;
    startBtn.textContent = "게임 진행 중...";

    createWord();

    fallTimer = setInterval(moveWords, 30);

    // 시간이 지날수록 단어 생성 간격 감소
    spawnTimer = setInterval(() => {
        if (!playing) return;

        const elapsed = (Date.now() - startTime) / 1000;
        const interval = Math.max(500, 1800 - elapsed * 15);

        if (Date.now() - lastSpawnTime >= interval) {
            createWord();
        }
    }, 100);
}

function getBasketAt(x, y) {
    return baskets.find(basket => {
        const rect = basket.getBoundingClientRect();

        return (
            x >= rect.left &&
            x <= rect.right &&
            y >= rect.top &&
            y <= rect.bottom
        );
    });
}

function createWord() {
    if (!playing) return;

    const now = Date.now();

    // 최근 5초간 생성 기록만 유지
    spawnTimes = spawnTimes.filter(time => now - time < 5000);

    // 최근 5초 동안 최대 7개 생성
    if (spawnTimes.length >= 7) return;

    // 직전에 나온 단어와 겹치지 않게 선택
    const choices = words.filter(item => item.word !== lastWord);
    const item = choices[Math.floor(Math.random() * choices.length)];

    lastWord = item.word;
    lastSpawnTime = now;
    spawnTimes.push(now);

    const el = document.createElement("div");

    el.className = "word";
    el.textContent = item.word;
    el.dataset.type = item.type;
    el.dataset.word = item.word;

    const maxX = Math.max(0, arena.clientWidth - 90);

    el.style.left = Math.random() * maxX + "px";
    el.style.top = "-48px";

    el.addEventListener("pointerdown", event => {
        if (!playing || drag) return;

        event.preventDefault();

        drag = {
            element: el,
            startX: event.clientX,
            startY: event.clientY,
            startLeft: el.offsetLeft,
            startTop: el.offsetTop,
            moved: false
        };

        el.classList.add("dragging");
        el.setPointerCapture(event.pointerId);
    });

    el.addEventListener("pointermove", event => {
        if (!drag || drag.element !== el) return;

        const dx = event.clientX - drag.startX;
        const dy = event.clientY - drag.startY;

        if (Math.abs(dx) > 3 || Math.abs(dy) > 3) {
            drag.moved = true;
        }

        if (!drag.moved) return;

        el.style.left = Math.max(
            0,
            Math.min(
                arena.clientWidth - el.offsetWidth,
                drag.startLeft + dx
            )
        ) + "px";

        // 상자까지 끌어갈 수 있도록 아래쪽 이동 허용
        el.style.top = Math.max(
            -10,
            drag.startTop + dy
        ) + "px";

        const basket = getBasketAt(event.clientX, event.clientY);

        baskets.forEach(b => {
            b.classList.toggle("drag-over", b === basket);
        });
    });

    el.addEventListener("pointerup", event => {
        if (!drag || drag.element !== el) return;

        const wasDragged = drag.moved;
        const basket = wasDragged
            ? getBasketAt(event.clientX, event.clientY)
            : null;

        el.classList.remove("dragging");
        baskets.forEach(b => b.classList.remove("drag-over"));

        drag = null;

        if (basket) {
            sortWord(el, basket.dataset.type);
        }
    });

    el.addEventListener("pointercancel", () => {
        if (drag && drag.element === el) {
            drag = null;
            el.classList.remove("dragging");
            baskets.forEach(b => b.classList.remove("drag-over"));
        }
    });

    arena.appendChild(el);
}

function sortWord(el, chosenType) {
    if (!playing || !el.isConnected) return;

    const correct = el.dataset.type === chosenType;
    const word = el.dataset.word;

    if (correct) {
        score += 3;
        feedback.textContent = `정답! ${word} (+3점)`;

        if (score > best) {
            best = score;
            localStorage.setItem("modifierBest", best);
            bestText.textContent = best;
        }

        el.remove();
        updateStats();
    } else {
        feedback.textContent = `아쉽다! ${word}의 품사를 다시 확인해 봐.`;
        el.remove();
        loseLife();
    }
}

function moveWords() {
    if (!playing) return;

    const elapsed = (Date.now() - startTime) / 1000;

    // 1초에 1px부터 시작해 최대 3.5px까지 빨라짐
    const speed = Math.min(1 + elapsed * 0.025, 3.5);

    arena.querySelectorAll(".word").forEach(el => {
        if (!playing) return;
        if (drag && drag.element === el) return;

        const top = parseFloat(el.style.top) || 0;
        el.style.top = top + speed + "px";

        if (top >= arena.clientHeight - el.offsetHeight) {
            el.remove();
            feedback.textContent = "단어를 놓쳤어! 하트가 줄었어.";
            loseLife();
        }
    });
}

function loseLife() {
    if (!playing) return;

    lives--;
    updateStats();

    if (lives <= 0) {
        gameOver();
    }
}

function gameOver() {
    playing = false;
    clearTimers();

    drag = null;

    arena.querySelectorAll(".word").forEach(el => el.remove());
    baskets.forEach(b => b.classList.remove("drag-over"));

    notice.innerHTML = `
        <div class="notice-card">
            <span class="notice-icon">🌷</span>
            <h2>게임 오버!</h2>
            <p>최종 점수: ${score}점</p>
            <p>최고 점수: ${best}점</p>
        </div>
    `;

    notice.style.display = "grid";
    feedback.textContent = "다시 도전해 봐!";
    startBtn.disabled = false;
    startBtn.textContent = "다시 시작하기";
}

startBtn.addEventListener("click", startGame);

updateStats();
S