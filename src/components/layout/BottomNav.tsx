import { Activity, Dumbbell, House, UserRound, Utensils } from 'lucide-react';
import { useAppStore, type Screen } from '../../store/appStore';

const navItems: Array<{ screen: Screen; label: string; icon: typeof House }> = [
  { screen: 'cultivation', label: '修炼', icon: House },
  { screen: 'training', label: '行练', icon: Dumbbell },
  { screen: 'diet', label: '膳食', icon: Utensils },
  { screen: 'progress', label: '进度', icon: Activity },
  { screen: 'profile', label: '吾身', icon: UserRound },
];

export function BottomNav() {
  const screen = useAppStore((state) => state.screen);
  const navigate = useAppStore((state) => state.navigate);

  return (
    <nav className="bottom-nav" aria-label="底部导航">
      {navItems.map((item) => {
        const Icon = item.icon;
        const active = screen === item.screen;
        return (
          <button
            className={active ? 'active' : ''}
            key={item.screen}
            type="button"
            onClick={() => navigate(item.screen)}
          >
            <Icon size={active ? 27 : 26} strokeWidth={active ? 2.45 : 2.15} />
            <span>{item.label}</span>
          </button>
        );
      })}
    </nav>
  );
}
