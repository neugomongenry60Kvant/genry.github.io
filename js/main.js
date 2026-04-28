// 1. Указываем, где взять worker (берём с того же CDN)
pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/2.16.105/pdf.worker.min.js';

// 2. Путь к PDF – абсолютный от корня сайта (когда сервер запущен)
const pdfUrl = '/data/Neugomonny_Genri.pdf';
const container = document.getElementById('pdf-scroll-container');

// 3. Функция отрисовки всех страниц друг под другом
function renderAllPages(pdf) {
    container.innerHTML = ''; // очищаем контейнер
    const totalPages = pdf.numPages;

    for (let pageNum = 1; pageNum <= totalPages; pageNum++) {
        pdf.getPage(pageNum).then(page => {
            // Адаптивный масштаб: ширина canvas = ширине контейнера минус отступы
            const containerWidth = container.clientWidth - 20;
            const scale = containerWidth / page.getViewport({ scale: 1 }).width;
            const viewport = page.getViewport({ scale: scale });

            const canvas = document.createElement('canvas');
            canvas.width = viewport.width;
            canvas.height = viewport.height;
            canvas.style.display = 'block';
            canvas.style.margin = '0 auto 20px auto';
            canvas.style.boxShadow = '0 0 8px rgba(0,0,0,0.1)';
            container.appendChild(canvas);

            const ctx = canvas.getContext('2d');
            page.render({ canvasContext: ctx, viewport: viewport });
        }).catch(err => console.error(`Ошибка страницы ${pageNum}:`, err));
    }
}

// 4. Загрузка PDF (если контейнер существует)
if (container) {
    pdfjsLib.getDocument(pdfUrl).promise
        .then(pdfDoc => renderAllPages(pdfDoc))
        .catch(error => {
            console.error('Ошибка загрузки PDF:', error);
            container.innerHTML = '<p style="color:red; text-align:center;">Не удалось загрузить PDF. Убедитесь, что вы открыли сайт через веб‑сервер (http://), а не file://, и что файл лежит по пути /data/Rabota_s_API.pdf</p>';
        });
}

// ---------- Всплывающее окно с напоминанием ----------

// Проверяем, не находимся ли мы на странице игры
const isGamePage = window.location.pathname.includes('game.html');

if (!isGamePage) {
    // Создаём стили для модального окна
    const style = document.createElement('style');
    style.textContent = `
        .reminder-modal-overlay {
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background-color: rgba(0, 0, 0, 0.5);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 10000;
            visibility: hidden;
            opacity: 0;
            transition: opacity 0.3s ease, visibility 0.3s;
        }
        .reminder-modal-overlay.show {
            visibility: visible;
            opacity: 1;
        }
        .reminder-modal {
            background: #fff8f0;
            border-radius: 24px;
            padding: 30px 40px;
            max-width: 420px;
            width: 90%;
            text-align: center;
            box-shadow: 0 20px 40px rgba(0,0,0,0.2);
            position: relative;
            font-family: 'FOT-Carat SHA UB', sans-serif;
            letter-spacing: 1.5px;
            border: 2px solid #b5853b;
        }
        .reminder-modal p {
            font-size: 1.4rem;
            color: #3a2e28;
            margin: 10px 0 30px;
            line-height: 1.5;
        }
        .reminder-close {
            position: absolute;
            top: 12px;
            right: 16px;
            background: none;
            border: none;
            font-size: 32px;
            cursor: pointer;
            color: #8f6b2e;
            transition: color 0.2s;
            line-height: 1;
            padding: 0 5px;
        }
        .reminder-close:hover {
            color: #5a3e1a;
        }
        .reminder-btn {
            background-color: #9e6b4b;
            color: #faf3e8;
            border: none;
            border-radius: 50px;
            padding: 12px 36px;
            font-size: 1.3rem;
            font-weight: bold;
            cursor: pointer;
            transition: background 0.2s, transform 0.1s;
            letter-spacing: 2px;
            box-shadow: 0 4px 8px rgba(0,0,0,0.1);
            font-family: inherit;
        }
        .reminder-btn:hover {
            background-color: #7e533a;
            transform: scale(1.02);
        }
        .reminder-btn:active {
            transform: scale(0.98);
        }
    `;
    document.head.appendChild(style);

    // Создаём DOM-элементы окна
    const overlay = document.createElement('div');
    overlay.className = 'reminder-modal-overlay';
    
    const modal = document.createElement('div');
    modal.className = 'reminder-modal';
    
    const closeBtn = document.createElement('button');
    closeBtn.className = 'reminder-close';
    closeBtn.innerHTML = '&times;';
    closeBtn.setAttribute('aria-label', 'Закрыть');
    
    const message = document.createElement('p');
    message.textContent = 'не забудь поиграть в нашу игру и получить приглашение в приют!';
    
    const goBtn = document.createElement('button');
    goBtn.className = 'reminder-btn';
    goBtn.textContent = 'Перейти';
    
    modal.appendChild(closeBtn);
    modal.appendChild(message);
    modal.appendChild(goBtn);
    overlay.appendChild(modal);
    document.body.appendChild(overlay);

    // Функция показа окна
    function showModal() {
        overlay.classList.add('show');
    }

    // Функция скрытия окна
    function hideModal() {
        overlay.classList.remove('show');
    }

    // Переменные для управления таймерами
    let firstTimeout = null;
    let repeatInterval = null;

    // Функция запуска повторяющихся показов
    function scheduleNextShow() {
        if (repeatInterval) clearInterval(repeatInterval);
        // Случайный интервал от 2 до 3 минут (120000 – 180000 мс)
        const intervalMs = Math.floor(Math.random() * (180000 - 120000 + 1)) + 120000;
        repeatInterval = setInterval(() => {
            showModal();
        }, intervalMs);
    }

    // Функция остановки всех таймеров
    function stopTimers() {
        if (firstTimeout) {
            clearTimeout(firstTimeout);
            firstTimeout = null;
        }
        if (repeatInterval) {
            clearInterval(repeatInterval);
            repeatInterval = null;
        }
    }

    // Запускаем первый показ через 30 секунд
    firstTimeout = setTimeout(() => {
        showModal();
        // После первого показа запускаем повторяющиеся
        scheduleNextShow();
    }, 30000);

    // Обработчики закрытия
    closeBtn.addEventListener('click', () => {
        hideModal();
        // После закрытия таймеры продолжают работать (следующий показ по расписанию)
    });

    overlay.addEventListener('click', (e) => {
        if (e.target === overlay) {
            hideModal();
        }
    });

    // Кнопка "Перейти"
    goBtn.addEventListener('click', () => {
        stopTimers();           // Останавливаем таймеры, чтобы не осталось в памяти
        window.location.href = 'game.html';
    });

    // Если окно закрыто вручную, таймеры не сбрасываются — следующее появление будет по расписанию.
    // При уходе со страницы тоже хорошо бы очистить таймеры (не обязательно, но чисто)
    window.addEventListener('beforeunload', () => {
        stopTimers();
    });
}