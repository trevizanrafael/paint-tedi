// Espera toda a página HTML carregar pra gente começar a mexer nos elementos
document.addEventListener('DOMContentLoaded', () => {
    // Pegando os elementos importantes da página que a gente vai usar
    const canvas = document.getElementById('paintCanvas'); // A tela de pintura
    const ctx = canvas.getContext('2d'); // O "pincel mágico" do canvas 2D

    const colorButtons = document.querySelectorAll('.color-btn');       // Todos os botões de cor
    const brushSizeButtons = document.querySelectorAll('.brush-size-btn'); // Botões de tamanho do pincel
    const pencilBtn = document.getElementById('pencil-btn');          // Ferramenta Pincel
    const eraserBtn = document.getElementById('eraser-btn');          // Ferramenta Borracha
    const bucketBtn = document.getElementById('bucket-btn');          // Ferramenta Balde de Tinta
    const clearCanvasBtn = document.getElementById('clear-canvas-btn'); // Botão de Limpar Tela
    const saveCanvasBtn = document.getElementById('save-canvas-btn');   // Botão de Salvar Desenho

    // Variáveis pra guardar o estado atual da nossa pintura
    let painting = false;             // Está desenhando (mouse pressionado)?
    let currentColor = '#000000';      // Cor atual do pincel (começa preto)
    let currentBrushSize = 8;       // Tamanho atual do pincel (começa médio)
    let currentTool = 'pencil';       // Ferramenta atual (começa com o pincel)
    let isErasing = false;            // Modo borracha está ativo?

    // Configurando o tamanho inicial da tela de pintura
    // Você pode mudar esses valores se quiser uma tela maior ou menor!
    canvas.width = 800;
    canvas.height = 500;

    // Deixando o fundo do canvas branco quando a página carrega
    ctx.fillStyle = 'white';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Configurações pra deixar as linhas mais bonitas e arredondadas
    ctx.lineCap = 'round';   // Pontas das linhas redondinhas
    ctx.lineJoin = 'round';  // Junções das linhas também redondinhas

    // --- Funções Principais de Desenho ---

    // Chamada quando a gente clica com o mouse na tela pra começar a desenhar
    function startPosition(e) {
        painting = true; // Avisa que estamos desenhando
        draw(e);         // Já desenha um pontinho inicial, caso seja só um clique
    }

    // Chamada quando a gente solta o botão do mouse (ou ele sai da tela)
    function endPosition() {
        painting = false;    // Avisa que paramos de desenhar
        ctx.beginPath();   // Importante: reinicia o "caminho" do desenho, pra não conectar com o próximo traço
    }

    // A mágica acontece aqui: desenha conforme a gente mexe o mouse!
    function draw(e) {
        if (!painting) return; // Se não estivermos no modo "painting", não faz nada

        // Pega a posição do mouse direitinho dentro do canvas
        const rect = canvas.getBoundingClientRect(); // Pega as dimensões e posição do canvas na tela
        const x = e.clientX - rect.left; // Posição X do mouse dentro do canvas
        const y = e.clientY - rect.top;  // Posição Y do mouse dentro do canvas

        ctx.lineWidth = currentBrushSize; // Define a grossura do traço
        // Se estiver apagando, usa branco (cor do fundo), senão, usa a cor escolhida
        ctx.strokeStyle = isErasing ? 'white' : currentColor;

        ctx.lineTo(x, y); // Diz pro "pincel" ir até a nova posição
        ctx.stroke();     // Efetivamente desenha a linha
        ctx.beginPath();  // Começa um novo sub-caminho (pra performance e precisão)
        ctx.moveTo(x, y); // Move o "cursor" do desenho para a posição atual, preparando pro próximo movimento
    }

    // --- Lógica dos Controles da Barra Lateral ---

    // Quando clica na tela de pintura...
    canvas.addEventListener('mousedown', (e) => {
        if (currentTool === 'pencil') { // Se a ferramenta for pincel (ou borracha)
            startPosition(e);
        } else if (currentTool === 'bucket') { // Se for o balde de tinta
            // Pega a posição do clique
            const rect = canvas.getBoundingClientRect();
            const x = Math.floor(e.clientX - rect.left); // Arredonda pra ter um pixel exato
            const y = Math.floor(e.clientY - rect.top);
            fillArea(x, y, currentColor); // Chama a função de preenchimento
        }
    });
    // Quando solta o mouse
    canvas.addEventListener('mouseup', endPosition);
    // Quando mexe o mouse (só desenha se 'painting' for true)
    canvas.addEventListener('mousemove', draw);
    // Se o mouse sair da área do canvas, para de desenhar também
    canvas.addEventListener('mouseleave', endPosition);


    // Para cada BOTÃO DE COR...
    colorButtons.forEach(button => {
        button.addEventListener('click', () => {
            // Remove a marcação de 'ativo' do botão de cor que estava selecionado antes
            const currentActiveColor = document.querySelector('.color-btn.active');
            if (currentActiveColor) {
                currentActiveColor.classList.remove('active');
            }
            // Adiciona a marcação de 'ativo' no botão clicado
            button.classList.add('active');
            // Guarda a nova cor selecionada
            currentColor = button.dataset.color;

            // Se a gente estava usando a borracha e escolheu uma cor,
            // automaticamente volta pro pincel, porque borracha não tem cor (além de branco).
            if (isErasing) {
                isErasing = false; // Desativa o modo borracha
                // Simula um clique no botão do pincel pra ele ficar ativo visualmente e na lógica
                pencilBtn.click();
            }
        });
    });

    // Para cada BOTÃO DE TAMANHO DO PINCEL...
    brushSizeButtons.forEach(button => {
        button.addEventListener('click', () => {
            // Mesma lógica: tira o 'ativo' do anterior, põe no clicado
            document.querySelector('.brush-size-btn.active').classList.remove('active');
            button.classList.add('active');
            // Guarda o novo tamanho (converte pra número, porque vem como texto do HTML)
            currentBrushSize = parseInt(button.dataset.size);
        });
    });


    // Função auxiliar pra deixar um botão de FERRAMENTA ativo e os outros não
    function setActiveTool(clickedButton, toolName) {
        // Tira o 'ativo' de qualquer ferramenta que estivesse selecionada
        document.querySelector('.tool-btn.active')?.classList.remove('active'); // O '?' evita erro se nenhum estiver ativo
        // Deixa o botão clicado como 'ativo'
        clickedButton.classList.add('active');
        // Guarda qual ferramenta é a atual
        currentTool = toolName;
    }

    // Quando clica no PINCEL
    pencilBtn.addEventListener('click', () => {
        setActiveTool(pencilBtn, 'pencil');
        isErasing = false; // Garante que não está no modo borracha
    });

    // Quando clica na BORRACHA
    eraserBtn.addEventListener('click', () => {
        setActiveTool(eraserBtn, 'pencil'); // A borracha, no fundo, é um pincel que pinta de branco
        isErasing = true; // Ativa o modo borracha
    });

    // Quando clica no BALDE DE TINTA
    bucketBtn.addEventListener('click', () => {
        setActiveTool(bucketBtn, 'bucket');
        isErasing = false; // Balde não é borracha
    });


    // Quando clica em LIMPAR TELA
    clearCanvasBtn.addEventListener('click', () => {
        // Pergunta se o usuário tem certeza, pra não perder o desenho sem querer
        if (confirm("Tem certeza que quer apagar todo o desenho? Não dá pra voltar atrás!")) {
            ctx.fillStyle = 'white'; // Define a cor de preenchimento pra branco
            ctx.fillRect(0, 0, canvas.width, canvas.height); // Pinta tudo de branco
            ctx.beginPath(); // Reseta o caminho do desenho, pra não ter lixo
        }
    });

    // Quando clica em SALVAR DESENHO
    saveCanvasBtn.addEventListener('click', () => {
        const imageName = prompt("Qual nome você quer dar para a sua arte? (ex: minha_obra.png)", "desenho_TEDI.png");
        if (imageName) { // Se o usuário digitou um nome (e não cancelou)
            const link = document.createElement('a'); // Cria um link "invisível"
            // Garante que o nome do arquivo termina com .png
            link.download = imageName.endsWith('.png') ? imageName : imageName + '.png';
            // Pega os dados da imagem do canvas e prepara pro download
            link.href = canvas.toDataURL('image/png').replace('image/png', 'image/octet-stream');
            link.click(); // Simula um clique no link pra baixar a imagem
        }
    });

    // --- Função de Preenchimento (Balde de Tinta) ---
    // Esta é uma implementação simples de "flood fill". Pode ser um pouco lenta em áreas gigantescas.
    function fillArea(startX, startY, fillColor) {
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height); // Pega todos os pixels da tela
        const data = imageData.data; // Array com os dados de cor de cada pixel (R, G, B, A)
        const startRgba = getPixelRgba(startX, startY, data); // Cor do pixel onde a gente clicou
        const fillRgb = hexToRgb(fillColor); // Converte a cor de preenchimento (que está em #RRGGBB) para R, G, B

        if (!fillRgb) return; // Se a cor de preenchimento for inválida, não faz nada
        // Se a cor onde clicamos já é a cor que queremos pintar, também não faz nada
        if (colorsMatch(startRgba, fillRgb)) return;

        const queue = [[startX, startY]]; // Uma fila de pixels que a gente precisa verificar

        // Enquanto tiver pixels na fila pra checar...
        while (queue.length > 0) {
            const [x, y] = queue.shift(); // Pega o próximo pixel da fila

            // Se o pixel estiver fora da tela, pula pro próximo
            if (x < 0 || x >= canvas.width || y < 0 || y >= canvas.height) {
                continue;
            }

            const currentPixelRgba = getPixelRgba(x, y, data); // Pega a cor do pixel atual da fila

            // Se a cor do pixel atual for a mesma que a cor original (onde clicamos)...
            if (colorsMatch(currentPixelRgba, startRgba)) {
                setPixelColor(x, y, fillRgb, data); // Pinta esse pixel com a nova cor!

                // Adiciona os vizinhos desse pixel na fila, pra gente checar eles também
                queue.push([x + 1, y]); // Direita
                queue.push([x - 1, y]); // Esquerda
                queue.push([x, y + 1]); // Baixo
                queue.push([x, y - 1]); // Cima
            }
        }
        ctx.putImageData(imageData, 0, 0); // Coloca os pixels modificados de volta na tela
    }

    // Pega os valores R, G, B, A de um pixel específico
    function getPixelRgba(x, y, data) {
        const offset = (y * canvas.width + x) * 4; // Calcula a posição do pixel no array de dados
        return {
            r: data[offset],
            g: data[offset + 1],
            b: data[offset + 2],
            a: data[offset + 3]
        };
    }

    // Define a cor R, G, B de um pixel específico
    function setPixelColor(x, y, colorRgb, data) {
        const offset = (y * canvas.width + x) * 4;
        data[offset] = colorRgb.r;
        data[offset + 1] = colorRgb.g;
        data[offset + 2] = colorRgb.b;
        data[offset + 3] = 255; // Alpha (opacidade total)
    }

    // Compara duas cores pra ver se são "parecidas" (com uma tolerância)
    // Isso é útil porque às vezes as cores não são *exatamente* iguais por causa de anti-aliasing e tal.
    function colorsMatch(color1, color2) {
        const tolerance = 30; // Quanto maior, mais "diferentes" as cores podem ser e ainda serem consideradas iguais
        return Math.abs(color1.r - color2.r) < tolerance &&
               Math.abs(color1.g - color2.g) < tolerance &&
               Math.abs(color1.b - color2.b) < tolerance &&
               Math.abs(color1.a - (color2.a !== undefined ? color2.a : 255)) < tolerance;
    }

    // Converte uma cor em formato Hexadecimal (tipo #FF0000) para um objeto {r, g, b}
    function hexToRgb(hex) {
        // Tenta converter cores com nome tipo "black", "red", etc. (bem simplificado)
        const namedColors = {
            "black": { r: 0, g: 0, b: 0 }, "white": { r: 255, g: 255, b: 255 },
            "red": { r: 255, g: 0, b: 0 }, "green": { r: 0, g: 128, b: 0 }, /* Verde padrão HTML */
            "blue": { r: 0, g: 0, b: 255 }, "yellow": { r: 255, g: 255, b: 0 },
            "#000000": { r: 0, g: 0, b: 0 }, "#2E3E50": { r: 46, g: 62, b: 80 },
            "#8EC6E6": { r: 142, g: 198, b: 230 }, "#A1D99B": { r: 161, g: 217, b: 155 },
            "#E0E0E0": { r: 224, g: 224, b: 224 }, "#E74C3C": {r: 231, g: 76, b: 60},
            "#F1C40F": {r: 241, g: 196, b: 15}, "#9B59B6": {r: 155, g: 89, b: 182},
            "#F39C12": {r: 243, g: 156, b: 18}, "#EC70A1": {r: 236, g: 112, b: 161},
            "#5DADE2": {r: 93, g: 173, b: 226}, "#48C9B0": {r: 72, g: 201, b: 176}
        };
        if (namedColors[hex.toLowerCase()]) return namedColors[hex.toLowerCase()];

        // Se não for nomeada, tenta o formato #RRGGBB
        const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
        return result ? {
            r: parseInt(result[1], 16),
            g: parseInt(result[2], 16),
            b: parseInt(result[3], 16)
        } : null; // Retorna null se não conseguir converter
    }

    // --- Configurações Iniciais quando a página carrega ---
    // Deixa o primeiro botão de cor (preto) e o botão de tamanho médio já selecionados
    const initialColorButton = document.querySelector('.color-btn[data-color="#000000"]');
    if (initialColorButton) {
        initialColorButton.classList.add('active');
    } else {
        // Se por algum motivo não achar o preto, seleciona o primeiro da lista
        document.querySelector('.color-btn')?.classList.add('active');
    }
    currentColor = '#000000'; // Garante que a cor inicial é preto

    // Seleciona o pincel como ferramenta padrão e o tamanho médio
    document.querySelector('.brush-size-btn[data-size="' + currentBrushSize + '"]').classList.add('active');
    pencilBtn.click(); // Simula um clique no pincel pra ele já vir ativo

    console.log("TEDI Paint carregado e pronto para desenhar! Divirta-se!");
});
