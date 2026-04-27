/**
 * Admin login page with SHA-256 auth and lockout protection.
 */

import { $ } from '../../utils/dom.js';
import { sha256 } from '../../utils/crypto.js';
import { isLockedOut, incrementLoginAttempts, setAdminSession } from '../../state.js';
import { showToast } from '../../components/Toast.js';
import { generateId } from '../../utils/helpers.js';
import config from '../../config.js';

export default function AdminLoginPage() {
  return {
    html: `
      <div class="page section" style="min-height:100vh;display:flex;align-items:center;justify-content:center">
        <div class="admin-login glass" style="width:100%;max-width:420px;padding:var(--space-10)">
          <div class="text-center" style="margin-bottom:var(--space-8)">
            <div class="gold-text" style="font-family:var(--font-display);font-size:var(--text-h1);font-weight:700;letter-spacing:0.05em">LUXE</div>
            <p class="text-muted" style="margin-top:var(--space-2)">لوحة التحكم</p>
          </div>

          <form id="adminLoginForm" novalidate>
            <div class="form-group">
              <label class="form-label">اسم المستخدم</label>
              <input type="text" name="username" class="form-input" autocomplete="username" required />
            </div>
            <div class="form-group">
              <label class="form-label">كلمة المرور</label>
              <input type="password" name="password" class="form-input" autocomplete="current-password" required />
            </div>
            <div id="loginError" style="display:none;color:var(--danger);font-size:var(--text-sm);margin-bottom:var(--space-3)"></div>
            <button type="submit" class="btn btn--gold btn--full btn--lg" id="loginBtn">تسجيل الدخول</button>
          </form>

          <div class="text-center" style="margin-top:var(--space-6)">
            <a href="#home" class="text-muted text-sm" style="text-decoration:underline">← العودة للمتجر</a>
          </div>
        </div>
      </div>
    `,
    init() {
      const form = $('#adminLoginForm');
      if (!form) return;

      form.addEventListener('submit', async (e) => {
        e.preventDefault();
        const errorEl = $('#loginError');
        const btn = $('#loginBtn');

        if (isLockedOut()) {
          showError(errorEl, 'تم تجاوز عدد المحاولات. يرجى الانتظار 15 دقيقة.');
          return;
        }

        const fd = new FormData(form);
        const username = fd.get('username')?.toString().trim() ?? '';
        const password = fd.get('password')?.toString().trim() ?? '';

        if (!username || !password) {
          showError(errorEl, 'يرجى ملء جميع الحقول');
          return;
        }

        if (btn) {
          btn.disabled = true;
          btn.textContent = 'جاري التحقق...';
        }

        try {
          const [uHash, pHash] = await Promise.all([sha256(username), sha256(password)]);

          if (uHash === config.adminUsernameHash && pHash === config.adminPasswordHash) {
            const token = generateId('sess');
            setAdminSession(token);
            showToast('تم تسجيل الدخول بنجاح', 'success');
            location.hash = '#admin/dashboard';
          } else {
            incrementLoginAttempts();
            showError(errorEl, 'اسم المستخدم أو كلمة المرور غير صحيحة');
          }
        } catch {
          showError(errorEl, 'حدث خطأ. يرجى المحاولة مرة أخرى.');
        } finally {
          if (btn) {
            btn.disabled = false;
            btn.textContent = 'تسجيل الدخول';
          }
        }
      });
    },
  };
}

function showError(el, msg) {
  if (!el) return;
  el.textContent = msg;
  el.style.display = '';
}
