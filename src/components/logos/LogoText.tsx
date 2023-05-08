import Image from 'next/image';

import image from 'public/images/logo.png';

export const LogoText: React.FC<{ className: string }> = (props) => (
  <div className="flex items-center gap-4">
    <Image src={image} alt="Railtrack logo with text" {...props} />
    <p className="text-lg font-bold">Point B</p>
  </div>
);
