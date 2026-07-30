export interface XtreamServerCredentials {
  id: string;
  name: string;
  serverUrl: string;
  username: string;
  password: string;
  lastConnected?: string;
}

export interface UserInfo {
  username: string;
  password: string;
  status: string;
  exp_date: string;
  is_trial: string;
  active_cons: string;
  created_at: string;
  max_connections: string;
  allowed_output_formats: string[];
  message?: string;
  auth?: number;
}

export interface ServerInfo {
  url: string;
  port: string;
  https_port: string;
  server_protocol: string;
  rtmp_port: string;
  timezone: string;
  timestamp_now: number;
  time_now: string;
}

export interface XtreamAuthResponse {
  user_info: UserInfo;
  server_info: ServerInfo;
}

export interface Category {
  category_id: string;
  category_name: string;
  parent_id?: number;
}

export interface LiveChannel {
  num?: number;
  name: string;
  stream_type?: string;
  stream_id: number;
  stream_icon?: string;
  epg_channel_id?: string;
  added?: string;
  category_id?: string;
  custom_sid?: string;
  tv_archive?: number;
  direct_source?: string;
  tv_archive_duration?: number;
  quality?: '4K' | 'FHD' | 'HD' | 'SD';
  current_program?: string;
}

export interface MovieStream {
  num: number;
  name: string;
  stream_type: string;
  stream_id: number;
  stream_icon: string;
  rating: string | number;
  rating_5based: number;
  added: string;
  category_id: string;
  container_extension: string;
  custom_sid: string;
  direct_source: string;
  year?: string;
  genre?: string;
  duration?: string;
  plot?: string;
}

export interface SeriesStream {
  num: number;
  name: string;
  series_id: number;
  cover: string;
  plot: string;
  cast: string;
  director: string;
  genre: string;
  releaseDate: string;
  release_date?: string;
  last_modified: string;
  rating: string;
  rating_5based: number;
  category_id: string;
  backdrop_path?: string[];
  youtube_trailer?: string;
  seasonsCount?: number;
}

export interface Episode {
  id: string | number;
  episode_num: number;
  title: string;
  container_extension: string;
  info: {
    duration_secs?: number;
    duration?: string;
    movie_image?: string;
    plot?: string;
    releasedate?: string;
    rating?: number | string;
  };
  season: number;
  stream_url?: string;
}

export interface SeriesInfoResponse {
  seasons: Array<{
    air_date: string;
    episode_count: number;
    id: number;
    name: string;
    overview: string;
    season_number: number;
    cover: string;
    cover_big: string;
  }>;
  info: {
    name: string;
    cover: string;
    plot: string;
    cast: string;
    director: string;
    genre: string;
    releaseDate: string;
    rating: string;
  };
  episodes: Record<string, Episode[]>; // Season number as key, array of episodes
}

export interface BrasileiraoTeam {
  position: number;
  name: string;
  shortName: string;
  logo: string;
  points: number;
  played: number;
  won: number;
  drawn: number;
  lost: number;
  goalsFor: number;
  goalsAgainst: number;
  goalDifference: number;
  form: Array<'W' | 'D' | 'L'>;
}

export interface MatchOfDay {
  id: string;
  homeTeam: string;
  homeLogo: string;
  awayTeam: string;
  awayLogo: string;
  time: string;
  competition: string;
  status: 'Ao Vivo' | 'Encerrado' | 'Em Breve';
  homeScore?: number;
  awayScore?: number;
  channelName: string;
  matchedChannelId?: number;
  matchedChannelUrl?: string;
}

export type ActiveScreen = 'login' | 'home' | 'sports' | 'live' | 'movies' | 'series';
