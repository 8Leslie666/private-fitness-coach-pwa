import { Pencil } from 'lucide-react';
import type { UserProfile } from '../../types';
import { InkButton } from './InkButton';

interface ProfileSummaryCardProps {
  profile: UserProfile;
  phaseLabel: string;
  onEdit: () => void;
}

export function ProfileSummaryCard({ profile, phaseLabel, onEdit }: ProfileSummaryCardProps) {
  return (
    <section className="ink-card rounded-pageCard p-5">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm text-ink500">{phaseLabel}</p>
          <h2 className="mt-2 text-2xl font-semibold text-ink900">{profile.nickname}</h2>
          <p className="mt-1 text-sm leading-5 text-ink500">{profile.trainingGoal}</p>
        </div>
        <div className="grid h-14 w-14 shrink-0 place-items-center rounded-card bg-jade/10 text-xl font-semibold text-jade">
          {profile.avatar || profile.nickname.slice(0, 1)}
        </div>
      </div>

      <div className="mt-5 grid grid-cols-3 gap-2">
        <div className="rounded-smallCard bg-white/58 p-3">
          <p className="text-xs text-ink500">身高</p>
          <p className="mt-1 font-semibold text-ink900">{profile.height}cm</p>
        </div>
        <div className="rounded-smallCard bg-white/58 p-3">
          <p className="text-xs text-ink500">当前</p>
          <p className="mt-1 font-semibold text-ink900">{profile.currentWeight}kg</p>
        </div>
        <div className="rounded-smallCard bg-white/58 p-3">
          <p className="text-xs text-ink500">目标</p>
          <p className="mt-1 font-semibold text-ink900">{profile.targetWeight}kg</p>
        </div>
      </div>

      <InkButton variant="secondary" onClick={onEdit} className="mt-4 flex w-full items-center justify-center gap-2">
        <Pencil size={16} />
        编辑资料
      </InkButton>
    </section>
  );
}
