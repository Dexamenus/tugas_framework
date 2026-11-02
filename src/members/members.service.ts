import { Injectable } from '@nestjs/common';
import { Member } from './entites/members.entity.js';

@Injectable()
export class MembersService {
    private members = [
        { 
            id: 1, 
            name: 'John Doe', 
            email: 'john.doe@example.com',
            phone: '123-456-7890',
            password: 'password123'
        },
        {
            id: 2, 
            name: 'Jane Smith', 
            email: 'jane.smith@example.com',
            phone: '098-765-4321',
            password: 'password456'
        },
        {
            id: 3, 
            name: 'Bob Johnson', 
            email: 'bob.johnson@example.com',
            phone: '555-555-5555',
            password: 'password789'
        }
    ];

    findAll() {
        return this.members;
    }
    
    findById(id: number): Member | undefined {
        return this.members.find(member => member.id === id);
    }
}
