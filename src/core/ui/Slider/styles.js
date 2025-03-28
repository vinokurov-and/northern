import styled from "@emotion/styled";
import { Typography } from "@mui/material";

export const SliderRoot = styled.div`
  position: relative;
  height: 100vh;
  width: 100%;
  overflow: hidden;
  background-color: #1a1a1a;
`;

export const Overlay = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(
    to bottom,
    rgba(0, 0, 0, 0.4) 0%,
    rgba(0, 0, 0, 0.6) 100%
  );
  backdrop-filter: blur(1px);
  z-index: 1;
`;

export const ContentWrapper = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  z-index: 2;
`;

export const TextContainer = styled.div`
  text-align: center;
  padding: 0 20px;
`;

export const GradientText = styled(Typography)`
  font-size: 4.5rem;
  font-weight: 700;
  background: linear-gradient(135deg, #ffffff 0%, #a3a3a3 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  text-shadow: 0 2px 10px rgba(255, 255, 255, 0.3);
  margin-bottom: 1rem;
  letter-spacing: -1px;

  @media (max-width: 600px) {
    font-size: 3rem;
  }
`;

export const ScrollDownIconContainer = styled.div`
  position: absolute;
  bottom: 40px;
  left: 50%;
  transform: translateX(-50%);
  cursor: pointer;
  z-index: 10;
  transition: all 0.3s ease;

  &:hover {
    transform: translateX(-50%) translateY(-5px);
  }

  svg {
    color: white;
    font-size: 4rem;
    filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.3));
  }

  @keyframes bounce {
    0%, 20%, 50%, 80%, 100% {
      transform: translateY(0) translateX(-50%);
    }
    40% {
      transform: translateY(-10px) translateX(-50%);
    }
    60% {
      transform: translateY(-5px) translateX(-50%);
    }
  }

  animation: bounce 2s infinite;
`;