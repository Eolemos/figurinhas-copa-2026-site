const totalSteps = 4;

// FUNÇÃO DE ROLAGEM AUTOMÁTICA DOS CARROSSEIS
function startAutoScroll() {
    const carousels = document.querySelectorAll('.auto-scroll');
    
    carousels.forEach(carousel => {
        setInterval(() => {
            // Verifica se chegou no final do carrossel
            if (carousel.scrollLeft + carousel.clientWidth >= carousel.scrollWidth - 2) {
                // Volta pro começo
                carousel.scrollTo({ left: 0, behavior: 'smooth' });
            } else {
                // Rola pra direita
                carousel.scrollBy({ left: 150, behavior: 'smooth' });
            }
        }, 3000); // Roda a cada 3 segundos
    });
}

// Ativa a rolagem automática assim que a página carregar
window.addEventListener('load', startAutoScroll);

// TRANSIÇÃO DA TELA INICIAL PARA O QUIZ
function iniciarQuiz() {
    document.getElementById('landing-page').style.display = 'none';
    document.body.style.backgroundColor = "var(--amarelo-fundo)";
    document.body.style.alignItems = "center"; 
    document.getElementById('quiz-wrapper').style.display = 'flex';
    document.getElementById('quiz-area').style.display = 'block';
}

// ATUALIZAÇÃO DA BARRA DE PROGRESSO
function updateProgress(step) {
    const percentage = (step / totalSteps) * 100;
    document.getElementById('progress-bar-fill').style.width = percentage + '%';
    document.getElementById('step-counter').innerText = 'Passo ' + step + ' de ' + totalSteps;
    document.getElementById('progress-percentage').innerText = percentage + '%';
}

// NAVEGAÇÃO ENTRE AS ABAS
function showStep(stepId) {
    document.querySelectorAll('.step').forEach(el => el.classList.remove('active'));
    document.getElementById(stepId).classList.add('active');
}

function nextStep(step) { 
    showStep('step-' + step); 
    updateProgress(step); 
}

function prevStep(step) { 
    showStep('step-' + step); 
    updateProgress(step); 
}

// PREPARAÇÃO DOS DADOS PARA A TELA DE REVISÃO (PASSO 4)
function preparaRevisao() {
    document.getElementById('rev-nome').innerText = document.getElementById('input-nome').value || "Não informado";
    document.getElementById('rev-peso').innerText = (document.getElementById('input-peso').value || "--") + " kg";
    document.getElementById('rev-altura').innerText = (document.getElementById('input-altura').value || "--") + " cm";
    
    let selectClube = document.getElementById('input-clube');
    document.getElementById('rev-clube').innerText = selectClube.options[selectClube.selectedIndex].value || "Não informado";
    
    nextStep(4);
}

// SIMULAÇÃO DO CARREGAMENTO / GERAÇÃO DA FIGURINHA
function startGeneration() {
    document.getElementById('header-quiz').style.display = 'none';
    document.getElementById('progress-bar-bg').style.display = 'none';
    
    showStep('step-loading');
    
    // Anima a barrinha de loading do CSS
    setTimeout(() => { document.getElementById('loading-bar-fill').style.width = '100%'; }, 100);
    
    // Após 3 segundos, vai para a tela final
    setTimeout(() => { showStep('step-final'); }, 3000);
}

// BOTÃO DE PAGAMENTO
function goToCheckout() { 
    alert("Redirecionando para o Checkout da Kiwify..."); 
    // window.location.href = "SEU_LINK_KIWIFY_AQUI";
}