import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Customer } from './entities/customer.entity.js';
import { CustomerAddress } from './entities/customer-address.entity.js';
import { CreateCustomerDto } from './dto/create-customer.dto.js';
import { UpdateCustomerDto } from './dto/update-customer.dto.js';
import { CreateAddressDto } from './dto/create-address.dto.js';
import { UpdateAddressDto } from './dto/update-address.dto.js';
import { isUniqueViolation } from '../common/utils/db-errors.js';

@Injectable()
export class CustomersService {
    constructor(
        @InjectRepository(Customer)
        private readonly customerRepository: Repository<Customer>,
        @InjectRepository(CustomerAddress)
        private readonly addressRepository: Repository<CustomerAddress>,
    ) {}

    // ---------- customers ----------
    async findAll(): Promise<Customer[]> {
        return await this.customerRepository.find({ order: { name: 'ASC' } });
    }

    async findById(id: string): Promise<Customer> {
        const customer = await this.customerRepository.findOne({
            where: { id },
            relations: { addresses: true },
        });
        if (!customer) {
            throw new NotFoundException(`Customer dengan ID ${id} tidak ditemukan`);
        }
        return customer;
    }

    async create(dto: CreateCustomerDto): Promise<Customer> {
        try {
            const customer = this.customerRepository.create(dto);
            return await this.customerRepository.save(customer);
        } catch (error) {
            if (isUniqueViolation(error)) {
                throw new ConflictException('Email sudah terdaftar');
            }
            throw error;
        }
    }

    async update(id: string, dto: UpdateCustomerDto): Promise<Customer> {
        const customer = await this.customerRepository.findOne({ where: { id } });
        if (!customer) {
            throw new NotFoundException(`Customer dengan ID ${id} tidak ditemukan`);
        }
        Object.assign(customer, dto);
        try {
            return await this.customerRepository.save(customer);
        } catch (error) {
            if (isUniqueViolation(error)) {
                throw new ConflictException('Email sudah terdaftar');
            }
            throw error;
        }
    }

    // soft delete: riwayat pesanan tetap aman
    async remove(id: string): Promise<{ id: string; deleted: boolean }> {
        const result = await this.customerRepository.softDelete(id);
        if (!result.affected) {
            throw new NotFoundException(`Customer dengan ID ${id} tidak ditemukan`);
        }
        return { id, deleted: true };
    }

    // ---------- alamat customer ----------
    async findAddresses(customerId: string): Promise<CustomerAddress[]> {
        await this.findById(customerId);
        return await this.addressRepository.find({
            where: { customerId },
            order: { createdAt: 'ASC' },
        });
    }

    async createAddress(customerId: string, dto: CreateAddressDto): Promise<CustomerAddress> {
        await this.findById(customerId);
        const address = this.addressRepository.create({ ...dto, customerId });
        return await this.addressRepository.save(address);
    }

    private async findAddress(customerId: string, id: string): Promise<CustomerAddress> {
        const address = await this.addressRepository.findOne({ where: { id, customerId } });
        if (!address) {
            throw new NotFoundException(`Alamat dengan ID ${id} tidak ditemukan`);
        }
        return address;
    }

    async updateAddress(customerId: string, id: string, dto: UpdateAddressDto): Promise<CustomerAddress> {
        const address = await this.findAddress(customerId, id);
        Object.assign(address, dto);
        return await this.addressRepository.save(address);
    }

    async removeAddress(customerId: string, id: string): Promise<{ id: string; deleted: boolean }> {
        const address = await this.findAddress(customerId, id);
        await this.addressRepository.remove(address);
        return { id, deleted: true };
    }
}
