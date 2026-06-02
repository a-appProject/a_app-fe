import { UserService } from "@/api/userService";
import { handleResponseError } from '@/tools/handleResponseError';

const user_service = new UserService();

//Получить всех пользователей
export async function getUsers() {
  try {
    const response = await user_service.getAdmins();
    const data = await response.json();
    if (await handleResponseError(response, data)) return null;
    if (data) {
      return data;
    }
  } catch(error) {
    console.error('Ошибка getUsers:', error);
    return null;
  }
}

//Получить конкретного пользователя
export async function getUser(kentId?: string | null, role?: string | null) {
  try {
    const response = await user_service.getUser(kentId, role);
    const data = await response.json();
    if (await handleResponseError(response, data)) return null;
    if (data) {
      return data;
    }
  } catch(error) {
    console.error('Ошибка getUsers:', error);
    return null;
  }
}

//Добавить пользоватлея
export async function addUser(user_id: number, role: string) {
  try {
    const response = await user_service.addUser(user_id, role);
    const data = await response.json();
    if (await handleResponseError(response, data)) return null;
    if (data) {
      return data;
    }
  } catch(error) {
    console.error('Ошибка getUsers:', error);
    return null;
  }
}

//Изменить роль пользователя
export async function editUser(user_id: number, role: string) {
  try {
    const response = await user_service.editRole(user_id, role);
    const data = await response.json();
    if (await handleResponseError(response, data)) return null;
    if (data) {
      return data;
    }
  } catch(error) {
    console.error('Ошибка getUsers:', error);
    return null;
  }
}

//Удалить пользователя
export async function delUser(user_id: number) {
  try {
    const response = await user_service.delUser(user_id);
    const data = await response.json();
    if (await handleResponseError(response, data)) return null;
    if (data) {
      return data;
    }
  } catch(error) {
    console.error('Ошибка getUsers:', error);
    return null;
  }
}

