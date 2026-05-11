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

let editingReservationId = null;

// --- Datos de Destinos ---
const locationsData = {
    "Alemania": ["Baviera", "Berlín", "Hesse", "Sajonia", "Renania del Norte-Westfalia", "Baden-Wurtemberg", "Baja Sajonia", "Brandeburgo", "Turingia", "Hamburgo"],
    "Arabia Saudita": ["Riad", "La Meca", "Medina", "Provincia Oriental", "Asir", "Casim", "Hail", "Tabuk", "Frontera del Norte", "Yizán"],
    "Argelia": ["Argel", "Orán", "Constantina", "Annaba", "Batna", "Blida", "Setif", "Sidi Bel Abbes", "Biskra", "Tlemcen"],
    "Argentina": ["Buenos Aires", "Córdoba", "Santa Fe", "Mendoza", "Tucumán", "Entre Ríos", "Salta", "Misiones", "Chaco", "Corrientes"],
    "Australia": ["Nueva Gales del Sur", "Victoria", "Queensland", "Australia Occidental", "Tasmania", "Australia Meridional", "Territorio del Norte", "Territorio de la Capital Australiana", "Territorio de la Bahía de Jervis", "Islas del Mar del Coral"],
    "Bolivia": ["La Paz", "Santa Cruz", "Cochabamba", "Potosí", "Tarija", "Oruro", "Chuquisaca", "Beni", "Pando", "El Alto"],
    "Brasil": ["São Paulo", "Río de Janeiro", "Minas Gerais", "Bahía", "Paraná", "Rio Grande do Sul", "Pernambuco", "Ceará", "Pará", "Santa Catarina"],
    "Canadá": ["Ontario", "Quebec", "Columbia Británica", "Alberta", "Manitoba", "Saskatchewan", "Nueva Escocia", "Nuevo Brunswick", "Terranova y Labrador", "Isla del Príncipe Eduardo"],
    "Chile": ["Región Metropolitana", "Valparaíso", "Biobío", "Antofagasta", "Araucanía", "Maule", "Coquimbo", "O'Higgins", "Los Lagos", "Tarapacá"],
    "China": ["Pekín", "Shanghái", "Guangdong", "Sichuan", "Zhejiang", "Jiangsu", "Shandong", "Henan", "Hebei", "Hunan"],
    "Colombia": ["Bogotá", "Antioquia", "Valle del Cauca", "Atlántico", "Cundinamarca", "Bolívar", "Santander", "Boyacá", "Tolima", "Norte de Santander"],
    "Corea del Sur": ["Seúl", "Busan", "Incheon", "Daegu", "Daejeon", "Gwangju", "Ulsan", "Gyeonggi", "Gangwon", "Chungcheong del Sur"],
    "Costa Rica": ["San José", "Alajuela", "Cartago", "Heredia", "Guanacaste", "Puntarenas", "Limón", "San Pedro", "Escazú", "Desamparados"],
    "Cuba": ["La Habana", "Santiago de Cuba", "Camagüey", "Holguín", "Matanzas", "Villa Clara", "Guantánamo", "Pinar del Río", "Cienfuegos", "Las Tunas"],
    "Ecuador": ["Pichincha", "Guayas", "Azuay", "Manabí", "Tungurahua", "Los Ríos", "El Oro", "Loja", "Imbabura", "Chimborazo"],
    "Egipto": ["El Cairo", "Alejandría", "Guiza", "Sinaí del Sur", "Luxor", "Asuán", "Mar Rojo", "Dacalia", "Suhag", "Puerto Said"],
    "Emiratos Árabes Unidos": ["Dubái", "Abu Dabi", "Sharjah", "Ajman", "Ras al-Khaimah", "Fuyaira", "Umm al-Qaywayn", "Al Ain", "Al Gharbia", "Khor Fakkan"],
    "España": ["Madrid", "Cataluña", "Andalucía", "Comunidad Valenciana", "Galicia", "País Vasco", "Canarias", "Castilla y León", "Castilla-La Mancha", "Murcia"],
    "Estados Unidos": ["California", "Texas", "Nueva York", "Florida", "Illinois", "Pensilvania", "Ohio", "Georgia", "Carolina del Norte", "Michigan"],
    "Etiopía": ["Adís Abeba", "Oromía", "Amhara", "Tigray", "Afar", "Somali", "Benishangul-Gumuz", "Gambela", "Harari", "Sidama"],
    "Fiyi": ["Central", "Occidental", "Norte", "Oriental", "Rotuma", "Ba", "Bua", "Cakaudrove", "Kadavu", "Macuata"],
    "Francia": ["Isla de Francia", "Provenza-Alpes-Costa Azul", "Nueva Aquitania", "Occitania", "Bretaña", "Auvernia-Ródano-Alpes", "Gran Este", "Altos de Francia", "Países del Loira", "Normandía"],
    "Ghana": ["Gran Acra", "Ashanti", "Región Occidental", "Región Central", "Región Norte", "Región Oriental", "Volta", "Brong-Ahafo", "Alta Occidental", "Alta Oriental"],
    "Grecia": ["Ática", "Macedonia Central", "Creta", "Tesalia", "Egeo Meridional", "Peloponeso", "Grecia Occidental", "Macedonia Oriental y Tracia", "Epiro", "Islas Jónicas"],
    "Guatemala": ["Guatemala", "Quetzaltenango", "Escuintla", "Sacatepéquez", "Alta Verapaz", "Huehuetenango", "San Marcos", "Petén", "Jutiapa", "Quiché"],
    "Honduras": ["Francisco Morazán", "Cortés", "Atlántida", "Comayagua", "Yoro", "Choluteca", "Olancho", "El Paraíso", "Copán", "Valle"],
    "India": ["Maharashtra", "Delhi", "Karnataka", "Tamil Nadu", "Gujarat", "Uttar Pradesh", "Bengala Occidental", "Rajastán", "Madhya Pradesh", "Bihar"],
    "Indonesia": ["Yakarta", "Bali", "Java Occidental", "Java Oriental", "Sumatra del Norte", "Java Central", "Banten", "Célebes Meridional", "Lampung", "Riau"],
    "Islas Salomón": ["Guadalcanal", "Malaita", "Provincia Occidental", "Makira-Ulawa", "Isabel", "Choiseul", "Temotu", "Central", "Rennell y Bellona", "Honiara"],
    "Italia": ["Lombardía", "Lacio", "Campania", "Véneto", "Sicilia", "Piamonte", "Apulia", "Emilia-Romaña", "Toscana", "Calabria"],
    "Jamaica": ["Kingston", "Saint Andrew", "Saint James", "Saint Ann", "Manchester", "Clarendon", "Saint Catherine", "Westmoreland", "Saint Elizabeth", "Hanover"],
    "Japón": ["Tokio", "Osaka", "Kioto", "Hokkaido", "Fukuoka", "Kanagawa", "Aichi", "Saitama", "Chiba", "Hyogo"],
    "Kenia": ["Nairobi", "Mombasa", "Kisumu", "Nakuru", "Uasin Gishu", "Kiambu", "Machakos", "Meru", "Kakamega", "Nyeri"],
    "Marruecos": ["Casablanca-Settat", "Marrakech-Safí", "Rabat-Salé-Kenitra", "Tánger-Tetuán-Alhucemas", "Fez-Mequinez", "Sus-Masa", "Oriental", "Beni Melal-Jenifra", "Draa-Tafilalet", "Guelmim-Río Noun"],
    "Micronesia": ["Chuuk", "Pohnpei", "Yap", "Kosrae", "Weno", "Tofol", "Colonia", "Lelu", "Tol", "Fefan"],
    "México": ["Ciudad de México", "Jalisco", "Nuevo León", "Estado de México", "Yucatán", "Puebla", "Guanajuato", "Veracruz", "Chihuahua", "Baja California"],
    "Nigeria": ["Lagos", "Kano", "Kaduna", "Rivers", "Abuya", "Oyo", "Katsina", "Ogun", "Delta", "Enugu"],
    "Nueva Zelanda": ["Auckland", "Wellington", "Canterbury", "Waikato", "Otago", "Manawatu-Wanganui", "Bay of Plenty", "Hawke's Bay", "Taranaki", "Northland"],
    "Países Bajos": ["Holanda Septentrional", "Holanda Meridional", "Utrecht", "Brabante Septentrional", "Güeldres", "Overijssel", "Limburgo", "Flevolanda", "Groninga", "Drente"],
    "Palaos": ["Koror", "Airai", "Peleliu", "Melekeok", "Angaur", "Ngardmau", "Ngaremlengui", "Ngarchelong", "Ngatpang", "Aimeliik"],
    "Panamá": ["Panamá", "Colón", "Chiriquí", "Panamá Oeste", "Veraguas", "Coclé", "Herrera", "Los Santos", "Bocas del Toro", "Darién"],
    "Papúa Nueva Guinea": ["Distrito Capital Nacional", "Morobe", "Tierras Altas Occidentales", "Madang", "Nueva Bretaña Oriental", "Tierras Altas Orientales", "Bougainville", "Nueva Irlanda", "Sepik Oriental", "Enga"],
    "Paraguay": ["Asunción", "Central", "Alto Paraná", "Itapúa", "Caaguazú", "San Pedro", "Cordillera", "Guairá", "Concepción", "Amambay"],
    "Perú": ["Lima", "Cusco", "Arequipa", "La Libertad", "Piura", "Cajamarca", "Junín", "Lambayeque", "Puno", "Ancash"],
    "Portugal": ["Lisboa", "Oporto", "Faro", "Braga", "Setúbal", "Aveiro", "Coímbra", "Leiría", "Santarém", "Madeira"],
    "Reino Unido": ["Inglaterra", "Escocia", "Gales", "Irlanda del Norte", "Gran Londres", "Midlands Occidentales", "Gran Mánchester", "West Yorkshire", "Hampshire", "Kent"],
    "República Dominicana": ["Distrito Nacional", "Santiago", "Santo Domingo", "Puerto Plata", "La Altagracia", "San Cristóbal", "La Vega", "San Pedro de Macorís", "Duarte", "Espaillat"],
    "Rusia": ["Moscú", "San Petersburgo", "Tatarstán", "Siberia", "Urales", "Bashkortostán", "Cheliábinsk", "Nizhni Nóvgorod", "Samara", "Rostov"],
    "Samoa": ["Tuamasaga", "A'ana", "Atua", "Fa'asaleleaga", "Gaga'emauga", "Vaisigano", "Gagaifomauga", "Palauli", "Satupa'itea", "Aiga-i-le-Tai"],
    "Senegal": ["Dakar", "Thiès", "Diourbel", "Saint-Louis", "Ziguinchor", "Kaolack", "Louga", "Tambacounda", "Fatick", "Kolda"],
    "Sudáfrica": ["Gauteng", "Cabo Occidental", "KwaZulu-Natal", "Cabo Oriental", "Mpumalanga", "Limpopo", "Noroeste", "Estado Libre", "Cabo del Norte", "Pretoria"],
    "Suiza": ["Zúrich", "Ginebra", "Vaud", "Berna", "Basilea-Ciudad", "Argovia", "San Galo", "Lucerna", "Tesino", "Friburgo"],
    "Tailandia": ["Bangkok", "Chiang Mai", "Phuket", "Chonburi", "Surat Thani", "Nakhon Ratchasima", "Khon Kaen", "Udon Thani", "Songkhla", "Nakhon Si Thammarat"],
    "Tanzania": ["Dar es Salaam", "Zanzíbar", "Arusha", "Dodoma", "Mwanza", "Morogoro", "Tanga", "Mbeya", "Kigoma", "Tabora"],
    "Tonga": ["Tongatapu", "Vava'u", "Ha'apai", "Eua", "Niuas", "Nukuʻalofa", "Neiafu", "Pangai", "Ohonua", "Hihifo"],
    "Turquía": ["Estambul", "Ankara", "Esmirna", "Antalya", "Bursa", "Adana", "Konya", "Gaziantep", "Mersin", "Kayseri"],
    "Uruguay": ["Montevideo", "Canelones", "Maldonado", "Salto", "Colonia", "Paysandú", "San José", "Rivera", "Tacuarembó", "Rocha"],
    "Vanuatu": ["Shefa", "Sanma", "Tafea", "Malampa", "Penama", "Torba", "Port Vila", "Luganville", "Isangel", "Lakatoro"],
    "Venezuela": ["Distrito Capital", "Zulia", "Miranda", "Carabobo", "Lara", "Aragua", "Anzoátegui", "Bolívar", "Táchira", "Sucre"],
    "Vietnam": ["Ciudad Ho Chi Minh", "Hanói", "Da Nang", "Hai Phong", "Can Tho", "Dong Nai", "Binh Duong", "Nghe An", "Thanh Hoa", "Hai Duong"]
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
const selectPais = document.getElementById('pais-vuelo');
const selectEstado = document.getElementById('estado-vuelo');
const selectPaisOrigen = document.getElementById('pais-origen');
const selectEstadoOrigen = document.getElementById('estado-origen');

// Llenar selector de países (Origen y Destino)
if (selectPais || selectPaisOrigen) {
    Object.keys(locationsData).forEach(pais => {
        if (selectPais) {
            const optionDest = document.createElement('option');
            optionDest.value = pais;
            optionDest.textContent = pais;
            selectPais.appendChild(optionDest);
        }

        if (selectPaisOrigen) {
            const optionOrig = document.createElement('option');
            optionOrig.value = pais;
            optionOrig.textContent = pais;
            selectPaisOrigen.appendChild(optionOrig);
        }
    });

    if (selectPais) {
        selectPais.addEventListener('change', (e) => {
            selectEstado.innerHTML = '<option value="" disabled selected>Seleccione un estado</option>';
            const estados = locationsData[e.target.value];
            if (estados) {
                estados.forEach(est => {
                    const option = document.createElement('option');
                    option.value = est;
                    option.textContent = est;
                    selectEstado.appendChild(option);
                });
                selectEstado.disabled = false;
            } else {
                selectEstado.disabled = true;
            }
        });
    }

    if (selectPaisOrigen) {
        selectPaisOrigen.addEventListener('change', (e) => {
            selectEstadoOrigen.innerHTML = '<option value="" disabled selected>Seleccione un estado</option>';
            const estados = locationsData[e.target.value];
            if (estados) {
                estados.forEach(est => {
                    const option = document.createElement('option');
                    option.value = est;
                    option.textContent = est;
                    selectEstadoOrigen.appendChild(option);
                });
                selectEstadoOrigen.disabled = false;
            } else {
                selectEstadoOrigen.disabled = true;
            }
        });
    }
}

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

// --- Animación de Escritura (Typewriter) ---
let typewriterSession = 0; // Para cancelar animaciones previas si se cambia de vista rápido

function startTypewriter() {
    const subtitle = document.querySelector('.portada__descripcion-nueva');
    const title = document.querySelector('.portada__titulo-nuevo');
    if (!subtitle || !title) return;

    const currentSession = ++typewriterSession;
    
    const text1 = "Listos para el Despegue";
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
document.addEventListener('DOMContentLoaded', startTypewriter);

// --- Navegación SPA ---

function navigateTo(targetId) {
    // Protección de rutas: Reservar y Mis Reservas requieren login
    if ((targetId === 'vista-reservar' || targetId === 'vista-mis-reservas' || targetId === 'vista-admin' || targetId === 'vista-perfil') && !currentUser) {
        alert("Debes iniciar sesión o registrarte para acceder a esta sección.");
        navigateTo('vista-autenticacion');
        return;
    }

    if (targetId === 'vista-inicio') {
        startTypewriter();
    } else {
        typewriterSession++; // Cancela cualquier animación en curso si sale del inicio
    }

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

    const logo = document.querySelector('.encabezado__logo');
    if (logo) {
        logo.style.color = (targetId === 'vista-autenticacion') ? '#FFFFFF' : '#0F172A';
    }

    navLinks.forEach(link => {
        if (link.dataset.target === targetId) {
            link.classList.add('encabezado__enlace--activo');
            link.style.color = '#3B82F6'; // Highlight active link
        } else {
            link.classList.remove('encabezado__enlace--activo');
            link.style.color = (targetId === 'vista-autenticacion') ? '#F8FAFC' : '#64748B'; // Light color on dark auth background
        }
    });

    if (targetId === 'vista-mis-reservas') renderPrintView();
    if (targetId === 'vista-reservar') resetReserveForm();
}

navLinks.forEach(link => {
    link.addEventListener('click', (e) => {
        e.preventDefault();
        navigateTo(e.target.dataset.target);
    });
});

// --- Lógica de Autenticación ---
const btnCloseAuth = document.getElementById('btn-cerrar-autenticacion');
if (btnCloseAuth) btnCloseAuth.onclick = () => navigateTo('vista-inicio');

const btnCloseProfile = document.getElementById('btn-cerrar-perfil');
if (btnCloseProfile) btnCloseProfile.onclick = () => navigateTo('vista-inicio');

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
    const name = document.getElementById('nombre-registro').value.trim();
    const surname = document.getElementById('apellido-registro').value.trim();
    const email = document.getElementById('email-registro').value.trim();
    const pass = document.getElementById('pass-registro').value;
    const genderSelect = document.getElementById('genero-registro');
    const gender = genderSelect ? genderSelect.value : "";
    const errorEl = document.getElementById('error-registro');

    errorEl.textContent = "";

    if (!name || !surname) {
        errorEl.textContent = "Por favor, ingresa tanto tu Nombre como tu Apellido.";
        return;
    }

    if (!gender) {
        errorEl.textContent = "Por favor, selecciona tu género.";
        return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[a-zA-Z]{2,}$/.test(email)) {
        errorEl.textContent = "El correo debe tener un dominio válido después del @.";
        return;
    }

    if (pass.length < 6) {
        errorEl.textContent = "La contraseña debe tener al menos 6 caracteres/dígitos.";
        return;
    }

    if (users.find(u => u.email === email)) {
        errorEl.textContent = "El correo ya está registrado.";
        return;
    }

    const formatName = (str) => {
        return str.toLowerCase().split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
    };

    users.push({ 
        name: `${formatName(name)} ${formatName(surname)}`, 
        email, 
        pass, 
        gender 
    });
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
    setTimeout(() => {
        alert(`Bienvenido, ${user.name}`);
    }, 450); // Esperar a que termine la animación
};

function updateAuthHeader() {
    if (currentUser) {
        authStatus.innerHTML = `
            <div class="user-badge" style="display: flex; align-items: center; gap: 0.75rem; cursor: pointer; text-align: right;" onclick="navigateTo('vista-perfil')">
                <div style="line-height: 1.2;">
                    <span class="user-badge__name" style="display: block; font-weight: 700; color: inherit; font-size: 0.95rem;">${currentUser.name}</span>
                    <span style="font-size: 0.75rem; color: #64748B;">Mi Perfil</span>
                </div>
                <div style="width: 42px; height: 42px; border-radius: 50%; border: 2px solid #3B82F6; display: flex; align-items: center; justify-content: center; background: rgba(59, 130, 246, 0.1); color: #3B82F6;">
                    <svg viewBox="0 0 24 24" width="22" height="22" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
                </div>
            </div>
            <button class="boton boton--secundario" style="margin-left: 0.5rem; padding: 0.4rem 1rem;" onclick="logout(); event.stopPropagation();">Salir</button>
        `;

        // Llenar datos del perfil
        const valNombre = document.getElementById('perfil-nombre-val');
        const valEmail = document.getElementById('perfil-email-val');
        const valGenero = document.getElementById('perfil-genero-val');
        if (valNombre) valNombre.textContent = currentUser.name;
        if (valEmail) valEmail.textContent = currentUser.email;
        if (valGenero) valGenero.textContent = currentUser.gender || "No especificado";

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

    if (!currentUser) {
        alert("Debes iniciar sesión para programar un vuelo.");
        navigateTo('vista-autenticacion');
        return;
    }
    const flightNum = document.getElementById('numero-vuelo').value.trim();
    const pais = selectPais ? selectPais.value : '';
    const estado = selectEstado ? selectEstado.value : '';
    const paisOrigen = selectPaisOrigen ? selectPaisOrigen.value : '';
    const estadoOrigen = selectEstadoOrigen ? selectEstadoOrigen.value : '';
    const model = document.getElementById('modelo-avion').value;

    if (!flightNum || !pais || !estado || !paisOrigen || !estadoOrigen || !model) {
        alert("Por favor completa todos los campos del vuelo.");
        return;
    }

    if (pais === paisOrigen && estado === estadoOrigen) {
        alert("Error: El país y estado de origen no pueden ser exactamente los mismos que el destino.");
        return;
    }

    const destination = `${estado}, ${pais}`;
    const origin = `${estadoOrigen}, ${paisOrigen}`;

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

    const newFlight = { id: Date.now().toString(), flightNumber: flightNum, origin: origin, destination: destination, model: model, seats: seats };
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
                    <span class="tarjeta-lista__title">${f.flightNumber} - Ruta: ${f.origin} a ${f.destination}</span>
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

formAddPassenger.addEventListener('submit', (e) => {
    e.preventDefault();
    const name = document.getElementById('nombre-pasajero').value.trim();
    const surname = document.getElementById('apellido-pasajero').value.trim();
    const age = parseInt(document.getElementById('edad-pasajero').value);
    const disability = document.getElementById('discapacidad-pasajero').checked;

    if (!name || !surname || isNaN(age) || age <= 0) {
        alert("Por favor, ingrese un nombre y apellido válidos y una edad mayor a 0.");
        return;
    }

    currentReservationSession.passengers.push({
        id: Date.now().toString() + Math.random().toString(36).substr(2, 5),
        name: `${name} ${surname}`, age, disability, seatId: null
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
        if (currentPassenger.age < 18 || currentPassenger.age >= 60 || currentPassenger.disability) {
            alert("Políticas de aviación: Menores de edad, personas de 3era edad (60+), o personas con discapacidad NO pueden reservar asientos en salidas de emergencia."); return;
        }
    }

    if (currentPassenger.age < 18) {
        const flight = flights.find(f => f.id === currentReservationSession.flightId);
        const hasAdjacentAdult = currentReservationSession.passengers.some(p => {
            if (p.age >= 18 && p.seatId) {
                const adultSeat = flight.seats.find(s => s.id === p.seatId);
                // Asiento contiguo: Misma fila y columna adyacente
                if (adultSeat && adultSeat.row === seatData.row && Math.abs(adultSeat.colIndex - seatData.colIndex) === 1) {
                    return true;
                }
            }
            return false;
        });

        if (!hasAdjacentAdult) {
            alert("Validación: Todo menor de edad debe ir acompañado de un representante en un asiento contiguo. Por favor, asigne primero el asiento del adulto y luego seleccione un asiento al lado para el menor.");
            return;
        }
    }

    currentPassenger.seatId = seatData.id;
    const nextUnassigned = currentReservationSession.passengers.find(p => !p.seatId);
    if (nextUnassigned) currentReservationSession.currentSelectingPassengerId = nextUnassigned.id;

    renderSeatAllocations(); renderAirplaneCabin();
}

btnCancelReservation.addEventListener('click', () => {
    if (confirm("¿Estás seguro de que deseas cancelar la operación actual?")) { 
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
    }
});

btnConfirmReservation.addEventListener('click', () => {
    const flight = flights.find(f => f.id === currentReservationSession.flightId);
    currentReservationSession.passengers.forEach(p => {
        const asiento = flight.seats.find(s => s.id === p.seatId);
        if (asiento) {
            asiento.occupiedBy = { name: p.name, age: p.age, disability: p.disability };
        }
    });

    if (editingReservationId) {
        const resIndex = globalReservations.findIndex(r => r.id === editingReservationId);
        if (resIndex !== -1) {
            globalReservations[resIndex].passengers = [...currentReservationSession.passengers];
            globalReservations[resIndex].date = new Date().toLocaleString(); // Update date
        }
        editingReservationId = null;
        alert("Reserva actualizada con éxito.");
    } else {
        const newRes = {
            id: "RES-" + Date.now().toString().substr(6),
            flightNumber: flight.flightNumber, origin: flight.origin, destination: flight.destination, model: flight.model, date: new Date().toLocaleString(),
            passengers: [...currentReservationSession.passengers],
            madeBy: currentUser ? currentUser.name : "Invitado",
            createdAt: Date.now() // Timestamp para validación de reversión
        };
        globalReservations.push(newRes);
        alert("Reserva confirmada con éxito.");
    }
    
    resetReserveForm();
    renderAdminFlights(); // Actualizar el contador de la lista de vuelos
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
