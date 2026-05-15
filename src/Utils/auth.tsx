export const getToken = () => {
  return sessionStorage.getItem('token');
};

export const getUsername = () => {
  return sessionStorage.getItem('username');
};

export const setToken = (token) => {
  sessionStorage.setItem('token', token);
  sessionStorage.setItem('username', token.username);
};

export const removeToken = () => {
  sessionStorage.removeItem('token');
  sessionStorage.removeItem('username');
};