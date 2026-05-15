export const getToken = () => {
  return sessionStorage.getItem('token');
};

export const getUsername = () => {
  return sessionStorage.getItem('username');
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