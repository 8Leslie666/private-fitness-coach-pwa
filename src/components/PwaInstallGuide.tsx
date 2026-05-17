import { Smartphone } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Card } from './Cards/Card';

type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
};

function isStandaloneMode(): boolean {
  return window.matchMedia('(display-mode: standalone)').matches || Boolean((window.navigator as { standalone?: boolean }).standalone);
}

export function PwaInstallGuide() {
  const [standalone, setStandalone] = useState(false);
  const [promptEvent, setPromptEvent] = useState<BeforeInstallPromptEvent | null>(null);

  useEffect(() => {
    setStandalone(isStandaloneMode());
    const handler = (event: Event) => {
      event.preventDefault();
      setPromptEvent(event as BeforeInstallPromptEvent);
    };
    window.addEventListener('beforeinstallprompt', handler);
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  if (standalone) return null;

  return (
    <Card title="添加到手机桌面" subtitle="要脱离本地 WiFi 使用，请先部署到 HTTPS 地址，再从手机安装。">
      <div className="space-y-3 text-sm leading-6 text-muted">
        {promptEvent && (
          <button
            type="button"
            onClick={() => promptEvent.prompt()}
            className="flex w-full items-center justify-center gap-2 rounded-2xl bg-ink px-4 py-3 font-semibold text-white"
          >
            <Smartphone size={18} />
            安装应用
          </button>
        )}
        <div className="rounded-2xl bg-surface p-3">
          <p className="font-medium text-ink">为什么本地地址不能随时打开</p>
          <p>当前 `192.168.x.x` 地址来自电脑开发服务器，手机离开同一 WiFi 或电脑服务停止后就访问不到。线上 HTTPS 地址才适合长期安装使用。</p>
        </div>
        <div className="rounded-2xl bg-surface p-3">
          <p className="font-medium text-ink">iPhone</p>
          <p>用 Safari 打开，点击分享按钮，选择“添加到主屏幕”，再点击添加。</p>
        </div>
        <div className="rounded-2xl bg-surface p-3">
          <p className="font-medium text-ink">Android</p>
          <p>用 Chrome 打开，点击菜单，选择“添加到主屏幕”或“安装应用”。</p>
        </div>
      </div>
    </Card>
  );
}
