import type { Locale } from "./translations";

type GuideTranslation = {
  categoryLabel: string;
  title: string;
  summary: string;
  steps: string[];
  actionLabel: string;
};

type FaqTranslation = { q: string; a: string };

export const helpGuideTranslations: Partial<Record<Locale, Record<string, GuideTranslation>>> = {
  "es-419": {
    "what-is-what": {
      categoryLabel: "Locales y miembros",
      title: "Qué son PromoCard, Puntos, Gemas y tickets",
      summary: "Ocho nombres. El sorteo nombra el premio. PromoCard es lo que usas. Los Puntos prueban que llegaste. Las Gemas son el dinero. Los sorteos de beneficio pagan Llaves. Ahorra y gana es la familia PromoShare que paga Gemas extra.",
      steps: [
        "La PromoCard se descuenta en un negocio socio. No es una cuenta bancaria.",
        "Los Puntos son un puntaje. 500 pueden convertirse en 1 PromoKey. No son dinero.",
        "Las Gemas usan una denominación de plataforma de 1 USD. Saldo, valor retenido y valor retirable son estados distintos.",
        "El ticket nombra el sorteo. Los sorteos de beneficio pagan Llave o acceso. Ahorra y gana paga Gemas extra. El ticket no es el premio.",
      ],
      actionLabel: "Abrir el mapa",
    },
    "vote-discoveries": {
      categoryLabel: "Locales y miembros",
      title: "Cómo votar en los Descubrimientos del lunes",
      summary: "Vota en los debates semanales de comida y cultura para influir en los lugares ganadores y acceder primero a los PromoKeys del miércoles.",
      steps: [
        "Abre Descubrir o Radar cada lunes para ver los debates activos de la ciudad.",
        "Revisa los platos, lugares o puntos culturales que compiten.",
        "Emite tu voto antes del cierre del lunes por la noche.",
        "Los votantes activos reciben prioridad cuando se publican los PromoKeys del miércoles.",
      ],
      actionLabel: "Votar en Radar",
    },
    "claim-promokey": {
      categoryLabel: "Locales y miembros",
      title: "Cómo reclamar y canjear un PromoKey",
      summary: "Reclama pases VIP limitados financiados por patrocinadores y canjéalos en el lugar por comida, bebidas o beneficios secretos.",
      steps: [
        "Prepárate el miércoles a las 6:00 p. m., cuando se publica el lote semanal.",
        "Pulsa «Reclamar Key» en el lugar o Momento que prefieras.",
        "Visita el lugar durante el período de canje indicado.",
        "Escanea el código QR del mostrador o muestra tu pase al personal.",
      ],
      actionLabel: "Explorar lanzamientos",
    },
    "check-in-proof": {
      categoryLabel: "Locales y miembros",
      title: "Cómo verificar tu visita y ganar Gems",
      summary: "Envía la prueba de visita requerida. Cualquier recompensa, cambio de rango o consecuencia en Gems aparece solo después de la verificación y emisión aplicables.",
      steps: [
        "Llega al lugar participante durante su horario de atención.",
        "Abre Promorang y pulsa «Check In» o abre tu pase activo.",
        "Escanea el código QR físico ubicado en la entrada, barra o mostrador.",
        "Si se solicita, toma una foto rápida para completar la prueba.",
      ],
      actionLabel: "Abrir espacio de check-in",
    },
    "wallet-withdraw": {
      categoryLabel: "Locales y miembros",
      title: "Cómo retirar ganancias y administrar Gems",
      summary: "Revisa los estados registrados de Gems, el saldo retirable, el valor pendiente y las opciones de pago disponibles en tu cuenta.",
      steps: [
        "Abre tu Billetera desde la navegación o el panel.",
        "Revisa el saldo disponible y las recompensas pendientes.",
        "Revisa el método de pago y las opciones de retiro que estén realmente disponibles para tu cuenta.",
        "Solicita un retiro solo desde el saldo marcado como retirable, o usa Gems elegibles en beneficios disponibles.",
      ],
      actionLabel: "Abrir Billetera",
    },
    "venue-countertop-qr": {
      categoryLabel: "Lugares y comerciantes",
      title: "Cómo configurar y verificar códigos QR de mostrador",
      summary: "Configura puntos QR que registran un escaneo elegible como una parte del flujo de prueba del lugar.",
      steps: [
        "Entra al Panel de Comerciante y abre «Lugares y Check-in».",
        "Descarga o imprime el código QR dinámico de tu lugar.",
        "Colócalo en la entrada, barra o caja.",
        "Cada escaneo queda registrado; visita, canje, compra o cumplimiento dependen del flujo de verificación y comercio aplicable.",
      ],
      actionLabel: "Panel de Comerciante",
    },
    "creator-bounties": {
      categoryLabel: "Creadores y referentes",
      title: "Cómo reclamar y completar recompensas de creador",
      summary: "Completa oportunidades de creador configuradas y distingue atribución, aprobación, ganancia y liquidación.",
      steps: [
        "Explora el tablero de recompensas para ver oportunidades abiertas.",
        "Revisa los requisitos de contenido y check-ins verificados.",
        "Reclama la recompensa y publica tu enlace de seguimiento.",
        "Envía el enlace de tu publicación para verificar los resultados.",
      ],
      actionLabel: "Explorar recompensas",
    },
    "brand-campaigns": {
      categoryLabel: "Marcas y patrocinadores",
      title: "Cómo lanzar activaciones de marca en el mundo real",
      summary: "Financia debates, PromoKeys VIP y recompensas para creadores con pruebas verificadas de visitas.",
      steps: [
        "Define el resultado de la campaña: prueba, visitas o contenido.",
        "Elige ciudades, barrios o categorías de lugares.",
        "Financia el fondo de PromoKeys, cupones o recompensas.",
        "Revisa los análisis registrados y la ubicación, recibos, check-ins u otras pruebas que la activación haya configurado y registrado.",
      ],
      actionLabel: "Soluciones para marcas",
    },
  },
  "pt-BR": {
    "what-is-what": {
      categoryLabel: "Locais e membros",
      title: "O que são PromoCard, Pontos, Gemas e tickets",
      summary: "Oito nomes. O sorteio nomeia o prêmio. PromoCard é o que você usa. Pontos provam que você apareceu. Gemas são o dinheiro. Sorteios de benefício pagam Chaves. Guarde e ganhe é a família PromoShare que paga Gemas extras.",
      steps: [
        "O PromoCard sai da conta em um parceiro. Não é conta bancária.",
        "Pontos são um placar. 500 podem virar 1 PromoKey. Não são dinheiro.",
        "Gemas usam uma denominação de plataforma de 1 USD. Saldo, valor retido e valor sacável são estados distintos.",
        "O ticket nomeia o sorteio. Sorteios de benefício pagam Chave ou acesso. Guarde e ganhe paga Gemas extras. O ticket não é o prêmio.",
      ],
      actionLabel: "Abrir o mapa",
    },
    "vote-discoveries": {
      categoryLabel: "Moradores e membros",
      title: "Como votar nas Descobertas de segunda-feira",
      summary: "Vote nos debates semanais de gastronomia e cultura para influenciar os locais vencedores e ter acesso antecipado aos PromoKeys de quarta-feira.",
      steps: [
        "Abra Descobrir ou Radar toda segunda-feira para ver os debates ativos.",
        "Confira os pratos, locais ou pontos culturais concorrentes.",
        "Registre seu voto antes do encerramento na segunda à noite.",
        "Eleitores ativos recebem prioridade quando os PromoKeys são liberados.",
      ],
      actionLabel: "Votar no Radar",
    },
    "claim-promokey": {
      categoryLabel: "Moradores e membros",
      title: "Como resgatar e usar um PromoKey",
      summary: "Resgate passes VIP limitados financiados por patrocinadores e use-os no local para comida, bebida ou benefícios secretos.",
      steps: [
        "Esteja pronto na quarta-feira às 18h, quando o lote semanal é liberado.",
        "Toque em «Resgatar Key» no local ou Momento desejado.",
        "Visite o local durante o período de uso indicado.",
        "Escaneie o QR do balcão ou mostre seu passe à equipe.",
      ],
      actionLabel: "Explorar lançamentos",
    },
    "check-in-proof": {
      categoryLabel: "Moradores e membros",
      title: "Como comprovar sua visita e ganhar Gems",
      summary: "Envie a prova de visita exigida. Recompensa, mudança de nível ou consequência em Gems só aparece após as regras aplicáveis de verificação e emissão.",
      steps: [
        "Chegue ao local participante durante o horário de funcionamento.",
        "Abra a Promorang e toque em «Check In» ou abra seu passe ativo.",
        "Escaneie o QR físico na entrada, no bar ou no caixa.",
        "Se solicitado, tire uma foto rápida para concluir a comprovação.",
      ],
      actionLabel: "Abrir área de check-in",
    },
    "wallet-withdraw": {
      categoryLabel: "Moradores e membros",
      title: "Como sacar ganhos e administrar Gems",
      summary: "Revise os estados registrados das Gems, saldo sacável, valor pendente e opções de pagamento disponíveis para sua conta.",
      steps: [
        "Abra sua Carteira pelo menu ou painel.",
        "Confira o saldo disponível e as recompensas pendentes.",
        "Revise o método de pagamento e as opções de saque realmente disponíveis para sua conta.",
        "Solicite saque apenas do saldo marcado como sacável, ou use Gems elegíveis em benefícios disponíveis.",
      ],
      actionLabel: "Abrir Carteira",
    },
    "venue-countertop-qr": {
      categoryLabel: "Locais e comerciantes",
      title: "Como configurar e verificar códigos QR de balcão",
      summary: "Configure pontos QR que registram uma leitura elegível como parte do fluxo de prova do local.",
      steps: [
        "Entre no Painel do Comerciante e abra «Locais e Check-in».",
        "Baixe ou imprima o QR dinâmico do seu local.",
        "Coloque-o na entrada, no bar ou no caixa.",
        "Cada leitura é registrada; visita, resgate, compra ou cumprimento dependem do fluxo aplicável de verificação e comércio.",
      ],
      actionLabel: "Painel do Comerciante",
    },
    "creator-bounties": {
      categoryLabel: "Criadores e formadores de opinião",
      title: "Como resgatar e concluir recompensas de criador",
      summary: "Conclua oportunidades de criador configuradas e separe atribuição, aprovação, ganho e liquidação.",
      steps: [
        "Explore o quadro de recompensas para ver oportunidades abertas.",
        "Confira os requisitos de conteúdo e check-ins comprovados.",
        "Aceite a recompensa e publique seu link de acompanhamento.",
        "Envie o link da publicação para que os resultados sejam verificados.",
      ],
      actionLabel: "Explorar recompensas",
    },
    "brand-campaigns": {
      categoryLabel: "Marcas e patrocinadores",
      title: "Como lançar ativações de marca no mundo real",
      summary: "Financie debates, PromoKeys VIP e recompensas para criadores com comprovação de visitas.",
      steps: [
        "Defina o resultado da campanha: experimentação, visitas ou conteúdo.",
        "Escolha cidades, bairros ou categorias de locais.",
        "Financie PromoKeys, vouchers ou recompensas para criadores.",
        "Revise análises registradas e a localização, recibos, check-ins ou outras provas que a ativação realmente configurou e registrou.",
      ],
      actionLabel: "Soluções para marcas",
    },
  },
};

export const helpFaqTranslations: Partial<Record<Locale, FaqTranslation[]>> = {
  "es-419": [
    { q: "¿Qué es un PromoKey?", a: "Es un pase VIP digital financiado por una marca que desbloquea una degustación, artículo secreto o experiencia premium en un lugar participante." },
    { q: "¿Qué es un Momento?", a: "Es una activación o reunión real organizada por un referente o lugar para generar visitas verificadas y conexión comunitaria auténtica." },
    { q: "¿Qué son las Gemas y cómo las consigo?", a: "Las Gemas usan una denominación de plataforma de 1 USD, pero saldo, valor retenido y valor retirable son estados distintos. Puedes comprarlas o recibirlas de actividad financiada elegible y premios de Ahorra y gana. Tenerlas por sí solo no genera retorno." },
    { q: "¿Qué es Access Rank?", a: "Es tu puntuación de reputación. La participación constante y los check-ins verificados desbloquean mejores PromoKeys e invitaciones." },
    { q: "¿Cómo genera Promorang visitas para mi lugar?", a: "Promorang puede mostrar demanda registrada, ofertas, reclamos y prueba elegible de visita. Votos y reclamos son señales de intención; una visita solo queda registrada cuando el flujo aplicable de check-in, QR o prueba se completa." },
    { q: "¿Necesito equipo especial para aceptar PromoKeys?", a: "No. Imprime el QR del lugar o escanea el pase del visitante con cualquier teléfono inteligente." },
    { q: "¿Cómo se pagan las recompensas de creadores?", a: "Enviar contenido o generar acciones atribuidas no significa pago por sí solo. Los términos de la oportunidad determinan revisión, aprobación, ganancia y liquidación; el valor retirable aparece solo cuando existen los registros de ganancia y pago correspondientes." },
    { q: "¿Cómo verifica Promorang las activaciones?", a: "Una activación puede usar ubicación, QR, recibos, atribución de contenido u otros métodos configurados. La evidencia mostrada depende de lo que la activación exigió y de lo que realmente se registró." },
    { q: "¿Cómo protege Promorang mi ubicación?", a: "Solo comprobamos la ubicación durante un check-in intencional. No vendemos datos de ubicación ni rastreamos continuamente." },
    { q: "¿Qué hago si falla un pago, check-in o PromoKey?", a: "Envía una solicitud de soporte con el lugar, la hora aproximada y una captura. Nuestro equipo revisará el caso." },
    { q: "¿Qué es una PromoCard?", a: "Es la tarjeta de todos los días. El valor elegible se descuenta en un negocio socio y tú pagas el resto. No es una cuenta bancaria, ni Puntos, ni Gemas." },
    { q: "¿Qué son los Puntos?", a: "Son un puntaje de temporada por aparecer. No se compran, no se venden y no se cobran. 500 Puntos pueden convertirse en 1 PromoKey." },
    { q: "¿Por qué gastar Gemas en vez de pagar en efectivo?", a: "Gastar Gemas puede abrir Piezas, tickets de Ahorra y gana, entradas PromoShare y beneficios de socios. Un pago fuera de Promorang no te mete en ese ciclo." },
    { q: "¿Qué es la Llave maestra?", a: "Es la puerta de contribución de hoy, no una racha que se compra. Completa las Pruebas gratis de tu nivel y se activa hasta el reinicio. Las PromoKeys siguen decidiendo cuántas puertas puedes abrir." },
    { q: "¿Qué es un ticket de PromoShare?", a: "Es tu entrada en un sorteo con nombre. El sorteo publica el premio antes de entrar: beneficio (Llave, acceso, perk) o Gemas extra en Ahorra y gana. El ticket no es el premio." },
    { q: "¿Qué es Ahorra y gana?", a: "Es la familia PromoShare que paga Gemas extra desde un fondo comprometido. El principal reservado sigue siendo tuyo; devolverlo sigue los términos de salida del fondo y las reglas de retención o retiro de la billetera. Perder un sorteo no convierte ese principal en una apuesta." },
  ],
  "pt-BR": [
    { q: "O que é um PromoKey?", a: "É um passe VIP digital financiado por uma marca que libera degustação, item secreto ou experiência premium em um local participante." },
    { q: "O que é um Momento?", a: "É uma ativação ou encontro real organizado por um criador ou local para gerar visitas comprovadas e conexão comunitária autêntica." },
    { q: "O que são Gemas e como posso tê-las?", a: "Gemas usam uma denominação de plataforma de 1 USD, mas saldo, valor retido e valor sacável são estados distintos. Você pode comprar Gems ou recebê-las de atividade financiada elegível e prêmios de Guarde e ganhe. Apenas manter Gems não gera retorno." },
    { q: "O que é Access Rank?", a: "É sua pontuação de reputação. Participação consistente e check-ins comprovados liberam melhores PromoKeys e convites." },
    { q: "Como a Promorang gera visitas para meu local?", a: "A Promorang pode mostrar demanda registrada, ofertas, resgates e prova elegível de visita. Votos e resgates são sinais de intenção; a visita só é registrada quando o fluxo aplicável de check-in, QR ou prova é concluído." },
    { q: "Preciso de equipamento especial para aceitar PromoKeys?", a: "Não. Imprima o QR do local ou escaneie o passe do visitante com qualquer smartphone." },
    { q: "Como as recompensas de criadores são pagas?", a: "Enviar conteúdo ou gerar ações atribuídas não significa pagamento por si só. Os termos da oportunidade determinam revisão, aprovação, ganho e liquidação; valor sacável aparece apenas quando os registros de ganho e pagamento existem." },
    { q: "Como a Promorang comprova as ativações?", a: "Uma ativação pode usar localização, QR, recibos, atribuição de conteúdo ou outros métodos configurados. A evidência exibida depende do que a ativação exigiu e do que foi realmente registrado." },
    { q: "Como a Promorang protege minha localização?", a: "Só verificamos a localização durante um check-in intencional. Não vendemos dados nem rastreamos continuamente." },
    { q: "O que faço se um pagamento, check-in ou PromoKey falhar?", a: "Abra um chamado com o local, horário aproximado e uma captura de tela. Nossa equipe analisará o caso." },
    { q: "O que é um PromoCard?", a: "É o cartão do dia a dia. O valor elegível sai da conta em um parceiro e você paga o resto. Não é conta bancária, nem Pontos, nem Gemas." },
    { q: "O que são Pontos?", a: "São um placar da temporada por aparecer. Não se compra, não se vende e não se saca. 500 Pontos podem virar 1 PromoKey." },
    { q: "Por que gastar Gemas em vez de pagar em dinheiro?", a: "Gastar Gemas pode abrir Peças, tickets de Guarde e ganhe, entradas PromoShare e benefícios de parceiros. Um pagamento fora da Promorang não te coloca nesse ciclo." },
    { q: "O que é a Chave mestra?", a: "É o portão de contribuição de hoje, não uma sequência que se compra. Complete as Provas grátis do seu nível e ela liga até o reset. PromoKeys ainda decidem quantas portas você pode abrir." },
    { q: "O que é um ticket PromoShare?", a: "É a sua entrada num sorteio com nome. O sorteio publica o prêmio antes de entrar: benefício (Chave, acesso, perk) ou Gemas extras em Guarde e ganhe. O ticket não é o prêmio." },
    { q: "O que é Guarde e ganhe?", a: "É a família PromoShare que paga Gems extras a partir de um pote comprometido. O principal estacionado continua sendo seu; devolvê-lo segue os termos de saída do pote e as regras de retenção ou saque da carteira. Perder um sorteio não transforma esse principal em aposta." },
  ],
};
