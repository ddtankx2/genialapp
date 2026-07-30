import {
  Category,
  LiveChannel,
  MovieStream,
  SeriesStream,
  BrasileiraoTeam,
  MatchOfDay,
  Episode
} from '../types';

export const DEMO_USER_INFO = {
  user_info: {
    username: "demo_user_vip",
    password: "••••••••",
    status: "Active",
    exp_date: "1798761600", // 2027
    is_trial: "0",
    active_cons: "1",
    created_at: "1704067200",
    max_connections: "3",
    allowed_output_formats: ["m3u8", "ts", "mp4"]
  },
  server_info: {
    url: "play.redstream.iptv",
    port: "8080",
    https_port: "443",
    server_protocol: "https",
    rtmp_port: "8888",
    timezone: "America/Sao_Paulo",
    timestamp_now: Date.now(),
    time_now: new Date().toLocaleString("pt-BR")
  }
};

export const DEMO_LIVE_CATEGORIES: Category[] = [
  { category_id: "all", category_name: "Todos os Canais" },
  { category_id: "globo", category_name: "Globo & Abertos" },
  { category_id: "premiere", category_name: "Premiere Futebol" },
  { category_id: "sportv", category_name: "SporTV & Esportes" },
  { category_id: "espn", category_name: "ESPN & Fox Sports" },
  { category_id: "telecine", category_name: "Telecine Premium" },
  { category_id: "hbo", category_name: "HBO & Max Channels" },
  { category_id: "canais_4k", category_name: "Canais Ultra HD 4K" },
  { category_id: "infantis", category_name: "Infantis & Desenhos" },
  { category_id: "documentarios", category_name: "Documentários & Ciência" },
  { category_id: "filmes_series", category_name: "Canais de Filmes 24h" },
  { category_id: "noticias", category_name: "Notícias 24 Horas" },
  { category_id: "musica", category_name: "Música & Shows" },
  { category_id: "internacionais", category_name: "Canais Internacionais" },
  { category_id: "religiosos", category_name: "Religiosos & Variedades" }
];

export const DEMO_LIVE_CHANNELS: LiveChannel[] = [
  // Globo & Abertos
  { num: 1, name: "Globo SP 4K HDR", stream_type: "live", stream_id: 101, stream_icon: "https://upload.wikimedia.org/wikipedia/commons/thumb/1/18/Rede_Globo_logo_2021.svg/320px-Rede_Globo_logo_2021.svg.png", category_id: "globo", quality: "4K", current_program: "Jornal Nacional - Edição ao Vivo" },
  { num: 2, name: "Globo RJ 4K HDR", stream_type: "live", stream_id: 102, stream_icon: "https://upload.wikimedia.org/wikipedia/commons/thumb/1/18/Rede_Globo_logo_2021.svg/320px-Rede_Globo_logo_2021.svg.png", category_id: "globo", quality: "4K", current_program: "RJ2 - Notícias do Rio" },
  { num: 3, name: "Globo Minas FHD", stream_type: "live", stream_id: 103, stream_icon: "https://upload.wikimedia.org/wikipedia/commons/thumb/1/18/Rede_Globo_logo_2021.svg/320px-Rede_Globo_logo_2021.svg.png", category_id: "globo", quality: "FHD", current_program: "MG2 - Jornalismo Regional" },
  { num: 4, name: "Globo Nordeste FHD", stream_type: "live", stream_id: 104, stream_icon: "https://upload.wikimedia.org/wikipedia/commons/thumb/1/18/Rede_Globo_logo_2021.svg/320px-Rede_Globo_logo_2021.svg.png", category_id: "globo", quality: "FHD", current_program: "NE2 - Notícias de Pernambuco" },
  { num: 5, name: "SBT SP HD", stream_type: "live", stream_id: 105, stream_icon: "https://upload.wikimedia.org/wikipedia/pt/thumb/d/d4/Logotipo_do_SBT_%282024%29.svg/320px-Logotipo_do_SBT_%282024%29.svg.png", category_id: "globo", quality: "FHD", current_program: "Programa do Ratinho - Ao Vivo" },
  { num: 6, name: "Record TV SP HD", stream_type: "live", stream_id: 106, stream_icon: "https://upload.wikimedia.org/wikipedia/commons/thumb/c/cd/Record_Logo_2023.svg/320px-Record_Logo_2023.svg.png", category_id: "globo", quality: "FHD", current_program: "Jornal da Record" },
  { num: 7, name: "Band SP HD", stream_type: "live", stream_id: 107, stream_icon: "https://upload.wikimedia.org/wikipedia/pt/thumb/7/7b/Logotipo_da_Rede_Bandeirantes.svg/320px-Logotipo_da_Rede_Bandeirantes.svg.png", category_id: "globo", quality: "FHD", current_program: "Os Donos da Bola" },
  { num: 8, name: "RedeTV! HD", stream_type: "live", stream_id: 108, stream_icon: "https://upload.wikimedia.org/wikipedia/commons/thumb/3/30/RedeTV%21_logo.svg/320px-RedeTV%21_logo.svg.png", category_id: "globo", quality: "HD", current_program: "SuperPop" },
  { num: 9, name: "TV Cultura HD", stream_type: "live", stream_id: 109, stream_icon: "https://upload.wikimedia.org/wikipedia/commons/thumb/0/05/TV_Cultura_logo.svg/320px-TV_Cultura_logo.svg.png", category_id: "globo", quality: "HD", current_program: "Roda Viva - Entrevista Exclusiva" },

  // Premiere Futebol
  { num: 10, name: "Premiere Clubes 4K UHD", stream_type: "live", stream_id: 110, stream_icon: "https://upload.wikimedia.org/wikipedia/commons/thumb/a/a2/Premiere_logo.png/320px-Premiere_logo.png", category_id: "premiere", quality: "4K", current_program: "Brasileirão - Flamengo vs Palmeiras" },
  { num: 11, name: "Premiere 2 HD", stream_type: "live", stream_id: 111, stream_icon: "https://upload.wikimedia.org/wikipedia/commons/thumb/a/a2/Premiere_logo.png/320px-Premiere_logo.png", category_id: "premiere", quality: "FHD", current_program: "Brasileirão - São Paulo vs Corinthians" },
  { num: 12, name: "Premiere 3 HD", stream_type: "live", stream_id: 112, stream_icon: "https://upload.wikimedia.org/wikipedia/commons/thumb/a/a2/Premiere_logo.png/320px-Premiere_logo.png", category_id: "premiere", quality: "FHD", current_program: "Brasileirão - Internacional vs Grêmio" },
  { num: 13, name: "Premiere 4 HD", stream_type: "live", stream_id: 113, stream_icon: "https://upload.wikimedia.org/wikipedia/commons/thumb/a/a2/Premiere_logo.png/320px-Premiere_logo.png", category_id: "premiere", quality: "FHD", current_program: "Brasileirão - Botafogo vs Cruzeiro" },
  { num: 14, name: "Premiere 5 HD", stream_type: "live", stream_id: 114, stream_icon: "https://upload.wikimedia.org/wikipedia/commons/thumb/a/a2/Premiere_logo.png/320px-Premiere_logo.png", category_id: "premiere", quality: "FHD", current_program: "Série B - Santos vs Sport" },
  { num: 15, name: "Premiere 6 HD", stream_type: "live", stream_id: 115, stream_icon: "https://upload.wikimedia.org/wikipedia/commons/thumb/a/a2/Premiere_logo.png/320px-Premiere_logo.png", category_id: "premiere", quality: "HD", current_program: "Série B - Ceará vs Coritiba" },
  { num: 16, name: "Premiere 7 HD", stream_type: "live", stream_id: 116, stream_icon: "https://upload.wikimedia.org/wikipedia/commons/thumb/a/a2/Premiere_logo.png/320px-Premiere_logo.png", category_id: "premiere", quality: "HD", current_program: "VT Completo - Melhores Momentos" },

  // SporTV & Esportes
  { num: 17, name: "SporTV 4K", stream_type: "live", stream_id: 117, stream_icon: "https://upload.wikimedia.org/wikipedia/commons/thumb/8/87/SporTV_logo_2021.png/320px-SporTV_logo_2021.png", category_id: "sportv", quality: "4K", current_program: "Troca de Passe - Análise dos Jogos" },
  { num: 18, name: "SporTV 2 FHD", stream_type: "live", stream_id: 118, stream_icon: "https://upload.wikimedia.org/wikipedia/commons/thumb/8/87/SporTV_logo_2021.png/320px-SporTV_logo_2021.png", category_id: "sportv", quality: "FHD", current_program: "Copa Libertadores - Fase de Grupos" },
  { num: 19, name: "SporTV 3 FHD", stream_type: "live", stream_id: 119, stream_icon: "https://upload.wikimedia.org/wikipedia/commons/thumb/8/87/SporTV_logo_2021.png/320px-SporTV_logo_2021.png", category_id: "sportv", quality: "FHD", current_program: "Vôlei Superliga Feminina - Ao Vivo" },

  // ESPN & Fox Sports
  { num: 20, name: "ESPN Brasil 4K", stream_type: "live", stream_id: 120, stream_icon: "https://upload.wikimedia.org/wikipedia/commons/thumb/2/2f/ESPN_wordmark.svg/320px-ESPN_wordmark.svg.png", category_id: "espn", quality: "4K", current_program: "Linha de Passe - Debate Esportivo" },
  { num: 21, name: "ESPN 2 FHD", stream_type: "live", stream_id: 121, stream_icon: "https://upload.wikimedia.org/wikipedia/commons/thumb/2/2f/ESPN_wordmark.svg/320px-ESPN_wordmark.svg.png", category_id: "espn", quality: "FHD", current_program: "Premier League - Arsenal vs Manchester City" },
  { num: 22, name: "ESPN 3 FHD", stream_type: "live", stream_id: 122, stream_icon: "https://upload.wikimedia.org/wikipedia/commons/thumb/2/2f/ESPN_wordmark.svg/320px-ESPN_wordmark.svg.png", category_id: "espn", quality: "FHD", current_program: "NBA - Los Angeles Lakers vs Golden State Warriors" },
  { num: 23, name: "ESPN 4 FHD", stream_type: "live", stream_id: 123, stream_icon: "https://upload.wikimedia.org/wikipedia/commons/thumb/2/2f/ESPN_wordmark.svg/320px-ESPN_wordmark.svg.png", category_id: "espn", quality: "FHD", current_program: "La Liga - Real Madrid vs Barcelona" },
  { num: 24, name: "Fox Sports 1 HD", stream_type: "live", stream_id: 124, stream_icon: "https://upload.wikimedia.org/wikipedia/commons/thumb/f/f6/Fox_Sports_logo_2020.svg/320px-Fox_Sports_logo_2020.svg.png", category_id: "espn", quality: "FHD", current_program: "Copa Sul-Americana - Ao Vivo" },

  // Telecine
  { num: 25, name: "Telecine Premium 4K", stream_type: "live", stream_id: 125, stream_icon: "https://upload.wikimedia.org/wikipedia/commons/thumb/8/8b/Telecine_logo_2019.svg/320px-Telecine_logo_2019.svg.png", category_id: "telecine", quality: "4K", current_program: "Duna: Parte 2 (Inédito 2026)" },
  { num: 26, name: "Telecine Action FHD", stream_type: "live", stream_id: 126, stream_icon: "https://upload.wikimedia.org/wikipedia/commons/thumb/8/8b/Telecine_logo_2019.svg/320px-Telecine_logo_2019.svg.png", category_id: "telecine", quality: "FHD", current_program: "Missão Impossível - Ação Pura" },
  { num: 27, name: "Telecine Touch FHD", stream_type: "live", stream_id: 127, stream_icon: "https://upload.wikimedia.org/wikipedia/commons/thumb/8/8b/Telecine_logo_2019.svg/320px-Telecine_logo_2019.svg.png", category_id: "telecine", quality: "FHD", current_program: "Drama Emocionante - Superestreia" },
  { num: 28, name: "Telecine Fun FHD", stream_type: "live", stream_id: 128, stream_icon: "https://upload.wikimedia.org/wikipedia/commons/thumb/8/8b/Telecine_logo_2019.svg/320px-Telecine_logo_2019.svg.png", category_id: "telecine", quality: "FHD", current_program: "Comédia Especial de Fim de Semana" },
  { num: 29, name: "Telecine Pipoca FHD", stream_type: "live", stream_id: 129, stream_icon: "https://upload.wikimedia.org/wikipedia/commons/thumb/8/8b/Telecine_logo_2019.svg/320px-Telecine_logo_2019.svg.png", category_id: "telecine", quality: "FHD", current_program: "Filmes Dublados 24 Horas" },
  { num: 30, name: "Telecine Cult FHD", stream_type: "live", stream_id: 130, stream_icon: "https://upload.wikimedia.org/wikipedia/commons/thumb/8/8b/Telecine_logo_2019.svg/320px-Telecine_logo_2019.svg.png", category_id: "telecine", quality: "FHD", current_program: "Clássicos do Cinema Mundial" },

  // HBO
  { num: 31, name: "HBO 4K Ultra HD", stream_type: "live", stream_id: 131, stream_icon: "https://upload.wikimedia.org/wikipedia/commons/thumb/d/de/HBO_logo.svg/320px-HBO_logo.svg.png", category_id: "hbo", quality: "4K", current_program: "A Casa do Dragão - Episódio Inédito" },
  { num: 32, name: "HBO 2 FHD", stream_type: "live", stream_id: 132, stream_icon: "https://upload.wikimedia.org/wikipedia/commons/thumb/d/de/HBO_logo.svg/320px-HBO_logo.svg.png", category_id: "hbo", quality: "FHD", current_program: "The Last of Us - Temporada 2" },
  { num: 33, name: "HBO Signature FHD", stream_type: "live", stream_id: 133, stream_icon: "https://upload.wikimedia.org/wikipedia/commons/thumb/d/de/HBO_logo.svg/320px-HBO_logo.svg.png", category_id: "hbo", quality: "FHD", current_program: "Séries Originais Exclusivas" },
  { num: 34, name: "HBO Family FHD", stream_type: "live", stream_id: 134, stream_icon: "https://upload.wikimedia.org/wikipedia/commons/thumb/d/de/HBO_logo.svg/320px-HBO_logo.svg.png", category_id: "hbo", quality: "FHD", current_program: "Filmes para Toda a Família" },
  { num: 35, name: "HBO Mundi FHD", stream_type: "live", stream_id: 135, stream_icon: "https://upload.wikimedia.org/wikipedia/commons/thumb/d/de/HBO_logo.svg/320px-HBO_logo.svg.png", category_id: "hbo", quality: "FHD", current_program: "Cinema Independente Internacional" },
  { num: 36, name: "HBO Pop FHD", stream_type: "live", stream_id: 136, stream_icon: "https://upload.wikimedia.org/wikipedia/commons/thumb/d/de/HBO_logo.svg/320px-HBO_logo.svg.png", category_id: "hbo", quality: "FHD", current_program: "Comédias e Romances Populares" },

  // Canais 4K
  { num: 37, name: "Cinema 4K Ultra HD", stream_type: "live", stream_id: 137, stream_icon: "https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=320&auto=format&fit=crop&q=80", category_id: "canais_4k", quality: "4K", current_program: "Sessão 4K HDR Atmos 60fps" },
  { num: 38, name: "Futebol 4K Especial", stream_type: "live", stream_id: 138, stream_icon: "https://images.unsplash.com/photo-1508098682722-e99c43a406b2?w=320&auto=format&fit=crop&q=80", category_id: "canais_4k", quality: "4K", current_program: "UEFA Champions League 4K" },
  { num: 39, name: "Nature 4K Ultra HD", stream_type: "live", stream_id: 139, stream_icon: "https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?w=320&auto=format&fit=crop&q=80", category_id: "canais_4k", quality: "4K", current_program: "Planeta Terra 4K HDR" },

  // Infantis
  { num: 40, name: "Cartoon Network HD", stream_type: "live", stream_id: 140, stream_icon: "https://upload.wikimedia.org/wikipedia/commons/thumb/8/80/Cartoon_Network_2010_logo.svg/320px-Cartoon_Network_2010_logo.svg.png", category_id: "infantis", quality: "FHD", current_program: "O Incrível Mundo de Gumball" },
  { num: 41, name: "Disney Channel FHD", stream_type: "live", stream_id: 141, stream_icon: "https://upload.wikimedia.org/wikipedia/commons/thumb/d/d2/Disney_Channel_logo.svg/320px-Disney_Channel_logo.svg.png", category_id: "infantis", quality: "FHD", current_program: "Phineas e Ferb" },
  { num: 42, name: "Nickelodeon HD", stream_type: "live", stream_id: 142, stream_icon: "https://upload.wikimedia.org/wikipedia/commons/thumb/7/7a/Nickelodeon_2023_logo.svg/320px-Nickelodeon_2023_logo.svg.png", category_id: "infantis", quality: "FHD", current_program: "Bob Esponja Calça Quadrada" },
  { num: 43, name: "Gloob HD", stream_type: "live", stream_id: 143, stream_icon: "https://images.unsplash.com/photo-1563089145-599997674d42?w=320&auto=format&fit=crop&q=80", category_id: "infantis", quality: "FHD", current_program: "D.P.A. Detetives do Prédio Azul" },
  { num: 44, name: "Discovery Kids HD", stream_type: "live", stream_id: 144, stream_icon: "https://images.unsplash.com/photo-1534447677768-be436bb09401?w=320&auto=format&fit=crop&q=80", category_id: "infantis", quality: "FHD", current_program: "Peppa Pig & Show da Luna" },

  // Documentários
  { num: 45, name: "Discovery Channel 4K", stream_type: "live", stream_id: 145, stream_icon: "https://upload.wikimedia.org/wikipedia/commons/thumb/2/22/Discovery_Channel_logo_2019.svg/320px-Discovery_Channel_logo_2019.svg.png", category_id: "documentarios", quality: "4K", current_program: "Pesca Mortal - Oceanos" },
  { num: 46, name: "National Geographic FHD", stream_type: "live", stream_id: 146, stream_icon: "https://upload.wikimedia.org/wikipedia/commons/thumb/6/6a/National_Geographic_logo.svg/320px-National_Geographic_logo.svg.png", category_id: "documentarios", quality: "FHD", current_program: "Segredos dos Oceanos" },
  { num: 47, name: "History Channel HD", stream_type: "live", stream_id: 147, stream_icon: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=320&auto=format&fit=crop&q=80", category_id: "documentarios", quality: "FHD", current_program: "Alienígenas do Passado" },
  { num: 48, name: "Animal Planet HD", stream_type: "live", stream_id: 148, stream_icon: "https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?w=320&auto=format&fit=crop&q=80", category_id: "documentarios", quality: "FHD", current_program: "Mundo Selvagem da África" },

  // Notícias
  { num: 49, name: "CNN Brasil HD", stream_type: "live", stream_id: 149, stream_icon: "https://upload.wikimedia.org/wikipedia/commons/thumb/6/66/CNN_Brasil_logo.svg/320px-CNN_Brasil_logo.svg.png", category_id: "noticias", quality: "FHD", current_program: "CNN Arena - Debates" },
  { num: 50, name: "GloboNews HD", stream_type: "live", stream_id: 150, stream_icon: "https://upload.wikimedia.org/wikipedia/commons/thumb/1/18/Rede_Globo_logo_2021.svg/320px-Rede_Globo_logo_2021.svg.png", category_id: "noticias", quality: "FHD", current_program: "Edição das 18h - Ao Vivo" },
  { num: 51, name: "Jovem Pan News HD", stream_type: "live", stream_id: 151, stream_icon: "https://images.unsplash.com/photo-1504711434969-e33886168f5c?w=320&auto=format&fit=crop&q=80", category_id: "noticias", quality: "FHD", current_program: "Os Pingos nos Is" },
  { num: 52, name: "BandNews HD", stream_type: "live", stream_id: 152, stream_icon: "https://images.unsplash.com/photo-1504711434969-e33886168f5c?w=320&auto=format&fit=crop&q=80", category_id: "noticias", quality: "FHD", current_program: "Jornal BandNews Ao Vivo" }
];

export const DEMO_MOVIE_CATEGORIES: Category[] = [
  { category_id: "m_all", category_name: "Todos os Filmes" },
  { category_id: "m_lancamentos", category_name: "Lançamentos 2026 / 2025" },
  { category_id: "m_acao", category_name: "Ação & Aventura" },
  { category_id: "m_ficcao", category_name: "Ficção Científica" },
  { category_id: "m_terror", category_name: "Terror & Suspense" },
  { category_id: "m_comedia", category_name: "Comédia & Família" },
  { category_id: "m_animacao", category_name: "Animação" },
  { category_id: "m_4k", category_name: "Filmes Ultra HD 4K" }
];

export const DEMO_MOVIES: MovieStream[] = [
  {
    num: 1,
    name: "Duna: Parte Dois (4K HDR Dual Áudio)",
    stream_type: "movie",
    stream_id: 201,
    stream_icon: "https://images.unsplash.com/photo-1534447677768-be436bb09401?w=500&auto=format&fit=crop&q=80",
    rating: "8.6",
    rating_5based: 4.3,
    added: "1704067200",
    category_id: "m_lancamentos",
    container_extension: "mp4",
    custom_sid: "",
    direct_source: "",
    year: "2024",
    genre: "Ficção Científica, Aventura",
    duration: "2h 46m",
    plot: "Paul Atreides se une a Chani e aos Fremen em uma guerra de vingança contra os conspiradores que destruíram sua família. Diante de uma escolha entre o amor de sua vida e o destino do universo, ele se esforça para evitar um futuro terrível que só ele pode prever."
  },
  {
    num: 2,
    name: "O Gladiador II (4K Ultra HD)",
    stream_type: "movie",
    stream_id: 202,
    stream_icon: "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=500&auto=format&fit=crop&q=80",
    rating: "8.1",
    rating_5based: 4.1,
    added: "1704067200",
    category_id: "m_acao",
    container_extension: "mp4",
    custom_sid: "",
    direct_source: "",
    year: "2024",
    genre: "Ação, Épico, Drama",
    duration: "2h 28m",
    plot: "Anos após testemunhar a morte do herói Maximus, Lucius é forçado a entrar no Coliseu após sua casa ser conquistada pelos imperadores tirânicos que agora lideram Roma com mão de ferro."
  },
  {
    num: 3,
    name: "Divertida Mente 2 (Dublado 4K)",
    stream_type: "movie",
    stream_id: 203,
    stream_icon: "https://images.unsplash.com/photo-1563089145-599997674d42?w=500&auto=format&fit=crop&q=80",
    rating: "8.4",
    rating_5based: 4.2,
    added: "1704067200",
    category_id: "m_animacao",
    container_extension: "mp4",
    custom_sid: "",
    direct_source: "",
    year: "2024",
    genre: "Animação, Comédia, Família",
    duration: "1h 36m",
    plot: "Com a chegada da adolescência, a mente de Riley passa por uma grande reforma para dar lugar a novas emoções surpreendentes: Ansiedade, Inveja, Tédio e Vergonha."
  },
  {
    num: 4,
    name: "O Chefão do Crime: Império Final",
    stream_type: "movie",
    stream_id: 204,
    stream_icon: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=500&auto=format&fit=crop&q=80",
    rating: "8.9",
    rating_5based: 4.5,
    added: "1704067200",
    category_id: "m_acao",
    container_extension: "mp4",
    custom_sid: "",
    direct_source: "",
    year: "2025",
    genre: "Ação, Policial",
    duration: "2h 15m",
    plot: "Um inspetor obstinado mergulha nas profundezas do crime organizado em São Paulo para desmantelar o maior esquema de corrupção e tráfico da América Latina."
  },
  {
    num: 5,
    name: "Interestelar: Edição Especial 4K",
    stream_type: "movie",
    stream_id: 205,
    stream_icon: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=500&auto=format&fit=crop&q=80",
    rating: "8.7",
    rating_5based: 4.4,
    added: "1704067200",
    category_id: "m_ficcao",
    container_extension: "mp4",
    custom_sid: "",
    direct_source: "",
    year: "2014",
    genre: "Ficção Científica, Drama",
    duration: "2h 49m",
    plot: "As reservas naturais da Terra estão chegando ao fim e um grupo de exploradores precisa viajar através de um buraco de minhoca no espaço em busca de um novo lar para a humanidade."
  },
  {
    num: 6,
    name: "Invocação do Mal 4: O Ritual Final",
    stream_type: "movie",
    stream_id: 206,
    stream_icon: "https://images.unsplash.com/photo-1509248961158-e54f6934749c?w=500&auto=format&fit=crop&q=80",
    rating: "7.9",
    rating_5based: 3.95,
    added: "1704067200",
    category_id: "m_terror",
    container_extension: "mp4",
    custom_sid: "",
    direct_source: "",
    year: "2025",
    genre: "Terror, Sobrenatural",
    duration: "1h 52m",
    plot: "Os investigadores paranormais Ed e Lorraine Warren enfrentam o caso mais aterrorizante e sombrio de suas carreiras em uma abadia esquecida no interior da Inglaterra."
  }
];

export const DEMO_SERIES_CATEGORIES: Category[] = [
  { category_id: "s_all", category_name: "Todas as Séries" },
  { category_id: "s_populares", category_name: "Séries Em Alta" },
  { category_id: "s_drama", category_name: "Drama & Suspense" },
  { category_id: "s_acao", category_name: "Ação & Fantasia" },
  { category_id: "s_comedia", category_name: "Comédia" },
  { category_id: "s_nacionais", category_name: "Séries Nacionais" }
];

export const DEMO_SERIES: SeriesStream[] = [
  {
    num: 1,
    name: "A Casa do Dragão (House of the Dragon)",
    series_id: 301,
    cover: "https://images.unsplash.com/photo-1514539079130-25950c84af65?w=500&auto=format&fit=crop&q=80",
    plot: "A história da guerra civil da Casa Targaryen, conhecida como a Dança dos Dragões, ocorrendo duzentos anos antes dos eventos de Game of Thrones.",
    cast: "Emma D'Arcy, Matt Smith, Olivia Cooke",
    director: "Ryan Condal",
    genre: "Ação, Fantasia, Drama",
    releaseDate: "2022-2026",
    last_modified: "1704067200",
    rating: "8.5",
    rating_5based: 4.25,
    category_id: "s_populares",
    seasonsCount: 2
  },
  {
    num: 2,
    name: "The Last of Us - Temporada 2",
    series_id: 302,
    cover: "https://images.unsplash.com/photo-1509198397868-475647b2a1e5?w=500&auto=format&fit=crop&q=80",
    plot: "Vinte anos após a destruição da civilização moderna, Joel é contratado para tirar Ellie de uma zona de quarentena opressiva. O que começa como um pequeno trabalho se torna uma jornada brutal e dolorosa.",
    cast: "Pedro Pascal, Bella Ramsey, Bella Ramsey",
    director: "Craig Mazin, Neil Druckmann",
    genre: "Pós-Apocalíptico, Drama, Ação",
    releaseDate: "2023-2026",
    last_modified: "1704067200",
    rating: "8.8",
    rating_5based: 4.4,
    category_id: "s_populares",
    seasonsCount: 2
  },
  {
    num: 3,
    name: "Sintonia - Edição Final",
    series_id: 303,
    cover: "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=500&auto=format&fit=crop&q=80",
    plot: "Três amigos da favela de São Paulo perseguem seus sonhos enquanto enfrentam o crime, a música funk e a religião.",
    cast: "Jottapê, Christian Malheiros, Bruna Mascarenhas",
    director: "KondZilla",
    genre: "Drama, Crime, Música",
    releaseDate: "2019-2025",
    last_modified: "1704067200",
    rating: "8.2",
    rating_5based: 4.1,
    category_id: "s_nacionais",
    seasonsCount: 4
  },
  {
    num: 4,
    name: "Stranger Things - Quinta Temporada",
    series_id: 304,
    cover: "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=500&auto=format&fit=crop&q=80",
    plot: "Em Hawkins, Indiana, um garoto desaparece e seus amigos encontram uma garota com poderes telecinéticos, revelando um portal misterioso para o Mundo Invertido.",
    cast: "Millie Bobby Brown, Finn Wolfhard, Winona Ryder",
    director: "Irmãos Duffer",
    genre: "Ficção Científica, Horror, Drama",
    releaseDate: "2016-2026",
    last_modified: "1704067200",
    rating: "8.7",
    rating_5based: 4.35,
    category_id: "s_populares",
    seasonsCount: 5
  }
];

export const DEMO_SERIES_EPISODES: Record<number, Episode[]> = {
  301: [
    {
      id: "ep101",
      episode_num: 1,
      season: 1,
      title: "Os Herdeiros do Dragão",
      container_extension: "mp4",
      info: {
        duration: "1h 05m",
        movie_image: "https://images.unsplash.com/photo-1514539079130-25950c84af65?w=500&auto=format&fit=crop&q=80",
        plot: "Viserys realiza um torneio para celebrar o nascimento iminente de seu herdeiro. Rhaenyra recebe Daemon de volta à corte.",
        rating: 8.8
      }
    },
    {
      id: "ep102",
      episode_num: 2,
      season: 1,
      title: "O Príncipe Rebelde",
      container_extension: "mp4",
      info: {
        duration: "54m",
        movie_image: "https://images.unsplash.com/photo-1514539079130-25950c84af65?w=500&auto=format&fit=crop&q=80",
        plot: "Rhaenyra intervém em um impasse em Pedra do Dragão. Viserys busca fortalecer seu reino através do casamento.",
        rating: 8.6
      }
    },
    {
      id: "ep201",
      episode_num: 1,
      season: 2,
      title: "Um Filho por um Filho",
      container_extension: "mp4",
      info: {
        duration: "1h 02m",
        movie_image: "https://images.unsplash.com/photo-1514539079130-25950c84af65?w=500&auto=format&fit=crop&q=80",
        plot: "Após a tragédia de Lucerys, Rhaenyra busca vingança e Porto Real se prepara para o cerco iminente.",
        rating: 9.1
      }
    }
  ]
};

export const DEMO_BRASILEIRAO_TABLE: BrasileiraoTeam[] = [
  { position: 1, name: "Flamengo", shortName: "FLA", logo: "https://s.sde.globo.com/media/organizations/2018/04/09/Flamengo.svg", points: 48, played: 22, won: 15, drawn: 3, lost: 4, goalsFor: 42, goalsAgainst: 18, goalDifference: 24, form: ['W', 'W', 'W', 'D', 'W'] },
  { position: 2, name: "Palmeiras", shortName: "PAL", logo: "https://s.sde.globo.com/media/organizations/2019/07/06/Palmeiras.svg", points: 46, played: 22, won: 14, drawn: 4, lost: 4, goalsFor: 38, goalsAgainst: 17, goalDifference: 21, form: ['W', 'W', 'D', 'W', 'L'] },
  { position: 3, name: "Botafogo", shortName: "BOT", logo: "https://s.sde.globo.com/media/organizations/2019/02/04/botafogo-svg.svg", points: 44, played: 22, won: 13, drawn: 5, lost: 4, goalsFor: 36, goalsAgainst: 20, goalDifference: 16, form: ['W', 'L', 'W', 'W', 'D'] },
  { position: 4, name: "São Paulo", shortName: "SAO", logo: "https://s.sde.globo.com/media/organizations/2018/03/11/sao-paulo.svg", points: 41, played: 22, won: 12, drawn: 5, lost: 5, goalsFor: 33, goalsAgainst: 21, goalDifference: 12, form: ['D', 'W', 'W', 'L', 'W'] },
  { position: 5, name: "Cruzeiro", shortName: "CRU", logo: "https://s.sde.globo.com/media/organizations/2021/02/13/cruzeiro_2021.svg", points: 38, played: 22, won: 11, drawn: 5, lost: 6, goalsFor: 31, goalsAgainst: 22, goalDifference: 9, form: ['W', 'D', 'L', 'W', 'W'] },
  { position: 6, name: "Internacional", shortName: "INT", logo: "https://s.sde.globo.com/media/organizations/2018/03/11/internacional.svg", points: 36, played: 22, won: 10, drawn: 6, lost: 6, goalsFor: 29, goalsAgainst: 21, goalDifference: 8, form: ['L', 'W', 'W', 'D', 'D'] },
  { position: 7, name: "Fortaleza", shortName: "FOR", logo: "https://s.sde.globo.com/media/organizations/2021/09/19/Fortaleza_2021.svg", points: 35, played: 22, won: 10, drawn: 5, lost: 7, goalsFor: 28, goalsAgainst: 23, goalDifference: 5, form: ['W', 'L', 'D', 'W', 'L'] },
  { position: 8, name: "Atlético-MG", shortName: "CAM", logo: "https://s.sde.globo.com/media/organizations/2018/03/10/atletico-mg.svg", points: 33, played: 22, won: 9, drawn: 6, lost: 7, goalsFor: 30, goalsAgainst: 28, goalDifference: 2, form: ['D', 'W', 'L', 'W', 'L'] },
  { position: 9, name: "Bahia", shortName: "BAH", logo: "https://s.sde.globo.com/media/organizations/2018/03/11/bahia.svg", points: 32, played: 22, won: 9, drawn: 5, lost: 8, goalsFor: 29, goalsAgainst: 27, goalDifference: 2, form: ['L', 'D', 'W', 'L', 'W'] },
  { position: 10, name: "Vasco da Gama", shortName: "VAS", logo: "https://s.sde.globo.com/media/organizations/2021/09/04/vasco_2021.svg", points: 30, played: 22, won: 8, drawn: 6, lost: 8, goalsFor: 26, goalsAgainst: 29, goalDifference: -3, form: ['W', 'W', 'D', 'L', 'D'] },
  { position: 11, name: "Corinthians", shortName: "COR", logo: "https://s.sde.globo.com/media/organizations/2019/09/30/Corinthians.svg", points: 28, played: 22, won: 7, drawn: 7, lost: 8, goalsFor: 24, goalsAgainst: 28, goalDifference: -4, form: ['D', 'L', 'W', 'D', 'W'] },
  { position: 12, name: "Grêmio", shortName: "GRE", logo: "https://s.sde.globo.com/media/organizations/2018/03/12/gremio.svg", points: 27, played: 22, won: 7, drawn: 6, lost: 9, goalsFor: 22, goalsAgainst: 27, goalDifference: -5, form: ['L', 'W', 'L', 'D', 'W'] },
  { position: 13, name: "Fluminense", shortName: "FLU", logo: "https://s.sde.globo.com/media/organizations/2018/03/11/fluminense.svg", points: 26, played: 22, won: 7, drawn: 5, lost: 10, goalsFor: 21, goalsAgainst: 26, goalDifference: -5, form: ['W', 'D', 'L', 'W', 'L'] },
  { position: 14, name: "Athletico-PR", shortName: "CAP", logo: "https://s.sde.globo.com/media/organizations/2019/09/09/Athletico-PR.svg", points: 25, played: 22, won: 6, drawn: 7, lost: 9, goalsFor: 22, goalsAgainst: 28, goalDifference: -6, form: ['L', 'L', 'D', 'W', 'L'] },
  { position: 15, name: "Red Bull Bragantino", shortName: "RBB", logo: "https://s.sde.globo.com/media/organizations/2020/01/01/Red_Bull_Bragantino.svg", points: 24, played: 22, won: 6, drawn: 6, lost: 10, goalsFor: 23, goalsAgainst: 30, goalDifference: -7, form: ['D', 'L', 'L', 'W', 'D'] },
  { position: 16, name: "Juventude", shortName: "JUV", logo: "https://s.sde.globo.com/media/organizations/2021/04/29/Juventude_2021.svg", points: 22, played: 22, won: 5, drawn: 7, lost: 10, goalsFor: 20, goalsAgainst: 31, goalDifference: -11, form: ['L', 'D', 'W', 'L', 'L'] },
  { position: 17, name: "Vitória", shortName: "VIT", logo: "https://s.sde.globo.com/media/organizations/2024/04/09/vitoria-2024.svg", points: 20, played: 22, won: 5, drawn: 5, lost: 12, goalsFor: 19, goalsAgainst: 32, goalDifference: -13, form: ['L', 'L', 'L', 'D', 'W'] },
  { position: 18, name: "Criciúma", shortName: "CRI", logo: "https://s.sde.globo.com/media/organizations/2018/03/11/criciuma.svg", points: 19, played: 22, won: 4, drawn: 7, lost: 11, goalsFor: 18, goalsAgainst: 33, goalDifference: -15, form: ['D', 'L', 'D', 'L', 'L'] },
  { position: 19, name: "Cuiabá", shortName: "CUI", logo: "https://s.sde.globo.com/media/organizations/2018/12/26/Cuiaba_EC.svg", points: 17, played: 22, won: 3, drawn: 8, lost: 11, goalsFor: 16, goalsAgainst: 32, goalDifference: -16, form: ['L', 'D', 'L', 'L', 'D'] },
  { position: 20, name: "Atlético-GO", shortName: "ACG", logo: "https://s.sde.globo.com/media/organizations/2020/07/02/atletico-go-2020.svg", points: 14, played: 22, won: 3, drawn: 5, lost: 14, goalsFor: 15, goalsAgainst: 37, goalDifference: -22, form: ['L', 'L', 'L', 'L', 'D'] }
];

export const DEMO_MATCHES_OF_DAY: MatchOfDay[] = [
  {
    id: "m1",
    homeTeam: "Flamengo",
    homeLogo: "https://s.sde.globo.com/media/organizations/2018/04/09/Flamengo.svg",
    awayTeam: "Palmeiras",
    awayLogo: "https://s.sde.globo.com/media/organizations/2019/07/06/Palmeiras.svg",
    time: "20:00",
    competition: "Brasileirão Série A",
    status: "Ao Vivo",
    homeScore: 1,
    awayScore: 0,
    channelName: "Premiere Clubes 4K UHD",
    matchedChannelId: 102
  },
  {
    id: "m2",
    homeTeam: "São Paulo",
    homeLogo: "https://s.sde.globo.com/media/organizations/2018/03/11/sao-paulo.svg",
    awayTeam: "Corinthians",
    awayLogo: "https://s.sde.globo.com/media/organizations/2019/09/30/Corinthians.svg",
    time: "21:30",
    competition: "Brasileirão Série A",
    status: "Ao Vivo",
    homeScore: 2,
    awayScore: 2,
    channelName: "Premiere 2 HD",
    matchedChannelId: 103
  },
  {
    id: "m3",
    homeTeam: "Internacional",
    homeLogo: "https://s.sde.globo.com/media/organizations/2018/03/11/internacional.svg",
    awayTeam: "Grêmio",
    awayLogo: "https://s.sde.globo.com/media/organizations/2018/03/12/gremio.svg",
    time: "18:30",
    competition: "Grenal - Brasileirão",
    status: "Em Breve",
    channelName: "Premiere 3 HD",
    matchedChannelId: 104
  },
  {
    id: "m4",
    homeTeam: "Real Madrid",
    homeLogo: "https://upload.wikimedia.org/wikipedia/en/thumb/5/56/Real_Madrid_CF.svg/200px-Real_Madrid_CF.svg.png",
    awayTeam: "Barcelona",
    awayLogo: "https://upload.wikimedia.org/wikipedia/en/thumb/4/47/FC_Barcelona.svg/200px-FC_Barcelona.svg.png",
    time: "16:00",
    competition: "La Liga - El Clásico",
    status: "Em Breve",
    channelName: "ESPN Brasil 4K",
    matchedChannelId: 107
  },
  {
    id: "m5",
    homeTeam: "Arsenal",
    homeLogo: "https://upload.wikimedia.org/wikipedia/en/thumb/5/53/Arsenal_FC.svg/200px-Arsenal_FC.svg.png",
    awayTeam: "Manchester City",
    awayLogo: "https://upload.wikimedia.org/wikipedia/en/thumb/e/eb/Manchester_City_FC_badge.svg/200px-Manchester_City_FC_badge.svg.png",
    time: "14:00",
    competition: "Premier League",
    status: "Encerrado",
    homeScore: 3,
    awayScore: 1,
    channelName: "ESPN 2 FHD",
    matchedChannelId: 108
  }
];

// Sample test streams (Big Buck Bunny, Sintel, Elephant's Dream, NASA)
export const PUBLIC_SAMPLE_STREAMS = [
  "https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8",
  "https://bitdash-a.akamaihd.net/content/sintel/hls/playlist.m3u8",
  "https://demo.unified-streaming.com/k8s/features/stable/video/tears-of-steel/tears-of-steel.ism/.m3u8",
  "https://cdn.jwplayer.com/manifests/pvh123.m3u8"
];
