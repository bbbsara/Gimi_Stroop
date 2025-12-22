// ==========================================
// ✅ الرابط الجديد (الذي قمنا بتحديثه)
const GOOGLE_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbwj1RDXx22MRzaiXzu9tJ35Q_aQhi2XlV2-37pkvqyKf9EQbFBH5UD8D6z1-qcxERXT/exec";
// ==========================================

// قائمة الألوان
const wordsList = ["أحمر", "أزرق", "أخضر", "أصفر", "برتقالي"];
const colorsHex = {
    "أحمر": "#ff3b30",
    "أزرق": "#007aff",
    "أخضر": "#4cd964",
    "أصفر": "#ffeb3b",
    "برتقالي": "#ff9500"
};

// إعدادات الاختبار
const TRIALS_PER_PHASE = 20; 
let currentPhase = 1; 
let currentTrial = 0;

// بيانات الطالب
let studentName = "";
let studentGrade = "";
let studentGender = "";

// إحصائيات
let p1_wrong = 0;
let p1_times = [];
let p2_wrong = 0;
let p2_times = [];

// متغيرات الوقت
let trialStart = 0;
let correctAnswer = "";
let phaseStartTime = 0;
let timerInterval;

// عناصر HTML
const startScreen = document.getElementById("start-screen");
const instructionScreen = document.getElementById("instruction-screen");
const testContainer = document.getElementById("test-container");
const endScreen = document.getElementById("end-screen");

const wordEl = document.getElementById("word");
const counterEl = document.getElementById("counter");
const timerEl = document.getElementById("timer");
const buttonsContainer = document.getElementById("buttons");

// --- 1. زر البداية ---
document.getElementById("start-btn").onclick = () => {
    studentName = document.getElementById("student-name").value.trim();
    
    // قراءة البيانات الجديدة بأمان
    const gradeInput = document.getElementById("student-grade");
    const genderInput = document.getElementById("student-gender");
    studentGrade = gradeInput ? gradeInput.value.trim() : "";
    studentGender = genderInput ? genderInput.value : "";

    if (!studentName || !studentGrade || !studentGender) {
        alert("الرجاء تعبئة جميع الحقول (الاسم، المرحلة، الجنس)");
        return;
    }
    
    startScreen.style.display = "none";
    
    // توليد الأزرار الـ 5 مرة واحدة عند البداية
    createButtons();
    
    preparePhase(1); 
};

// --- دالة إنشاء الأزرار (التي كانت ناقصة) ---
function createButtons() {
    buttonsContainer.innerHTML = ""; // تنظيف
    wordsList.forEach(colorName => {
        let btn = document.createElement("button");
        btn.className = "btn"; // ليأخذ الستايل من CSS
        btn.style.backgroundColor = colorsHex[colorName]; // لون الزر
        btn.setAttribute("data-color", colorName); // تخزين اسم اللون
        
        // عند الضغط على الزر
        btn.onclick = () => checkAnswer(colorName);
        
        buttonsContainer.appendChild(btn);
    });
}

// --- 2. تجهيز المرحلة ---
function preparePhase(phaseNum) {
    currentPhase = phaseNum;
    currentTrial = 0;
    
    testContainer.style.display = "none";
    instructionScreen.style.display = "block";
    document.body.style.backgroundColor = "#ffffff"; // خلفية بيضاء للتعليمات

    clearInterval(timerInterval);

    // نصوص التعليمات
    if (phaseNum === 1) {
        document.getElementById("phase-title").innerText = "المرحلة الأولى (السهلة)";
        document.getElementById("phase-desc").innerHTML = `
            ستظهر الكلمة باللون <strong>الأسود</strong>.<br>
            المطلوب: اقرأ الكلمة واضغط على المربع الذي يحمل نفس لون معناها.
        `;
    } else {
        document.getElementById("phase-title").innerText = "المرحلة الثانية (الصعبة)";
        document.getElementById("phase-desc").innerHTML = `
            ستظهر الكلمة بلون خط مختلف عن معناها!<br>
            المطلوب: تجاهل الكلمة واضغط على <strong>لون الخط</strong>.
        `;
    }
}

// زر بدء المرحلة
document.getElementById("phase-start-btn").onclick = () => {
    instructionScreen.style.display = "none";
    testContainer.style.display = "flex"; // أعدنا الـ flex ليظهر التنسيق
    
    document.getElementById("phase-indicator").innerText = 
        currentPhase === 1 ? "المرحلة: 1 (سهلة)" : "المرحلة: 2 (ستروب)";

    phaseStartTime = Date.now();
    timerInterval = setInterval(() => {
        let elapsed = Math.floor((Date.now() - phaseStartTime) / 1000);
        timerEl.innerText = `الزمن: ${elapsed} ث`;
    }, 1000);

    nextTrial();
};

// --- 3. تشغيل السؤال التالي ---
function nextTrial() {
    // شرط التوقف: إذا انتهت المحاولات
    if (currentTrial >= TRIALS_PER_PHASE) {
        clearInterval(timerInterval);
        if (currentPhase === 1) {
            preparePhase(2); // الانتقال للمرحلة الثانية
        } else {
            finishTest(); // إنهاء الاختبار
        }
        return;
    }

    currentTrial++;
    counterEl.innerText = `${currentTrial} / ${TRIALS_PER_PHASE}`;

    let wordText = pickRandom(wordsList);
    let inkColorName; 
    let backgroundTarget; // اللون الذي ستأخذه الخلفية

    if (currentPhase === 1) {
        // === المرحلة الأولى: الكلمة أسود، الخلفية بلون الكلمة ===
        wordEl.style.color = "black"; // طلبك: الكلمة بالأسود
        inkColorName = wordText;      // الإجابة الصحيحة هي معنى الكلمة
        backgroundTarget = wordText;  // الخلفية تطابق الكلمة
    } else {
        // === المرحلة الثانية: الكلمة بلون مختلف ===
        inkColorName = pickRandom(wordsList);
        while (inkColorName === wordText) {
            inkColorName = pickRandom(wordsList);
        }
        wordEl.style.color = colorsHex[inkColorName]; // لون الخط
        backgroundTarget = inkColorName; // الخلفية تطابق لون الخط (لزيادة التركيز)
    }

    wordEl.innerText = wordText;
    document.body.style.backgroundColor = colorsHex[backgroundTarget]; // تغيير الخلفية
    
    correctAnswer = inkColorName; // الإجابة الصحيحة هي "اللون" الظاهر
    trialStart = performance.now();
}

// --- 4. فحص الإجابة ---
function checkAnswer(selectedColor) {
    let timeTaken = Math.round(performance.now() - trialStart);

    if (currentPhase === 1) {
        p1_times.push(timeTaken);
        if (selectedColor !== correctAnswer) p1_wrong++;
    } else {
        p2_times.push(timeTaken);
        if (selectedColor !== correctAnswer) p2_wrong++;
    }

    // الانتقال للسؤال التالي
    nextTrial();
}

function pickRandom(arr) {
    return arr[Math.floor(Math.random() * arr.length)];
}

// --- 5. إنهاء وإرسال النتائج ---
function finishTest() {
    testContainer.style.display = "none";
    endScreen.style.display = "block";
    document.body.style.backgroundColor = "#f4f4f4";

    // حساب المتوسطات
    const sum1 = p1_times.reduce((a,b)=>a+b, 0);
    const avg1 = Math.round(sum1 / p1_times.length) || 0;
    
    const sum2 = p2_times.reduce((a,b)=>a+b, 0);
    const avg2 = Math.round(sum2 / p2_times.length) || 0;

    const stroopEffect = avg2 - avg1;
    const totalAvg = Math.round((sum1 + sum2) / (p1_times.length + p2_times.length));

    // عرض النتائج
    document.getElementById("res-name").innerText = studentName;
    document.getElementById("res-p1").innerText = avg1 + " ms";
    document.getElementById("res-p1-wrong").innerText = p1_wrong;
    document.getElementById("res-p2").innerText = avg2 + " ms";
    document.getElementById("res-p2-wrong").innerText = p2_wrong;
    document.getElementById("res-stroop").innerText = stroopEffect + " ms";
    document.getElementById("res-avg").innerText = totalAvg + " ms";

    sendData(avg1, p1_wrong, avg2, p2_wrong, totalAvg, stroopEffect);
}

function sendData(p1Time, p1Wr, p2Time, p2Wr, avg, stroop) {
    const status = document.getElementById("status-msg");
    status.innerText = "جاري الحفظ...";
    
    const dataToSend = {
        name: studentName,
        grade: studentGrade,
        gender: studentGender,
        p1_time: p1Time,
        p1_wrong: p1Wr,
        p2_time: p2Time,
        p2_wrong: p2Wr,
        avg_time: avg,
        stroop_effect: stroop
    };

    fetch(GOOGLE_SCRIPT_URL, {
        method: "POST",
        mode: "no-cors",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(dataToSend)
    })
    .then(() => {
        status.innerHTML = "<b style='color:green'>✅ تم الحفظ بنجاح!</b>";
    })
    .catch(err => {
        status.innerHTML = "<b style='color:red'>❌ خطأ في الاتصال</b>";
    });
}
