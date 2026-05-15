import { getToken } from "../Utils/auth";

// Configuração da URL Base da API.
// Prioriza variáveis de ambiente (compatível com Create React App e Vite) 
// e usa a sua URL como fallback padrão.
const viteEnv = (import.meta as any).env || {};
const processEnv = typeof process !== "undefined" ? (process.env as any) : {};
const envUrl = viteEnv.VITE_API_URL || processEnv.VITE_API_URL || processEnv.REACT_APP_API_URL;


const API_BASE_URL: string = envUrl;

/**
 * Interface para erros da API, permitindo acessar o status HTTP
 * e os dados retornados pelo servidor (como mensagens de validação).
 */
export interface ApiError extends Error {
  status?: number;
  data?: any;
}

// Função auxiliar para formatar a URL e evitar erros de barras duplas
const getFullUrl = (endpoint: string) => `${API_BASE_URL.replace(/\/$/, "")}/${endpoint.replace(/^\//, "")}`;

const authHeader = (): Record<string, string> => {
  const token = getToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
};

const handleResponse = async (response: Response) => {
  // Se o status for 204 (No Content), retorna nulo imediatamente para evitar erro no parsing do JSON
  if (response.status === 204) {
    return null;
  }

  let data = null;
  const contentType = response.headers.get("content-type");
  if (contentType && contentType.includes("application/json")) {
    try {
      data = await response.json();
    } catch {
      // JSON inválido ou corpo vazio
    }
  }

  if (!response.ok) {
    // Padrão de erro do ASP.NET/Swagger: tenta msg, message, title (Problem Details) ou erros de validação
    let errorMessage = "Erro na requisição";

    if (data) {
      if (data.msg) errorMessage = data.msg;
      else if (data.message) errorMessage = data.message;
      else if (data.title) errorMessage = data.title;
      // Se houver um objeto 'errors' (comum em 400 Bad Request do .NET), pega a primeira mensagem
      else if (data.errors) {
        const firstErrorKey = Object.keys(data.errors)[0];
        const firstError = data.errors[firstErrorKey];
        errorMessage = Array.isArray(firstError) ? firstError[0] : firstError;
      }
    }

    const error = new Error(errorMessage || response.statusText) as ApiError;
    error.status = response.status;
    error.data = data;
    throw error;
  }
  return data;
};

const ApiService = {
  get: async (endpoint: string): Promise<any> => {
    console.log(`%c[API GET] Tentando acessar: ${getFullUrl(endpoint)}`, "color: #00ff00; font-weight: bold;");
    const response = await fetch(getFullUrl(endpoint), {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        ...authHeader(),
      },
    });
    return handleResponse(response);
  },

  post: async (endpoint: string, data: any): Promise<any> => {
    console.log(`%c[API POST] Enviando para: ${getFullUrl(endpoint)}`, "color: #3b82f6; font-weight: bold;", data);
    const response = await fetch(getFullUrl(endpoint), {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...authHeader(),
      },
      body: JSON.stringify(data),
    });
    return handleResponse(response);
  },

  postImage: async (endpoint: string, formData: FormData): Promise<any> => {
    const response = await fetch(getFullUrl(endpoint), {
      method: "POST",
      headers: {
        ...authHeader(),
      },
      body: formData,
    });
    return handleResponse(response);
  },

  put: async (endpoint: string, data: any): Promise<any> => {
    const response = await fetch(getFullUrl(endpoint), {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        ...authHeader(),
      },
      body: JSON.stringify(data),
    });
    return handleResponse(response);
  },
  delete: async (endpoint: string): Promise<any> => {
    const response = await fetch(getFullUrl(endpoint), {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
        ...authHeader(),
      },
    });
    return handleResponse(response);
  },
};

export default ApiService;