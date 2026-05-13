// --- Gestión de Estado (Memoria Volátil en RAM) ---
let flights = [];
let globalReservations = [];

let currentReservationSession = {
    flightId: null,
    passengers: [],
    currentSelectingPassengerId: null
};

let editingReservationId = null;
let editingPassengerId = null; // ID del pasajero en edición

// --- Datos de Destinos ---
const locationsData = {
    "España": ["Madrid", "Cataluña", "Andalucía", "Comunidad Valenciana", "Galicia", "País Vasco", "Canarias", "Castilla y León", "Castilla-La Mancha", "Murcia"],
    "Francia": ["Isla de Francia", "Provenza-Alpes-Costa Azul", "Nueva Aquitania", "Occitania", "Bretaña", "Auvernia-Ródano-Alpes", "Gran Este", "Altos de Francia", "Países del Loira", "Normandía"],
    "Argentina": ["Buenos Aires", "Córdoba", "Santa Fe", "Mendoza", "Tucumán", "Entre Ríos", "Salta", "Misiones", "Chaco", "Corrientes"],
    "Chile": ["Región Metropolitana", "Valparaíso", "Biobío", "Antofagasta", "Araucanía", "Maule", "Coquimbo", "O'Higgins", "Los Lagos", "Tarapacá"],
    "Japón": ["Tokio", "Osaka", "Kioto", "Hokkaido", "Fukuoka", "Kanagawa", "Aichi", "Saitama", "Chiba", "Hyogo"],
    "Corea del Sur": ["Seúl", "Busan", "Incheon", "Daegu", "Daejeon", "Gwangju", "Ulsan", "Gyeonggi", "Gangwon", "Chungcheong del Sur"],
    "Estados Unidos": ["California", "Texas", "Nueva York", "Florida", "Illinois", "Pensilvania", "Ohio", "Georgia", "Carolina del Norte", "Michigan"],
    "Reino Unido": ["Inglaterra", "Escocia", "Gales", "Irlanda del Norte", "Gran Londres", "Midlands Occidentales", "Gran Mánchester", "West Yorkshire", "Hampshire", "Kent"],
    "Perú": ["Lima", "Cusco", "Arequipa", "La Libertad", "Piura", "Cajamarca", "Junín", "Lambayeque", "Puno", "Ancash"]
};

// --- Configuración de Aeronaves ---
const airplaneModels = {
    "ATR 72": { rows: 18, cols: 4, layout: [2, 2], name: "ATR 72" },
    "Airbus A320": { rows: 30, cols: 6, layout: [3, 3], name: "Airbus A320" },
    "Boeing 767": { rows: 40, cols: 7, layout: [2, 3, 2], name: "Boeing 767" },
    "Airbus A330": { rows: 45, cols: 8, layout: [2, 4, 2], name: "Airbus A330" },
    "Boeing 777": { rows: 50, cols: 10, layout: [3, 4, 3], name: "Boeing 777" }
};

const SEAT_LETTERS = "ABCDEFGHIJ";

// --- Elementos del DOM ---
const navLinks = document.querySelectorAll('.encabezado__enlace');
const vistas = document.querySelectorAll('.vista');

// Reserve Elements
const reserveFlightSelect = document.getElementById('selector-vuelo-reserva');

// Reserve Elements
const passengerSection = document.getElementById('seccion-pasajeros');
const formAddPassenger = document.getElementById('formulario-agregar-pasajero');
const passengerList = document.getElementById('lista-pasajeros');
const btnProceedSeats = document.getElementById('btn-proceder-asientos');
const reserveError = document.getElementById('error-reserva');

// Seat Map Elements
const airplaneCabin = document.getElementById('cabina-avion');
const passengerSeatAllocations = document.getElementById('asignaciones-asientos-pasajeros');
const btnConfirmReservation = document.getElementById('btn-confirmar-reserva');
const btnCancelReservation = document.getElementById('btn-cancelar-reserva');
const seatStatusBanner = document.getElementById('banner-estado-asientos');

// Print Elements
const printArea = document.getElementById('area-impresion');

// --- Alerta Personalizada ---
function showAlert(message) {
    const modal = document.getElementById('modal-alerta');
    const msgEl = document.getElementById('modal-alerta-mensaje');
    const btnAceptar = document.getElementById('btn-modal-aceptar');
    const btnCancelar = document.getElementById('btn-modal-cancelar');

    if (!modal) {
        window['alert'](message);
        return;
    }

    msgEl.textContent = message;
    modal.classList.remove('oculto');
    if (btnCancelar) btnCancelar.classList.add('oculto');

    btnAceptar.onclick = () => {
        modal.classList.add('oculto');
    };
}

function showConfirm(message, onConfirm) {
    const modal = document.getElementById('modal-alerta');
    const msgEl = document.getElementById('modal-alerta-mensaje');
    const btnAceptar = document.getElementById('btn-modal-aceptar');
    const btnCancelar = document.getElementById('btn-modal-cancelar');

    if (!modal) {
        if (window.confirm(message)) onConfirm();
        return;
    }

    msgEl.textContent = message;
    modal.classList.remove('oculto');
    if (btnCancelar) btnCancelar.classList.remove('oculto');

    btnAceptar.onclick = () => {
        modal.classList.add('oculto');
        if (btnCancelar) btnCancelar.classList.add('oculto');
        onConfirm();
    };

    if (btnCancelar) {
        btnCancelar.onclick = () => {
            modal.classList.add('oculto');
            btnCancelar.classList.add('oculto');
        };
    }
}

// --- Animación de Escritura (Typewriter) ---
let typewriterSession = 0; // Para cancelar animaciones previas si se cambia de vista rápido

function startTypewriter() {
    const subtitle = document.querySelector('.portada__descripcion-nueva');
    const title = document.querySelector('.portada__titulo-nuevo');
    if (!subtitle || !title) return;

    const currentSession = ++typewriterSession;

    const text1 = "¿Listos para el Despegue?";
    const text2 = "SERVICIO DE RESERVACION<br>DE VUELOS EN LINEA";

    subtitle.innerHTML = "";
    title.innerHTML = "";

    function typeHTML(element, htmlString, speed, callback) {
        let i = 0;
        let isTag = false;
        let text = "";

        function type() {
            if (currentSession !== typewriterSession) return; // Cancel if session changed

            if (i < htmlString.length) {
                let char = htmlString.charAt(i);
                if (char === '<') isTag = true;

                text += char;
                if (!isTag) {
                    element.innerHTML = text;
                    i++;
                    setTimeout(type, speed);
                } else {
                    if (char === '>') {
                        isTag = false;
                        element.innerHTML = text;
                    }
                    i++;
                    type(); // Process tags instantly
                }
            } else if (callback) {
                callback();
            }
        }
        type();
    }

    // Retrasar el inicio un poco para que termine la transición de la vista
    setTimeout(() => {
        if (currentSession !== typewriterSession) return;
        typeHTML(subtitle, text1, 40, () => {
            if (currentSession !== typewriterSession) return;
            typeHTML(title, text2, 35);
        });
    }, 400);
}

// Iniciar animación en la carga inicial
document.addEventListener('DOMContentLoaded', () => {
    startTypewriter();
    initDefaultFlights();
    setupInputRestrictions();
});

// --- Restricción de Caracteres Especiales ---
function setupInputRestrictions() {
    document.addEventListener('input', (e) => {
        if (e.target.tagName === 'INPUT' && (e.target.type === 'text')) {
            // Lista de signos prohibidos (incluyendo los solicitados por el usuario)
            let forbiddenPattern = /[,.:;!"#$%&/()=?¡¿¨*+´{}°§[\]]/g;

            // Si es nombre o apellido, también prohibir números, guiones y guiones bajos
            if (e.target.id === 'nombre-pasajero' || e.target.id === 'apellido-pasajero') {
                forbiddenPattern = /[,.:;!"#$%&/()=?¡¿¨*+´°{}[\]0-9_-]/g;
            }

            if (forbiddenPattern.test(e.target.value)) {
                const start = e.target.selectionStart;
                const end = e.target.selectionEnd;
                e.target.value = e.target.value.replace(forbiddenPattern, '');
                // Restaurar posición del cursor
                const newPos = Math.max(0, start - 1);
                e.target.setSelectionRange(newPos, newPos);
            }
        }
    });
}

// --- Navegación SPA ---

function navigateTo(targetId) {
    // Actualizar clase activa en los enlaces de navegación
    navLinks.forEach(link => {
        if (link.dataset.target === targetId) {
            link.classList.add('encabezado__enlace--activo');
        } else {
            link.classList.remove('encabezado__enlace--activo');
        }
    });

    if (editingReservationId && targetId !== 'vista-mapa-asientos') {
        const res = globalReservations.find(r => r.id === editingReservationId);
        const flight = flights.find(f => f.id === currentReservationSession.flightId);
        if (res && flight) {
            res.passengers.forEach(p => {
                const asiento = flight.seats.find(s => s.id === p.seatId);
                if (asiento) asiento.occupiedBy = { name: p.name, age: p.age, disability: p.disability };
            });
        }
        editingReservationId = null;
        resetReserveForm(); // Asegurar que se limpie la sesión actual
    }

    // Remover vista saliendo a las demás y asignar a la activa anterior (opcional si queremos animación de salida)
    vistas.forEach(vista => {
        if (vista.classList.contains('vista--activa') && vista.id !== targetId) {
            vista.classList.remove('vista--activa');
            vista.classList.add('vista--saliendo');
            setTimeout(() => {
                vista.classList.remove('vista--saliendo');
            }, 400); // Mismo tiempo que la transición CSS
        } else if (vista.id !== targetId) {
            vista.classList.remove('vista--activa', 'vista--saliendo');
        }
    });

    // Activar nueva vista
    vistas.forEach(vista => {
        if (vista.id === targetId) {
            vista.classList.remove('vista--saliendo');
            // Un pequeño delay para que la clase activa entre después del renderizado si es necesario
            setTimeout(() => {
                vista.classList.add('vista--activa');
            }, 10);
        }
    });


    if (targetId === 'vista-mis-reservas') renderPrintView();
    if (targetId === 'vista-reservar') resetReserveForm();
}

navLinks.forEach(link => {
    link.addEventListener('click', (e) => {
        e.preventDefault();
        navigateTo(e.currentTarget.dataset.target);
    });
});

// Vincular botón de búsqueda de la home
const btnSearchHome = document.querySelector('.boton--busqueda');
if (btnSearchHome) btnSearchHome.onclick = () => navigateTo('vista-reservar');

function updateFlightSelect() {
    reserveFlightSelect.innerHTML = '<option value="" disabled selected>Seleccione un vuelo</option>';
    flights.forEach(f => {
        reserveFlightSelect.innerHTML += `<option value="${f.id}">${f.flightNumber} - ${f.origin} -> ${f.destination} (${f.model})</option>`;
    });
}

function generateSeats(model) {
    const config = airplaneModels[model];
    let seats = [];
    for (let r = 1; r <= config.rows; r++) {
        for (let c = 0; c < config.cols; c++) {
            const letter = SEAT_LETTERS[c];
            const seatId = `${r}${letter}`;
            let type = "trasero";
            if (r <= 2) type = "excellence";
            else if (r <= 4) type = "priority";
            else if (r === 5) type = "xl";
            else if (r <= 8) type = "delantero";
            let isEmergency = false;
            if (r === Math.floor(config.rows / 2) || r === Math.floor(config.rows / 2) + 1) {
                isEmergency = true;
                type = "emergencia";
            }

            let esAccesible = false;
            if (!isEmergency) {
                if (model === "ATR 72" && r >= config.rows - 1 && (c === 1 || c === 2)) esAccesible = true;
                else if (model === "Airbus A320" && r <= 2 && (c === 2 || c === 3)) esAccesible = true;
                else if (model === "Boeing 767" && r <= 2 && (c === 2 || c === 4)) esAccesible = true;
                else if (model === "Airbus A330" && r <= 3 && (c === 2 || c === 5)) esAccesible = true;
                else if (model === "Boeing 777" && r <= 4 && (c === 3 || c === 6)) esAccesible = true;
            }

            seats.push({ id: seatId, row: r, colIndex: c, type: type, isEmergency: isEmergency, esAccesible: esAccesible, occupiedBy: null });
        }
    }
    return seats;
}

function initDefaultFlights() {
    flights = [
        { id: "1", flightNumber: "AV-101", origin: "Madrid, España", destination: "París, Francia", model: "Airbus A320" },
        { id: "2", flightNumber: "AV-202", origin: "Buenos Aires, Argentina", destination: "Santiago, Chile", model: "Boeing 767" },
        { id: "3", flightNumber: "AV-303", origin: "Tokio, Japón", destination: "Seúl, Corea del Sur", model: "Airbus A330" },
        { id: "4", flightNumber: "AV-404", origin: "Nueva York, Estados Unidos", destination: "Londres, Reino Unido", model: "Boeing 777" },
        { id: "5", flightNumber: "AV-505", origin: "Lima, Perú", destination: "Cusco, Perú", model: "ATR 72" }
    ];
    flights.forEach(f => f.seats = generateSeats(f.model));
    updateFlightSelect();
}

function updateFlightSelect() {
    reserveFlightSelect.innerHTML = '<option value="" disabled selected>Seleccione un vuelo</option>';
    flights.forEach(f => {
        reserveFlightSelect.innerHTML += `<option value="${f.id}">${f.flightNumber} - ${f.origin} -> ${f.destination} (${f.model})</option>`;
    });
}

// --- Lógica de Reserva y Pasajeros ---
reserveFlightSelect.addEventListener('change', (e) => {
    currentReservationSession.flightId = e.target.value;
    currentReservationSession.passengers = [];
    currentReservationSession.currentSelectingPassengerId = null;
    passengerSection.classList.remove('oculto');
    renderPassengerList();
});

function calcularEdad(fechaNacimiento) {
    const hoy = new Date();
    const cumpleanos = new Date(fechaNacimiento);
    let edad = hoy.getFullYear() - cumpleanos.getFullYear();
    const m = hoy.getMonth() - cumpleanos.getMonth();
    if (m < 0 || (m === 0 && hoy.getDate() < cumpleanos.getDate())) {
        edad--;
    }
    return edad;
}

formAddPassenger.addEventListener('submit', (e) => {
    e.preventDefault();

    if (currentReservationSession.passengers.length >= 8) {
        showAlert("No se pueden agregar más de 8 pasajeros por reservación.");
        return;
    }
    const name = document.getElementById('nombre-pasajero').value.trim();
    const surname = document.getElementById('apellido-pasajero').value.trim();
    const dobValue = document.getElementById('fecha-nacimiento-pasajero').value;
    const disability = document.getElementById('discapacidad-pasajero').checked;

    if (!name || !surname || !dobValue) {
        showAlert("Por favor, complete todos los campos obligatorios.");
        return;
    }

    const age = calcularEdad(dobValue);

    if (age < 0 || age > 110) {
        showAlert("Por favor, ingrese una fecha de nacimiento válida.");
        return;
    }

    if (age === 0 && (new Date(dobValue) > new Date())) {
        showAlert("La fecha de nacimiento no puede ser en el futuro.");
        return;
    }

    if (editingPassengerId) {
        // Modo Edición
        const index = currentReservationSession.passengers.findIndex(p => p.id === editingPassengerId);
        if (index !== -1) {
            currentReservationSession.passengers[index].name = `${name} ${surname}`;
            currentReservationSession.passengers[index].age = age;
            currentReservationSession.passengers[index].disability = disability;
            currentReservationSession.passengers[index].dob = dobValue;
            // Resetear ID de edición y botón
            editingPassengerId = null;
            formAddPassenger.querySelector('button[type="submit"]').textContent = 'Añadir Pasajero';
            formAddPassenger.querySelector('button[type="submit"]').classList.remove('boton--primario');
            formAddPassenger.querySelector('button[type="submit"]').classList.add('boton--secundario');
        }
    } else {
        // Modo Añadir
        currentReservationSession.passengers.push({
            id: Date.now().toString() + Math.random().toString(36).substr(2, 5),
            name: `${name} ${surname}`, age, disability, seatId: null,
            dob: dobValue
        });
    }

    formAddPassenger.reset();
    renderPassengerList();
});

function renderPassengerList() {
    passengerList.innerHTML = '';
    currentReservationSession.passengers.forEach((p, idx) => {
        passengerList.innerHTML += `
            <div class="tarjeta-lista ${editingPassengerId === p.id ? 'border-active' : ''}" style="${editingPassengerId === p.id ? 'border-left: 4px solid var(--color-primary)' : ''}">
                <div class="tarjeta-lista__info">
                    <span class="tarjeta-lista__title">Pasajero ${idx + 1}: ${p.name}</span>
                    <span class="tarjeta-lista__subtitle">Edad: ${p.age} | Discapacidad: ${p.disability ? 'Sí' : 'No'}</span>
                </div>
                <div style="display: flex; gap: 0.5rem;">
                    <button type="button" class="boton boton--icono" style="color: #3B82F6;" onclick="editPassenger('${p.id}')">
                        <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
                    </button>
                    <button type="button" class="boton boton--icono texto-silenciado" onclick="removePassenger('${p.id}')">&times;</button>
                </div>
            </div>
        `;
    });

    btnProceedSeats.disabled = currentReservationSession.passengers.length === 0;
    reserveError.textContent = '';
}

function verificarPasajeros() {
    let cantidadAdultos = 0;
    let cantidadMenores = 0;

    currentReservationSession.passengers.forEach(p => {
        if (p.age >= 18) {
            cantidadAdultos++;
        } else {
            cantidadMenores++;
        }
    });

    if (cantidadMenores > 0 && cantidadAdultos === 0) {
        showAlert("Error: No se puede proceder porque hay menores de edad sin adulto acompañante. Se requiere al menos un adulto.");
        return false;
    }

    if (cantidadAdultos >= 1) {
        return true;
    }

    return false;
}

window.removePassenger = function (id) {
    if (editingPassengerId === id) {
        editingPassengerId = null;
        formAddPassenger.reset();
        formAddPassenger.querySelector('button[type="submit"]').textContent = 'Añadir Pasajero';
        formAddPassenger.querySelector('button[type="submit"]').classList.remove('boton--primario');
        formAddPassenger.querySelector('button[type="submit"]').classList.add('boton--secundario');
    }
    currentReservationSession.passengers = currentReservationSession.passengers.filter(p => p.id !== id);
    renderPassengerList();
}

window.editPassenger = function (id) {
    const passenger = currentReservationSession.passengers.find(p => p.id === id);
    if (!passenger) return;

    editingPassengerId = id;

    // Separar nombre y apellido (asumiendo que se guardó como "Nombre Apellido")
    const names = passenger.name.split(' ');
    const name = names[0];
    const surname = names.slice(1).join(' ');

    document.getElementById('nombre-pasajero').value = name;
    document.getElementById('apellido-pasajero').value = surname;
    document.getElementById('discapacidad-pasajero').checked = passenger.disability;



    if (passenger.dob) {
        document.getElementById('fecha-nacimiento-pasajero').value = passenger.dob;
    }

    const btnSubmit = formAddPassenger.querySelector('button[type="submit"]');
    btnSubmit.textContent = 'Actualizar Datos';
    btnSubmit.classList.remove('boton--secundario');
    btnSubmit.classList.add('boton--primario');

    renderPassengerList();

    // Scroll al formulario
    formAddPassenger.scrollIntoView({ behavior: 'smooth' });
}

function resetReserveForm() {
    reserveFlightSelect.value = '';
    passengerSection.classList.add('oculto');
    currentReservationSession = { flightId: null, passengers: [], currentSelectingPassengerId: null };
    editingPassengerId = null;
    if (formAddPassenger) {
        formAddPassenger.reset();
        const btnSubmit = formAddPassenger.querySelector('button[type="submit"]');
        if (btnSubmit) {
            btnSubmit.textContent = 'Añadir Pasajero';
            btnSubmit.classList.remove('boton--primario');
            btnSubmit.classList.add('boton--secundario');
        }
    }
    renderPassengerList();
}

// --- Lógica de Mapa de Asientos ---
btnProceedSeats.addEventListener('click', () => {
    if (!currentReservationSession.flightId || currentReservationSession.passengers.length === 0) return;

    if (!verificarPasajeros()) return;

    currentReservationSession.currentSelectingPassengerId = currentReservationSession.passengers[0].id;
    renderSeatAllocations();
    renderAirplaneCabin();
    navigateTo('vista-mapa-asientos');
});

function renderSeatAllocations() {
    passengerSeatAllocations.innerHTML = '<h3 class="vista__subtitulo">Asignación de Asientos</h3>';
    let allAssigned = true;

    currentReservationSession.passengers.forEach((p, idx) => {
        const isCurrent = p.id === currentReservationSession.currentSelectingPassengerId;
        if (isCurrent) {
            seatStatusBanner.querySelector('.banner-estado__texto').textContent = `Selecciona asiento para: ${p.name}`;
        }
        if (!p.seatId) allAssigned = false;

        passengerSeatAllocations.innerHTML += `
            <div class="tarjeta-lista ${isCurrent ? 'border-active' : ''}" style="${isCurrent ? 'border-left: 4px solid var(--color-secondary)' : ''}">
                <div class="tarjeta-lista__info">
                    <span class="tarjeta-lista__title">${p.name} (Edad: ${p.age})</span>
                    <span class="tarjeta-lista__subtitle">Asiento: ${p.seatId || 'Sin asignar'}</span>
                </div>
                ${!p.seatId && !isCurrent ? `<button class="boton btn--pill" onclick="selectPassengerForSeat('${p.id}')">Asignar</button>` : ''}
                ${p.seatId && !isCurrent ? `<button class="boton btn--pill" onclick="selectPassengerForSeat('${p.id}')">Cambiar</button>` : ''}
            </div>
        `;
    });

    btnConfirmReservation.disabled = !allAssigned;
}

window.selectPassengerForSeat = function (id) {
    currentReservationSession.currentSelectingPassengerId = id;
    renderSeatAllocations();
    renderAirplaneCabin();
}

function renderAirplaneCabin() {
    const flight = flights.find(f => f.id === currentReservationSession.flightId);
    const config = airplaneModels[flight.model];
    airplaneCabin.innerHTML = '';

    const frontDoor = document.createElement('div');
    frontDoor.className = 'puerta-avion';
    airplaneCabin.appendChild(frontDoor);

    const encabezadoRow = document.createElement('div');
    encabezadoRow.className = 'etiquetas-cabina';

    const spacerL = document.createElement('div'); spacerL.className = 'ventana-simulada'; spacerL.style.visibility = 'hidden'; encabezadoRow.appendChild(spacerL);

    let colCounter = 0;
    config.layout.forEach((blockCount, layoutIndex) => {
        for (let i = 0; i < blockCount; i++) {
            const lbl = document.createElement('div');
            lbl.className = 'label'; lbl.textContent = SEAT_LETTERS[colCounter]; encabezadoRow.appendChild(lbl); colCounter++;
        }
        if (layoutIndex < config.layout.length - 1) {
            const pasillo = document.createElement('div'); pasillo.className = 'pasillo'; encabezadoRow.appendChild(pasillo);
        }
    });

    const spacerR = document.createElement('div'); spacerR.className = 'ventana-simulada'; spacerR.style.visibility = 'hidden'; encabezadoRow.appendChild(spacerR);

    airplaneCabin.appendChild(encabezadoRow);

    for (let r = 1; r <= config.rows; r++) {
        const rowDiv = document.createElement('div'); rowDiv.className = 'fila-cabina';

        const winL = document.createElement('div'); winL.className = 'ventana-simulada'; rowDiv.appendChild(winL);

        let c = 0;
        config.layout.forEach((blockCount, layoutIndex) => {
            for (let i = 0; i < blockCount; i++) {
                const seatData = flight.seats.find(s => s.row === r && s.colIndex === c);
                const seatEl = document.createElement('div');
                seatEl.className = `asiento asiento--${seatData.type}`;
                if (seatData.esAccesible) seatEl.classList.add('asiento--accesible');

                seatEl.innerHTML = seatData.id;
                if (seatData.esAccesible) {
                    seatEl.innerHTML += `<span class="icono-discapacidad"> </span>`;
                }

                if (seatData.occupiedBy) seatEl.classList.add('asiento--no-disponible');

                const passengerWithSeat = currentReservationSession.passengers.find(p => p.seatId === seatData.id);
                if (passengerWithSeat) {
                    seatEl.classList.add('asiento--seleccionado');
                }

                seatEl.addEventListener('click', () => handleSeatClick(seatData));
                rowDiv.appendChild(seatEl);
                c++;
            }
            if (layoutIndex < config.layout.length - 1) {
                const pasillo = document.createElement('div'); pasillo.className = 'pasillo-cabina'; pasillo.textContent = r; rowDiv.appendChild(pasillo);
            }
        });

        const winR = document.createElement('div'); winR.className = 'ventana-simulada'; rowDiv.appendChild(winR);

        airplaneCabin.appendChild(rowDiv);
    }

    const backDoor = document.createElement('div');
    backDoor.className = 'puerta-avion';
    airplaneCabin.appendChild(backDoor);
}

function handleSeatClick(seatData) {
    if (seatData.occupiedBy) { showAlert("Este asiento ya está ocupado."); return; }
    const currentPassenger = currentReservationSession.passengers.find(p => p.id === currentReservationSession.currentSelectingPassengerId);
    if (!currentPassenger) return;

    if (seatData.isEmergency) {
        if (currentPassenger.age < 18 || currentPassenger.age >= 60 || currentPassenger.disability) {
            showAlert("Políticas de aviación: Menores de edad, personas de 3era edad (60+), o personas con discapacidad NO pueden reservar asientos en salidas de emergencia."); return;
        }
    }

    if (seatData.esAccesible) {
        if (!currentPassenger.disability) {
            showAlert("Este asiento es preferencial para personas con discapacidad o movilidad reducida. Solo puede ser seleccionado por pasajeros que hayan declarado esta necesidad.");
            return;
        }
    }


    currentPassenger.seatId = seatData.id;
    const nextUnassigned = currentReservationSession.passengers.find(p => !p.seatId);
    if (nextUnassigned) currentReservationSession.currentSelectingPassengerId = nextUnassigned.id;

    renderSeatAllocations(); renderAirplaneCabin();
}

btnCancelReservation.addEventListener('click', () => {
    showConfirm("¿Estás seguro de que deseas cancelar la operación actual?", () => {
        if (editingReservationId) {
            // Restore original seats
            const res = globalReservations.find(r => r.id === editingReservationId);
            const flight = flights.find(f => f.id === currentReservationSession.flightId);
            if (res && flight) {
                res.passengers.forEach(p => {
                    const asiento = flight.seats.find(s => s.id === p.seatId);
                    if (asiento) asiento.occupiedBy = { name: p.name, age: p.age, disability: p.disability };
                });
            }
            editingReservationId = null;
            resetReserveForm();
            navigateTo('vista-mis-reservas');
        } else {
            resetReserveForm(); navigateTo('vista-reservar');
        }
    });
});

btnConfirmReservation.addEventListener('click', () => {
    const flight = flights.find(f => f.id === currentReservationSession.flightId);
    const config = airplaneModels[flight.model];

    // Validación por Bloque para menores
    const hasMinor = currentReservationSession.passengers.some(p => p.age < 18);
    if (hasMinor) {
        const minors = currentReservationSession.passengers.filter(p => p.age < 18);
        const adults = currentReservationSession.passengers.filter(p => p.age >= 18);
        const seats = currentReservationSession.passengers.map(p => flight.seats.find(s => s.id === p.seatId));

        if (minors.length > adults.length) {
            // Caso: Más menores que adultos -> Aplicar Área de Supervisión (Cluster completo)
            const visited = new Set();
            const startSeat = seats.find(s => {
                const p = currentReservationSession.passengers.find(pass => pass.seatId === s.id);
                return p.age >= 18;
            });

            if (startSeat) {
                visited.add(startSeat.id);
                let head = 0;
                const queue = [startSeat];
                while (head < queue.length) {
                    const curr = queue[head++];
                    seats.forEach(s => {
                        if (!visited.has(s.id)) {
                            // Adyacencia para el área de supervisión (incluye diagonales y pasillo cercano)
                            const isAdjacent = Math.abs(curr.row - s.row) <= 1 && Math.abs(curr.colIndex - s.colIndex) <= 1;
                            if (isAdjacent) {
                                visited.add(s.id);
                                queue.push(s);
                            }
                        }
                    });
                }
            }

            if (visited.size !== seats.length) {
                showAlert("Cuando hay más menores que adultos, todos los pasajeros de la reserva deben estar en asientos cercanos (área de supervisión).");
                return;
            }
        } else {
            // Caso: Adultos >= Menores -> Validación individual
            for (const minor of minors) {
                const minorSeat = flight.seats.find(s => s.id === minor.seatId);
                const isSupervised = adults.some(a => {
                    const adultSeat = flight.seats.find(s => s.id === a.seatId);
                    // Estrictamente al lado: misma fila, columna adyacente y mismo bloque (sin pasillo)
                    const mismaFila = adultSeat.row === minorSeat.row;
                    const colAdyacente = Math.abs(adultSeat.colIndex - minorSeat.colIndex) === 1;

                    let mismoBloque = false;
                    let cur = 0;
                    for (const b of config.layout) {
                        if (adultSeat.colIndex >= cur && adultSeat.colIndex < cur + b &&
                            minorSeat.colIndex >= cur && minorSeat.colIndex < cur + b) {
                            mismoBloque = true; break;
                        }
                        cur += b;
                    }
                    return mismaFila && colAdyacente && mismoBloque;
                });

                if (!isSupervised) {
                    showAlert(`Por seguridad, el menor ${minor.name} debe tener un asiento estrictamente al lado de un representante adulto (misma fila y sin pasillo de por medio).`);
                    return;
                }
            }
        }
    }

    currentReservationSession.passengers.forEach(p => {
        const asiento = flight.seats.find(s => s.id === p.seatId);
        if (asiento) {
            asiento.occupiedBy = { name: p.name, age: p.age, disability: p.disability };
        }
        // Generar un ID de ticket único para el pasajero si no tiene uno
        if (!p.ticketId) {
            p.ticketId = "TK-" + Math.random().toString(36).substr(2, 6).toUpperCase();
        }
    });

    if (editingReservationId) {
        const resIndex = globalReservations.findIndex(r => r.id === editingReservationId);
        if (resIndex !== -1) {
            globalReservations[resIndex].passengers = [...currentReservationSession.passengers];
            globalReservations[resIndex].date = new Date().toLocaleString(); // Update date
        }
        editingReservationId = null;
        showAlert("Reserva actualizada con éxito.");
    } else {
        const newRes = {
            id: "RES-" + Date.now().toString().substr(6),
            flightNumber: flight.flightNumber, origin: flight.origin, destination: flight.destination, model: flight.model, date: new Date().toLocaleString(),
            passengers: [...currentReservationSession.passengers],
            madeBy: "Invitado",
            createdAt: Date.now() // Timestamp para validación de reversión
        };
        globalReservations.push(newRes);
        showAlert("Reserva confirmada con éxito.");
    }

    resetReserveForm();
    navigateTo('vista-mis-reservas');
});

function renderPrintView() {
    const resList = document.getElementById('lista-reservas');
    const resDetail = document.getElementById('detalle-reserva');
    const btnBack = document.getElementById('btn-volver-reservas');
    const btnRevert = document.getElementById('btn-revertir-reserva');

    resList.classList.remove('oculto');
    resDetail.classList.add('oculto');

    if (globalReservations.length === 0) {
        resList.innerHTML = `
            <div class="estado-vacio">
                <p class="estado-vacio__texto">No hay Reservas</p>
            </div>
        `;
        return;
    }

    resList.innerHTML = '';
    const reversed = [...globalReservations].reverse();
    reversed.forEach(res => {
        const card = document.createElement('div');
        card.className = 'tarjeta-lista';
        card.style.cursor = 'pointer';
        card.innerHTML = `
            <div>
                <strong>${res.destination}</strong><br>
                <small class="texto-silenciado">${res.date} - ${res.flightNumber}</small>
            </div>
            <div>
                <span style="font-weight: bold; color: var(--color-secondary);">Ver Ticket</span>
            </div>
        `;
        card.onclick = () => {
            showReservationDetail(res);
        };
        resList.appendChild(card);
    });

    btnBack.onclick = () => {
        resDetail.classList.add('oculto');
        resList.classList.remove('oculto');
    };

    function showReservationDetail(res) {
        resList.classList.add('oculto');
        resDetail.classList.remove('oculto');

        let ticketsHTML = `<div style="display: flex; flex-direction: column; gap: 3rem; padding: 2rem 0;">`;
        res.passengers.forEach((p, i) => {
            const destParts = res.destination.split(',');
            const destShort = destParts[0].substring(0, 4).toUpperCase();
            const destCity = destParts[0].trim();
            const origParts = res.origin ? res.origin.split(',') : ['Origen', 'ORG'];
            const origShort = origParts[0].substring(0, 4).toUpperCase();
            const origCity = origParts[0].trim();
            const refId = res.id.toUpperCase();

            ticketsHTML += `
            <div style="display: flex; gap: 2rem; align-items: stretch; justify-content: center; flex-wrap: wrap; padding-bottom: 1rem; width: 100%;">
                <!-- Front Ticket -->
                <div class="boarding-pass" style="background: white; border-radius: 16px; min-width: 320px; width: 320px; box-shadow: 0 10px 30px rgba(0,0,0,0.1); overflow: hidden; position: relative; color: #0F172A; font-family: 'Inter', sans-serif; display: flex; flex-direction: column;">
                    <!-- Top Stripes -->
                    <div style="height: 12px; background: repeating-linear-gradient(45deg, #A7C2FA, #A7C2FA 10px, white 10px, white 20px); flex: 0 0 auto;"></div>
                    
                    <!-- Top Section -->
                    <div style="padding: 1.5rem 1.5rem 1rem; flex: 0 0 auto; box-sizing: border-box; height: 116px;">
                        <div style="display: flex; justify-content: space-between; margin-bottom: 1.5rem;">
                            <div>
                                <span style="font-size: 0.75rem; color: #94A3B8; text-transform: uppercase;">Asiento</span>
                                <div style="font-size: 1.25rem; font-weight: 700;">${p.seatId}</div>
                            </div>
                            <div style="text-align: right;">
                                <span style="font-size: 0.75rem; color: #94A3B8; text-transform: uppercase;">Vuelo</span>
                                <div style="font-size: 1.25rem; font-weight: 700;">${res.flightNumber}</div>
                            </div>
                        </div>
                        <div style="display: flex; justify-content: space-between;">
                            <div>
                                <span style="font-size: 0.75rem; color: #94A3B8; text-transform: uppercase;">Clase</span>
                                <div style="font-size: 1.1rem; font-weight: 600;">ESTÁNDAR</div>
                            </div>
                            <div style="text-align: right;">
                                <span style="font-size: 0.75rem; color: #94A3B8; text-transform: uppercase;">Fecha</span>
                                <div style="font-size: 1.1rem; font-weight: 600;">${res.date}</div>
                            </div>
                        </div>
                    </div>
                    
                    <!-- Divider with cutouts -->
                    <div style="position: relative; height: 30px; display: flex; align-items: center; flex: 0 0 auto;">
                        <div style="position: absolute; left: -15px; width: 30px; height: 30px; background-color: #F8FAFC; border-radius: 50%; box-shadow: inset -3px 0 5px rgba(0,0,0,0.05); z-index: 2;"></div>
                        <div style="flex: 1; border-top: 2px dashed #CBD5E1; margin: 0 15px;"></div>
                        <div style="position: absolute; right: -15px; width: 30px; height: 30px; background-color: #F8FAFC; border-radius: 50%; box-shadow: inset 3px 0 5px rgba(0,0,0,0.05); z-index: 2;"></div>
                    </div>
                    
                    <!-- Middle Section -->
                    <div style="padding: 1rem 1.5rem 2rem; flex: 1;">
                        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 2rem;">
                            <div>
                                <div style="font-size: 0.85rem; font-weight: 700; margin-bottom: 0.2rem;">08:30</div>
                                <div style="font-size: 1.5rem; font-weight: 800; text-transform: uppercase;">${origShort}</div>
                                <div style="font-size: 0.75rem; color: #94A3B8;">${origCity}</div>
                            </div>
                            <div style="display: flex; align-items: center; justify-content: center; flex: 1; margin: 0 1rem; position: relative;">
                                <div style="flex: 1; height: 1px; background: #94A3B8;"></div>
                                <svg viewBox="0 0 24 24" width="20" height="20" style="fill: #0F172A; position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%) rotate(45deg); background: white; padding: 0 4px;">
                                    <path d="M17.8 19.2 16 11l3.5-3.5C21 6 21.5 4 21 3c-1-.5-3 0-4.5 1.5L13 8 4.8 6.2c-.5-.1-.9.2-1.1.5l-1.3 1.5c-.3.3-.2.8.2 1l6.4 3.2-3.8 3.8-2.6-.9c-.3-.1-.7 0-.9.3L.6 17c-.2.2-.2.6 0 .8l3.6 2.6 2.6 3.6c.2.2.6.2.8 0l1.4-1.1c.3-.2.4-.6.3-.9l-.9-2.6 3.8-3.8 3.2 6.4c.2.4.7.5 1 .2l1.5-1.3c.3-.2.6-.6.5-1.1z"/>
                                </svg>
                            </div>
                            <div style="text-align: right;">
                                <div style="font-size: 0.85rem; font-weight: 700; margin-bottom: 0.2rem;">12:00</div>
                                <div style="font-size: 1.5rem; font-weight: 800; text-transform: uppercase;">${destShort}</div>
                                <div style="font-size: 0.75rem; color: #94A3B8;">${destCity}</div>
                            </div>
                        </div>
                        
                        <div style="margin-bottom: 1.5rem;">
                            <span style="font-size: 0.75rem; color: #94A3B8; text-transform: uppercase;">Pasajero</span>
                            <div style="font-size: 1.1rem; font-weight: 600;">${p.name.toUpperCase()}</div>
                            <div style="font-size: 0.7rem; color: #64748B; margin-top: 0.2rem; font-weight: 600;">ID PASAJERO: ${p.ticketId || 'PENDIENTE'}</div>
                        </div>
                        
                        <div>
                            <span style="font-size: 0.75rem; color: #94A3B8; text-transform: uppercase;">Ref. Reserva</span>
                            <div style="font-size: 1.1rem; font-weight: 600; letter-spacing: 1px;">${refId}</div>
                        </div>
                    </div>
                    
                    <!-- Bottom Section -->
                    <div style="text-align: center; padding-bottom: 1.5rem; flex: 0 0 auto;">
                        <span style="font-size: 0.75rem; color: #94A3B8; letter-spacing: 2px;">NÚMERO DE SERIE.${res.createdAt.toString().slice(-6)}</span>
                    </div>
                    
                    <!-- Bottom Stripes -->
                    <div style="height: 12px; background: repeating-linear-gradient(45deg, #A7C2FA, #A7C2FA 10px, white 10px, white 20px); flex: 0 0 auto;"></div>
                </div>
                
                <!-- Back Ticket -->
                <div class="boarding-pass-back" style="background: #3B82F6; border-radius: 16px; min-width: 320px; width: 320px; box-shadow: 0 10px 30px rgba(0,0,0,0.1); overflow: hidden; position: relative; color: white; font-family: 'Inter', sans-serif; display: flex; flex-direction: column;">
                    <!-- Abstract circles -->
                    <div style="position: absolute; top: -50px; left: -50px; width: 200px; height: 200px; border-radius: 50%; border: 30px solid rgba(255,255,255,0.05); z-index: 1;"></div>
                    <div style="position: absolute; bottom: 50px; right: -50px; width: 250px; height: 250px; border-radius: 50%; border: 40px solid rgba(255,255,255,0.05); z-index: 1;"></div>
                    <div style="position: absolute; top: 150px; right: 20px; width: 100px; height: 100px; border-radius: 50%; border: 20px solid rgba(255,255,255,0.05); z-index: 1;"></div>
                    
                    <!-- Top Section -->
                    <div style="height: 12px; flex: 0 0 auto;"></div>
                    <div style="padding: 1.5rem; height: 116px; box-sizing: border-box; display: flex; align-items: flex-start; justify-content: center; flex: 0 0 auto; position: relative; z-index: 2;">
                        <!-- Text removed -->
                    </div>
                    
                    <!-- Divider with cutouts -->
                    <div style="position: relative; height: 30px; display: flex; align-items: center; flex: 0 0 auto; z-index: 2;">
                        <div style="position: absolute; left: -15px; width: 30px; height: 30px; background-color: #F8FAFC; border-radius: 50%; box-shadow: inset -3px 0 5px rgba(0,0,0,0.05);"></div>
                        <div style="position: absolute; right: -15px; width: 30px; height: 30px; background-color: #F8FAFC; border-radius: 50%; box-shadow: inset 3px 0 5px rgba(0,0,0,0.05);"></div>
                    </div>
                    
                    <!-- Middle Section -->
                    <div style="flex: 1; display: flex; flex-direction: column; justify-content: center; align-items: center; z-index: 2; padding: 2rem 0;">
                        <svg viewBox="0 0 24 24" width="70" height="70" stroke="white" stroke-width="2" fill="white" stroke-linecap="round" stroke-linejoin="round" style="margin-bottom: 1rem;">
                            <path d="M17.8 19.2 16 11l3.5-3.5C21 6 21.5 4 21 3c-1-.5-3 0-4.5 1.5L13 8 4.8 6.2c-.5-.1-.9.2-1.1.5l-1.3 1.5c-.3.3-.2.8.2 1l6.4 3.2-3.8 3.8-2.6-.9c-.3-.1-.7 0-.9.3L.6 17c-.2.2-.2.6 0 .8l3.6 2.6 2.6 3.6c.2.2.6.2.8 0l1.4-1.1c.3-.2.4-.6.3-.9l-.9-2.6 3.8-3.8 3.2 6.4c.2.4.7.5 1 .2l1.5-1.3c.3-.2.6-.6.5-1.1z"/>
                        </svg>
                        <h3 style="font-size: 1.6rem; font-weight: 800; letter-spacing: 2px; margin: 0; text-align: center; line-height: 1.2;">AGENCIA<br>DE VIAJES</h3>
                    </div>
                    
                    <!-- Bottom Section -->
                    <div style="text-align: center; padding-bottom: 2rem; z-index: 2; flex: 0 0 auto; height: 95px; box-sizing: border-box;">
                        <!-- Text and icons removed -->
                    </div>
                </div>
            </div>
            `;
        });
        ticketsHTML += `</div>`;
        printArea.innerHTML = ticketsHTML;

        const btnEditar = document.getElementById('btn-editar-reserva');
        if (btnEditar) {
            btnEditar.onclick = () => {
                editingReservationId = res.id;
                const flight = flights.find(f => f.flightNumber === res.flightNumber);
                if (flight) {
                    res.passengers.forEach(p => {
                        const asiento = flight.seats.find(s => s.id === p.seatId);
                        if (asiento) asiento.occupiedBy = null;
                    });

                    currentReservationSession = {
                        flightId: flight.id,
                        passengers: JSON.parse(JSON.stringify(res.passengers)), // Deep copy
                        currentSelectingPassengerId: res.passengers[0].id
                    };

                    renderSeatAllocations();
                    renderAirplaneCabin();
                    navigateTo('vista-mapa-asientos');
                }
            };
        }

        btnRevert.onclick = () => {
            const now = Date.now();
            const fourHours = 4 * 60 * 60 * 1000;
            if (now - res.createdAt > fourHours) {
                showAlert("Error: Solo puedes revertir una reserva hasta 4 horas después de haberla realizado.");
                return;
            }

            showConfirm("¿Estás seguro de que deseas revertir esta reserva? Se liberarán los asientos.", () => {
                // Liberar asientos
                const flight = flights.find(f => f.flightNumber === res.flightNumber);
                if (flight) {
                    res.passengers.forEach(p => {
                        const asiento = flight.seats.find(s => s.id === p.seatId);
                        if (asiento) asiento.occupiedBy = null;
                    });
                }

                // Eliminar reserva
                globalReservations = globalReservations.filter(r => r.id !== res.id);
                showAlert("Reserva revertida exitosamente.");
                renderPrintView(); // Refrescar lista
            });
        };
    }
}

// --- Lógica de flechas de scroll para el mapa de asientos ---
const btnScrollUp = document.getElementById('btn-scroll-up');
const btnScrollDown = document.getElementById('btn-scroll-down');
const scrollMapa = document.getElementById('contenedor-scroll-mapa');

if (btnScrollUp && btnScrollDown && scrollMapa) {
    btnScrollUp.addEventListener('click', () => {
        scrollMapa.scrollBy({ top: -300, behavior: 'smooth' });
    });

    btnScrollDown.addEventListener('click', () => {
        scrollMapa.scrollBy({ top: 300, behavior: 'smooth' });
    });

    scrollMapa.addEventListener('scroll', () => {
        const svgUp = btnScrollUp.querySelector('svg');
        const svgDown = btnScrollDown.querySelector('svg');
        const maxScroll = scrollMapa.scrollHeight - scrollMapa.clientHeight;

        if (svgUp) {
            if (scrollMapa.scrollTop > 10) {
                svgUp.style.opacity = '1';
                btnScrollUp.style.cursor = 'pointer';
            } else {
                svgUp.style.opacity = '0.3';
                btnScrollUp.style.cursor = 'default';
            }
        }

        if (svgDown) {
            if (scrollMapa.scrollTop < maxScroll - 10) {
                svgDown.style.opacity = '1';
                btnScrollDown.style.cursor = 'pointer';
            } else {
                svgDown.style.opacity = '0.3';
                btnScrollDown.style.cursor = 'default';
            }
        }

        // Lógica del mini mapa
        const minimapaIndicador = document.getElementById('minimapa-indicador');
        if (minimapaIndicador && maxScroll > 0) {
            let porcentaje = scrollMapa.scrollTop / maxScroll;
            // Limitamos a un máximo de 75px (contenedor 100px - indicador 25px)
            let topPosition = porcentaje * 75;
            minimapaIndicador.style.top = `${topPosition}px`;
        }
    });
}

// Inicialización de la aplicación
initDefaultFlights();
