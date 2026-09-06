const photos = {
  guitar: [
    "https://images.unsplash.com/photo-1510915361894-db8b60106cb1?auto=format&fit=crop&w=900&q=80",
    "https://images.unsplash.com/photo-1516924962500-2b4b3b99ea02?auto=format&fit=crop&w=900&q=80",
    "https://images.unsplash.com/photo-1558098329-a11cff621064?auto=format&fit=crop&w=900&q=80",
    "https://images.unsplash.com/photo-1556449895-a33c9dba33dd?auto=format&fit=crop&w=900&q=80"
  ],
  keys: [
    "https://images.unsplash.com/photo-1520523839897-bd0b52f945a0?auto=format&fit=crop&w=900&q=80",
    "https://images.unsplash.com/photo-1461784180009-27c1303a04e5?auto=format&fit=crop&w=900&q=80",
    "https://images.unsplash.com/photo-1618609377864-68609b857e90?auto=format&fit=crop&w=900&q=80"
  ],
  studio: [
    "https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?auto=format&fit=crop&w=900&q=80",
    "https://images.unsplash.com/photo-1590602847861-f357a9332bbc?auto=format&fit=crop&w=900&q=80",
    "https://images.unsplash.com/photo-1516280440614-37939bbacd81?auto=format&fit=crop&w=900&q=80",
    "https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?auto=format&fit=crop&w=900&q=80"
  ],
  drums: [
    "https://images.unsplash.com/photo-1519892300165-cb5542fb47c7?auto=format&fit=crop&w=900&q=80",
    "https://images.unsplash.com/photo-1524230659092-07f99a75c013?auto=format&fit=crop&w=900&q=80",
    "https://images.unsplash.com/photo-1526478806334-5fd488fcaabc?auto=format&fit=crop&w=900&q=80"
  ],
  dj: [
    "https://images.unsplash.com/photo-1571330735066-03aaa9429d89?auto=format&fit=crop&w=900&q=80",
    "https://images.unsplash.com/photo-1521334884684-d80222895322?auto=format&fit=crop&w=900&q=80",
    "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?auto=format&fit=crop&w=900&q=80"
  ],
  vinyl: [
    "https://images.unsplash.com/photo-1603048588665-791ca8aea617?auto=format&fit=crop&w=900&q=80",
    "https://images.unsplash.com/photo-1525201548942-d8732f6617a0?auto=format&fit=crop&w=900&q=80",
    "https://images.unsplash.com/photo-1468164016595-6108e4c60c8b?auto=format&fit=crop&w=900&q=80"
  ]
};

const review = (author, city, rating, title, body) => ({ author, city, rating, title, body });

const defaultComments = [
  review("Miguel Costa", "Viseu", 5, "Chegou impecável", "Bem embalado, afinado e pronto para ensaio."),
  review("Rita Martins", "Porto", 4.8, "Boa compra", "Gostei do atendimento e do estado real do produto."),
  review("Joao Alves", "Lisboa", 4.7, "Som muito honesto", "As fotos e a ficha técnica ajudaram a escolher com mais confiança.")
];

const product = (data) => {
  const gallery = data.gallery?.length ? data.gallery : [data.imageUrl || photos.guitar[0]];
  return {
    workspaceId: 1,
    condition: "Novo",
    compareAtPrice: Math.round(Number(data.price || 0) * 1.12),
    stock: 4,
    reorderPoint: 2,
    rating: 4.6,
    reviews: 12,
    badge: "Novo",
    isFeatured: false,
    specs: [],
    gallery,
    imageUrl: data.imageUrl || gallery[0],
    comments: data.comments || defaultComments,
    ...data
  };
};

const products = [
  product({
    id: 101,
    sku: "CLV-GTR-001",
    name: "Fender Player Stratocaster MN",
    brand: "Fender",
    category: "Guitarras",
    price: 749,
    compareAtPrice: 829,
    stock: 4,
    rating: 4.8,
    reviews: 38,
    badge: "Mais vista",
    isFeatured: true,
    gallery: [photos.guitar[0], photos.guitar[1], photos.studio[2]],
    shortDescription: "Stratocaster versátil para palco, estúdio e aulas.",
    specs: ["Corpo alder", "3 single-coils", "Escala maple"],
    comments: [
      review("Diogo Ramos", "Aveiro", 5, "Clean brilhante", "O braço e confortavel e o som clean fica mesmo definido."),
      review("Ana Pinto", "Coimbra", 4.8, "Boa para palco", "Usei em dois concertos pequenos e manteve afinacao sem stress.")
    ]
  }),
  product({
    id: 102,
    sku: "CLV-KEY-011",
    name: "Yamaha P-145 Piano Digital",
    brand: "Yamaha",
    category: "Teclados",
    price: 459,
    compareAtPrice: 499,
    stock: 6,
    rating: 4.7,
    reviews: 24,
    badge: "Top aulas",
    isFeatured: true,
    gallery: [photos.keys[0], photos.keys[1], photos.studio[0]],
    shortDescription: "Piano compacto com toque pesado para estudo diario.",
    specs: ["88 teclas", "USB MIDI", "Som Yamaha CF"],
    comments: [review("Beatriz Melo", "Vila Real", 4.9, "Ideal para estudo", "O toque e firme e cabe bem num quarto pequeno.")]
  }),
  product({
    id: 103,
    sku: "CLV-AUD-021",
    name: "Focusrite Scarlett 2i2 Studio",
    brand: "Focusrite",
    category: "Áudio e estúdio",
    price: 239,
    compareAtPrice: 269,
    stock: 3,
    rating: 4.9,
    reviews: 52,
    badge: "Home studio",
    isFeatured: true,
    gallery: [photos.studio[0], photos.studio[1], photos.studio[3]],
    shortDescription: "Kit de gravação para voz, guitarra, podcast e produção.",
    specs: ["Interface 2x2", "Microfone incluído", "Auscultadores fechados"],
    comments: [review("Nuno Pereira", "Lisboa", 5, "Setup rápido", "Instalei em minutos e a gravação de voz ficou limpa.")]
  }),
  product({
    id: 104,
    sku: "CLV-DRM-008",
    name: "Pearl Roadshow Fusion Kit",
    brand: "Pearl",
    category: "Bateria",
    price: 699,
    compareAtPrice: 759,
    stock: 2,
    rating: 4.6,
    reviews: 17,
    badge: "Stock baixo",
    isFeatured: true,
    gallery: [photos.drums[0], photos.drums[1], photos.drums[2]],
    shortDescription: "Bateria acústica completa para ensaio e primeiro palco.",
    specs: ["5 pecas", "Pratos incluídos", "Hardware duplo"],
    comments: [review("Marco Silva", "Braga", 4.6, "Kit completo", "Para uma primeira bateria completa, surpreendeu na ferragem.")]
  }),
  product({
    id: 105,
    sku: "CLV-DJ-030",
    name: "Pioneer DDJ-FLX4 Controller",
    brand: "Pioneer DJ",
    category: "DJ e palco",
    price: 319,
    compareAtPrice: 349,
    stock: 5,
    rating: 4.8,
    reviews: 31,
    badge: "DJ starter",
    isFeatured: true,
    gallery: [photos.dj[0], photos.dj[2], photos.studio[3]],
    shortDescription: "Controlador compacto para aprender, gravar sets e tocar ao vivo.",
    specs: ["2 decks", "USB-C", "rekordbox e Serato"],
    comments: [review("Tomás Neves", "Faro", 4.8, "Perfeito para começar", "Leve, simples e com layout muito fácil de aprender.")]
  }),
  product({
    id: 106,
    sku: "CLV-ACC-014",
    name: "Pack Cordas + Afinador + Correia",
    brand: "ClaveStore",
    category: "Acessórios",
    price: 39,
    compareAtPrice: 49,
    stock: 24,
    rating: 4.5,
    reviews: 44,
    badge: "Essencial",
    gallery: [photos.guitar[3], photos.guitar[0], photos.vinyl[2]],
    shortDescription: "Pack rápido para manter guitarra pronta para ensaio.",
    specs: ["Cordas 10-46", "Afinador clip", "Correia nylon"]
  }),
  product({
    id: 107,
    sku: "CLV-MIC-018",
    name: "Shure SM58 Vocal Microphone",
    brand: "Shure",
    category: "Áudio e estúdio",
    price: 119,
    compareAtPrice: 129,
    stock: 8,
    rating: 4.9,
    reviews: 63,
    badge: "Palco",
    gallery: [photos.studio[1], photos.studio[3], photos.dj[2]],
    shortDescription: "Microfone vocal robusto para concertos, ensaios e streaming.",
    specs: ["Dinamico", "Cardioide", "Inclui bolsa"]
  }),
  product({
    id: 108,
    sku: "CLV-BAS-004",
    name: "Squier Classic Vibe Jazz Bass",
    brand: "Squier",
    category: "Baixos",
    price: 429,
    compareAtPrice: 459,
    stock: 3,
    rating: 4.7,
    reviews: 21,
    badge: "Graves",
    gallery: [photos.guitar[1], photos.guitar[0], photos.studio[2]],
    shortDescription: "Baixo clássico com som definido para funk, rock e pop.",
    specs: ["4 cordas", "2 single-coils", "Escala laurel"],
    comments: [review("Pedro Lopes", "Porto", 4.7, "Grave redondo", "Boa construcao e muito confortavel para tocar sentado.")]
  }),
  product({
    id: 109,
    sku: "CLV-SYN-017",
    name: "Arturia MiniLab 3",
    brand: "Arturia",
    category: "Teclados",
    price: 99,
    compareAtPrice: 119,
    stock: 7,
    rating: 4.6,
    reviews: 19,
    badge: "Producao",
    gallery: [photos.keys[2], photos.keys[0], photos.studio[0]],
    shortDescription: "Controlador MIDI leve para beats, sintetizadores e produção.",
    specs: ["25 teclas", "Pads RGB", "USB-C"]
  }),
  product({
    id: 110,
    sku: "CLV-PA-027",
    name: "Coluna Ativa 12 polegadas 1000W",
    brand: "Alto Professional",
    category: "DJ e palco",
    price: 289,
    compareAtPrice: 329,
    stock: 1,
    rating: 4.4,
    reviews: 11,
    badge: "Ultima unidade",
    gallery: [photos.dj[1], photos.dj[2], photos.studio[3]],
    shortDescription: "Som portátil para festas, escolas de música e pequenos palcos.",
    specs: ["1000W pico", "Bluetooth", "2 entradas combo"]
  }),
  product({
    id: 111,
    sku: "CLV-VIN-006",
    name: "Pack Vinil Jazz Portugues",
    brand: "ClaveStore Curadoria",
    category: "Merch e vinil",
    price: 74,
    compareAtPrice: 89,
    stock: 10,
    rating: 4.8,
    reviews: 15,
    badge: "Curadoria PT",
    gallery: [photos.vinyl[0], photos.vinyl[1], photos.vinyl[2]],
    shortDescription: "Selecao de discos para lojas, cafes e colecionadores.",
    specs: ["3 LPs", "Edicoes novas", "Notas de curadoria"]
  }),
  product({
    id: 112,
    sku: "CLV-USED-022",
    name: "Guitarra Classica Alhambra 3C",
    brand: "Alhambra",
    category: "Guitarras",
    condition: "Usado certificado",
    price: 329,
    compareAtPrice: 389,
    stock: 1,
    rating: 4.7,
    reviews: 9,
    badge: "Certificado",
    isFeatured: true,
    gallery: [photos.guitar[2], photos.guitar[3], photos.guitar[0]],
    shortDescription: "Classica revista por técnico, ideal para conservatorio.",
    specs: ["Tampo cedro", "Setup incluído", "Garantia 12 meses"]
  }),
  product({ id: 113, sku: "CLV-GTR-009", name: "Epiphone Les Paul Standard 60s", brand: "Epiphone", category: "Guitarras", price: 639, stock: 4, rating: 4.8, reviews: 34, badge: "Rock", isFeatured: true, gallery: [photos.guitar[0], photos.guitar[1], photos.studio[2]], shortDescription: "Les Paul com humbuckers quentes para rock, blues e estúdio.", specs: ["Mogno", "ProBucker", "Perfil 60s"] }),
  product({ id: 114, sku: "CLV-GTR-010", name: "Ibanez RG421 MOL", brand: "Ibanez", category: "Guitarras", price: 349, stock: 6, rating: 4.6, reviews: 27, badge: "Metal", gallery: [photos.guitar[1], photos.guitar[0], photos.dj[2]], shortDescription: "Guitarra rápida para riffs modernos, solos e afinacoes baixas.", specs: ["24 trastes", "Quantum pickups", "Ponte fixa"] }),
  product({ id: 115, sku: "CLV-BAS-011", name: "Marcus Miller V7 Alder 4", brand: "Sire", category: "Baixos", price: 529, stock: 2, rating: 4.9, reviews: 42, badge: "Studio bass", isFeatured: true, gallery: [photos.guitar[1], photos.studio[2], photos.guitar[0]], shortDescription: "Baixo ativo/passivo com grande definição para gravação.", specs: ["Preamp ativo", "Alder", "Escala maple"] }),
  product({ id: 116, sku: "CLV-KEY-019", name: "Roland FP-30X BK", brand: "Roland", category: "Teclados", price: 629, stock: 3, rating: 4.8, reviews: 36, badge: "Piano serio", gallery: [photos.keys[0], photos.keys[1], photos.studio[0]], shortDescription: "Piano digital expressivo para estudo avancado e pequenos concertos.", specs: ["PHA-4", "Bluetooth MIDI", "Som SuperNATURAL"] }),
  product({ id: 117, sku: "CLV-SYN-021", name: "Korg Minilogue XD", brand: "Korg", category: "Teclados", price: 549, stock: 2, rating: 4.7, reviews: 29, badge: "Synth", gallery: [photos.keys[2], photos.studio[0], photos.keys[0]], shortDescription: "Sintetizador hibrido para pads, leads e texturas analogicas.", specs: ["4 vozes", "Sequencer", "Efeitos digitais"] }),
  product({ id: 118, sku: "CLV-DRM-012", name: "Roland TD-07DMK V-Drums", brand: "Roland", category: "Bateria", price: 689, stock: 3, rating: 4.7, reviews: 23, badge: "Silenciosa", gallery: [photos.drums[0], photos.drums[1], photos.studio[3]], shortDescription: "Bateria eletrónica compacta para apartamento, aulas e gravação MIDI.", specs: ["Pads mesh", "Bluetooth", "USB MIDI"] }),
  product({ id: 119, sku: "CLV-DRM-014", name: "Zildjian Planet Z Cymbal Set", brand: "Zildjian", category: "Bateria", price: 229, stock: 4, rating: 4.4, reviews: 18, badge: "Pratos", gallery: [photos.drums[2], photos.drums[0], photos.drums[1]], shortDescription: "Set de pratos acessivel para completar bateria de estudo.", specs: ["Hi-hat 14", "Crash 16", "Ride 20"] }),
  product({ id: 120, sku: "CLV-AUD-031", name: "Audio-Technica AT2020", brand: "Audio-Technica", category: "Áudio e estúdio", price: 98, stock: 9, rating: 4.7, reviews: 57, badge: "Voz", gallery: [photos.studio[1], photos.studio[0], photos.studio[3]], shortDescription: "Microfone condensador para voz, guitarra acústica e streaming.", specs: ["Condensador", "Cardioide", "XLR"] }),
  product({ id: 121, sku: "CLV-AUD-034", name: "KRK Rokit 5 G4 Par", brand: "KRK", category: "Áudio e estúdio", price: 318, stock: 5, rating: 4.6, reviews: 41, badge: "Monitores", gallery: [photos.studio[0], photos.studio[3], photos.dj[1]], shortDescription: "Par de monitores ativos para produção, mistura e edição.", specs: ["5 polegadas", "DSP EQ", "Bi-amplificado"] }),
  product({ id: 122, sku: "CLV-DJ-041", name: "Native Instruments Traktor Kontrol S2", brand: "Native Instruments", category: "DJ e palco", price: 289, stock: 3, rating: 4.5, reviews: 22, badge: "Traktor", gallery: [photos.dj[0], photos.dj[2], photos.vinyl[1]], shortDescription: "Controlador DJ de 2 decks com workflow limpo para sets compactos.", specs: ["2 decks", "Mixer integrado", "USB"] }),
  product({ id: 123, sku: "CLV-LGT-004", name: "BeamZ PartyBar LED Set", brand: "BeamZ", category: "Iluminação", price: 179, stock: 4, rating: 4.3, reviews: 13, badge: "Eventos", gallery: [photos.dj[2], photos.dj[1], photos.studio[3]], shortDescription: "Kit de luzes LED para bares, festas, escolas e pequenos palcos.", specs: ["DMX", "Pedal incluído", "Tripé"] }),
  product({ id: 124, sku: "CLV-SOP-003", name: "Yamaha YAS-280 Saxofone Alto", brand: "Yamaha", category: "Sopro", price: 1099, stock: 2, rating: 4.9, reviews: 16, badge: "Conservatorio", isFeatured: true, gallery: [photos.studio[2], photos.keys[1], photos.guitar[0]], shortDescription: "Saxofone alto fiavel para escola, conservatorio e banda filarmonica.", specs: ["Mi bemol", "Estojo incluído", "Boquilha Yamaha"] }),
  product({ id: 125, sku: "CLV-SOP-006", name: "Startone TR-200 Trompete Sib", brand: "Startone", category: "Sopro", price: 189, stock: 5, rating: 4.4, reviews: 20, badge: "Banda", gallery: [photos.studio[2], photos.vinyl[2], photos.keys[1]], shortDescription: "Trompete em Sib para iniciação em bandas e escolas de música.", specs: ["Sib", "Estojo rígido", "Bocal incluído"] }),
  product({ id: 126, sku: "CLV-STR-002", name: "Stentor Student II Violin 4/4", brand: "Stentor", category: "Cordas clássicas", price: 189, stock: 6, rating: 4.5, reviews: 25, badge: "Aluno", gallery: [photos.guitar[2], photos.keys[1], photos.studio[2]], shortDescription: "Violino completo para iniciação com arco, estojo e resina.", specs: ["4/4", "Arco incluído", "Estojo leve"] }),
  product({ id: 127, sku: "CLV-STR-005", name: "Harley Benton HBCE 830BK Cello", brand: "Harley Benton", category: "Cordas clássicas", price: 398, stock: 2, rating: 4.4, reviews: 12, badge: "Violoncelo", gallery: [photos.guitar[2], photos.studio[2], photos.keys[1]], shortDescription: "Violoncelo de estudo com captação para palco e gravação.", specs: ["4/4", "Pickup", "Saco incluído"] }),
  product({ id: 128, sku: "CLV-ACC-026", name: "Pedal Boss DS-1 Distortion", brand: "Boss", category: "Acessórios", price: 69, stock: 12, rating: 4.8, reviews: 74, badge: "Clássico", gallery: [photos.guitar[3], photos.guitar[0], photos.studio[2]], shortDescription: "Pedal de distorção clássico para rock, punk e solos definidos.", specs: ["Level", "Tone", "Distortion"] }),
  product({ id: 129, sku: "CLV-ACC-031", name: "K&M 210/9 Microphone Stand", brand: "K&M", category: "Acessórios", price: 58, stock: 16, rating: 4.9, reviews: 48, badge: "Robusto", gallery: [photos.studio[1], photos.dj[2], photos.studio[3]], shortDescription: "Tripé de microfone resistente para sala de ensaio e palco.", specs: ["Boom ajustável", "Base estável", "Metal"] }),
  product({ id: 130, sku: "CLV-VIN-014", name: "Pack Merch Banda Independente", brand: "ClaveStore Curadoria", category: "Merch e vinil", price: 44, stock: 18, rating: 4.6, reviews: 11, badge: "Indie PT", gallery: [photos.vinyl[1], photos.vinyl[0], photos.vinyl[2]], shortDescription: "Vinil, tote bag e autocolantes para apoiar bandas portuguesas.", specs: ["1 LP", "Tote", "Stickers"] })
];

const orders = [
  { id: 501, workspaceId: 1, customerName: "Ines Carvalho", email: "ines@example.com", city: "Porto", status: "processing", paymentMethod: "MB Way", subtotal: 788, tax: 181.24, shipping: 0, total: 788, createdAt: "2026-08-28T10:32:00.000Z", items: [{ productId: 101, name: "Fender Player Stratocaster MN", quantity: 1, unitPrice: 749, total: 749 }, { productId: 106, name: "Pack Cordas + Afinador + Correia", quantity: 1, unitPrice: 39, total: 39 }] },
  { id: 502, workspaceId: 1, customerName: "Ricardo Sousa", email: "ricardo@example.com", city: "Lisboa", status: "shipped", paymentMethod: "Cartão", subtotal: 358, tax: 82.34, shipping: 0, total: 358, createdAt: "2026-08-29T15:18:00.000Z", items: [{ productId: 105, name: "Pioneer DDJ-FLX4 Controller", quantity: 1, unitPrice: 319, total: 319 }, { productId: 106, name: "Pack Cordas + Afinador + Correia", quantity: 1, unitPrice: 39, total: 39 }] },
  { id: 503, workspaceId: 1, customerName: "Escola Musica do Dao", email: "compras@escolamúsica.pt", city: "Viseu", status: "paid", paymentMethod: "Transferência", subtotal: 918, tax: 171.66, shipping: 0, total: 918, createdAt: "2026-08-30T09:05:00.000Z", items: [{ productId: 102, name: "Yamaha P-145 Piano Digital", quantity: 2, unitPrice: 459, total: 918 }] },
  { id: 504, workspaceId: 1, customerName: "Marta Ferreira", email: "marta@example.com", city: "Coimbra", status: "delivered", paymentMethod: "MB Way", subtotal: 239, tax: 54.97, shipping: 6, total: 245, createdAt: "2026-08-31T18:42:00.000Z", items: [{ productId: 103, name: "Focusrite Scarlett 2i2 Studio", quantity: 1, unitPrice: 239, total: 239 }] },
  { id: 505, workspaceId: 1, customerName: "Tiago Martins", email: "tiago@example.com", city: "Braga", status: "processing", paymentMethod: "Cartão", subtotal: 548, tax: 126.04, shipping: 0, total: 548, createdAt: "2026-09-01T11:16:00.000Z", items: [{ productId: 108, name: "Squier Classic Vibe Jazz Bass", quantity: 1, unitPrice: 429, total: 429 }, { productId: 107, name: "Shure SM58 Vocal Microphone", quantity: 1, unitPrice: 119, total: 119 }] },
  { id: 506, workspaceId: 1, customerName: "Andre Nunes", email: "andre@example.com", city: "Aveiro", status: "paid", paymentMethod: "MB Way", subtotal: 388, tax: 89.24, shipping: 0, total: 388, createdAt: "2026-09-02T14:12:00.000Z", items: [{ productId: 109, name: "Arturia MiniLab 3", quantity: 1, unitPrice: 99, total: 99 }, { productId: 110, name: "Coluna Ativa 12 polegadas 1000W", quantity: 1, unitPrice: 289, total: 289 }] },
  { id: 507, workspaceId: 1, customerName: "Sara Lopes", email: "sara@example.com", city: "Faro", status: "delivered", paymentMethod: "Cartão", subtotal: 341, tax: 78.43, shipping: 6, total: 347, createdAt: "2026-09-03T16:20:00.000Z", items: [{ productId: 112, name: "Guitarra Classica Alhambra 3C", quantity: 1, unitPrice: 329, total: 329 }, { productId: 106, name: "Pack Cordas + Afinador + Correia", quantity: 1, unitPrice: 39, total: 39 }] },
  { id: 508, workspaceId: 1, customerName: "Filarmonica da Serra", email: "compras@filarmonica.pt", city: "Guarda", status: "paid", paymentMethod: "Transferência", subtotal: 1288, tax: 241.07, shipping: 0, total: 1288, createdAt: "2026-09-03T18:45:00.000Z", items: [{ productId: 124, name: "Yamaha YAS-280 Saxofone Alto", quantity: 1, unitPrice: 1099, total: 1099 }, { productId: 125, name: "Startone TR-200 Trompete Sib", quantity: 1, unitPrice: 189, total: 189 }] }
];

const activeOrders = orders.filter((order) => order.status !== "cancelled");
const revenue = activeOrders.reduce((sum, order) => sum + Number(order.total || 0), 0);
const unitsSold = activeOrders.reduce((sum, order) => sum + order.items.reduce((itemSum, item) => itemSum + Number(item.quantity || 0), 0), 0);
const visitorSessions = 6800;

export const mockDashboard = {
  meta: {
    source: "demo",
    generatedAt: "2026-09-04T10:00:00.000Z",
    stack: ["React Hooks", "Bootstrap", "Axios", "Express", "Sequelize", "PostgreSQL", "MVC"]
  },
  workspace: {
    id: 1,
    storeName: "ClaveStore PT",
    ownerName: "Paulo Monteiro",
    email: "ola@clavestore.pt",
    city: "Viseu",
    country: "Portugal",
    currency: "EUR",
    taxRate: 23,
    freeShippingThreshold: 250,
    plan: "Loja Pro"
  },
  stats: {
    products: products.length,
    activeProducts: products.filter((item) => Number(item.stock || 0) > 0).length,
    stockValue: products.reduce((sum, item) => sum + Number(item.price || 0) * Number(item.stock || 0), 0),
    lowStock: products.filter((item) => Number(item.stock || 0) <= Number(item.reorderPoint || 0)).length,
    orders: orders.length,
    revenue,
    avgTicket: activeOrders.length ? Number((revenue / activeOrders.length).toFixed(2)) : 0,
    pendingOrders: orders.filter((order) => ["pending", "paid", "processing"].includes(order.status)).length,
    unitsSold,
    visitorSessions,
    conversionRate: visitorSessions ? Number(((activeOrders.length / visitorSessions) * 100).toFixed(2)) : 0
  },
  categories: [...new Set(products.map((item) => item.category))],
  products,
  orders,
  playbooks: [
    "Criar bundles por nivel: iniciante, conservatorio, home studio e palco.",
    "Destacar usados certificados para margem maior e diferenciação face a marketplaces genéricos.",
    "Oferecer recolha em loja/parceiros locais para reduzir abandono no checkout.",
    "Usar reviews, fotos reais e fichas técnicas para aumentar confiança antes da compra.",
    "Lançar aluguer mensal para escolas, bandas e produtores independentes."
  ],
  pricing: [
    { name: "Venda direta", price: "Margem por produto", description: "Instrumentos novos, usados certificados e acessórios." },
    { name: "Packs escola", price: "Desde 19 EUR/mês", description: "Aluguer ou pagamento faseado para alunos e escolas." },
    { name: "B2B palco", price: "Orçamento", description: "Som, microfones e controladores para eventos locais." }
  ]
};