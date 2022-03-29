
export interface Account  {
    accountId? : string,
    solAccountId? : string,
    publicKey? : string,
    privateKey? : string,
    username : string,
    password : string,
}

export interface AuthResponse {
  token: string;
}