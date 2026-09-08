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
        "1 Gema = $1. Cómpralas o gánalas. Úsalas para extras que el efectivo no da.",
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
      summary: "Demuestra que asististe para recibir recompensas, mejorar tu Access Rank y ganar Gems canjeables.",
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
      summary: "Convierte recompensas y pagos ganados en efectivo o usa Gems en el mercado.",
      steps: [
        "Abre tu Billetera desde la navegación o el panel.",
        "Revisa el saldo disponible y las recompensas pendientes.",
        "Conecta Stripe, una cuenta bancaria o PayPal para recibir depósitos.",
        "Solicita un retiro o cambia Gems por beneficios de socios.",
      ],
      actionLabel: "Abrir Billetera",
    },
    "venue-countertop-qr": {
      categoryLabel: "Lugares y comerciantes",
      title: "Cómo configurar y verificar códigos QR de mostrador",
      summary: "Configura puntos de check-in rápidos y resistentes a manipulaciones para autenticar a los visitantes.",
      steps: [
        "Entra al Panel de Comerciante y abre «Lugares y Check-in».",
        "Descarga o imprime el código QR dinámico de tu lugar.",
        "Colócalo en la entrada, barra o caja.",
        "Cada escaneo aparecerá como tráfico y canje válido en tiempo real.",
      ],
      actionLabel: "Panel de Comerciante",
    },
    "creator-bounties": {
      categoryLabel: "Creadores y referentes",
      title: "Cómo reclamar y completar recompensas de creador",
      summary: "Obtén pagos en efectivo creando contenido auténtico y generando visitas reales a lugares locales.",
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
        "Supervisa análisis en vivo con ubicación, recibos y check-ins verificados.",
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
        "1 Gema = $1. Compre ou ganhe. Use para extras que o dinheiro de fora não dá.",
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
      summary: "Comprove sua presença para receber recompensas, aumentar seu Access Rank e ganhar Gems resgatáveis.",
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
      summary: "Converta pagamentos e recompensas em dinheiro ou use Gems no marketplace.",
      steps: [
        "Abra sua Carteira pelo menu ou painel.",
        "Confira o saldo disponível e as recompensas pendentes.",
        "Conecte Stripe, conta bancária ou PayPal para receber depósitos.",
        "Solicite um saque ou troque Gems por benefícios de parceiros.",
      ],
      actionLabel: "Abrir Carteira",
    },
    "venue-countertop-qr": {
      categoryLabel: "Locais e comerciantes",
      title: "Como configurar e verificar códigos QR de balcão",
      summary: "Configure pontos de check-in rápidos e resistentes a fraude para autenticar visitantes.",
      steps: [
        "Entre no Painel do Comerciante e abra «Locais e Check-in».",
        "Baixe ou imprima o QR dinâmico do seu local.",
        "Coloque-o na entrada, no bar ou no caixa.",
        "Cada leitura aparecerá como visita e resgate válido em tempo real.",
      ],
      actionLabel: "Painel do Comerciante",
    },
    "creator-bounties": {
      categoryLabel: "Criadores e formadores de opinião",
      title: "Como resgatar e concluir recompensas de criador",
      summary: "Receba pagamentos criando conteúdo autêntico e gerando visitas reais para estabelecimentos locais.",
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
        "Acompanhe análises ao vivo com localização, recibos e check-ins comprovados.",
      ],
      actionLabel: "Soluções para marcas",
    },
  },
};

export const helpFaqTranslations: Partial<Record<Locale, FaqTranslation[]>> = {
  "es-419": [
    { q: "¿Qué es un PromoKey?", a: "Es un pase VIP digital financiado por una marca que desbloquea una degustación, artículo secreto o experiencia premium en un lugar participante." },
    { q: "¿Qué es un Momento?", a: "Es una activación o reunión real organizada por un referente o lugar para generar visitas verificadas y conexión comunitaria auténtica." },
    { q: "¿Qué son las Gemas y cómo las consigo?", a: "1 Gema = $1 de valor en la plataforma. Cómpralas con tarjeta o gánalas en misiones, Momentos, asignaciones y premios de Ahorra y gana. Tenerlas no genera retorno. Gastarlas abre extras que el efectivo fuera de la app no da." },
    { q: "¿Qué es Access Rank?", a: "Es tu puntuación de reputación. La participación constante y los check-ins verificados desbloquean mejores PromoKeys e invitaciones." },
    { q: "¿Cómo genera Promorang visitas para mi lugar?", a: "La demanda se confirma antes de la visita: las personas votan, reclaman pases limitados y verifican su llegada con tu QR." },
    { q: "¿Necesito equipo especial para aceptar PromoKeys?", a: "No. Imprime el QR del lugar o escanea el pase del visitante con cualquier teléfono inteligente." },
    { q: "¿Cómo se pagan las recompensas de creadores?", a: "Cuando se verifica el contenido o los check-ins requeridos, los fondos se liberan a la billetera de Promorang." },
    { q: "¿Cómo verifica Promorang las activaciones?", a: "Usamos ubicación, códigos QR dinámicos, recibos verificados y seguimiento de publicaciones para aportar pruebas reales." },
    { q: "¿Cómo protege Promorang mi ubicación?", a: "Solo comprobamos la ubicación durante un check-in intencional. No vendemos datos de ubicación ni rastreamos continuamente." },
    { q: "¿Qué hago si falla un pago, check-in o PromoKey?", a: "Envía una solicitud de soporte con el lugar, la hora aproximada y una captura. Nuestro equipo revisará el caso." },
    { q: "¿Qué es una PromoCard?", a: "Es la tarjeta de todos los días. El valor elegible se descuenta en un negocio socio y tú pagas el resto. No es una cuenta bancaria, ni Puntos, ni Gemas." },
    { q: "¿Qué son los Puntos?", a: "Son un puntaje de temporada por aparecer. No se compran, no se venden y no se cobran. 500 Puntos pueden convertirse en 1 PromoKey." },
    { q: "¿Por qué gastar Gemas en vez de pagar en efectivo?", a: "Gastar Gemas puede abrir Piezas, tickets de Ahorra y gana, entradas PromoShare y beneficios de socios. Un pago fuera de Promorang no te mete en ese ciclo." },
    { q: "¿Qué es la Llave maestra?", a: "Es la puerta de contribución de hoy, no una racha que se compra. Completa las Pruebas gratis de tu nivel y se activa hasta el reinicio. Las PromoKeys siguen decidiendo cuántas puertas puedes abrir." },
    { q: "¿Qué es un ticket de PromoShare?", a: "Es tu entrada en un sorteo con nombre. El sorteo publica el premio antes de entrar: beneficio (Llave, acceso, perk) o Gemas extra en Ahorra y gana. El ticket no es el premio." },
    { q: "¿Qué es Ahorra y gana?", a: "Es la familia PromoShare que paga dinero. Reserva Gemas, quédate el 100% y junta tickets. El premio publicado es Gemas extra (1 Gema = $1). Perder no toca lo reservado." },
  ],
  "pt-BR": [
    { q: "O que é um PromoKey?", a: "É um passe VIP digital financiado por uma marca que libera degustação, item secreto ou experiência premium em um local participante." },
    { q: "O que é um Momento?", a: "É uma ativação ou encontro real organizado por um criador ou local para gerar visitas comprovadas e conexão comunitária autêntica." },
    { q: "O que são Gemas e como posso tê-las?", a: "1 Gema = $1 de valor na plataforma. Compre no cartão ou ganhe em missões, Momentos, allowances e prêmios de Guarde e ganhe. Só guardar não rende. Gastar abre extras que o dinheiro de fora do app não dá." },
    { q: "O que é Access Rank?", a: "É sua pontuação de reputação. Participação consistente e check-ins comprovados liberam melhores PromoKeys e convites." },
    { q: "Como a Promorang gera visitas para meu local?", a: "A demanda é confirmada antes da visita: as pessoas votam, resgatam passes limitados e comprovam a chegada com seu QR." },
    { q: "Preciso de equipamento especial para aceitar PromoKeys?", a: "Não. Imprima o QR do local ou escaneie o passe do visitante com qualquer smartphone." },
    { q: "Como as recompensas de criadores são pagas?", a: "Quando o conteúdo ou os check-ins exigidos são comprovados, os fundos são liberados na carteira Promorang." },
    { q: "Como a Promorang comprova as ativações?", a: "Usamos localização, QR dinâmico, recibos verificados e acompanhamento de publicações para fornecer provas reais." },
    { q: "Como a Promorang protege minha localização?", a: "Só verificamos a localização durante um check-in intencional. Não vendemos dados nem rastreamos continuamente." },
    { q: "O que faço se um pagamento, check-in ou PromoKey falhar?", a: "Abra um chamado com o local, horário aproximado e uma captura de tela. Nossa equipe analisará o caso." },
    { q: "O que é um PromoCard?", a: "É o cartão do dia a dia. O valor elegível sai da conta em um parceiro e você paga o resto. Não é conta bancária, nem Pontos, nem Gemas." },
    { q: "O que são Pontos?", a: "São um placar da temporada por aparecer. Não se compra, não se vende e não se saca. 500 Pontos podem virar 1 PromoKey." },
    { q: "Por que gastar Gemas em vez de pagar em dinheiro?", a: "Gastar Gemas pode abrir Peças, tickets de Guarde e ganhe, entradas PromoShare e benefícios de parceiros. Um pagamento fora da Promorang não te coloca nesse ciclo." },
    { q: "O que é a Chave mestra?", a: "É o portão de contribuição de hoje, não uma sequência que se compra. Complete as Provas grátis do seu nível e ela liga até o reset. PromoKeys ainda decidem quantas portas você pode abrir." },
    { q: "O que é um ticket PromoShare?", a: "É a sua entrada num sorteio com nome. O sorteio publica o prêmio antes de entrar: benefício (Chave, acesso, perk) ou Gemas extras em Guarde e ganhe. O ticket não é o prêmio." },
    { q: "O que é Guarde e ganhe?", a: "É a família PromoShare que paga dinheiro. Estacione Gemas, fique com 100% delas e colete tickets. O prêmio publicado é Gemas extras (1 Gema = $1). Perder não toca o que está estacionado." },
  ],
};
