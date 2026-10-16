// Referencias a los elementos de la interfaz (usando los nombres del boceto)
const zonaChat = document.getElementById('zona-chat');
const respuestasRapidas = document.getElementById('respuestas-rapidas');

// Variables de estado de la aplicación
let arbolDecision = null;
let modeloAutoUsuario = "";

// Cargar el árbol de decisión mediante fetch
fetch('arbol_decision.json')
    .then(response => {
        if (!response.ok) {
            throw new Error('No se pudo cargar el JSON');
        }
        return response.json();
    })
    .then(data => {
        arbolDecision = data;
        iniciarConversacion();
    })
    .catch(error => {
        console.error(error);
        mostrarMensajeBot("⚠️ Abrí el proyecto con Live Server o un servidor local para que pueda leer arbol_decision.json.", "error");
    });

// Inicia la conversación mostrando el nodo inicial
function iniciarConversacion() {
    zonaChat.innerHTML = "";
    modeloAutoUsuario = "";
    irANodo("inicio");
}

// Navega a un nodo específico del árbol
function irANodo(idNodo) {
    const nodo = arbolDecision[idNodo];

    if (!nodo) {
        console.error(`Nodo no encontrado: ${idNodo}`);
        return;
    }

    // Remplazar la variable {modelo} en el texto si ya se ha registrado
    let textoMensaje = nodo.texto;
    if (modeloAutoUsuario) {
        textoMensaje = textoMensaje.replace(/{modelo}/g, modeloAutoUsuario);
    }

    // Mostrar el mensaje del bot
    mostrarMensajeBot(textoMensaje);

    // Limpiar controles anteriores
    respuestasRapidas.innerHTML = "";

    // Verificar si el nodo requiere un input o botones
    if (nodo.tipoInput) {
        crearCampoEntrada(nodo);
    } else if (nodo.opciones && nodo.opciones.length > 0) {
        crearBotonesOpciones(nodo.opciones);
    }
}

// Muestra una burbuja de mensaje en la "zona chat"
function mostrarMensajeBot(texto, claseAdicional = "") {
    const div = document.createElement('div');
    div.className = `mensaje bot ${claseAdicional}`;
    div.innerText = texto;
    zonaChat.appendChild(div);
    scrollAlFinal();
}

// Muestra la respuesta elegida por el usuario
function mostrarMensajeUsuario(texto) {
    const div = document.createElement('div');
    div.className = 'mensaje usuario';
    div.innerText = texto;
    zonaChat.appendChild(div);
    scrollAlFinal();
}

// Mantiene el scroll en la parte inferior del chat
function scrollAlFinal() {
    zonaChat.scrollTop = zonaChat.scrollHeight;
}

// Genera los botones de respuesta rápida
function crearBotonesOpciones(opciones) {
    const contenedorGrid = document.createElement('div');
    contenedorGrid.className = 'opciones-grid';

    opciones.forEach(opcion => {
        const btn = document.createElement('button');
        btn.className = 'btn-opcion';
        btn.innerText = opcion.texto;
        btn.onclick = () => {
            mostrarMensajeUsuario(opcion.texto);
            if (opcion.siguiente === "reiniciar") {
                iniciarConversacion();
            } else {
                irANodo(opcion.siguiente);
            }
        };
        contenedorGrid.appendChild(btn);
    });

    respuestasRapidas.appendChild(contenedorGrid);
}

// Genera el input de entrada cuando se requiere solicitar datos específicos
function crearCampoEntrada(nodo) {
    const contenedorInput = document.createElement('div');
    contenedorInput.className = 'input-container';

    const input = document.createElement('input');
    input.type = 'text';
    input.className = 'input-field';
    input.placeholder = nodo.placeholder || 'Escribe aquí...';

    const errorDiv = document.createElement('div');
    errorDiv.className = 'error-text';

    const btnEnviar = document.createElement('button');
    btnEnviar.className = 'btn-enviar';
    btnEnviar.innerText = 'Enviar';

    const procesarEnvio = () => {
        const valor = input.value.trim();

        // Validación del formato de datos
        if (nodo.validacion === "texto") {
            if (valor.length < 2) {
                errorDiv.innerText = "Por favor ingresá un nombre o modelo válido (mínimo 2 caracteres).";
                return;
            }
            if (/^\d+$/.test(valor)) {
                errorDiv.innerText = "El nombre o modelo no puede contener únicamente números.";
                return;
            }
        }

        // Guardar la variable recordada
        if (nodo.guardarVariable === "modeloAuto") {
            modeloAutoUsuario = valor;
        }

        mostrarMensajeUsuario(valor);
        irANodo(nodo.siguiente);
    };

    btnEnviar.onclick = procesarEnvio;
    input.onkeypress = (e) => {
        if (e.key === 'Enter') procesarEnvio();
    };

    contenedorInput.appendChild(input);
    contenedorInput.appendChild(errorDiv);
    contenedorInput.appendChild(btnEnviar);
    respuestasRapidas.appendChild(contenedorInput);

    input.focus();
}
