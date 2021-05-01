import format from 'date-fns/format';
import ptBR from 'date-fns/locale/pt-BR';
import Link from 'next/link';
import React from 'react';

import styles from './styles.module.scss';

export function Header() {
    const currentDate = format(new Date(), 'EEEEEE, d MMMM', {
        locale: ptBR,
    });

    return(
        <header className={styles.headerContainer}>
            <Link href="/">
                <img src="/logo.svg" alt="logo podcastr" />
            </Link>
            <div className={styles.content}>
                <p>O melhor para você ouvir, sempre</p>
                <span>{currentDate}</span>
            </div>
        </header>
    )
}