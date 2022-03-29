
export interface Account  {
    role : string,
    accountId? : string,
    solAccountId? : string,
    publicKey? : string,
    privateKey? : string,
    username : string,
    password : string,
}

export interface Organization  {
  orgId : string,
  orgName : string,
}

export interface AuthResponse {
  token: string;
}