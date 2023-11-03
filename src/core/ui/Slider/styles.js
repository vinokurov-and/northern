import styled from "@emotion/styled";

export const SliderRoot = styled.div`
  position: relative; // добавлено для позиционирования иконки
  height: 100vh;
  background-image: url("https://www.datocms-assets.com/47837/1666304231-fcsever-edited.png");
  background-size: cover;
  background-repeat: no-repeat;
  background-position: center;
`;
export const ScrollDownIconContainer = styled('div')`
  position: absolute;
  bottom: 10px;
  left: 50%;
  transform: translateX(-50%);
  cursor: pointer;
  animation: bounce 1s infinite;

  svg {
    color: white; 
    text-shadow: 0 0 10px rgba(0, 0, 0, 0.5);
    font-size: 8rem; // увеличиваем размер иконки
  }

  @keyframes bounce {
    0%, 20%, 50%, 80%, 100% {
      transform: translateY(0);
    }
    40% {
      transform: translateY(-10px);
    }
    60% {
      transform: translateY(-5px);
    }
  }
`;