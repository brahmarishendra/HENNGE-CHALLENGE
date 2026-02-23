import { useState, useMemo } from 'react';
import type { CSSProperties, Dispatch, SetStateAction, FormEvent } from 'react';

interface CreateUserFormProps {
  setUserWasCreated: Dispatch<SetStateAction<boolean>>;
}

const PASSWORD_CRITERIA = [
  { id: 'min-length', label: 'Password must be at least 10 characters long', validate: (p: string) => p.length >= 10 },
  { id: 'max-length', label: 'Password must be at most 24 characters long', validate: (p: string) => p.length <= 24 },
  { id: 'no-spaces', label: 'Password cannot contain spaces', validate: (p: string) => !/\s/.test(p) },
  { id: 'has-number', label: 'Password must contain at least one number', validate: (p: string) => /\d/.test(p) },
  { id: 'has-upper', label: 'Password must contain at least one uppercase letter', validate: (p: string) => /[A-Z]/.test(p) },
  { id: 'has-lower', label: 'Password must contain at least one lowercase letter', validate: (p: string) => /[a-z]/.test(p) },
];

const API_BASE_URL = 'https://api.challenge.hennge.com/password-validation-challenge-api/001';

function CreateUserForm({ setUserWasCreated }: CreateUserFormProps) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [apiError, setApiError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const activeCriteria = useMemo(() => {
    if (!password) return PASSWORD_CRITERIA.map(c => c.label);
    return PASSWORD_CRITERIA.filter(c => !c.validate(password)).map(c => c.label);
  }, [password]);

  const isPasswordValid = activeCriteria.length === 0 && password.length > 0;
  const isFormValid = username.trim().length > 0 && isPasswordValid;

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setApiError(null);

    if (!isFormValid) return;

    setIsLoading(true);

    try {
      const response = await fetch(`${API_BASE_URL}/challenge-signup`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'YOUR_TOKEN_HERE',
        },
        body: JSON.stringify({ username, password }),
      });

      if (response.ok) {
        setUserWasCreated(true);
      } else {
        const errorData = await response.json().catch(() => ({}));

        if (response.status === 401 || response.status === 403) {
          setApiError('Not authenticated to access this resource.');
        } else if (response.status === 400 && errorData.message?.includes('not allowed')) {
          setApiError('Sorry, the entered password is not allowed, please try a different one.');
        } else if (response.status === 500) {
          setApiError('Something went wrong, please try again.');
        } else {
          // Fallback for other errors
          setApiError('Something went wrong, please try again.');
        }
      }
    } catch (err) {
      setApiError('Something went wrong, please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div style={formWrapper}>
      <form style={form} onSubmit={handleSubmit} noValidate>
        <label style={formLabel} htmlFor="username">Username</label>
        <input
          id="username"
          style={formInput}
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          disabled={isLoading}
          autoComplete="username"
          aria-invalid={!username.trim()}
        />

        <label style={formLabel} htmlFor="password">Password</label>
        <input
          id="password"
          type="password"
          style={formInput}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          disabled={isLoading}
          autoComplete="new-password"
          aria-invalid={!isPasswordValid}
        />

        {password.length > 0 && activeCriteria.length > 0 && (
          <ul style={criteriaListStyle}>
            {activeCriteria.map((label, index) => (
              <li key={index} style={errorStyle}>{label}</li>
            ))}
          </ul>
        )}

        {apiError && <p style={apiErrorStyle}>{apiError}</p>}

        <button
          style={{
            ...formButton,
            opacity: isLoading || !isFormValid ? 0.7 : 1,
            cursor: isLoading || !isFormValid ? 'not-allowed' : 'pointer'
          }}
          disabled={isLoading || !isFormValid}
          type="submit"
        >
          {isLoading ? 'Creating...' : 'Create User'}
        </button>
      </form>
    </div>
  );
}

export { CreateUserForm };

const formWrapper: CSSProperties = {
  maxWidth: '500px',
  width: '80%',
  backgroundColor: '#efeef5',
  padding: '24px',
  borderRadius: '8px',
};

const form: CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  gap: '12px',
};

const formLabel: CSSProperties = {
  fontWeight: 700,
  fontSize: '14px',
};

const formInput: CSSProperties = {
  outline: 'none',
  padding: '8px 16px',
  height: '40px',
  fontSize: '14px',
  backgroundColor: '#f8f7fa',
  border: '1px solid rgba(0, 0, 0, 0.12)',
  borderRadius: '4px',
};

const formButton: CSSProperties = {
  outline: 'none',
  borderRadius: '4px',
  border: '1px solid rgba(0, 0, 0, 0.12)',
  backgroundColor: '#7135d2',
  color: 'white',
  fontSize: '16px',
  fontWeight: 500,
  height: '40px',
  padding: '0 16px',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  marginTop: '12px',
  alignSelf: 'flex-end',
  cursor: 'pointer',
  transition: 'opacity 0.2s ease',
};

const criteriaListStyle: CSSProperties = {
  listStyleType: 'disc',
  paddingLeft: '20px',
  margin: '8px 0',
};

const errorStyle: CSSProperties = {
  color: '#d32f2f',
  fontSize: '12px',
  lineHeight: '1.6',
};

const apiErrorStyle: CSSProperties = {
  color: '#d32f2f',
  fontSize: '14px',
  fontWeight: 500,
  textAlign: 'center',
  marginTop: '8px',
  padding: '8px',
  backgroundColor: 'rgba(211, 47, 47, 0.1)',
  borderRadius: '4px',
};
