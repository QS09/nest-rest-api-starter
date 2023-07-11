import { applyDecorators } from '@nestjs/common';
import { ApiQuery } from '@nestjs/swagger';

export function ApiPaginationQuery() {
  return applyDecorators(
    ApiQuery({
      name: 'page',
      example: 1,
      allowEmptyValue: false,
      required: false,
    }),
    ApiQuery({
      name: 'limit',
      example: 10,
      allowEmptyValue: false,
      required: false,
    }),
  );
}
