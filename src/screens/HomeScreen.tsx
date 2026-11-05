import { Gamepad2, LogIn, Play, Settings } from 'lucide-react';
import ButtonLink from '@/components/ButtonLink';

export default function HomeScreen() {
  return (
    <div className="flex flex-1 flex-col justify-between gap-10 py-8">
      <div className="flex flex-1 flex-col items-center justify-center text-center">
        <div className="flex h-24 w-24 items-center justify-center rounded-[2rem] bg-primary text-primary-foreground shadow-xl shadow-primary/20">
          <Gamepad2 className="h-12 w-12" strokeWidth={1.75} aria-hidden="true" />
        </div>
        <h1 className="mt-8 text-4xl font-bold tracking-tight">Sancadia</h1>
        <p className="mt-2 text-lg font-medium text-subtle">Board games you love</p>
      </div>
      <div className="grid gap-3">
        <ButtonLink to="/games" className="h-14 text-lg">
          <Play className="h-5 w-5 fill-current" aria-hidden="true" />
          Play
        </ButtonLink>
        <ButtonLink to="/settings" variant="secondary">
          <Settings className="h-5 w-5" aria-hidden="true" />
          Settings
        </ButtonLink>
        <ButtonLink to="/login" variant="secondary">
          <LogIn className="h-5 w-5" aria-hidden="true" />
          Log in / Sign up
        </ButtonLink>
      </div>
    </div>
  );
}
