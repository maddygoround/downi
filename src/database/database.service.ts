import { Injectable, OnModuleInit } from '@nestjs/common';
import * as lowdb from 'lowdb';
import * as FileAsync from 'lowdb/adapters/FileAsync';
import {
    AccountId,
} from '@hashgraph/sdk';
import { Account } from '../interface/interface';
import { Role } from '../enum/enum';

type Collection = 'users'

@Injectable()
export class DatabaseService implements OnModuleInit {

    private database: lowdb.LowdbAsync<any>;

    constructor() {

    }

    async onModuleInit() {
        console.log(`Initialization...`);

        const adapter = new FileAsync('db.json');
        this.database = await lowdb(adapter);
        const listUsers = await this.database.get('users').value();

        if (!listUsers) {
            await this.database.set('users', []).write();
        }

        const record = await this.find({ username: process.env.ROOT_USERNAME }, 'users');
        if (!record) {
            const accountId = AccountId.fromString(process.env.OPERATOR_ID);

            const rootUser = {
                username: process.env.ROOT_USERNAME,
                password: process.env.ROOT_PASSWORD,
                role: Role.ADMIN,
                accountId: accountId.toString(),
                solAccountId: accountId.toSolidityAddress(),
                publicKey: process.env.OPERATOR_PBKEY,
                privateKey: process.env.OPERATOR_PVKEY
            } as Account;

            this.add(rootUser, "users");
        }
    }



    async findAll(collctionName: Collection): Promise<any> {
        const listUsers = await this.database.get(collctionName).value();
        return listUsers;
    }

    async find(condition: object, collctionName: Collection): Promise<any> {
        const values = await this.database.get(collctionName).find(condition).value();
        return values;
    }

    async update(
        key: string,
        value: string | String,
        collctionName: string,
        dataUpdate: any,
    ): Promise<any> {
        const listUsers = await this.database.get(collctionName).value();
        let out;
        const listData = listUsers.map(user => {
            if (user[key] !== value) return user;
            if (user[key] === value) {
                out = Object.assign(user, dataUpdate);
                return out;
            }
        });
        await this.database.set(collctionName, listData).write();
        return out;
    }

    async add(record: Account, collctionName: Collection): Promise<any> {
        const listData = await this.database.get(collctionName).value();
        listData.push(record);
        await this.database.set(collctionName, listData).write();
        return record;
    }


}