import ApiService from "../API/service";

/**
 * Hook genérico para operações CRUD em uma entidade da API.
 * @param {string} entityName
 */
const useApiController = (entityName: string) => {
  const loadingPush = () => {};
  const loadingPop = () => {};

  if (!entityName || typeof entityName !== "string") {
    throw new Error(
      "entityName deve ser uma string não vazia em useApiController."
    );
  }

  // Função auxiliar para tratar erros 401 (token expirado)
  const handleUnauthorized = (error: any) => {
    if (error.status === 401 && error.data?.msg === "Token has expired") {
      // Redireciona silenciosamente para página de token expirado
      // Nota: Em uma implementação ideal, usaríamos o 'navigate' do router aqui.
      console.warn("Sessão expirada. Redirecionando...");
      window.location.href = "/login"; 
      return true;
    }
    return false;
  };

  const getAll = async () => {
    try {
      loadingPush();
      return await ApiService.get(entityName);
    } catch (error) {
      // Se for erro 401, trata silenciosamente
      if (handleUnauthorized(error)) {
        return null;
      }

      return false;
    } finally {
      loadingPop();
    }
  };

  const getById = async (id: string | number) => {
    if (!id)
      throw new Error("ID é obrigatório para buscar um registro específico.");
    try {
      loadingPush();
      return await ApiService.get(`${entityName}/${id}`);
    } catch (error) {
      // Se for erro 401, trata silenciosamente
      if (handleUnauthorized(error)) {
        return null;
      }

      return false;
    } finally {
      loadingPop();
    }
  };

  const create = async (data: any) => {
    if (!data)
      throw new Error("Dados são obrigatórios para criar um registro.");
    try {
      loadingPush();
      const endpoint = `${entityName}`;
      return await ApiService.post(endpoint, data);
    } catch (error) {
      // Se for erro 401, trata silenciosamente
      if (handleUnauthorized(error)) {
        return null;
      }

      return false;
    } finally {
      loadingPop();
    }
  };

  const update = async (id: string | number, data: any) => {
    if (!id) throw new Error("ID é obrigatório para atualizar um registro.");
    if (!data)
      throw new Error("Dados são obrigatórios para atualizar um registro.");
    try {
      loadingPush();
      return await ApiService.put(`${entityName}/${id}`, data);
    } catch (error) {
      // Se for erro 401, trata silenciosamente
      if (handleUnauthorized(error)) {
        return null;
      }

      return false;
    } finally {
      loadingPop();
    }
  };

  //Funcao do DELETE
  const deleteRecord = async (id: string | number) => {
    if (!id) throw new Error("ID é obrigatório para deletar um registro.");
    try {
      loadingPush();
      return await ApiService.delete(`${entityName}/${id}`);
    } catch (error) {
      // Se for erro 401, trata silenciosamente
      if (handleUnauthorized(error)) {
        return null;
      }

      if (error.response && error.response.data) {
        return error.response.data;
      }

      return false;
    } finally {
      loadingPop();
    }
  };

  const uploadFile = async (file: File) => {
    if (!file) throw new Error("Arquivo é obrigatório para upload.");
    try {
      loadingPush();
      const formData = new FormData();
      formData.append("imagem", file);

      const response = await ApiService.postImage(`${entityName}`, formData);
      return response;
    } catch (error) {
      // Se for erro 401, trata silenciosamente
      if (handleUnauthorized(error)) {
        return null;
      }

      return false;
    } finally {
      loadingPop();
    }
  };

  return {
    getAll,
    getById,
    create,
    update,
    deleteRecord,
    uploadFile,
  };
};

export default useApiController;