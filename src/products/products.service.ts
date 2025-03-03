import {
  BadRequestException,
  Injectable,
  Logger,
  NotFoundException,
  OnModuleInit,
  Delete,
} from '@nestjs/common';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { PrismaClient } from '@prisma/client';
import { paginationDto } from 'src/common';
import { Product } from './entities/product.entity';

@Injectable()
export class ProductsService extends PrismaClient implements OnModuleInit {
  private readonly logger = new Logger('ProductsService');
  async onModuleInit() {
    await this.$connect(); // Espera que la conexión se complete antes de continuar
    this.logger.log('Database connected');
  }

  create(createProductDto: CreateProductDto) {
    // this.logger.log({createProductDto});

    return this.product.create({ data: createProductDto });
  }

  async findAll(paginationDto: paginationDto) {
    const { page, limit } = paginationDto;
    const totalPages = await this.product.count({where:{available:true}});
    const lastPage = Math.ceil(totalPages / limit!);
    return {

      
      data: await this.product.findMany({
        skip: (page! - 1) * limit!,
        take: limit,
        where:{available:true}
      }),
      meta: { total: totalPages, page: page, lastPage: lastPage },
    };
  }

  async findOne(id: number) {
    if (!id || id <= 0 || isNaN(id)) {
      throw new BadRequestException('The id must be greater than 0');
    }

    const product = await this.product.findUnique({
      where: { id: id  , available:true},
    });

    if (!product) {
      throw new NotFoundException(`Product with id ${id} not found`);
    }

    return product;
  }

  async update(id: number, updateProductDto: UpdateProductDto) {
    const {id:_ , ... data} = updateProductDto;
    await this.findOne(id);

    return this.product.update({
      where: { id },
      data: data,
    });
  }

  async remove(id: number) {
    await this.findOne(id);
   /* return this.product.delete({
      where: { id },
    });*/

    const product = await this.product.update({
      where :{id} , 
      data: {
        available :false
      }


    })

    return product; 
  }
}
