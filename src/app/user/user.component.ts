import {Component, OnInit} from '@angular/core';
import {BehaviorSubject, Subscription} from "rxjs";
import {User} from "../model/user";
import {UserService} from "../service/user.service";
import {HttpErrorResponse} from "@angular/common/http";
import {NotificationService} from "../service/notification.service";
import {NotificationType} from "../enum/notification-type.enum";
import {NgForm} from "@angular/forms";
import {CustomHttpResponse} from "../model/custom-http-response";

@Component({
  selector: 'app-user',
  templateUrl: './user.component.html',
  styleUrls: ['./user.component.css']
})
export class UserComponent implements OnInit {
  private titleSubject = new BehaviorSubject<string>('Users');
  public titleAction$ = this.titleSubject.asObservable();
  public users: User[] | null = [];
  refreshing: boolean = false;
  private subscription: Subscription[] = [];
  public selectedUser: User = new User();
  public filename: any = '';
  public profileImage: any;
  public editUser = new User();
  private currentUsername!: string;


  constructor(private userService: UserService, private notificationService: NotificationService) {
  }

  ngOnInit(): void {
    this.getUsers(true);
  }

  public changeTitle(title: string): void {
    this.titleSubject.next(title);
  }

  public getUsers(showNotification: boolean): void {
    this.refreshing = true;
    this.subscription.push(
      this.userService.getUsers().subscribe(
        (response) => {
          this.userService.addUsersToLocalCache(response);
          this.users = response;
          this.refreshing = false;
          if (showNotification) {
            this.sendNotification(NotificationType.SUCCESS, `${response.length} user(s) loaded successfully`);
          }
        },
        (errorResponse: HttpErrorResponse) => {
          this.sendNotification(NotificationType.ERROR, errorResponse.error.message);
          this.refreshing = false;
        }
      )
    );
  }

  public onSelectUSer(selectedUser: User): void {
    this.selectedUser = selectedUser;
    this.clickButton("openUserInfo")
  }

  public onProfileImageChange(fileName: string, profileImage: File): void {
    this.filename = fileName;
    this.profileImage = profileImage;
  }

  private sendNotification(notificationType: NotificationType, message: string): void {
    if (message) {
      this.notificationService.notify(notificationType, message);
    } else {
      this.notificationService.notify(notificationType, 'An error occurred. Please try again');
    }
  }

  public saveNewUser(): void {
    // @ts-ignore
    this.clickButton("new-user-save")
  }

  public onAddNewUser(userForm: NgForm): void {
    const formData = this.userService.createUSerFromData(null, userForm.value, this.profileImage);
    this.subscription.push(
      this.userService.addUser(formData).subscribe(
        (response: User) => {
          this.clickButton("new-user-close");
          this.getUsers(false);
          this.filename = null;
          (<HTMLInputElement>document.getElementById('profileImage')).value = "";
          userForm.reset();
          this.sendNotification(NotificationType.SUCCESS, `${response.firstName} ${response.lastName} added successfully`);

        },
        (errorResponse: HttpErrorResponse) => {
          this.sendNotification(NotificationType.ERROR, errorResponse.error.message);
          (<HTMLInputElement>document.getElementById('profileImage')).value = "";
        }
      )
    )
  }

  onUpdateUser(): void {
    const formData = this.userService.createUSerFromData(this.currentUsername, this.editUser, this.profileImage);
    this.subscription.push(
      this.userService.updateUser(formData).subscribe(
        (response: User) => {
          this.clickButton("closeEditUserModalButton");
          this.getUsers(false);
          this.filename = null;
          (<HTMLInputElement>document.getElementById('profileImage')).value = "";
          this.sendNotification(NotificationType.SUCCESS, `${response.firstName} ${response.lastName} update successfully`);

        },
        (errorResponse: HttpErrorResponse) => {
          this.sendNotification(NotificationType.ERROR, errorResponse.error.message);
          (<HTMLInputElement>document.getElementById('profileImage')).value = "";
        }
      )
    )
  }

  public clickButton = (buttonId: string): void => {
    document.getElementById(buttonId)!.click();
  };

  public searchUsers(searchTerm: string): void {
    const results: User[] = [];
    for (const user of this.userService.getUsersToLocalCache()!) {
      if (user.firstName.toLowerCase().indexOf(searchTerm.toLowerCase()) !== -1 ||
        user.lastName.toLowerCase().indexOf(searchTerm.toLowerCase()) !== -1 ||
        user.username.toLowerCase().indexOf(searchTerm.toLowerCase()) !== -1 ||
        user.email.toLowerCase().indexOf(searchTerm.toLowerCase()) !== -1 ||
        user.userId.toLowerCase().indexOf(searchTerm.toLowerCase()) !== -1) {
        results.push(user);
      }
    }
    this.users = results;
    if (results.length == 0 || !searchTerm) {
      this.users = this.userService.getUsersToLocalCache();
    }
  }

  public onEditUser(editUser: User): void {
    this.editUser = editUser;
    this.currentUsername = editUser.username;
    this.clickButton('openUserEdit');
  }

  onDeleteUser(userId: number): void {
    this.subscription.push(
      this.userService.deleteUser(userId).subscribe(
        (response: CustomHttpResponse) => {
          this.sendNotification(NotificationType.SUCCESS, response.message);
          this.getUsers(false);
        },
        (errorResponse: HttpErrorResponse) => {
          this.sendNotification(NotificationType.ERROR, errorResponse.error.message);
        }
      )
    );
  }

  public onResetPassword(emailForm: NgForm): void {
    this.refreshing = true;
    const emailAddress = emailForm.value['reset-password-email'];
    this.subscription.push(
      this.userService.resetPassword(emailAddress).subscribe(
        (response) => {
          this.sendNotification(NotificationType.SUCCESS, response.message);
          this.refreshing = false;
        },
        (errorResponse: HttpErrorResponse) => {
          this.sendNotification(NotificationType.WARNING, errorResponse.error.message);
          this.refreshing = false;
        },
        () => emailForm.reset()
      )
    );
  }
}
