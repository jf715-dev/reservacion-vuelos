// --- Gestión de Estado (Memoria Volátil en RAM) ---
let flights = [];
let globalReservations = [];
let users = []; // { name, email, pass }
let currentUser = null;

let currentReservationSession = {
    flightId: null,
    passengers: [],
    currentSelectingPassengerId: null
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
const menuLateral = document.getElementById('menu-lateral');
const capaOscura = document.getElementById('capa-oscura');
const btnSidebarOpen = document.getElementById('abrir-menu-lateral');
const btnSidebarClose = document.getElementById('cerrar-menu-lateral');
const menuLateralLinks = document.querySelectorAll('.menu-lateral__enlace');
const vistas = document.querySelectorAll('.vista');

// Auth Elements
const authStatus = document.getElementById('estado-autenticacion');
const btnLoginView = document.getElementById('btn-vista-ingreso');
const btnRegisterView = document.getElementById('btn-vista-registro');
const tabLogin = document.getElementById('pestana-ingreso');
const tabRegister = document.getElementById('pestana-registro');
const formLogin = document.getElementById('formulario-ingreso');
const formRegister = document.getElementById('formulario-registro');

// Admin Elements
const formAdmin = document.getElementById('formulario-admin');
const adminFlightList = document.getElementById('lista-vuelos-admin');
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

// --- Navegación SPA ---
function openSidebar() {
    menuLateral.classList.add('menu-lateral--open');
    capaOscura.classList.add('capa-oscura--visible');
}

function closeSidebar() {
    menuLateral.classList.remove('menu-lateral--open');
    capaOscura.classList.remove('capa-oscura--visible');
}

function navigateTo(targetId) {
    // Protección de rutas: Reservar y Mis Reservas requieren login
    if ((targetId === 'vista-reservar' || targetId === 'vista-mis-reservas') && !currentUser) {
        alert("Debes iniciar sesión o registrarte para acceder a esta sección.");
        navigateTo('vista-autenticacion');
        return;
    }

    vistas.forEach(vista => {
        if (vista.id === targetId) {
            vista.classList.add('vista--activa');
        } else {
            vista.classList.remove('vista--activa');
        }
    });

    menuLateralLinks.forEach(link => {
        if (link.dataset.target === targetId) {
            link.classList.add('menu-lateral__enlace--activo');
        } else {
            link.classList.remove('menu-lateral__enlace--activo');
        }
    });

    closeSidebar();

    if (targetId === 'vista-mis-reservas') renderPrintView();
    if (targetId === 'vista-reservar') resetReserveForm();
}

btnSidebarOpen.addEventListener('click', openSidebar);
btnSidebarClose.addEventListener('click', closeSidebar);
capaOscura.addEventListener('click', closeSidebar);

menuLateralLinks.forEach(link => {
    link.addEventListener('click', (e) => {
        e.preventDefault();
        navigateTo(e.target.dataset.target);
    });
});

// --- Lógica de Autenticación ---
const btnCloseAuth = document.getElementById('btn-cerrar-autenticacion');
if (btnCloseAuth) btnCloseAuth.onclick = () => navigateTo('vista-inicio');

// Vincular botón de búsqueda de la home
const btnSearchHome = document.querySelector('.boton--busqueda');
if (btnSearchHome) btnSearchHome.onclick = () => navigateTo('vista-reservar');

function setupAuthEvents() {
    const btnLogin = document.getElementById('btn-vista-ingreso');
    const btnReg = document.getElementById('btn-vista-registro');

    if (btnLogin) btnLogin.onclick = () => {
        navigateTo('vista-autenticacion');
        tabLogin.click();
    };
    if (btnReg) btnReg.onclick = () => {
        navigateTo('vista-autenticacion');
        tabRegister.click();
    };
}

setupAuthEvents();

tabLogin.onclick = () => {
    tabLogin.classList.add('caja-autenticacion__pestana--activa');
    tabRegister.classList.remove('caja-autenticacion__pestana--activa');
    formLogin.classList.remove('oculto');
    formRegister.classList.add('oculto');
};

tabRegister.onclick = () => {
    tabRegister.classList.add('caja-autenticacion__pestana--activa');
    tabLogin.classList.remove('caja-autenticacion__pestana--activa');
    formRegister.classList.remove('oculto');
    formLogin.classList.add('oculto');
};

formRegister.onsubmit = (e) => {
    e.preventDefault();
    const name = document.getElementById('nombre-registro').value;
    const email = document.getElementById('email-registro').value;
    const pass = document.getElementById('pass-registro').value;

    if (users.find(u => u.email === email)) {
        document.getElementById('error-registro').textContent = "El correo ya está registrado.";
        return;
    }

    users.push({ name, email, pass });
    alert("Usuario registrado. Ya puedes ingresar.");
    tabLogin.click();
    formRegister.reset();
};

formLogin.onsubmit = (e) => {
    e.preventDefault();
    const email = document.getElementById('email-ingreso').value;
    const pass = document.getElementById('pass-ingreso').value;

    const user = users.find(u => u.email === email && u.pass === pass);
    if (!user) {
        document.getElementById('error-ingreso').textContent = "Credenciales incorrectas.";
        return;
    }

    currentUser = user;
    updateAuthHeader();
    navigateTo('vista-inicio');
    alert(`Bienvenido, ${user.name}`);
};

function updateAuthHeader() {
    if (currentUser) {
        authStatus.innerHTML = `
            <div class="user-badge">
                <span class="user-badge__name">${currentUser.name}</span>
                <button class="boton boton--secundario" onclick="logout()">Cerrar Sesión</button>
            </div>
        `;
    } else {
        authStatus.innerHTML = `
            <button class="boton boton--secundario" id="btn-vista-registro">Registrarse</button>
            <button class="boton boton--primario encabezado__auth" id="btn-vista-ingreso">Iniciar Sesión</button>
        `;
        setupAuthEvents();
    }
}

window.logout = () => {
    currentUser = null;
    updateAuthHeader();
    navigateTo('vista-inicio');
};

// --- Lógica de Administración de Vuelos ---
formAdmin.addEventListener('submit', (e) => {
    e.preventDefault();
    const flightNum = document.getElementById('numero-vuelo').value.trim();
    const destination = document.getElementById('destino-vuelo').value.trim();
    const model = document.getElementById('modelo-avion').value;

    if (!flightNum || !destination || !model) return;

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

            seats.push({
                id: seatId, row: r, colIndex: c, type: type, isEmergency: isEmergency, occupiedBy: null
            });
        }
    }

    const newFlight = { id: Date.now().toString(), flightNumber: flightNum, destination: destination, model: model, seats: seats };
    flights.push(newFlight);
    formAdmin.reset();
    renderAdminFlights();
    updateFlightSelect();
    alert("Vuelo programado exitosamente.");
});

function renderAdminFlights() {
    adminFlightList.innerHTML = flights.length === 0 ? '<p class="texto-silenciado">No hay vuelos programados.</p>' : '';
    flights.forEach(f => {
        const asientosOcupados = f.seats.filter(s => s.occupiedBy).length;
        adminFlightList.innerHTML += `
            <div class="tarjeta-lista">
                <div class="tarjeta-lista__info">
                    <span class="tarjeta-lista__title">${f.flightNumber} - Destino: ${f.destination}</span>
                    <span class="tarjeta-lista__subtitle">Aeronave: ${f.model}</span>
                </div>
                <div class="tarjeta-lista__badge btn--pill">${asientosOcupados} Asientos Ocupados</div>
            </div>
        `;
    });
}

function updateFlightSelect() {
    reserveFlightSelect.innerHTML = '<option value="" disabled selected>Seleccione un vuelo</option>';
    flights.forEach(f => {
        reserveFlightSelect.innerHTML += `<option value="${f.id}">${f.flightNumber} - ${f.destination} (${f.model})</option>`;
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

formAddPassenger.addEventListener('submit', (e) => {
    e.preventDefault();
    const name = document.getElementById('nombre-pasajero').value.trim();
    const age = parseInt(document.getElementById('edad-pasajero').value);
    const disability = document.getElementById('discapacidad-pasajero').checked;

    if (!name || isNaN(age) || age <= 0) {
        alert("Por favor, ingrese un nombre válido y una edad mayor a 0.");
        return;
    }

    currentReservationSession.passengers.push({
        id: Date.now().toString() + Math.random().toString(36).substr(2, 5),
        name, age, disability, seatId: null
    });

    formAddPassenger.reset();
    renderPassengerList();
});

function renderPassengerList() {
    passengerList.innerHTML = '';
    let hasMinor = false, hasAdult = false;

    currentReservationSession.passengers.forEach((p, idx) => {
        if (p.age < 18) hasMinor = true;
        if (p.age >= 18) hasAdult = true;

        passengerList.innerHTML += `
            <div class="tarjeta-lista">
                <div class="tarjeta-lista__info">
                    <span class="tarjeta-lista__title">Pasajero ${idx + 1}: ${p.name}</span>
                    <span class="tarjeta-lista__subtitle">Edad: ${p.age} | Discapacidad: ${p.disability ? 'Sí' : 'No'}</span>
                </div>
                <button type="button" class="boton boton--icono texto-silenciado" onclick="removePassenger('${p.id}')">&times;</button>
            </div>
        `;
    });

    btnProceedSeats.disabled = true;
    reserveError.textContent = '';

    if (currentReservationSession.passengers.length > 0) {
        if (hasMinor && !hasAdult) {
            reserveError.textContent = 'Error: Todo pasajero menor de edad debe ir acompañado de al menos un adulto en la misma reserva.';
        } else {
            btnProceedSeats.disabled = false;
        }
    }
}

window.removePassenger = function (id) {
    currentReservationSession.passengers = currentReservationSession.passengers.filter(p => p.id !== id);
    renderPassengerList();
}

function resetReserveForm() {
    reserveFlightSelect.value = '';
    passengerSection.classList.add('oculto');
    currentReservationSession = { flightId: null, passengers: [], currentSelectingPassengerId: null };
    renderPassengerList();
}

// --- Lógica de Mapa de Asientos ---
btnProceedSeats.addEventListener('click', () => {
    if (!currentReservationSession.flightId || currentReservationSession.passengers.length === 0) return;
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

    const encabezadoRow = document.createElement('div');
    encabezadoRow.className = 'etiquetas-cabina';
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
    airplaneCabin.appendChild(encabezadoRow);

    for (let r = 1; r <= config.rows; r++) {
        const rowDiv = document.createElement('div'); rowDiv.className = 'fila-cabina';
        let c = 0;
        config.layout.forEach((blockCount, layoutIndex) => {
            for (let i = 0; i < blockCount; i++) {
                const seatData = flight.seats.find(s => s.row === r && s.colIndex === c);
                const seatEl = document.createElement('div');
                seatEl.className = `asiento asiento--${seatData.type}`;
                seatEl.textContent = seatData.id;

                if (seatData.occupiedBy) seatEl.classList.add('asiento--no-disponible');

                const passengerWithSeat = currentReservationSession.passengers.find(p => p.seatId === seatData.id);
                if (passengerWithSeat) {
                    seatEl.className = 'asiento asiento--seleccionado';
                    seatEl.textContent = passengerWithSeat.name.charAt(0);
                }

                seatEl.addEventListener('click', () => handleSeatClick(seatData));
                rowDiv.appendChild(seatEl);
                c++;
            }
            if (layoutIndex < config.layout.length - 1) {
                const pasillo = document.createElement('div'); pasillo.className = 'pasillo-cabina'; pasillo.textContent = r; rowDiv.appendChild(pasillo);
            }
        });
        airplaneCabin.appendChild(rowDiv);
    }
}

function handleSeatClick(seatData) {
    if (seatData.occupiedBy) { alert("Este asiento ya está ocupado."); return; }
    const currentPassenger = currentReservationSession.passengers.find(p => p.id === currentReservationSession.currentSelectingPassengerId);
    if (!currentPassenger) return;

    if (seatData.isEmergency) {
        if (currentPassenger.age < 18 || currentPassenger.age > 60 || currentPassenger.disability) {
            alert("Políticas de aviación: Menores de 18, mayores de 60, o personas con discapacidad NO pueden reservar asientos en salidas de emergencia."); return;
        }
    }

    currentPassenger.seatId = seatData.id;
    const nextUnassigned = currentReservationSession.passengers.find(p => !p.seatId);
    if (nextUnassigned) currentReservationSession.currentSelectingPassengerId = nextUnassigned.id;

    renderSeatAllocations(); renderAirplaneCabin();
}

btnCancelReservation.addEventListener('click', () => {
    if (confirm("¿Estás seguro de que deseas cancelar la reserva actual?")) { resetReserveForm(); navigateTo('vista-reservar'); }
});

btnConfirmReservation.addEventListener('click', () => {
    const flight = flights.find(f => f.id === currentReservationSession.flightId);
    currentReservationSession.passengers.forEach(p => {
        const asiento = flight.seats.find(s => s.id === p.seatId);
        if (asiento) {
            asiento.occupiedBy = { name: p.name, age: p.age, disability: p.disability };
        }
    });

    const newRes = {
        id: "RES-" + Date.now().toString().substr(6),
        flightNumber: flight.flightNumber, destination: flight.destination, model: flight.model, date: new Date().toLocaleString(),
        passengers: [...currentReservationSession.passengers],
        madeBy: currentUser ? currentUser.name : "Invitado",
        createdAt: Date.now() // Timestamp para validación de reversión
    };

    globalReservations.push(newRes);
    resetReserveForm();
    renderAdminFlights(); // Actualizar el contador de la lista de vuelos
    alert("Reserva confirmada con éxito."); navigateTo('vista-mis-reservas');
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
                <div class="estado-vacio__icono">📋</div>
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

        let printText = `======================================\n`;
        printText += `       TICKET DE RESERVA ELECTRÓNICO   \n`;
        printText += `======================================\n`;
        printText += `ID Reserva: ${res.id}\n`;
        printText += `Solicitante: ${res.madeBy}\n`;
        printText += `Fecha: ${res.date}\n`;
        printText += `Vuelo: ${res.flightNumber} - Destino: ${res.destination}\n`;
        printText += `Aeronave: ${res.model}\n`;
        printText += `--------------------------------------\n`;
        printText += `PASAJEROS:\n`;
        res.passengers.forEach((p, i) => {
            printText += ` ${i + 1}. ${p.name} (Edad: ${p.age})\n    Asiento: ${p.seatId}\n    Esp: ${p.disability ? 'Sí' : 'No'}\n`;
        });
        printText += `======================================\n`;
        printArea.innerHTML = `<div class="tarjeta-impresion"><pre>${printText}</pre></div>`;

        btnRevert.onclick = () => {
            const now = Date.now();
            const fourHours = 4 * 60 * 60 * 1000;
            if (now - res.createdAt > fourHours) {
                alert("Error: Solo puedes revertir una reserva hasta 4 horas después de haberla realizado.");
                return;
            }

            if (confirm("¿Estás seguro de que deseas revertir esta reserva? Se liberarán los asientos.")) {
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
                alert("Reserva revertida exitosamente.");
                renderAdminFlights(); // Actualizar el contador de la lista de vuelos
                renderPrintView(); // Refrescar lista
            }
        };
    }
}
