import { useTheme, Button, Stack, useMediaQuery } from "@mui/material"
import Img from "next/image";
import Link from "next/link";
import { S_0, S_600 } from "../../breakpoints";
import { useRouter } from "next/navigation";

export const News = ({ works }) => {
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.between(S_0, S_600));

    const router = useRouter();

    const handleClick = () => {
        router.push('/news')
    }

    return <Stack style={{
        padding: isMobile ? '0 20px' : '0 60px'
    }}>
        <Stack direction='row' style={{ margin: isMobile ? '26px 0 36px' : '40px 0 50px' }} justifyContent={isMobile ? 'space-between' : 'left'} alignItems='center' gap='20px'>
            <h2 style={{
                color: '#0F115F',
                fontSize: isMobile ? '30px' : '68px',
                fontWeight: '700',
                lineHeight: '90%',
                textAlign: 'left',
                textTransform: 'uppercase',
            }}>
                Новости
            </h2>
            <Stack>
                <Button variant="contained" size="small" onClick={handleClick}>Все новости</Button>
            </Stack>
        </Stack>
        <Stack direction={isMobile ? 'column' : 'row'} style={{ margin: isMobile ? '0' : '0 0 0 -40px' }}>
            {works.slice(0, isMobile ? 4 : 3).map((work) => {
                return (
                    <div key={work.id} className="showcase__item">
                        <figure className="card">
                            {(Boolean(work.coverImage?.url) || Boolean(work.image)) && <Link href={`/works/${work.slug || work.id}`} className="card__image">
                                <Img style={{ position: 'relative', width: '100%', height: 'auto' }} width={200} height={200} src={work.coverImage?.url || work.image} />
                            </Link>}
                            <figcaption className="card__caption">
                                <h6 className="card__title">
                                    <Link href={`/works/${work.slug || work.id}`}>{work.title}</Link>
                                </h6>
                                <div className="card__description">
                                    <p>{work.excerpt || work.description}</p>
                                </div>
                            </figcaption>
                        </figure>
                    </div>
                )
            })}
        </Stack>
    </Stack>
}