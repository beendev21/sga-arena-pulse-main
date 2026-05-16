const getPersistedAuth = () => {
  if (typeof window === 'undefined') return null;

  const rawAuth = localStorage.getItem('auth-storage');
  if (!rawAuth) return null;

  try {
    const parsedAuth = JSON.parse(rawAuth);
    return parsedAuth?.state || null;
  } catch {
    return null;
  }
};

export const getToken = () => {
  if (typeof window === 'undefined') return null;

  return sessionStorage.getItem('token') || getPersistedAuth()?.token || null;
};

export const getUsername = () => {
  if (typeof window === 'undefined') return null;

  return sessionStorage.getItem('username') || getPersistedAuth()?.user?.name || getPersistedAuth()?.user?.login || null;
};

export const setToken = (authData: any) => {
  if (!authData) return;
  sessionStorage.setItem('token', authData.token);
  sessionStorage.setItem('username', authData.user.name || authData.user.login);
  // IMPORTANTE: Salvar o usuário completo para persistir a Role (Administrador)
  sessionStorage.setItem('user_data', JSON.stringify(authData.user));
};

export const removeToken = () => {
  sessionStorage.removeItem('token');
  sessionStorage.removeItem('username');
  sessionStorage.removeItem('user_data');
};