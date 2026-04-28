// game.js — загрузка Unity WebGL (Brotli-сжатие)

// Конфигурация сборки
const buildUrl = "../WebGL/Build"; // папка с файлами билда относительно game.html
const config = {
    dataUrl: `${buildUrl}/WebGL.data.br`,
    frameworkUrl: `${buildUrl}/WebGL.framework.js.br`,
    codeUrl: `${buildUrl}/WebGL.wasm.br`,
    streamingAssetsUrl: "StreamingAssets",
    companyName: "VR/AR/IT-квантум",
    productName: "Неугомонный Генри",
    productVersion: "1.0",
};

// Элементы DOM
const container = document.querySelector("#unity-container");
const canvas = document.querySelector("#unity-canvas");
const loadingBar = document.querySelector("#unity-loading-bar");
const progressBarFull = document.querySelector("#unity-progress-bar-full");

// Скрываем canvas до полной загрузки
if (canvas) canvas.style.display = "none";
if (loadingBar) loadingBar.style.display = "flex";

// Обновление прогресса
function unityProgress(progress) {
    if (progressBarFull) {
        progressBarFull.style.width = `${100 * progress}%`;
    }
}

// Запуск загрузки
if (typeof createUnityInstance !== "undefined") {
    createUnityInstance(canvas, config, unityProgress)
        .then((unityInstance) => {
            if (loadingBar) loadingBar.style.display = "none";
            if (canvas) canvas.style.display = "block";
            window.unityGame = unityInstance; // сохраняем экземпляр
        })
        .catch((error) => {
            console.error("Ошибка загрузки Unity:", error);
            if (loadingBar) {
                loadingBar.innerHTML = `<p style="color:red; text-align:center;">
                    Не удалось загрузить игру.<br>
                    Убедитесь, что сервер поддерживает Brotli (.br) и файлы лежат в папке Build.
                </p>`;
            }
        });
} else {
    console.error("Unity Loader не найден. Подключите WebGL.Loader.js");
    if (loadingBar) {
        loadingBar.innerHTML = "<p style='color:red;'>Ошибка: отсутствует загрузчик Unity.</p>";
    }
}