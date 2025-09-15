/** @format */

import { Button } from '@/components/ui/button';

interface HeaderProps {
  onButtonClick?: () => void;
  buttonText?: string;
}

export function Header({ onButtonClick, buttonText = 'Connect' }: HeaderProps) {
  return (
    <header className='fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 py-4'>
      <div className='text-white font-mono text-lg'>[ networks ]</div>
      <Button onClick={onButtonClick} variant='secondary' size='default' className='rounded-full'>
        {buttonText}
      </Button>
    </header>
  );
}
