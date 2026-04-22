interface OWOXBIIconProps {
  className?: string;
  size?: number;
}

export const OWOXBIIcon = ({ className, size = 24 }: OWOXBIIconProps) => {
  return (
    <img
      src='/logo.png'
      width={size}
      height={size}
      className={className}
      alt='P2P Digital Logo'
    />
  );
};
