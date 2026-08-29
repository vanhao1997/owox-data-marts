import logoMark from '../../assets/logo-mark.png';

interface LogoProps {
  width?: number;
  height?: number;
  className?: string;
}

export const Logo = ({ width = 45, height = 36, className = '' }: LogoProps) => {
  return (
    <img src={logoMark} alt='P2PDigital Logo' width={width} height={height} className={className} />
  );
};
