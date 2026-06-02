import {
  Facebook,
  Gamepad2,
  Headset,
  Mail,
  MessageCircleMore,
  ShieldCheck,
  Zap,
} from 'lucide-react';
import { BrandLogo } from './BrandLogo';
import { Route } from '../../lib/routes';

export function AppFooter({ navigate }: { navigate: (route: Route) => void }) {
  return (
    <footer className="app-footer mt-auto">
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-10 sm:px-6 lg:grid-cols-[1.35fr_0.8fr_0.8fr_0.9fr] lg:px-8">
        <div className="footer-brand-block">
          <BrandLogo
            onClick={() => navigate({ name: 'home' })}
            title="GameTopUp"
            subtitle="Đại lý nạp game trung gian"
          />
          <p>
            Dịch vụ nạp game trung gian an toàn và tiết kiệm. Chúng tôi mang đến giải pháp tối ưu chi phí nạp với
            mức giá tốt nhất, đi kèm hỗ trợ tận tâm.
          </p>
        </div>

        <div>
          <h3>Dịch vụ</h3>
          <div className="footer-links">
            <button type="button" onClick={() => navigate({ name: 'games' })}>Kho game</button>
            <button type="button" onClick={() => navigate({ name: 'wallet' })}>Nạp ví VietQR</button>
            <button type="button" onClick={() => navigate({ name: 'orders' })}>Tra cứu đơn hàng</button>
            <button type="button" onClick={() => navigate({ name: 'home' })}>Chính sách bảo mật</button>
          </div>
        </div>

        <div>
          <h3>Hỗ trợ</h3>
          <div className="footer-support">
            <p>
              <ShieldCheck size={16} /> Bảo mật 100%
            </p>
            <p>
              <Zap size={16} /> Xử lý tức thì
            </p>
            <p>
              <Headset size={16} /> Hỗ trợ 24/7
            </p>
          </div>
        </div>

        <div className="footer-contact-block">
          <div className="footer-contact-group">
            <h3>Kết nối với chúng tôi</h3>
            <div className="footer-icon-links">
              <a className="footer-icon-link" href="mailto:admin@gametopup.com" aria-label="Email" target="_blank" rel="noreferrer">
                <Mail size={20} />
              </a>
              <a className="footer-icon-link" href="https://www.facebook.com" aria-label="Facebook" target="_blank" rel="noreferrer">
                <Facebook size={20} />
              </a>
              <a className="footer-icon-link" href="https://zalo.me" aria-label="Zalo" target="_blank" rel="noreferrer">
                <MessageCircleMore size={20} />
              </a>
            </div>
          </div>
        </div>
      </div>
      <div className="footer-copy border-t border-white/5 py-5">
        <p className="footer-copy-line">© 2026 GameTopUp. All rights reserved.</p>
        <div className="footer-developed-row">
          <span className="footer-developed-name">Developed by Hồ Nguyễn Minh Khoa</span>
          <span className="footer-developed-sep" aria-hidden="true">
            •
          </span>
          <a className="footer-developed-link" href="https://github.com" target="_blank" rel="noreferrer">
            GitHub
          </a>
          <span className="footer-developed-sep" aria-hidden="true">
            •
          </span>
          <a className="footer-developed-link" href="https://www.linkedin.com" target="_blank" rel="noreferrer">
            LinkedIn
          </a>
        </div>
      </div>
    </footer>
  );
}
