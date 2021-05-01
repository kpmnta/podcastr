import Image from 'next/image';
import { useRef, useEffect, useState } from 'react';
import { usePlayer } from '../../contexts/PlayerContext';
import Slider from 'rc-slider';

import 'rc-slider/assets/index.css';
import styles from './styles.module.scss';
import { convertDurationToTimeString } from '../../utils/convertDurationToTimeString';

export function Player() {
    const audioRef = useRef<HTMLAudioElement>(null);
    const [ progress, setProgress ] = useState(0);

    const { 
        episodeList,
        currentEpisodeIndex,
        isPlaying,
        isLooping,
        isShuffling,
        toggleShuffle,
        togglePlay,
        toggleLoop,
        setPlayingState,
        playNext,
        playPrevious,
        hasNext,
        hasPrevious,
        clearPlayerState,
    } = usePlayer();

    useEffect(() => {
        if (!audioRef.current) {
            return;
        }
        if (isPlaying) {
            audioRef.current.play();
        } else {
            audioRef.current.pause();
        }
    }, [isPlaying])

    function setupProgressListener() {
        audioRef.current.currentTime = 0;
        audioRef.current.addEventListener('timeupdate', () => {
            setProgress(Math.floor(audioRef.current.currentTime));
        })
    }

    function handleEpisodeEnded() {
        if (hasNext) {
            playNext()
        } else {
            clearPlayerState()
        }
    }

    function handleSeek(amount: number) {
        audioRef.current.currentTime = amount;
        setProgress(amount)
    }

    const episode = episodeList[currentEpisodeIndex]

    return(
        <div className={styles.playerContainer}>
            <header>
                <img src="/playing.svg" alt="Tocando agora"/>
                <strong>Tocando agora</strong>
            </header>
          
            {
                episode ? (
                    <div className={styles.currentEpisode}> 
                    {

                    }    
                        <div className={styles.imgWrapper}>    
                            <Image 
                                width={225}
                                height={225}
                                src={episode.thumbnail}
                                objectFit="cover"
                            />   
                        </div> 
                        <strong>{ episode.title }</strong>
                        <span>{ episode.members }</span>
                    </div>
                ) : (
                    <div className={styles.emptyPlayer }>
                        <strong>Selecione um podcast para ouvir</strong>
                    </div>
                )
            }

            <footer className={!episode ? styles.empty : ''}>
                <div className={styles.progress}>
                    <span>{ convertDurationToTimeString(progress) }</span>
                    <div className={styles.slider}>
                        {
                            episode ? (
                                <Slider 
                                    max={episode.duration}
                                    value={progress}
                                    onChange={handleSeek}
                                    trackStyle={{ backgroundColor: '#04d361'}}
                                    railStyle={{ backgroundColor: '#9f75ff'}}
                                    handleStyle={{ borderColor: '#04d361'}}
                                />
                            ) : (
                                <div className={styles.emptySlider} />
                            )
                        }
                    </div>
                    <span>{ convertDurationToTimeString(episode?.duration ?? 0) }</span>
                </div>

                { episode && (
                    <audio 
                        src={episode.url}
                        ref={audioRef} 
                        autoPlay
                        onEnded={handleEpisodeEnded}
                        onPlay={() => setPlayingState(true)}
                        onPause={() => setPlayingState(false)}
                        loop={isLooping}
                        onLoadedMetadata={setupProgressListener}
                    />
                )}

                <div className={styles.buttons}>
                    <button 
                        type="button" 
                        disabled={ !episode || episodeList.length === 1 } 
                        onClick={ toggleShuffle }
                        className={ isShuffling? styles.isActive : '' }
                    >
                        <img src="/shuffle.svg" alt="embaralhar episódios"/>
                    </button>
                    <button 
                        type="button"
                        disabled={ !episode || !hasPrevious } 
                        onClick={playPrevious}
                    >
                        <img src="/play-previous.svg" alt="tocar episódio anterior"/>
                    </button>
                    <button 
                        type="button" 
                        className={styles.playButton}  
                        disabled={!episode} 
                        onClick={togglePlay}
                    >
                        {
                            isPlaying 
                            ? <img src="/pause.svg" alt="tocar episódio" />
                            : <img src="/play.svg" alt="tocar episódio" />
                        }
                    </button>
                    <button 
                        type="button" 
                        disabled={ !episode || !hasNext } 
                        onClick={playNext}
                    >
                        <img src="/play-next.svg" alt="tocar próximo episódio"/>
                    </button>
                    <button 
                        type="button" 
                        disabled={!episode} 
                        onClick={toggleLoop}
                        className={ isLooping ? styles.isActive : '' }
                    >
                        <img src="/repeat.svg" alt="repetir episódio"/>
                    </button>
                </div>
            </footer>
        </div>
    );
}