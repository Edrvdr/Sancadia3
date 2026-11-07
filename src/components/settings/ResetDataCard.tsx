import { useState } from 'react';
import Button from '@/components/Button';
import Card from '@/components/Card';
import Dialog from '@/components/Dialog';
import { useSettings } from '@/hooks/useSettings';
import { useStats } from '@/hooks/useStats';

export default function ResetDataCard() {
  const { resetSettings } = useSettings();
  const { resetStats } = useStats();
  const [confirmOpen, setConfirmOpen] = useState(false);

  return (
    <Card>
      <h2 className="text-lg font-bold">Reset all data</h2>
      <p className="mt-1 text-subtle">Clears your settings, scores, streaks and points.</p>
      <Button variant="danger" className="mt-4 w-full" onClick={() => setConfirmOpen(true)}>
        Reset all data
      </Button>
      <Dialog
        open={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        title="Reset all data?"
        description="Your settings, scores, streaks and points will be cleared. This can't be undone."
      >
        <div className="grid grid-cols-2 gap-3">
          <Button variant="secondary" onClick={() => setConfirmOpen(false)}>
            Cancel
          </Button>
          <Button
            variant="danger"
            onClick={() => {
              resetSettings();
              resetStats();
              setConfirmOpen(false);
            }}
          >
            Reset
          </Button>
        </div>
      </Dialog>
    </Card>
  );
}
