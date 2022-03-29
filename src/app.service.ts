import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import {
  Client,
  AccountId,
  PrivateKey,
  TokenInfoQuery,
  AccountBalanceQuery,
  AccountCreateTransaction,
  Hbar,
  TokenId
} from '@hashgraph/sdk';
import { JwtService } from '@nestjs/jwt'
import { hash , compare} from "bcrypt";
import { Account, AuthResponse } from './interface/interface';
import { DatabaseService } from './database/database.service';


@Injectable()
export class AppService {

  public readonly operatorId: AccountId;
  public readonly operatorKey: PrivateKey;
  public readonly treasuryId: AccountId;
  public readonly treasuryKey: PrivateKey;
  public readonly aliceId: AccountId;
  public readonly aliceyKey: PrivateKey;
  private readonly client: Client;

  constructor(private readonly databaseService: DatabaseService,private readonly jwtService: JwtService) {
    this.operatorId = AccountId.fromString(process.env.OPERATOR_ID);
    this.operatorKey = PrivateKey.fromString(process.env.OPERATOR_PVKEY);
    // this.treasuryId = AccountId.fromString(process.env.TREASURY_ID);
    // this.treasuryKey = PrivateKey.fromString(process.env.TREASURY_PVKEY);
    // // this.aliceId = AccountId.fromString(process.env.ALICE_ID);
    // // this.aliceyKey = PrivateKey.fromString(process.env.ALICE_PVKEY);
    this.client = Client.forTestnet().setOperator(this.operatorId, this.operatorKey);
    this.client.setDefaultMaxTransactionFee(new Hbar(0.75));
    this.client.setMaxQueryPayment(new Hbar(0.75));
  }



  async login(user: Account)  : Promise<AuthResponse> {
    const { username } = user;
    const record = await this.databaseService.find({ username }, 'users');

    if (!record || !(await compare(user.password, record.password))) {
      throw new HttpException(
        `You are not registered with us.`,
        HttpStatus.UNAUTHORIZED,
      );
    }
    delete record.password;
    return this.signToken(record);
  }

  async signToken(user: Account): Promise<AuthResponse> {
    const payload = {  ...user };
    return {
      token: this.jwtService.sign(payload),
    };
  }


  async registerUser(user: Account): Promise<Account> {
    const { username } = user;
    const isUserExist = await this.databaseService.find({ username }, 'users');
    if (isUserExist) {
      throw new HttpException(
        `You are already registered with us.`,
        HttpStatus.NOT_ACCEPTABLE,
      );
    }

    const saltRounds = 10;
    const hashPasswd = await hash(user.password, saltRounds);
    user.password = hashPasswd;
    user.username = user.username.toLowerCase();
    user = { ...user, ...await this.createHederaAccount() }
    const record = await this.databaseService.add(user, 'users');
    return record;
  }

  async createHederaAccount() {
    //Create new keys
    const newAccountPrivateKey = await PrivateKey.generateED25519();
    const newAccountPublicKey = newAccountPrivateKey.publicKey;

    //Create a new account with 1,000 tinybar starting balance
    const newAccount = await new AccountCreateTransaction()
      .setKey(newAccountPublicKey)
      .setInitialBalance(Hbar.fromTinybars(1000))
      .execute(this.client);


    // Get the new account ID
    const getReceipt = await newAccount.getReceipt(this.client);
    const newAccountId = getReceipt.accountId;

    return {
      accountId: newAccountId.toString(),
      solAccountId: newAccountId.toSolidityAddress(),
      privateKey: newAccountPrivateKey.toStringRaw(),
      publicKey: newAccountPublicKey.toStringRaw()
    }
  }

  async tQueryFcn(tId: TokenId) {
    let info = await new TokenInfoQuery().setTokenId(tId).execute(this.client);
    return info;
  }

  async bCheckerFcn(aId: AccountId, tokenId: TokenId) {
    let balanceCheckTx = await new AccountBalanceQuery()
      .setAccountId(aId)
      .execute(this.client);
    return balanceCheckTx.tokens._map.get(tokenId.toString());
  }

  getHello(): string {
    return 'Hello World!';
  }
}
