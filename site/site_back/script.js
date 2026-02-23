const map = L.map('map').setView([55.79, 49.12], 13);
L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}.png').addTo(map);

const lamps = [
    { id: 'KZN-CENTRAL-001', status: 'working', lat: 55.7900, lng: 49.1150, address: 'Кремль, 1' },
    { id: 'KZN-CENTRAL-002', status: 'working', lat: 55.7910, lng: 49.1200, address: 'ул. Баумана, 15' },
    { id: 'KZN-CENTRAL-003', status: 'replace', lat: 55.7920, lng: 49.1220, address: 'ул. Баумана, 30' },
    { id: 'KZN-CENTRAL-004', status: 'burnt_out', lat: 55.7890, lng: 49.1180, address: 'ул. Кремлёвская, 10' },
    { id: 'KZN-CENTRAL-005', status: 'working', lat: 55.7880, lng: 49.1250, address: 'ул. Кремлёвская, 25' },
    { id: 'KZN-CENTRAL-006', status: 'working', lat: 55.7850, lng: 49.1220, address: 'пл. Тукая, 1' },
    { id: 'KZN-CENTRAL-007', status: 'replace', lat: 55.7840, lng: 49.1240, address: 'ул. Пушкина, 5' },
    { id: 'KZN-CENTRAL-008', status: 'working', lat: 55.7835, lng: 49.1270, address: 'ул. Пушкина, 22' },
    { id: 'KZN-CENTRAL-009', status: 'burnt_out', lat: 55.7860, lng: 49.1190, address: 'ул. Гоголя, 3' },
    { id: 'KZN-CENTRAL-010', status: 'working', lat: 55.7870, lng: 49.1170, address: 'ул. Гоголя, 8' },
    { id: 'KZN-SUKON-011', status: 'working', lat: 55.7750, lng: 49.1300, address: 'ул. Петербургская, 52' },
    { id: 'KZN-SUKON-012', status: 'replace', lat: 55.7740, lng: 49.1320, address: 'ул. Петербургская, 70' },
    { id: 'KZN-SUKON-013', status: 'working', lat: 55.7730, lng: 49.1350, address: 'ул. Эсперанто, 15' },
    { id: 'KZN-SUKON-014', status: 'burnt_out', lat: 55.7760, lng: 49.1280, address: 'ул. Эсперанто, 30' },
    { id: 'KZN-SUKON-015', status: 'working', lat: 55.7745, lng: 49.1400, address: 'ул. Хади Такташа, 5' },
    { id: 'KZN-NOVO-016', status: 'working', lat: 55.8200, lng: 49.1300, address: 'ул. Четаева, 18а' },
    { id: 'KZN-NOVO-017', status: 'replace', lat: 55.8210, lng: 49.1320, address: 'ул. Четаева, 10' },
    { id: 'KZN-NOVO-018', status: 'working', lat: 55.8220, lng: 49.1280, address: 'ул. Амирхана, 15' },
    { id: 'KZN-NOVO-019', status: 'burnt_out', lat: 55.8190, lng: 49.1350, address: 'ул. Амирхана, 30' },
    { id: 'KZN-NOVO-020', status: 'working', lat: 55.8180, lng: 49.1400, address: 'ул. Ямашева, 45' },
];

function getColor(status) {
    switch(status) {
        case 'working': return '#4caf50';
        case 'burnt_out': return '#9e9e9e';
        case 'replace': return '#ff9800';
        default: return '#2196f3';
    }
}

const markers = {};
lamps.forEach(lamp => {
    const marker = L.circleMarker([lamp.lat, lamp.lng], {
        radius: 8,
        color: getColor(lamp.status),
        fillColor: getColor(lamp.status),
        fillOpacity: 0.9,
        weight: 2
    }).addTo(map);
    
    marker.on('click', () => selectLamp(lamp.id));
    markers[lamp.id] = marker;
});

document.getElementById('queue-list').innerHTML = lamps
    .filter(l => l.status === 'replace' || l.status === 'burnt_out')
    .map(l => `<div class="queue-item">${l.id} - ${l.address}</div>`)
    .join('');

let currentLamp = null;
const video = document.getElementById('replacement-video');

console.log('Видео элемент:', video);

function selectLamp(id) {
    currentLamp = lamps.find(l => l.id === id);
    if (!currentLamp) return;
    
    document.getElementById('no-selection').style.display = 'none';
    document.getElementById('selected-lamp').style.display = 'block';
    
    document.getElementById('lamp-id').innerText = currentLamp.id;
    document.getElementById('lamp-address').innerText = currentLamp.address;
    
    let statusText = '';
    switch(currentLamp.status) {
        case 'working': statusText = '✅ Работает'; break;
        case 'burnt_out': statusText = '❌ Перегорела'; break;
        case 'replace': statusText = '⚠️ Требует замены'; break;
    }
    document.getElementById('lamp-status').innerText = statusText;
    
    Object.values(markers).forEach(m => m.setStyle({ weight: 2 }));
    markers[id].setStyle({ weight: 4 });
}

document.getElementById('replace-btn').addEventListener('click', () => {
    if (!currentLamp) {
        alert('Сначала выберите лампу');
        return;
    }
    
    const btn = document.getElementById('replace-btn');
    btn.disabled = true;
    btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Замена...';
    document.getElementById('drone-status').innerHTML = '🚁 Дрон вылетел';
    
    if (video) {
        console.log('Запуск видео');
        video.currentTime = 0;
        video.play().catch(e => {
            console.error('Ошибка воспроизведения:', e);
            alert('Нажмите на видео для запуска');
        });
    }
    
    setTimeout(() => {
        currentLamp.status = 'working';
        markers[currentLamp.id].setStyle({ color: '#4caf50', fillColor: '#4caf50' });
        document.getElementById('lamp-status').innerText = '✅ Работает';
        
        btn.disabled = false;
        btn.innerHTML = '<i class="fas fa-play"></i> Запустить замену';
        document.getElementById('drone-status').innerHTML = '⏳ Дрон на базе';
        
        if (video) {
            video.pause();
        }
    }, 5000);
});