import { Swiper, SwiperSlide } from 'swiper/react'
import { Navigation } from 'swiper/modules'
import 'swiper/css'
import 'swiper/css/navigation'

export const ImageSlider = ({ images = [], alt = '' }) => {
    if (!images || images.length === 0) return null

    return (
        <Swiper
            modules={[Navigation]}
            navigation
            loop={images.length > 2}
            slidesPerView={2}
            spaceBetween={10}
            breakpoints={{
                0: { slidesPerView: 1 },
                600: { slidesPerView: 2 },
            }}
        >
            {images.map((src, idx) => (
                <SwiperSlide key={src || idx}>
                    <img
                        alt={alt}
                        src={src}
                        style={{ width: '100%', height: 'auto', borderRadius: 8 }}
                    />
                </SwiperSlide>
            ))}
        </Swiper>
    )
}
