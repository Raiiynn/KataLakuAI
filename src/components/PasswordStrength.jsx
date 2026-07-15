import { getPasswordStrength } from '../services/authService';
import './PasswordStrength.css';

export default function PasswordStrength({ password }) {
  const { score, label, color } = getPasswordStrength(password);

  if (!password) return null;

  return (
    <div className="password-strength">
      <div className="password-strength-bars">
        {[1, 2, 3, 4].map(level => (
          <div
            key={level}
            className={`password-strength-bar ${score >= level ? 'active' : ''}`}
            style={{ backgroundColor: score >= level ? color : undefined }}
          />
        ))}
      </div>
      <span className="password-strength-label" style={{ color }}>
        {label}
      </span>
    </div>
  );
}
