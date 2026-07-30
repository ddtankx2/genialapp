import React, { useState, useMemo, useEffect, useRef } from 'react';
import Hls from 'hls.js';
import { motion, AnimatePresence } from 'motion/react';
import {
  Tv,
  Play,
  Pause,
  Search,
  Volume2,
  VolumeX,
  Maximize,
  MoreVertical,
  Radio,
  AlertCircle,
  RotateCcw,
  ArrowLeft,
  X,
  Clock,
  Loader2
} from 'lucide-react';
import { Category, LiveChannel, XtreamServerCredentials } from '../types';
import { buildStreamUrl, fetchShortEpg, EpgListingItem } from '../services/xtream';

interface LiveTvSectionProps {
  categories: Category[];
  channels: LiveChannel[];
  onPlayChannel: (channel: LiveChannel) => void;
  searchQuery: string;
  activeServer: XtreamServerCredentials | null;
  onBack?: () => void;
}

interface EpgProgram {
  timeSlot: string;
  title: string;
  description: string;
}

function padZero(n: number): string {
  return n < 10 ? `0${n}` : `${n}`;
}

function formatHHMM(date: Date): string {
  return `${padZero(date.getHours())}:${padZero(date.getMinutes())}`;
}

export function generateRealtimeEpg(channel: LiveChannel, serverEpgItems?: EpgListingItem[], categories?: Category[]): EpgProgram[] {
  if (serverEpgItems && serverEpgItems.length > 0) {
    return serverEpgItems.map((item) => {
      let timeStr = 'Ao Vivo';
      if (item.start && item.end) {
        const sDate = new Date(item.start);
        const eDate = new Date(item.end);
        if (!isNaN(sDate.getTime()) && !isNaN(eDate.getTime())) {
          timeStr = `${formatHHMM(sDate)} às ${formatHHMM(eDate)}`;
        } else {
          timeStr = `${item.start.split(' ')[1] || ''} às ${item.end.split(' ')[1] || ''}`;
        }
      }
      return {
        timeSlot: timeStr,
        title: item.title,
        description: item.description || 'Programação transmitida ao vivo via IP.'
      };
    });
  }

  const now = new Date();
  const currentHour = now.getHours();
  const currentMin = now.getMinutes();

  const startMinute = currentMin < 30 ? 0 : 30;
  const baseDate = new Date(now.getFullYear(), now.getMonth(), now.getDate(), currentHour, startMinute, 0);

  const nameLower = channel.name.toLowerCase();
  
  // Resolve category name
  const cat = categories?.find(c => String(c.category_id) === String(channel.category_id));
  const catLower = cat ? cat.category_name.toLowerCase() : String(channel.category_id || '').toLowerCase();

  let programTemplates: { title: string; desc: string }[] = [];

  const isSports =
    nameLower.includes('premiere') ||
    nameLower.includes('futebol') ||
    nameLower.includes('sportv') ||
    nameLower.includes('espn') ||
    nameLower.includes('combate') ||
    nameLower.includes('ufc') ||
    catLower.includes('sport') ||
    catLower.includes('premiere') ||
    catLower.includes('esporte') ||
    catLower.includes('futebol') ||
    catLower.includes('arena');

  const isMovies =
    nameLower.includes('telecine') ||
    nameLower.includes('hbo') ||
    nameLower.includes('cinema') ||
    nameLower.includes('filme') ||
    nameLower.includes('pipoca') ||
    nameLower.includes('action') ||
    nameLower.includes('premium') ||
    catLower.includes('telecine') ||
    catLower.includes('hbo') ||
    catLower.includes('filmes') ||
    catLower.includes('cinema') ||
    catLower.includes('movie') ||
    catLower.includes('vod') ||
    catLower.includes('cine');

  const isSeries =
    nameLower.includes('série') ||
    nameLower.includes('series') ||
    nameLower.includes('warner') ||
    nameLower.includes('sony') ||
    nameLower.includes('universal') ||
    nameLower.includes('fox') ||
    catLower.includes('série') ||
    catLower.includes('series') ||
    catLower.includes('shows') ||
    catLower.includes('novela');

  const isNews =
    nameLower.includes('cnn') ||
    nameLower.includes('news') ||
    nameLower.includes('jovem pan') ||
    nameLower.includes('noticias') ||
    nameLower.includes('bandnews') ||
    catLower.includes('noticias') ||
    catLower.includes('notícias') ||
    catLower.includes('news') ||
    catLower.includes('informação');

  const isKids =
    nameLower.includes('cartoon') ||
    nameLower.includes('disney') ||
    nameLower.includes('nick') ||
    nameLower.includes('gloob') ||
    nameLower.includes('kids') ||
    nameLower.includes('infantil') ||
    catLower.includes('infantis') ||
    catLower.includes('infantil') ||
    catLower.includes('kids') ||
    catLower.includes('desenho') ||
    catLower.includes('cartoon');

  const isDocs =
    nameLower.includes('discovery') ||
    nameLower.includes('history') ||
    nameLower.includes('national') ||
    nameLower.includes('nat geo') ||
    nameLower.includes('doc') ||
    catLower.includes('documentario') ||
    catLower.includes('documentário') ||
    catLower.includes('docs') ||
    catLower.includes('história');

  if (isSports) {
    programTemplates = [
      {
        title: 'Brasileirão Ao Vivo: Palmeiras vs Flamengo',
        desc: 'Acompanhe todos os lances deste grande clássico do futebol nacional, com transmissão em alta definição, análises de especialistas e narração especial.'
      },
      {
        title: 'Mesa Redonda: Análise e Debates da Rodada',
        desc: 'Comentários completos dos principais lances, gols da rodada, entrevistas exclusivas com técnicos, jogadores e polêmicas de arbitragem.'
      },
      {
        title: 'Copa do Brasil Ao Vivo: Corinthians vs São Paulo',
        desc: 'Transmissão em tempo real da eletrizante fase de mata-mata com repórteres de campo exclusivos e pré-jogo detalhado.'
      },
      {
        title: 'Fórmula 1 Ao Vivo: Grande Prêmio de Interlagos',
        desc: 'Toda a emoção dos motores em alta velocidade diretamente do circuito de Interlagos, com treinos qualificatórios e análise tática.'
      },
      {
        title: 'Zorra Esportiva & Arena SBT',
        desc: 'O debate esportivo mais polêmico e bem-humorado das noites, trazendo as novidades do mercado do futebol e os bastidores dos clubes.'
      },
      {
        title: 'Champions League: Real Madrid vs Manchester City',
        desc: 'A maior e mais prestigiada competição de clubes da Europa na tela da sua TV, com as grandes estrelas mundiais brilhando em campo.'
      }
    ];
  } else if (isMovies) {
    programTemplates = [
      {
        title: 'Filme: Superman - O Retorno',
        desc: 'O lendário Homem de Aço retorna à Terra após anos de busca no espaço, encarando a terrível ameaça de seu arqui-inimigo Lex Luthor.'
      },
      {
        title: 'Cine Espetacular: John Wick 3 - Parabellum',
        desc: 'Com uma recompensa milionária por sua cabeça por infringir regras sagradas, o lendário assassino John Wick precisa fugir de Nova York.'
      },
      {
        title: 'Sessão de Gala: Oppenheimer',
        desc: 'A eletrizante e profunda obra de Christopher Nolan contando a trajetória do cientista Robert Oppenheimer no desenvolvimento da bomba atômica.'
      },
      {
        title: 'Tela Quente: Vingadores - Ultimato',
        desc: 'Os heróis sobreviventes da Terra tentam reverter o estalo devastador de Thanos e salvar o universo em uma batalha final sem precedentes.'
      },
      {
        title: 'Temperatura Máxima: Jurassic World - O Reino Ameaçado',
        desc: 'Owen e Claire retornam à ilha Nublar para resgatar os dinossauros de uma erupção vulcânica iminente e desmascarar uma conspiração global.'
      },
      {
        title: 'Cinema Especial: Como Treinar o Seu Dragão 3',
        desc: 'Soluço e Banguela descobrem um destino glorioso e uma nova ameaça que testará os laços de sua amizade de forma inesquecível.'
      }
    ];
  } else if (isSeries) {
    programTemplates = [
      {
        title: 'Série: Todo Mundo Odeia o Chris',
        desc: 'O cotidiano hilário e desafiador de um garoto de 13 anos crescendo no Brooklyn da década de 80, dividindo-se entre a escola pública e sua família excêntrica.'
      },
      {
        title: 'Maratona: Supernatural - Temporada 12, Ep 05',
        desc: 'Os irmãos Dean e Sam Winchester continuam sua cruzada incansável cruzando os Estados Unidos caçando fantasmas, demônios e criaturas míticas.'
      },
      {
        title: 'Série: Grey\'s Anatomy - Temporada 18',
        desc: 'Os dramas pessoais, romances calorosos e as complexas emergências médicas vividas por Meredith Grey e a renomada equipe cirúrgica do hospital.'
      },
      {
        title: 'Maratona: Friends - Temporada 4, Ep 12',
        desc: 'Acompanhe as aventuras, romances e situações cômicas de seis amigos inseparáveis morando em Manhattan.'
      },
      {
        title: 'Série: The Big Bang Theory',
        desc: 'Os brilhantes mas socialmente desajeitados físicos Sheldon e Leonard passam por perrengues hilários ao lidar com o mundo real e a vizinha Penny.'
      },
      {
        title: 'Maratona: Brooklyn Nine-Nine',
        desc: 'A rotina cheia de humor e investigações absurdas de uma delegacia de polícia no Brooklyn liderada pelo imaturo Jake Peralta e o sargento Terry.'
      }
    ];
  } else if (isNews) {
    programTemplates = [
      {
        title: 'Jornal Nacional',
        desc: 'As notícias mais importantes do Brasil e do mundo, reportagens especiais de investigação, economia, política e atualidades com som digital.'
      },
      {
        title: 'Edição das 18h Ao Vivo',
        desc: 'Giro de notícias em tempo real trazendo a cobertura da situação política nas capitais, mercado financeiro e as principais decisões nacionais.'
      },
      {
        title: 'Globo News Em Pauta',
        desc: 'Os temas mais quentes e relevantes do dia debatidos de forma dinâmica e aprofundada por um time renomado de jornalistas e analistas.'
      },
      {
        title: 'Plantão de Notícias 24h',
        desc: 'Resumos jornalísticos instantâneos e boletins urgentes de última hora com repórteres entrando ao vivo direto do local dos fatos.'
      },
      {
        title: 'Debate Político & Análise Econômica',
        desc: 'Especialistas trazem um panorama completo sobre inflação, juros, reformas do governo e as perspectivas do mercado brasileiro.'
      },
      {
        title: 'Jornal da Noite e Panorama Internacional',
        desc: 'O resumo dos acontecimentos mundiais, conflitos geopolíticos e atualizações sobre a economia e mercados asiáticos e europeus.'
      }
    ];
  } else if (isKids) {
    programTemplates = [
      {
        title: 'Desenho: Jovens Titãs em Ação',
        desc: 'Robin, Ravena, Estelar, Mutano e Ciborgue moram juntos na Torre dos Titãs e salvam o dia de forma escandalosa e hilária.'
      },
      {
        title: 'Bob Esponja Calça Quadrada',
        desc: 'As hilárias trapalhadas do cozinheiro mais carismático do Siri Cascudo e seu fiel melhor amigo Patrick Estrela na Fenda do Biquíni.'
      },
      {
        title: 'Miraculous: As Aventuras de Ladybug',
        desc: 'A vida dupla de Marinette, uma estudante comum que se transforma na heroína Ladybug para proteger Paris com seu parceiro Cat Noir.'
      },
      {
        title: 'Turma da Mônica Toy',
        desc: 'Animações minimalistas em 2D super divertidas com Mônica, Cebolinha, Cascão e Magali passando por confusões sem dizer uma palavra.'
      },
      {
        title: 'Desenho: Dragon Ball Super',
        desc: 'Goku e os Guerreiros Z elevam seus poderes ao nível dos deuses para combater inimigos colossais de múltiplos universos.'
      },
      {
        title: 'Peppa Pig e Amigos',
        desc: 'Episódios educativos repletos de descobertas e risadas da porquinha Peppa com seu irmãozinho George e sua querida família.'
      }
    ];
  } else if (isDocs) {
    programTemplates = [
      {
        title: 'Discovery: Sobrevivendo ao Limite',
        desc: 'Especialistas em sobrevivência extrema são deixados isolados nos cantos mais perigosos do mundo e precisam usar o intelecto para sair vivos.'
      },
      {
        title: 'History: Trato Feito',
        desc: 'Visite a famosa loja de penhores Gold & Silver em Las Vegas, onde relíquias históricas incríveis são trazidas para avaliação e negociação.'
      },
      {
        title: 'Alienígenas do Passado',
        desc: 'Teóricos debatem mistérios antigos, monumentos megalíticos e vestígios arqueológicos em busca de pistas sobre visitas extraterrestres à Terra.'
      },
      {
        title: 'Discovery: Febre do Ouro',
        desc: 'Equipes obstinadas apostam tudo na extração de ouro nas implacáveis terras do Alasca, enfrentando falhas mecânicas e o tempo.'
      },
      {
        title: 'National Geographic: Predadores da Noite',
        desc: 'Filmado com tecnologia infravermelha avançada, acompanhe os caçadores mais letais da savana africana agindo no breu da noite.'
      },
      {
        title: 'History: Gigantes da Indústria',
        desc: 'A história incrível dos homens que ergueram a economia americana a patamares globais, inovando nos ramos do aço, ferrovias e petróleo.'
      }
    ];
  } else {
    // Variedades / TV Aberta / Geral (Includes Zorra Total!)
    programTemplates = [
      {
        title: 'Zorra Total - Edição Especial',
        desc: 'O consagrado programa humorístico que diverte gerações com seus esquetes afiados, paródias e o icônico vagão de metrô lotado de personagens.'
      },
      {
        title: 'Novela das Nove: Renascer',
        desc: 'José Inocêncio enfrenta grandes provações em sua fazenda de cacau, in meio a amores perdidos, rivalidades intensas e mistérios folclóricos.'
      },
      {
        title: 'Programa do Ratinho Ao Vivo',
        desc: 'Uma noite recheada de diversão e entretenimento, com o famoso teste de DNA, apresentação de calouros audaciosos e o hilário painel do júri.'
      },
      {
        title: 'The Noite com Danilo Gentili',
        desc: 'O principal talk-show do final de noite traz entrevistas exclusivas, quadros humorísticos inteligentes e irreverência ácida com celebridades.'
      },
      {
        title: 'A Praça É Nossa',
        desc: 'Carlos Alberto de Nóbrega se diverte recebendo em seu famoso banco os tipos mais excêntricos e hilários que contam piadas inesquecíveis.'
      },
      {
        title: 'Mais Você com Ana Maria Braga',
        desc: 'Abra sua manhã com receitas deliciosas de dar água na boca, reportagens de variedades de comportamento e as piadas do simpático Louro Mané.'
      }
    ];
  }

  const result: EpgProgram[] = [];
  const durationsMinutes = [30, 30, 60, 90, 90, 120];

  let currentStart = new Date(baseDate);

  for (let i = 0; i < 6; i++) {
    const dur = durationsMinutes[i];
    const currentEnd = new Date(currentStart.getTime() + dur * 60 * 1000);

    const slotStr = `${formatHHMM(currentStart)} às ${formatHHMM(currentEnd)}`;
    
    // Seed index deterministically using the channel's stream_id and the start hour of the slot
    const slotHour = currentStart.getHours();
    const templateIndex = Math.abs(channel.stream_id + slotHour + i) % programTemplates.length;
    const tmpl = programTemplates[templateIndex];

    let titleStr = tmpl.title;
    let descStr = tmpl.desc;

    // If channel has a valid current_program from the server, use it for the active/first slot
    if (i === 0 && channel.current_program && channel.current_program !== 'Sem Programação Encontrada') {
      titleStr = channel.current_program;
    }

    result.push({
      timeSlot: slotStr,
      title: titleStr,
      description: descStr
    });

    currentStart = currentEnd;
  }

  return result;
}

function getCurrentChannelProgramDisplay(channel: LiveChannel, categories?: Category[]): string {
  if (channel.current_program && channel.current_program !== 'Sem Programação Encontrada') {
    const now = new Date();
    const startM = now.getMinutes() < 30 ? '00' : '30';
    const nextH = now.getMinutes() < 30 ? padZero(now.getHours()) : padZero((now.getHours() + 1) % 24);
    const nextM = now.getMinutes() < 30 ? '30' : '00';
    const timePrefix = `${padZero(now.getHours())}:${startM} às ${nextH}:${nextM}`;
    return `${timePrefix} | ${channel.current_program}`;
  }

  const epgList = generateRealtimeEpg(channel, undefined, categories);
  if (epgList.length > 0) {
    return `${epgList[0].timeSlot} | ${epgList[0].title}`;
  }

  return 'Transmissão Ao Vivo';
}

export const LiveTvSection: React.FC<LiveTvSectionProps> = ({
  categories,
  channels,
  onPlayChannel,
  searchQuery,
  activeServer,
  onBack
}) => {
  // Selection States
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>('all');
  const [categorySearch, setCategorySearch] = useState<string>('');
  const [channelSearch, setChannelSearch] = useState<string>('');
  const [selectedChannel, setSelectedChannel] = useState<LiveChannel | null>(null);
  const [focusedPanel, setFocusedPanel] = useState<'categories' | 'channels'>('categories');

  // EPG Server Sync State
  const [serverEpgList, setServerEpgList] = useState<EpgListingItem[]>([]);
  const [isLoadingEpg, setIsLoadingEpg] = useState<boolean>(false);

  // Player State
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState<boolean>(true);
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [hasError, setHasError] = useState<boolean>(false);
  const [showSearchModal, setShowSearchModal] = useState<boolean>(false);

  // Live Clock for Header
  const [currentTimeStr, setCurrentTimeStr] = useState<string>('');

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const timeOptions: Intl.DateTimeFormatOptions = {
        hour: '2-digit',
        minute: '2-digit',
        hour12: false
      };
      const dateOptions: Intl.DateTimeFormatOptions = {
        month: '2-digit',
        day: '2-digit',
        year: 'numeric'
      };
      setCurrentTimeStr(
        `${now.toLocaleTimeString('pt-BR', timeOptions)}   ${now.toLocaleDateString('pt-BR', dateOptions)}`
      );
    };
    updateTime();
    const timer = setInterval(updateTime, 10000);
    return () => clearInterval(timer);
  }, []);

  // Fetch Server EPG when channel is selected
  useEffect(() => {
    if (!selectedChannel) {
      setServerEpgList([]);
      return;
    }

    let isMounted = true;
    if (activeServer && activeServer.username !== 'demo' && activeServer.username !== 'demo_user_vip') {
      setIsLoadingEpg(true);
      fetchShortEpg(
        activeServer.serverUrl,
        activeServer.username,
        activeServer.password,
        selectedChannel.stream_id
      )
        .then((items) => {
          if (isMounted) {
            setServerEpgList(items);
            setIsLoadingEpg(false);
          }
        })
        .catch(() => {
          if (isMounted) {
            setServerEpgList([]);
            setIsLoadingEpg(false);
          }
        });
    } else {
      setServerEpgList([]);
    }

    return () => {
      isMounted = false;
    };
  }, [selectedChannel, activeServer]);

  // Prepared categories with 'TODOS OS CANAIS' at the top
  const preparedCategories = useMemo(() => {
    const hasAll = categories.some((c) => String(c.category_id) === 'all');
    if (hasAll) return categories;
    return [{ category_id: 'all', category_name: 'TODOS OS CANAIS' }, ...categories];
  }, [categories]);

  // Filter Categories by category search input
  const filteredCategories = useMemo(() => {
    if (!categorySearch.trim()) return preparedCategories;
    return preparedCategories.filter((c) =>
      c.category_name.toLowerCase().includes(categorySearch.toLowerCase())
    );
  }, [preparedCategories, categorySearch]);

  // Count channels per category
  const categoryCounts = useMemo(() => {
    const map: Record<string, number> = { all: channels.length };
    channels.forEach((c) => {
      if (c.category_id !== undefined && c.category_id !== null) {
        const catStr = String(c.category_id);
        map[catStr] = (map[catStr] || 0) + 1;
      }
    });
    return map;
  }, [channels]);

  const [channelDisplayLimit, setChannelDisplayLimit] = useState<number>(60);
  const channelsScrollRef = useRef<HTMLDivElement>(null);

  // Filter Channels by category and search
  const filteredChannels = useMemo(() => {
    return channels.filter((ch) => {
      const categoryMatch =
        selectedCategoryId === 'all' ||
        String(ch.category_id) === String(selectedCategoryId);

      const activeSearch = searchQuery || channelSearch;
      const searchMatch =
        !activeSearch ||
        ch.name.toLowerCase().includes(activeSearch.toLowerCase()) ||
        (ch.current_program &&
          ch.current_program.toLowerCase().includes(activeSearch.toLowerCase()));

      return categoryMatch && searchMatch;
    });
  }, [channels, selectedCategoryId, searchQuery, channelSearch]);

  // Reset pagination when category or search changes
  useEffect(() => {
    setChannelDisplayLimit(60);
    if (channelsScrollRef.current) {
      channelsScrollRef.current.scrollTop = 0;
    }
  }, [selectedCategoryId, searchQuery, channelSearch]);

  const visibleChannels = useMemo(() => {
    return filteredChannels.slice(0, channelDisplayLimit);
  }, [filteredChannels, channelDisplayLimit]);

  const handleChannelsScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const { scrollTop, scrollHeight, clientHeight } = e.currentTarget;
    if (scrollHeight - scrollTop - clientHeight < 400) {
      if (channelDisplayLimit < filteredChannels.length) {
        setChannelDisplayLimit((prev) => Math.min(prev + 60, filteredChannels.length));
      }
    }
  };

  // Auto-select first channel when category or list changes if none selected
  useEffect(() => {
    if (filteredChannels.length > 0) {
      if (!selectedChannel || !filteredChannels.some((c) => c.stream_id === selectedChannel.stream_id)) {
        setSelectedChannel(filteredChannels[0]);
      }
    } else {
      setSelectedChannel(null);
    }
  }, [filteredChannels]);

  // Active index helpers for keyboard/remote navigation
  const activeCategoryIndex = useMemo(() => {
    return filteredCategories.findIndex((c) => c.category_id === selectedCategoryId);
  }, [filteredCategories, selectedCategoryId]);

  const activeChannelIndex = useMemo(() => {
    if (!selectedChannel) return -1;
    return visibleChannels.findIndex((ch) => ch.stream_id === selectedChannel.stream_id);
  }, [visibleChannels, selectedChannel]);

  // Keyboard navigation listener (TV style)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore if user is typing in any input or textarea
      if (
        document.activeElement?.tagName === 'INPUT' ||
        document.activeElement?.tagName === 'TEXTAREA'
      ) {
        return;
      }

      if (e.key === 'ArrowDown') {
        e.preventDefault();
        if (focusedPanel === 'categories') {
          const nextIndex = Math.min(activeCategoryIndex + 1, filteredCategories.length - 1);
          if (nextIndex >= 0 && nextIndex < filteredCategories.length) {
            setSelectedCategoryId(filteredCategories[nextIndex].category_id);
            // Smoothly scroll the target element into view
            setTimeout(() => {
              const btn = document.getElementById(`cat-btn-${filteredCategories[nextIndex].category_id}`);
              btn?.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
            }, 10);
          }
        } else {
          const nextIndex = Math.min(activeChannelIndex + 1, visibleChannels.length - 1);
          if (nextIndex >= 0 && nextIndex < visibleChannels.length) {
            setSelectedChannel(visibleChannels[nextIndex]);
            // Smoothly scroll the target element into view
            setTimeout(() => {
              const card = document.getElementById(`chan-card-${visibleChannels[nextIndex].stream_id}`);
              card?.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
            }, 10);

            // Increment display limit if approaching bottom
            if (nextIndex >= visibleChannels.length - 5) {
              setChannelDisplayLimit((prev) => Math.min(prev + 20, filteredChannels.length));
            }
          }
        }
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        if (focusedPanel === 'categories') {
          const prevIndex = Math.max(activeCategoryIndex - 1, 0);
          if (prevIndex >= 0 && prevIndex < filteredCategories.length) {
            setSelectedCategoryId(filteredCategories[prevIndex].category_id);
            setTimeout(() => {
              const btn = document.getElementById(`cat-btn-${filteredCategories[prevIndex].category_id}`);
              btn?.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
            }, 10);
          }
        } else {
          const prevIndex = Math.max(activeChannelIndex - 1, 0);
          if (prevIndex >= 0 && prevIndex < visibleChannels.length) {
            setSelectedChannel(visibleChannels[prevIndex]);
            setTimeout(() => {
              const card = document.getElementById(`chan-card-${visibleChannels[prevIndex].stream_id}`);
              card?.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
            }, 10);
          }
        }
      } else if (e.key === 'ArrowRight') {
        if (focusedPanel === 'categories' && visibleChannels.length > 0) {
          e.preventDefault();
          setFocusedPanel('channels');
          if (!selectedChannel && visibleChannels[0]) {
            setSelectedChannel(visibleChannels[0]);
          }
        }
      } else if (e.key === 'ArrowLeft') {
        if (focusedPanel === 'channels') {
          e.preventDefault();
          setFocusedPanel('categories');
        }
      } else if (e.key === 'Enter') {
        if (focusedPanel === 'channels' && selectedChannel) {
          e.preventDefault();
          onPlayChannel(selectedChannel);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [
    focusedPanel,
    activeCategoryIndex,
    filteredCategories,
    activeChannelIndex,
    visibleChannels,
    selectedChannel,
    filteredChannels,
    onPlayChannel
  ]);

  // Stream URL calculation
  const streamUrl = useMemo(() => {
    if (!selectedChannel) return '';
    if (activeServer) {
      return buildStreamUrl(
        activeServer.serverUrl,
        activeServer.username,
        activeServer.password,
        selectedChannel.stream_id,
        'm3u8',
        'live',
        selectedChannel.direct_source
      );
    }
    return 'https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8';
  }, [selectedChannel, activeServer]);

  // HLS Video Stream Effect
  useEffect(() => {
    const video = videoRef.current;
    if (!video || !streamUrl) return;

    let hls: Hls | null = null;
    setHasError(false);

    const startPlayback = () => {
      if (!video) return;
      video
        .play()
        .then(() => {
          setIsPlaying(true);
        })
        .catch((e) => {
          console.warn('Autoplay unmuted blocked, falling back to muted autoplay:', e);
          video.muted = true;
          setIsMuted(true);
          video
            .play()
            .then(() => setIsPlaying(true))
            .catch((err) => console.warn('Autoplay failed completely:', err));
        });
    };

    if (Hls.isSupported() && (streamUrl.includes('.m3u8') || streamUrl.includes('/stream?url='))) {
      hls = new Hls({
        enableWorker: true,
        lowLatencyMode: true,
        startFragPrefetch: true,
        testBandwidth: false,
        maxBufferLength: 8,
        maxMaxBufferLength: 16,
        maxBufferSize: 30 * 1024 * 1024,
        maxBufferHole: 0.5,
        liveSyncDurationCount: 2,
        liveMaxLatencyDurationCount: 4,
        manifestLoadingTimeOut: 8000,
        manifestLoadingMaxRetry: 4,
        fragLoadingTimeOut: 8000,
        fragLoadingMaxRetry: 4,
        backBufferLength: 20
      });
      hls.loadSource(streamUrl);
      hls.attachMedia(video);

      hls.on(Hls.Events.MANIFEST_PARSED, () => {
        startPlayback();
      });

      hls.on(Hls.Events.ERROR, (_event, data) => {
        if (data.fatal) {
          switch (data.type) {
            case Hls.ErrorTypes.NETWORK_ERROR:
              console.warn('HLS Network Error, retrying...');
              hls?.startLoad();
              break;
            case Hls.ErrorTypes.MEDIA_ERROR:
              console.warn('HLS Media Error, recovering...');
              hls?.recoverMediaError();
              break;
            default:
              console.error('Fatal HLS Error in Live TV, falling back to native video:', data);
              if (video) {
                video.src = streamUrl;
                startPlayback();
              } else {
                setHasError(true);
              }
              hls?.destroy();
              break;
          }
        }
      });
    } else {
      video.src = streamUrl;
      startPlayback();
    }

    return () => {
      if (hls) hls.destroy();
    };
  }, [streamUrl]);

  const togglePlay = () => {
    if (!videoRef.current) return;
    if (isPlaying) {
      videoRef.current.pause();
      setIsPlaying(false);
    } else {
      videoRef.current.play();
      setIsPlaying(true);
    }
  };

  const toggleMute = () => {
    if (!videoRef.current) return;
    videoRef.current.muted = !isMuted;
    setIsMuted(!isMuted);
  };

  const currentEpgSchedule = useMemo(() => {
    if (!selectedChannel) return [];
    return generateRealtimeEpg(selectedChannel, serverEpgList);
  }, [selectedChannel, serverEpgList]);

  return (
    <div className="h-screen w-full bg-[#050406] text-white flex flex-col select-none font-sans overflow-hidden animate-fade-in">
      {/* HEADER BAR: IPTV SMARTERS PRO | Live */}
      <header className="h-12 sm:h-14 bg-[#090406]/95 backdrop-blur-md border-b border-red-950/80 px-3 sm:px-6 flex items-center justify-between shrink-0 shadow-xl z-20">
        <div className="flex items-center gap-2 sm:gap-3">
          {onBack && (
            <button
              onClick={onBack}
              className="flex items-center gap-1.5 px-2.5 py-1 bg-[#120508] hover:bg-red-950 text-rose-400 hover:text-rose-300 border border-red-900/80 hover:border-red-500 rounded-xl text-xs font-bold transition-all shadow-sm active:scale-95 group cursor-pointer mr-1"
              title="Voltar para a Tela Inicial"
            >
              <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
              <span className="hidden sm:inline">Voltar</span>
            </button>
          )}

          <div className="w-8 h-8 rounded-xl bg-[#120508] border border-red-900/80 flex flex-col items-center justify-center p-0.5 shadow-[0_0_12px_rgba(225,29,72,0.3)]">
            <Tv className="w-4 h-4 text-rose-500" />
          </div>
          <div className="flex items-center gap-1.5 text-sm sm:text-base font-black tracking-tight">
            <span className="text-white">IPTV</span>
            <span className="text-rose-500 tracking-tight">SMARTERS</span>
            <span className="text-[10px] font-black bg-red-950 text-rose-400 px-1.5 py-0.5 rounded border border-red-800/80 uppercase">
              PRO
            </span>
            <span className="text-xs text-gray-400 font-bold ml-1">| Live & EPG</span>
          </div>
        </div>

        {/* Right Header Info: Clock, Search & Menu */}
        <div className="flex items-center gap-3 sm:gap-5 text-xs font-mono font-medium text-gray-200">
          <span className="hidden md:inline-block text-rose-300 tracking-wider font-semibold bg-[#120508] px-3 py-1 rounded-xl border border-red-900/60">
            {currentTimeStr}
          </span>

          <button
            onClick={() => setShowSearchModal(!showSearchModal)}
            className="p-2 bg-[#120508] hover:bg-red-950 text-rose-400 hover:text-rose-300 rounded-xl border border-red-900/60 transition-all cursor-pointer"
            title="Buscar"
          >
            <Search className="w-4 h-4" />
          </button>

          <button
            onClick={onBack}
            className="p-2 bg-[#120508] hover:bg-red-950 text-gray-300 hover:text-rose-400 rounded-xl border border-red-900/60 transition-all cursor-pointer"
            title="Menu de Opções"
          >
            <MoreVertical className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* SEARCH MODAL / QUICK SEARCH BAR */}
      {showSearchModal && (
        <div className="p-3 bg-[#0c0407] border-b border-red-950 flex items-center gap-3 animate-fade-in z-30">
          <Search className="w-4 h-4 text-rose-500 shrink-0" />
          <input
            type="text"
            value={channelSearch}
            onChange={(e) => setChannelSearch(e.target.value)}
            placeholder="Pesquisar canal ou programa por nome..."
            autoFocus
            className="flex-1 bg-[#120508] text-xs text-white placeholder-gray-400 px-3 py-2 rounded-xl border border-red-900/60 focus:outline-none focus:border-red-500 font-medium"
          />
          {channelSearch && (
            <button
              onClick={() => setChannelSearch('')}
              className="p-1 hover:bg-red-950 rounded-lg text-gray-400 hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>
          )}
          <button
            onClick={() => setShowSearchModal(false)}
            className="px-3 py-1.5 bg-red-600 hover:bg-red-500 text-white text-xs font-bold rounded-xl cursor-pointer shadow-sm"
          >
            Fechar
          </button>
        </div>
      )}

      {/* 3-COLUMN LAYOUT MATCHING IPTV SMARTERS IN REDSTREAM COLOR PALETTE */}
      <div className="flex-1 flex flex-col md:flex-row overflow-hidden w-full">
        {/* COLUMN 1: CATEGORIES SIDEBAR (~26% width) */}
        <aside className="w-full md:w-[26%] lg:w-[24%] bg-[#080204] border-r border-red-950 flex flex-col shrink-0 overflow-hidden border-b md:border-b-0 max-h-[220px] md:max-h-none">
          {/* Search Categories Input Box */}
          <div className="p-2.5 bg-[#0a0305] border-b border-red-950">
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-rose-500 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={categorySearch}
                onChange={(e) => setCategorySearch(e.target.value)}
                placeholder="Pesquisar categorias..."
                className="w-full bg-[#120508] text-xs text-white placeholder-gray-400 pl-8 pr-3 py-2 rounded-xl border border-red-900/60 focus:outline-none focus:border-red-500 font-medium"
              />
            </div>
          </div>

          {/* Scrollable Categories List */}
          <div className="flex-1 overflow-y-auto custom-scrollbar py-2">
            {filteredCategories.map((cat) => {
              const isSelected = selectedCategoryId === cat.category_id;
              const count = categoryCounts[cat.category_id] || 0;

              return (
                <motion.button
                  key={cat.category_id}
                  id={`cat-btn-${cat.category_id}`}
                  onClick={() => {
                    setSelectedCategoryId(cat.category_id);
                    setFocusedPanel('categories');
                  }}
                  variants={{
                    initial: { scale: 1, x: 0 },
                    hover: { scale: 1.04, x: 6 },
                    tap: { scale: 0.97 }
                  }}
                  initial="initial"
                  whileHover="hover"
                  whileTap="tap"
                  transition={{ type: 'spring', stiffness: 400, damping: 22 }}
                  className={`relative w-[calc(100%-16px)] mx-2 my-1 px-3.5 py-3 text-left flex items-center justify-between text-xs font-bold uppercase tracking-wide cursor-pointer overflow-hidden rounded-xl border border-transparent transition-all ${
                    isSelected
                      ? 'text-white font-extrabold shadow-[0_6px_20px_rgba(225,29,72,0.35)] border-red-500/30'
                      : 'hover:text-white text-gray-300 hover:bg-[#1c060b] hover:border-red-900/30'
                  } ${
                    focusedPanel === 'categories' && isSelected
                      ? 'ring-2 ring-rose-500 ring-offset-2 ring-offset-[#080204]'
                      : ''
                  }`}
                >
                  {isSelected && (
                    <motion.div
                      layoutId="activeCategoryBg"
                      className="absolute inset-0 bg-gradient-to-r from-red-600 via-rose-600 to-red-700 z-0"
                      transition={{ type: 'spring', stiffness: 380, damping: 28 }}
                      style={{ borderRadius: '12px' }}
                    />
                  )}

                  {/* Premium sweep/sheen light effect */}
                  <motion.div
                    className="absolute inset-0 bg-gradient-to-r from-transparent via-white/25 to-transparent z-10 pointer-events-none"
                    initial={{ x: '-100%', skewX: -20 }}
                    variants={{
                      hover: { x: '100%' }
                    }}
                    transition={{ duration: 0.65, ease: "easeInOut" }}
                  />

                  <span className="relative z-10 truncate pr-2 flex items-center gap-2">
                    <motion.span
                      variants={{
                        hover: { scale: 1.3 }
                      }}
                      transition={{ type: 'spring', stiffness: 300, damping: 15 }}
                      className={`w-1.5 h-1.5 rounded-full shrink-0 transition-colors ${
                        isSelected ? 'bg-white' : 'bg-rose-600'
                      }`}
                    />
                    <span className="truncate">{cat.category_name}</span>
                  </span>
                  
                  <motion.span
                    variants={{
                      hover: { scale: 1.1, color: isSelected ? '#ffffff' : '#f43f5e' }
                    }}
                    className={`relative z-10 font-mono text-xs font-semibold shrink-0 transition-colors ${
                      isSelected ? 'text-white' : 'text-rose-400'
                    }`}
                  >
                    {count}
                  </motion.span>
                </motion.button>
              );
            })}
          </div>
        </aside>

        {/* COLUMN 2: CHANNEL LIST (~32% width) */}
        <div className={`w-full md:w-[34%] lg:w-[32%] bg-[#0c0407] border-r border-red-950 flex flex-col shrink-0 overflow-hidden border-b md:border-b-0 max-h-[260px] md:max-h-none transition-all duration-300 ${
          focusedPanel === 'channels' ? 'bg-[#0f0408]' : ''
        }`}>
          {/* Scrollable Channels List */}
          <div
            ref={channelsScrollRef}
            onScroll={handleChannelsScroll}
            className="flex-1 overflow-y-auto custom-scrollbar py-2"
          >
            {filteredChannels.length === 0 ? (
              <div className="p-8 text-center text-xs text-gray-500 font-medium">
                Nenhum canal nesta categoria.
              </div>
            ) : (
              visibleChannels.map((channel) => {
                const isSelected = selectedChannel?.stream_id === channel.stream_id;
                const programDisplay = getCurrentChannelProgramDisplay(channel, categories);

                return (
                  <motion.div
                    key={channel.stream_id}
                    id={`chan-card-${channel.stream_id}`}
                    onClick={() => {
                      setSelectedChannel(channel);
                      setFocusedPanel('channels');
                    }}
                    onDoubleClick={() => onPlayChannel(channel)}
                    whileHover={{ scale: 1.02, x: 4 }}
                    whileTap={{ scale: 0.98 }}
                    transition={{ type: 'spring', stiffness: 420, damping: 26 }}
                    className={`relative w-[calc(100%-16px)] mx-2 my-1 p-2.5 flex items-center gap-3 cursor-pointer overflow-hidden rounded-xl border border-transparent transition-all group ${
                      isSelected
                        ? 'text-white font-bold shadow-[0_4px_12px_rgba(225,29,72,0.15)]'
                        : 'text-gray-200 hover:bg-[#15070a]/60'
                    } ${
                      focusedPanel === 'channels' && isSelected
                        ? 'ring-2 ring-rose-500 ring-offset-2 ring-offset-[#0c0407]'
                        : ''
                    }`}
                  >
                    {isSelected && (
                      <motion.div
                        layoutId="activeChannelBg"
                        className="absolute inset-0 bg-gradient-to-r from-red-950/80 via-red-900/40 to-[#120508]/80 border-l-4 border-rose-500 z-0"
                        transition={{ type: 'spring', stiffness: 380, damping: 28 }}
                        style={{ borderRadius: '12px' }}
                      />
                    )}

                    {/* Channel Logo Square */}
                    <div
                      className={`relative z-10 w-10 h-10 rounded-xl bg-[#060204] border shrink-0 p-1 flex items-center justify-center overflow-hidden transition-colors ${
                        isSelected ? 'border-rose-500' : 'border-red-950 group-hover:border-red-900'
                      }`}
                    >
                      {channel.stream_icon && channel.stream_icon.trim() ? (
                        <img
                          src={channel.stream_icon || null}
                          alt={channel.name}
                          referrerPolicy="no-referrer"
                          className="w-full h-full object-contain"
                          onError={(e) => {
                            (e.target as HTMLElement).style.display = 'none';
                          }}
                        />
                      ) : (
                        <Tv className="w-5 h-5 text-rose-500" />
                      )}
                    </div>

                    {/* Titles */}
                    <div className="relative z-10 flex-1 min-w-0">
                      <h4
                        className={`font-bold text-xs truncate transition-colors ${
                          isSelected ? 'text-white font-extrabold' : 'text-gray-100 group-hover:text-rose-400'
                        }`}
                      >
                        {channel.name}
                      </h4>
                      <p
                        className={`text-[11px] mt-0.5 font-medium flex items-start gap-1.5 transition-colors ${
                          isSelected ? 'text-rose-200 font-semibold break-words whitespace-normal' : 'text-gray-400 truncate group-hover:text-gray-300'
                        }`}
                      >
                        <Clock className="w-3.5 h-3.5 text-rose-500 shrink-0 mt-0.5" />
                        <span>{programDisplay}</span>
                      </p>
                    </div>
                  </motion.div>
                );
              })
            )}
          </div>
        </div>

        {/* COLUMN 3: EMBEDDED PLAYER & EPG GUIDE (~42% width) */}
        <main className="flex-1 bg-[#050406] flex flex-col overflow-hidden h-full">
          {selectedChannel ? (
            <div className="flex-1 flex flex-col h-full overflow-hidden">
              {/* TOP: LIVE VIDEO PREVIEW WINDOW */}
              <div className="relative w-full aspect-video md:aspect-[16/9] lg:h-[48%] bg-black shrink-0 border-b border-red-950 flex items-center justify-center overflow-hidden group">
                <video
                  ref={videoRef}
                  preload="auto"
                  playsInline
                  className="w-full h-full object-contain cursor-pointer"
                  onClick={togglePlay}
                />

                {/* Error Fallback */}
                {hasError && (
                  <div className="absolute inset-0 bg-black/90 flex flex-col items-center justify-center p-4 text-center z-10">
                    <AlertCircle className="w-9 h-9 text-rose-500 mb-2" />
                    <p className="text-xs text-gray-300 font-bold max-w-xs">
                      Erro ao carregar a transmissão ao vivo deste canal.
                    </p>
                    <button
                      onClick={() => {
                        setHasError(false);
                        if (videoRef.current) videoRef.current.load();
                      }}
                      className="mt-3 px-3 py-1.5 bg-red-600 hover:bg-red-500 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer"
                    >
                      <RotateCcw className="w-3.5 h-3.5" /> Recarregar
                    </button>
                  </div>
                )}

                {/* Video Controls Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/40 opacity-0 group-hover:opacity-100 transition-opacity p-3 flex flex-col justify-between z-10 pointer-events-none">
                  {/* Top Badge */}
                  <div className="flex items-center justify-between pointer-events-auto">
                    <div className="px-2.5 py-1 bg-black/80 backdrop-blur-md rounded-xl border border-red-900/60 text-[11px] font-bold text-white flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
                      <span className="truncate max-w-[200px]">{selectedChannel.name}</span>
                    </div>

                    <button
                      onClick={() => onPlayChannel(selectedChannel)}
                      className="p-1.5 bg-black/80 hover:bg-red-950 text-rose-400 hover:text-white rounded-xl border border-red-900/60 text-xs font-bold transition-all flex items-center gap-1 cursor-pointer"
                      title="Abrir em Tela Cheia"
                    >
                      <Maximize className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {/* Bottom Controls */}
                  <div className="flex items-center justify-between pointer-events-auto">
                    <button
                      onClick={togglePlay}
                      className="p-2 bg-red-600 hover:bg-red-500 text-white rounded-xl transition-colors cursor-pointer shadow-md"
                    >
                      {isPlaying ? (
                        <Pause className="w-4 h-4" />
                      ) : (
                        <Play className="w-4 h-4 fill-white ml-0.5" />
                      )}
                    </button>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={toggleMute}
                        className="p-2 bg-black/80 hover:bg-red-950 text-gray-300 hover:text-white rounded-xl border border-red-900/60 cursor-pointer"
                      >
                        {isMuted ? (
                          <VolumeX className="w-4 h-4 text-rose-400" />
                        ) : (
                          <Volume2 className="w-4 h-4 text-rose-400" />
                        )}
                      </button>

                      <button
                        onClick={() => onPlayChannel(selectedChannel)}
                        className="px-3 py-1.5 bg-gradient-to-r from-red-600 to-rose-700 hover:from-red-500 hover:to-rose-600 text-white text-xs font-bold rounded-xl shadow-[0_0_15px_rgba(225,29,72,0.4)] transition-all flex items-center gap-1 cursor-pointer"
                      >
                        <Maximize className="w-3.5 h-3.5" /> Tela Cheia
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* BOTTOM: EPG PROGRAM GUIDE SCHEDULE */}
              <div className="flex-1 bg-[#0a0305] p-3.5 overflow-y-auto custom-scrollbar flex flex-col gap-3.5 divide-y divide-red-950/80">
                <div className="flex items-center justify-between pb-1">
                  <div className="flex items-center gap-2 text-xs font-bold text-rose-400">
                    <Clock className="w-3.5 h-3.5" />
                    <span>Grade EPG Sincronizada em Tempo Real</span>
                  </div>
                  {isLoadingEpg && (
                    <div className="flex items-center gap-1.5 text-[11px] text-gray-400 font-medium">
                      <Loader2 className="w-3 h-3 animate-spin text-rose-500" />
                      <span>Sincronizando guia...</span>
                    </div>
                  )}
                </div>

                {currentEpgSchedule.map((prog, idx) => (
                  <div key={idx} className="pt-2.5 first:pt-0">
                    <div className="text-rose-400 font-mono text-xs font-bold mb-0.5 flex items-center gap-2">
                      <span>{prog.timeSlot}</span>
                      {idx === 0 && (
                        <span className="px-1.5 py-0.2 bg-rose-600/90 text-white text-[9px] font-black uppercase rounded tracking-wider animate-pulse">
                          No Ar Agora
                        </span>
                      )}
                    </div>
                    <h3 className="text-xs sm:text-sm font-bold text-white tracking-wide">
                      {prog.title}
                    </h3>
                    <p className="text-xs text-gray-300 leading-relaxed mt-0.5 font-normal">
                      {prog.description}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-center p-8 text-gray-500">
              <Radio className="w-12 h-12 text-rose-900 mb-3" />
              <p className="text-xs font-bold text-gray-400">
                Selecione um canal da lista para assistir ao vivo.
              </p>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};
