// Area Control Documental - La Cruz SRL

// DATOS  

const choferes = [
  { id: 1, nombre: "Juan Perez" },
  { id: 2, nombre: "Ana Gomez" }
];

const unidades = [
  { id: 101, patente: "AH123EX" },
  { id: 102, patente: "AH456EX" }
];

const tiposDoc = ["LICENCIA", "VTV", "SEGURO", "PSICOFISICO", "CONTRATO", "OTRO"];

// STORAGE 

let usuario = localStorage.getItem("usuarioCD") || "";
let documentos = JSON.parse(localStorage.getItem("documentosCD")) || [];

// SELECTORES (DOM) 

const formUsuario = document.getElementById("formUsuario");
const inputUsuario = document.getElementById("inputUsuario");
const saludo = document.getElementById("saludo");

const formDoc = document.getElementById("formDoc");
const selectTipo = document.getElementById("selectTipo");
const selectDestino = document.getElementById("selectDestino");
const selectIdRef = document.getElementById("selectIdRef");
const inputVenc = document.getElementById("inputVenc");
const msgDoc = document.getElementById("msgDoc");

const contenedorDocs = document.getElementById("contenedorDocs");
const totalSpan = document.getElementById("total");

const selectEstado = document.getElementById("selectEstado");
const btnFiltrar = document.getElementById("btnFiltrar");
const btnVerTodos = document.getElementById("btnVerTodos");

const resetBtn = document.getElementById("resetBtn");

// FUNCIONES 

// función simple con parámetros

function mostrarMensaje(texto, elemento){
  elemento.textContent = texto;
}

// Guarda en localStorage

function guardarStorage(){
  localStorage.setItem("usuarioCD", usuario);
  localStorage.setItem("documentosCD", JSON.stringify(documentos));
}

// Calculo de estado por vencimiento

function calcularEstado(fechaVenc){
  const hoy = new Date();
  const venc = new Date(fechaVenc + "T00:00:00");

  const msDia = 1000 * 60 * 60 * 24;
  const dias = Math.ceil((venc - hoy) / msDia);

  if (dias < 0) return "VENCIDO";
  if (dias <= 30) return "POR_VENCER";
  return "VIGENTE";
}

function mostrarSaludo(){
  if(usuario){
    saludo.textContent = "Hola " + usuario + ". Podés cargar documentos.";
  }else{
    saludo.textContent = "";
  }
}

// Para "tipos" de documento

function cargarTipos(){
  selectTipo.innerHTML = "";
  tiposDoc.forEach((t) => {
    const opt = document.createElement("option");
    opt.value = t;
    opt.textContent = t;
    selectTipo.appendChild(opt);
  });
}

// Carga ID chofer/unidad

function cargarIdRef(){
  selectIdRef.innerHTML = "";

  if(selectDestino.value === "CHOFER"){
    choferes.forEach((c) => {
      const opt = document.createElement("option");
      opt.value = c.id;
      opt.textContent = c.id + " - " + c.nombre;
      selectIdRef.appendChild(opt);
    });
  }else{
    unidades.forEach((u) => {
      const opt = document.createElement("option");
      opt.value = u.id;
      opt.textContent = u.id + " - " + u.patente;
      selectIdRef.appendChild(opt);
    });
  }
}

// Total  

function actualizarTotal(){
  totalSpan.textContent = documentos.length;
}

// Dibuja documentos en la pantalla (DOM)

function renderDocs(lista){
  contenedorDocs.innerHTML = "";

  if(lista.length === 0){
    contenedorDocs.innerHTML = "<p>No hay documentos cargados.</p>";
    return;
  }

  lista.forEach((d) => {
    const estado = calcularEstado(d.vencimiento);

    const div = document.createElement("div");
    div.className = "doc";

    div.innerHTML = `
      <div><b>Tipo:</b> ${d.tipo}</div>
      <div><b>Destino:</b> ${d.destino} (${d.idRef})</div>
      <div><b>Vencimiento:</b> ${d.vencimiento}</div>
      <div class="estado"><b>Estado:</b> ${estado}</div>
      <button class="btnEliminar" type="button">Eliminar</button>
    `;

    // Para eliminar

    div.querySelector(".btnEliminar").addEventListener("click", () => {
      documentos = documentos.filter(x => x.id !== d.id); // filter (unidad 6)
      guardarStorage();
      actualizarTotal();
      renderDocs(documentos);
      mostrarMensaje("Documento eliminado.", msgDoc);
    });

    contenedorDocs.appendChild(div);
  });
}

// EVENTOS 

// Para guardar usuario

formUsuario.addEventListener("submit", (e) => {
  e.preventDefault();
  const nombre = inputUsuario.value.trim();
  if(!nombre) return;

  usuario = nombre;
  guardarStorage();
  mostrarSaludo();
  mostrarMensaje("", msgDoc);
  formUsuario.reset();
});

// Si cambia destino -> cambia ID

selectDestino.addEventListener("change", () => {
  cargarIdRef();
});

// Para alta de documento

formDoc.addEventListener("submit", (e) => {
  e.preventDefault();

  if(!usuario){
    mostrarMensaje("Primero guardá tu nombre (arriba).", msgDoc);
    return;
  }

  const tipo = selectTipo.value;
  const destino = selectDestino.value;
  const idRef = Number(selectIdRef.value);
  const vencimiento = inputVenc.value;

  if(!vencimiento){
    mostrarMensaje("Falta elegir una fecha de vencimiento.", msgDoc);
    return;
  }

  const nuevoDoc = {
    id: Date.now(),
    tipo,
    destino,
    idRef,
    vencimiento
  };

  documentos.push(nuevoDoc);
  guardarStorage();
  actualizarTotal();
  renderDocs(documentos);

  mostrarMensaje("Documento agregado y guardado.", msgDoc);
  formDoc.reset();
  cargarIdRef();
});

// fPara filtrar 

btnFiltrar.addEventListener("click", () => {
  const estado = selectEstado.value;

  if(estado === "TODOS"){
    renderDocs(documentos);
    return;
  }

  const filtrados = documentos.filter(d => calcularEstado(d.vencimiento) === estado);
  renderDocs(filtrados);
});

btnVerTodos.addEventListener("click", () => {
  selectEstado.value = "TODOS";
  renderDocs(documentos);
});

// Para reiniciar

resetBtn.addEventListener("click", () => {
  usuario = "";
  documentos = [];

  localStorage.removeItem("usuarioCD");
  localStorage.removeItem("documentosCD");

  mostrarSaludo();
  actualizarTotal();
  renderDocs(documentos);
  mostrarMensaje("Se reinició todo.", msgDoc);
});

// INICIO 

cargarTipos();
cargarIdRef();
mostrarSaludo();
actualizarTotal();
renderDocs(documentos);
