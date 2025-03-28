import { useTheme, Button, Stack, useMediaQuery } from "@mui/material"
import { useRouter } from "next/navigation";
import Img from "next/image";
import Link from "next/link";
import { S_0, S_600 } from "../../breakpoints";

import { Swiper, SwiperSlide } from 'swiper/react';

// Import Swiper styles
import 'swiper/css';
import 'swiper/css/grid';
import 'swiper/css/navigation';

import { Grid, Navigation } from 'swiper/modules';



export const Players = ({ data }) => {
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.between(S_0, S_600));

    const router = useRouter();

    const handleClick = () => {
        router.push('/players')
    }

    return <Stack style={{
        padding: isMobile ? '0 20px' : '0 60px'
    }}>
        <Stack direction='row' style={{ margin: isMobile ? '0 0 36px' : '0 0 50px' }} justifyContent={isMobile ? 'space-between' : 'left'} alignItems='center' gap='20px'>
            <h2 style={{
                color: '#0F115F',
                fontSize: isMobile ? '30px' : '68px',
                fontWeight: '700',
                lineHeight: '90%',
                textAlign: 'left',
                textTransform: 'uppercase',
            }}>
                Игроки
            </h2>
            <Stack>
                <Button variant="contained" size="small" onClick={handleClick}>Все игроки</Button>
            </Stack>
        </Stack>
        <Stack>
            <Swiper
                navigation
                slidesPerView={isMobile ? 1 : 3}
                grid={{
                    rows: 2,
                }}
                spaceBetween={20}
                pagination={{
                    clickable: true,
                }}
                modules={[Grid, Navigation]}
                className="mySwiper"
            >
                {data.map((player) => {
                    return <SwiperSlide>
                        <figure style={{width: '100%', height: '100%'}}>
                            {(Boolean(player.coverImage?.url) || Boolean(player.image)) && <Link href={`/players/${player.slug || player.id}`} className="card__image">
                                <Img objectFit="cover" style={{ position: 'relative', width: '100%', height: 'auto', objectFit: 'cover', maxHeight: 200 }} width={200} height={200} src={player.coverImage?.url || player.image} />
                            </Link>}
                            <figcaption className="card__caption">
                                <h6 className="card__title">
                                    <Link href={`/players/${player.slug || player.id}`}>{player.title}</Link>
                                </h6>
                                <div className="card__description">
                                    <p>{player.excerpt || player.description?.split('\n').map(item=> <>{item}<br /></>)}</p>
                                </div>
                            </figcaption>
                        </figure>
                    </SwiperSlide>
                })}
            </Swiper>
        </Stack>
        {/* <Stack direction={isMobile ? 'column' : 'row'} style={{ margin: isMobile ? '0' : '0 0 0 -40px' }}> */}
        {/* {data.slice(0, isMobile ? 4 : 3).map((player) => {
                return (
                    <div key={player.id} className="showcase__item">
                        <figure className="card">
                            {(Boolean(player.coverImage?.url) || Boolean(player.image)) && <Link href={`/players/${player.slug || player.id}`} className="card__image">
                                <Img style={{ position: 'relative', width: '100%', height: 'auto' }} width={200} height={200} src={player.coverImage?.url || player.image} />
                            </Link>}
                            <figcaption className="card__caption">
                                <h6 className="card__title">
                                    <Link href={`/players/${player.slug || player.id}`}>{player.title}</Link>
                                </h6>
                                <div className="card__description">
                                    <p>{player.excerpt || player.description}</p>
                                </div>
                            </figcaption>
                        </figure>
                    </div>
                )
            })} */}
        {/* </Stack> */}
    </Stack>
}