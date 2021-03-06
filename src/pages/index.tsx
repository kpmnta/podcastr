import Image from 'next/image';
import Link from 'next/link'
import Head from 'next/head'
import { GetStaticProps } from 'next';

import { format, parseISO } from 'date-fns';
import ptBR from 'date-fns/locale/pt-BR';
import { Media, MediaContextProvider } from "../media"

import { convertDurationToTimeString } from '../utils/convertDurationToTimeString';
import { usePlayer } from '../contexts/PlayerContext';
import { api } from '../services/api';
import styles from './home.module.scss';

type Episode = {
  id: string;
  title: string;
  thumbnail: string;
  members: string;
  duration: number;
  durationAsString: string;
  url: string;
  publishedAt: string;
}

type HomeProps = {
  latestEpisodes: Episode[];
  allEpisodes: Episode[];
}

export default function Home({ allEpisodes, latestEpisodes } : HomeProps) {
  const { playList } = usePlayer();
  const episodeList = [ ...latestEpisodes, ...allEpisodes ];

  return (
    <MediaContextProvider>
      <div className={ styles.homepage }>
        <Head>
          <title> Home | Podcastr </title>
        </Head>
        <section className={ styles.latestEpisodes }>
          <h2>Últimos Lançamentos</h2>
          <ul>
            { latestEpisodes.map(( episode, index ) => {
              return (
                <li key={ episode.id }>
                  <div className={ styles.imageThumb }>
                    <Image 
                      width={192} 
                      height={192} 
                      objectFit="cover"
                      src={ episode.thumbnail } 
                      alt={ episode.title }
                    />
                  </div>
                  <div className={ styles.episodeDetails }>
                    <Link href={`/episodes/${ episode.id }`}>
                      <a> { episode.title } </a>
                    </Link>
                    <p> { episode.members } </p>
                    <span> { episode.publishedAt } </span>
                    <span> { episode.durationAsString } </span>
                  </div>
                  <button 
                    type="button" 
                    onClick={() => playList( episodeList, index )}
                  >
                    <img src="/play-green.svg" alt="Tocar episódio"/>
                  </button>
                </li>
              )
            })}
          </ul>
        </section>
        <section className={ styles.allEpisodes }>
            <h2>Todos os episódios</h2> 
            <Media lessThan="sm">
              <div className={styles.episodesMobile}>
                {allEpisodes.map(( episode, index ) => {
                    return (
                      <div className={styles.containerMobile}>
                        <div className={styles.button}>
                          <button 
                            type="button"
                            onClick={() => playList( episodeList, index + latestEpisodes.length )}
                          >
                            <img src="/play-green.svg" alt="Tocar episódio"/>
                          </button>
                        </div>
                        <div className={styles.containerContent}>
                          <div className={styles.titleMobile}>
                            <Link href={`/episodes/${ episode.id }`} >
                              <a>{ episode.title }</a>
                            </Link>
                          </div>
                          <p>{ episode.members }</p>
                          <div className={styles.contentMobile}>
                            <span>{ episode.publishedAt }</span>
                            <span>{ episode.durationAsString }</span>
                          </div>
                        </div>
                      </div>
                    )
                  })}
              </div>
            </Media>
            <Media greaterThanOrEqual="sm">
              <table cellSpacing={0}>
                <thead>
                  <tr>
                    <th></th>
                    <th>Podcast</th>
                    <th>Integrantes</th>
                    <th>Data</th>
                    <th>Duração</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {allEpisodes.map(( episode, index ) => {
                    return (
                      <tr key={ episode.id }>
                        <td style={{ width: 72 }}>
                          <Image 
                            width={120}
                            height={120}
                            src={episode.thumbnail}
                            alt={episode.title}
                            objectFit="cover"
                          />
                        </td>
                        <td>
                          <Link href={`/episodes/${ episode.id }`} >
                            <a>{ episode.title }</a>
                          </Link>
                        </td>
                        <td>{ episode.members }</td>
                        <td style={{ width: 100 }}>{ episode.publishedAt }</td>
                        <td>{ episode.durationAsString }</td>
                        <td>
                          <button 
                            type="button"
                            onClick={() => playList( episodeList, index + latestEpisodes.length )}
                          >
                            <img src="/play-green.svg" alt="Tocar episódio"/>
                          </button>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </Media>
        </section>
      </div>
    </MediaContextProvider>  
  )
}

export const getStaticProps: GetStaticProps = async () => {
  const { data } = await api.get('episodes/', {
      params: {
        _limit: 12,
        _sort: 'published_at',
        _order: 'desc'
      }
  })

  const episodes = data.map(episode => {
    return {
      id: episode.id,
      title: episode.title,
      thumbnail: episode.thumbnail,
      members: episode.members,
      publishedAt: format(parseISO(episode.published_at), 'd MMM yy', { locale: ptBR }),
      duration: Number(episode.file.duration), 
      durationAsString: convertDurationToTimeString(Number(episode.file.duration)),
      url: episode.file.url,
    };
  })

  const latestEpisodes = episodes.slice(0, 2);
  const allEpisodes = episodes.slice(2, episodes.length);

  return {
    props: {
      latestEpisodes,
      allEpisodes,
    },
    revalidate: 60 * 60 * 8,
  }
}
