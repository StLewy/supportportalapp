export class User {

  public id: number;
  public userId: string;
  public firstName: string;
  public lastName: string;
  public username: string;
  public email: string;
  public lastLoginDate: Date;
  public lastLoginDateDisplay: Date;
  public joinDate: Date;
  public profileImageUrl: string;
  public active: boolean;
  public notLocked: boolean;
  public roles: string;
  public authorities: [];


  constructor() {
    this.id = 0;
    this.userId = '';
    this.firstName = '';
    this.lastName = '';
    this.username = '';
    this.email = '';
    this.lastLoginDate = new Date;
    this.lastLoginDateDisplay = new Date();
    this.joinDate = new Date;
    this.profileImageUrl ='';
    this.active = false;
    this.notLocked = false;
    this.roles = '';
    this.authorities = [];

  }
}
