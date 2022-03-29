import { Injectable } from '@nestjs/common';
import * as lowdb from 'lowdb';
import * as FileAsync from 'lowdb/adapters/FileAsync';
import { Account } from '../interface/interface';



type Collection = 'users'

@Injectable()
export class DatabaseService {

    private database: lowdb.LowdbAsync<any>;
    
    constructor() {
        this.initDatabase('users');
    }

    private async initDatabase(collctionName: Collection) {
        const adapter = new FileAsync('db.json');
        this.database = await lowdb(adapter);
        const listUsers = await this.database.get(collctionName).value();
        if (!listUsers) {
          await this.database.set(collctionName, []).write();
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