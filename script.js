// ==========================================
// رابط Web App الخاص بك (تم التحديث)
const GOOGLE_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbypwGjMqJx2lT_L7wbPcuuj6_UShdCR1kPhG045lW4HvQScuNl4NiHcSGihZYgYNMEG/exec";
// ==========================================

const words = ["أحمر", "أزرق", "أخضر", "أصفر", "برتقالي"];
const colorsHex = {
    "أحمر": "#ff3b30",
    "أزرق": "#007aff",
    "أخضر": "#4cd964",
    "أصفر": "#ffeb3b",
    "برتقالي": "#ff9500"
};

// إعدادات الاختبار
// يمكنك تعديل هذا الرقم لزيادة أو تقليل عدد الأسئلة في كل مرحلة
const TRIALS_PER_PHASE = 20; 

let currentPhase = 1; // 1 = متطابقة، 2 = مختلفة
let currentTrial = 0;

// بيانات الطالب
let studentName = "";

// إحصائيات المرحلة الأولى (السهلة)
let p1_wrong = 0;
let p1_times = [];

// إحصائيات المرحلة الثانية (الصعبة)
let p2_wrong = 0;
let p2_times = [];

// متغيرات مؤقتة
let trialStart = 0;
let correctAnswer = "";

// عناصر الواجهة
const startScreen = document.getElementById("start-screen");
const instructionScreen = document.getElementById("instruction-screen");
const testContainer = document.getElementById("test-container");
const endScreen = document.getElementById("end-screen");

const phaseTitle = document.getElementById("phase-title");
const phaseDesc = document.getElementById("phase-desc");
const phaseStartBtn = document.getElementById("phase-start-btn");

const wordEl = document.getElementById("word");
const counterEl = document.getElementById("counter");
const phaseIndEl = document.getElementById("phase-indicator");

// --- 1. زر البداية الرئيسي ---
document.getElementById("start-btn").onclick = () => {
    studentName = document.getElementById("student-name").value.trim();
    if (!studentName) return alert("الرجاء كتابة اسم الطالب");
    
    startScreen.style.display = "none";
    preparePhase(1); // البدء بالمرحلة الأولى
};

// --- 2. تجهيز المرحلة (تعليمات) ---
function preparePhase(phaseNum) {
    currentPhase = phaseNum;
    currentTrial = 0;
    
    // إخفاء الاختبار، إظهار التعليمات
    testContainer.style.display = "none";
    instructionScreen.style.display = "block";
    document.body.style.backgroundColor = "#ffffff"; // إعادة الخلفية للأبيض

    if (phaseNum === 1) {
        phaseTitle.textContent = "المرحلة الأولى (السهلة)";
        phaseDesc.innerHTML = "في هذه المرحلة، <strong>لون الخلفية</strong> سيطابق الكلمة المكتوبة دائماً.<br>المطلوب: اضغط على الزر الذي يطابق اللون بأسرع ما يمكن.";
    } else {
        phaseTitle.textContent = "المرحلة الثانية (الصعبة)";
        phaseDesc.innerHTML = "في هذه المرحلة، <strong>لون الخلفية</strong> سيختلف عن الكلمة!<br>ركز على <strong>لون الخلفية</strong> فقط وتجاهل الكلمة.";
    }
}

// زر بدء المرحلة من شاشة التعليمات
phaseStartBtn.onclick = () => {
    instructionScreen.style.display = "none";
    testContainer.style.display = "flex";
    phaseIndEl.textContent = currentPhase === 1 ? "المرحلة: سهلة" : "المرحلة: صعبة (ستروب)";
    nextTrial();
};

// --- 3. تشغيل المحاولة ---
function nextTrial() {
    currentTrial++;
    
    // هل انتهت المرحلة الحالية؟
    if (currentTrial > TRIALS_PER_PHASE) {
        if (currentPhase === 1) {
            preparePhase(2); // الانتقال للمرحلة الثانية
        } else {
            finishTest(); // انتهاء الاختبار بالكامل
        }
        return;
    }

    counterEl.textContent = `${currentTrial} / ${TRIALS_PER_PHASE}`;

    let wordText = pickRandom(words);
    let bgColor;

    if (currentPhase === 1) {
        // المرحلة السهلة: تطابق تام
        bgColor = wordText;
    } else {
        // المرحلة الصعبة: اختلاف إجباري
        bgColor = pickRandom(words);
        while (bgColor === wordText) {
            bgColor = pickRandom(words);
        }
    }

    // تطبيق الألوان
    document.body.style.backgroundColor = colorsHex[bgColor];
    wordEl.textContent = wordText;
    correctAnswer = bgColor; // الإجابة الصحيحة دائماً هي لون الخلفية

    trialStart = performance.now();
}

function pickRandom(arr) {
    return arr[Math.floor(Math.random() * arr.length)];
}

// --- 4. التحقق من الإجابة ---
document.querySelectorAll(".btn").forEach(btn => {
    btn.onclick = () => {
        if (testContainer.style.display === "none") return;

        let playerAns = btn.getAttribute("data-color");
        let timeTaken = Math.round(performance.now() - trialStart);

        // تسجيل النتائج حسب المرحلة
        if (currentPhase === 1) {
            p1_times.push(timeTaken);
            if (playerAns !== correctAnswer) p1_wrong++;
        } else {
            p2_times.push(timeTaken);
            if (playerAns !== correctAnswer) p2_wrong++;
        }

        nextTrial();
    };
});

// --- 5. إنهاء وحساب النتائج ---
function finishTest() {
    testContainer.style.display = "none";
    endScreen.style.display = "block";
    document.body.style.backgroundColor = "#f4f4f4";

    // حساب المتوسطات
    const sum1 = p1_times.reduce((a,b)=>a+b, 0);
    const avg1 = Math.round(sum1 / p1_times.length) || 0;

    const sum2 = p2_times.reduce((a,b)=>a+b, 0);
    const avg2 = Math.round(sum2 / p2_times.length) || 0;

    // معادلة تأثير ستروب: (زمن الصعب - زمن السهل)
    const stroopEffect = avg2 - avg1;
    
    // المتوسط العام
    const totalAvg = Math.round((sum1 + sum2) / (p1_times.length + p2_times.length));

    // عرض النتائج على الشاشة
    document.getElementById("res-name").textContent = studentName;
    document.getElementById("res-p1").textContent = avg1 + " ms";
    document.getElementById("res-p1-wrong").textContent = p1_wrong;
    document.getElementById("res-p2").textContent = avg2 + " ms";
    document.getElementById("res-p2-wrong").textContent = p2_wrong;
    document.getElementById("res-stroop").textContent = stroopEffect + " ms";
    document.getElementById("res-avg").textContent = totalAvg + " ms";

    // إرسال البيانات
    sendData(avg1, p1_wrong, avg2, p2_wrong, totalAvg, stroopEffect);
}

function sendData(p1Time, p1Wr, p2Time, p2Wr, avg, stroop) {
    const status = document.getElementById("status-msg");
    status.textContent = "جاري الحفظ في قاعدة البيانات...";
    
    const dataToSend = {
        student_name: studentName,
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
        status.textContent = "✅ تم حفظ النتائج بنجاح في الجدول!";
        status.style.color = "green";
    })
    .catch(err => {
        console.error(err);
        status.textContent = "❌ فشل الاتصال، تأكد من الإنترنت.";
        status.style.color = "red";
    });
}
