import { ApiService } from "@/api/apiService";

const auth = ApiService.getToken()!;

export class UserService {

  //Получить сотрудника
  public async getUser(kentId?: string | null, role?: string | null): Promise<Response> {
    const headers: HeadersInit = ApiService.withAuth();
    let url = `${ApiService.baseUrl}/auth/me`;
    if (kentId) {
      url += "?kentId=" + kentId
    }
    if (role) {
      url += "&role=" + role
    }
    return await fetch(url,
      { 
        method: 'GET', 
        headers: headers 
      }
    )
  }

  //Добавить нового сотрудника
  public async addUser(userId: number, role: string): Promise<Response> {
    const headers: HeadersInit = ApiService.withAuth();
    let url = `${ApiService.baseUrl}/auth/me?kentId=${userId}&role=${role}`;
    return await fetch(url, {
      method: 'GET',
      headers: headers
    })
  }

  //Почуть всех админов
  public async getAdmins(): Promise<Response> {
    const headers: HeadersInit = ApiService.withAuth();
    let url = `${ApiService.baseUrl}/users`;
    return await fetch(url, 
      {
        method: 'GET',
        headers: headers 
      }
    )
  }

  //Изменить роль сотрудника
  public async editRole(userId: number, role: string): Promise<Response> {
    const headers: HeadersInit = ApiService.withAuth();
    let url = `${ApiService.baseUrl}/users/${userId}`;
    return await fetch(url, 
      {
        method: 'PUT',
        headers: headers,
        body: JSON.stringify({
          role: role
        })
      }
    )
  }

  //Удалить сотрудника
  public async delUser(userId: number): Promise<Response> {
    const headers: HeadersInit = ApiService.withAuth();
    let url = `${ApiService.baseUrl}/users/${userId}`;
    return await fetch(url, {
      method: 'DELETE',
      headers: headers 
    })
  }

}