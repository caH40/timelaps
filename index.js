require('dotenv').config();
const download = require('image-downloader');
const path = require('path');
const fs = require('fs'); // Добавлено: для проверки существования директории
const CronJob = require('cron').CronJob;

let index = 0; // Используем let вместо var

// Получаем все веб-номера из переменных окружения
const webNumbers = [];
for (const envKey of Object.keys(process.env)) {
    if (envKey.startsWith('URL_WEB')) {
        const num = envKey.slice(7);
        // Проверяем, что после URL_WEB идет число
        if (/^\d+$/.test(num)) {
            webNumbers.push(num);
        }
    }
}

// Проверяем, что есть хотя бы одна URL для работы
if (webNumbers.length === 0) {
    console.error('❌ Не найдено переменных окружения URL_WEB*');
    console.error('Добавьте в .env файл переменные вида:');
    console.error('URL_WEB1=https://example.com/screenshot1');
    console.error('URL_WEB2=https://example.com/screenshot2');
    process.exit(1);
}

// Создаем директории, если они не существуют
for (const webNumber of webNumbers) {
    const dirPath = path.join(__dirname, `images/web${webNumber}`);
    if (!fs.existsSync(dirPath)) {
        fs.mkdirSync(dirPath, { recursive: true });
        console.log(`✅ Создана директория: ${dirPath}`);
    }
}

const job = new CronJob(
    '*/3 * * * *', // Каждые 3 минуты
    async function () {
        console.log(`🔄 Запуск задачи #${index + 1} в ${new Date().toLocaleString()}`);
        
        for (const webNumber of webNumbers) {
            try {
                const url = process.env[`URL_WEB${webNumber}`];
                if (!url) {
                    console.error(`❌ URL_WEB${webNumber} не определен в .env файле`);
                    continue;
                }
                
                await screenDownload(index, `images/web${webNumber}`, url);
            } catch (error) {
                console.error(`❌ Ошибка при обработке web${webNumber}:`, error.message);
            }
        }
        
        index++;
        console.log(`✅ Задача #${index} завершена`);
    },
    null, // onComplete
    true, // start сразу
    'Europe/Moscow' // временная зона (измените на свою)
);

async function screenDownload(indexNum, dir, url) {
    try {
        const dirPath = path.join(__dirname, dir);
        
        // Проверяем существование директории
        if (!fs.existsSync(dirPath)) {
            fs.mkdirSync(dirPath, { recursive: true });
        }
        
        const filename = `${indexNum + 1}.jpg`; // +1 чтобы начать с 1
        const filepath = path.join(dirPath, filename);
        
        const options = {
            url: url,
            dest: filepath,
            timeout: 30000, // 30 секунд таймаут
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
            }
        };
        
        console.log(`📥 Скачивание: ${url} -> ${filepath}`);
        const result = await download.image(options);
        console.log(`✅ Успешно: ${result.filename}`);
        
    } catch (error) {
        console.error(`❌ Ошибка скачивания ${url}:`, error.message);
        // Не выбрасываем ошибку дальше, чтобы не прерывать другие загрузки
    }
}

// Обработка завершения программы
process.on('SIGINT', () => {
    console.log('\n🛑 Остановка задачи...');
    job.stop();
    process.exit(0);
});

console.log('🚀 Запущен планировщик скриншотов');
console.log(`📊 Найдено URL для мониторинга: ${webNumbers.length}`);
console.log('⏰ Расписание: каждые 3 минуты');
console.log('Press Ctrl+C to stop\n');