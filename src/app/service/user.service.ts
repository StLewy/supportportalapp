import {Injectable} from '@angular/core';
import {HttpClient, HttpErrorResponse, HttpEvent} from "@angular/common/http";
import {environment} from "../../environments/environment";
import {Observable} from "rxjs";
import {User} from "../model/user";
import {CustomHttpResponse} from "../model/custom-http-response";

@Injectable({
  providedIn: 'root'
})
export class UserService {

  private host = environment.apiURL;

  constructor(private http: HttpClient) {
  }

  public getUsers(): Observable<User[]> {
    return this.http.get<User[]>(`${this.host}/user/list`);
  }

  public addUser(formData: FormData): Observable<User> {
    return this.http.post<User>(`${this.host}/user/add`, formData);
  }

  public updateUser(formData: FormData): Observable<User> {
    return this.http.post<User>(`${this.host}/user/update`, formData);
  }

  public resetPassword(email: string): Observable<CustomHttpResponse | HttpErrorResponse> {
    return this.http.get<CustomHttpResponse>(`${this.host}/user/resetpassword/${email}`);
  }

  public updateProfileImage(formData: FormData): Observable<HttpEvent<User> | HttpErrorResponse> {
    return this.http.post<User>(`${this.host}/user/updateProfileImage`, formData,
      {
        reportProgress: true,
        observe: 'events'
      });
  }

  public deleteUser(userId: number): Observable<CustomHttpResponse> {
    return this.http.delete<CustomHttpResponse>(`${this.host}/user/delete/${userId}`);
  }

  public addUsersToLocalCache(users: User[] | HttpErrorResponse): void {
    localStorage.setItem('users', JSON.stringify(users));
  }

  public getUsersToLocalCache(): User[] | null {
    if (localStorage.getItem('users')) {
      // @ts-ignore
      return JSON.parse(localStorage.getItem('users'));
    }
    return null;
  }

  public createUSerFromData(loggedInUsername: any, user: User, profileImage: File): FormData {
    const formData = new FormData();
    formData.append('currentUsername', loggedInUsername);
    formData.append('firstName', user.firstName);
    formData.append('lastName', user.lastName);
    formData.append('username', user.username);
    formData.append('email', user.email);
    formData.append('roles', user.roles);
    formData.append('profileImage', profileImage);
    formData.append('isActive', JSON.stringify(user.active));
    formData.append('isNonLocked', JSON.stringify(user.notLocked));
    return formData;
  }

}
