interface OWOXBIIconProps {
  className?: string;
  size?: number;
}

export const OWOXBIIcon = ({ className, size = 24 }: OWOXBIIconProps) => {
  return (
    <img
      src='/favicon.svg'
      width={size}
      height={size}
      className={className}
      alt='P2P Digital Logo'
    />
  );
};
