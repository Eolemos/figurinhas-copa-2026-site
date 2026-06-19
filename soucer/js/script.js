const totalSteps = 4;

// ==================================================
// CLUBES VINDOS DO ARQUIVO clubes.js
// ==================================================

const CLUBES_FAMOSOS = window.CLUBES_FAMOSOS || {};
const TODOS_OS_CLUBES = Object.values(CLUBES_FAMOSOS).flat();

let clubeIndexAtivo = -1;
let clubesFiltradosAtual = [];

// ==================================================
// INICIALIZAÇÃO
// ==================================================

window.addEventListener('load', () => {
    startAutoScroll();
    configurarCamposData();
    configurarListaClubes();
    configurarPreviewFoto();
    configurarLimpezaErrosEmTempoReal();
});

// FUNÇÃO DE ROLAGEM AUTOMÁTICA DOS CARROSSEIS
function startAutoScroll() {
    const carousels = document.querySelectorAll('.auto-scroll');

    carousels.forEach(carousel => {
        setInterval(() => {
            if (carousel.scrollLeft + carousel.clientWidth >= carousel.scrollWidth - 2) {
                carousel.scrollTo({ left: 0, behavior: 'smooth' });
            } else {
                carousel.scrollBy({ left: 150, behavior: 'smooth' });
            }
        }, 3000);
    });
}

function configurarCamposData() {
    const inputsData = document.querySelectorAll('#step-2 input[type="number"]');

    if (inputsData[0]) {
        inputsData[0].id = "input-dia";
        inputsData[0].setAttribute("min", "1");
        inputsData[0].setAttribute("max", "31");
    }

    if (inputsData[1]) {
        inputsData[1].id = "input-mes";
        inputsData[1].setAttribute("min", "1");
        inputsData[1].setAttribute("max", "12");
    }

    if (inputsData[2]) {
        inputsData[2].id = "input-ano";
        inputsData[2].setAttribute("min", "1900");
        inputsData[2].setAttribute("max", String(new Date().getFullYear()));
    }

    const grupoData = inputsData[0]?.parentElement?.parentElement;

    if (grupoData) {
        grupoData.id = "grupo-data-nascimento";
    }
}

// ==================================================
// DROPDOWN PESQUISÁVEL DE CLUBES
// ==================================================

function normalizarTexto(texto) {
    return String(texto || "")
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .toLowerCase()
        .trim();
}

function obterClubesFiltrados(termo = "") {
    const busca = normalizarTexto(termo);
    const resultado = [];

    Object.entries(CLUBES_FAMOSOS).forEach(([grupo, clubes]) => {
        clubes.forEach(clube => {
            const clubeNormalizado = normalizarTexto(clube);
            const grupoNormalizado = normalizarTexto(grupo);

            if (
                !busca ||
                clubeNormalizado.includes(busca) ||
                grupoNormalizado.includes(busca)
            ) {
                resultado.push({
                    grupo,
                    clube
                });
            }
        });
    });

    return resultado;
}

function abrirDropdownClubes() {
    const dropdown = document.getElementById('dropdown-clubes');

    if (!dropdown) return;

    dropdown.classList.add('aberto');
    dropdown.setAttribute('aria-hidden', 'false');
}

function fecharDropdownClubes() {
    const dropdown = document.getElementById('dropdown-clubes');

    if (!dropdown) return;

    dropdown.classList.remove('aberto');
    dropdown.setAttribute('aria-hidden', 'true');
    clubeIndexAtivo = -1;
}

function selecionarClube(clube) {
    const inputClube = document.getElementById('input-clube');

    if (!inputClube) return;

    inputClube.value = clube;
    limparErroCampo(inputClube);
    fecharDropdownClubes();
}

function atualizarItemAtivoDropdown() {
    const botoes = document.querySelectorAll('.clube-opcao');

    botoes.forEach((botao, index) => {
        botao.classList.toggle('ativo', index === clubeIndexAtivo);
    });

    if (clubeIndexAtivo >= 0 && botoes[clubeIndexAtivo]) {
        botoes[clubeIndexAtivo].scrollIntoView({
            block: 'nearest'
        });
    }
}

function renderizarDropdownClubes(termo = "") {
    const dropdown = document.getElementById('dropdown-clubes');

    if (!dropdown) return;

    clubesFiltradosAtual = obterClubesFiltrados(termo);
    clubeIndexAtivo = -1;

    dropdown.innerHTML = "";

    if (!Object.keys(CLUBES_FAMOSOS).length) {
        const vazio = document.createElement("div");
        vazio.className = "clube-sem-resultado";
        vazio.innerText = "Lista de clubes não carregada. Verifique o arquivo clubes.js.";
        dropdown.appendChild(vazio);
        return;
    }

    if (clubesFiltradosAtual.length === 0) {
        const vazio = document.createElement("div");
        vazio.className = "clube-sem-resultado";
        vazio.innerText = "Nenhum clube encontrado. Você pode digitar o nome manualmente.";
        dropdown.appendChild(vazio);
        return;
    }

    let ultimoGrupo = "";

    clubesFiltradosAtual.forEach((item) => {
        if (item.grupo !== ultimoGrupo) {
            const grupo = document.createElement("div");
            grupo.className = "dropdown-grupo";
            grupo.innerText = item.grupo;
            dropdown.appendChild(grupo);

            ultimoGrupo = item.grupo;
        }

        const botao = document.createElement("button");
        botao.type = "button";
        botao.className = "clube-opcao";
        botao.innerText = item.clube;

        botao.addEventListener("mousedown", (evento) => {
            evento.preventDefault();
            selecionarClube(item.clube);
        });

        dropdown.appendChild(botao);
    });
}

function configurarListaClubes() {
    const inputClube = document.getElementById('input-clube');
    const dropdown = document.getElementById('dropdown-clubes');
    const botaoToggle = document.getElementById('btn-toggle-clubes');

    if (!inputClube || !dropdown) {
        return;
    }

    renderizarDropdownClubes("");

    inputClube.addEventListener('focus', () => {
        renderizarDropdownClubes(inputClube.value);
        abrirDropdownClubes();
    });

    inputClube.addEventListener('input', () => {
        limparErroCampo(inputClube);
        renderizarDropdownClubes(inputClube.value);
        abrirDropdownClubes();
    });

    inputClube.addEventListener('keydown', (evento) => {
        const dropdownAberto = dropdown.classList.contains('aberto');

        if (evento.key === "ArrowDown") {
            evento.preventDefault();

            if (!dropdownAberto) {
                renderizarDropdownClubes(inputClube.value);
                abrirDropdownClubes();
            }

            if (clubesFiltradosAtual.length > 0) {
                clubeIndexAtivo = Math.min(clubeIndexAtivo + 1, clubesFiltradosAtual.length - 1);
                atualizarItemAtivoDropdown();
            }
        }

        if (evento.key === "ArrowUp") {
            evento.preventDefault();

            if (clubesFiltradosAtual.length > 0) {
                clubeIndexAtivo = Math.max(clubeIndexAtivo - 1, 0);
                atualizarItemAtivoDropdown();
            }
        }

        if (evento.key === "Enter") {
            if (dropdownAberto && clubeIndexAtivo >= 0 && clubesFiltradosAtual[clubeIndexAtivo]) {
                evento.preventDefault();
                selecionarClube(clubesFiltradosAtual[clubeIndexAtivo].clube);
            }
        }

        if (evento.key === "Escape") {
            fecharDropdownClubes();
        }
    });

    if (botaoToggle) {
        botaoToggle.addEventListener('mousedown', (evento) => {
            evento.preventDefault();

            const estaAberto = dropdown.classList.contains('aberto');

            if (estaAberto) {
                fecharDropdownClubes();
            } else {
                inputClube.focus();
                renderizarDropdownClubes(inputClube.value);
                abrirDropdownClubes();
            }
        });
    }

    document.addEventListener('mousedown', (evento) => {
        const wrapper = document.getElementById('clube-search-wrapper');

        if (wrapper && !wrapper.contains(evento.target)) {
            fecharDropdownClubes();
        }
    });
}

// ==================================================
// NAVEGAÇÃO
// ==================================================

function iniciarQuiz() {
    document.getElementById('landing-page').style.display = 'none';
    document.body.style.backgroundColor = "var(--bg-escuro)";
    document.body.style.alignItems = "center";
    document.getElementById('quiz-wrapper').style.display = 'flex';
    document.getElementById('quiz-area').style.display = 'block';
}

function updateProgress(step) {
    const percentage = Math.round((step / totalSteps) * 100);

    document.getElementById('progress-bar-fill').style.width = percentage + '%';
    document.getElementById('step-counter').innerText = 'Passo ' + step + ' de ' + totalSteps;
    document.getElementById('progress-percentage').innerText = percentage + '%';
}

function showStep(stepId) {
    document.querySelectorAll('.step').forEach(el => el.classList.remove('active'));
    document.getElementById(stepId).classList.add('active');
}

function nextStep(step) {
    const etapaAtual = document.querySelector('.step.active')?.id;

    if (etapaAtual === "step-1" && step === 2) {
        if (!validarStep1()) {
            rolarParaPrimeiroErro();
            return;
        }
    }

    if (etapaAtual === "step-2" && step === 3) {
        if (!validarStep2()) {
            rolarParaPrimeiroErro();
            return;
        }
    }

    showStep('step-' + step);
    updateProgress(step);
}

function prevStep(step) {
    showStep('step-' + step);
    updateProgress(step);
}

// ==================================================
// SISTEMA DE ERROS BONITOS
// ==================================================

function garantirIdElemento(elemento, prefixo = "campo") {
    if (!elemento.id) {
        elemento.id = `${prefixo}-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
    }

    return elemento.id;
}

function removerErroPorChave(chave) {
    const erroExistente = document.querySelector(`[data-error-for="${chave}"]`);

    if (erroExistente) {
        erroExistente.remove();
    }
}

function criarMensagemErro(chave, mensagem) {
    removerErroPorChave(chave);

    const erro = document.createElement("div");
    erro.className = "mensagem-erro-campo";
    erro.dataset.errorFor = chave;
    erro.innerText = mensagem;

    erro.style.marginTop = "7px";
    erro.style.padding = "9px 11px";
    erro.style.borderRadius = "9px";
    erro.style.background = "#fff1f0";
    erro.style.border = "1px solid #ffb3ad";
    erro.style.color = "#c62828";
    erro.style.fontSize = "0.78rem";
    erro.style.fontWeight = "800";
    erro.style.lineHeight = "1.35";
    erro.style.textAlign = "left";

    return erro;
}

function mostrarErroCampo(elemento, mensagem) {
    if (!elemento) return;

    const chave = garantirIdElemento(elemento);

    elemento.style.borderColor = "#ff3b30";
    elemento.style.backgroundColor = "#fff7f7";
    elemento.style.boxShadow = "0 0 0 3px rgba(255, 59, 48, 0.12)";

    const erro = criarMensagemErro(chave, mensagem);

    elemento.insertAdjacentElement("afterend", erro);
}

function limparErroCampo(elemento) {
    if (!elemento) return;

    const chave = garantirIdElemento(elemento);

    elemento.style.borderColor = "";
    elemento.style.backgroundColor = "";
    elemento.style.boxShadow = "";

    removerErroPorChave(chave);
}

function mostrarErroBloco(chave, elementoReferencia, mensagem) {
    if (!elementoReferencia) return;

    const erro = criarMensagemErro(chave, mensagem);
    elementoReferencia.insertAdjacentElement("afterend", erro);
}

function limparErroBloco(chave) {
    removerErroPorChave(chave);
}

function marcarUploadComErro() {
    document.querySelectorAll('.upload-box').forEach(box => {
        box.style.borderColor = "#ff3b30";
        box.style.background = "#fff7f7";
        box.style.boxShadow = "0 0 0 3px rgba(255, 59, 48, 0.12)";
    });
}

function limparErroUpload() {
    limparErroBloco("foto-cliente");

    document.querySelectorAll('.upload-box').forEach(box => {
        box.style.borderColor = "";
        box.style.background = "";
        box.style.boxShadow = "";
    });
}

function mostrarErroUpload(mensagem) {
    const uploadBoxes = document.querySelector('.upload-boxes');

    limparErroUpload();
    marcarUploadComErro();

    mostrarErroBloco("foto-cliente", uploadBoxes, mensagem);
}

function marcarDataComErro(mensagem) {
    const grupoData = document.getElementById("grupo-data-nascimento");
    const dia = document.getElementById("input-dia");
    const mes = document.getElementById("input-mes");
    const ano = document.getElementById("input-ano");

    [dia, mes, ano].forEach(input => {
        if (input) {
            input.style.borderColor = "#ff3b30";
            input.style.backgroundColor = "#fff7f7";
            input.style.boxShadow = "0 0 0 3px rgba(255, 59, 48, 0.12)";
        }
    });

    limparErroBloco("data-nascimento");
    mostrarErroBloco("data-nascimento", grupoData, mensagem);
}

function limparErroData() {
    const dia = document.getElementById("input-dia");
    const mes = document.getElementById("input-mes");
    const ano = document.getElementById("input-ano");

    [dia, mes, ano].forEach(input => {
        if (input) {
            input.style.borderColor = "";
            input.style.backgroundColor = "";
            input.style.boxShadow = "";
        }
    });

    limparErroBloco("data-nascimento");
}

function rolarParaPrimeiroErro() {
    const primeiroErro = document.querySelector('.mensagem-erro-campo');

    if (primeiroErro) {
        primeiroErro.scrollIntoView({
            behavior: "smooth",
            block: "center"
        });
    }
}

function configurarLimpezaErrosEmTempoReal() {
    document.querySelectorAll('input, select').forEach(campo => {
        campo.addEventListener('input', () => {
            limparErroCampo(campo);

            if (campo.id === "input-dia" || campo.id === "input-mes" || campo.id === "input-ano") {
                limparErroData();
            }
        });

        campo.addEventListener('change', () => {
            limparErroCampo(campo);

            if (campo.id === "input-dia" || campo.id === "input-mes" || campo.id === "input-ano") {
                limparErroData();
            }
        });
    });
}

// ==================================================
// VALIDAÇÕES POR ETAPA
// ==================================================

function obterFotoSelecionada() {
    let fotoArquivo = null;
    const inputsDeFoto = document.querySelectorAll('.input-foto-cliente');

    inputsDeFoto.forEach(input => {
        if (input.files.length > 0) {
            fotoArquivo = input.files[0];
        }
    });

    return fotoArquivo;
}

function ehArquivoImagemAceito(arquivo) {
    if (!arquivo) return false;

    const tipo = arquivo.type || "";
    const nome = arquivo.name || "";

    const extensoesAceitas = /\.(jpg|jpeg|png|webp|heic|heif)$/i;

    return tipo.startsWith("image/") || extensoesAceitas.test(nome);
}

function validarNome() {
    const inputNome = document.getElementById('input-nome');

    limparErroCampo(inputNome);

    const nome = inputNome?.value?.trim().replace(/\s+/g, " ") || "";

    if (!nome) {
        mostrarErroCampo(inputNome, "Informe o nome do craque para aparecer na figurinha.");
        return false;
    }

    if (nome.length < 3) {
        mostrarErroCampo(inputNome, "O nome precisa ter pelo menos 3 caracteres.");
        return false;
    }

    if (!/[A-Za-zÀ-ÿ]/.test(nome)) {
        mostrarErroCampo(inputNome, "Digite um nome válido usando letras.");
        return false;
    }

    return true;
}

function validarFotoObrigatoria() {
    const foto = obterFotoSelecionada();

    limparErroUpload();

    if (!foto) {
        mostrarErroUpload("Envie uma foto do rosto antes de continuar.");
        return false;
    }

    if (!ehArquivoImagemAceito(foto)) {
        mostrarErroUpload("Envie uma imagem válida nos formatos JPG, PNG, WEBP ou HEIC.");
        return false;
    }

    return true;
}

function validarStep1() {
    let valido = true;

    if (!validarNome()) {
        valido = false;
    }

    if (!validarFotoObrigatoria()) {
        valido = false;
    }

    return valido;
}

function obterDataDigitada() {
    const dia = Number(document.getElementById("input-dia")?.value);
    const mes = Number(document.getElementById("input-mes")?.value);
    const ano = Number(document.getElementById("input-ano")?.value);

    return { dia, mes, ano };
}

function dataEhValida(dia, mes, ano) {
    if (!dia || !mes || !ano) {
        return false;
    }

    const anoAtual = new Date().getFullYear();

    if (ano < 1900 || ano > anoAtual) {
        return false;
    }

    if (mes < 1 || mes > 12) {
        return false;
    }

    if (dia < 1 || dia > 31) {
        return false;
    }

    const data = new Date(ano, mes - 1, dia);

    return (
        data.getFullYear() === ano &&
        data.getMonth() === mes - 1 &&
        data.getDate() === dia
    );
}

function validarDataNascimento() {
    limparErroData();

    const { dia, mes, ano } = obterDataDigitada();

    if (!dia || !mes || !ano) {
        marcarDataComErro("Preencha dia, mês e ano da data de nascimento.");
        return false;
    }

    if (!dataEhValida(dia, mes, ano)) {
        marcarDataComErro("Digite uma data de nascimento válida.");
        return false;
    }

    return true;
}

function dominioEmailComErro(email) {
    const dominio = email.split("@")[1]?.toLowerCase() || "";

    const sugestoes = {
        "gamil.com": "gmail.com",
        "gmial.com": "gmail.com",
        "gnail.com": "gmail.com",
        "hotmai.com": "hotmail.com",
        "hotmal.com": "hotmail.com",
        "outlok.com": "outlook.com",
        "outllok.com": "outlook.com",
        "yaho.com": "yahoo.com"
    };

    return sugestoes[dominio] || "";
}

function emailTemFormatoValido(email) {
    const regex = /^[^\s@]+@[^\s@]+\.[A-Za-z]{2,}$/;
    return regex.test(email);
}

function validarEmail() {
    const inputEmail = document.getElementById('input-email') || document.querySelector('input[type="email"]');

    limparErroCampo(inputEmail);

    const email = inputEmail?.value?.trim() || "";

    if (!email) {
        mostrarErroCampo(inputEmail, "Informe seu melhor e-mail para receber a figurinha.");
        return false;
    }

    if (!emailTemFormatoValido(email)) {
        mostrarErroCampo(inputEmail, "Digite um e-mail válido. Exemplo: nome@gmail.com");
        return false;
    }

    const sugestao = dominioEmailComErro(email);

    if (sugestao) {
        mostrarErroCampo(inputEmail, `Confira o domínio do e-mail. Você quis dizer ${sugestao}?`);
        return false;
    }

    return true;
}

function validarStep2() {
    let valido = true;

    if (!validarDataNascimento()) {
        valido = false;
    }

    if (!validarEmail()) {
        valido = false;
    }

    return valido;
}

function obterClubeDigitado() {
    const inputClube = document.getElementById('input-clube');
    return inputClube?.value?.trim().replace(/\s+/g, " ") || "";
}

function validarClube() {
    const inputClube = document.getElementById('input-clube');

    limparErroCampo(inputClube);

    const clube = obterClubeDigitado();

    if (!clube) {
        mostrarErroCampo(inputClube, "Digite ou escolha o clube do coração.");
        return false;
    }

    if (clube.length < 2) {
        mostrarErroCampo(inputClube, "Digite pelo menos 2 caracteres para o clube.");
        return false;
    }

    return true;
}

function numeroCampo(valor) {
    return Number(String(valor || "").replace(",", "."));
}

function validarPeso() {
    const inputPeso = document.getElementById('input-peso');

    limparErroCampo(inputPeso);

    const peso = numeroCampo(inputPeso?.value);

    if (!inputPeso?.value) {
        mostrarErroCampo(inputPeso, "Informe o peso em kg.");
        return false;
    }

    if (isNaN(peso) || peso < 5 || peso > 250) {
        mostrarErroCampo(inputPeso, "Digite um peso válido entre 5 kg e 250 kg.");
        return false;
    }

    return true;
}

function validarAltura() {
    const inputAltura = document.getElementById('input-altura');

    limparErroCampo(inputAltura);

    const altura = numeroCampo(inputAltura?.value);

    if (!inputAltura?.value) {
        mostrarErroCampo(inputAltura, "Informe a altura.");
        return false;
    }

    const alturaEmCmValida = altura >= 50 && altura <= 230;
    const alturaEmMetroValida = altura >= 0.5 && altura <= 2.3;

    if (isNaN(altura) || (!alturaEmCmValida && !alturaEmMetroValida)) {
        mostrarErroCampo(inputAltura, "Digite uma altura válida. Exemplo: 120 cm ou 1,20 m.");
        return false;
    }

    return true;
}

function validarStep3() {
    let valido = true;

    if (!validarClube()) {
        valido = false;
    }

    if (!validarPeso()) {
        valido = false;
    }

    if (!validarAltura()) {
        valido = false;
    }

    return valido;
}

function validarTudoAntesDeGerar() {
    if (!validarStep1()) {
        showStep("step-1");
        updateProgress(1);
        setTimeout(rolarParaPrimeiroErro, 150);
        return false;
    }

    if (!validarStep2()) {
        showStep("step-2");
        updateProgress(2);
        setTimeout(rolarParaPrimeiroErro, 150);
        return false;
    }

    if (!validarStep3()) {
        showStep("step-3");
        updateProgress(3);
        setTimeout(rolarParaPrimeiroErro, 150);
        return false;
    }

    return true;
}

// ==================================================
// COLETA DE DADOS
// ==================================================

function obterDataNascimentoFormatada() {
    const dia = document.getElementById("input-dia")?.value
        ? String(document.getElementById("input-dia").value).padStart(2, '0')
        : "";

    const mes = document.getElementById("input-mes")?.value
        ? String(document.getElementById("input-mes").value).padStart(2, '0')
        : "";

    const ano = document.getElementById("input-ano")?.value
        ? String(document.getElementById("input-ano").value)
        : "";

    if (dia && mes && ano) {
        return `${dia}-${mes}-${ano}`;
    }

    return "";
}

function obterEmail() {
    const campoEmail =
        document.getElementById('input-email') ||
        document.querySelector('input[type="email"]');

    return campoEmail?.value?.trim() || "";
}

function formatarAlturaRevisao(valor) {
    const numero = numeroCampo(valor);

    if (isNaN(numero)) {
        return "--";
    }

    // Se digitou em centímetros com 100 cm ou mais, converte para metro
    if (numero >= 100) {
        const metros = numero / 100;
        return `${metros.toFixed(2).replace(".", ",")} m`;
    }

    // Se digitou entre 50 e 99, mantém em centímetros
    if (numero >= 50 && numero < 100) {
        return `${numero} cm`;
    }

    // Se digitou direto em metro: 1.80 ou 1,80
    if (numero >= 0.5 && numero <= 2.3) {
        return `${numero.toFixed(2).replace(".", ",")} m`;
    }

    return `${numero} cm`;
}

function preparaRevisao() {
    if (!validarStep3()) {
        rolarParaPrimeiroErro();
        return;
    }

    document.getElementById('rev-nome').innerText =
        document.getElementById('input-nome').value || "Não informado";

    document.getElementById('rev-peso').innerText =
        (document.getElementById('input-peso').value || "--") + " kg";

    document.getElementById('rev-altura').innerText =
        formatarAlturaRevisao(document.getElementById('input-altura').value);

    document.getElementById('rev-clube').innerText =
        obterClubeDigitado() || "Não informado";

    nextStep(4);
}

// ==================================================
// PREVIEW DA FOTO ENVIADA PELO CLIENTE
// ==================================================

function configurarPreviewFoto() {
    const inputsDeFoto = document.querySelectorAll('.input-foto-cliente');

    inputsDeFoto.forEach(input => {
        input.addEventListener('change', evento => {
            const arquivo = evento.target.files && evento.target.files[0];

            if (!arquivo) {
                return;
            }

            if (!ehArquivoImagemAceito(arquivo)) {
                mostrarErroUpload("Envie uma imagem válida nos formatos JPG, PNG, WEBP ou HEIC.");
                evento.target.value = "";
                return;
            }

            limparErroUpload();

            inputsDeFoto.forEach(outroInput => {
                if (outroInput !== evento.target) {
                    outroInput.value = "";
                }
            });

            document.querySelectorAll('.upload-box').forEach(box => {
                box.classList.remove('foto-selecionada');
            });

            const boxSelecionado = evento.target.closest('.upload-box');

            if (boxSelecionado) {
                boxSelecionado.classList.add('foto-selecionada');
            }

            mostrarPreviewFoto(arquivo);
        });
    });
}

function mostrarPreviewFoto(arquivo) {
    const container = document.getElementById('preview-foto-container');
    const img = document.getElementById('preview-foto-cliente');
    const nomeArquivo = document.getElementById('preview-foto-nome');

    if (!container || !img || !nomeArquivo) {
        console.warn("Elementos de preview da foto não encontrados no HTML.");
        return;
    }

    const leitor = new FileReader();

    leitor.onload = function(evento) {
        img.src = evento.target.result;
        nomeArquivo.innerText = arquivo.name || "Foto selecionada";
        container.style.display = 'block';

        setTimeout(() => {
            container.scrollIntoView({
                behavior: 'smooth',
                block: 'nearest'
            });
        }, 150);
    };

    leitor.onerror = function() {
        mostrarErroUpload("Não foi possível carregar a prévia da imagem.");
    };

    leitor.readAsDataURL(arquivo);
}

function removerFotoSelecionada() {
    const inputsDeFoto = document.querySelectorAll('.input-foto-cliente');
    const container = document.getElementById('preview-foto-container');
    const img = document.getElementById('preview-foto-cliente');
    const nomeArquivo = document.getElementById('preview-foto-nome');

    inputsDeFoto.forEach(input => {
        input.value = "";
    });

    document.querySelectorAll('.upload-box').forEach(box => {
        box.classList.remove('foto-selecionada');
    });

    limparErroUpload();

    if (img) {
        img.src = "";
    }

    if (nomeArquivo) {
        nomeArquivo.innerText = "";
    }

    if (container) {
        container.style.display = "none";
    }
}

// ==================================================
// LOADING PROFISSIONAL
// ==================================================

function garantirTextoLoading() {
    let status = document.getElementById('loading-status-text');

    if (status) {
        return status;
    }

    const loadingStep = document.getElementById('step-loading');

    status = document.createElement('div');
    status.id = 'loading-status-text';
    status.style.marginTop = '18px';
    status.style.fontWeight = '700';
    status.style.fontSize = '16px';
    status.style.textAlign = 'center';
    status.style.color = '#003b66';
    status.style.lineHeight = '1.4';

    if (loadingStep) {
        loadingStep.appendChild(status);
    }

    return status;
}

function setLoadingProgress(percentual, mensagem) {
    const fill = document.getElementById('loading-bar-fill');
    const status = garantirTextoLoading();

    const valor = Math.max(0, Math.min(100, Math.round(percentual)));

    if (fill) {
        fill.style.width = valor + '%';
    }

    if (status) {
        status.innerText = mensagem + ` ${valor}%`;
    }
}

function iniciarProgressoInteligente() {
    let progresso = 5;
    let etapa = 0;

    const mensagens = [
        "Preparando sua foto para a IA...",
        "Otimizando imagem para geração rápida...",
        "Criando sua figurinha personalizada...",
        "Ajustando rosto, cabelo e iluminação...",
        "Preservando camisa, fundo e layout...",
        "Aplicando nome e dados finais..."
    ];

    setLoadingProgress(progresso, mensagens[0]);

    const intervalo = setInterval(() => {
        if (progresso < 28) {
            progresso += 3;
            etapa = 0;
        } else if (progresso < 52) {
            progresso += 2;
            etapa = 1;
        } else if (progresso < 74) {
            progresso += 1;
            etapa = 2;
        } else if (progresso < 88) {
            progresso += 0.5;
            etapa = 3;
        } else if (progresso < 94) {
            progresso += 0.2;
            etapa = 4;
        } else {
            progresso = 94;
            etapa = 4;
        }

        setLoadingProgress(progresso, mensagens[etapa]);
    }, 700);

    return intervalo;
}

function finalizarProgressoComSucesso() {
    setLoadingProgress(97, "Aplicando marca d’água da prévia...");

    setTimeout(() => {
        setLoadingProgress(100, "Figurinha finalizada!");
    }, 350);
}

// ==================================================
// OTIMIZAÇÃO DA FOTO NO FRONTEND
// ==================================================

function carregarImagemDoArquivo(arquivo) {
    return new Promise((resolve, reject) => {
        const url = URL.createObjectURL(arquivo);
        const img = new Image();

        img.onload = () => {
            URL.revokeObjectURL(url);
            resolve(img);
        };

        img.onerror = () => {
            URL.revokeObjectURL(url);
            reject(new Error("Não foi possível carregar a foto enviada."));
        };

        img.src = url;
    });
}

function canvasParaBlob(canvas, tipo, qualidade) {
    return new Promise((resolve, reject) => {
        canvas.toBlob(blob => {
            if (!blob) {
                reject(new Error("Não foi possível otimizar a foto."));
                return;
            }

            resolve(blob);
        }, tipo, qualidade);
    });
}

async function otimizarFotoAntesDoEnvio(arquivo) {
    const imagem = await carregarImagemDoArquivo(arquivo);

    const maximo = 512;
    const maiorLado = Math.max(imagem.width, imagem.height);
    const escala = maiorLado > maximo ? maximo / maiorLado : 1;

    const largura = Math.round(imagem.width * escala);
    const altura = Math.round(imagem.height * escala);

    const canvas = document.createElement('canvas');
    canvas.width = largura;
    canvas.height = altura;

    const ctx = canvas.getContext('2d');
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';
    ctx.drawImage(imagem, 0, 0, largura, altura);

    const blob = await canvasParaBlob(canvas, 'image/jpeg', 0.70);

    return new File([blob], 'foto-cliente.jpg', {
        type: 'image/jpeg',
        lastModified: Date.now()
    });
}

// ==================================================
// ENVIO REAL PARA O SERVIDOR
// ==================================================

async function startGeneration() {
    if (!validarTudoAntesDeGerar()) {
        return;
    }

    document.getElementById('header-quiz').style.display = 'none';
    document.getElementById('progress-bar-bg').style.display = 'none';

    showStep('step-loading');

    setLoadingProgress(3, "Iniciando geração da figurinha...");
    const intervaloProgresso = iniciarProgressoInteligente();

    const fotoArquivo = obterFotoSelecionada();

    try {
        setLoadingProgress(12, "Otimizando sua foto antes do envio...");

        const fotoOtimizada = await otimizarFotoAntesDoEnvio(fotoArquivo);

        setLoadingProgress(24, "Enviando dados para o servidor...");

        const pacoteDeDados = new FormData();

        const nome = document.getElementById('input-nome').value || "";
        const peso = document.getElementById('input-peso').value || "";
        const altura = formatarAlturaRevisao(document.getElementById('input-altura').value);
        const dataNascimento = obterDataNascimentoFormatada();
        const email = obterEmail();
        const clube = obterClubeDigitado();

        pacoteDeDados.append('fotoCliente', fotoOtimizada, 'foto-cliente.jpg');
        pacoteDeDados.append('nome', nome);
        pacoteDeDados.append('peso', peso);
        pacoteDeDados.append('altura', altura);
        pacoteDeDados.append('clube', clube);
        pacoteDeDados.append('dataNascimento', dataNascimento);
        pacoteDeDados.append('email', email);

        console.log("Dados enviados:", {
            nome,
            dataNascimento,
            altura,
            peso,
            clube,
            email
        });

        setLoadingProgress(35, "A IA começou a criar sua figurinha...");

        const resposta = await fetch('https://servidor-figurinhas-copa-2026-production.up.railway.app/api/gerar', {
            method: 'POST',
            body: pacoteDeDados
        });

        const resultado = await resposta.json();

        if (resposta.ok) {
            clearInterval(intervaloProgresso);

            console.log("Servidor respondeu:", resultado.mensagem);
            console.log("Sticker ID:", resultado.stickerId || "não informado");
            console.log("Preview URL:", resultado.previewUrl || "não informado");
            console.log("Tempo total:", resultado.tempoTotalSegundos ? resultado.tempoTotalSegundos + "s" : "não informado");

            if (resultado.stickerId) {
                localStorage.setItem('stickerId', resultado.stickerId);
            }

            if (resultado.previewUrl) {
                localStorage.setItem('previewUrl', resultado.previewUrl);
            }

            if (email) {
                localStorage.setItem('emailCliente', email);
            }

            finalizarProgressoComSucesso();

            setTimeout(() => {
                const imgPreview = document.getElementById('preview-figurinha');

                imgPreview.src = resultado.imagemPronta;
                imgPreview.style.display = 'block';

                imgPreview.style.filter = 'none';
                imgPreview.style.webkitFilter = 'none';
                imgPreview.style.backdropFilter = 'none';

                imgPreview.style.width = '100%';
                imgPreview.style.height = '100%';
                imgPreview.style.objectFit = 'cover';

                showStep('step-final');
            }, 700);

        } else {
            clearInterval(intervaloProgresso);
            setLoadingProgress(0, "Não foi possível gerar a figurinha.");

            alert("Erro do servidor: " + (resultado.detalhe || resultado.erro));
            prevStep(4);
        }

    } catch (erro) {
        clearInterval(intervaloProgresso);

        console.error("Erro na comunicação:", erro);

        setLoadingProgress(0, "Falha na comunicação com o servidor.");
        alert("O servidor não respondeu ou a imagem não pôde ser processada. Verifique se o 'node server.js' está ligado!");

        prevStep(4);
    }
}

function goToCheckout() {
    const stickerId = localStorage.getItem('stickerId') || "";
    const emailCliente = localStorage.getItem('emailCliente') || "";
    const previewUrl = localStorage.getItem('previewUrl') || "";

    const checkoutBase = "https://pay.cakto.com.br/3bbymak_932922";

    const parametros = new URLSearchParams();

    // E-mail do cliente
    parametros.set("email", emailCliente);

    // Campos antigos que ainda podem ajudar no rastreamento
    parametros.set("sck", stickerId);
    parametros.set("s1", stickerId);
    parametros.set("s2", previewUrl);
    parametros.set("src", "site_figurinhas_copa26");

    // Campos que a Cakto devolve no webhook
    parametros.set("utm_source", "site");
    parametros.set("utm_medium", "checkout");
    parametros.set("utm_campaign", "figurinhas_copa26");
    parametros.set("utm_term", stickerId);
    parametros.set("utm_content", stickerId);

    const checkoutUrl = `${checkoutBase}?${parametros.toString()}`;

    console.log("Indo para checkout Cakto com:", {
        stickerId,
        emailCliente,
        previewUrl,
        checkoutUrl
    });

    window.location.href = checkoutUrl;
}